"use client";

import React from "react";
import { Switch, SwitchProps, FormControlLabel } from "@mui/material";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";

interface BaseSwitchProps extends Omit<SwitchProps, "onChange"> {

  activeLabel?: string;

  inactiveLabel?: string;

  onChange?: (checked: boolean) => void;
}


interface RHFSwitchProps<TFieldValues extends FieldValues = FieldValues> {
  control?: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  rules?: object;
}

type UiSwitchProps<TFieldValues extends FieldValues = FieldValues> =
  BaseSwitchProps &
  Partial<RHFSwitchProps<TFieldValues>>;

const UiSwitch = <TFieldValues extends FieldValues = FieldValues>({
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  checked = false, 
  onChange,
  control,
  name,
  rules,
  ...props
}: UiSwitchProps<TFieldValues>) => {
 
  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => {
         
          const isChecked = field.value === true || field.value === 1;
          const handleChange = (checked: boolean) => {
           
            if (typeof field.value === 'number') {
              field.onChange(checked ? 1 : 0);
            } else {
              field.onChange(checked);
            }
          };

          return (
            <FormControlLabel
              control={
                <Switch
                  checked={isChecked}
                  onChange={(e) => handleChange(e.target.checked)}
                  {...props}
                />
              }
              label={isChecked ? activeLabel : inactiveLabel}
            />
          );
        }}
      />
    );
  }


  return (
    <FormControlLabel
      control={
        <Switch
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          {...props}
        />
      }
      label={checked ? activeLabel : inactiveLabel}
    />
  );
};

export default UiSwitch;
