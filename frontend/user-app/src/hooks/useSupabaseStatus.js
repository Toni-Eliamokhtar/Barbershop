import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function useSupabaseStatus() {
    const [status, setStatus] = useState("⏳ Connexion à Supabase...");

    useEffect(() => {
        async function testConnection() {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .limit(1);

            if (error) {
                console.error("❌ Erreur Supabase :", error.message);
                setStatus("❌ Erreur de connexion à Supabase");
            } else {
                console.log("✅ Supabase connecté :", data);
                setStatus("✅ Supabase connecté !");
            }
        }

        testConnection();
    }, []);

    return status;
}
