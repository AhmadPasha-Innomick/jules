"use client";
import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { Metadata } from "next";
import React from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useNationalities } from "@/hooks/useLookups"; 
export default function Profile() {
  const { data, isLoading, isError, error } = useAuthUser();
  const user = data?.json?.data;
  const { data: nationalitiesData } = useNationalities();
  const nationalities = nationalitiesData ?? [];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 lg:p-6">
        <p className="text-red-700">Failed to load profile: {error?.message || "Unknown error"}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6">
        <p className="text-gray-500">No user data available.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6">
        <h3 className="mb-5 text-lg font-stc-bold text-gray-800 lg:mb-7">
          Profile Info
        </h3>
        <div className="space-y-6">
          <UserMetaCard user={user} />
          <UserInfoCard user={user} nationalities={nationalities} />

        </div>
      </div>
    </div>
  );
}
