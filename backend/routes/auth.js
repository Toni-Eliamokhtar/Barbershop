import express from "express";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { email, password, nom, telephone } = req.body;

  // Création utilisateur dans Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) return res.status(400).json({ error: error.message });

  // Insertion dans table profiles
  const { error: profileError } = await supabase
    .from("profiles")
    .insert([{ id: data.user.id, nom, telephone, role: "client" }]);

  if (profileError) return res.status(400).json({ error: profileError.message });

  res.json({ message: "✅ Utilisateur créé avec succès", user: data.user });
});

router.post("/login", async (req, res) => {
  res.json({
    message:
      "⚠️ Utilise supabase.auth.signInWithPassword côté frontend pour la connexion."
  });
});

export default router;
