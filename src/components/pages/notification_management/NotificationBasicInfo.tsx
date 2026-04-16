"use client";

import React, { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import InputField from "@/components/form/input/InputFieldNotification";
import FileInput from "@/components/form/input/FileInput";
import UiTextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { Alert, Box, Typography, Snackbar } from "@mui/material";
import { DynamicAutocomplete } from "@/components/form/group-input/Autocomplete";
import { useId } from "react";
import DatePicker from "@/components/form/Date-Time-Picker";
import { useGroups } from "@/hooks/useGroups";
import { useCreateNotification } from "@/hooks/useNotifications";



import { ReactNode } from "react";

interface InputFieldProps<T> {
    label?: ReactNode;

}
const notificationSchema = yup.object({
    category: yup.string().required("Category is required").max(50),
    title: yup
        .string()
        .transform((value) => value?.trim())
        .test(
            "not-empty",
            "Notification title cannot be empty",
            (value) => !!value && value.length > 0
        )
        .min(5, "Notification title must be at least 5 characters")
        .max(200, "Notification title must not exceed 200 characters"),

    description: yup.string().required("Description is required").max(1000),
    group_ids: yup
        .array()
        .of(yup.number())
        .min(1, "At least one group is required")
        .required("At least one group is required"),
    schedule_start: yup
        .string()
        .nullable()
        .test(
            "is-future-or-null",
            "Start date and time must be in the future",
            function (value) {
                if (!value) return true;
                const selectedDate = parse12HourStringToDate(value);
                if (!selectedDate) return false;
                return selectedDate > getBahrainNow();

            }
        ),

    schedule_end: yup
        .string()
        .nullable()
        .test(
            "is-after-start",
            "End time must be after start time",
            function (value) {
                const { schedule_start } = this.parent;
                if (!value || !schedule_start) return true;

                const start = parse12HourStringToDate(schedule_start);
                const end = parse12HourStringToDate(value);

                if (!start || !end) return false;
                return end > start;
            }
        ),

    photo_base64: yup
        .string()
        .nullable()
        .test(
            "valid-image",
            "Invalid image selected",
            (value) => !value || value.startsWith("data:image/")
        ),

});

const parse12HourStringToDate = (str: string | undefined): Date | undefined => {
    if (!str) return undefined;

    const normalized = str
        .replace(/(\d) (AM|PM)/, "$1:00 $2")
        .replace(/\//g, "-");
    return new Date(normalized);
};
const getNextValidHourDate = () => {
    const now = getBahrainNow();

    if (now.getMinutes() > 0 || now.getSeconds() > 0) {
        now.setHours(now.getHours() + 1);
    }

    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    return now;
};


export interface NotificationFormData {
    category: string;
    group_ids: number[];
    title: string;
    description: string;
    schedule_start?: string;
    schedule_end?: string;
    photo_base64?: string;
}

interface NotificationBasicInfoProps {
    onNext?: (data: NotificationFormData) => void;
    onCancel?: () => void;
    defaultValues?: Partial<NotificationFormData>;
}

const getBahrainNow = (): Date => {
    const now = new Date();
    const bahrainTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Bahrain" })
    );
    return bahrainTime;
};


const NotificationBasicInfo: React.FC<NotificationBasicInfoProps> = ({
    onNext,
    onCancel,
    defaultValues,
}) => {
    const router = useRouter();
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);
    const [imageInvalid, setImageInvalid] = React.useState(false);





    const { data: groupsData, isLoading: groupsLoading } = useGroups();
    const createNotificationMutation = useCreateNotification();
    const groups = groupsData?.data?.groups || [];

    const startDateId = useId();
    const endDateId = useId();

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
        setError,
        clearErrors,
        reset,
    } = useForm<NotificationFormData>({
        resolver: yupResolver(notificationSchema) as any,
        mode: "onChange",
        defaultValues: defaultValues || {
            category: "",
            group_ids: [],
            title: "",
            description: "",
            schedule_start: undefined,
            schedule_end: undefined,
        },
    });

    const scheduleStart = useWatch({ control, name: "schedule_start" });


    const hasUserEditedEnd = React.useRef(false);
    useEffect(() => {
        const startDate = getNextValidHourDate();

        const formattedStart = startDate.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "numeric",
            hour12: true,
            minute: "2-digit",
        })
            .replace(/,/g, "")
            .replace(/:00 /, " ");

        setValue("schedule_start", formattedStart, {
            shouldValidate: true,
            shouldDirty: false,
        });
    }, [setValue]);




    useEffect(() => {
        if (scheduleStart && !hasUserEditedEnd.current) {
            const startDate = parse12HourStringToDate(scheduleStart);
            if (!startDate) return;

            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + 1);
            endDate.setMinutes(0);
            endDate.setSeconds(0);

            const formatted = endDate.toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "numeric",
                hour12: true,
                minute: "2-digit",
            })
                .replace(/,/g, "")
                .replace(/:00 /, " ");

            setValue("schedule_end", formatted, {
                shouldValidate: true,
                shouldDirty: true,
            });
        }
    }, [scheduleStart, setValue]);

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
        }
    }, [defaultValues, reset]);

    const onSubmit = async (data: NotificationFormData) => {
        if (imageInvalid) {
            setError("photo_base64", {
                type: "manual",
                message: "Only image files (JPG, PNG) are allowed",
            });
            return;
        }
        setSubmitError(null);
        setSubmitSuccess(null);



        try {
            const formatToBackend = (displayStr: string | undefined): string | null => {
                if (!displayStr) return null;

                const date = parse12HourStringToDate(displayStr);
                if (!date) return null;


                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const hours = String(date.getHours()).padStart(2, "0");
                const minutes = "00";
                const seconds = "00";

                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            };

            const payload = {
                category: data.category.toUpperCase().trim(),
                title: data.title.trim(),
                description: data.description.trim(),
                image: data.photo_base64 || null,
                group_ids: data.group_ids,
                schedule_start: formatToBackend(data.schedule_start),
                schedule_end: formatToBackend(data.schedule_end),
            };

            console.log("Sending payload:", payload);

            await createNotificationMutation.mutateAsync(payload);
            setSubmitSuccess("Notification created successfully!");
            setTimeout(() => router.push("/notification_management"), 2000);
        } catch (err: any) {
            setSubmitError(err?.message || "Failed to create notification");
        }
    };



    const handleCancel = () => {
        if (onCancel) onCancel();
        else router.push("/notification_management");
    };
    const onInvalidSubmit = () => {
        if (imageInvalid) {
            setError("photo_base64", {
                type: "manual",
                message: "Only image files (JPG, PNG) are allowed",
            });
        }
    };





    const hourlyOptions = {
        time_24hr: true,
        minuteIncrement: 60,
        noCalendar: false,
        enableTime: true,
        dateFormat: "Y-m-d H:i",

        onReady: (selectedDates: any, dateStr: any, instance: any) => {
            const minuteElement = instance.timeContainer?.querySelector(".flatpickr-minute");
            if (minuteElement) {
                minuteElement.style.display = "none";
            }

            const colon = instance.timeContainer?.querySelector(".flatpickr-time span:nth-child(2)");
            if (colon) colon.style.display = "none";
        },

        onChange: (selectedDates: any, dateStr: any, instance: any) => {
            if (selectedDates[0]) {
                selectedDates[0].setMinutes(0);
                selectedDates[0].setSeconds(0);
                instance.setDate(selectedDates[0], true);
            }
        },
    };

    return (
        <div className="mx-auto w-full max-w-4xl">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="font-stc-bold mb-2 text-2xl text-gray-900">
                        Create New Notification
                    </h2>
                    <p className="text-sm text-gray-600">
                        Configure the notification details, target groups, and schedule.
                    </p>
                </div>


                <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                        <Controller
                            name="category"
                            control={control}
                            render={({ field: { value, onChange }, fieldState: { error } }) => (
                                <DynamicAutocomplete
                                    label="Category *"
                                    options={[
                                        { id: "PROMOTIONAL", name: "PROMOTIONAL" },
                                        { id: "SYSTEM", name: "SYSTEM" },
                                    ]}
                                    value={value || null}
                                    onChange={(val) => onChange(val)}
                                    getOptionLabel={(o) => o.name}
                                    getOptionValue={(o) => o.id}
                                    error={!!error}
                                    helperText={error?.message}
                                />
                            )}
                        />



                        <Controller
                            name="group_ids"
                            control={control}
                            render={({ field: { onChange, value = [] }, fieldState: { error } }) => (
                                <div className="w-full ">
                                    <DynamicAutocomplete
                                        label="Target Groups *"
                                        options={groups.map((g: any) => ({
                                            id: g.group_id,
                                            name: g.group_name || `Group ${g.group_id}`,
                                        }))}
                                        loading={groupsLoading}
                                        value={value}
                                        onChange={(selected: any) => {
                                            const ids = (Array.isArray(selected) ? selected : [])
                                                .map((item: any) => {
                                                    if (typeof item === "object" && item?.group_id != null)
                                                        return Number(item.group_id);
                                                    if (typeof item === "number") return item;
                                                    return null;
                                                })
                                                .filter((id): id is number => id !== null && !isNaN(id));
                                            onChange(ids);
                                        }}
                                        getOptionLabel={(option: any) => {
                                            if (typeof option === "object" && option.name) return option.name;
                                            const group = groups.find((g: any) => g.group_id === option);
                                            return group?.group_name || `Group ${option}`;
                                        }}
                                        getOptionValue={(option: any) =>
                                            typeof option === "object" ? option.id : option
                                        }
                                        multiple
                                        error={!!error}
                                    />
                                </div>
                            )}
                        />



                        <div className="md:col-span-2">
                            <InputField<NotificationFormData>
                                name="title"
                                control={control}
                                label={
                                    <>
                                        Notification Title <span >*</span>
                                    </>
                                }
                                placeholder="Enter a clear and concise title"
                            />

                        </div>

                        <Controller
                            name="schedule_start"
                            control={control}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <DatePicker
                                    id={startDateId}
                                    label="Schedule Start"
                                    placeholder="Select date and hour"
                                    enableTime={true}
                                    hourOnly={true}
                                    dateFormat="Y-m-d h K"
                                    defaultDate={
                                        value
                                            ? parse12HourStringToDate(value)
                                            : getNextValidHourDate()
                                    }


                                    onChange={(selectedDates, dateStr) => {
                                        if (!selectedDates?.[0] || !dateStr) {
                                            onChange(null);
                                            return;
                                        }

                                        const selected = selectedDates[0];
                                        const today = getBahrainNow();
                                        const isToday =
                                            selected.getFullYear() === today.getFullYear() &&
                                            selected.getMonth() === today.getMonth() &&
                                            selected.getDate() === today.getDate();

                                        const finalDate = new Date(selected);

                                        if (isToday) {
                                            const now = getBahrainNow();
                                            const currentHour = now.getHours();
                                            const currentMinutes = now.getMinutes();


                                            const selectedHour24 = finalDate.getHours();


                                            if (
                                                selectedHour24 < currentHour ||
                                                (selectedHour24 === currentHour && currentMinutes > 0)
                                            ) {

                                                finalDate.setHours(currentHour + 1);
                                                finalDate.setMinutes(0);
                                                finalDate.setSeconds(0);
                                            } else {

                                                finalDate.setMinutes(0);
                                                finalDate.setSeconds(0);
                                            }
                                        } else {

                                            finalDate.setMinutes(0);
                                            finalDate.setSeconds(0);
                                        }


                                        const formatted = finalDate.toLocaleString("en-US", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "numeric",
                                            hour12: true,
                                            minute: "2-digit",
                                        })
                                            .replace(/,/, "")
                                            .replace(/:00 /, " ");

                                        onChange(formatted);
                                    }}
                                    error={!!error}
                                    helperText={error?.message}
                                />
                            )}
                        />


                        <Controller
                            name="schedule_end"
                            control={control}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <DatePicker
                                    id={endDateId}
                                    label="Schedule End"
                                    placeholder="Select date and hour "
                                    enableTime={true}
                                    hourOnly={true}
                                    dateFormat="Y-m-d h K"
                                    defaultDate={value ? parse12HourStringToDate(value) : undefined}
                                    onChange={(selectedDates, dateStr) => {

                                        hasUserEditedEnd.current = true;

                                        if (!selectedDates?.[0]) {
                                            onChange(null);
                                            return;
                                        }

                                        const selected = selectedDates[0];
                                        selected.setMinutes(0);
                                        selected.setSeconds(0);

                                        const formatted = selected.toLocaleString("en-US", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "numeric",
                                            hour12: true,
                                            minute: "2-digit",
                                        })
                                            .replace(/,/g, "")
                                            .replace(/:00 /, " ");

                                        onChange(formatted);
                                    }}
                                    error={!!error}
                                    helperText={
                                        error
                                            ? error.message
                                            : "Optional: Notification stays active until manually stopped if not set"
                                    }
                                />
                            )}
                        />



                        <div className="md:col-span-2">
                            <Controller
                                name="description"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <div className="space-y-2">
                                        <UiTextArea
                                            {...field}
                                            label="Description *"
                                            placeholder="Describe the notification in detail..."
                                            minRows={4}
                                            maxRows={8}
                                            value={field.value || ""}
                                            error={!!error}
                                            helperText={error?.message}
                                            className="w-full"
                                        />
                                    </div>
                                )}
                            />
                        </div>


                        <div className="md:col-span-2">
                            <Controller
                                name="photo_base64"
                                control={control}
                                render={({ field: { value, onChange }, fieldState: { error } }) => (
                                    <Box className="flex flex-col gap-2">
                                        <Typography variant="body1" fontWeight="medium">
                                            Notification Image (Optional)
                                        </Typography>

                                        <Box className="flex items-center gap-6">
                                            {value && (
                                                <img
                                                    src={value}
                                                    alt="Preview"
                                                    className="h-32 w-32 rounded-lg object-cover border"
                                                />
                                            )}
                                            <FileInput
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];

                                                  
                                                    clearErrors("photo_base64");
                                                    setImageInvalid(false);

                                                    if (!file) return;

                                                  
                                                    if (!file.type.startsWith("image/")) {
                                                        setImageInvalid(true);
                                                        return;
                                                    }

                                                 
                                                    if (file.size > 2 * 1024 * 1024) {
                                                        setImageInvalid(true);
                                                        return;
                                                    }

                                                 
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setValue("photo_base64", reader.result as string, {
                                                            shouldValidate: true,
                                                        });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }}
                                            />


                                        </Box>


                                        {error && (
                                            <p className="text-sm text-red-400 mt-1 ml-2">
                                                {error.message}
                                            </p>
                                        )}


                                    </Box>
                                )}
                            />

                        </div>
                    </div>

                    <div className="mt-8 flex flex-col justify-end gap-4 sm:flex-row">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {createNotificationMutation.isPending ? "Creating..." : "Create Notification"}
                        </Button>
                    </div>
                </form>
                <Snackbar
                    open={Boolean(submitSuccess || submitError)}
                    autoHideDuration={6000}
                    onClose={() => {
                        setSubmitSuccess(null);
                        setSubmitError(null);
                    }}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                >
                    <Alert
                        severity={submitSuccess ? "success" : "error"}
                        variant="filled"
                        onClose={() => {
                            setSubmitSuccess(null);
                            setSubmitError(null);
                        }}
                    >
                        {submitSuccess || submitError}
                    </Alert>
                </Snackbar>

            </div>
        </div>
    );
};

export default NotificationBasicInfo;