import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import BarberCard from "../components/BarberCard";
import AdminAddBarberForm from "../components/AdminAddBarberForm"; // ✅ import du nouveau composant
import "../styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [barbers, setBarbers] = useState([]);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [barbersError, setBarbersError] = useState(null);
  const [profile, setProfile] = useState(null);

  // ✅ Fonction pour charger les barbiers (réutilisable)
  const loadBarbers = async () => {
    const { data, error } = await supabase
      .from("barbers")
      .select("*")
      .order("nom", { ascending: true });

    if (error) setBarbersError(error.message);
    else setBarbers(data ?? []);
  };

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        navigate("/login");
        return;
      }

      // 🔹 Charger le profil
      const { data: prof, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!pErr) setProfile(prof);

      // 🔹 Charger les barbiers
      await loadBarbers();
      setLoadingBarbers(false);
    })();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const isAdmin = profile?.role === "admin";

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Réserve ton rendez-vous 💈</h2>
        <button onClick={handleLogout} className="logout-btn">
          Déconnexion
        </button>
      </div>

      {/* ✅ Bloc admin séparé */}
      {isAdmin && (
        <AdminAddBarberForm
          onBarberAdded={loadBarbers} // callback pour rafraîchir la liste
        />
      )}

      {/* ✅ Liste des barbiers */}
      {loadingBarbers && <p>Chargement des barbiers…</p>}
      {barbersError && (
        <p style={{ color: "tomato" }}>Erreur: {barbersError}</p>
      )}

      <div className="barbers-grid">
        {barbers.map((b) => (
          <BarberCard key={b.id} barber={b} />
        ))}

        {!loadingBarbers && !barbersError && barbers.length === 0 && (
          <p>Aucun barbier pour le moment.</p>
        )}
      </div>
    </div>
  );
}
