module.exports = {
  vnp_TmnCode: VNPAY_TMN_CODE,
  vnp_HashSecret: VNPAY_HASH_SECRET,
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  // vnp_ReturnUrl: "http://localhost:5000/api/payment/vnpay_return",
  vnp_ReturnUrl: "http://localhost:3000/payment-result", // điều hướng về trang trả kết quả ở front-end
};
