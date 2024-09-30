const jwt = require("jsonwebtoken")
require('dotenv').config()

const Token = process.env.TOKEN

const checkToken = (req, res, next) => {

    const token = req.header("auth-token")

    if (!token) {
        return res.status(401).json({ error: "Acesso negado!" })
    }
    try {
        const verified = jwt.verify(token, Token)
        req.user = verified
        next()

    } catch (error) {
        return res.status(400).json({ error: "Token invalido!" })
    }
}

module.exports = checkToken