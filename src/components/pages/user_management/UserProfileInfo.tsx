"use client";

import React, { useState } from "react";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { FormLabel } from "@mui/material";
import Switch from "@/components/form/switch/Switch";
import { DynamicAutocomplete } from "../../form/group-input/Autocomplete";
import FileInputExample from "../../form/form-elements/FileInputExample";
import { useNationalities, useIdTypes } from "@/hooks/useLookups";
import { useManagers } from "@/hooks/useApi";
import { MenuItem, TextField } from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
import { DatePicker } from "antd";
import dayjs from "dayjs";



interface NationalityOption {
  nationality_code: string;
  nationality_desc: string;
}

interface IdTypeOption {
  id: number;
  idtype_name: string;
}

interface GenderOption {
  id: string;
  name: string;
}

interface NotificationOption {
  id: string;
  name: string;
}

interface UserProfileProps {
  onPrev?: () => void;
  onSubmit?: (profile: any) => void | Promise<void>;
  isSubmitting?: boolean;
}


const genderOptions: GenderOption[] = [
  { id: "M", name: "Male" },
  { id: "F", name: "Female" },
  { id: "O", name: "Other" },
];

const userTypeOptions = [
  { id: "Agent", name: "Agent" },
  { id: "Dealer", name: "Dealer" },
];

const notificationOptions: NotificationOption[] = [
  { id: "Email", name: "Email" },
  { id: "Push", name: "Push" },
  { id: "SMS", name: "SMS" },
];

const sanitizeAlphanumericSpace = (s: string, max = 50) =>
  s.replace(/[^A-Za-z0-9\s]/g, "").slice(0, max);

const sanitizeAlpha = (s: string) => s.replace(/[^A-Za-z\s]/g, "").slice(0, 50);
const sanitizeAlphaFull = (s: string, max = 50) =>
  s.replace(/[^A-Za-z\s]/g, "").slice(0, max);
const sanitizeAlphanumeric = (s: string, max = 50) =>
  s.replace(/[^A-Za-z0-9]/g, "").slice(0, max);
const sanitizeAlphanumericUnderscore = (s: string, max = 50) =>
  s.replace(/[^A-Za-z0-9_]/g, "").slice(0, max);
const sanitizeDigits = (s: string, max = 15) =>
  s.replace(/[^0-9]/g, "").slice(0, max);
const sanitizeDigitsAny = (s: string, max = 100) =>
  s.replace(/[^0-9]/g, "").slice(0, max);
const sanitizeAlnumMax = (s: string, max = 100) =>
  s.replace(/[^A-Za-z0-9]/g, "").slice(0, max);


function sanitizeChargeInput(value: string) {

  let v = value.replace(/[^0-9.]/g, "");

  const firstDotIndex = v.indexOf(".");
  if (firstDotIndex !== -1) {
    v = v.slice(0, firstDotIndex + 1) + v.slice(firstDotIndex + 1).replace(/\./g, "");
  }

  if (firstDotIndex !== -1) {
    const [intPart, decPart] = v.split(".");
    v = intPart.slice(0, 9) + "." + (decPart || "").slice(0, 2);
  }
  return v.slice(0, 10);
}

