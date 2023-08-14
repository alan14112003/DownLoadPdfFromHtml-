const PDFDocument = require("pdfkit");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({ dest: "src/uploads/" });
const cors = require("cors");
const fs = require("fs");
const url = require("url");

function isValidUrl(input = "") {
  return !!input.includes("://elib.vku.udn.vn:8080/ViewPDFOnline/document.php");
}

const app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.static(__dirname + "/public"));

app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.json());

app.get("/", (req, res, next) => {
  return res.render("index");
});

app.post(
  "/images-to-pdf",
  upload.array("images", 10000),
  async (req, res, next) => {
    const currentUrl = url.parse(req.url);
    const currentDomain = currentUrl.host;

    const images = req.files;
    const doc = new PDFDocument({ size: "A4" });
    doc.pipe(fs.createWriteStream("./public/output.pdf"));
    for (const image of images) {
      doc.image(image.path);
      doc.addPage({ size: "A4" });
    }
    doc.end();

    return res.json({
      status: false,
      message: "url hợp lệ",
      body: currentDomain + "/public/output.pdf",
    });
  }
);

app.listen(80, () => {
  console.log(`app đang chạy ở cổng 80`);
});
