export default function AuthPasswordField({
    password,
    setPassword,
    buttonLabel,
}) {
    return (
        <>
            <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit" className="auth-btn">
                {buttonLabel}
            </button>
        </>
    );
}
