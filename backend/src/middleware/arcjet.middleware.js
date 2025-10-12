import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
    try {
        const decision = await aj.protect(req);

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ message: "Limite de solicitações excedida. Tente novamente mais tarde.." });
            }
            else if (decision.reason.isBot()) {
                return res.status(403).json({ message: "Acesso negado." });
            } else {
                return res.status(403).json({ message: "Acesso negado por política de segurança." });

            }
        }

        //Checagem para spoofed bots
        if (decision.results.some(isSpoofedBot)) {
            return res.status(403).json({ 
                error: "Spoofed bots detected",
                message: "Atividade de bot malicioso detectado." ,
            });
        }

        next();
    } catch (error) {
        console.error("Arcjet Protection error:", error);
        next();
    }
};