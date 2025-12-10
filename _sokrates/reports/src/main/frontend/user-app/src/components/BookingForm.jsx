import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Swal from "sweetalert2"; // ✅ popup centered

export default function BookingForm({ barber, service, user }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  // Liste complète de créneaux (constante)
  const ALL_SLOTS = (() => {
    const slots = [];
    for (let hour = 10; hour < 22; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    slots.push("22:00");
    return slots;
  })();

  // `availableSlots` contient les créneaux non réservés pour la date/barber choisis
  const [availableSlots, setAvailableSlots] = useState(ALL_SLOTS);
  const [loading, setLoading] = useState(false);

  // Quand la date ou le barbier change, récupérer les créneaux réservés et filtrer
  useEffect(() => {
    // pas de date/barber -> toutes les heures
    if (!date || !barber) {
      setAvailableSlots(ALL_SLOTS);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // La table utilisée dans la logique d'envoi est `disponibilites_barber`.
        // On récupère les heures déjà réservées (est_reserve = true) pour ce barbier et cette date.
        const { data, error } = await supabase
          .from("disponibilites_barber")
          .select("heure_dispo")
          .eq("barber_id", barber.id)
          .eq("date_dispo", date)
          .eq("est_reserve", true);

        if (error) {
          console.error("Erreur fetch disponibilites:", error);
          if (!cancelled) setAvailableSlots(ALL_SLOTS);
        } else if (!cancelled) {
          // heure_dispo peut être "HH:MM:SS" ou "HH:MM" -> on normalise en HH:MM
          const booked = (data || []).map((d) =>
            d?.heure_dispo ? d.heure_dispo.toString().slice(0, 5) : ""
          );

          setAvailableSlots(ALL_SLOTS.filter((t) => !booked.includes(t)));

          // si l'heure sélectionnée vient d'être réservée, la désélectionner
          if (booked.includes(time)) setTime("");
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setAvailableSlots(ALL_SLOTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [date, barber]);

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
        Swal.fire({
          icon: "error",
          title: "Service introuvable ❌",
          text: "Réessaie plus tard."
        });
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
        Swal.fire({
          icon: "warning",
          title: "Créneau indisponible ⛔",
          text: "Ce créneau vient d’être réservé."
        });
        return;
      }

      const { data: rdvId, error: bookErr } = await supabase.rpc("book_rdv", {
        p_client: user.id,
        p_dispo: slot.id, 
        p_service: svcData.id,
      });

      if (bookErr) {
        Swal.fire({
          icon: "warning",
          title: "Créneau pris ⛔",
          text: "Quelqu'un a réservé à la dernière seconde."
        });
        return;
      }

      // ✅ Succès popup avant paiement
      Swal.fire({
        icon: "success",
        title: "Rendez-vous confirmé ✅",
        html: `<b>${barber.nom}</b><br/>Le <b>${date}</b> à <b>${time}</b>`,
        confirmButtonColor: "#111",
        confirmButtonText: "Passer au paiement 💳"
      }).then(async () => {
        const response = await fetch("http://localhost:5000/booking/create-checkout-session", {
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
          window.location = data.url;
        }
      });

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erreur ❌",
        text: error.message
      });
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
          {availableSlots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading
          ? "⏳ Confirmation…" 
          : "✅ Confirmer et payer"}
      </button>
    </form>
  );
}
