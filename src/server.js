const PDFDocument = require("pdfkit");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({ dest: "src/uploads/" });
const cors = require("cors");
const fs = require("fs");

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
    let html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
`;

    for (const image of images) {
      html += `<img src="${image.path}" style="width: 100%"/>`;
    }
    html += `
  </body>
</html>`;

    return res.json({
      status: false,
      message: "url hợp lệ",
      body: html,
    });
  }
);

app.listen(80, () => {
  console.log(`app đang chạy ở cổng 80`);
});
