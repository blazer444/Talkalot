import express from 'express';

const router = express.Router();

router.get("/singup", (req, res) => {
    res.send("Singup endpoint");
});

router.get("/login", (req, res) => {
    res.send("Login endpoint");
});

router.get("/logout", (req, res) => {
    res.send("Logout endpoint");
});


export default router;