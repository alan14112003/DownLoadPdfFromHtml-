const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
// const upload = multer({ dest: "src/uploads/" });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
const cors = require("cors");
const fs = require("fs");
const puppeteer = require("puppeteer");

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
    const directoryPath = __dirname + "/public/images";
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

    for (const image of images) {
      fs.copyFileSync(image.path, __dirname + "/public/images");
    }

    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // // We set the page content as the generated html by handlebars
    // await page.setContent(html);
    // // We use pdf function to generate the pdf in the same folder as this file.
    // await page.pdf({ path: __dirname + "/public/output.pdf", format: "A4" });
    // await browser.close();

    return res.json({
      status: false,
      message: "Thành công",
      body: currentDomain + "/output.pdf",
    });
  }
);

app.get("/images", (req, res, next) => {
  const directoryPath = __dirname + "/public/images";
  // Lấy danh sách các tệp trong thư mục
  const files = fs.readdirSync(directoryPath);

  const images = [];
  // add từng tệp
  files.forEach((file) => {
    const filePath = directoryPath + "/" + file;
    images.push(filePath);
  });

  return res.json({
    status: true,
    body: images,
  });
});

app.listen(80, () => {
  console.log(`app đang chạy ở cổng 80`);
});
