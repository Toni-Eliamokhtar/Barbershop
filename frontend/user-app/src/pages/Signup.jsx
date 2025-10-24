import "../styles/Auth.css";
import SignupForm from "../components/SignupForm";

export default function Signup() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Créer un compte</h2>
        <div className="auth-divider"></div>
        <SignupForm />
        <p className="auth-switch">
          Déjà un compte ? <a href="/login">Connecte-toi</a>
        </p>
      </div>
    </div>
  );
}
