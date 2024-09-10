const { Schema, Types, model, default: mongoose } = require("mongoose");

const categorySchema = new Schema(
  {
    name: {
      type: String,
      unique: [true, "Category Name already Exisit "],
      trim: true,
      maxLength: 50,
      minLength: [2, "short Category Name "],
      required: true,
    },
    image: {
      url: String,
      publicId: String,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory", 
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Category = model("Category", categorySchema);

module.exports = Category