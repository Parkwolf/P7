const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const bookSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true, unique: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: [{ userId: String, grade: Number }],
    averageRating: {
      type: Number,
      //mise en place du calcul de la note moyenne
      get: function (v) {
        // valeur actuelle du average rating
        return Math.round(v * 10) / 10; //multuplier la note par 10
      },
      required: true,
    },
    // arrondie à une décimale pour une meilleure lisibilité
  },
  { toJSON: { getters: true } }
);

bookSchema.plugin(uniqueValidator); // vérifie unique true

module.exports = mongoose.model("Book", bookSchema);
