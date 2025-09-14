export const salasInicio = {
    Inicio: {
        descricao: () => "Você está na entrada de uma floresta. Há caminhos para o NORTE e para o LESTE.",
        conexoes: {
            "N": () => "Fim",
            "L": () => "Inicio"
        }
    },
    Fim: {
        descricao: () => "Parabéns! Você chegou ao fim do jogo. Você pode voltar para o SUL para recomeçar.",
        conexoes: {
            "S": () => "Inicio"
        }
    }
};