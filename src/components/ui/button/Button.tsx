
import React, { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "outline" | "secondary" | "brand" | "warning" | "danger";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "submit" | "reset" | "button";

  goBack?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  goBack = false, 
}) => {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
  };

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-[#138a6d] to-[#19a987] text-white shadow-theme-sm hover:from-[#0f775f] hover:to-[#138a6d] focus-visible:ring-[#138a6d]",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:ring-gray-400 focus-visible:ring-gray-300",
    secondary:
      "bg-gradient-to-r from-[#ff3d66] to-[#ff5c7e] text-white shadow-theme-sm hover:from-[#e23158] hover:to-[#f54d72] focus-visible:ring-[#ff3d66]",
    brand:
      "bg-gradient-to-r from-brand-500 to-[#6b14b0] text-white shadow-theme-sm hover:from-[#440076] hover:to-[#5b0f99] focus-visible:ring-brand-500",
    warning:
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-theme-sm hover:from-amber-600 hover:to-orange-600 focus-visible:ring-amber-500",
    danger:
      "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-theme-sm hover:from-red-600 hover:to-rose-600 focus-visible:ring-red-500",
  };

  const handleClick = () => {
    if (disabled) return;

    if (goBack) {

      const prevPage = () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "/";
        }
      };
      prevPage();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg font-stc-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? "cursor-not-allowed opacity-50" : ""
        }`}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
