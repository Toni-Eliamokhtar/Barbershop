import { useState } from "react";

export default function BookingForm({ barber, service, user }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!barber || !service || !user) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/booking/create", {
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
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `✅ Réservation confirmée ! 
📧 Un email de confirmation a été envoyé à : ${user.email}

📋 Détails :
👨‍💼 Barbier : ${barber.nom}
✂️ Service : ${service.nom} 
📅 Date : ${new Date(date).toLocaleDateString("fr-FR")}
🕐 Heure : ${time}

Merci de votre confiance ! 💈`
        );

        setDate("");
        setTime("");
      } else {
        throw new Error(data.error || "Erreur lors de la réservation");
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

      <button type="submit" disabled={loading}>
        {loading
          ? "⏳ Confirmation en cours..."
          : "✅ Confirmer et recevoir l'email"}
      </button>
    </form>
  );
}
