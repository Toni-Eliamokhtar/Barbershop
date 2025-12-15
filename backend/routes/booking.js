import express from "express";
import sendConfirmationEmail from "../email.js";
import dotenv from "dotenv";
import Stripe from "stripe";
import { createBooking, supabase } from "../lib/supabase.js";
import { extractBookingFields } from "../lib/extractBookingFields.js";

dotenv.config();
const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// 🔁 Persister une réservation
async function persistBookingInSupabase(fields) {
  try {
    const { data, error } = await createBooking({
      barber_id: fields.barberId,
      service_id: fields.serviceId,
      date: fields.date,
      time: fields.time,
      user_email: fields.userEmail,
      user_name: fields.userName,
      barber_name: fields.barberName,
      service_name: fields.serviceName,
    });

    if (error) console.warn("Supabase createBooking warning:", error);
    return data ?? null;
  } catch (err) {
    console.warn("Could not create booking in supabase:", err?.message || err);
    return null;
  }
}


// -------------------------------
// 🔥 ROUTE: CREATE
// -------------------------------
router.post("/create", async (req, res) => {
  try {
    const fields = extractBookingFields(req.body);

    if (
      !fields.barberId ||
      !fields.serviceId ||
      !fields.date ||
      !fields.time ||
      !fields.userEmail ||
      !fields.userName
    ) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const created = await persistBookingInSupabase(fields);

    // send confirmation email (no-op in test env if emails disabled)
    await sendConfirmationEmail(
      fields.userEmail,
      "Confirmation de votre rendez-vous",
      `
        <h2>Votre rendez-vous est confirmé</h2>
        <p><strong>Date:</strong> ${fields.date}</p>
        <p><strong>Heure:</strong> ${fields.time}</p>
        <p><strong>Service:</strong> ${fields.serviceName}</p>
        <p><strong>Barbier:</strong> ${fields.barberName}</p>
      `
    );

    res.json({
      success: true,
      booking: created || fields,
    });
  } catch (error) {
    console.error("Erreur lors de la réservation:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
});

// -------------------------------
// 🔥 ROUTE: GET BOOKINGS
// -------------------------------
router.get("/bookings", async (req, res) => {
  const date = req.query.date;
  const barberId = req.query.barber_id || req.query.barberId;

  if (!date || !barberId) {
    return res.status(400).json({ error: "Missing date or barber_id" });
  }

  try {
    const { data, error } = await supabase
      .from("disponibilites_barber")
      .select("heure_dispo")
      .eq("barber_id", barberId)
      .eq("date_dispo", date)
      .eq("est_reserve", true);

    if (error) throw error;

    const times = (data || [])
      .map((d) => d?.heure_dispo?.toString().slice(0, 5))
      .filter(Boolean);

    res.json({ bookings: times });
  } catch (err) {
    console.error("GET /bookings error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------------
// 🔥 ROUTE: STRIPE CHECKOUT
// -------------------------------
router.post("/create-checkout-session", async (req, res) => {
  try {
    const fields = extractBookingFields(req.body);
    const { price } = req.body;

    const servicePriceMap = {
      "1": 25,
      "2": 35,
      "3": 20,
      "4": 15,
      "5": 18,
    };

    const finalPrice =
      servicePriceMap[String(fields.serviceId)] ||
      (price != null && Number(price)) ||
      10;

    const bookingRecord = await persistBookingInSupabase(fields);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: { name: `Réservation - ${fields.serviceName}` },
            unit_amount: Math.round(Number(finalPrice) * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: fields.userEmail,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: { bookingId: bookingRecord?.id ?? "" },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe create session error", err);
    res.status(500).json({ error: "Unable to create Stripe session" });
  }
});

export default router;
