import React, { useState } from "react";
import "./login.css";
import logo from "/fisat_logo.png";
import { useNavigate } from "react-router-dom";

// ... imports and component declaration unchanged

const LoginPage = () => {
  const [admission_no, setadmission_no] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleAdmissionSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!admission_no.trim()) newErrors.admission_no = "Admission number is required";
    if (!password.trim()) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admission_no, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setErrors({ password: err.message });
    }
  };

  const handleForgotPassword = async () => {
    if (!admission_no.trim()) {
      setErrors({ admission_no: "Please enter your admission number first" });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/check-admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admission_no }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "User not found");

      setUserDetails(data);
      setStep(2);
      setErrors({});
      await handleVerifyEmail(data);  // ✅ Call email verification here
    } catch (err) {
      alert(err.message || "Something went wrong");
    }
  };

  const handleVerifyEmail = async (user) => {
    if (!user) return;

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admission_no: user.admission_no,
          email: user.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send verification email");

      alert("Verification email sent successfully!");
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
              <h2>Login</h2>
              <form onSubmit={handleAdmissionSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="admission_no">Admission Number</label>
                  <input
                    type="text"
                    id="admission_no"
                    name="admission_no"
                    value={admission_no}
                    onChange={(e) => setadmission_no(e.target.value)}
                    placeholder="Enter your Admission Number"
                    className={errors.admission_no ? "error-input" : ""}
                  />
                  {errors.admission_no && (
                    <span className="error-message">{errors.admission_no}</span>
                  )}

                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={errors.password ? "error-input" : ""}
                  />
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}

                </div>
                <button type="submit" className="login-button">
                  Login
                </button>
                
              </form>
            </>
          )}

          {step === 2 && userDetails && (
  <div className="confirm-details">
    <h2>Confirm Your Details</h2>
    <p><strong>Name:</strong> {userDetails.name}</p>
    <p><strong>Email:</strong> {userDetails.email}</p>
    <p><strong>Admission Number:</strong> {userDetails.admission_no}</p>
    <p><strong>Department:</strong> {userDetails.department}</p>
    <p className="info-text">
      A verification email has been sent. Please check your inbox to set your password.
    </p>
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
