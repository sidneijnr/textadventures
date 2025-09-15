import { type RequestHandler } from "express";

export const logMiddleware: RequestHandler = (req,res,next) => {
    const timestamp = new Date().toISOString();

    let ip = req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    null;

    console.log(timestamp+" "+ip+" "+req.protocol + "://" + req.get("host") + " " + req.method + " " + req.originalUrl);
    // Log Headers
    //console.log(JSON.stringify(req.headers));
    next();
};