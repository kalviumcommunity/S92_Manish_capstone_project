
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { API_URL } from "../api";

// Google sign-in is shown only when a client ID is configured
const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

// POST JSON to the API and return the parsed body (throws with the server message)
const postJson = async (path, body) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

function Login({ onLogin }) {
  // "login" or "signup"
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("organizer");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  const switchMode = () => {
    setMode(isSignup ? "login" : "signup");
    setMessage("");
  };

  // Store the JWT and user information after successful login
  const saveLogin = (data) => {
    if (!data.token || !data.user) {
      setMessage("Login failed: Invalid server response");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.user.username || "");
    localStorage.setItem("user", JSON.stringify(data.user));

    onLogin();
  };

  // Username/password login (registers first in sign-up mode)
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username.trim() || !password) {
      setMessage("Please enter username and password");
      return;
    }

    if (isSignup) {
      if (!name.trim() || !email.trim()) {
        setMessage("Please enter your name and email");
        return;
      }

      if (password.length < 8) {
        setMessage("Password must be at least 8 characters");
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignup) {
        await postJson("/api/auth/register", {
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          role,
        });
      }

      const data = await postJson("/api/auth/login", {
        username: username.trim(),
        password,
      });

      saveLogin(data);
    } catch (error) {
      console.error("Login error:", error);
      setMessage(
        error instanceof TypeError
          ? "Unable to connect to server"
          : error.message
      );
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
        `${API_URL}/api/auth/google`,
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

          <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>

          <p className="login-description">
            {isSignup
              ? "Register to start managing your programs"
              : "Sign in to manage your programs & data"}
          </p>

          <form onSubmit={handleLogin}>
            {isSignup && (
              <>
                <label htmlFor="signup-name">Full Name</label>

                <div className="input-wrapper">
                  <span className="input-icon">♙</span>

                  <input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <label htmlFor="signup-email">Email Address</label>

                <div className="input-wrapper">
                  <span className="input-icon">✉</span>

                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <label htmlFor="signup-role">I am a</label>

                <div className="input-wrapper">
                  <span className="input-icon">◈</span>

                  <select
                    id="signup-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="organizer">Program organizer</option>
                    <option value="participant">Participant</option>
                  </select>
                </div>
              </>
            )}

            <label htmlFor="login-username">Username</label>

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
                placeholder={isSignup ? "At least 8 characters" : "••••••••••••"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={isSignup ? 8 : undefined}
                required
              />
            </div>

            {!isSignup && (
              <div className="login-options">
                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    setMessage(
                      "Please contact your organization administrator to reset your password"
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? isSignup
                  ? "Creating account..."
                  : "Signing in..."
                : isSignup
                  ? "Create Account"
                  : "Sign In to Platform"}
              {!loading && <span>→</span>}
            </button>
          </form>

          {googleEnabled && (
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
          )}

          {message && (
            <div className="login-message" role="alert">
              {message}
            </div>
          )}

          <p className="signup-text">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" onClick={switchMode}>
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
