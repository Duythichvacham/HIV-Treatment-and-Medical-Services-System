const crypto = require('crypto');
const querystring = require('qs');
const vnpayConfig = require('../config/vnpay');

// Tạo URL thanh toán
exports.createPaymentUrl = async (amount, orderInfo, ipAddr, bankCode, orderType, locale) => {
  const date = new Date();
  const createDate = formatDate(date);
  const expireDate = formatDate(new Date(date.getTime() + 15 * 60 * 1000));
  const txnRef = Date.now().toString();

  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpayConfig.tmnCode,
    vnp_Locale: locale || 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: orderType || 'other',
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: vnpayConfig.returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  if (bankCode) {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params['vnp_SecureHashType'] = 'SHA512';

  const sortedParams = sortObject(vnp_Params);

  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', vnpayConfig.secureSecret);
  const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  sortedParams.vnp_SecureHash = secureHash;

  const queryString = querystring.stringify(sortedParams, { encode: true });
  const paymentUrl = `${vnpayConfig.vnpHost}?${queryString}`;

  return paymentUrl;
};

// Xác thực callback trả về
exports.verifyVnpayReturn = async (query) => {
  const secureHash = query.vnp_SecureHash;
  delete query.vnp_SecureHash;
  delete query.vnp_SecureHashType;

  const sortedParams = sortObject(query);
  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', vnpayConfig.secureSecret);
  const hash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (secureHash === hash) {
    if (query.vnp_ResponseCode === '00') {
      return {
        isSuccess: true,
        orderId: query.vnp_TxnRef,
        message: 'Transaction successful',
      };
    } else {
      return {
        isSuccess: false,
        message: `Transaction failed with code: ${query.vnp_ResponseCode}`,
      };
    }
  } else {
    return {
      isSuccess: false,
      message: 'Checksum validation failed',
    };
  }
};

// Helper: Sort object keys
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hour = ('0' + date.getHours()).slice(-2);
  const minute = ('0' + date.getMinutes()).slice(-2);
  const second = ('0' + date.getSeconds()).slice(-2);
  return `${year}${month}${day}${hour}${minute}${second}`;
}
