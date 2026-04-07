import React from 'react';

const RouteInfo = ({ routeData }) => {
    // If no paths exist yet, don't render
    if (!routeData.paths || routeData.paths.length === 0) return null;

    const mainPath = routeData.paths[0];
    const altPath = routeData.paths[1];

    return (
        <div style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: "260px",
            background: "rgba(16, 18, 23, 0.9)",
            backdropFilter: "blur(10px)",
            padding: "20px",
            borderRadius: "12px",
            border: `1px solid ${routeData.isEmergency ? "#ff0055" : "#00f2ff44"}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            zIndex: 100
        }}>
            {/* MAIN ROUTE (AI OPTIMIZED) */}
            <div style={{ marginBottom: altPath?.coords.length > 0 ? "15px" : "0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{
                        fontSize: "0.6rem",
                        color: routeData.isEmergency ? "#ff0055" : "#00f2ff",
                        fontWeight: "bold",
                        letterSpacing: "1px"
                    }}>
                        {routeData.isEmergency ? "EMERGENCY PREEMPTION" : "AI RECOMMENDED"}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "#666" }}>{mainPath.dist} km</span>
                </div>

                <h1 style={{
                    margin: "5px 0",
                    color: routeData.isEmergency ? "#ff0055" : "#39ff14",
                    fontSize: "2.4rem",
                    fontFamily: "monospace",
                    textShadow: `0 0 10px ${routeData.isEmergency ? "#ff005544" : "#39ff1444"}`
                }}>
                    {mainPath.time}<span style={{ fontSize: "1rem" }}> min</span>
                </h1>
            </div>

            {/* ALTERNATIVE ROUTE (GNN COMPARISON) */}
            {altPath && altPath.coords.length > 0 && (
                <div style={{
                    borderTop: "1px solid #333",
                    paddingTop: "15px",
                    marginTop: "5px",
                    opacity: 0.8
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.55rem", color: "#888", letterSpacing: "0.5px" }}>
                            ALT ROUTE (STD)
                        </span>
                        <span style={{ fontSize: "0.6rem", color: "#555" }}>{altPath.dist} km</span>
                    </div>
                    <h2 style={{
                        margin: "2px 0",
                        color: "#aaa",
                        fontSize: "1.2rem",
                        fontFamily: "monospace"
                    }}>
                        {altPath.time} min
                    </h2>
                    <p style={{ fontSize: "0.5rem", color: "#444", margin: 0, fontStyle: "italic" }}>
                        + {altPath.time - mainPath.time} min slower than AI path
                    </p>
                </div>
            )}

            {/* LIVE INDICATOR */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "15px" }}>
                <div style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#39ff14",
                    boxShadow: "0 0 5px #39ff14"
                }} />
                <span style={{ fontSize: "0.5rem", color: "#888", letterSpacing: "1px" }}>
                    LIVE GNN UPDATES ACTIVE
                </span>
            </div>
        </div>
    );
};

export default RouteInfo;