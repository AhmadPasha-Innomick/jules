import GridShape from "@/components/common/GridShape";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
     
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1 className="text-title-md xl:text-title-2xl mb-8 font-stc-bold text-gray-800">
          ERROR
        </h1>

        <Image src="/images/error/404.svg" alt="404" width={472} height={152} />
        <Image
          src="/images/error/404-dark.svg"
          alt="404"
          width={472}
          height={152}
        />

        <p className="mt-10 mb-6 text-base text-gray-700 sm:text-lg">
          We can’t seem to find the page you are looking for!
        </p>

        <Link
          href="/"
          className="shadow-theme-xs inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-stc-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800"
        >
          Back to Home Page
        </Link>
      </div>
   
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} - STC
      </p>
    </div>
  );
}
