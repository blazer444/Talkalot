import mongoose from "mongoose"
import { ENV } from "./env.js";

export const connectDB = async () => {
    try {
        if (!ENV.MONGO_URI) {
            throw new Error("MONGO_URI não está definido nas variáveis de ambiente.");
        }
        const conn = await mongoose.connect(ENV.MONGO_URI);
        console.log("MONGODB CONECTADO: ", conn.connection.host)
    } catch (error) {
        // ...
    }
}