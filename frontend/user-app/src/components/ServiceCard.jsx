export default function ServiceCard({ icon, title }) {
  return (
    <div className="service-card">
      {icon && (
        <span style={{ fontSize: "1.5rem", marginRight: "8px" }}>{icon}</span>
      )}
      {title}
    </div>
  );
}
