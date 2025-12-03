import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        todoLists: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "TodoList",
            },
        ],
        dateCreated: {
            type: Date,
        }
    },
    { timestamps: true }
);

export default mongoose.models.Collection || mongoose.model("Collection", CollectionSchema);