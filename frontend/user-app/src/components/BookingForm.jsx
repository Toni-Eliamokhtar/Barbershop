import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; // ⬅️ AJOUT

export default function BookingForm({ barber, service, user }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🕒 Générer les créneaux horaires 10:00 → 22:00
  useEffect(() => {
    const slots = [];
    for (let hour = 10; hour < 22; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    slots.push("22:00");
    setTimeSlots(slots);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!barber || !service || !user) return;

    setLoading(true);
    try {
      // Determine price from service object (fallback to 10 EUR)
      const price = service?.prix || service?.price || 10;

      const { data: svcData, error: svcErr } = await supabase
        .from("services")
        .select("id, nom")
        .eq("nom", service.nom)
        .single();

      if (svcErr || !svcData) {
        alert("Service introuvable en base");
        return;
      }

      const pgTime = time.length === 5 ? `${time}:00` : time;
      const { data: slot, error: slotErr } = await supabase
        .from("disponibilites_barber")
        .select("id, est_reserve")
        .eq("barber_id", barber.id)
        .eq("date_dispo", date)      // format YYYY-MM-DD
        .eq("heure_dispo", pgTime)     // format HH:MM (time)
        .eq("est_reserve", false)
        .single();

      if (slotErr || !slot) {
        alert("Ce créneau n’est pas disponible (déjà réservé ou inexistant).");
        return;
      }

      const { data: rdvId, error: bookErr } = await supabase.rpc("book_rdv", {
        p_client: user.id,
        p_dispo: slot.id, 
        p_service: svcData.id,
      });

      if (bookErr) {
        if (bookErr.message?.includes("SLOT_TAKEN")) {
          alert("Ce créneau vient d'être pris. Choisis un autre.");
        } else {
          console.error(bookErr);
          alert("Erreur lors de la réservation.");
        }
        return;
      }

      const response = await fetch(
        "http://localhost:5000/booking/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barberId: barber.id,
            serviceId: service.id,
            date,
            time,
            userEmail: user.email,
            userName:
              user.user_metadata?.nom ||
              user.user_metadata?.name ||
              user.email.split("@")[0],
            barberName: barber.nom,
            serviceName: service.nom,
            price,

            serviceUuid: svcData.id,
            rendezvousId: rdvId,
            dispoId: slot.id,
          }),
        }
      );

      const data = await response.json();
      if (response.ok && data.url) {
        // redirect to Stripe Checkout
        window.location = data.url;
      } else {
        throw new Error(data.error || "Erreur lors de la création du paiement");
      }
    } catch (error) {
      alert(`❌ Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <div className="form-group">
        <label htmlFor="date">📅 Date :</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="time">🕐 Heure :</label>
        <select
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        >
          <option value="">-- Sélectionner une heure --</option>
          {timeSlots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading
          ? "⏳ Confirmation en cours..."
          : "✅ Confirmer et recevoir l'email"}
      </button>
    </form>
  );
}
