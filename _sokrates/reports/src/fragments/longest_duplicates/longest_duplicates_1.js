frontend/user-app/src/App.js [6:20]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
        console.log("✅ Connexion Supabase OK, exemple :", data);
        setStatus("✅ Supabase connecté !");
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



frontend/user-app/src/pages/Home.jsx [9:23]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
        console.log("✅ Connexion Supabase OK, exemple :", data);
        setStatus("✅ Supabase connecté !");
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



