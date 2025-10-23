import express from "express";
import { supabase } from "../lib/supabase.js";

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
    if (error) return res.status(400).json({ error: error.message });

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
