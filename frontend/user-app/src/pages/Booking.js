import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/Booking.css";

const services = [
  { id: 1, nom: "Coupe cheveux" },
  { id: 2, nom: "Cheveux + barbe" },
  { id: 3, nom: "Étudiant" },
  { id: 4, nom: "Enfant" },
  { id: 5, nom: "Barbe" }
];

export default function Booking() {
  const { barberId, serviceId } = useParams();

  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const service = services.find((s) => s.id === Number(serviceId));

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("barbers")
        .select("*")
        .eq("id", barberId)
        .single();

      if (error) setErr(error.message);
      else setBarber(data);
      setLoading(false);
    })();
  }, [barberId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!barber || !service) return;
    alert(`✅ Réservation confirmée avec ${barber.nom} pour ${service.nom} le ${date} à ${time}`);
  };

  if (loading) return <div className="booking"><p>Chargement…</p></div>;
  if (err) return <div className="booking"><p style={{color:"tomato"}}>Erreur: {err}</p></div>;
  if (!barber) return <div className="booking"><p>Barbier introuvable.</p></div>;
  if (!service) return <div className="booking"><p>Service introuvable.</p></div>;

  return (
    <div className="booking">
      <div className="booking-card">
        <h2>Réserver avec {barber.nom}</h2>
        <img src={barber.photo_url ?? "/images/fallback.jpg"} alt={barber.nom} className="barber-photo" />
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
