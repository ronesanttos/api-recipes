const router = require('express').Router()
const bcryptJs = require("bcryptjs")
const jwt = require('jsonwebtoken')
require('dotenv').config()

// env
const Token = process.env.TOKEN

const User = require('../models/user')

//register

router.post("/register", async (req, res) => {

    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const confirmPass = req.body.confirmPass

    try {

        if (name == null || email == null || password == null || confirmPass == null) {
            return res.status(400).json({ error: "Preencha todos os campos!" })
        }

        //valida senha
        if (password != confirmPass) {
            return res.status(400).json({ error: "As senhas precisam ser iguais!" })
        }

        //valida e-mail
        const emailExists = await User.findOne({ email: email })

        if (emailExists) {
            return res.status(400).json({ error: "Este e-mail já está em uso!" })
        }

        //criar senha 

        const salt = await bcryptJs.genSalt(12)
        const reqPassword = req.body.password

        const passwordHash = await bcryptJs.hash(reqPassword, salt)

        const user = new User({
            name: name,
            email: email,
            password: passwordHash
        })
        const newUser = await user.save()

        //criar token
        const token = jwt.sign({
            name: newUser.name,
            id: newUser._id,
        },
            Token
        )

        res.json({ error: null, msg: "Usuário cadastrado com succeso!", token: token, userId: newUser._id })

    } catch (error) {
        res.status(400).json({ error })
    }
})


//login

router.post("/login", async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    const user = await User.findOne({ email: email })

    // checar se usuário existe
    if (!user) {
        return res.status(400).json({ error: "Não há usuário cadastrado neste e-mail!" })
    }

    //checar se senha esta correta
    const checkPassword = await bcryptJs.compare(password, user.password)

    if (!checkPassword) {
        return res.status(400).json({ error: "Senha incorreta!" })
    }

    try {

        //criar token
        const token = jwt.sign({
            name: user.name,
            id: user._id,
        },
            Token
        )

        res.json({ error: null, msg: "Você está autenticado!", token: token, userId: user._id })

    } catch (error) {
        res.status(400).json({ error })
    }
})

module.exports = router