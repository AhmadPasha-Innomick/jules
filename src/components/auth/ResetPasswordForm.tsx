"use client";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { resetPassword, completeReset } from "@/store/passwordResetSlice";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { useState, useEffect } from "react";
import Image from "next/image";

const schema = yup.object({
    password: yup
        .string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(/[a-z]/, "Must contain lowercase")
        .matches(/[A-Z]/, "Must contain uppercase")
        .matches(/[0-9]/, "Must contain a number"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Confirm password is required"),
});

export default function ResetPasswordForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { resetToken, status, error } = useSelector(
        (state: RootState) => state.passwordReset
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    useEffect(() => {
        if (!resetToken && !isNavigating) {
            setIsNavigating(true);
            router.push("/forgot-password");
        }
    }, [resetToken, router, isNavigating]);


    if (!resetToken) {
        return null;
    }

    const onSubmit = async (data) => {
        const result = await dispatch(
            resetPassword({ token: resetToken, newPassword: data.password })
        );

        if (resetPassword.fulfilled.match(result)) {
            setIsNavigating(true);
            router.push("/signin");
            dispatch(completeReset());
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col justify-center lg:w-1/2">
            <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4">
                <div className="mb-6 flex justify-center">
                    <Image width={164} height={65} src="/images/logo/logo3.svg" alt="logo" />
                </div>
                <div className="text-left">
                    <h1 className="text-title-sm sm:text-title-md mb-2 font-stc-bold">
                        reset password
                    </h1>
                    <p className="text-sm">enter your new secure password.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <Label>new password *</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                                {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-error-500 text-sm">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <Label>confirm password *</Label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                            <p className="text-error-500 text-sm">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    {error && <p className="text-error-500 text-center">{error}</p>}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={status === "loading"}
                        variant="secondary"
                    >
                        {status === "loading" ? "resetting..." : "reset password"}
                    </Button>
                </form>
            </div>
        </div>
    );
}