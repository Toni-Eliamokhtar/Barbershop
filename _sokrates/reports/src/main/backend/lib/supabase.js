import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY 
);

// Helper: create a booking in Supabase
export async function createBooking(booking) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert([{ ...booking, paid: false }])
      .select()
      .single();
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

// Helper: mark booking as paid
export async function markBookingPaid(bookingId, paymentInfo = {}) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({ paid: true, payment_info: paymentInfo })
      .eq("id", bookingId)
      .select()
      .single();
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}
