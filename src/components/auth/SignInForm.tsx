"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";


import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { login } from "@/store/authSlice";

const schema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector(
    (state: RootState) => state.auth
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  interface SignInFormData {
    username: string;
    password: string;
  }

  const handleSignIn = async (data: SignInFormData) => {
    try {
      const resultAction = await dispatch(
        login({ username: data.username, password: data.password })
      );

      if (login.fulfilled.match(resultAction)) {

      } else {
        console.error("Login failed:", resultAction.payload);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col justify-center lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4">
   
        <div className="mb-8 flex justify-center">
          <Image
            width={164}
            height={65}
            src="/images/logo/logo3.svg"
            alt="Logo"
          />
        </div>

      
        <div className="mb-2 text-left">
          <h1 className="text-title-sm sm:text-title-md mb-2 font-stc-bold">
            sign in
          </h1>
          <p className="text-sm">
            enter your username and password to sign in!
          </p>
        </div>

    
        <form className="space-y-6" onSubmit={handleSubmit(handleSignIn)}>
          <div>
            <Label>
              username <span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="Enter your username"
              type="text"
              {...register("username")}
            />
            {errors.username && (
              <span className="text-(--color-error) text-center">
                {errors.username.message}
              </span>
            )}
          </div>

          <div>
            <Label>
              password <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500" />
                )}
              </span>
            </div>
            {errors.password && (
              <span className="text-(--color-error) text-center">
                {errors.password.message}
              </span>
            )}

          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="text-theme-sm block font-stc-regular">
                keep me logged in
              </span>
            </div>
            <Link
              href="/forgot-password"
              className="text-brand-500 hover:text-brand-600 text-sm"
            >
              forgot password?
            </Link>
          </div>

          <div>
            <Button
              className="bg-blue-light-500 hover:bg-blue-light-600 w-full"
              size="sm"
              type="submit"
              disabled={status === "loading"}
              variant="secondary"
            >
              {status === "loading" ? "signing in..." : "sign in"}
            </Button>
          </div>
        </form>


        {error && <p className="text-error mt-2 text-center">{error}</p>}


      </div>
    </div>
  );
}
