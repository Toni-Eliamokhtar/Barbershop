import { useState } from "react";
import AuthPasswordField from "./AuthPasswordField";
import AuthEmailField from "./AuthEmailField";

export default function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <AuthEmailField email={email} setEmail={setEmail} />
      <AuthPasswordField
        password={password}
        setPassword={setPassword}
        buttonLabel="Se connecter"
      />
    </form>
  );
}
