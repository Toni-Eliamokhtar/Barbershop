export default function BookingInfo({ barber, service, user }) {
  if (!barber || !service || !user) return null;

  return (
    <div className="booking-info">
      <h2>Réserver avec {barber.nom}</h2>

      <img
        src={barber.photo_url ?? "/images/fallback.jpg"}
        alt={barber.nom}
        className="barber-photo"
      />

      <div className="booking-info-details">
        <p>
          Service choisi : <strong>{service.nom}</strong>
        </p>
        <p>
          📧 Email de confirmation : <strong>{user.email}</strong>
        </p>
      </div>
    </div>
  );
}
