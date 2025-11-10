// ✅ Minimal httpClient replacement using axios
import axios from "axios";

const API_BASE = "https://studyhub-21ux.onrender.com/api";

const httpClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export default httpClient;

