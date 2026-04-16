"use client";

import React, { useState } from "react";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { FormLabel } from "@mui/material";
import Switch from "@/components/form/switch/Switch";
import { DynamicAutocomplete } from "@/components/form/group-input/Autocomplete";
import FileInputExample from "@/components/form/form-elements/FileInputExample";
import { useNationalities, useIdTypes } from "@/hooks/useLookups";
import { useManagers } from "@/hooks/useApi";
import { DatePicker } from "antd";
import dayjs from "dayjs";

type SimpleOption = {
    id: string;
    name: string;
};



type NationalityOption = {
    nationality_code: string;
    nationality_desc: string;
};

type IdTypeOption = {
    id: number;
    idtype_name: string;
};


const genderOptions = [
    { id: "M", name: "Male" },
    { id: "F", name: "Female" },
    { id: "O", name: "Other" },
];

const userTypeOptions = [
    { id: "Agent", name: "Agent" },
    { id: "Dealer", name: "Dealer" },
];
type GenderOption = {
    id: string;
    name: string;
};


const notificationOptions = [
    { id: "Email", name: "Email" },
    { id: "Push", name: "Push" },
    { id: "SMS", name: "SMS" },

];
const todayISO = new Date().toISOString().split("T")[0];

const disableFutureDates = (current: dayjs.Dayjs) => {
    return current && current > dayjs().endOf("day");
};

const isFutureDate = (dateStr: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) > new Date(todayISO);
};
const normalizeBirthDate = (date?: string) => {
    if (!date) return "";


    if (dayjs(date, "YYYY-MM-DD", true).isValid()) {
        return dayjs(date, "YYYY-MM-DD").format("DD-MM-YYYY");
    }


    if (dayjs(date, "DD-MM-YYYY", true).isValid()) {
        return date;
    }

    return "";
};
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const isValidImageFile = (file: File) =>
    ALLOWED_IMAGE_TYPES.includes(file.type);


