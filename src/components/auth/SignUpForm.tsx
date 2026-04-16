"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import Button from "../ui/button/Button";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const router = useRouter();
  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    router.push("/signin");
  };

  return (
    <div className="no-scrollbar flex w-full flex-1 flex-col overflow-y-auto lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4">

        <div className="mt-6 mb-8 flex justify-center sm:mt-10">
          <Image
            width={164}
            height={65}
            src="/images/logo/logo3.svg"
            alt="Logo"
          />
        </div>


        <div className="mb-2 text-left">
          <h1 className="text-title-sm sm:text-title-md mb-2 font-stc-bold">
            Sign Up
          </h1>
          <p className="text-sm">
            Enter your email and password to sign up!
          </p>
        </div>


        <form onSubmit={handleSignUp}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div className="sm:col-span-1">
                <Label>
                  First Name<span className="text-error">*</span>
                </Label>
                <Input
                  type="text"
                  id="fname"
                  name="fname"
                  placeholder="Enter your first name"
                />
              </div>


              <div className="sm:col-span-1">
                <Label>
                  Last Name<span className="text-error">*</span>
                </Label>
                <Input
                  type="text"
                  id="lname"
                  name="lname"
                  placeholder="Enter your last name"
                />
              </div>
            </div>


            <div>
              <Label>
                Email<span className="text-error">*</span>
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
              />
            </div>


            <div>
              <Label>
                Password<span className="text-error">*</span>
              </Label>
              <div className="relative">
                <Input
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
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
            </div>


            <div className="flex items-center gap-3">
              <Checkbox
                className="h-5 w-5"
                checked={isChecked}
                onChange={setIsChecked}
              />
              <p className="inline-block text-sm font-stc-regular">
                By creating an account means you agree to the{" "}
                <span className="text-error">Terms and Conditions,</span>{" "}
                and our <span className="text-error">Privacy Policy</span>
              </p>
            </div>


            <div>
              <Button
                className="bg-blue-light-500 hover:bg-blue-light-600 w-full"
                size="sm"
                type="submit"
                variant="secondary"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </form>


        <div className="mt-5 text-center">
          <p className="text-sm font-stc-regular">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-brand-500 hover:text-brand-600"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
