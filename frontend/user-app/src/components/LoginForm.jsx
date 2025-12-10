import { useState } from "react";
import AuthPasswordField from "./AuthPasswordField";

export default function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <input
        type="email"
        placeholder="Adresse email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <AuthPasswordField
        password={password}
        setPassword={setPassword}
        buttonLabel="Se connecter"
      />
    </form>
  );
}
