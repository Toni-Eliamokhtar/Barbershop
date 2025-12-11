import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import SignupForm from "../components/SignupForm";
import { showSuccessAlert, showErrorAlert } from "../utils/alerts";

export default function Signup() {
  const navigate = useNavigate();

  const handleSignup = async ({ nom, email, telephone, password }) => {
    try {
      const res = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, email, telephone, password }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Création du compte impossible");

      await showSuccessAlert({
        title: "Compte créé 🎉",
        text: "Ton compte est prêt. Tu peux te connecter maintenant.",
      });

      navigate("/login");
    } catch (err) {
      showErrorAlert({
        title: "Échec d'inscription ❌",
        text: err.message || "Une erreur est survenue.",
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Créer un compte</h2>
        <div className="auth-divider"></div>

        <SignupForm onSubmit={handleSignup} />

        <p className="auth-switch">
          Déjà un compte ? <a href="/login">Connecte-toi</a>
        </p>
      </div>
    </div>
  );
}
