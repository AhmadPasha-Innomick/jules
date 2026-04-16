"use client";

import React from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "danger" | "outline" | "ghost";

interface ReusableButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

const Button: React.FC<ReusableButtonProps> = ({
    variant = "primary",
    className,
    children,
    ...props
}) => {
    const baseStyles =
        "inline-flex items-center justify-center min-w-[120px] rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles: Record<ButtonVariant, string> = {
        primary:
            "bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-400",

        danger:
            "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",

        outline:
            "border border-brand-500 text-brand-500 hover:bg-brand-50 focus:ring-brand-400",

        ghost:
            "text-brand-600 hover:bg-brand-50 focus:ring-brand-400",
    };

    return (
        <button
            {...props}
            className={clsx(baseStyles, variantStyles[variant], className)}
        >
            {children}
        </button>
    );
};

export default Button;
