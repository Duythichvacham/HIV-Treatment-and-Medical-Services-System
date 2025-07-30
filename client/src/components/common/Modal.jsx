const Modal = ({ isOpen, title, children, size = "md", className = "" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        className={`bg-white rounded-lg w-full ${sizeClasses[size]} my-8 ${className}`}
      >
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
