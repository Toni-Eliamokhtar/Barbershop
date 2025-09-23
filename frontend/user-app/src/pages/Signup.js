import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    // FAKE signup
    if (name && email && password) {
      alert(`Compte créé pour ${name} (${email})`);
      navigate("/dashboard"); // redirige vers dashboard
    } else {
      alert("Veuillez remplir tous les champs");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Inscription</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Nom complet"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        /><br /><br />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br /><br />
        <button type="submit">S'inscrire</button>
      </form>
      <p>
        Déjà un compte ? <a href="/login">Connecte-toi</a>
      </p>
    </div>
  );
}
