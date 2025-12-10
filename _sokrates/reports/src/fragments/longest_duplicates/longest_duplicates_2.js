backend/routes/booking.js [127:138]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



backend/routes/booking.js [232:243]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



