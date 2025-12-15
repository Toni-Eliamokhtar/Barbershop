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
                data-testid="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button
                type="submit"
                className="auth-btn"
                data-testid={/inscr/i.test(buttonLabel || '') ? 'signup' : 'login'}
            >
                {buttonLabel}
            </button>
        </>
    );
}
