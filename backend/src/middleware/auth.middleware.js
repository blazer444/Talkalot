import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.status(401).json({ message: "Acesso negado. Token não fornecido." })

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded) return res.status(401).json({ message: "Token inválido." })

        const user = await User.findById(decoded.userId).select("-password")
        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

        req.user = user
        next();
    } catch (error) {
        console.error("Erro na autenticação do usuário:", error);
        res.status(500).json({ message: "Erro no servidor." });
    };
};