import { onRequest } from "firebase-functions/v2/https";
import app from "./server.js";

// Exportamos la función con el nombre que definimos en firebase.json
export const api = onRequest({
  region: "us-east1", // Usamos la misma región que la DB si es posible
  memory: "256MiB",
}, app);
