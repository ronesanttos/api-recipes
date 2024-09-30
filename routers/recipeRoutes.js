const router = require('express').Router()
const jwt = require('jsonwebtoken')

const Recipe = require('../models/recipe')
const User = require('../models/user')

//check token
const verifyToken = require('../helpers/checkToken')
const getUserToken = require('../helpers/getToken')

router.post('/', verifyToken, async (req, res) => {
    const title = req.body.title
    const description = req.body.description
    const category = req.body.category
    const ingredients = req.body.ingredients
    const preparation_method = req.body.preparation_method

    const photo = req.body.photo

    if (title == "null" || description == "null" || ingredients == "null" || preparation_method == "null") {
        res.status(400).json({ error: "Titulo, descrição, ingredientes e o modo de preparo são campos obrigatórios!" })
    }

    const token = req.header("auth-token")
    const userToken = await getUserToken(token)

    const userId = userToken._id.toString()

    try {
        const user = await User.findOne({ _id: userId })

        const recipe = new Recipe({
            title: title,
            description: description,
            category: category,
            ingredients: ingredients,
            preparation_method: preparation_method,
            photo: photo,
            userId: user._id.toString()
        })
        try {
            const newRecipe = await recipe.save()
            res.json({ error: null, msg: "Receita criada com sucesso!", data: newRecipe })

        } catch (error) {
            return res.status(400).json({ error })
        }
    }
    catch (err) {
        return res.status(400).json({ error: "Acesso negado!" })
    }
})

router.get('/all', async (req, res) => {
    try {
        const recipe = await Recipe.find({}).sort([['_id', -1]])
        return res.json({ error: null, recipes: recipe })

    } catch (error) {
        return res.status(400).json({ error })
    }
})


//  receitas do usuario
router.get("/user_recipes", verifyToken, async (req, res) => {
    try {
        const token = req.header("auth-token")
        const user = await getUserToken(token)
        const userId = user._id.toString()

        const recipe = await Recipe.find({ userId: userId })

        return res.json({ error: null, recipes: recipe })

    } catch (error) {
        return res.status(400).json({ error })
    }
})

// recitas privadas por id
router.get('/user_recipes/:id', verifyToken, async (req, res) => {
    try {
        const token = req.header("auth-token")
        const user = await getUserToken(token)

        const userId = user._id.toString()
        const recipeId = req.params.id

        const recipe = await Recipe.findOne({ _id: recipeId, userId: userId })

        return res.json({ error: null, recipe: recipe })

    } catch (error) {
        return res.status(400).json({ error })
    }
})


// receitas publicas ou do usuario por id

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id
        const recipe = await Recipe.findOne({ _id: id })

        if (recipe) {
            res.json({ error: null, recipe: recipe })
        }

        else {
            const token = req.header("auth-token")
            const user = await getUserToken(token)

            const userId = user._id.toString()
            const recipeUserId = recipe.userId.toString()

            if (userId == recipeUserId) {
                res.json({ error: null, recipe: recipe })
            }

        }
    } catch (error) {
        return res.status(400).json({ error: "Receita não encontrado!" })
    }
})

//deletar receita
router.delete('/', verifyToken, async (req, res) => {
    const token = req.header("auth-token")
    const user = await getUserToken(token)

    const recipeId = req.body.id
    const userId = user._id.toString()

    try {
        await Recipe.deleteOne({ _id: recipeId, userId: userId })

        return res.json({ error: null, msg: "Receita deletada com sucesso!" })

    } catch (error) {
        return res.status(400).json({ error: "Acesso negado!" })
    }

})

//atualizar receita
router.patch('/:id', verifyToken, async (req, res) => {
    const id = req.params.id
    const title = req.body.title
    const description = req.body.description
    const category = req.body.category
    const ingredients = req.body.ingredients
    const preparation_method = req.body.preparation_method
    const photo = req.body.photo

    //validacoes
    if (title == "null" || description == "null") {
        return res.status(400).json({ error: "Titulo e descrição são obrigatórios!" })
    }

    //validate recipe
    const recipes = await Recipe.findOne({ _id: id })

    const token = req.header("auth-token")
    const userToken = await getUserToken(token)
    const userId = userToken._id.toString()

    if (id != recipes._id) {
        return res.status(400).json({ error: "Acesso negado!" })
    }

    //atualizar dados
    const recipe = {
        id: id,
        title: title,
        description: description,
        category: category,
        ingredients: ingredients,
        preparation_method: preparation_method,
        photo: photo,
        userId: userId
    }

    try {


        const updateRecipe = await Recipe.findOneAndUpdate({ _id: id }, { $set: recipe }, { new: true })

        return res.json({ error: null, msg: "Atualizado com sucesso!", data: updateRecipe })

    } catch (error) {
        res.status(400).json({ error })
    }
})

module.exports = router