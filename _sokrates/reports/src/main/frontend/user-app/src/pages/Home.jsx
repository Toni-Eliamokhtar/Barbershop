import Header from "../components/Header";
import Footer from "../components/Footer";
import ServiceCard from "../components/ServiceCard";
import useSupabaseStatus from "../hooks/useSupabaseStatus";
import "../styles/Home.css";

export default function Home() {
  const status = useSupabaseStatus();

  return (
    <div className="home">
      <Header />

      <section className="home-about">
        <img src="/images/barbershop.png" alt="Barbershop" />
        <div>
          <h2>Bienvenue chez Barbershop 514</h2>
          <p>
            Offrez-vous une coupe parfaite et une barbe soignée dans une
            ambiance moderne et élégante.
          </p>
          <p style={{ fontSize: "14px", marginTop: "10px" }}>{status}</p>
        </div>
      </section>

      <section className="home-services">
        <h2>Nos services</h2>
        <div className="services-grid">
          <ServiceCard icon="💇" title="Coupe de cheveux" />
          <ServiceCard icon="🧔" title="Barbe & moustache" />
          <ServiceCard icon="🎓" title="Étudiant & enfant" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
