import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import BarberCard from "../components/BarberCard";
import "../styles/Dashboard.css";

const services = [
  { id: 1, nom: "Coupe cheveux", prix: 25 },
  { id: 2, nom: "Cheveux + barbe", prix: 35 },
  { id: 3, nom: "Étudiant", prix: 20 },
  { id: 4, nom: "Enfant", prix: 15 },
  { id: 5, nom: "Barbe", prix: 18 },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const [barbers, setBarbers] = useState([]);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [barbersError, setBarbersError] = useState(null);

  const [profile, setProfile] = useState(null);

  const [nom, setNom] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: prof, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!pErr) setProfile(prof);

      const { data, error } = await supabase
        .from("barbers")
        .select("*")
        .order("nom", { ascending: true });

      if (error) setBarbersError(error.message);
      else setBarbers(data ?? []);

      setLoadingBarbers(false);
    })();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleAddBarber = async (e) => {
    e.preventDefault();
    setSaveError(null);

    if (!nom.trim() || !specialite.trim()) {
      setSaveError("Veuillez remplir le nom et la spécialité.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("barbers").insert({
      nom: nom.trim(),
      specialite: specialite.trim(),
      photo_url: photoUrl.trim() || "/images/fallback.jpg",
    });
    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    setNom("");
    setSpecialite("");
    setPhotoUrl("");

    const { data } = await supabase
      .from("barbers")
      .select("*")
      .order("nom", { ascending: true });
    setBarbers(data ?? []);
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

      {isAdmin && (
        <div
          className="admin-box"
          style={{
            background: "#111827",
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            border: "1px solid #1f2937",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Admin — Ajouter un barbier</h3>
          <form
            onSubmit={handleAddBarber}
            style={{ display: "grid", gap: 12, maxWidth: 520 }}
          >
            <input
              placeholder="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
            <input
              placeholder="Spécialité"
              value={specialite}
              onChange={(e) => setSpecialite(e.target.value)}
              required
            />
            <input
              placeholder="Photo URL (optionnel)"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
            <button type="submit" disabled={saving}>
              {saving ? "Ajout..." : "Ajouter"}
            </button>
            {saveError && (
              <p style={{ color: "tomato", margin: 0 }}>Erreur: {saveError}</p>
            )}
          </form>
        </div>
      )}

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
