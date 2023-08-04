const express = require("express");
const router = express.Router();
const multer = require("../middleware/multer-config");

const auth = require("../middleware/auth");
const booksCtrl = require("../controllers/books");

router.get("/", booksCtrl.getAllBooks);
router.get("/bestrating", booksCtrl.getBestRatings);
router.post("/", auth, multer.upload, multer.optimize, booksCtrl.createBook);
router.get("/:id", booksCtrl.getOneBook);
router.put("/:id", auth, multer.upload, multer.optimize, booksCtrl.modifyBook);
router.delete("/:id", auth, booksCtrl.deleteBook);
router.post("/:id/rating", auth, booksCtrl.ratingBook);

module.exports = router;
