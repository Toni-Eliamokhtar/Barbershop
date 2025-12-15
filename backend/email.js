import nodemailer from "nodemailer";

let transporter = null;
if (process.env.NODE_ENV !== 'test' && process.env.DISABLE_EMAILS !== 'true') {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// Fonction pour envoyer l'email de confirmation. No-op if transporter not configured.
async function sendConfirmationEmail(to, subject, html) {
  if (!transporter) {
    // silently skip sending in test/no-email environments
    return Promise.resolve();
  }

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
