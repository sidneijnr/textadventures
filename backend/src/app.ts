import "dotenv/config";
import express from "express";
import cors from "cors";

import routes from "./routes/index.ts";

const app = express();

// ========================================
//             Configuração Cors
// ========================================
let CORS_ORIGINS = process.env.CORS_ORIGINS?.split(",");
if(!CORS_ORIGINS || CORS_ORIGINS.length === 0) {
    throw new Error("ENV CORS_ORIGINS não definido!");
}

// https://www.better-auth.com/docs/integrations/express#cors-configuration
app.use(cors({
    origin: (origin, callback) => {
        // https://www.npmjs.com/package/cors#configuring-cors-w-dynamic-origin
        if(!origin || CORS_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: Não permitido para esta origem: ${origin}`));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // Com Bearer token é necessário permitir o cabeçalho Authorization
    credentials: true, // Se utilizar cookies, habilitar isso
    // maxAge: 86400, // Cache the preflight response for 24 hours?
}));


// habilitando o uso de json pelo express
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Passando para o arquivo de rotas o app, que envia junto uma instância do express
routes(app);

export default app;