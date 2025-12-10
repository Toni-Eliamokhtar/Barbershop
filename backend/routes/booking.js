import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Stripe from "stripe";
import { createBooking, supabase } from "../lib/supabase.js";
import { extractBookingFields } from "../lib/extractBookingFields.js";

dotenv.config();
const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// 🔁 Helper: persister une réservation (déjà existant)
async function persistBookingInSupabase({
  barberId,
  serviceId,
  date,
  time,
  userEmail,
  userName,
  barberName,
  serviceName,
}) {
  try {
    const { data, error } = await createBooking({
      barber_id: barberId,
      service_id: serviceId,
      date,
      time,
      user_email: userEmail,
      user_name: userName,
      barber_name: barberName,
      service_name: serviceName,
    });

    if (error) console.warn("Supabase createBooking warning:", error);

    return data ?? null;
  } catch (err) {
    console.warn("Could not create booking in supabase:", err?.message || err);
    return null;
  }
}

// ✉️ Config email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Route: créer une réservation + envoyer email
router.post("/create", async (req, res) => {
  try {
    // 🟢 PLUS AUCUNE DUPLICATION ICI
    const {
      barberId,
      serviceId,
      date,
      time,
      userEmail,
      userName,
      barberName,
      serviceName,
    } = extractBookingFields(req.body);

    if (!barberId || !serviceId || !date || !time || !userEmail || !userName) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const mailOptions = {
      from: `"Barbershop 514" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Confirmation de votre rendez-vous",
      html: `
        <h2>Votre rendez-vous est confirmé</h2>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Heure:</strong> ${time}</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Barbier:</strong> ${barberName}</p>
      `,
    };

    const created = await persistBookingInSupabase({
      barberId,
      serviceId,
      date,
      time,
      userEmail,
      userName,
      barberName,
      serviceName,
    });

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      booking: created || {
        barberId,
        serviceId,
        date,
        time,
        userEmail,
        userName,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la réservation:", error);
    res.status(500).json({ error: "Erreur interne" });
  }
});

// GET /booking/bookings
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

// Stripe Checkout
router.post("/create-checkout-session", async (req, res) => {
  try {
    // 🟢 PLUS AUCUNE DUPLICATION ICI NON PLUS
    const {
      barberId,
      serviceId,
      date,
      time,
      userEmail,
      userName,
      barberName,
      serviceName,
    } = extractBookingFields(req.body);

    const { price } = req.body;

    const servicePriceMap = {
      "1": 25,
      "2": 35,
      "3": 20,
      "4": 15,
      "5": 18,
    };

    const finalPrice =
      servicePriceMap[String(serviceId)] ||
      (price != null && Number(price)) ||
      10;

    const bookingRecord = await persistBookingInSupabase({
      barberId,
      serviceId,
      date,
      time,
      userEmail,
      userName,
      barberName,
      serviceName,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: `Réservation - ${serviceName || "Service"}`,
            },
            unit_amount: Math.round(Number(finalPrice) * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: { bookingId: bookingRecord?.id ?? "" },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error", err);
    res.status(500).json({ error: "Unable to create Stripe session" });
  }
});

export default router;
