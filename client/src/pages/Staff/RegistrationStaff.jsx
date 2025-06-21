import React, { useState } from "react";
import {
  Calendar,
  DollarSign,
  FileText,
  Clock,
  User,
  Stethoscope,
  TestTube,
  Receipt,
  Search,
} from "lucide-react";
import PaymentModal from "../../components/common/PaymentModal";

const mockTestRequests = [
  {
    patientName: "Nguyễn Văn A",
    doctorName: "BS. Kiên",
    services: [
      { name: "Xét nghiệm CD4", price: 200000 },
      { name: "Xét nghiệm Sàng lọc", price: 100000 },
    ],
    totalAmount: 300000,
    createdAt: "2025-06-19 08:30:00",
  },
  {
    patientName: "Trần Thị B",
    doctorName: "BS. Kiên",
    services: [
      { name: "Xét nghiệm Khẳng định", price: 130000 },
      { name: "Xét nghiệm Tải lượng virus", price: 250000 },
    ],
    totalAmount: 380000,
    createdAt: "2025-06-19 09:15:00",
  },
];

const mockCompletedRequests = [
  {
    patientName: "Phạm Văn D",
    doctorName: "BS. Kiên",
    services: [
      { name: "Xét nghiệm CD4", price: 200000 },
      { name: "Xét nghiệm Sàng lọc", price: 100000 },
    ],
    totalAmount: 300000,
    paymentMethod: "Tiền mặt",
    roomNumber: "P101",
    queueNumber: 15,
    completedAt: "2025-06-19 07:30:00",
  },
  {
    patientName: "Hoàng Thị E",
    doctorName: "BS. Minh",
    services: [{ name: "Xét nghiệm Khẳng định", price: 130000 }],
    totalAmount: 130000,
    paymentMethod: "QR Code",
    roomNumber: "P102",
    queueNumber: 16,
    completedAt: "2025-06-19 08:00:00",
  },
  {
    patientName: "Lý Văn F",
    doctorName: "BS. Kiên",
    services: [
      { name: "Xét nghiệm Tải lượng virus", price: 250000 },
      { name: "Xét nghiệm CD4", price: 200000 },
    ],
    totalAmount: 450000,
    paymentMethod: "Tiền mặt",
    roomNumber: "P101",
    queueNumber: 17,
    completedAt: "2025-06-19 08:45:00",
  },
  {
    patientName: "Ngô Thị G",
    doctorName: "BS. Minh",
    services: [{ name: "Xét nghiệm Sàng lọc", price: 100000 }],
    totalAmount: 100000,
    paymentMethod: "QR Code",
    roomNumber: "P102",
    queueNumber: 18,
    completedAt: "2025-06-19 09:30:00",
  },
  {
    patientName: "Trần Văn H",
    doctorName: "BS. Kiên",
    services: [
      { name: "Xét nghiệm CD4", price: 200000 },
      { name: "Xét nghiệm Khẳng định", price: 130000 },
      { name: "Xét nghiệm Sàng lọc", price: 100000 },
    ],
    totalAmount: 430000,
    paymentMethod: "Tiền mặt",
    roomNumber: "P101",
    queueNumber: 19,
    completedAt: "2025-06-19 10:15:00",
  },
  {
    patientName: "Phan Thị I",
    doctorName: "BS. Minh",
    services: [{ name: "Xét nghiệm Tải lượng virus", price: 250000 }],
    totalAmount: 250000,
    paymentMethod: "QR Code",
    roomNumber: "P102",
    queueNumber: 20,
    completedAt: "2025-06-19 11:00:00",
  },
  {
    patientName: "Võ Văn J",
    doctorName: "BS. Kiên",
    services: [
      { name: "Xét nghiệm CD4", price: 200000 },
      { name: "Xét nghiệm Tải lượng virus", price: 250000 },
    ],
    totalAmount: 450000,
    paymentMethod: "Tiền mặt",
    roomNumber: "P101",
    queueNumber: 21,
    completedAt: "2025-06-19 11:30:00",
  },
  {
    patientName: "Đặng Thị K",
    doctorName: "BS. Minh",
    services: [
      { name: "Xét nghiệm Khẳng định", price: 130000 },
      { name: "Xét nghiệm Sàng lọc", price: 100000 },
    ],
    totalAmount: 230000,
    paymentMethod: "QR Code",
    roomNumber: "P102",
    queueNumber: 22,
    completedAt: "2025-06-19 12:00:00",
  },
  {
    patientName: "Bùi Văn L",
    doctorName: "BS. Kiên",
    services: [{ name: "Xét nghiệm Sàng lọc", price: 100000 }],
    totalAmount: 100000,
    paymentMethod: "Tiền mặt",
    roomNumber: "P101",
    queueNumber: 23,
    completedAt: "2025-06-19 12:30:00",
  },
];

const mockStats = {
  pendingRequests: 2,
  todayRevenue: 2450000,
  processedToday: 9,
};

