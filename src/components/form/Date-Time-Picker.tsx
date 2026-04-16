import { useEffect } from "react";
import flatpickr from "flatpickr";
import type { Instance } from "flatpickr/dist/types/instance";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";

type PropsType = {
    id: string;
    mode?: "single" | "multiple" | "range" | "time";
    enableTime?: boolean;
    dateFormat?: string;
    onChange?: (selectedDates: Date[], dateStr: string, instance: Instance) => void;
    defaultDate?: Date | string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    minDate?: Date | string;
    hourOnly?: boolean;

    time_24hr?: boolean;
    minuteIncrement?: number;
    noCalendar?: boolean;
    onReady?: (selectedDates: Date[], dateStr: string, instance: Instance) => void;
    onOpen?: (selectedDates: Date[], dateStr: string, instance: Instance) => void;

    error?: boolean;
    helperText?: string;
};

export default function DatePicker({
    id,
    mode = "single",
    enableTime = false,
    dateFormat = "Y-m-d",
    onChange,
    defaultDate,
    label,
    placeholder,
    disabled = false,
    error,
    helperText,
    hourOnly = false,
}: PropsType) {
    useEffect(() => {
    const selector = `#${id}`;
    const element = document.querySelector(selector);

    if (!element) return;

    const options: any = {
        mode,
        enableTime,
       
        dateFormat: hourOnly ? "Y-m-d h K" : dateFormat, 
        static: true,
        monthSelectorType: "static",
        defaultDate,
        disableMobile: true,
        clickOpens: !disabled,
        time_24hr: false, 
        onChange: onChange ? (dates, str, inst) => onChange(dates, str, inst) : undefined,
    };

  
    if (hourOnly && enableTime) {
        options.minuteIncrement = 60;

        options.onReady = (_selectedDates: Date[], _dateStr: string, instance: Instance) => {
            const timeContainer = instance.timeContainer;
            if (!timeContainer) return;

         
            const minuteEl = timeContainer.querySelector(".flatpickr-minute") as HTMLElement | null;
            const colon = timeContainer.querySelector(".flatpickr-time-separator") as HTMLElement | null;

            if (minuteEl) minuteEl.style.display = "none";
            if (colon) colon.style.display = "none";

         
            const hourEl = timeContainer.querySelector(".flatpickr-hour") as HTMLElement | null;
            const ampmEl = timeContainer.querySelector(".flatpickr-am-pm") as HTMLElement | null;

            if (hourEl) {
                hourEl.style.width = "60%";
                hourEl.style.marginRight = "8px";
            }
            if (ampmEl) {
                ampmEl.style.width = "40%";
                ampmEl.style.textAlign = "center";
                ampmEl.style.fontWeight = "600";
            }
        };

       
        options.onValueUpdate = (_: Date[], __: string, instance: Instance) => {
            if (instance.selectedDates[0]) {
                instance.selectedDates[0].setMinutes(0);
                instance.selectedDates[0].setSeconds(0);
                instance.setDate(instance.selectedDates[0], false);
            }
        };

        options.onChange = (dates: Date[], str: string, instance: Instance) => {
            if (dates[0]) {
                dates[0].setMinutes(0);
                dates[0].setSeconds(0);
            }
            onChange?.(dates, str, instance);
        };
    }

    const instance = flatpickr(element, options);

    const input = element as HTMLInputElement;
    if (input) {
        input.disabled = disabled;
    }

    return () => {
        instance.destroy();
    };
}, [
    id,
    mode,
    enableTime,
    dateFormat,
    defaultDate,
    onChange,
    disabled,
    hourOnly,
]);


    return (
        <div>
            {label && <Label htmlFor={id}>{label}</Label>}

            <div className="relative">
                <input
                    id={id}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden disabled:bg-gray-100 disabled:cursor-not-allowed"
                />

               

                {error && helperText && (
                    <p className="mt-1 text-xs text-red-600">{helperText}</p>
                )}
            </div>
        </div>
    );
}