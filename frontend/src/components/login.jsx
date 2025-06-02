import React, { useState } from "react";
import "./login.css";
import logo from "/fisat_logo.png";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [admissionNo, setAdmissionNo] = useState("");
  const [userDetails, setUserDetails] = useState(null); // Fetched user info
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleAdmissionSubmit = async (e) => {
    e.preventDefault();

    if (!admissionNo.trim()) {
      setErrors({ admissionNo: "Admission number is required" });
      return;
    }

    try {
      const res = await fetch("https://your-api-url.com/api/auth/check-admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admissionNumber: admissionNo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "User not found");

      setUserDetails(data); // Store name + email
      setStep(2); // Move to password entry step
      setErrors({});
    } catch (err) {
      setErrors({ admissionNo: err.message });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!password) newErrors.password = "Password is required";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch("https://your-api-url.com/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionNumber: admissionNo,
          email: userDetails.email,
          password: password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.message || "Something went wrong");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <img
            src={logo}
            alt="FISAT Forge Logo"
            className="logo-image"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          />
          <div className="login-title">
            <h1>FISAT Forge</h1>
            <p className="login-subtitle">Together For Tomorrow</p>
          </div>
        </div>

        <div className="login-card">
          {step === 1 && (
            <>
              <h2>Enter Admission Number</h2>
              <form onSubmit={handleAdmissionSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="admissionNo">Admission Number</label>
                  <input
                    type="text"
                    id="admissionNo"
                    name="admissionNo"
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    placeholder="Enter your Admission Number"
                    className={errors.admissionNo ? "error-input" : ""}
                  />
                  {errors.admissionNo && <span className="error-message">{errors.admissionNo}</span>}
                </div>
                <button type="submit" className="login-button">Fetch Details</button>
              </form>
            </>
          )}

          {step === 2 && userDetails && (
            <>
              <h2>Confirm Your Details</h2>
              <p><strong>Name:</strong> {userDetails.name}</p>
              <p><strong>Email:</strong> {userDetails.email}</p>

              <form onSubmit={handlePasswordSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="password">Set Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={errors.password ? "error-input" : ""}
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className={errors.confirmPassword ? "error-input" : ""}
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>

                <button type="submit" className="login-button">Verify & Login</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
