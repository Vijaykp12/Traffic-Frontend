import React from 'react';
import { tabStyle, selectStyle, btnStyle } from '../utils/constants';

const Sidebar = ({
    activeTab,
    setActiveTab,
    setRouteData,
    locations,
    fromLoc,
    setFromLoc,
    toLoc,
    setToLoc,
    onTraceRoute,
    isEmergencyMode,       // Added Prop
    setIsEmergencyMode     // Added Prop
}) => {
    return (
        <div style={{
            width: "280px",
            background: "#141821",
            padding: "30px 20px",
            borderRight: "1px solid #00f2ff22",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box" // Critical for padding/height calculation
        }}>

            {/* TOP SECTION: Fixed */}
            <div style={{ flexShrink: 0 }}>
                <h2 style={{ color: "#00f2ff", letterSpacing: "4px", margin: 0, fontSize: "1.5rem" }}>ANIFFIC</h2>
                <p style={{ fontSize: "0.5rem", color: "#444", marginBottom: "30px" }}>GNN TRAFFIC ENGINE v2.0</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button onClick={() => { setActiveTab("dashboard"); setRouteData({ coords: [], distance: 0, time: 0 }); }} style={tabStyle(activeTab === "dashboard")}>
                        DASHBOARD
                    </button>
                    <button onClick={() => setActiveTab("routing")} style={tabStyle(activeTab === "routing")}>
                        ROUTE FINDER
                    </button>
                </div>
            </div>

            {/* MIDDLE SECTION: Scrollable if content is long */}
            <div style={{ flex: 1, overflowY: "auto", margin: "20px 0" }} className="hide-scrollbar">
                {activeTab === "routing" && (
                    <div style={{ padding: "15px", background: "#0b0e14", borderRadius: "10px", border: "1px solid #00f2ff44" }}>
                        <p style={{ fontSize: "0.55rem", color: "#888", marginBottom: "5px" }}>ORIGIN</p>
                        <select value={fromLoc} onChange={e => setFromLoc(e.target.value)} style={selectStyle}>
                            {Object.keys(locations).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>

                        <p style={{ fontSize: "0.55rem", color: "#888", marginTop: "12px", marginBottom: "5px" }}>DESTINATION</p>
                        <select value={toLoc} onChange={e => setToLoc(e.target.value)} style={selectStyle}>
                            {Object.keys(locations).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>

                        <button onClick={onTraceRoute} style={{ ...btnStyle, marginTop: "15px", padding: "10px" }}>
                            TRACE OPTIMAL ROUTE
                        </button>
                    </div>
                )}
            </div>

            {/* BOTTOM SECTION: Emergency Mode pinned to bottom */}
            <div style={{
                flexShrink: 0,
                borderTop: "1px solid #333",
                paddingTop: "15px",
                paddingBottom: "10px"
            }}>
                <p style={{ fontSize: "0.55rem", color: "#888", marginBottom: "8px", letterSpacing: "1px" }}>SYSTEM_OVERRIDE</p>

                <button
                    onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: isEmergencyMode ? "#ff0055" : "transparent",
                        color: isEmergencyMode ? "#fff" : "#ff0055",
                        border: `1px solid #ff0055`,
                        borderRadius: "4px",
                        fontSize: "0.6rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                    }}
                >
                    <span>{isEmergencyMode ? "🚨" : "⚠️"}</span>
                    {isEmergencyMode ? "EMERGENCY ACTIVE" : "EMERGENCY MODE"}
                </button>

                {isEmergencyMode && (
                    <p style={{ fontSize: "0.5rem", color: "#ff0055", marginTop: "8px", textAlign: "center", fontStyle: "italic", lineHeight: "1.2" }}>
                        Priority routing enabled. <br />GNN weights bypassed.
                    </p>
                )}
            </div>
        </div>
    );
};

export default React.memo(Sidebar);