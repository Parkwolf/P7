const User = require("..models/User");

exports.signup = (req, res, next) => {
  const { email, password } = req.body;

  // //check email
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (emailRegex.test(email) === false) {
    return res.status(400).json({ message: "email non valide" });
  }

  //check password length
  if (password.length < 5) {
    return res
      .status(400)
      .json({ message: "Le mot de passe doit avoir au minimum 5 caractères" });
  }

  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user === null) {
        res
          .status(401)
          .json({
            message: "Les informations de connection sont incorrectes.",
          });
      } else {
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              res
                .status(401)
                .json({
                  message: "Les informations de connection sont incorrectes.",
                });
            } else {
              res.status(200).json({
                userId: user._id,
                token: jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
                  expiresIn: "24h",
                }),
              });
            }
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