export default function UserEditProfileInfo({
    user,
    onPrev,
    onSubmit,
    isSubmitting,
}: any) {
    const profile = user?.profile ?? {};


    const { data: nationalityList = [] } = useNationalities();
    const { data: idTypeList = [] } = useIdTypes();
    const { data: managersList } = useManagers();

    const managers = managersList?.data?.users ?? [];


    const [formData, setFormData] = useState({
        email: profile.email || "",
        phone_number: profile.phone_number || "",
        user_type: profile.user_type || "",


        gender: profile.gender || "",

        birth_date: normalizeBirthDate(profile.birth_date),

        employer_ID: profile.employer_ID || "",
        dealer_id: profile.dealer_id || "",
        shop_id: profile.shop_id || "",
        reporting_to: profile.reporting_to || "",
        company_id: profile.company_id?.toString() || "",
        idtype_id: profile.idtype_id || null,
        idnumber: profile.idnumber || "",
        nationality_code: profile.nationality_code || null,
        job_title: profile.job_title || "",
        mm_id: profile.mm_id || "",
        wallet_msisdn: profile.wallet_msisdn || "",
        mnp_charge: profile.mnp_charge || "",
        sim_swap_charge: profile.sim_swap_charge || "",
        terminalid: profile.terminalid || "",
        posid: profile.posid || "",
        send_notification_type: profile.send_notification_type ?? "",

        is_suspicious: true,
    
        photo_base64: user?.profile_photo ?? null,
        photo_updated: false,

    });
    const [birthDateError, setBirthDateError] = useState<string | null>(null);
    const [photoError, setPhotoError] = useState<string | null>(null);






    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];


        setPhotoError(null);

        if (!file) return;


        if (!isValidImageFile(file)) {
            setPhotoError("Only image files are allowed (JPG, PNG, WEBP)");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            setFormData((prev) => ({
                ...prev,
                photo_base64: reader.result as string,
                photo_updated: true,
            }));
        };

        reader.readAsDataURL(file);
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.birth_date && isFutureDate(formData.birth_date)) {
            setBirthDateError("Date of birth cannot be in the future");
            return;
        }

        const formattedBirthDate = formData.birth_date
            ? dayjs(formData.birth_date, "DD-MM-YYYY").format("YYYY-MM-DD")
            : null;

        const payload = {
            ...formData,
            birth_date: formattedBirthDate,

            gender: formData.gender,
            nationality_code: formData.nationality_code,
            idtype_id: formData.idtype_id,


            is_suspicious: formData.is_suspicious ? 1 : 0,
        };

        onSubmit?.(payload);
    };


    return (
        <div className="w-full rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
            <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 gap-7 md:grid-cols-2">

                    <InputField
                        label="Email"
                        value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    />

                    <InputField
                        label="Phone Number"
                        value={formData.phone_number}
                        onChange={e => setFormData(p => ({ ...p, phone_number: e.target.value }))}
                    />

                    <DynamicAutocomplete<GenderOption>
                        label="Gender"
                        options={genderOptions}
                        value={formData.gender}
                        onChange={val =>
                            setFormData(p => ({ ...p, gender: val }))
                        }
                        getOptionLabel={o => o.name}
                        getOptionValue={o => o.id}
                    />





                    <div className="flex flex-col">


                        <DatePicker
                            style={{ width: "100%" }}
                            className="dob-picker"
                            placeholder="Select Birth Date"
                            format="DD-MM-YYYY"
                            value={
                                formData.birth_date
                                    ? dayjs(formData.birth_date, "DD-MM-YYYY")
                                    : null
                            }
                            disabledDate={disableFutureDates}
                            inputReadOnly
                            onChange={(date) => {
                                const value = date ? date.format("DD-MM-YYYY") : "";

                                setFormData((p) => ({ ...p, birth_date: value }));

                                if (date && date.isAfter(dayjs(), "day")) {
                                    setBirthDateError("Date of birth cannot be in the future");
                                } else {
                                    setBirthDateError(null);
                                }
                            }}
                        />

                        {birthDateError && (
                            <span className="mt-1 text-sm text-red-600">
                                {birthDateError}
                            </span>
                        )}
                    </div>





                    <InputField
                        label="Employer ID"
                        value={formData.employer_ID}
                        onChange={e => setFormData(p => ({ ...p, employer_ID: e.target.value }))}
                    />

                    <DynamicAutocomplete
                        label="User Type *"
                        options={userTypeOptions}
                        value={formData.user_type}
                        onChange={val => setFormData(p => ({ ...p, user_type: val }))}
                        getOptionLabel={o => o.name}
                        getOptionValue={o => o.id}
                    />

                    <DynamicAutocomplete<SimpleOption>
                        label="Reporting Manager"
                        options={managers.map((m: any) => ({
                            id: m.user_name,
                            name: m.user_name,
                        }))}
                        value={formData.reporting_to}
                        onChange={val => setFormData(p => ({ ...p, reporting_to: val }))}
                        getOptionLabel={o => o.name}
                        getOptionValue={o => o.id}
                    />

                    <InputField
                        label="Dealer ID"
                        value={formData.dealer_id}
                        onChange={e => setFormData(p => ({ ...p, dealer_id: e.target.value }))}
                    />

                    <InputField
                        label="Shop ID"
                        value={formData.shop_id}
                        onChange={e => setFormData(p => ({ ...p, shop_id: e.target.value }))}
                    />

                    <InputField
                        label="Company ID"
                        value={formData.company_id}
                        onChange={e => setFormData(p => ({ ...p, company_id: e.target.value }))}
                    />

                    <DynamicAutocomplete<IdTypeOption>
                        label="ID Type"
                        options={idTypeList}
                        value={formData.idtype_id}
                        onChange={val => setFormData(p => ({ ...p, idtype_id: val }))}
                        getOptionLabel={(o: any) => o.idtype_name}
                        getOptionValue={(o: any) => o.id}
                    />

                    <InputField
                        label="ID Number"
                        value={formData.idnumber}
                        onChange={e => setFormData(p => ({ ...p, idnumber: e.target.value }))}
                    />

                    <DynamicAutocomplete<NationalityOption>
                        label="Nationality"
                        options={nationalityList}
                        value={formData.nationality_code}
                        onChange={val => setFormData(p => ({ ...p, nationality_code: val }))}
                        getOptionLabel={(o: any) => o.nationality_desc}
                        getOptionValue={(o: any) => o.nationality_code}
                    />

                    <InputField
                        label="Job Title"
                        value={formData.job_title}
                        onChange={e => setFormData(p => ({ ...p, job_title: e.target.value }))}
                    />

                    <InputField
                        label="MM ID"
                        value={formData.mm_id}
                        onChange={e => setFormData(p => ({ ...p, mm_id: e.target.value }))}
                    />

                    <InputField
                        label="Wallet MSISDN"
                        value={formData.wallet_msisdn}
                        onChange={e => setFormData(p => ({ ...p, wallet_msisdn: e.target.value }))}
                    />

                    <DynamicAutocomplete<SimpleOption>
                        label="Notification Type"
                        options={notificationOptions}
                        value={formData.send_notification_type}
                        onChange={val =>
                            setFormData(p => ({ ...p, send_notification_type: val }))
                        }
                        getOptionLabel={o => o.name}
                        getOptionValue={o => o.id}
                    />

                    <div className="flex flex-col">
                        <FormLabel className="font-stc-medium text-sm text-gray-700">
                            Is Suspicious
                        </FormLabel>
                        <Switch
                            checked={Boolean(formData.is_suspicious)}
                            onChange={v => setFormData(p => ({ ...p, is_suspicious: v }))}
                            activeLabel="Yes"
                            inactiveLabel="No"
                        />
                    </div>


                    <div className="col-span-1 md:col-span-2">
                        {formData.photo_base64 ? (
                            <>
                                <div className="mb-6">
                                    <FormLabel className="font-stc-medium text-sm text-gray-700">
                                        Current Profile Photo
                                    </FormLabel>

                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src={formData.photo_base64}
                                            alt="Current profile photo"
                                            className="h-48 w-48 rounded-full object-cover border-4 border-gray-300 shadow-lg"
                                        />
                                    </div>
                                </div>

                                <FileInputExample
                                    label="Change Profile Photo"
                                    onChange={handleFileChange}
                                />
                            </>
                        ) : (
                            <FileInputExample
                                label="Upload Profile Photo"
                                onChange={handleFileChange}
                            />
                        )}


                        {photoError && (
                            <span className="mt-2 block text-sm text-red-600">
                                {photoError}
                            </span>
                        )}
                    </div>


                </div>

                <div className="mt-7 flex justify-end gap-5">
                    <Button type="button" variant="outline" onClick={onPrev}>
                        Prev
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update User"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
