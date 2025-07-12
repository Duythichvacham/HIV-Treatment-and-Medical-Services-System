import React from "react";
import { useExamAppointment } from "../../../../hooks/appointments/useExamAppointment";
import {
  DateSelector,
  DoctorSelector,
  TimeSlotSelector,
  BookingSummary,
} from "../../../../components/appointment/AppointmentComponents";
import AppointmentConfirmModal from "../../../../components/appointment/AppointmentConfirmModal";
// import AppointmentSuccessModal from "../../../../components/appointment/AppointmentSuccessModal";
const ExamAppointment = () => {
  const {
    // State
    selectedDoctor,
    selectedDate,
    selectedTime,
    doctors,
    timeSlots,
    loading,
    doctorsLoading,
    error,
    isConfirmOpen,
    // isReceiptOpen,
    appointmentData,

    // Actions
    setSelectedDoctor,
    setSelectedDate,
    setSelectedTime,
    setIsConfirmOpen,
    // setIsReceiptOpen,
    handleBooking,
    // handlePaymentConfirmation,
    handleVnpayPayment,

    // Computed
    isBookingReady,
    getExamPrice,
  } = useExamAppointment();

  // Utility functions for UI
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-50 border-green-200";
      case "warning":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "full":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusText = (status, available, total) => {
    switch (status) {
      case "available":
        return `Còn ${available}/${total} chỗ`;
      case "warning":
        return `Còn ${available}/${total} chỗ`;
      case "full":
        return "Đã đầy";
      default:
        return "Không rõ";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* 1. Date Selection */}
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          label="Chọn ngày khám"
        />

        {/* 2. Doctor Selection */}
        <DoctorSelector
          selectedDoctor={selectedDoctor}
          doctors={doctors}
          onDoctorChange={setSelectedDoctor}
          selectedDate={selectedDate}
          doctorsLoading={doctorsLoading}
          error={error}
          getPrice={getExamPrice}
        />

        {/* 3. Time Slot Selection */}
        <TimeSlotSelector
          selectedTime={selectedTime}
          timeSlots={timeSlots}
          onTimeChange={setSelectedTime}
          selectedDate={selectedDate}
          selectedDoctor={selectedDoctor}
          loading={loading}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />
      </div>

      {/* Right Column - Summary */}
      <div className="space-y-6">
        <BookingSummary
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedDoctor={selectedDoctor}
          getPrice={getExamPrice}
          isBookingReady={isBookingReady}
          onBooking={handleBooking}
          loading={loading}
          isConsultation={false}
        />
      </div>

      {/* Modals */}
      <AppointmentConfirmModal
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        // onConfirm={() => {
        //   setIsConfirmOpen(false);
        //   setIsReceiptOpen(true);
        // }}
        onVnpayPayment={handleVnpayPayment}
        data={appointmentData}
        // onPaymentConfirm={handlePaymentConfirmation}
      />
      {/* <AppointmentSuccessModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        appointmentData={appointmentData}
      /> */}
    </div>
  );
};

export default ExamAppointment;
