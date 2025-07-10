const moment = require("moment");
const crypto = require("crypto");
const qs = require("qs");
const config = require("../config/vnpay");
const invoiceService = require("../services/invoiceService");

function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  }
  return sorted;
}

module.exports = {
  createPaymentUrl(req, res) {
    process.env.TZ = "Asia/Ho_Chi_Minh";
    const date = new Date();
    const createDate = moment(date).format("YYYYMMDDHHmmss");
    const ipAddr =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // ✅ Lấy invoiceId từ body
    const invoiceId = req.body.invoiceId;
    const amount = req.body.amount;
    const bankCode = req.body.bankCode;
    const locale = req.body.language || "vn";

    const tmnCode = config.vnp_TmnCode;
    const secretKey = config.vnp_HashSecret;
    const vnpUrl = config.vnp_Url;
    const returnUrl = config.vnp_ReturnUrl;

    // ✅ dùng invoiceId làm TxnRef
    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: "VND",
      vnp_TxnRef: invoiceId,
      vnp_OrderInfo: "Thanh toan cho Invoice ID: " + invoiceId,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const signed = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    vnp_Params["vnp_SecureHash"] = signed;

    const redirectUrl =
      vnpUrl + "?" + qs.stringify(vnp_Params, { encode: false });

    res.json({ url: redirectUrl });
  },

  handleReturn: async (req, res) => {
    const vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const secretKey = config.vnp_HashSecret;
    const signData = qs.stringify(sortObject(vnp_Params), { encode: false });
    const signed = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    if (secureHash === signed) {
      const responseCode = vnp_Params["vnp_ResponseCode"];
      const invoiceId = parseInt(vnp_Params["vnp_TxnRef"], 10);

      if (!isNaN(invoiceId)) {
        if (responseCode === "00") {
          await invoiceService.updateInvoiceStatus(invoiceId, "paid");
        } else {
          await invoiceService.updateInvoiceStatus(invoiceId, "cancelled");
        }
      }

      res.json({
        code: responseCode,
        message:
          responseCode === "00"
            ? "Thanh toán thành công"
            : "Thanh toán thất bại hoặc bị huỷ",
      });
    } else {
      res.json({ code: "97", message: "Sai checksum" });
    }
  },

  handleIPN: async (req, res) => {
    const vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const secretKey = config.vnp_HashSecret;
    const signData = qs.stringify(sortObject(vnp_Params), { encode: false });
    const signed = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    if (secureHash === signed) {
      const responseCode = vnp_Params["vnp_ResponseCode"];
      const invoiceId = parseInt(vnp_Params["vnp_TxnRef"], 10);

      if (!isNaN(invoiceId)) {
        if (responseCode === "00") {
          await invoiceService.updateInvoiceStatus(invoiceId, "paid");
        } else {
          await invoiceService.updateInvoiceStatus(invoiceId, "cancelled");
        }
      }

      res.status(200).json({ RspCode: "00", Message: "Success" });
    } else {
      res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
    }
  },
};
