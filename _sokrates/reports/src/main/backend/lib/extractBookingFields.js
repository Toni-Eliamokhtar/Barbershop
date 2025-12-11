export function extractBookingFields(body) {
    const {
        barberId,
        serviceId,
        date,
        time,
        userEmail,
        userName,
        barberName,
        serviceName,
    } = body;

    return {
        barberId,
        serviceId,
        date,
        time,
        userEmail,
        userName,
        barberName,
        serviceName,
    };
}
