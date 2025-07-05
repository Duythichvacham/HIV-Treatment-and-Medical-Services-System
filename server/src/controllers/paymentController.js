const paymentService = require('../services/paymentVnpayService');

exports.createPayment = async (req, res) => {
  try {
    const { amount, orderInfo, bankCode, orderType, language } = req.body;
    const ipAddr = req.ip || '127.0.0.1';

    const paymentUrl = await paymentService.createPaymentUrl(
      amount,
      orderInfo,
      ipAddr,
      bankCode,
      orderType,
      language
    );

    res.status(201).json({
      paymentUrl,
      message: 'VNPay payment URL created successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.vnpayReturn = async (req, res) => {
  const result = await paymentService.verifyVnpayReturn(req.query);

  if (result.isSuccess) {
    return res.send(`Payment success! OrderId: ${result.orderId}`);
  } else {
    return res.send(`Payment failed! Reason: ${result.message}`);
  }
};
