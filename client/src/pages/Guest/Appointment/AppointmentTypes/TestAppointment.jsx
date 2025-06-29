import React from "react";
import { useTestAppointment } from "../../../../hooks/useAppointment";
import {
  DateSelector,
  TestTypeSelector,
  AdditionalInfoSection,
  BookingSummary,
} from "../../../../components/appointment/AppointmentComponents";
import AppointmentConfirmModal from "../../../../components/common/AppointmentConfirmModal";
import AppointmentSuccessModal from "../../../../components/common/AppointmentSuccessModal";

const TestAppointment = () => {
  const {
    // State
    selectedTestType,
    selectedDate,
    testTypes,
    servicesLoading,
    reason,
    error,
    isConfirmOpen,
    isReceiptOpen,
    appointmentData,

    // Actions
    setSelectedTestType,
    setSelectedDate,
    setReason,
    setIsConfirmOpen,
    setIsReceiptOpen,
    handleBooking,
    handleConfirmBooking,
    handlePaymentConfirmation,

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

        {/* 3. Additional Information */}
        <AdditionalInfoSection
          reason={reason}
          onReasonChange={setReason}
          placeholder="Ghi chú cho xét nghiệm (nếu có)..."
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
        onConfirm={() => {
          setIsConfirmOpen(false);
          setIsReceiptOpen(true);
        }}
        data={appointmentData}
        onPaymentConfirm={handlePaymentConfirmation}
      />
      <AppointmentSuccessModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        appointmentData={appointmentData}
      />
    </div>
  );
};

export default TestAppointment;
