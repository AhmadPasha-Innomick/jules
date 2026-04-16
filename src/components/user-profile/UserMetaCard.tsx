"use client";
import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";
import { useEditProfile } from "@/hooks/useAuthUser";
import { User } from "@/types/module";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Snackbar, Alert } from "@mui/material";


interface UserMetaCardProps {
  user: User;
}

const profileSchema = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .max(50, "First name must not exceed 50 characters"),
  lastName: yup
    .string()
    .required("Last name is required")
    .max(50, "Last name must not exceed 50 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),

  gender: yup.string().optional(),
  phone: yup.string().optional(),
  bio: yup.string().optional(),
});

const getProfileImageSrc = (photo?: string) => {
  if (!photo || photo === "null" || photo === "undefined") {
    return "/images/user/profile-icon.jpg";
  }


  if (photo.startsWith("data:image")) {
    return photo;
  }


  try {
    new URL(photo);
    return photo;
  } catch {
    return "/images/user/profile-icon.jpg";
  }
};


export default function UserMetaCard({ user }: UserMetaCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const { mutate: editProfile, isPending } = useEditProfile();
  const [preview, setPreview] = useState<string>(user.profile_photo || "/images/user/profile-icon.jpg");
  const [apiError, setApiError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageUpdated, setImageUpdated] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.profile?.email || '',
      phone: user.profile?.phone_number || '',
      bio: user.profile?.job_title || '',
      gender: user.profile?.gender || '',
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageError(false);
      setImageUpdated(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const profileImageSrc = imageError
    ? "/images/user/profile-icon.jpg"
    : getProfileImageSrc(preview);

  const onSubmit = (data: any) => {
    const payload: any = {
      user_firstname: data.firstName,
      user_lastname: data.lastName,
      user_fullname: `${data.firstName} ${data.lastName}`.trim(),
      profile: {
        email: data.email,
        phone_number: data.phone,
        gender: data.gender,
        job_title: data.bio,
      },
    };

 
    if (imageUpdated) {
      payload.photo_base64 = preview;
    }

    editProfile(payload, {
      onSuccess: () => {
        setApiError(null);
        setImageUpdated(false); 

        setSuccessOpen(true);
        setTimeout(() => {
          closeModal();
        }, 150);
      },
      onError: (error) => {
        setApiError(error?.message || "Failed to update profile");
        setErrorOpen(true);
      },
    });
  };


  return (
    <>
      <div className="rounded-2xl border border-gray-200 p-5 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-col items-center gap-6 xl:flex-row">

            <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200">
              <Image
                width={80}
                height={80}
                src={profileImageSrc}
                alt="user"
                onError={() => setImageError(true)}
              />

            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-center text-lg font-stc-bold text-gray-800 xl:text-left">
                {user.full_name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500">
                  {user?.profile.job_title}
                </p>

                {user?.profile?.gender && (
                  <>
                    <span className="hidden xl:inline text-gray-300">•</span>
                    <p className="text-sm text-gray-500">
                      {user.profile.gender === "M" ? "Male" : "Female"}
                    </p>
                  </>
                )}
              </div>

            </div>
          </div>
          <button
            onClick={() => {
              setApiError(null);
              setImageError(false);
              openModal();
            }}

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
      </div>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="mt-24 mb-6 max-w-[700px]"
      >

        <div
          className="relative w-full max-w-[700px] rounded-3xl bg-white p-4 lg:p-11"
          style={{
            maxHeight: "calc(100vh - 160px)",
            overflowY: "auto",
          }}
        >

          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-stc-bold text-gray-800">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mb-7 flex flex-col items-center">
                <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border border-gray-200">
                  <Image
                    src={profileImageSrc}
                    alt="Profile Preview"
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />

                </div>
                <Label htmlFor="photo-upload" className="cursor-pointer text-blue-500 hover:underline">
                  Upload New Photo
                </Label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-stc-medium text-gray-800 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      First Name <span >*</span>
                    </Label>
                    <Input type="text" {...register("firstName")} />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Last Name <span >*</span>
                    </Label>
                    <Input type="text" {...register("lastName")} />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Email Address <span >*</span>
                    </Label>
                    <Input type="text" {...register("email")} />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Gender</Label>
                    <select
                      {...register("gender")}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm
      focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>


                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone Number</Label>
                    <Input type="text" {...register("phone")} />
                  </div>

                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input type="text" {...register("bio")} />
                  </div>


                </div>
              </div>
            </div>
            {apiError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {apiError}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button
                size="sm"
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
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
    </>
  );
}