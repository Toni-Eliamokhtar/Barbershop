import { useState } from "react";
import AuthPasswordField from "./AuthPasswordField";
import AuthEmailField from "./AuthEmailField";

export default function SignupForm({ onSubmit }) {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ nom, email, telephone, password });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <input
        type="text"
        placeholder="Nom complet"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        required
      />
      <AuthEmailField email={email} setEmail={setEmail} />
      <input
        type="text"
        placeholder="Téléphone"
        value={telephone}
        onChange={(e) => setTelephone(e.target.value)}
      />
      <AuthPasswordField
        password={password}
        setPassword={setPassword}
        buttonLabel="S'inscrire"
      />
    </form>
  );
}
