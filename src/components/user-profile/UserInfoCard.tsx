"use client";
import React, { useState } from "react";

import { useEditProfile } from "@/hooks/useAuthUser";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { User } from "@/types/module";
import { useNationalities } from "@/hooks/useLookups";
import { DynamicAutocomplete } from "@/components/form/group-input/Autocomplete";
import { Snackbar, Alert } from "@mui/material";

interface UserMetaCardProps {
  user: User;
  nationalities: Array<{
    nationality_code: string;
    nationality_desc: string;
    nationality_id: string;
  }>;
}

const sampleOptions = [
  {
    "nationality_code": "BOL",
    "nationality_desc": "Bolivian",
    "nationality_id": "312"
  },
  {
    "nationality_code": "BIH",
    "nationality_desc": "Bosnian",
    "nationality_id": "569"
  },
]


export default function UserInfoCard({ user, nationalities }: UserMetaCardProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const { mutate: editProfile, isPending } = useEditProfile();

  const { data: safeNationalities = [] } = useNationalities();


  const [formData, setFormData] = useState({


    firstName: user.first_name || '',
    lastName: user.last_name || '',
    email: user.profile?.email || '',
    phone: user.profile?.phone_number || '',
    gender: user.profile?.gender || '',
    jobTitle: user.profile?.job_title || '',
    dealerId: user.profile?.dealer_id || '',
    employerId: user.profile?.employer_ID || '',
    idNumber: user.profile?.idnumber || '',
    userType: user.profile?.user_type || '',
    nationalityId: user.profile?.nationality_id || null,
    nationalityCode: user.profile?.nationality_id || '',
    shopId: user.profile?.shop_id || '',
    nationality_code: user.profile.nationality_code || null,
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSave = () => {
    setApiError(null);

    const payload = {
      user_firstname: formData.firstName,
      user_lastname: formData.lastName,
      user_fullname: `${formData.firstName} ${formData.lastName}`.trim(),
      profile: {
        email: formData.email,
        phone_number: formData.phone,
        gender: formData.gender,
        job_title: formData.jobTitle,
        dealer_id: formData.dealerId,
        employer_ID: formData.employerId,
        idnumber: formData.idNumber,
        user_type: formData.userType,
        nationality_code: formData.nationality_code,
        shop_id: formData.shopId,
      },
    };

    editProfile(payload, {
      onSuccess: () => {
        setSuccessOpen(true);
        closeModal();
      },
      onError: (error: any) => {
        setErrorOpen(true);

        let errorMessage = "Failed to update profile";

        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.response?.data?.data) {

          const validationErrors = error.response.data.data;
          const messages = Object.values(validationErrors).flat();
          errorMessage = messages.join(", ");
        }

        setApiError(errorMessage);
      },
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-stc-bold text-gray-800 lg:mb-6">
            Other profile Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">







            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500">Job Title</p>
              <p className="text-sm font-stc-medium text-gray-800">{user.profile?.job_title ?? "N/A"}</p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500">Dealer ID</p>
              <p className="text-sm font-stc-medium text-gray-800">{user.profile?.dealer_id ?? "N/A"}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500">Employer ID</p>
              <p className="text-sm font-stc-medium text-gray-800">{user.profile?.employer_ID ?? "N/A"}</p>

            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500"> ID Number</p>
              <p className="text-sm font-stc-medium text-gray-800">{user.profile?.idnumber ?? "N/A"}</p>

            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500"> User Type</p>
              <p className="text-sm font-stc-medium text-gray-800"> {user.profile?.user_type ?? "N/A"}</p>

            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500">Nationality</p>
              <p className="text-sm font-stc-medium text-gray-800">
                {user.profile?.nationality_code
                  ? nationalities.find(n => n.nationality_code === user.profile?.nationality_code)?.nationality_desc || "N/A"
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500">Shop ID</p>
              <p className="text-sm font-stc-medium text-gray-800"> {user.profile?.shop_id ?? "N/A"}</p>

            </div>
          </div>

        </div>

        <button
          onClick={openModal}
          className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-stc-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>



      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[700px]">
        <div className="relative flex max-h-[90vh] w-full flex-col rounded-3xl bg-white shadow-xl">


          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-5">
            <h4 className="text-2xl font-stc-bold text-gray-800">
              Edit Personal Information
            </h4>
            <p className="mt-1 text-sm text-gray-500">
              Update your details to keep your profile up-to-date.
            </p>

            {apiError && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {apiError}
              </div>
            )}
          </div>

       
          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            <h5 className="mb-6 text-lg font-stc-medium text-gray-800">
              Personal Information
            </h5>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Job Title</Label>
                <Input name="jobTitle" value={formData.jobTitle} onChange={handleChange} />
              </div>

              <div>
                <Label>Dealer ID</Label>
                <Input name="dealerId" value={formData.dealerId} onChange={handleChange} />
              </div>

              <div>
                <Label>Employer ID</Label>
                <Input name="employerId" value={formData.employerId} onChange={handleChange} />
              </div>

              <div>
                <Label>ID Number</Label>
                <Input name="idNumber" value={formData.idNumber} onChange={handleChange} />
              </div>

              <div>
                <Label>User Type</Label>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm
                       focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">Select User Type</option>
                  <option value="Agent">Agent</option>
                  <option value="Dealer">Dealer</option>
                </select>
              </div>

              <div>
                <Label>Nationality</Label>
                <select
                  name="nationality_code"
                  value={formData.nationality_code || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm
                       focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">Select Nationality</option>
                  {nationalities.map((nat) => (
                    <option key={nat.nationality_id} value={nat.nationality_code}>
                      {nat.nationality_desc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Shop ID</Label>
                <Input name="shopId" value={formData.shopId} onChange={handleChange} />
              </div>
            </div>
          </div>

    
          <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4 flex justify-end gap-3">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>


      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          mt: "72px",
          zIndex: (theme) => theme.zIndex.modal + 100,
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSuccessOpen(false)}
        >
          Profile updated successfully
        </Alert>
      </Snackbar>


      <Snackbar
        open={errorOpen}
        autoHideDuration={6000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setErrorOpen(false)}
        >
          {apiError || "Failed to update profile"}
        </Alert>
      </Snackbar>

    </div>
  );
}
