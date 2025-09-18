import { itensInicio } from "./inicio.ts";

export const _itens = {
    ...itensInicio,
} as const;

export type ItemTipo = keyof typeof _itens;
