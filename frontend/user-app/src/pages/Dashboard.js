import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/Dashboard.css";

const barbers = [
  { id: 1, nom: "Karim", specialite: "Coupe moderne", photo: "/images/barber1.jpg" },
  { id: 2, nom: "Ali", specialite: "Barbe & cheveux", photo: "/images/barber2.jpg" }
];

const services = [
  { id: 1, nom: "Coupe cheveux", prix: 25 },
  { id: 2, nom: "Cheveux + barbe", prix: 35 },
  { id: 3, nom: "Étudiant", prix: 20 },
  { id: 4, nom: "Enfant", prix: 15 },
  { id: 5, nom: "Barbe", prix: 18 }
];

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      }
    })();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Réserve ton rendez-vous 💈</h2>
        <button onClick={handleLogout} className="logout-btn">Déconnexion</button>
      </div>

      <div className="barbers-grid">
        {barbers.map((b) => (
          <div key={b.id} className="barber-card">
            <img src={b.photo} alt={b.nom} className="barber-photo" />
            <h3>{b.nom}</h3>
            <p className="specialite">{b.specialite}</p>

            <div className="services">
              {services.map((s) => (
                <Link
                  key={s.id}
                  to={`/booking/${b.id}/${s.id}`}
                  className="service-btn"
                >
                  {s.nom} - {s.prix}$
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
