"use client";

import React, { forwardRef } from "react";
import { TextField, TextFieldProps, InputAdornment } from "@mui/material";

export interface UiTextAreaProps
  extends Omit<TextFieldProps, "multiline" | "type"> {

  maxLength?: number;

  minRows?: number;

  maxRows?: number;

  startAdornment?: React.ReactNode;

  endAdornment?: React.ReactNode;
}

const UiTextArea = forwardRef<HTMLDivElement, UiTextAreaProps>(
  (
    {
      value,
      onChange,
      maxLength,
      minRows,
      maxRows,
      startAdornment,
      endAdornment,
      helperText,
      InputProps,
      inputProps,
      ...rest
    },
    ref
  ) => {
    const mergedInputProps = {
      ...inputProps,
      maxLength: maxLength ?? inputProps?.maxLength,
    };

    const mergedInputAdornment = {
      ...InputProps,
      startAdornment:
        startAdornment != null ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : (
          InputProps?.startAdornment
        ),
      endAdornment:
        endAdornment != null ? (
          <InputAdornment position="end">{endAdornment}</InputAdornment>
        ) : (
          InputProps?.endAdornment
        ),
    };

    return (
      <TextField
        ref={ref}
        multiline
        value={value}
        onChange={onChange}
        minRows={minRows}
        maxRows={maxRows}
        helperText={helperText}
        InputProps={mergedInputAdornment}
        inputProps={mergedInputProps}
        {...rest}
      />
    );
  }
);

UiTextArea.displayName = "UiTextArea";
export default UiTextArea;
