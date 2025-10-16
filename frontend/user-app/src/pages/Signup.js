import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

// 🚀 Ton backend écoute sur http://localhost:5000
const API_URL = "http://localhost:5000/auth/signup";

export default function Signup() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!nom || !email || !password) {
      alert("❌ Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, email, password, telephone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription.");
      }

      alert(`✅ Compte créé pour ${nom} (${email})`);
      navigate("/login");
    } catch (err) {
      console.error("Erreur signup :", err);
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Créer un compte</h2>
        <div className="auth-divider"></div>

        <form onSubmit={handleSignup} className="auth-form">
          <input
            type="text"
            placeholder="Nom complet"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            placeholder="Téléphone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-btn">
            S'inscrire
          </button>
        </form>

        <p className="auth-switch">
          Déjà un compte ? <a href="/login">Connecte-toi</a>
        </p>
      </div>
    </div>
  );
}
