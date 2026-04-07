import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cardStyle } from '../utils/constants';

const DashboardStats = ({ weather, cityStatus }) => {
    return (
        <div style={{ height: "250px", display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "20px", padding: "20px", background: "#0b0e14", borderTop: "1px solid #333" }}>
            <div style={{ ...cardStyle, background: "linear-gradient(to bottom, #1a3c5a, #0b0e14)" }}>
                <p style={{ fontSize: "0.7rem", color: "#00f2ff", letterSpacing: "1px", margin: 0 }}>METEO_SCAN</p>
                <h1 style={{ margin: "10px 0", fontSize: "4.5rem", fontWeight: "200" }}>{weather.temperature}°C</h1>
                <div style={{ display: "flex", gap: "15px", color: "#888", fontSize: "0.7rem" }}>
                    <span>WIND: {weather.windspeed} km/h</span>
                    <span>PRECIP: 0%</span>
                </div>
            </div>

            <div style={cardStyle}>
                <h4 style={{ color: "#00f2ff", fontSize: "0.7rem", margin: "0 0 10px 0", letterSpacing: "1px" }}>GNN_WEIGHT_DIST</h4>
                <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                        <Pie data={[{ v: 45, n: "Spatial" }, { v: 35, n: "Temporal" }, { v: 20, n: "Weather" }]} dataKey="v" innerRadius={35} outerRadius={55} paddingAngle={5}>
                            <Cell fill="#00f2ff" /><Cell fill="#ff0055" /><Cell fill="#39ff14" />
                        </Pie>
                        <Tooltip contentStyle={{ background: "#111", border: "none", fontSize: "10px" }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div style={cardStyle}>
                <h4 style={{ color: "#ff0055", fontSize: "0.7rem", margin: "0 0 10px 0", letterSpacing: "1px" }}>CITY_LOAD_STATUS</h4>
                <h1 style={{ color: cityStatus === "High" ? "#ff0055" : cityStatus === "Medium" ? "#00f2ff" : "#39ff14", fontSize: "2.8rem", margin: "10px 0", fontWeight: "300" }}>
                    {cityStatus.toUpperCase()}
                </h1>
                <p style={{ fontSize: "0.7rem", color: "#444", margin: 0 }}>Processing 32,863 graph nodes...</p>
            </div>
        </div>
    );
};

export default DashboardStats;