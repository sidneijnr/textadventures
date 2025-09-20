import express from "express";
import { SalaController } from "../controllers/salaController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";

export const getSalaRouter = () => {
    const router = express.Router();
    
    router.get("/sala/olhar", authMiddleware, SalaController.descreverSalaAtual);
    router.post("/sala/acao", authMiddleware, SalaController.executarAcao);
    
    return router;
};