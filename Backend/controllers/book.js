const Book = require("../models/Book");
const fs = require("fs");

//ajout de livre
exports.createBook = (req, res, next) => {
  //form-data to object
  const bookObject = JSON.parse(req.body.book);
  // création livre
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    ratings: [],
    averageRating: 0,
    //récupération de l'url
    imageUrl: `${req.protocol}://${req.get("host")}/images/opt_${
      req.file.filename
    }`,
  });
  //sauvegarde livre
  book
    .save()
    .then(() => res.status(201).json({ message: "Book successfully created" }))
    .catch((error) => res.status(400).json({ error }));
};

// prendre un livre spécifique
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

// rating livre
exports.ratingBook = (req, res, next) => {
  const updatedRating = {
    userId: req.auth.userId,
    grade: req.body.rating,
  };
  //check rating range
  if (updatedRating.grade < 0 || updatedRating.grade > 5) {
    return res.status(400).json({ message: "rating must be between 0 and 5" });
  }
  // trouver un livre
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      //check if user already rated the book
      if (book.ratings.find((r) => r.userId === req.auth.userId)) {
        return res
          .status(400)
          .json({ message: "User already voted for this book" });
      } else {
        // ajout d'une nouvelle notation dans le tableau
        book.ratings.push(updatedRating);
        //calcul moyen du rating
        //no need to go through all array, sum of ratings is average rating * rating length (minus the new rate that is added)
        book.averageRating =
          (book.averageRating * (book.ratings.length - 1) +
            updatedRating.grade) /
          book.ratings.length;
        return book.save();
      }
    })
    .then((updatedBook) => res.status(201).json(updatedBook))
    .catch((error) => res.status(400).json({ error }));
};

//modification livre
exports.modifyBook = (req, res, next) => {
  //is there a new picture ?
  const bookObject = req.file
    ? {
        //process image if there is one
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/opt_${
          req.file.filename
        }`,
      }
    : { ...req.body }; //if not, simply get the data
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      //check user
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "403: unauthorized request" });
      } else {
        //update book corresponding to params id, with the data collected in bookObject
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => {
            res.status(200).json({ message: "book successfully updated" });
            //delete old file
            const oldFile = book.imageUrl.split("/images")[1];
            req.file &&
              fs.unlink(`images/${oldFile}`, (err) => {
                if (err) console.log(err);
              });
          })
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

//#### delete a book ####
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      //check if user is the owner of the book
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "403: unauthorized request" });
      } else {
        Book.deleteOne({ _id: req.params.id })
          .then(() => {
            res.status(200).json({ message: "Deleted!" });
            //get file name after path
            const filename = book.imageUrl.split("/images/")[1];
            //unlink from fs package delete the file then execute callback to delete the book in database
            fs.unlink(`images/${filename}`, (err) => {
              if (err) console.log(err);
            });
          })
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

//#### get all books ####
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

//#### get best 3 best rated books ####
exports.getBestRatings = (req, res, next) => {
  Book.find()
    //sort by descending order
    .sort({ averageRating: -1 })
    //keep the first 3 books (best)
    .limit(3)
    //return array of 3 best rated books
    .then((bestBooks) => res.status(200).json(bestBooks))
    .catch((error) => res.status(400).json({ error }));
};
