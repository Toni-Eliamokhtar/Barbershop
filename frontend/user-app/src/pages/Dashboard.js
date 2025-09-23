import { Link, useNavigate } from "react-router-dom";

// Fake data : barbers
const barbers = [
  { id: 1, nom: "Karim", specialite: "Coupe moderne", photo: "/images/barber1.jpg" },
  { id: 2, nom: "Ali", specialite: "Barbe & cheveux", photo: "/images/barber2.jpg" }
];

// Fake data : services
const services = [
  { id: 1, nom: "Coupe cheveux", prix: 25 },
  { id: 2, nom: "Cheveux + barbe", prix: 35 },
  { id: 3, nom: "Étudiant", prix: 20 },
  { id: 4, nom: "Enfant", prix: 15 },
  { id: 5, nom: "Barbe", prix: 18 }
];

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("Vous êtes déconnecté !");
    navigate("/"); // Retour à l’accueil
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Réserve ton rendez-vous</h2>

      <button onClick={handleLogout} style={{ marginBottom: 20 }}>
        🔓 Déconnexion
      </button>

      <h3>Choisis ton barber</h3>
      <div style={{ display: "flex", gap: 20 }}>
        {barbers.map((b) => (
          <div key={b.id} style={{ border: "1px solid #ccc", padding: 12 }}>
            <img src={b.photo} alt={b.nom} width="150" />
            <h4>{b.nom}</h4>
            <p>{b.specialite}</p>

            <h5>Services :</h5>
            {services.map((s) => (
              <div key={s.id}>
                <Link to={`/booking/${b.id}/${s.id}`}>
                  {s.nom} - {s.prix}$
                </Link>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
