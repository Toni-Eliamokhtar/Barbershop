backend/email.js [4:10]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



backend/routes/booking.js [49:55]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