const isEmailFormatValid = (s: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const isEmailLengthValid = (s: string) => s.length <= 50;

const disableFutureDates = (current: dayjs.Dayjs) => {
  return current && current > dayjs().endOf("day");
};

const isPastDate = (isoDate: string) => {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();

  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return d.getTime() < t0.getTime();
};

const todayISO = new Date().toISOString().split("T")[0];


const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];
const UserProfile: React.FC<UserProfileProps> = ({
  onPrev,
  onSubmit,
  isSubmitting,
}) => {
  const [isManager, setIsManager] = useState(false);
  const [employerId, setEmployerId] = useState("");

  const [suspicious, setIsSuspicious] = useState(false);

  const [userType, setUserType] = useState("");

  const [userTypeError, setUserTypeError] = useState<string | null>(null);
  const [snackError, setSnackError] = useState<string | null>(null);

  const { data: nationalityList = [], isLoading } = useNationalities();
  const { data: idTypeList = [], isLoading: isIdTypeLoading } = useIdTypes();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState<GenderOption | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [dealerId, setDealerId] = useState("");
  const [shopId, setShopId] = useState("");
  const [reportingTo, setReportingTo] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [idtypeId, setIdtypeId] = useState<IdTypeOption | null>(null);
  const [idNumber, setIdNumber] = useState("");
  const [nationalityCode, setNationalityCode] =
    useState<NationalityOption | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [mmId, setMmId] = useState("");
  const [walletMsisdn, setWalletMsisdn] = useState("");
  const [mnpCharge, setMnpCharge] = useState("");
  const [simSwapCharge, setSimSwapCharge] = useState("");
  const [terminalId, setTerminalId] = useState("");
  const [posId, setPosId] = useState("");
  const [genderError, setGenderError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);




  const { data: managersList } = useManagers();

  const managers = managersList?.data?.users ?? [];

  const [notificationType, setNotificationType] = useState<string | null>(null);



  const [photoBase64, setPhotoBase64] = useState<string | null>(null);


  const [emailError, setEmailError] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(
    null
  );

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [birthDateError, setBirthDateError] = useState<string | null>(null);

  const [employerIdError, setEmployerIdError] = useState<string | null>(null);
  const [dealerIdError, setDealerIdError] = useState<string | null>(null);
  const [shopIdError, setShopIdError] = useState<string | null>(null);

  const [companyIdError, setCompanyIdError] = useState<string | null>(null);
  const [idNumberError, setIdNumberError] = useState<string | null>(null);
  const [idTypeError, setIdTypeError] = useState<string | null>(null);

  const [jobTitleError, setJobTitleError] = useState<string | null>(null);
  const [mmIdError, setMmIdError] = useState<string | null>(null);
  const [walletMsisdnError, setWalletMsisdnError] = useState<string | null>(
    null
  );
  const [mnpChargeError, setMnpChargeError] = useState<string | null>(null);
  const [simSwapChargeError, setSimSwapChargeError] = useState<string | null>(
    null
  );
  const [terminalIdError, setTerminalIdError] = useState<string | null>(null);
  const [posIdError, setPosIdError] = useState<string | null>(null);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }



    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setPhotoBase64(null);
      setPhotoError("Only image files are allowed (JPG, PNG, WEBP)");
      return;
    }


    setPhotoError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    let hasValidationError = false;
    if (photoError) {
      setSnackError("Validation Failed");
      return;
    }




    if (!onSubmit) return;


    setEmailError(null);
    setNotificationError(null);
    setPhoneError(null);
    setBirthDateError(null);
    setEmployerIdError(null);
    setDealerIdError(null);
    setShopIdError(null);
    setCompanyIdError(null);
    setIdNumberError(null);
    setIdTypeError(null);
    setJobTitleError(null);
    setMmIdError(null);
    setWalletMsisdnError(null);
    setMnpChargeError(null);
    setSimSwapChargeError(null);
    setTerminalIdError(null);
    setPosIdError(null);

    if (!email) {
      setEmailError("Email is required.");
      hasValidationError = true;
    } else if (!isEmailFormatValid(email)) {
      setEmailError("Invalid email address.");
      hasValidationError = true;
    } else if (!isEmailLengthValid(email)) {
      setEmailError("Email must not exceed 50 characters.");
      hasValidationError = true;
    }



    if (!userType) {
      setUserTypeError("User Type is required.");
      hasValidationError = true;
    }





    if (phoneNumber && !/^[0-9]{1,8}$/.test(phoneNumber)) {
      setPhoneError("Phone must be digits only (max 8).");
    }


    if (birthDate && !isPastDate(birthDate)) {
      setBirthDateError("Date of birth must be a past date.");
    }

    if (employerId && !/^[A-Za-z0-9]{1,50}$/.test(employerId)) {
      setEmployerIdError("Employer ID: only alphanumeric, max 50 characters.");
    }
    if (dealerId && !/^[A-Za-z0-9]{1,50}$/.test(dealerId)) {
      setDealerIdError("Dealer ID: only alphanumeric, max 50 characters.");
    }
    if (shopId && !/^[A-Za-z0-9\s]{1,50}$/.test(shopId)) {
      setShopIdError("Shop ID: alphanumeric with spaces allowed (max 50 characters).");
    }

    if (companyId && !/^[0-9]{1,15}$/.test(companyId)) {
      setCompanyIdError("Company ID must be integer digits only (max 15).");
    }

    if (idtypeId === null) {

      if (idNumber) setIdTypeError("Select ID Type.");
    }

    if (idNumber && !/^[A-Za-z0-9]{1,50}$/.test(idNumber)) {
      setIdNumberError("ID Number: only alphanumeric, max 50 characters.");
    }

    if (jobTitle && !/^[A-Za-z\s]{1,50}$/.test(jobTitle)) {
      setJobTitleError("Job Title: only letters and spaces, max 50 characters.");
    }

    if (mmId && !/^[A-Za-z0-9]{1,100}$/.test(mmId)) {
      setMmIdError("MM ID: only alphanumeric, max 100 characters.");
    }

    if (walletMsisdn && !/^[0-9]{1,100}$/.test(walletMsisdn)) {
      setWalletMsisdnError("Wallet MSISDN: digits only, max 100 characters.");
    }


    if (mnpCharge) {
      const san = sanitizeChargeInput(mnpCharge);
      if (!/^\d+(\.\d{1,2})?$/.test(san)) {
        setMnpChargeError("MNP Charge invalid (max 10 chars, up to 2 decimals).");
      }
    }
    if (simSwapCharge) {
      const san = sanitizeChargeInput(simSwapCharge);
      if (!/^\d+(\.\d{1,2})?$/.test(san)) {
        setSimSwapChargeError("SIM Swap Charge invalid (max 10 chars, up to 2 decimals).");
      }
    }

    if (terminalId && !/^[A-Za-z0-9]{1,10}$/.test(terminalId)) {
      setTerminalIdError("Terminal ID: only alphanumeric, max 10 characters.");
    }

    if (posId && !/^[A-Za-z0-9]{1,10}$/.test(posId)) {
      setPosIdError("POS ID: only alphanumeric, max 10 characters.");
    }



    const anyErrors =
      emailError ||
      notificationError ||
      phoneError ||
      birthDateError ||
      employerIdError ||
      dealerIdError ||
      shopIdError ||
      companyIdError ||
      idNumberError ||
      idTypeError ||
      jobTitleError ||
      mmIdError ||
      walletMsisdnError ||
      mnpChargeError ||
      simSwapChargeError ||
      terminalIdError ||
      posIdError;


    const currentHasErrors =
      !!emailError ||
      !!notificationError ||
      !!phoneError ||
      !!birthDateError ||
      !!employerIdError ||
      !!dealerIdError ||
      !!shopIdError ||
      !!companyIdError ||
      !!idNumberError ||
      !!idTypeError ||
      !!jobTitleError ||
      !!mmIdError ||
      !!walletMsisdnError ||
      !!mnpChargeError ||
      !!simSwapChargeError ||
      !!terminalIdError ||
      !!posIdError;


    const immediateErrors =
      (!email) ||
      (!notificationType) ||
      (phoneNumber && !/^[0-9]{1,8}$/.test(phoneNumber)) ||
      (birthDate && !isPastDate(birthDate)) ||
      (employerId && !/^[A-Za-z0-9]{1,50}$/.test(employerId)) ||
      (dealerId && !/^[A-Za-z0-9]{1,50}$/.test(dealerId)) ||
      (shopId && !/^[A-Za-z0-9]{1,50}$/.test(shopId)) ||
      (companyId && !/^[0-9]{1,15}$/.test(companyId)) ||
      (idNumber && !/^[A-Za-z0-9]{1,50}$/.test(idNumber)) ||
      (idNumber && idtypeId === null) ||
      (jobTitle && !/^[A-Za-z\s]{1,50}$/.test(jobTitle)) ||
      (mmId && !/^[A-Za-z0-9]{1,100}$/.test(mmId)) ||
      (walletMsisdn && !/^[0-9]{1,100}$/.test(walletMsisdn)) ||
      (mnpCharge && !/^\d+(\.\d{1,2})?$/.test(sanitizeChargeInput(mnpCharge))) ||
      (simSwapCharge && !/^\d+(\.\d{1,2})?$/.test(sanitizeChargeInput(simSwapCharge))) ||
      (terminalId && !/^[A-Za-z0-9]{1,10}$/.test(terminalId)) ||
      (posId && !/^[A-Za-z0-9]{1,10}$/.test(posId));

    if (hasValidationError) {
      setSnackError("Validation failed");
      return;
    }
    if (!notificationType) {
      setNotificationError("Notification Type is required.");
      hasValidationError = true;
    }
    const formattedBirthDate = birthDate
      ? dayjs(birthDate, "DD-MM-YYYY").format("YYYY-MM-DD")
      : null;

    const profilePayload = {
      Father: "Iam",
      email,
      user_type: userType || null,
      phone_number: phoneNumber,
      gender: gender,
      birth_date: formattedBirthDate,
      employer_ID: employerId,
      dealer_id: dealerId,
      shop_id: shopId,
      reporting_to: reportingTo,
      company_id: companyId,
      idtype_id: idtypeId,
      idnumber: idNumber,
      send_notification_type: notificationType,

      nationality_code: nationalityCode,
      job_title: jobTitle,
      mm_id: mmId,
      wallet_msisdn: walletMsisdn,
      mnp_charge: mnpCharge,
      sim_swap_charge: simSwapCharge,
      terminalid: terminalId,
      posid: posId,
      suspicious: suspicious ? 1 : 0,
      photo_base64: photoBase64,
    };



    await onSubmit(profilePayload);
  };

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2">


          <InputField
            label="Email"
            name="email"
            value={email}
            required
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = e.target.value.slice(0, 50);
              setEmail(val);
              if (emailError) setEmailError(null);
            }}
            error={!!emailError}
            helperText={emailError || undefined}
          />


          <InputField
            label="Phone Number"
            name="phone_number"
            value={phoneNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const next = sanitizeDigits(e.target.value, 8);

              setPhoneNumber(next);
              if (phoneError) setPhoneError(null);
            }}
            error={!!phoneError}
            helperText={phoneError || undefined}
          />


          <DynamicAutocomplete<GenderOption>
            label="Gender"
            options={genderOptions}
            value={gender}
            onChange={(val) => {
              setGender(val ?? null);
              setGenderError(null);
            }}
            getOptionLabel={(o) => o?.name ?? ""}
            getOptionValue={(o) => o?.id}
          />


          <DatePicker
            className="dob-picker"
            style={{ width: "100%" }}
            placeholder="Select Date of Birth"
            format="DD-MM-YYYY"
            value={birthDate ? dayjs(birthDate, "DD-MM-YYYY") : null}
            disabledDate={disableFutureDates}
            inputReadOnly
            onChange={(date) => {
              const value = date ? date.format("DD-MM-YYYY") : "";
              setBirthDate(value);
              setBirthDateError(null);
            }}
          />







          <InputField
            label="Employer ID"
            name="employer_ID"
            value={employerId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const next = sanitizeAlphanumeric(e.target.value, 50);
              setEmployerId(next);
              if (employerIdError) setEmployerIdError(null);
            }}
            error={!!employerIdError}
            helperText={employerIdError || undefined}
          />



          <DynamicAutocomplete
            label="User Type *"
            options={[
              { id: "Agent", name: "Agent" },
              { id: "Dealer", name: "Dealer" },
            ]}
            value={userType || null}
            onChange={(val) => {
              setUserType(val);
              setUserTypeError(null);
            }}
            getOptionLabel={(o) => o?.name ?? ""}
            getOptionValue={(o) => o?.id}

            error={!!userTypeError}
            helperText={userTypeError || ""}
          />

          <DynamicAutocomplete
            label="Reporting Manager"
            options={managers.map((mgr: any) => ({
              id: mgr.user_name,
              name: mgr.user_name,
            }))}
            value={reportingTo || null}
            onChange={(val) => {


              const selectedManager = managers.find(
                (m: any) => m.user_name === val
              );



              setReportingTo(val);
            }}
            getOptionLabel={(o: any) => o.name}
            getOptionValue={(o: any) => o.id}
          />



          <InputField
            label="Dealer ID"
            name="dealer_id"
            value={dealerId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const next = sanitizeAlphanumeric(e.target.value, 50);
              setDealerId(next);
              if (dealerIdError) setDealerIdError(null);
            }}
            error={!!dealerIdError}
            helperText={dealerIdError || undefined}
          />


          <InputField
            label="Shop ID"
            name="shop_id"
            value={shopId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const next = sanitizeAlphanumericSpace(e.target.value, 50);
              setShopId(next);
              if (shopIdError) setShopIdError(null);
            }}
            error={!!shopIdError}
            helperText={shopIdError || undefined}
          />


          <InputField
            label="Company ID"
            name="company_id"
            value={companyId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const next = sanitizeDigits(e.target.value, 15);
              setCompanyId(next);
              if (companyIdError) setCompanyIdError(null);
            }}
            error={!!companyIdError}
            helperText={companyIdError || undefined}
          />


          <DynamicAutocomplete<IdTypeOption>
            label="ID Type"
            options={idTypeList}
            loading={isIdTypeLoading}
            value={idtypeId}
            onChange={(val) => {
              setIdtypeId(val);
              if (idTypeError) setIdTypeError(null);
            }}
            getOptionLabel={(o) => o.idtype_name}
            getOptionValue={(o) => o.id}
          />


          <InputField
            label="ID Number"
            name="idnumber"
            value={idNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const next = sanitizeAlphanumeric(e.target.value, 50);
              setIdNumber(next);
              if (idNumberError) setIdNumberError(null);
            }}
            error={!!idNumberError}
            helperText={idNumberError || undefined}
          />


          <DynamicAutocomplete<NationalityOption>
            label="Nationality"
            options={nationalityList}
            loading={isLoading}
            value={nationalityCode}
            onChange={(val) => setNationalityCode(val)}
            getOptionLabel={(o) => o.nationality_desc}
            getOptionValue={(o) => o.nationality_code}
            placeholder="Select Nationality"
          />


          <InputField
            label="Job Title"
            name="job_title"
            value={jobTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const next = sanitizeAlphaFull(e.target.value, 50);
              setJobTitle(next);
              if (jobTitleError) setJobTitleError(null);
            }}
            error={!!jobTitleError}
            helperText={jobTitleError || undefined}
          />


          <InputField
            label="MM ID"
            name="mm_id"
            value={mmId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const next = sanitizeAlnumMax(e.target.value, 100);
              setMmId(next);
              if (mmIdError) setMmIdError(null);
            }}
            error={!!mmIdError}
            helperText={mmIdError || undefined}
          />

          <InputField
            label="Wallet MSISDN"
            name="wallet_msisdn"
            value={walletMsisdn}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const next = sanitizeDigitsAny(e.target.value, 100);
              setWalletMsisdn(next);
              if (walletMsisdnError) setWalletMsisdnError(null);
            }}
            error={!!walletMsisdnError}
            helperText={walletMsisdnError || undefined}
          />

          <InputField
            label="MNP Charge"
            name="mnp_charge"
            type="number"
            value={mnpCharge}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const next = sanitizeChargeInput(e.target.value);
              setMnpCharge(next);
              if (mnpChargeError) setMnpChargeError(null);
            }}
            error={!!mnpChargeError}
            helperText={mnpChargeError || undefined}
          />

          <InputField
            label="SIM Swap Charge"
            name="sim_swap_charge"
            type="number"
            value={simSwapCharge}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const next = sanitizeChargeInput(e.target.value);
              setSimSwapCharge(next);
              if (simSwapChargeError) setSimSwapChargeError(null);
            }}
            error={!!simSwapChargeError}
            helperText={simSwapChargeError || undefined}
          />

          <InputField
            label="Terminal ID"
            name="terminalid"
            value={terminalId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const next = sanitizeAlphanumeric(e.target.value, 10);
              setTerminalId(next);
              if (terminalIdError) setTerminalIdError(null);
            }}
            error={!!terminalIdError}
            helperText={terminalIdError || undefined}
          />

          <InputField
            label="POS ID"
            name="posid"
            value={posId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const next = sanitizeAlphanumeric(e.target.value, 10);
              setPosId(next);
              if (posIdError) setPosIdError(null);
            }}
            error={!!posIdError}
            helperText={posIdError || undefined}
          />

          <DynamicAutocomplete
            label="Notification Type"
            options={notificationOptions}
            value={notificationType}
            onChange={(val) => {
              setNotificationType(val);
              if (notificationError) setNotificationError(null);
            }}
            getOptionLabel={(o) => o?.name ?? ""}
            getOptionValue={(o) => o?.id}
            error={!!notificationError}
            helperText={notificationError || undefined}
          />



          <div className="flex flex-col">
            <FormLabel className="font-stc-medium text-sm text-gray-700">
              Is Suspicious
            </FormLabel>
            <Switch
              checked={suspicious}
              onChange={(val) => setIsSuspicious(val)}
              activeLabel="Yes"
              inactiveLabel="No"
              color="primary"
            />
          </div>


          <div className="col-span-1 md:col-span-2">
            <FileInputExample
              label="Upload Photo"
              onChange={handleFileChange}
            />

            {photoError && (
              <span className="mt-2 block text-sm text-red-600">
                {photoError}
              </span>
            )}
          </div>

        </div>


        <div className="mt-7 flex justify-end gap-5">
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            disabled={isSubmitting}
          >
            Prev
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </div>
      </form>
      <Snackbar

        open={!!snackError}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          mt: "72px",
          zIndex: (theme) => theme.zIndex.modal + 100,
        }}
        onClose={() => setSnackError(null)}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setSnackError(null)}
        >
          {snackError}
        </Alert>
      </Snackbar>

    </div>
  );
};

export default UserProfile;
