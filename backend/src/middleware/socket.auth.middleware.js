import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.headers.cookie
            ?.split("; ")
            .find((row) => row.startsWith("jwt="))
            ?.split("=")[1];

        if (!token) {
            console.log("Conexão do socket rejeitada - Nenhum token fornecido");
            return next(new Error("Desautorizado - Nenhum token fornecido"));
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded) {
            console.log("Conexão do socket rejeitada - Token Invalido");
            return next(new Error("Desautorizado - Token Invalido"));
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            console.log("Conexão do socket rejeitada - usúario não encontrado");
            return next(new Error("Usuario não encontrado"));
        }

        socket.user = user;
        socket.userId = user._id.toString();

        console.log(`Autenticação do socket para user: ${user.fullName} (${user._id})`);

        next();
    } catch (error) {
        console.log("Error na autenticação do socket:", error.message);
        next(new Error("Desautorizado - Error na autenticação"));
    }
};