import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { EntidadeController } from "../controllers/entidadeController.ts";

export const getEntidadeRouter = () => {
    const router = express.Router();

    router.post("/entidade/acao", authMiddleware, EntidadeController.acaoEntidade);

    return router;
};