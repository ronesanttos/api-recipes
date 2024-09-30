const mongoose = require('mongoose')

const RecipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: Array
    },
    photo: {
        type: String
    },
    ingredients: {
        type: Array
    },
    preparation_method: {
        type: Array
    },
    userId: {
        type: mongoose.ObjectId
    }
})

const Recipe = mongoose.model("Recipe", RecipeSchema)

module.exports = Recipe