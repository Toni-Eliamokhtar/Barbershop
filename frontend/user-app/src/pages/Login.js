import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de connexion");

      const { access_token, refresh_token } = data;
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) throw error;
      
      alert(`✅ Bienvenue ${email}`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Erreur de login :", err);
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Connexion</h2>
        <div className="auth-divider"></div>

        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-btn">Se connecter</button>
        </form>

        <p className="auth-switch">
          Pas encore de compte ? <a href="/signup">Inscris-toi</a>
        </p>
      </div>
    </div>
  );
}
