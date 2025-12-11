import { Link } from "react-router-dom";
import { SERVICES } from "../constants/services";
import "../styles/Dashboard.css";

export default function BarberCard({ barber }) {
  return (
    <div className="barber-card">
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
          >
            {s.nom} - {s.prix}$
          </Link>
        ))}
      </div>
    </div>
  );
}
