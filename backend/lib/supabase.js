import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

let supabase;
const users = new Map();
const bookings = [];

if (process.env.NODE_ENV === "test") {
  // minimal in-memory mock used in tests
  supabase = {
    auth: {
      admin: {
        async createUser({ email, password }) {
          const id = `test_${Date.now()}`;
          users.set(email, { id, email, password });
          return { data: { user: { id, email } }, error: null };
        },
      },
      async signInWithPassword({ email, password }) {
        const user = users.get(email);
        if (!user || user.password !== password) {
          return { data: null, error: { message: "Invalid credentials" } };
        }
        const session = { access_token: "test-token", refresh_token: "refresh" };
        return { data: { user: { id: user.id, email: user.email }, session }, error: null };
      },
      async getUser() {
        // simple stub for potential callers
        return { data: { user: null }, error: null };
      },
      async signOut() {
        return { error: null };
      },
    },
    from(table) {
      return {
        async insert(rows) {
          if (table === "bookings") {
            const item = { id: `b_${Date.now()}`, ...rows[0] };
            bookings.push(item);
            return { data: [item], error: null };
          }
          return { data: rows, error: null };
        },
        async select() {
          if (table === "disponibilites_barber") return { data: [], error: null };
          if (table === "bookings") return { data: bookings, error: null };
          if (table === "profiles")
            return {
              data: [
                { id: "barber1", nom: "Alex", email: "alex@barber.com", role: "barber" },
                { id: "barber2", nom: "Sam", email: "sam@barber.com", role: "barber" },
              ],
              error: null,
            };
          return { data: [], error: null };
        },
        async update(obj) {
          const idx = bookings.findIndex((b) => b.id === this._eqId);
          if (idx >= 0) {
            bookings[idx] = { ...bookings[idx], ...obj };
            return { data: bookings[idx], error: null };
          }
          return { data: null, error: new Error("Not found") };
        },
        eq(key, value) {
          this._eqId = value;
          return this;
        },
      };
    },
  };
} else {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

export { supabase };

export async function createBooking(booking) {
  try {
    if (process.env.NODE_ENV === "test") {
      const { data, error } = await supabase.from("bookings").insert([{ ...booking, paid: false }]);
      return { data: data ? data[0] : null, error };
    }

    const { data, error } = await supabase.from("bookings").insert([{ ...booking, paid: false }]).select().single();
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function markBookingPaid(bookingId, paymentInfo = {}) {
  try {
    if (process.env.NODE_ENV === "test") {
      const { data, error } = await supabase.from("bookings").update({ paid: true, payment_info: paymentInfo }).eq("id", bookingId);
      return { data, error };
    }

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
