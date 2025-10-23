import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/Dashboard.css";

const services = [
  { id: 1, nom: "Coupe cheveux", prix: 25 },
  { id: 2, nom: "Cheveux + barbe", prix: 35 },
  { id: 3, nom: "Étudiant", prix: 20 },
  { id: 4, nom: "Enfant", prix: 15 },
  { id: 5, nom: "Barbe", prix: 18 }
];

export default function Dashboard() {
  const navigate = useNavigate();

  const [barbers, setBarbers] = useState([]);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [barbersError, setBarbersError] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("barbers")
        .select("*")
        .order("nom", { ascending: true });

      if (error) {
        setBarbersError(error.message);
      } else {
        setBarbers(data ?? []);
      }
      setLoadingBarbers(false);
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

      {loadingBarbers && <p>Chargement des barbiers…</p>}
      {barbersError && <p style={{ color: "tomato" }}>Erreur: {barbersError}</p>}

      <div className="barbers-grid">
        {barbers.map((b) => (
          <div key={b.id} className="barber-card">
            <img src={b.photo_url ?? "/images/fallback.jpg"} alt={b.nom} className="barber-photo" />
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

        {!loadingBarbers && !barbersError && barbers.length === 0 && (
          <p>Aucun barbier pour le moment.</p>
        )}
      </div>
    </div>
  );
}
