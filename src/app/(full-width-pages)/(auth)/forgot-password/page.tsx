import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: " Forgot Password Page | STC",
    description: "This is a Forgot Password Page in STC"
}

export default function SignIn() {
    return <ForgotPasswordForm/>
}