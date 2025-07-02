import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  CreditCard,
  Banknote,
  QrCode,
  Receipt,
  User,
  Stethoscope,
  Calendar,
  Check,
  Printer,
} from "lucide-react";
import { approveTestRequest } from "../../services/api";

const PaymentModal = ({ request, requestIndex, onPaymentComplete }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [open, setOpen] = useState(false);
  const [queueInfo, setQueueInfo] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    // Thêm 7 giờ để chuyển từ UTC sang múi giờ Việt Nam
    date.setHours(date.getHours() + 7);
    return date.toLocaleString("vi-VN");
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) return;

    setIsProcessing(true);

    try {
      // Call the actual API to approve test request with payment method
      const result = await approveTestRequest(
        request.appointment_id,
        selectedPaymentMethod
      );
      setIsProcessing(false);

      // Debug: Log the entire response to see the structure
      console.log("API Response:", result);
      console.log("Queue Result:", result.data?.queue_result);

      // Store queue info from API response
      if (
        result.data &&
        result.data.queue_result &&
        result.data.queue_result.results &&
        result.data.queue_result.results.length > 0
      ) {
        setQueueInfo(result.data.queue_result.results[0].queue_info);
      }

      setShowReceipt(true);
    } catch (error) {
      setIsProcessing(false);
      console.error("Error processing payment:", error);
      alert("Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.");
    }
  };

  const handlePrintReceipt = () => {
    // Simulate printing
    alert("Đang in phiếu xét nghiệm...");
    onPaymentComplete(requestIndex, selectedPaymentMethod);
    setOpen(false);
    setShowReceipt(false);
    setSelectedPaymentMethod("");
  };

  const paymentMethods = [
    {
      id: "cash",
      name: "Tiền mặt",
      icon: Banknote,
      description: "Thanh toán bằng tiền mặt",
    },
    {
      id: "qr",
      name: "Quét mã QR",
      icon: QrCode,
      description: "Thanh toán qua VietQR",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
          <Receipt className="h-4 w-4 mr-2" />
          Thu tiền + Duyệt
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-green-700">
            {showReceipt ? "Hóa đơn xét nghiệm" : "Xác nhận thanh toán"}
          </DialogTitle>
        </DialogHeader>

        {showReceipt ? (
          // Receipt View
          <div className="space-y-6">
            {/* Receipt Header */}
            <div className="text-center border-b pb-4">
              <h2 className="text-lg font-bold">PHÒNG KHÁM HIV</h2>
              <p className="text-sm text-gray-600">
                Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM
              </p>
              <p className="text-sm text-gray-600">
                Điện thoại: (028) 1234 5678
              </p>
            </div>

            {/* Receipt Content */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Số hóa đơn:</span>
                <span className="font-mono">
                  XN{request.appointment_id}
                  {Date.now().toString().slice(-4)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Ngày giờ:</span>
                <span>{(() => {
                  const now = new Date();
                  // Thêm 7 giờ để chuyển từ UTC sang múi giờ Việt Nam
                  now.setHours(now.getHours() + 7);
                  return now.toLocaleString("vi-VN");
                })()}</span>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Thông tin bệnh nhân:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Họ tên:</span>
                    <p className="font-medium">{request.patient_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Số điện thoại:</span>
                    <p className="font-medium">{request.patient_phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Bác sĩ chỉ định:</span>
                    <p className="font-medium">BS. {request.doctor_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Thời gian tạo phiếu:</span>
                    <p className="font-medium">
                      {formatDateTime(request.created_at)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Dịch vụ xét nghiệm:</h3>
                <div className="space-y-2">
                  {request.services &&
                    request.services.map((service, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span>{service.service_name}</span>
                        <span className="font-medium">
                          {formatCurrency(service.service_price)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>{" "}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">
                    {formatCurrency(request.total_price)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                  <span>Phương thức thanh toán:</span>
                  <span>
                    {
                      paymentMethods.find((m) => m.id === selectedPaymentMethod)
                        ?.name
                    }
                  </span>
                </div>
              </div>
              {/* Lab Information */}
              <div className="border-t pt-4 bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-orange-700">
                  Thông tin xét nghiệm:
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Phòng xét nghiệm:</span>
                    <p className="font-medium text-blue-600">
                      Phòng XN - Tầng 2
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Số thứ tự:</span>
                    <p className="font-medium text-red-600">
                      #{queueInfo?.queue_number || "Đang cấp phát"}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-sm text-orange-600">
                  <strong>Lưu ý:</strong> Vui lòng mang theo hóa đơn này đến
                  phòng xét nghiệm và chờ theo số thứ tự
                </div>
              </div>
              <div className="border-t pt-4 text-center text-sm text-gray-600">
                <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
                <p className="mt-2">Vui lòng giữ lại hóa đơn để nhận kết quả</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handlePrintReceipt}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Printer className="h-4 w-4 mr-2" />
                In phiếu và hoàn tất
              </Button>
            </div>
          </div>
        ) : (
          // Payment View
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Thông tin đơn xét nghiệm</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        {request.patient_name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      SĐT: {request.patient_phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Stethoscope className="h-4 w-4" />
                      <span>BS. {request.doctor_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateTime(request.created_at)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Dịch vụ xét nghiệm:</h4>
                    <div className="space-y-1">
                      {request.services &&
                        request.services.map((service, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span>{service.service_name}</span>
                            <span className="font-medium">
                              {formatCurrency(service.service_price)}
                            </span>
                          </div>
                        ))}
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-green-600">
                      <span>Tổng cộng:</span>
                      <span>{formatCurrency(request.total_price)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <div className="space-y-3">
              <h3 className="font-semibold">Chọn phương thức thanh toán:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Card
                      key={method.id}
                      className={`cursor-pointer transition-all ${
                        selectedPaymentMethod === method.id
                          ? "ring-2 ring-green-500 bg-green-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Icon className="h-6 w-6 text-gray-600" />
                          <div className="flex-1">
                            <h4 className="font-medium">{method.name}</h4>
                            <p className="text-sm text-gray-600">
                              {method.description}
                            </p>
                          </div>
                          {selectedPaymentMethod === method.id && (
                            <Check className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* QR Code Display */}
            {selectedPaymentMethod === "qr" && (
              <Card className="bg-blue-50">
                <CardContent className="p-6 text-center">
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Quét mã QR để thanh toán{" "}
                    {formatCurrency(request.total_price)}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={isProcessing}
              >
                Hủy
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!selectedPaymentMethod || isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Xác nhận thanh toán
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
