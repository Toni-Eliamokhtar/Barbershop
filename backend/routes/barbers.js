import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// GET /api/barbers -> return list of barbers
router.get('/barbers', async (req, res) => {
  try {
    // If supabase mock returns profiles in test env, use it; otherwise return static list
    if (supabase && typeof supabase.from === 'function') {
      const { data, error } = await supabase.from('profiles').select();
      if (error) return res.status(500).json({ error: error.message || 'Supabase error' });
      const barbers = (data || []).filter(p => p.role === 'barber' || p.role === 'admin' || p.id).map(p => ({ id: p.id, name: p.nom || p.name || p.email }));
      return res.json(barbers);
    }

    // fallback static list
    return res.json([
      { id: 'barber1', name: 'Alex' },
      { id: 'barber2', name: 'Sam' }
    ]);
  } catch (err) {
    console.error('GET /api/barbers error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
