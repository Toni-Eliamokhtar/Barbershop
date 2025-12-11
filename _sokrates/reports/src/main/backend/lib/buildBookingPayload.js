export function buildBookingPayload({
    barberId,
    serviceId,
    date,
    time,
    userEmail,
    userName,
    barberName,
    serviceName,
}) {
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
