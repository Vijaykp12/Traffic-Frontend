export const MAP_STYLE = "https://tiles.openfreemap.org/styles/dark";

export const tabStyle = (isActive) => ({
    background: isActive ? "#00f2ff22" : "transparent",
    color: isActive ? "#00f2ff" : "#888",
    border: "none",
    borderLeft: isActive ? "4px solid #00f2ff" : "none",
    padding: "15px",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: "bold",
    width: "100%",
    transition: "0.3s",
    letterSpacing: "1px",
    fontSize: "0.75rem"
});

export const selectStyle = {
    width: "100%",
    background: "#1a1d24",
    color: "#fff",
    border: "1px solid #333",
    padding: "10px",
    marginTop: "5px",
    fontSize: "0.8rem",
    borderRadius: "4px"
};

export const btnStyle = {
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

export const cardStyle = {
    background: "#141821",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #333",
    boxShadow: "0 4px 15px rgba(0,0,0,0.5)"
};