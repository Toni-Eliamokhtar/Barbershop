import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";
import "../styles/Home.css";

export default function Home() {
  const [status, setStatus] = useState("⏳ Connexion à Supabase...");

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .limit(1);

      if (error) {
        console.error("❌ Erreur Supabase :", error.message);
        setStatus("❌ Erreur de connexion à Supabase");
      } else {
        console.log("✅ Connexion Supabase OK, exemple :", data);
        setStatus("✅ Supabase connecté !");
      }
    }

    testConnection();
  }, []);

  return (
    <div className="home">
      <Header />

      <section className="home-about">
        <img src="/images/barbershop.png" alt="Barbershop" />
        <div>
          <h2>Bienvenue chez Barbershop 514</h2>
          <p>
            Offrez-vous une coupe parfaite et une barbe soignée dans une
            ambiance moderne et élégante. Nos barbiers professionnels sont là
            pour vous sublimer.
          </p>
        </div>
      </section>

      <section className="home-services">
        <h2>Nos services</h2>
        <div className="services-grid">
          <div className="service-card">💇 Coupe de cheveux</div>
          <div className="service-card">🧔 Barbe & moustache</div>
          <div className="service-card">🎓 Étudiant & enfant</div>
        </div>
      </section>

      <section className="home-info">
        <h2>📍 Nous trouver</h2>
        <p>123 Rue Sainte-Catherine, Montréal, QC</p>
        <p>🕒 Lun-Sam : 10h - 20h</p>
        <p>Dimanche : Fermé</p>
        <p>📞 Téléphone : (514) 123-4567</p>
      </section>

      <footer className="home-footer">
        <p>© 2025 Barbershop 514 - Tous droits réservés</p>
      </footer>
    </div>
  );
}
