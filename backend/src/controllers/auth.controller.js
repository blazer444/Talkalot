import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import generateToken from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV  } from "../lib/env.js";


export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Por favor, preencha todos os campos." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
        }

        // checar se o email é valido: regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Por favor, insira um email válido." });
        }

        // Verificar se o usuário já existe
        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Este email já está em uso." });

        // Hash da senha 123456 => jqnfrnv_#$%nefyfb_12376
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        // Criar novo usuário
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        })

        if (newUser) {
            generateToken(newUser._id, res)
            await newUser.save();

            //Se o usuario persistir, retornar os dados do usuario
            const savedUser = await newUser.save();
            generateToken(savedUser._id, res);

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });

            try {
                await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
            } catch (error) {
                console.error("Erro ao enviar e-mail de boas-vindas:", error);
            }
        } else {
            res.status(400).json({ message: "Dados inválidos." });
        }

    } catch (error) {
        console.log("Erro no controle de cadastro:", error)
        res.status(500).json({ message: "Erro no servidor. Por favor, tente novamente mais tarde." });
     }
};