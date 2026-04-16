"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import InputField from "@/components/form/input/InputField";
import FileInput from "@/components/form/input/FileInput";
import UiTextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { Alert, Box, Typography } from "@mui/material";
import { DynamicAutocomplete } from "@/components/form/group-input/Autocomplete";
import { useId } from "react";
import DatePicker from "@/components/form/Date-Time-Picker";
import { useGroups } from "@/hooks/useGroups";



const getBahrainNow = (): Date => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bahrain" }));
};

const parse12HourStringToDate = (str?: string): Date | undefined => {
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


const schema = yup.object({
  category: yup.string().required("Category is required").max(50),
  title: yup.string().required("Title is required").max(200),
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
        if (!value) return true; // optional field
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
      "Only image files (JPG, PNG) are allowed",
      (value) => !value || value.startsWith("data:image/")
    ),

});

type FormData = yup.InferType<typeof schema>;


const backendToDisplay = (value?: string) => {
  if (!value) return undefined;

  return new Date(value)
    .toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      hour12: true,
      minute: "2-digit",
    })
    .replace(/,/g, "")
    .replace(/:00 /, " ");
};

const formatToBackendWithoutSeconds = (displayStr?: string): string | null => {
  if (!displayStr) return null;

  const date = parse12HourStringToDate(displayStr);
  if (!date || isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};


interface NotificationEditFormProps {
  notification: any;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}



export default function NotificationEditForm({
  notification,
  onSubmit,
  onCancel,
  isSubmitting,
}: NotificationEditFormProps) {
  const [imageInvalid, setImageInvalid] = React.useState(false);

  const { data: groupsData, isLoading: groupsLoading } = useGroups();
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
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: "onChange",
    defaultValues: {
      category: notification?.category ?? "",
      title: notification?.title ?? "",
      description: notification?.description ?? "",
      group_ids: notification?.groups?.map((g: any) => g.id) ?? [],
      schedule_start: backendToDisplay(notification?.schedule_start),
      schedule_end: backendToDisplay(notification?.schedule_end),
      photo_base64: notification?.image ?? "",
    },
  });

  const scheduleStart = useWatch({ control, name: "schedule_start" });
  const hasUserEditedEnd = React.useRef(false);


  useEffect(() => {
    if (scheduleStart && !hasUserEditedEnd.current) {
      const startDate = parse12HourStringToDate(scheduleStart);
      if (!startDate) return;

      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);

      const formatted = endDate
        .toLocaleString("en-US", {
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
    if (!notification) return;

    reset({
      category: notification.category ?? "",
      title: notification.title ?? "",
      description: notification.description ?? "",
      group_ids: notification.groups?.map((g: any) => g.id) ?? [],
      schedule_start: backendToDisplay(notification.schedule_start),
      schedule_end: backendToDisplay(notification.schedule_end),
      photo_base64: notification.image ?? "",
    });

    hasUserEditedEnd.current = false;
  }, [notification, reset]);

  const onFormSubmit = (data: FormData) => {
    if (imageInvalid) {
      setError("photo_base64", {
        type: "manual",
        message: "Only image files (JPG, PNG) are allowed",
      });
      return;
    }

    const payload = {
      ...data,
      category: data.category.toUpperCase().trim(),
      title: data.title.trim(),
      description: data.description.trim(),
      schedule_start: formatToBackendWithoutSeconds(data.schedule_start),
      schedule_end: formatToBackendWithoutSeconds(data.schedule_end),
    };

    onSubmit(payload);
  };


  const onInvalidSubmit = () => {
    if (imageInvalid) {
      setError("photo_base64", {
        type: "manual",
        message: "Only image files (JPG, PNG) are allowed",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="font-stc-bold mb-2 text-2xl text-gray-900">
            Edit Notification
          </h2>
          <p className="text-sm text-gray-600">
            Configure the notification details, target groups, and schedule.
          </p>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit, onInvalidSubmit)}>
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
              <InputField<FormData>
                name="title"
                control={control}
                label="Notification Title"
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
                  placeholder="Select date and hour (optional)"
                  enableTime={true}
                  hourOnly={true}
                  dateFormat="Y-m-d h K"
                  defaultDate={
                    value
                      ? parse12HourStringToDate(value)
                      : notification?.schedule_start
                        ? parse12HourStringToDate(backendToDisplay(notification.schedule_start))
                        : undefined
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

                    const formatted = finalDate
                      .toLocaleString("en-US", {
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
                      : "Optional: Notification will be sent immediately if not set"
                  }
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
                  placeholder="Select date and hour (optional)"
                  enableTime={true}
                  hourOnly={true}
                  dateFormat="Y-m-d h K"
                  defaultDate={value ? parse12HourStringToDate(value) : undefined}
                  onChange={(selectedDates) => {
                    hasUserEditedEnd.current = true;

                    if (!selectedDates?.[0]) {
                      onChange(null);
                      return;
                    }

                    const selected = selectedDates[0];
                    selected.setMinutes(0);
                    selected.setSeconds(0);

                    const formatted = selected
                      .toLocaleString("en-US", {
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
                render={({ field: { value, onChange } }) => (
                  <Box className="flex flex-col gap-4">
                    <Typography variant="body1" fontWeight="medium">
                      Notification Image (Optional)
                    </Typography>
                    <Box className="flex items-center gap-6">
                      {value && (
                        <img
                          src={
                            typeof value === "string" && value.startsWith("data:")
                              ? value
                              : `data:image/jpeg;base64,${value}`
                          }
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
                            setError("photo_base64", {
                              type: "manual",
                              message: "Only image files (JPG, PNG) are allowed",
                            });
                            setValue("photo_base64", null); 
                            return;
                          }


                          if (file.size > 2 * 1024 * 1024) {
                            setImageInvalid(true);
                            setError("photo_base64", {
                              type: "manual",
                              message: "Image must be less than 2MB",
                            });
                            setValue("photo_base64", null);
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
                    {errors.photo_base64 && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.photo_base64.message}
                      </p>
                    )}
                  </Box>
                )}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-end gap-4 sm:flex-row">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Notification"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

