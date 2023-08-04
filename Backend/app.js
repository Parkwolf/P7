const express = require("express");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config();

//routes
const booksRoutes = require("./routes/books");
const userRoutes = require("./routes/user");
const rateLimit = require("express-rate-limit");

//express
const app = express();

//rate limit prevents brute force attacks on all app
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

//CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

//connect to database mongoDB
mongoose
  .connect(
    `mongodb+srv://Park:cathy971@cluster0.hfknssn.mongodb.net/?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(express.json());

//helmet and sanitize prevent database injections
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);
app.use(
  helmet({
    xDownloadOptions: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
// Apply the rate limiting middleware to all API calls
app.use("/api/", limiter);

//routes urls
app.use("/api/books", booksRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
