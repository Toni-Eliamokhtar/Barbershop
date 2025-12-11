import useSupabaseStatus from "./hooks/useSupabaseStatus";
import "./styles/Home.css";

export default function App() {
  const status = useSupabaseStatus();

  return (
    <div className="home">
      <header className="home-header">
        <h1>💈 Barbershop 514</h1>
        <p className="slogan">Style. Confiance. Élégance.</p>
        <p style={{ fontSize: "14px", marginTop: "10px" }}>{status}</p>

        <div className="home-actions">
          <a href="/login" className="btn-primary">Se connecter</a>
          <a href="/signup" className="btn-secondary">S'inscrire</a>
        </div>
      </header>
    </div>
  );
}
