require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const shortid = require("shortid");
const validUrl = require("valid-url");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

mongoose.connect(
  "mongodb+srv://user1:user1@url.s2lxgqk.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: { type: String },
  short_url: { type: String },
});
const Url = mongoose.model("Url", urlSchema);

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;

  const short_url = Math.random().toString(10).slice(2, 5);

  if (!validUrl.isWebUri(url)) {
    return res.json({ error: "invalid url" });
  }

  const newUrl = new Url({ original_url: url, short_url: short_url });
  try {
    newUrl.save().then((data) => {
      return res.json({
        original_url: data.original_url,
        short_url: data.short_url,
      });
    });
  } catch (err) {
    return res.send("Error saving to database");
  }
});

app.get("/api/shorturl/:short_url", async function (req, res) {
  try {
    const urlParams = await Url.findOne({ short_url: req.params.short_url });
    if (urlParams) {
      return res.redirect(urlParams.original_url);
    } else {
      return res.send("Invalid short URL");
    }
  } catch (err) {
    return res.send("Error reading database");
  }
});
