import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    if (email.trim() === "" || password.trim() === "") {
      setError("Please enter email and password.");
      return;
    }

    let role = "";

    if (email === "admin@smartpos.com" && password === "admin123") {
      role = "Admin";
    } else if (email === "cashier@smartpos.com" && password === "cashier123") {
      role = "Cashier";
    } else {
      setError("Invalid email or password.");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", role);

    setError("");
    onLogin(role);
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>Smart POS</h1>
        <p>Sign in to continue</p>

        {error && <div className="login-error">{error}</div>}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
