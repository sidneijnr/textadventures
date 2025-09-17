import { type Estado } from "../../db/estadoSchema.ts";
import { Contexto, type SalaType } from "../contexto.ts";
import type { ItemTipo } from "../itens/itens.ts";
import { salasInicio } from "./inicio.ts";

export const _salas = {
    ...salasInicio,
    Global: {
        descricao: () => "Lógica global que afeta todas as salas. Impossível de acessar diretamente.",
        conexoes: {},
        estadoInicial: {}
    }
} as const;

export type SalaNome = keyof typeof _salas;
export const salas: Record<SalaNome, SalaType<SalaNome, ItemTipo>> = _salas;

export const getSalaConfig = (salaId: SalaNome) => {
    let salaConfig = salas[salaId];
    if(!salaConfig) {
        throw new Error(`Sala com id ${salaId} não existe na configuração do jogo!`);
    }
    return salaConfig;
}