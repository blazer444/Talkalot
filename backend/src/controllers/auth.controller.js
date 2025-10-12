import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import generateToken from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";


export const singup = async (req, res) => {
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

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Por favor, preencha todos os campos." });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Credenciais inválidas." });
        // Nunca dizer ao usuario qual está incorreto, para não dar pistas a um possível invasor
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Credenciais inválidas." });

        generateToken(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error("Erro no controle de login:", error);
        res.status(500).json({ message: "Erro no servidor. Por favor, tente novamente mais tarde." });
    }
};

export const logout = (_, res) => {
    res.cookie("jwt", "", { maxAge: 0 })
    res.status(200).json({ message: "Logout realizado com sucesso." });
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        if (!profilePic) return res.status(400).json({ message: "Foto de perfil é necessária." });

        const userId = req.user._id;

        const uploadResponse = await cloudinary.uploader.upload(profilePic,);

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { profilePic: uploadResponse.secure_url }, { new: true }
        );

        res.status(200).json(updatedUser)
    } catch (error) {
        console.log("Erro ao atualizar o perfil:", error);
        res.status(500).json({ message: "Erro no servidor. Por favor, tente novamente mais tarde." });
     }
};