import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import DashboardStats from "./components/DashboardStats";
import RouteInfo from "./components/RouteInfo";
import Login from "./Login";
import { haversine, getEstimatedSpeed } from "./utils/helpers";

function App() {
  // --- AUTHENTICATION STATE ---
  const [token, setToken] = useState(localStorage.getItem("dhvani_token"));

  // --- EXISTING DASHBOARD STATE ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [roads, setRoads] = useState(null);
  const [hour, setHour] = useState(18);
  const [roadPredictions, setRoadPredictions] = useState([]);
  const [cityStatus, setCityStatus] = useState("Low");
  const [weather, setWeather] = useState({ temperature: 19, windspeed: 10 });
  const [routeData, setRouteData] = useState({ coords: [], paths: [], distance: 0, time: 0 });
  const [locations, setLocations] = useState({});
  const [fromLoc, setFromLoc] = useState("");
  const [toLoc, setToLoc] = useState("");
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  // --- LOGOUT HANDLER ---
  const handleLogout = () => {
    localStorage.removeItem("dhvani_token");
    setToken(null);
  };

  // --- EXISTING LOGIC LOOPS ---
  useEffect(() => {
    if (!token) return; // Don't run logic if not logged in

    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setHour(prev => (parseInt(prev) + 1) % 24);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, token]);

  useEffect(() => {
    if (!token) return;

    axios.get("http://localhost:5000/locations").then(res => {
      setLocations(res.data);
      const keys = Object.keys(res.data);
      if (keys.length > 1) { setFromLoc(keys[0]); setToLoc(keys[1]); }
    });
    fetch("/export.geojson").then(res => res.json()).then(data => setRoads(data));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    axios.post("http://localhost:5000/predict", { hour: parseInt(hour) }).then((res) => {
      setCityStatus(res.data.traffic);
      setRoadPredictions(res.data.road_predictions);
      setWeather(res.data.weather);
    });
  }, [hour, token]);

  useEffect(() => {
    if (!token) return;
    if (routeData.coords && routeData.coords.length > 0) {
      handleFindRoute();
    }
  }, [hour, token]);

  const handleFindRoute = () => {
    axios.post("http://localhost:5000/route_by_name", {
      start_coords: locations[fromLoc],
      end_coords: locations[toLoc],
      hour: parseInt(hour),
      isEmergency: isEmergencyMode
    }).then(res => {
      const mainCoords = res.data.coordinates;
      const altCoords = res.data.alt_coordinates || [];

      const calculateDist = (pts) => {
        let d = 0;
        for (let i = 0; i < pts.length - 1; i++) {
          d += haversine(pts[i], pts[i + 1]);
        }
        return d;
      };

      const mainDist = calculateDist(mainCoords);
      const altDist = altCoords.length > 0 ? calculateDist(altCoords) : 0;
      const speed = isEmergencyMode ? 60 : getEstimatedSpeed(cityStatus);
      const mainTime = Math.round((mainDist / speed) * 60);
      const altTime = altDist > 0 ? Math.round((altDist / (speed * 0.8)) * 60) : 0;

      setRouteData({
        coords: mainCoords,
        paths: [
          { coords: mainCoords, time: mainTime, dist: mainDist.toFixed(2), type: 'main' },
          { coords: altCoords, time: altTime, dist: altDist.toFixed(2), type: 'alt' }
        ],
        origin: mainCoords[0],
        dest: mainCoords[mainCoords.length - 1],
        distance: mainDist.toFixed(2),
        time: mainTime,
        isEmergency: isEmergencyMode
      });
    }).catch(err => console.error("Routing Error:", err));
  };

  const routeGeoJSON = useMemo(() => {
    if (!routeData.coords?.length) return null;
    return { type: "Feature", geometry: { type: "LineString", coordinates: routeData.coords } };
  }, [routeData.coords]);

  const geojsonWithData = useMemo(() => {
    if (!roads || !roadPredictions.length) return null;
    return { ...roads, features: roads.features.map((f, i) => ({ ...f, properties: { ...f.properties, trafficLevel: roadPredictions[i] || 0 } })) };
  }, [roads, roadPredictions]);

  // --- 2. CONDITIONAL RENDERING FOR LOGIN ---
  if (!token) {
    return <Login setToken={setToken} />;
  }

  // --- 3. MAIN DASHBOARD UI ---
  return (
    <div style={{ display: "flex", backgroundColor: "#0b0e14", height: "100vh", color: "#fff", overflow: "hidden" }}>
      <Sidebar
        activeTab={activeTab} setActiveTab={setActiveTab} setRouteData={setRouteData}
        locations={locations} fromLoc={fromLoc} setFromLoc={setFromLoc}
        toLoc={toLoc} setToLoc={setToLoc} onTraceRoute={handleFindRoute} isEmergencyMode={isEmergencyMode}
        setIsEmergencyMode={setIsEmergencyMode}
        onLogout={handleLogout} // Pass logout to sidebar
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <MapView
            activeTab={activeTab} roads={roads} geojsonWithData={geojsonWithData}
            routeGeoJSON={routeGeoJSON} routeData={routeData}
            locations={locations} fromLoc={fromLoc} toLoc={toLoc}
          />

          {activeTab === "routing" && (
            <RouteInfo routeData={routeData} cityStatus={cityStatus} />
          )}

          {/* TIME CONTROL CONSOLE */}
          <div style={{
            position: "absolute", bottom: 20, right: 20,
            background: "rgba(16, 18, 23, 0.95)", padding: "12px 20px",
            border: "1px solid #00f2ff", borderRadius: "10px", zIndex: 20,
            display: "flex", alignItems: "center", backdropFilter: "blur(10px)",
            boxShadow: "0 4px 20px rgba(0, 242, 255, 0.2)"
          }}>
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              style={{
                background: isAutoPlaying ? "#ff0055" : "#39ff14",
                color: "#000", border: "none", borderRadius: "4px",
                padding: "6px 12px", marginRight: "15px", cursor: "pointer",
                fontSize: "0.65rem", fontWeight: "900", letterSpacing: "1px"
              }}
            >
              {isAutoPlaying ? "STOP" : "PLAY 24H"}
            </button>
            <input
              type="range" min="0" max="23" value={hour}
              onChange={(e) => { setHour(e.target.value); setIsAutoPlaying(false); }}
              style={{ accentColor: "#00f2ff", width: "140px" }}
            />
            <span style={{ marginLeft: "15px", fontFamily: "monospace", color: "#00f2ff", fontSize: "0.9rem", minWidth: "60px", textAlign: "right" }}>
              {hour.toString().padStart(2, '0')}:00
            </span>
          </div>
        </div>
        {activeTab === "dashboard" && <DashboardStats weather={weather} cityStatus={cityStatus} />}
      </div>
    </div>
  );
}

export default App;