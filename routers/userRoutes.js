const router = require('express').Router()
const bcryptJs = require('bcryptjs')

const User = require('../models/user')

const verifyToken = require('../helpers/checkToken')
const getUserToken = require('../helpers/getToken')

router.get("/:id", verifyToken, async (req, res) => {
    const id = req.params.id

    try {
        const user = await User.findOne({ _id: id }, { password: 0 })
        res.json({ error: null, user })

    } catch (error) {
        return res.status(400).json({ error: "O usuário não existe!" })

    }
})

router.patch("/", verifyToken, async (req, res) => {

    const token = req.header("auth-token")
    const user = await getUserToken(token)

    const userReqId = req.body.id
    const password = req.body.password
    const confirmPass = req.body.confirmPass

    const userId = user._id.toString()

    //check user id é igual a token user id
    if (userId != userReqId) {
        return res.status(401).json({ error: "Acesso negado!" })
    }

    // update de usuario
    const updateData = {
        name: req.body.name,
        email: req.body.email
    }

    // check password
    if (password != confirmPass) {
        return res.status(401).json({ error: "Senhas precisam ser iguais!" })
    }
    // change password
    else if (password == confirmPass && password != null) {
        const salt = await bcryptJs.genSalt(12)
        const passwordHash = await bcryptJs.hash(password, salt)

        //add password
        updateData.password = passwordHash

    }

    try {

        const updatedUser = await User.findOneAndUpdate({ _id: userId }, { $set: updateData }, { new: true })

        return res.json({ error: null, msg: "Usuário atualizado com sucesso!", data: updatedUser })


    } catch (error) {
        res.status(400).json({ error })
    }

})

module.exports = router