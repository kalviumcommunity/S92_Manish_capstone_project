
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Store the JWT and user information after successful login
  const saveLogin = (data) => {
    if (!data.token || !data.user) {
      setMessage("Login failed: Invalid server response");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.user.username || "");
    localStorage.setItem("user", JSON.stringify(data.user));

    console.log("Login successful");
    onLogin();
  };

  // Existing username/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username.trim() || !password) {
      setMessage("Please enter username and password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      saveLogin(data);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleSuccess = async (credentialResponse) => {
    setMessage("");

    if (!credentialResponse.credential) {
      setMessage("Google did not return a valid credential");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Google login failed");
        return;
      }

      saveLogin(data);
    } catch (error) {
      console.error("Google login error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
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
          <div className="login-icon">C</div>

          <h1>Welcome back</h1>

          <p className="login-description">
            Sign in to manage your programs &amp; data
          </p>

          <form onSubmit={handleLogin}>
            <label htmlFor="login-username">Email Address</label>

            <div className="input-wrapper">
              <span className="input-icon">✉</span>

              <input
                id="login-username"
                type="text"
                placeholder="Enter your username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <label htmlFor="login-password">Password</label>

            <div className="input-wrapper">
              <span className="input-icon">▣</span>

              <input
                id="login-password"
                type="password"
                placeholder="••••••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In to Platform"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="google-login">
            <div className="login-divider">
              <span>OR</span>
            </div>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setMessage("Google sign-in failed. Please try again.")
              }
              text="signin_with"
              shape="rectangular"
              theme="outline"
              width="300"
            />
          </div>

          {message && (
            <div className="login-message" role="alert">
              {message}
            </div>
          )}

          <p className="signup-text">
            Don't have an account?{" "}
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
