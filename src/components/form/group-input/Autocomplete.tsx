import React from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  AutocompleteRenderInputParams,
} from "@mui/material";


export type ExtractValue<TOption> =
  | string
  | number
  | keyof TOption
  | ((opt: TOption) => string | number);
export type ExtractLabel<TOption> = keyof TOption | ((opt: TOption) => string);

export type DynamicAutocompleteProps<TOption, TValue = TOption> = {

  options: TOption[];

  value: TValue | null;

  onChange: (value: TValue | null) => void;


  getOptionValue?: ExtractValue<TOption>;

  getOptionLabel?: ExtractLabel<TOption>;


  multiple?: boolean;

  loading?: boolean;

  disabled?: boolean;

  freeSolo?: boolean;

  label?: string;
  placeholder?: string;
  helperText?: React.ReactNode;
  error?: boolean;
  required?: boolean;
  size?: "small" | "medium";
  fullWidth?: boolean;
  className?: string;


  isOptionEqualToValue?: (option: TOption, value: unknown) => boolean;

  renderInput?: (params: AutocompleteRenderInputParams) => React.ReactNode;
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: TOption
  ) => React.ReactNode;
};


function resolveLabel<T>(opt: T, getOptionLabel?: ExtractLabel<T>): string {
  if (!opt) return "";
  if (!getOptionLabel) return String(opt);
  if (typeof getOptionLabel === "function") return getOptionLabel(opt);
  return String(opt[getOptionLabel]);
}

function resolveValue<T>(
  opt: T,
  getter?: ExtractValue<T>
): string | number | T {
  if (!getter) return opt as unknown as T;
  if (typeof getter === "function") return getter(opt);
  if (typeof getter === "string")
    return (opt as Record<string, unknown>)[getter] as string | number;
  return opt[getter as keyof T] as string | number;
}

export function DynamicAutocomplete<TOption, TValue = TOption>(
  props: DynamicAutocompleteProps<TOption, TValue>
) {
  const {
    options,
    value,
    onChange,
    getOptionLabel,
    getOptionValue,
    multiple = false,
    loading = false,
    disabled = false,
    freeSolo = false,
    label,
    placeholder,
    helperText,
    error,
    required,
    size = "small",
    fullWidth = true,
    className,
    isOptionEqualToValue,
    renderInput,
    renderOption,
  } = props;


  const toOption = (val: unknown): TOption | null => {
    if (val == null) return null;
    if (!getOptionValue) return val as TOption; 
    return (
      options.find((o) => {
        const ov = resolveValue(o, getOptionValue);
        return (
          ov === val ||
          (typeof val === "object" && isOptionEqualToValue
            ? isOptionEqualToValue(o, val)
            : false)
        );
      }) ?? null
    );
  };

  const toOptions = (val: unknown): TOption[] => {
    if (!Array.isArray(val))
      return val == null ? [] : ([toOption(val)].filter(Boolean) as TOption[]);
    return (val as unknown[])
      .map((v) => toOption(v))
      .filter((o): o is TOption => Boolean(o));
  };


  const fromOption = (opt: TOption | null): TValue | null => {
    if (!getOptionValue) return opt as unknown as TValue;
    if (opt == null) return null;
    return resolveValue(opt, getOptionValue) as unknown as TValue;
  };

  const handleChange = (
    _: React.SyntheticEvent,
    newVal: TOption | TOption[] | null
  ) => {
    if (multiple) {
      const out =
        (newVal as TOption[] | null)?.map((o) =>
          freeSolo ? (o as unknown as TValue) : (fromOption(o) as TValue)
        ) ?? [];
      onChange(out as unknown as TValue);
    } else {
      onChange(
        freeSolo
          ? (newVal as unknown as TValue | null)
          : newVal
            ? (fromOption(newVal as TOption) as TValue)
            : null
      );
    }
  };


  const muiValue = multiple
    ? toOptions(value as unknown)
    : toOption(value as unknown);

  return (
    <Autocomplete
      className={className}
      multiple={multiple}
      freeSolo={freeSolo}
      options={options}
      value={muiValue as TOption | TOption[] | null}
      onChange={handleChange}
      getOptionLabel={(opt) => resolveLabel(opt as TOption, getOptionLabel)}
      isOptionEqualToValue={
        isOptionEqualToValue ||
        ((option: TOption, val: unknown) => {
          if (!getOptionValue) return option === val;
          return (
            resolveValue(option, getOptionValue) ===
            resolveValue(val as TOption, getOptionValue)
          );
        })
      }
      renderOption={renderOption}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      renderInput={(params) =>
        renderInput ? (
          renderInput(params)
        ) : (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            required={required}
            error={error}
            helperText={
              loading ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <CircularProgress size={14} /> Loading...
                </span>
              ) : (
                helperText
              )
            }
          />
        )
      }
    />
  );
}
