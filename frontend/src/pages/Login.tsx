import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { MessageBar } from "../components/MessageBar";
import "../styles/forms.css";

export function Login() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("password123");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await login({ email, password });
      await loginWithToken(res.token);
      setMessage({ type: "success", text: "Logged in successfully." });
      navigate("/dashboard");
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message ?? "Login failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Login</h1>
      {message ? <MessageBar type={message.type} message={message.text} /> : null}
      <form onSubmit={onSubmit} className="auth-form">
        <label className="form-label">
          <div>Email</div>
          <input className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label className="form-label">
          <div>Password</div>
          <input className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button className="submit-btn" disabled={submitting} type="submit">
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
      <div className="auth-links">
        No account? <Link to="/register">Register</Link>
      </div>
    </div>
  );
}

