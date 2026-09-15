import { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username || !password) {
      setMessage("Please enter username and password");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      // ==================================================
      // JWT TOKEN STORAGE
      // ==================================================

      // Store JWT token received from backend
      localStorage.setItem("token", data.token);

      // Store logged-in user's username
      localStorage.setItem("username", data.user.username);

      // Store user information
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("JWT token received successfully");

      // Login successful
      onLogin();
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to server");
    }
  };

  return (
    <div className="login-page">

      {/* LEFT BRANDING SECTION */}
      <div className="login-brand">

        <div className="brand-visual">
          <div className="orb orb-one"></div>
          <div className="orb orb-two"></div>
          <div className="orb orb-three"></div>

          <div className="flower flower-one"></div>
          <div className="flower flower-two"></div>
          <div className="flower flower-three"></div>
          <div className="flower flower-four"></div>
          <div className="flower flower-five"></div>
          <div className="flower flower-six"></div>

          <div className="flower-center"></div>
        </div>

        <div className="brand-content">
          <h2>Community Connect</h2>

          <p>
            Sign in to manage programs, collaborate with your team,
            and keep your data in one place.
          </p>

          <div className="secure-badge">
            <span>✓</span>
            Secure access for your organization
          </div>
        </div>

      </div>

      {/* RIGHT LOGIN SECTION */}
      <div className="login-form-section">

        <div className="login-form-container">

          <div className="login-icon">
            C
          </div>

          <h1>Welcome back</h1>

          <p className="login-description">
            Sign in to manage your programs &amp; data
          </p>

          <form onSubmit={handleLogin}>

            <label>Email Address</label>

            <div className="input-wrapper">
              <span className="input-icon">✉</span>

              <input
                type="text"
                placeholder="you@organization.org"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <label>Password</label>

            <div className="input-wrapper">
              <span className="input-icon">▣</span>

              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="login-options">

              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  setMessage("Password reset is not available yet")
                }
              >
                Forgot password?
              </button>

            </div>

            <button
              type="submit"
              className="login-button"
            >
              Sign In to Platform
              <span>→</span>
            </button>

          </form>

          {message && (
            <div className="login-message">
              {message}
            </div>
          )}

          <p className="signup-text">
            Don't have an account?

            <button
              type="button"
              onClick={() =>
                setMessage(
                  "Please contact your organization administrator"
                )
              }
            >
              Sign Up
            </button>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;