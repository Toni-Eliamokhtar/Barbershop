import { Link, useNavigate } from "react-router-dom";
import { SERVICES } from "../constants/services";
import "../styles/Dashboard.css";

export default function BarberCard({ barber }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    const firstService = SERVICES[0];
    if (firstService) {
      navigate(`/booking/${barber.id}/${firstService.id}`);
    }
  };

  return (
    <div
      className="barber-card"
      role="button"
      onClick={handleCardClick}
      data-testid="barber-item"
      tabIndex={0}
    >
      <img
        src={barber.photo_url ?? "/images/fallback.jpg"}
        alt={barber.nom}
        className="barber-photo"
      />
      <h3>{barber.nom}</h3>
      <p className="specialite">{barber.specialite}</p>

      <div className="services">
        {SERVICES.map((s) => (
          <Link
            key={s.id}
            to={`/booking/${barber.id}/${s.id}`}
            className="service-btn"
            data-testid={`barber-${barber.id}-service-${s.id}`}
          >
            {s.nom} - {s.prix}$
          </Link>
        ))}
      </div>
    </div>
  );
}
