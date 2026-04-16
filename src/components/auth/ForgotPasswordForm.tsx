
"use client";

import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { sendOtp, verifyOtp, resetFlow } from "@/store/passwordResetSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


const usernameSchema = yup.object({
    username: yup.string().required("Username is required"),
});

const otpSchema = yup.object({
    otp: yup
        .string()
        .required("OTP is required")
        .matches(/^\d{4}$/, "OTP must be 4 digits"),
});

export default function ForgotPasswordForm() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const { step, username, status, error } = useSelector(
        (state: RootState) => state.passwordReset
    );


    const usernameForm = useForm({ resolver: yupResolver(usernameSchema) });
    const otpForm = useForm({ resolver: yupResolver(otpSchema) });

    useEffect(() => {
        dispatch(resetFlow());
    }, [dispatch]);


    const onSendOTP = async (data: { username: string }) => {
        const result = await dispatch(sendOtp(data.username));

        if (sendOtp.fulfilled.match(result)) {
            usernameForm.reset();
        }
    };


    const onVerifyOTP = async (data: { otp: string }) => {
        const result = await dispatch(
            verifyOtp({ username, otp: data.otp })
        );

        if (verifyOtp.fulfilled.match(result)) {
            router.push("/reset-password");
        }
    };


    if (step === "otp") {
        return (
            <div className="flex min-h-screen w-full flex-col justify-center lg:w-1/2">
                <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4">
                    <div className="mb-6 flex justify-center">
                        <Image width={164} height={65} src="/images/logo/logo3.svg" alt="logo" />
                    </div>

                    <div className="text-left">
                        <h1 className="text-title-sm sm:text-title-md mb-2 font-stc-bold">
                            enter otp
                        </h1>
                        <p className="text-sm">we sent a 4-digit code to your phone, enter it below.</p>
                    </div>

                    <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} className="space-y-6">
                        <div>
                            <Label>otp <span className="text-(--color-error)">*</span></Label>

                            <Input
                                placeholder="1234"
                                type="text"
                                {...otpForm.register("otp")}
                                maxLength={4} 
                            />

                            {otpForm.formState.errors.otp && (
                                <p className="text-(--color-error) text-sm">
                                    {otpForm.formState.errors.otp.message}
                                </p>
                            )}
                        </div>

                        {error && (
                            <p className="text-(--color-error) text-center">{error}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={status === "loading"}
                            variant="secondary"
                        >
                            {status === "loading" ? "verifying..." : "verify otp"}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => dispatch(resetFlow())}
                        >
                            back
                        </Button>
                    </form>
                </div>
            </div>
        );
    }


    return (
        <div className="flex min-h-screen w-full flex-col justify-center lg:w-1/2">
            <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4">
                <div className="mb-6 flex justify-center">
                    <Image width={164} height={65} src="/images/logo/logo3.svg" alt="logo" />
                </div>

                <div className="text-left">
                    <h1 className="text-title-sm sm:text-title-md mb-2 font-stc-bold">
                        forgot password
                    </h1>
                    <p className="text-sm">enter your username to receive an otp.</p>
                </div>

                <form onSubmit={usernameForm.handleSubmit(onSendOTP)} className="space-y-6">
                    <div>
                        <Label>username <span className="text-(--color-error)">*</span></Label>

                        <Input
                            placeholder="Enter your username"
                            type="text"
                            {...usernameForm.register("username")}
                        />

                        {usernameForm.formState.errors.username && (
                            <p className="text-(--color-error) text-sm">
                                {usernameForm.formState.errors.username.message}
                            </p>
                        )}
                    </div>

                    {error && <p className="text-(--color-error) text-center">{error}</p>}

                    <Button
                        type="submit"
                        className="w-full bg-blue-light-500 hover:bg-blue-light-600"
                        disabled={status === "loading"}
                        variant="secondary"
                    >
                        {status === "loading" ? "sending..." : "send otp"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
