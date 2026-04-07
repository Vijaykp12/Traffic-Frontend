import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken }) => {
    const [creds, setCreds] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/login", creds);
            localStorage.setItem("dhvani_token", res.data.token);
            setToken(res.data.token);
        } catch (err) {
            setError("INVALID COMMAND: Authorization Failed");
        }
    };

    return (
        <div style={loginBg}>
            <div style={loginCard}>
                <div style={neonCircle} />
                <h2 style={{ color: "#00f2ff", letterSpacing: "5px", margin: "10px 0" }}>ANIFFIC</h2>
                <p style={{ color: "#444", fontSize: "0.6rem", marginBottom: "30px" }}>TRAFFIC_CONTROL_INTERFACE</p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <input
                        type="text" placeholder="USER_ID"
                        onChange={e => setCreds({ ...creds, username: e.target.value })}
                        style={inputStyle}
                    />
                    <input
                        type="password" placeholder="ACCESS_KEY"
                        onChange={e => setCreds({ ...creds, password: e.target.value })}
                        style={inputStyle}
                    />
                    <button type="submit" style={loginBtn}>INITIATE SESSION</button>
                </form>
                {error && <p style={{ color: "#ff0055", fontSize: "0.7rem", marginTop: "15px" }}>{error}</p>}
            </div>
        </div>
    );
};

// Styles to match your Cyberpunk theme
const loginBg = { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0b0e14" };
const loginCard = { padding: "40px", background: "#141821", borderRadius: "12px", border: "1px solid #00f2ff22", textAlign: "center", width: "320px", position: "relative" };
const neonCircle = { width: "40px", height: "40px", borderRadius: "50%", border: "2px solid #00f2ff", position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)", background: "#0b0e14", boxShadow: "0 0 15px #00f2ff" };
const inputStyle = { padding: "12px", background: "#0b0e14", border: "1px solid #333", color: "#fff", borderRadius: "4px", outline: "none", fontSize: "0.8rem" };
const loginBtn = { padding: "12px", background: "#00f2ff", color: "#000", fontWeight: "900", border: "none", borderRadius: "4px", cursor: "pointer", transition: "0.3s" };

export default Login;