const RegistrationStaff = () => {
  const [testRequests, setTestRequests] = useState(mockTestRequests);
  const [completedRequests] = useState(mockCompletedRequests);
  const [stats, setStats] = useState(mockStats);
  const [activeTab, setActiveTab] = useState("process");
  const [searchTerm, setSearchTerm] = useState("");

  const handleProcessPayment = (requestIndex) => {
    const request = testRequests[requestIndex];
    setTestRequests((prev) =>
      prev.filter((_, index) => index !== requestIndex)
    );
    setStats((prev) => ({
      ...prev,
      pendingRequests: prev.pendingRequests - 1,
      processedToday: prev.processedToday + 1,
      todayRevenue: prev.todayRevenue + request?.totalAmount || 0,
    }));

    alert("Đã thu tiền thành công!\nPhiếu xét nghiệm đang được in...");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("vi-VN");
  };

  // Filter completed requests based on search term
  const filteredCompletedRequests = completedRequests.filter(
    (request) =>
      request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.queueNumber.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý Xét nghiệm - Registration Staff
          </h1>
          <p className="text-gray-600">
            Xử lý đơn xét nghiệm và thu tiền từ bệnh nhân
          </p>
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 w-fit">
            <button
              onClick={() => setActiveTab("process")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "process"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText size={16} />
              Xử lý đơn XN
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "history"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <DollarSign size={16} />
              Lịch sử thanh toán
            </button>
          </div>
          {/* Process Tab */}
          {activeTab === "process" && (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Đơn chờ xử lý
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        {stats.pendingRequests}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        TestRequests status = 'requested'
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Doanh thu hôm nay
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(stats.todayRevenue)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tổng tiền đã thu
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Số đơn đã xử lý
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {stats.processedToday}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Trong ngày hôm nay
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Test Requests List */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Danh sách đơn xét nghiệm chờ xử lý
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Các đơn xét nghiệm từ bác sĩ cần thu tiền và duyệt
                  </p>
                </div>
                <div className="p-6">
                  {testRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Không có đơn xét nghiệm nào chờ xử lý</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {testRequests.map((request, index) => (
                        <div
                          key={index}
                          className="bg-white border border-l-4 border-l-orange-500 rounded-lg p-6 shadow-sm"
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold text-gray-900">
                                  {request.patientName}
                                </span>
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
                              <h4 className="font-medium text-gray-900">
                                Dịch vụ xét nghiệm:
                              </h4>
                              <div className="space-y-1">
                                {request.services.map(
                                  (service, serviceIndex) => (
                                    <div
                                      key={serviceIndex}
                                      className="flex justify-between items-center text-sm"
                                    >
                                      <span className="text-gray-700">
                                        {service.name}
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {formatCurrency(service.price)}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-600">
                                  Tổng tiền:
                                </div>
                                <div className="text-lg font-bold text-green-600">
                                  {formatCurrency(request.totalAmount)}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <PaymentModal
                                request={request}
                                requestIndex={index}
                                onPaymentComplete={handleProcessPayment}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}{" "}
          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên bệnh nhân, bác sĩ, phòng hoặc số thứ tự..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Lịch sử thanh toán hôm nay
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Danh sách các đơn xét nghiệm đã thanh toán thành công
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="text-gray-600">Tổng thu:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(2450000)}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600">
                      {completedRequests.length} đơn đã thanh toán
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  {filteredCompletedRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>
                        {searchTerm
                          ? "Không tìm thấy kết quả phù hợp"
                          : "Chưa có đơn nào được thanh toán hôm nay"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredCompletedRequests.map((request, index) => (
                        <div
                          key={index}
                          className="bg-white border border-l-4 border-l-green-500 rounded-lg p-6 shadow-sm"
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold text-gray-900">
                                  {request.patientName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Stethoscope className="h-4 w-4" />
                                <span>{request.doctorName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {formatDateTime(request.completedAt)}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900">
                                Dịch vụ xét nghiệm:
                              </h4>
                              <div className="space-y-1">
                                {request.services.map(
                                  (service, serviceIndex) => (
                                    <div
                                      key={serviceIndex}
                                      className="flex justify-between items-center text-sm"
                                    >
                                      <span className="text-gray-700">
                                        {service.name}
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {formatCurrency(service.price)}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <div className="text-sm text-green-800">
                                  Tổng tiền:
                                </div>
                                <div className="text-lg font-bold text-green-600">
                                  {formatCurrency(request.totalAmount)}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <div className="text-sm text-blue-800">
                                  Thanh toán:
                                </div>
                                <div className="font-medium text-blue-900">
                                  {request.paymentMethod}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="text-sm text-gray-600">
                                  Phòng:
                                </div>
                                <div className="font-medium text-gray-900">
                                  {request.roomNumber}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  STT: {request.queueNumber}
                                </div>
                              </div>
                              <div className="flex justify-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                                  Đã thanh toán
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationStaff;
