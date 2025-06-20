import React, { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  CreditCard, 
  Banknote, 
  QrCode, 
  Receipt, 
  User, 
  Stethoscope, 
  Calendar,
  Check,
  Printer
} from 'lucide-react';

const PaymentModal = ({ request, requestIndex, onPaymentComplete }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [open, setOpen] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('vi-VN');
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setShowReceipt(true);
  };

  const handlePrintReceipt = () => {
    // Simulate printing
    alert('Đang in phiếu xét nghiệm...');
    onPaymentComplete(requestIndex);
    setOpen(false);
    setShowReceipt(false);
    setSelectedPaymentMethod('');
  };

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Tiền mặt',
      icon: Banknote,
      description: 'Thanh toán bằng tiền mặt'
    },
    {
      id: 'qr',
      name: 'Quét mã QR',
      icon: QrCode,
      description: 'Thanh toán qua VietQR'
    }
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
            {showReceipt ? 'Hóa đơn xét nghiệm' : 'Xác nhận thanh toán'}
          </DialogTitle>
        </DialogHeader>

        {showReceipt ? (
          // Receipt View
          <div className="space-y-6">
            {/* Receipt Header */}
            <div className="text-center border-b pb-4">
              <h2 className="text-lg font-bold">PHÒNG KHÁM HIV</h2>
              <p className="text-sm text-gray-600">Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>
              <p className="text-sm text-gray-600">Điện thoại: (028) 1234 5678</p>
            </div>

            {/* Receipt Content */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Số hóa đơn:</span>
                <span className="font-mono">#{Date.now()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Ngày giờ:</span>
                <span>{new Date().toLocaleString('vi-VN')}</span>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Thông tin bệnh nhân:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Họ tên:</span>
                    <p className="font-medium">{request.patientName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Bác sĩ chỉ định:</span>
                    <p className="font-medium">{request.doctorName}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Dịch vụ xét nghiệm:</h3>
                <div className="space-y-2">
                  {request.services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{service.name}</span>
                      <span className="font-medium">{formatCurrency(service.price)}</span>
                    </div>
                  ))}
                </div>
              </div>              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{formatCurrency(request.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                  <span>Phương thức thanh toán:</span>
                  <span>{paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}</span>
                </div>
              </div>

              {/* Lab Information */}
              <div className="border-t pt-4 bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-orange-700">Thông tin xét nghiệm:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Phòng xét nghiệm:</span>
                    <p className="font-medium text-blue-600">Phòng XN - Tầng 2</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Số thứ tự:</span>
                    <p className="font-medium text-red-600">#{Math.floor(Math.random() * 100) + 1}</p>
                  </div>
                </div>
                <div className="mt-2 text-sm text-orange-600">
                  <strong>Lưu ý:</strong> Vui lòng mang theo hóa đơn này đến phòng xét nghiệm và chờ theo số thứ tự
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
                      <span className="font-medium">{request.patientName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Stethoscope className="h-4 w-4" />
                      <span>{request.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateTime(request.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Dịch vụ xét nghiệm:</h4>
                    {request.services.map((service, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{service.name}</span>
                        <span className="font-medium">{formatCurrency(service.price)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold text-green-600">
                      <span>Tổng cộng:</span>
                      <span>{formatCurrency(request.totalAmount)}</span>
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
                          ? 'ring-2 ring-green-500 bg-green-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Icon className="h-6 w-6 text-gray-600" />
                          <div className="flex-1">
                            <h4 className="font-medium">{method.name}</h4>
                            <p className="text-sm text-gray-600">{method.description}</p>
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
            {selectedPaymentMethod === 'qr' && (
              <Card className="bg-blue-50">
                <CardContent className="p-6 text-center">
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Quét mã QR để thanh toán {formatCurrency(request.totalAmount)}
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