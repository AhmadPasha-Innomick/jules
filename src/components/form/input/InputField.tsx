"use client";

import React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";

interface BaseInputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: number;
  maxLength?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  size?: "small" | "medium";
}

interface RHFInputProps<TFieldValues extends FieldValues = FieldValues> {
  control?: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  rules?: object;
}

type InputProps<TFieldValues extends FieldValues = FieldValues> =
  BaseInputProps &
  Omit<TextFieldProps, "size" | "name"> &
  Partial<RHFInputProps<TFieldValues>>;

const Input = <TFieldValues extends FieldValues = FieldValues>({
  type = "text",
  id,
  name,
  placeholder,
  defaultValue,
  onChange,
  className = "",
  min,
  max,
  step,
  maxLength,
  disabled = false,
  error = false,
  label,
  size = "small" as const,
  control,
  rules,
  ...rest
}: InputProps<TFieldValues>) => {

  if (control && name) {
    return (
      <div className="relative">
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field, fieldState }) => (
            <TextField
              value={field.value ?? ""}
              {...field}
              type={type}
              id={id || name}
              label={label}
              placeholder={placeholder}
              disabled={disabled}
              variant="outlined"
              fullWidth
              size={size}
              error={!!fieldState.error || error}
              helperText={fieldState.error?.message || rest.helperText}
              InputProps={{
                inputProps: {
                  min,
                  max,
                  step,
                  maxLength,
                  className,
                },
              }}
              {...rest}
            />
          )}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <TextField
        type={type}
        id={id}
        name={name}
        label={label}
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        variant="outlined"
        fullWidth
        size={size}
        InputProps={{
          inputProps: {
            min,
            max,
            step,
            maxLength,
            className,
          },
        }}
        error={error}
        {...rest}
      />
    </div>
  );
};

export default Input;
