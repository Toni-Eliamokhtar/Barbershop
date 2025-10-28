import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import BookingInfo from "../components/BookingInfo";
import BookingForm from "../components/BookingForm";
import "../styles/Booking.css";

const services = [
  { id: 1, nom: "Coupe cheveux", prix: 25 },
  { id: 2, nom: "Cheveux + barbe", prix: 35 },
  { id: 3, nom: "Étudiant", prix: 20 },
  { id: 4, nom: "Enfant", prix: 15 },
  { id: 5, nom: "Barbe", prix: 18 },
];

export default function Booking() {
  const { barberId, serviceId } = useParams();

  const [barber, setBarber] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

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

        // Récupérer l'utilisateur connecté
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (barberError) setErr(barberError.message);
        else setBarber(barberData);

        if (userError) setErr(userError.message);
        else setUser(currentUser);
      } catch (error) {
        setErr(error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [barberId]);

  if (loading)
    return (
      <div className="booking">
        <p>Chargement…</p>
      </div>
    );

  if (err)
    return (
      <div className="booking">
        <p style={{ color: "tomato" }}>Erreur: {err}</p>
      </div>
    );

  if (!barber)
    return (
      <div className="booking">
        <p>Barbier introuvable.</p>
      </div>
    );

  if (!service)
    return (
      <div className="booking">
        <p>Service introuvable.</p>
      </div>
    );

  if (!user)
    return (
      <div className="booking">
        <p>Vous devez être connecté pour réserver.</p>
      </div>
    );

  return (
    <div className="booking">
      <div className="booking-card">
        <BookingInfo barber={barber} service={service} user={user} />
        <BookingForm barber={barber} service={service} user={user} />
      </div>
    </div>
  );
}
