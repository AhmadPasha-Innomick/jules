import React, { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
}) => {

  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    onChange(value); 
  };

  return (
    <select
      className={`shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm placeholder:text-gray-400 focus:ring-3 focus:outline-hidden ${
        selectedValue ? "text-gray-800" : "text-gray-400"
      } ${className}`}
      value={selectedValue}
      onChange={handleChange}
    >
  
      <option value="" disabled className="text-gray-700">
        {placeholder}
      </option>
  
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-gray-700"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
