import { Entidade } from "../../db/entidadeSchema.ts";
import { Estado } from "../../db/estadoSchema.ts";
import { Sala } from "../../db/salaSchema.ts";
import { salasInicio } from "./inicio.js";

export type Contexto = {
    jogador: Entidade;
    sala: Sala;
    global: Sala;
    escreva: (...str: unknown[]) => void;
}

export type SalaType = {
    descricao: (ctx?: Contexto) => undefined | string | Promise<string | undefined>;
    conexoes: { 
        [direcao: string]: (ctx?: Contexto) => undefined | string | Promise<string | undefined>;
    };
    estadoInicial?: Estado;
};

export const salas: Record<string, SalaType> = {
    ...salasInicio
};