import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegister, setIsRegister] = useState(false);

    // extra registration fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isRegister) {
                // 1️⃣ Create Auth account
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );
                const user = userCredential.user;

                await setDoc(doc(db, "users", user.uid), {
                    firstName,
                    lastName,
                    company,
                    role,
                    email: user.email,
                    uid: user.uid,
                    points: 0,
                    createdAt: serverTimestamp(),
                });

                navigate("/dashboard");
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                navigate("/dashboard");
            }
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };


    return (
        <div className="login-page">
            <h2>{isRegister ? "Create an Account" : "Login"}</h2>

            <form onSubmit={handleSubmit}>
                {isRegister && (
                    <>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        />
                    </>
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "10px 20px",
                        marginTop: "10px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        transition: "background 0.2s",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
                >
                    {isRegister ? "Register" : "Login"}
                </button>
            </form>

            <p
                onClick={() => setIsRegister(!isRegister)}
                style={{ cursor: "pointer", color: "blue", marginTop: "10px" }}
            >
                {isRegister
                    ? "Already have an account? Login"
                    : "Don’t have an account? Register"}
            </p>
        </div>
    );
}
