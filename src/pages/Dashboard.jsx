import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();
    const user = auth.currentUser;

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: "100vh",
                background: "#f5f7fa",
                paddingTop: "60px",
            }}
        >
            <h1>Welcome, {user?.name || user?.email || "Player"} 👋</h1>
            <p style={{ color: "#666", marginBottom: "40px" }}>
                Choose a challenge to get started
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "20px",
                    width: "80%",
                    maxWidth: "800px",
                }}
            >
                <button
                    onClick={() => alert("Coming soon: Energy Efficiency Game!")}
                    style={buttonStyle}
                >
                    ⚡ Energy Efficiency
                </button>
                <button
                    onClick={() => alert("Coming soon: Grid Management Game!")}
                    style={buttonStyle}
                >
                    🧩 Grid Management
                </button>
                <button
                    onClick={() => alert("Coming soon: Power Trivia!")}
                    style={buttonStyle}
                >
                    🎯 Power Trivia
                </button>
                <button
                    onClick={() => alert("Coming soon: Budget Saver!")}
                    style={buttonStyle}
                >
                    💰 Budget Saver
                </button>
            </div>

            <button
                onClick={handleLogout}
                style={{
                    marginTop: "50px",
                    background: "#ff4d4d",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                }}
            >
                Logout
            </button>
        </div >
    );
}

// Simple button style object
const buttonStyle = {
    background: "white",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "40px 20px",
    fontSize: "1.1rem",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    transition: "0.2s",
};
