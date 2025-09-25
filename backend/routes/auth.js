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
  try {
    const { email, password } = req.body;
    
    if(!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe sont requis." });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({
      message: "Connexion réussie",
      user: data.user,
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token
    });
  }
  catch (err) {
    console.error("Erreur de la connexion :", err);
    res.status(500).json({ error: "Erreur pendant la connexion" });
  }
});

export default router;
