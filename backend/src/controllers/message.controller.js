import mongo from "mongoose"
import cloudinary from "../lib/cloudinary.js"
import Message from "../models/Message.js"
import User from "../models/User.js"

export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password")

        res.status(200).json(filteredUsers);

    } catch (error) {
        console.log("Error in getAllContacts:", error);
        res.status(500).json({ message: "Erro no servidor" });
    }
};

export const getMessagesByUserId = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: userToChatId } = req.params

        const message = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        });

        res.status(200).json(message)
    } catch (error) {
        console.log("Error in getMessages controller:", error.message);
        res.status(500).json({ message: "Erro no servidor" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!mongo.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "ID de destinatário inválido" });
        }

        if (senderId.equals(receiverId)) {
            return res.status(400).json({ message: "Não é possível enviar mensagem para si mesmo" });
        }

        if (!text && !image) {
            return res.status(400).json({ message: "Mensagem deve conter texto ou imagem" });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "Destinatário não encontrado" });
        }

        let imageUrl;
        if (image) {
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        res.status(201).json(newMessage);

        //todo: enviar a mensagem em tempo real se o usuario estiver on line (socket.io)

    } catch (error) {
        console.log("Error in sendMessage controller:", error.message);
        res.status(500).json({ message: "Erro no servidor" });
    }
};

export const getChatPartners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Encontre todas as mensagens em que o usuário conectado é o remetente ou o destinatário
        const messages = await Message.find({
            $or: [
                { senderId: loggedInUserId },
                { receiverId: loggedInUserId }
            ]
        });

        const chatPartnersIds = [
            ...new Set(
                messages.map((msg) =>
                    msg.senderId.toString() === loggedInUserId.toString()
                        ? msg.receiverId.toString()
                        : msg.senderId.toString()
                )
            ),
        ];

        const chatPartners = await User.find({ _id: { $in: chatPartnersIds } }).select("-password");

        res.status(200).json(chatPartners);
    } catch (error) {
        console.log("Error in getChatPartners controller:", error.message);
        res.status(500).json({ message: "Erro no servidor" });
    }
};