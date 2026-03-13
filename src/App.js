import React, { useEffect, useState, useMemo } from "react";
import { Map, Source, Layer } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/dark";

function App() {
  // Navigation & Data State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [roads, setRoads] = useState(null);
  const [hour, setHour] = useState(18);
  const [roadPredictions, setRoadPredictions] = useState([]);
  const [cityStatus, setCityStatus] = useState("Low");
  const [weather, setWeather] = useState({ temperature: 19, windspeed: 10 });

  // Routing State
  const [routeData, setRouteData] = useState({ coords: [], distance: 0, time: 0 });
  const [locations, setLocations] = useState({});
  useEffect(() => {

    axios.get("http://localhost:5000/locations")
      .then(res => {

        const data = res.data;

        setLocations(data);

        const keys = Object.keys(data);

        if (keys.length > 1) {
          setFromLoc(keys[0]);
          setToLoc(keys[1]);
        }

      });

  }, []);
  const [fromLoc, setFromLoc] = useState("T. Nagar");
  const [toLoc, setToLoc] = useState("Adyar");

  // Load Base Road Network
  useEffect(() => {
    fetch("/export.geojson")
      .then(res => res.json())
      .then(data => setRoads(data));
  }, []);

  // Sync with GNN Backend for Traffic Analysis
  useEffect(() => {
    axios.post("http://localhost:5000/predict", { hour: parseInt(hour) })
      .then((res) => {
        setCityStatus(res.data.traffic);
        setRoadPredictions(res.data.road_predictions);
        setWeather(res.data.weather);
      });
  }, [hour]);

  // Handle Traffic-Aware Routing
  const handleFindRoute = () => {
    axios.post("http://localhost:5000/route_by_name", {
      start_coords: locations[fromLoc],
      end_coords: locations[toLoc],
      hour: hour
    }).then(res => {
      // Calculate travel stats based on path length and current city congestion
      function haversine(a, b) {
        const R = 6371; // km
        const dLat = (b[1] - a[1]) * Math.PI / 180;
        const dLon = (b[0] - a[0]) * Math.PI / 180;

        const lat1 = a[1] * Math.PI / 180;
        const lat2 = b[1] * Math.PI / 180;

        const h =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLon / 2) * Math.sin(dLon / 2) *
          Math.cos(lat1) * Math.cos(lat2);

        return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
      }

      let dist = 0;

      for (let i = 0; i < res.data.coordinates.length - 1; i++) {
        dist += haversine(
          res.data.coordinates[i],
          res.data.coordinates[i + 1]
        );
      }

      dist = dist.toFixed(2);

      const speed =
        cityStatus === "High" ? 18 :
          cityStatus === "Medium" ? 30 :
            45;

      const time = Math.round((dist / speed) * 60);

      setRouteData({ coords: res.data.coordinates, distance: dist, time: time });
    }).catch(err => alert("Routing path obstructed. Try central nodes."));
  };

  // Memoized GeoJSON for Performance
  const routeGeoJSON = useMemo(() => {
    if (!routeData.coords || routeData.coords.length === 0) return null;

    const cleanCoords = routeData.coords.filter(
      c => Array.isArray(c) &&
        c.length === 2 &&
        !isNaN(c[0]) &&
        !isNaN(c[1])
    );

    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: cleanCoords
      }
    };
  }, [routeData.coords]);

  const geojsonWithData = useMemo(() => {
    if (!roads || !roadPredictions.length) return null;
    return {
      ...roads,
      features: roads.features.map((f, i) => ({
        ...f,
        properties: { ...f.properties, trafficLevel: roadPredictions[i] || 0 }
      }))
    };
  }, [roads, roadPredictions]);

  return (
    <div style={{ display: "flex", backgroundColor: "#0b0e14", height: "100vh", color: "#fff", overflow: "hidden" }}>

      {/* --- SIDEBAR --- */}
      <div style={{ width: "280px", background: "#141821", padding: "40px 20px", borderRight: "1px solid #00f2ff22" }}>
        <h2 style={{ color: "#00f2ff", letterSpacing: "4px", margin: 0 }}>DHVANI</h2>
        <p style={{ fontSize: "0.5rem", color: "#444", marginBottom: "40px" }}>GNN TRAFFIC ENGINE v2.0</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button onClick={() => { setActiveTab("dashboard"); setRouteData({ coords: [], distance: 0, time: 0 }); }} style={tabStyle(activeTab === "dashboard")}>
            DASHBOARD
          </button>
          <button onClick={() => setActiveTab("routing")} style={tabStyle(activeTab === "routing")}>
            ROUTE FINDER
          </button>
        </div>

        {activeTab === "routing" && (
          <div style={{ marginTop: "40px", padding: "20px", background: "#0b0e14", borderRadius: "10px", border: "1px solid #00f2ff44" }}>
            <p style={{ fontSize: "0.6rem", color: "#888", marginBottom: "5px" }}>ORIGIN</p>
            <select value={fromLoc} onChange={e => setFromLoc(e.target.value)} style={selectStyle}>
              {Object.keys(locations).map(k => <option key={k} value={k}>{k}</option>)}
            </select>

            <p style={{ fontSize: "0.6rem", color: "#888", marginTop: "15px", marginBottom: "5px" }}>DESTINATION</p>
            <select value={toLoc} onChange={e => setToLoc(e.target.value)} style={selectStyle}>
              {Object.keys(locations).map(k => <option key={k} value={k}>{k}</option>)}
            </select>

            <button onClick={handleFindRoute} style={btnStyle}>TRACE OPTIMAL ROUTE</button>
          </div>
        )}
      </div>

      {/* --- MAIN INTERFACE --- */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>

        {/* MAP VIEW (3D ENABLED) */}
        <div style={{ flex: 1, position: "relative" }}>
          <Map
            mapLib={maplibregl}
            initialViewState={{ latitude: 13.0418, longitude: 80.2341, zoom: 12.5, pitch: 55, bearing: -15 }}
            style={{ width: "100%", height: "100%" }}
            mapStyle={MAP_STYLE}
          >
            {/* Layer 1: The Traffic Colors (Dashboard) */}
            {activeTab === "dashboard" && geojsonWithData && (
              <Source type="geojson" data={geojsonWithData}>
                <Layer id="traffic" type="line" paint={{
                  "line-color": ["match", ["get", "trafficLevel"], 2, "#ff0055", 1, "#00f2ff", "#39ff14"],
                  "line-width": 2.5
                }} />
              </Source>
            )}

            {/* Layer 2: The Base Roads (Dull Background) */}
            {roads && (
              <Source type="geojson" data={roads}>
                <Layer id="base-roads" type="line" paint={{
                  "line-color": "#222",
                  "line-width": 1,
                  "line-opacity": activeTab === "routing" ? 0.1 : 0.4
                }} />
              </Source>
            )}

            {/* Layer 3: THE ROUTE (This MUST be last to stay on top) */}
            {activeTab === "routing" && routeGeoJSON && (
              <Source key={JSON.stringify(routeData.coords)} type="geojson" data={routeGeoJSON}>
                <Layer
                  id="route-glow"
                  type="line"
                  layout={{ "line-join": "round", "line-cap": "round" }}
                  paint={{
                    "line-color": "#ffffff",
                    "line-width": 8,
                    "line-blur": 1.5,
                    "line-opacity": 0.8
                  }}
                />
              </Source>
            )}
            {activeTab === "routing" && (
              <>
                {locations[fromLoc] && (
                  <Marker longitude={locations[fromLoc][0]} latitude={locations[fromLoc][1]}>
                    <div style={{ color: "#00f2ff", fontSize: "18px" }}>●</div>
                  </Marker>
                )}

                {locations[toLoc] && (
                  <Marker longitude={locations[toLoc][0]} latitude={locations[toLoc][1]}>
                    <div style={{ color: "#ff0055", fontSize: "18px" }}>●</div>
                  </Marker>
                )}
              </>
            )}
          </Map>
          {/* ROUTE INFO OVERLAY */}
          {activeTab === "routing" && routeData.coords.length > 0 && (
            <div style={routeInfoCard}>
              <h4 style={{ margin: 0, color: "#00f2ff", fontSize: "0.7rem", letterSpacing: "1px" }}>PATH_ACQUIRED</h4>
              <h1 style={{ margin: "5px 0", fontSize: "2.5rem", color: "#39ff14", fontWeight: "300" }}>{routeData.time} MIN</h1>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>{routeData.distance} KM | {cityStatus.toUpperCase()} CONGESTION</p>
            </div>
          )}

          {/* TIME SLIDER */}
          <div style={{ position: "absolute", bottom: 20, right: 20, background: "rgba(16, 18, 23, 0.9)", padding: "10px 20px", border: "1px solid #00f2ff", borderRadius: "8px", zIndex: 10 }}>
            <input type="range" min="0" max="23" value={hour} onChange={(e) => setHour(e.target.value)} style={{ accentColor: "#00f2ff", width: "150px" }} />
            <span style={{ marginLeft: "15px", fontFamily: "monospace", color: "#00f2ff" }}>{hour.toString().padStart(2, '0')}:00 HRS</span>
          </div>
        </div>

        {/* --- DASHBOARD STATS PANEL --- */}
        {activeTab === "dashboard" && (
          <div style={{ height: "250px", display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "20px", padding: "20px", background: "#0b0e14", borderTop: "1px solid #333" }}>

            {/* CARD 1: WEATHER */}
            <div style={{ ...cardStyle, background: "linear-gradient(to bottom, #1a3c5a, #0b0e14)" }}>
              <p style={{ fontSize: "0.7rem", color: "#00f2ff", letterSpacing: "1px", margin: 0 }}>METEO_SCAN</p>
              <h1 style={{ margin: "10px 0", fontSize: "4.5rem", fontWeight: "200" }}>{weather.temperature}°C</h1>
              <div style={{ display: "flex", gap: "15px", color: "#888", fontSize: "0.7rem" }}>
                <span>WIND: {weather.windspeed} km/h</span>
                <span>PRECIP: 0%</span>
              </div>
            </div>

            {/* CARD 2: GNN WEIGHT PIE CHART */}
            <div style={cardStyle}>
              <h4 style={{ color: "#00f2ff", fontSize: "0.7rem", margin: "0 0 10px 0", letterSpacing: "1px" }}>GNN_WEIGHT_DIST</h4>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie data={[{ v: 45, n: "Spatial" }, { v: 35, n: "Temporal" }, { v: 20, n: "Weather" }]} dataKey="v" innerRadius={35} outerRadius={55} paddingAngle={5}>
                    <Cell fill="#00f2ff" />
                    <Cell fill="#ff0055" />
                    <Cell fill="#39ff14" />
                  </Pie>
                  <Tooltip contentStyle={{ background: "#111", border: "none", fontSize: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* CARD 3: HOTSPOT/CITY LOAD */}
            <div style={cardStyle}>
              <h4 style={{ color: "#ff0055", fontSize: "0.7rem", margin: "0 0 10px 0", letterSpacing: "1px" }}>CITY_LOAD_STATUS</h4>
              <h1 style={{ color: cityStatus === "High" ? "#ff0055" : cityStatus === "Medium" ? "#00f2ff" : "#39ff14", fontSize: "2.8rem", margin: "10px 0", fontWeight: "300" }}>
                {cityStatus.toUpperCase()}
              </h1>
              <p style={{ fontSize: "0.7rem", color: "#444", margin: 0 }}>Processing 32,863 graph nodes...</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

// CSS-IN-JS STYLES
const tabStyle = (a) => ({
  background: a ? "#00f2ff22" : "transparent",
  color: a ? "#00f2ff" : "#888",
  border: "none",
  borderLeft: a ? "4px solid #00f2ff" : "none",
  padding: "15px",
  textAlign: "left",
  cursor: "pointer",
  fontWeight: "bold",
  width: "100%",
  transition: "0.3s",
  letterSpacing: "1px",
  fontSize: "0.75rem"
});

const selectStyle = {
  width: "100%",
  background: "#1a1d24",
  color: "#fff",
  border: "1px solid #333",
  padding: "10px",
  marginTop: "5px",
  fontSize: "0.8rem",
  borderRadius: "4px"
};

const btnStyle = {
  width: "100%",
  padding: "12px",
  background: "#00f2ff",
  color: "#000",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "20px",
  fontSize: "0.7rem",
  borderRadius: "4px",
  letterSpacing: "1px"
};

const cardStyle = {
  background: "#141821",
  borderRadius: "12px",
  padding: "20px",
  border: "1px solid #333",
  boxShadow: "0 4px 15px rgba(0,0,0,0.5)"
};

const routeInfoCard = {
  position: "absolute",
  top: 25,
  right: 25,
  background: "rgba(10,12,16,0.95)",
  padding: "20px",
  borderRadius: "12px",
  borderLeft: "5px solid #39ff14",
  zIndex: 10,
  backdropFilter: "blur(8px)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.8)"
};

export default App;