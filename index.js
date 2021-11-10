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

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "bhaskar-upload-file-node",
    key: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.fieldname);
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

//List All The Files Present in AWS S3 BUCKET
app.get("/list", async (req, res) => {
  try {
    let r = await s3
      .listObjectsV2({ Bucket: "bhaskar-upload-file-node" })
      .promise();
    let x = r.Contents.map((element) => element.Key);
    res.render("index", { data: x });
  } catch (err) {}
});

// download the file from AWS S3 BUCKET that matches the params fileName
app.post("/list/download", async (req, res) => {
  const fileName = req.body.filename;
  let x = await s3
    .getObject({ Bucket: "bhaskar-upload-file-node", Key: fileName })
    .promise();
  res.send(x.Body);
  console.log(fileName);
});

app.listen(port, () => console.log("listening on port " + port));
