export const logRoutes = (req,res,next) => {
	const timestamp = new Date().toISOString();

	let ip = req.headers["x-forwarded-for"] ||
	req.socket.remoteAddress ||
	null;

	console.log(timestamp+" "+ip+" "+req.protocol + "://" + req.get("host") + req.originalUrl);
	// Log Headers
	//console.log(JSON.stringify(req.headers));
	next();
};

const routes = (app) => {

	// só fazer log das rotas se estiver em desenvolvimento, desativar em produção
	if(process.env.DEBUGLOG === "true") {
		app.use(logRoutes);
	}

	// app.get("/",(req, res) => {
	// 	res.status(200).redirect("docs/docs.html"); // redirecionando para documentação
	// });
    // app.use("/docs", swaggerRoute);

	app.use((req, res, next) => {
        res.status(200).json({ message: "FUNCIONOU!" });
    })

	app.use((req,res,next) => {
		res.sendStatus(404);
	});

	// Por último o middleware de tratamento de erros
	app.use((error, req, res, next) => {
		console.error(error);
		if(!res.headersSent) {
			res.status(500).json({ error: "Internal Server Error", message: error.message });
		}
	});
};

export default routes;