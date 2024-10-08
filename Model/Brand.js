import { model, Schema } from "mongoose";

import slugify from "slugify";

const brandSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      minLength: [2, "short Brand Name "],
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    logo: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    subCategoryId: {
      type: Types.ObjectId,
      ref: "SubCategory",
    },
    categoryId: {
      type: Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true, strictQuery: true } // filter only with this schema fields
);

brandSchema.pre("save", function (next) {
  if (this._update.name) {
    this._update.slug = slugify(this.name, { lower: true });
  }
  next();
});

brandSchema.pre("updateMany", function (next) {
  if (this._update.name) {
    this._update.slug = slugify(this.name, { lower: true });
  }
  next();
});

brandSchema.pre(/find/, function (next) {
  this.populate("image", "path");
  next();
});

brandSchema.pre(/delete/i, async function (next) {
  console.log(this._conditions);
  const brandToBeDeleted = await Brand.find(this._conditions)
  if (!brandToBeDeleted) return next()
  // delete image doc from image model
  await model('image').findByIdAndDelete(brandToBeDeleted.image);

  next();
});

brandSchema.pre(/update/i, async function (next) {
  if (!this._update.image) return next()

  console.log(this._conditions);
  const brandToBeUpdated = await Brand.find(this._conditions)
  if (!brandToBeUpdated) return next()
  // delete image doc from image model
  await model('image').findByIdAndDelete(brandToBeUpdated.image);

  next();
});

const Brand = model("Brand", brandSchema);

export default { Brand };
