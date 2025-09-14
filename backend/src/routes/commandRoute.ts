import express from "express";
import { db } from "../config/drizzle.ts";
import { users } from "../db/userSchema.ts";

export const getCommandRouter = () => {
    const router = express.Router();
    
    router.post("/command", async (req, res) => {
        const { command } = req.body;

        if (typeof command !== "string") {
            return res.status(400).json({ error: "Comando inválido" });
        }

        // Exemplo de uso do Drizzle ORM
        if(command) {
            await db.insert(users).values({ 
                fullName: command,
                phone: "(99) 99999-9999"
            });
        }
        const result = await db.select()
            .from(users)
            .limit(100)
            .orderBy(users.fullName);

        res.json({ 
            response: `Comando recebido: ${command}`,
            users: result
        });
    });
    
    return router;
};