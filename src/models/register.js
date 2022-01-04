const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const registerSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    lowercase: true,
  },
  lastname: {
    type: String,
    required: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate(val) {
      if (!validator.isEmail(val)) {
        console.log("invalid email");
        throw new Error("Invalid Email");
      }
    },
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
    min: 10,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

//Generation of jws token
registerSchema.methods.generateAuthToken = async function (req, res) {
  try {
    const token = await jwt.sign({ _id: this.id }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

//converting password into hash
registerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    this.confirmpassword = await bcrypt.hash(this.confirmpassword, 10);
  }
  next();
});
//model
const Register = new mongoose.model("Register", registerSchema);

module.exports = Register;
