import { useParams } from "react-router-dom";
import { useState } from "react";
import "../styles/Booking.css";

const barbers = [
  { id: 1, nom: "Karim", photo: "/images/barber1.jpg" },
  { id: 2, nom: "Ali", photo: "/images/barber2.jpg" }
];

const services = [
  { id: 1, nom: "Coupe cheveux" },
  { id: 2, nom: "Cheveux + barbe" },
  { id: 3, nom: "Étudiant" },
  { id: 4, nom: "Enfant" },
  { id: 5, nom: "Barbe" }
];

export default function Booking() {
  const { barberId, serviceId } = useParams();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const barber = barbers.find((b) => b.id === parseInt(barberId));
  const service = services.find((s) => s.id === parseInt(serviceId));

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`✅ Réservation confirmée avec ${barber.nom} pour ${service.nom} le ${date} à ${time}`);
  };

  return (
    <div className="booking">
      <div className="booking-card">
        <h2>Réserver avec {barber.nom}</h2>
        <img src={barber.photo} alt={barber.nom} className="barber-photo" />
        <p>Service choisi : <strong>{service.nom}</strong></p>

        <form onSubmit={handleSubmit} className="booking-form">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
          <button type="submit">Confirmer</button>
        </form>
      </div>
    </div>
  );
}
