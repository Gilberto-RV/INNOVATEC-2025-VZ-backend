// models/Category.js
import mongoose from "mongoose";

const CategoriesSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    enum: ["cultural", "deportiva", "academica", "social", "otro"], // puedes extender
  },
  descripcion: {
    type: String,
  }
}, { timestamps: true });

export default mongoose.model("Categories", CategoriesSchema);
