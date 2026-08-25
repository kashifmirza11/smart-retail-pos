import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

 const handleLogin = async (event) => {
   event.preventDefault();

   if (email.trim() === "" || password.trim() === "") {
     setError("Please enter email and password.");
     return;
   }

   try {
     const response = await fetch("http://localhost:5000/api/auth/login", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         email: email.trim(),
         password,
       }),
     });

     const data = await response.json();

     if (!response.ok) {
       throw new Error(data.message || "Login failed.");
     }

     localStorage.setItem("isLoggedIn", "true");
     localStorage.setItem("userRole", data.user.role);
     localStorage.setItem("authToken", data.token);

     setError("");
     onLogin(data.user.role);
   } catch (error) {
     setError(error.message);
   }
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
