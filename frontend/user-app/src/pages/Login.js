import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // FAKE login
    if (email && password) {
      alert(`Connexion réussie pour ${email}`);
      navigate("/dashboard"); // redirige vers dashboard
    } else {
      alert("Veuillez entrer un email et un mot de passe");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Connexion</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Se connecter</button>
      </form>
      <p>
        Pas encore de compte ? <a href="/signup">Inscris-toi</a>
      </p>
    </div>
  );
}
