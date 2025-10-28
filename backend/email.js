import nodemailer from "nodemailer";

// Configuration du transporteur Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Fonction pour envoyer l'email de confirmation
async function sendConfirmationEmail(to, subject, html) {
  const mailOptions = {
    from: `"Barbershop 514" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📩 Email envoyé à ${to}`);
}

export default sendConfirmationEmail;
