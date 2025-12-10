// src/components/AuthEmailField.jsx
export default function AuthEmailField({ email, setEmail }) {
    return (
        <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />
    );
}
