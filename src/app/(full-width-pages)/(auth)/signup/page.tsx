import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: " SignUp Page | STC -  Dashboard Template",
  description: "This is  SignUp Page STC Dashboard Template",
  
};

export default function SignUp() {
  redirect("/");
}
