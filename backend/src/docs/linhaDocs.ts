export const linhaDocs = {
    "/linha": {
        post: {
            summary: "Envia um comando para o jogo",
            description: "Envia um comando para o jogo e recebe a resposta.",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                texto: {
                                    type: "string",
                                    example: "olhar",
                                    description: "O comando a ser enviado para o jogo.",
                                },
                            },
                            required: ["texto"],
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Resposta do jogo",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    resposta: {
                                        type: "string",
                                        example: "Você está em uma sala escura. Há uma porta à frente.",
                                        description: "A resposta do jogo ao comando enviado.",
                                    },
                                },
                                required: ["resposta"],
                            },
                        },
                    },
                },
            },
        }
    }
};