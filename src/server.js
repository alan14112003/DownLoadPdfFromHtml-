const PDFDocument = require("pdfkit");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({ dest: "src/uploads/" });
const cors = require("cors");
const fs = require("fs");
const sharp = require("sharp");

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
  (req, res, next) => {
    const directoryPath = __dirname + "/uploads";
    // Lấy danh sách các tệp trong thư mục
    const files = fs.readdirSync(directoryPath);

    // Xóa từng tệp
    files.forEach((file) => {
      const filePath = directoryPath + "/" + file;
      fs.unlinkSync(filePath);
    });
    next();
  },
  upload.array("images", 10000),
  async (req, res, next) => {
    const currentDomain = req.headers.host;

    const images = req.files;
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(__dirname + "/public/output.pdf"));

    for (const image of images) {
      const metadata = await sharp(image.path).metadata();
      console.log({ with: metadata.width, height: metadata.height });
      doc.addPage({ with: metadata.width, height: metadata.height });
      doc.image(image.path, 0, 0, {
        align: "center",
        valign: "center",
        width: "595.28",
      });
    }
    doc.end();

    return res.json({
      status: false,
      message: "url hợp lệ",
      body: currentDomain + "/output.pdf",
    });
  }
);

app.listen(80, () => {
  console.log(`app đang chạy ở cổng 80`);
});
