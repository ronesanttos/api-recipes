const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT

// routers
const authRouter = require('./routers/authRoutes')
const userRouter = require('./routers/userRoutes')
const recipeRouter = require('./routers/recipeRoutes')
//check token 
const verifyToken = require('./helpers/checkToken')

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

//routers express
app.use('/api/auth', authRouter)
app.use('/api/user', verifyToken, userRouter)
app.use('/api/recipe', recipeRouter)

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
    } catch (error) {
        console.log("Connection failed")
    }
}

connectDB().catch(console.dir)

app.get('/', (req, res) => {
    res.json({ msg: "Api receitas Ok!" })
})

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`)
})

// corrigir erros ortograficos antes de postar