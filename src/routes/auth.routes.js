import { Router } from "express";
import { users } from "../data/users.js";

const router = Router();

router.post("/register", (req, res) => {
  const { nome, email, senha } = req.body;

  const existe = users.find((u) => u.email === email);
  if (existe) {
    return res.status(400).json({ error: "Usuário já existe" });
  }

  const user = { id: Date.now(), nome, email, senha };
  users.push(user);

  res.status(201).json(user);
});

router.post("/login", (req, res) => {
    console.log("TESTE BACasdasdKEND");
    const { email, senha } = req.body;

    const user = users.find(
        (u) => u.email === email && u.senha === senha
    );

    if (!user) {
        return res.status(401).json({ error: "Credenciais inválidas" });
    }

    res.json(user);
});

export default router;

