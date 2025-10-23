import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Configuration du transporteur email (Ethereal pour test)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'ethereal.user@ethereal.email',
    pass: 'ethereal.pass'
  }
});

// Route pour créer une réservation
router.post('/create', async (req, res) => {
  try {
    const { barberId, serviceId, date, time, userEmail, userName, barberName, serviceName } = req.body;

    // Validation des données
    if (!barberId || !serviceId || !date || !time || !userEmail || !userName) {
      return res.status(400).json({ 
        error: 'Tous les champs sont requis' 
      });
    }

    // Mode simulation : ne pas envoyer d'email réel pour le développement
    console.log('📧 EMAIL SIMULÉ - Détails de la réservation :');
    console.log(`👤 Client: ${userName} (${userEmail})`);
    console.log(`💇 Barbier: ${barberName}`);
    console.log(`✂️ Service: ${serviceName}`);
    console.log(`📅 Date: ${date} à ${time}`);
    
    res.json({ 
      success: true, 
      message: '✅ Réservation confirmée ! (Email simulé en mode développement)',
      booking: {
        barberId,
        serviceId, 
        date,
        time,
        userEmail,
        userName
      },
      emailSent: 'simulated',
      note: 'Email simulé pour le développement. Configurez Gmail pour de vrais emails.'
    });
    
    return;

    // Configuration de l'email de confirmation
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '✅ Confirmation de votre rendez-vous - Barbershop',
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
                <div class="detail-item">📅 <strong>Date :</strong> ${new Date(date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
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
      `
    };

    try {
      // Envoi de l'email
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email de confirmation envoyé à ${userEmail}`);
      
      res.json({ 
        success: true, 
        message: 'Réservation confirmée et email de confirmation envoyé',
        booking: {
          barberId,
          serviceId, 
          date,
          time,
          userEmail,
          userName
        },
        emailSent: true
      });
      
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      
      // Même si l'email échoue, on confirme la réservation
      res.json({ 
        success: true, 
        message: 'Réservation confirmée mais échec envoi email',
        booking: {
          barberId,
          serviceId, 
          date,
          time,
          userEmail,
          userName
        },
        emailSent: false,
        emailError: emailError.message
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de la réservation:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la confirmation de réservation',
      details: error.message 
    });
  }
});

export default router;