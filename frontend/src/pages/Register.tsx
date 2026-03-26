import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../lib/api";
import { MessageBar } from "../components/MessageBar";
import "../styles/forms.css";

export function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("password123");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await register({ email, password });
      setMessage({ type: "success", text: "Account created. Please log in." });
      setTimeout(() => navigate("/login"), 600);
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message ?? "Registration failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Register</h1>
      {message ? <MessageBar type={message.type} message={message.text} /> : null}
      <form onSubmit={onSubmit} className="auth-form">
        <label className="form-label">
          <div>Email</div>
          <input className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label className="form-label">
          <div>Password</div>
          <input
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </label>
        <button className="submit-btn" disabled={submitting} type="submit">
          {submitting ? "Creating..." : "Create account"}
        </button>
      </form>
      <div className="auth-links">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

