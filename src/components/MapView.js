import React, { useEffect } from 'react';
import { Map, Source, Layer, Marker, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { MAP_STYLE } from '../utils/constants';

const MapView = React.memo(({ activeTab, roads, geojsonWithData, routeData, locations, fromLoc, toLoc }) => {

    // DEBUGGING: Monitor the coordinates of both paths
    useEffect(() => {
        if (activeTab === "routing" && routeData.paths?.length > 0) {
            console.log("--- MULTI-PATH DEBUG ---");
            routeData.paths.forEach((p, i) => {
                console.log(`Path ${i} (${p.type}):`, p.coords.length, "points");
            });
        }
    }, [routeData, activeTab]);

    return (
        <Map
            mapLib={maplibregl}
            initialViewState={{
                latitude: 13.0418,
                longitude: 80.2341,
                zoom: 12.5,
                pitch: 55, // Restored 55 for 3D depth
                bearing: -15
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle={MAP_STYLE}
            antialias={true}
            maxPitch={85}
            reuseMaps
        >
            <NavigationControl position="bottom-left" visualizePitch={true} />

            {/* 1. BASE ROAD NETWORK */}
            {roads && (
                <Source type="geojson" data={roads}>
                    <Layer
                        id="base-roads"
                        type="line"
                        paint={{
                            "line-color": "#1a1d24",
                            "line-width": 1.2,
                            "line-opacity": activeTab === "routing" ? 0.15 : 0.4
                        }}
                    />
                </Source>
            )}

            {/* 2. DASHBOARD TRAFFIC LAYER */}
            {activeTab === "dashboard" && geojsonWithData && (
                <Source type="geojson" data={geojsonWithData}>
                    <Layer
                        id="traffic-heat"
                        type="line"
                        layout={{ "line-join": "round", "line-cap": "round" }}
                        paint={{
                            "line-color": [
                                "match", ["get", "trafficLevel"],
                                2, "#ff0055", 1, "#00f2ff", "#39ff14"
                            ],
                            "line-width": 3,
                            "line-blur": 0.8
                        }}
                    />
                </Source>
            )}

            {/* 3. MULTIPLE PATHS RENDERING */}
            {activeTab === "routing" && routeData.paths?.map((path, index) => (
                <Source key={`${path.type}-${index}`} type="geojson" data={{
                    type: "Feature",
                    geometry: { type: "LineString", coordinates: path.coords }
                }}>
                    <Layer
                        id={`route-${path.type}`}
                        type="line"
                        layout={{ "line-join": "round", "line-cap": "round" }}
                        paint={{
                            // Main path is White/Blue (Glow), Alt path is Grey/Dashed
                            "line-color": path.type === 'main'
                                ? (routeData.isEmergency ? "#00f2ff" : "#ffffff")
                                : "#444",
                            "line-width": path.type === 'main' ? 6 : 4,
                            "line-opacity": path.type === 'main' ? 1 : 0.5,
                            "line-dasharray": path.type === 'alt' ? [2, 1] : [1, 0]
                        }}
                    />
                </Source>
            ))}

            {/* 4. STATIC 3D MARKERS (Snapped to Main Path) */}
            {activeTab === "routing" && routeData.origin && routeData.dest && (
                <>
                    {/* START MARKER */}
                    <Marker
                        longitude={routeData.origin[0]}
                        latitude={routeData.origin[1]}
                        anchor="bottom"
                    >
                        <div style={marker3DContainer("#00f2ff")}>
                            <div style={arrowLabel}>START</div>
                            <div className="floating-arrow" style={arrowHead("#00f2ff")} />
                            <div style={groundDot("#00f2ff")} />
                        </div>
                    </Marker>

                    {/* DESTINATION MARKER */}
                    <Marker
                        longitude={routeData.dest[0]}
                        latitude={routeData.dest[1]}
                        anchor="bottom"
                    >
                        <div style={marker3DContainer("#ff0055")}>
                            <div style={arrowLabel}>DEST</div>
                            <div className="floating-arrow" style={arrowHead("#ff0055")} />
                            <div style={groundDot("#ff0055")} />
                        </div>
                    </Marker>
                </>
            )}
        </Map>
    );
});

// --- STYLES ---

const marker3DContainer = (color) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    filter: `drop-shadow(0 0 8px ${color})`,
    pointerEvents: "none",
    zIndex: 10
});

const arrowHead = (color) => ({
    width: 0, height: 0,
    borderLeft: "8px solid transparent",
    borderRight: "8px solid transparent",
    borderTop: `15px solid ${color}`,
    marginBottom: "-2px"
});

const groundDot = (color) => ({
    width: "8px", height: "8px",
    background: "#fff",
    border: `2px solid ${color}`,
    borderRadius: "50%",
});

const arrowLabel = {
    background: "rgba(0,0,0,0.8)",
    color: "#fff",
    fontSize: "9px",
    padding: "2px 6px",
    borderRadius: "4px",
    marginBottom: "4px",
    border: "1px solid #333",
    fontFamily: "monospace"
};

export default MapView;