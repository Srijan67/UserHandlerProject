const mongoose = require("mongoose");
require("dotenv").config();
mongoose
  .connect(process.env.DATABASE_NAME)
  .then(() => {
    console.log("connection successfully established!");
  })
  .catch((e) => console.log(e));
