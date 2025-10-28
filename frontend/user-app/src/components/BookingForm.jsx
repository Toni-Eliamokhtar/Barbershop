import { useState, useEffect } from "react";

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
