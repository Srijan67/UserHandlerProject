const Register = require("../models/register");
const jwt = require("jsonwebtoken");

const auth = async function (req, res, next) {
  try {
    const token = req.cookies.jwt;
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    console.log(verifyToken);
    const user = await Register.findOne({ _id: verifyToken._id });
    console.log(user.firstname);
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
module.exports = auth;
