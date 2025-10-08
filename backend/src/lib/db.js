import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        const { MONGO_URI } = process.env;
        if (!MONGO_URI) throw new Error("MONGO_URI não está definido nas variáveis de ambiente.");
        
        console.log("MONGODB CONECTADO: ", conn.connection.host)
    } catch (error) {
        console.error("Erro de conexão no MONGODB : ", error)
        process.exit(1); // Status 1 indica falha na conexão, 0 significa sucesso
    }
}