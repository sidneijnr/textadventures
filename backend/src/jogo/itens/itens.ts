import { type ItemType } from "../contexto.ts";
import { itensInicio } from "./inicio.ts";

const _itens = {
    ...itensInicio,
} as const;

export type ItemTipo = keyof typeof _itens;
export const itens: Record<ItemTipo, ItemType<ItemTipo>> = _itens;

export const getItemConfig = (itemTipo: ItemTipo) => {
    let itemConfig = itens[itemTipo];
    if(!itemConfig) {
        throw new Error(`Item com tipo ${itemTipo} não existe na configuração do jogo!`);
    }

    return itemConfig;
}