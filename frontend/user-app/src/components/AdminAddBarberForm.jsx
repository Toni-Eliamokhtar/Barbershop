import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminAddBarberForm({ onBarberAdded }) {
  const [nom, setNom] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleAddBarber = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !specialite.trim()) {
      setError("Veuillez remplir le nom et la spécialité.");
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
      setError(error.message);
      return;
    }

    // Réinitialise le formulaire
    setNom("");
    setSpecialite("");
    setPhotoUrl("");

    // 🔄 Informe le parent qu’un barbier a été ajouté
    if (onBarberAdded) onBarberAdded();
  };

  return (
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
        {error && <p style={{ color: "tomato", margin: 0 }}>Erreur: {error}</p>}
      </form>
    </div>
  );
}
