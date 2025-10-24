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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const service = services.find((s) => s.id === Number(serviceId));

  useEffect(() => {
    (async () => {
      try {
        // Récupérer les données du barbier
        const { data: barberData, error: barberError } = await supabase
          .from("barbers")
          .select("*")
          .eq("id", barberId)
          .single();

        // Récupérer les données de l'utilisateur connecté
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

        if (barberError) {
          setErr(barberError.message);
        } else {
          setBarber(barberData);
        }

        if (userError) {
          setErr(userError.message);
        } else {
          setUser(currentUser);
        }

      } catch (error) {
        setErr(error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [barberId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!barber || !service || !user) return;

    setBookingLoading(true);

    try {
      const response = await fetch('http://localhost:5000/booking/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          barberId: barber.id,
          serviceId: service.id,
          date,
          time,
          userEmail: user.email,
          userName: user.user_metadata?.nom || user.user_metadata?.name || user.email.split('@')[0],
          barberName: barber.nom,
          serviceName: service.nom
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Réservation confirmée ! 

📧 Un email de confirmation a été envoyé à : ${user.email}

📋 Détails de votre réservation :
👨‍💼 Barbier : ${barber.nom}
✂️ Service : ${service.nom} 
📅 Date : ${new Date(date).toLocaleDateString('fr-FR')}
🕐 Heure : ${time}

Merci de votre confiance ! 💈`);
        
        // Réinitialiser le formulaire
        setDate("");
        setTime("");
      } else {
        throw new Error(data.error || 'Erreur lors de la réservation');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert(`❌ Erreur lors de la réservation : ${error.message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="booking"><p>Chargement…</p></div>;
  if (err) return <div className="booking"><p style={{color:"tomato"}}>Erreur: {err}</p></div>;
  if (!barber) return <div className="booking"><p>Barbier introuvable.</p></div>;
  if (!service) return <div className="booking"><p>Service introuvable.</p></div>;
  if (!user) return <div className="booking"><p>Vous devez être connecté pour réserver.</p></div>;

  return (
    <div className="booking">
      <div className="booking-card">
        <h2>Réserver avec {barber.nom}</h2>
        <img src={barber.photo_url ?? "/images/fallback.jpg"} alt={barber.nom} className="barber-photo" />
        
        <div className="booking-info">
          <p>Service choisi : <strong>{service.nom}</strong></p>
          <p>📧 Email de confirmation : <strong>{user.email}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="date">📅 Date :</label>
            <input 
              id="date"
              type="date"
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              min={new Date().toISOString().split('T')[0]} // Date minimum = aujourd'hui
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="time">🕐 Heure :</label>
            <input 
              id="time"
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              min="09:00"
              max="18:00"
              required 
            />
          </div>
          
          <button type="submit" disabled={bookingLoading}>
            {bookingLoading ? "⏳ Confirmation en cours..." : "✅ Confirmer et recevoir l'email"}
          </button>
        </form>
      </div>
    </div>
  );
}
