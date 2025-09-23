import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      alert(`✅ Connexion réussie pour ${email}`);
      navigate("/dashboard");
    } else {
      alert("Veuillez entrer un email et un mot de passe");
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
