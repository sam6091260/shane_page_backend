require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// 設定 Express 使用 body-parser 來解析 URL 編碼和 JSON 格式的請求內容。
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// 設定 Express 使用 cors 中間件，以處理跨來源資源共用的相關事務。
app.use(
  cors({
    credentials: true,
    preflightContinue: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    origin: "*",
  })
);

// Nodemailer設定
// 創建 Nodemailer 的郵件發送器，並配置使用 Gmail 服務。
// 使用 nodemailer.createTransport 方法建立了 transporter 物件，你就可以使用該物件的 sendMail 方法來發送郵件
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: process.env.EMAIL_ACCOUNT, // 使用 process.env 來獲取環境變數
    pass: process.env.EMAIL_PASSWORD, // 使用 process.env 來獲取環境變數
  },
});

// 處理 POST 請求
// 定義一個 POST 路由，當收到 "/send-email" 請求時，執行處理郵件發送的邏輯。
app.post("/send-email", (req, res) => {
  try {
    const { name, email, message } = req.body;

    // console.log("name: ", name);
    // console.log("email: ", email);
    // console.log("message: ", message);
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ status: false, message: "姓名、信箱及訊息不可為空" });
    }

    const mailOptions = {
      from: process.env.EMAIL_ACCOUNT, // 使用 process.env 來獲取環境變數
      to: "sam6091260@gmail.com",
      subject: `${new Date(Date.now()).toLocaleDateString()} 顯式設計案件諮詢`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };
    // sendMail 方法是 transporter 物件提供的一個功能，用於實際處理郵件的發送。
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log("send mail error: ", error);
        return res
          .status(500)
          .json({ status: false, message: error.toString() });
      }
      res
        .status(200)
        .json({ status: true, message: "信件已送出，我們將盡快與您聯絡" });
    });
  } catch (err) {
    console.log("[send-email]", err);
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
