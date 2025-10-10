import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

const generateToken = (userId, res) => {
    const token = jwt.sign({userId},ENV.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //milissegundos
        httpOnly: true, //previne Ataques XSS : Cross-site Scripting
        sameSite: "strict", //previne Ataques CSRF : Cross-site Request Forgery
        secure: ENV.NODE_ENV !== "production", //https
    });

    return token;
};

export default generateToken;