const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

mongoose
  .connect(
    "mongodb+srv://portiaportia:E8AUfgE3717JFt0y@data.ng58qmq.mongodb.net/"
  )
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("couldn't connect to mongodb", error);
  });
const houseSchema = new mongoose.Schema({
  name: String,
  size: Number,
  bedrooms: Number,
  bathrooms: Number,
  img: String,
});

const House = mongoose.model("House", houseSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/api/houses", async (req, res) => {
  const houses = await House.find();
  res.send(houses);
});

app.get("/api/houses/:id", async (req, res) => {
  const house = await House.findOne({ _id: id });
  res.send(house);
});

app.post("/api/houses", upload.single("img"), async (req, res) => {
  const result = validateHouse(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const house = new House({
    name: req.body.name,
    size: req.body.size,
    bedrooms: req.body.bedrooms,
    bathrooms: req.body.bathrooms,
  });

  if (req.file) {
    house.img = "images/" + req.file.filename;
  }

  const newHouse = await house.save();
  res.send(newHouse);
});

app.put("/api/houses/:id", upload.single("img"), async (req, res) => {
  const result = validateHouse(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  let fieldsToUpdate = {
    name: req.body.name,
    size: req.body.size,
    bedrooms: req.body.bedrooms,
    bathrooms: req.body.bathrooms,
  };

  if (req.file) {
    fieldsToUpdate.img = "images/" + req.file.filename;
  }

  const wentThrough = await House.updateOne(
    { _id: req.params.id },
    fieldsToUpdate
  );

  const updatedHouse = await House.findOne({ _id: req.params.id });
  res.send(updatedHouse);
});

app.delete("/api/houses/:id", async (req, res) => {
  const house = await House.findByIdAndDelete(req.params.id);
  res.send(house);
});

const validateHouse = (house) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    name: Joi.string().min(3).required(),
    size: Joi.number().required(),
    bedrooms: Joi.number().required(),
    bathrooms: Joi.number().required(),
  });

  return schema.validate(house);
};

app.listen(3002, () => {
  console.log("I'm listening");
});
