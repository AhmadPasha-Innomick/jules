import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: " SignIn Page | STC -  Dashboard Template",
  description: "This is  Signin Page STC Dashboard Template",
};

export default function SignIn() {
  redirect("/");
}
