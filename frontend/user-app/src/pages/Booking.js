import { useParams } from "react-router-dom";
import { useState } from "react";

// Fake data : barbers
const barbers = [
  { id: 1, nom: "Karim" },
  { id: 2, nom: "Ali" }
];

// Fake data : services
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
    alert(
      `✅ Réservation confirmée avec ${barber.nom} pour ${service.nom} le ${date} à ${time}`
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Réserver avec {barber.nom}</h2>
      <p>Service choisi : {service.nom}</p>

      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        /><br /><br />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Confirmer</button>
      </form>
    </div>
  );
}
