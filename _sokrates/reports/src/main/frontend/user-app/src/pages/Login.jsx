import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import LoginForm from "../components/LoginForm";
import Swal from "sweetalert2";
import "../styles/Auth.css";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async ({ email, password }) => {
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de connexion");

      const { access_token, refresh_token } = data;
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (error) throw error;

      await Swal.fire({
        icon: "success",
        title: "Connexion réussie ✅",
        text: `Bienvenue ${email} !`,
        confirmButtonColor: "#111",
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Erreur de login :", err);

      Swal.fire({
        icon: "error",
        title: "Échec de connexion ❌",
        text: err.message || "Email ou mot de passe invalide.",
        confirmButtonColor: "#111",
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Connexion</h2>
        <div className="auth-divider"></div>

        <LoginForm onSubmit={handleLogin} />

        <p className="auth-switch">
          Pas encore de compte ? <a href="/signup">Inscris-toi</a>
        </p>
      </div>
    </div>
  );
}
