const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
    {
        title: {
            type: String, 
            required: true, 
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },

        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: false,
        },
        
        // 3 Kriteria Gamelab
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        archived: {
            type: Boolean,
            default: false,
        },

        //Ngide Sendiri
        completed: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
); 

module.exports = mongoose.model("Todo", todoSchema);