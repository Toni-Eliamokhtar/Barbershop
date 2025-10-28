import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Stripe from "stripe";
import { createBooking } from "../lib/supabase.js";

dotenv.config();
const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Configuration du transporteur Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

// ✅ Route pour créer une réservation et envoyer l'email de confirmation
router.post("/create", async (req, res) => {
  try {
    const {
      barberId,
      serviceId,
      date,
      time,
      userEmail,
      userName,
      barberName,
      serviceName,
    } = req.body;

    // 🧭 Validation basique
    if (!barberId || !serviceId || !date || !time || !userEmail || !userName) {
      return res.status(400).json({
        error: "Tous les champs sont requis",
      });
    }

    // 📨 Email HTML
    const mailOptions = {
      from: `"Barbershop 514" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "✅ Confirmation de votre rendez-vous - Barbershop 514",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .email-container {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .email-header {
              background-color: #2c3e50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .email-body {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .booking-details {
              background-color: #ecf0f1;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .detail-item {
              margin: 10px 0;
              font-size: 16px;
            }
            .highlight {
              color: #e74c3c;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>✂️ Barbershop</h1>
              <h2>Réservation Confirmée</h2>
            </div>
            <div class="email-body">
              <p>Bonjour <strong>${userName}</strong>,</p>
              <p>Votre rendez-vous a été <span class="highlight">confirmé avec succès</span> !</p>
              
              <div class="booking-details">
                <h3>📋 Détails de votre réservation :</h3>
                <div class="detail-item">📅 <strong>Date :</strong> ${new Date(
                  date
                ).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</div>
                <div class="detail-item">🕐 <strong>Heure :</strong> ${time}</div>
                <div class="detail-item">✂️ <strong>Service :</strong> ${serviceName}</div>
                <div class="detail-item">👨‍💼 <strong>Barbier :</strong> ${barberName}</div>
              </div>
              
              <p><strong>📧 Email de contact :</strong> ${userEmail}</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              <p><em>Merci de votre confiance ! Nous avons hâte de vous accueillir.</em></p>
              <p style="text-align: center; margin-top: 30px;">
                <strong>L'équipe Barbershop 💈</strong>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Persist booking in Supabase (if available)
    let created = null;
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
      created = data ?? null;
    } catch (err) {
      console.warn("Could not create booking in supabase:", err.message || err);
    }

    // ✅ Envoi de l'email
    await transporter.sendMail(mailOptions);
    console.log(`📩 Email de confirmation envoyé à ${userEmail}`);

    res.json({
      success: true,
      message: "✅ Réservation confirmée et email envoyé avec succès",
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
    console.error("❌ Erreur lors de la réservation:", error);
    res.status(500).json({
      error: "Erreur lors de la confirmation de réservation",
      details: error.message,
    });
  }
});

// Create a Stripe Checkout session and (optionally) create a pending booking
router.post("/create-checkout-session", async (req, res) => {
  try {
    const {
      barberId,
      serviceId,
      date,
      time,
      userEmail,
      userName,
      barberName,
      serviceName,
      price,
    } = req.body;

    if (!price) {
      return res.status(400).json({ error: "Price is required (in EUR)" });
    }

    // Create a pending booking in DB to link with the payment
    let bookingRecord = null;
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
      bookingRecord = data;
    } catch (err) {
      console.warn("Could not create booking in supabase:", err.message || err);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `Réservation - ${serviceName || "Service"}` },
            unit_amount: Math.round(Number(price) * 100),
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
    console.error("Stripe create session error", err);
    res.status(500).json({ error: "Unable to create Stripe session" });
  }
});

export default router;
