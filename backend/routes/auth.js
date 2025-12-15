import express from "express";
import { supabase } from "../lib/supabase.js";
import sendConfirmationEmail from "../email.js";

const router = express.Router();

/**
 * POST /auth/signup
 * Body: { email, password, nom, telephone }
 * 1) Crée l’utilisateur Auth (admin)
 * 2) Insère le profil
 */
router.post("/signup", async (req, res) => {
  try {
    const { email, password, nom, telephone } = req.body;
    if (!email || !password || !nom) {
      return res.status(400).json({ error: "email, password, nom sont requis" });
    }

    // Basic email/password validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "email invalide" });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères" });
    }

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) return res.status(400).json({ error: createErr.message });

    const userId = created.user.id;

    const { error: profErr } = await supabase
      .from("profiles")
      .insert([{ id: userId, nom, email, telephone, role: "client" }]);
    if (profErr) return res.status(400).json({ error: profErr.message });

    // Envoi d'un email de bienvenue (non-bloquant). Skip in test env to avoid network/TLS handles.
    if (process.env.NODE_ENV !== 'test' && process.env.DISABLE_EMAILS !== 'true') {
      try {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const welcomeHtml = `
          <h1>Bienvenue chez Barbershop 514 !</h1>
          <p>Bonjour ${nom},</p>
          <p>Merci d'avoir créé un compte chez nous. Voici un aperçu de nos services :</p>
          <ul>
            <li><strong>Coupe classique</strong> — Coupe professionnelle adaptée à votre style.</li>
            <li><strong>Barbe & rasage</strong> — Soin et finition précis.</li>
            <li><strong>Coloration</strong> — Produits de qualité et conseil personnalisé.</li>
            <li><strong>Soins du cuir chevelu</strong> — Traitements et diagnostics.</li>
          </ul>
          <p>Pour prendre rendez-vous, rendez-vous sur votre espace client : <a href="${frontendUrl}">Ouvrir l'application</a></p>
          <p>À bientôt,<br/>L'équipe Barbershop 514</p>
        `;

        // Appel non-bloquant : on attrape les erreurs mais on ne bloque pas la réponse
        sendConfirmationEmail(email, "Bienvenue chez Barbershop 514", welcomeHtml).catch((err) => {
          console.error("Envoi email de bienvenue échoué:", err);
        });
      } catch (err) {
        console.error("Erreur préparation email de bienvenue:", err);
      }
    }

    return res.json({ ok: true, user: { id: userId, email } });
  } catch (e) {
    console.error("Signup error:", e);
    return res.status(500).json({ error: "Erreur signup" });
  }
});

/**
 * POST /auth/login
 * Body: { email, password }
 * → { access_token, refresh_token, user }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email et password sont requis" });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });

    return res.json({
      ok: true,
      user: data.user,
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ error: "Erreur login" });
  }
});

export default router;
