import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/booking.js";
import barbersRoutes from "./routes/barbers.js";
import dotenv from "dotenv";
import Stripe from "stripe";
import { markBookingPaid } from "./lib/supabase.js";

dotenv.config();

const app = express();

// ✅ Middleware CORS + JSON
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe webhook endpoint needs the raw body to validate the signature
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      console.log("Payment succeeded for booking", bookingId);
      if (bookingId) {
        try {
          const { data, error } = await markBookingPaid(bookingId, {
            payment_status: session.payment_status,
            session_id: session.id,
          });
          if (error) console.error("Error marking booking paid:", error);
          else console.log("Booking marked paid:", data?.id ?? bookingId);
        } catch (err) {
          console.error("markBookingPaid error:", err);
        }
      }
    }

    res.json({ received: true });
  }
);

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/booking", bookingRoutes);
app.use('/api', barbersRoutes);

// Export app for tests and start server only outside of test environment
export default app;

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Backend démarré sur http://localhost:${PORT}`);
  });
}
