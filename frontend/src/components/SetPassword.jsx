import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const t = queryParams.get("token");
    if (!t) {
      setMessage("Invalid or missing token.");
    } else {
      setToken(t);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password setup failed");

      setMessage("Password set successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Set Your Password</h2>
        {message && <p className="info-text">{message}</p>}
        {!message.includes("success") && (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">
              Set Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SetPassword;
