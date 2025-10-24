import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

const services = [
  { id: 1, nom: "Coupe cheveux", prix: 25 },
  { id: 2, nom: "Cheveux + barbe", prix: 35 },
  { id: 3, nom: "Étudiant", prix: 20 },
  { id: 4, nom: "Enfant", prix: 15 },
  { id: 5, nom: "Barbe", prix: 18 },
];

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
        {services.map((s) => (
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
