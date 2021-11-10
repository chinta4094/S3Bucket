const aws = require("aws-sdk");
const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();

const app = express();
const port = 9000;

app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: true }));

var accessKeyId = process.env.AWS_ACCESS_KEY;
var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// initialize the aws.S3 object by storing the accessKey and secretKey in s3 variable
var s3 = new aws.S3({
  accessKeyId,
  secretAccessKey,
});

// using multer and multer-s3
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "bhaskar-upload-file-node",
    key: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

app.get("/", (req, res) => {
  res.render("home");
});

// Upload a single File into aws s3 bucket
app.post("/upload", upload.single("image"), (req, res) => {
  res.render("home", { message: "successfully uploaded " });
});

//List all The Files Present in AWS S3 BUCKET using method listObjectV2
app.get("/list", async (req, res) => {
  try {
    let listObjects = await s3
      .listObjectsV2({ Bucket: "bhaskar-upload-file-node" })
      .promise();
    let listKeys = listObjects.Contents.map((element) => element.Key);
    res.render("index", { data: listKeys });
  } catch (err) {
    res.send(err);
  }
});

// download the file from AWS S3 BUCKET that matches the params fileName
app.post("/list/download", async (req, res) => {
  const fileName = req.body.filename;
  try {
    let getObj = await s3
      .getObject({ Bucket: "bhaskar-upload-file-node", Key: fileName })
      .promise();
    res.send(getObj.Body);
    console.log(fileName);
  } catch (err) {
    res.send(err);
  }
});

app.listen(port, () => console.log("listening on port " + port));
