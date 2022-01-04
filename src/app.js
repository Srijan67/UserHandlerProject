const express = require("express");
const mongoose = require("mongoose");
const hbs = require("hbs");
const path = require("path");
const Register = require("./models/register");
const { urlencoded } = require("express");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
require("./db/conn");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//path
const path1 = path.join(__dirname, "../public");
const partialsPath = path.join(__dirname, "../templates/partials");
const templatesPath = path.join(__dirname, "../templates/views");

app.use(express.static(path1));

app.set("view engine", "hbs");
app.set("views", templatesPath);
hbs.registerPartials(partialsPath);

const port = process.env.PORT || 3000;

//routing
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/secret", auth, (req, res) => {
  // console.log(req.cookies.jwt);
  res.render("secret");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/logout", auth, async (req, res) => {
  try {
    //Cookie parser revision required**
    //for single logout
    req.user.tokens = req.user.tokens.filter((currElement) => {
      return req.token !== currElement.token;
    });
    //for all users log out
    req.user.tokens = [];
    res.clearCookie("jwt");
    console.log("logout successfully");
    await req.user.save();
    res.render("login");
  } catch (error) {
    console.log("this is logout error: " + error);
    res.status(500).send(error);
  }
});
app.post("/register", async (req, res) => {
  try {
    if (req.body.password === req.body.cpassword) {
      const registerValue = new Register({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        phone: req.body.phone,
        age: req.body.age,
        gender: req.body.gender,
        password: req.body.password,
        confirmpassword: req.body.cpassword,
      });
      const token = await registerValue.generateAuthToken();
      const Registered = await registerValue.save();
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 20000),
        httpOnly: true,
      });
      res.status(201).render("index", { demo: req.body.firstname + "." });
    } else {
      res.status(404).send("Password does not match. Kindly retry!");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Some Error Occur. Kindly retry! \n" + error);
  }
});
app.post("/login", async (req, res) => {
  try {
    const checkUser = await Register.findOne({ email: req.body.email });
    const loginToken = await checkUser.generateAuthToken();
    const compare = await bcrypt.compare(req.body.password, checkUser.password);
    console.log(`this is token generated: ${loginToken}`);
    res.cookie("jwt", loginToken, {
      expires: new Date(Date.now() + 300000),
      httpOnly: true,
    });
    // console.log(req.cookies.jwt);
    if (compare) {
      res.render("index", { demo1: checkUser.firstname + ". " });
    } else {
      res.status(400).send("Invalid Password!");
    }
  } catch (error) {
    res.status(400).send("Invalid Login Credentials!");
  }
});

app.listen(port, () => {
  console.log("localhost is visible at port: " + port);
});
