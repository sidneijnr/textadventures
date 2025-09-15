import { Estado } from "../../db/estadoSchema.ts";
import { Contexto, SalaType } from "../contexto.ts";
import { salasInicio } from "./inicio.ts";

export const salas: Record<string, SalaType> = {
    ...salasInicio,
    Global: {
        descricao: () => "Lógica global que afeta todas as salas. Impossível de acessar diretamente.",
        conexoes: {},
        estadoInicial: {}
    }
};

export const getSalaConfig = (salaId: string) => {
    let salaConfig = salas[salaId];
    if(!salaConfig) {
        throw new Error(`Sala com id ${salaId} não existe na configuração do jogo!`);
    }
    return salaConfig;
}