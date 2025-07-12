import React from "react";
import { useTestAppointment } from "../../../../hooks/appointments/useTestAppointment";
import {
  DateSelector,
  TestTypeSelector,
  BookingSummary,
} from "../../../../components/appointment/AppointmentComponents";
import AppointmentConfirmModal from "../../../../components/appointment/AppointmentConfirmModal";
const TestAppointment = () => {
  const {
    // State
    selectedTestType,
    selectedDate,
    testTypes,
    servicesLoading,
    error,
    isConfirmOpen,
    appointmentData,

    // Actions
    setSelectedTestType,
    setSelectedDate,
    setIsConfirmOpen,
    handleBooking,
    handleVnpayPayment,

    // Computed
    isBookingReady,
  } = useTestAppointment();

  const getTestPrice = () => {
    if (!selectedTestType) return "0đ";
    return `${Number(selectedTestType.price).toLocaleString()}đ`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* 1. Date Selection */}
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          label="Chọn ngày xét nghiệm"
        />

        {/* 2. Test Type Selection */}
        <TestTypeSelector
          selectedTestType={selectedTestType}
          testTypes={testTypes}
          onTestTypeChange={setSelectedTestType}
          servicesLoading={servicesLoading}
          error={error}
        />
      </div>

      {/* Right Column - Summary */}
      <div className="space-y-6">
        <BookingSummary
          selectedDate={selectedDate}
          selectedTestType={selectedTestType}
          getPrice={getTestPrice}
          isBookingReady={isBookingReady}
          onBooking={handleBooking}
          loading={false}
          isTest={true}
        />
      </div>

      {/* Modals */}
      <AppointmentConfirmModal
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        // onConfirm={() => {
        //   setIsConfirmOpen(false);
        //   setIsReceiptOpen(true);
        // }} -> Hiển thị modal thành công ngay lập tức -> dùng khi bypass
        data={appointmentData}
        onVnpayPayment={handleVnpayPayment}
        // onPaymentConfirm={handlePaymentConfirmation}
      />
    </div>
  );
};

export default TestAppointment;
