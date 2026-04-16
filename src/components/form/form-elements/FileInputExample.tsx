"use client";

import React, { FC, useState } from "react";

interface FileInputProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileBase64?: (base64: string, file: File) => void;
  className?: string;
  disabled?: boolean;
}

const FileInput: FC<FileInputProps> = ({
  id = "file-input",
  name,
  label = "Upload",
  placeholder = "No file chosen",
  onChange,
  onFileBase64,
  className = "",
  disabled = false,
}) => {
  const [fileName, setFileName] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setFileName("");
      return;
    }

    setFileName(file.name);
    onChange?.(e);

    if (onFileBase64) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onFileBase64(reader.result as string, file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`flex w-full items-center rounded border px-2 py-1 ${className}`}>
      <label
        htmlFor={id}
        className="cursor-pointer rounded border border-gray-300 bg-gray-100 px-3 py-1 text-sm text-gray-700"
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type="file"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />

      <span className="ml-3 truncate text-sm text-gray-500">
        {fileName || placeholder}
      </span>
    </div>
  );
};

export default FileInput;
