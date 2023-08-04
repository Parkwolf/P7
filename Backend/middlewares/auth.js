const jwt = require("jsonwebtoken");
require("dotenv").config();

//as many issues may occur, all code will be in try...catch block
module.exports = (req, res, next) => {
  try {
    //get token from req's authorization header
    //excludes the word Bearer
    const token = req.headers.authorization.split(" ")[1];
    //decode token
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    //get user id from token and add it to request object for further uses
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(403).json({ error });
  }
};
