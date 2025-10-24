import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="home-header">
      <h1>💈 Barbershop 514</h1>
      <p className="slogan">Style. Confiance. Élégance.</p>

      <div className="home-actions">
        <Link to="/login" className="btn-primary">
          Se connecter
        </Link>
        <Link to="/signup" className="btn-secondary">
          S'inscrire
        </Link>
      </div>
    </header>
  );
}
