"use client";

import React from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import { useUserDetails } from "@/hooks/useApi";
import { useIdTypes } from "@/hooks/useLookups"
interface ViewUserClientProps {
  id: string;
}

const titleMap: Record<number, string> = {
  1: "Mr",
  2: "Miss",
  3: "Mrs",
};


export default function ViewUserClient({ id }: ViewUserClientProps) {
  const { data, isLoading, isError } = useUserDetails(id);

  const user = data?.data;

  const profile = user?.profile;
  const apiMessage = data?.message;
  const titleid = user?.user_title_id

  const { data: idTypes } = useIdTypes();

  const idTypeName = React.useMemo(() => {
    if (!idTypes || !profile?.idtype_id) return "N/A";
    const match = idTypes.find((t: any) => t.id === profile.idtype_id);
    return match?.idtype_name || "N/A";
  }, [idTypes, profile?.idtype_id]);
  return (
    <div className="space-y-6">
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "User Management", href: "/user_management" },
          { label: `View User` },
        ]}
      />


      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-md">
        <h3 className="text-theme-xl font-stc-bold text-gray-900 mb-6">
          User Details
        </h3>

  
        {isLoading && (
          <p className="text-gray-600 text-theme-sm">Loading user details...</p>
        )}

     
        {isError && (
          <p className="text-red-600 text-theme-sm">
            {apiMessage || "User not found."}
          </p>
        )}

      
        {!isLoading && !user && data?.success === false && (
          <div className="p-4 border border-red-300 bg-red-50 rounded-xl shadow-theme-xs">
            <p className="text-red-700 font-stc-medium text-theme-sm">
              {apiMessage || "User not found."}
            </p>
            <p className="text-gray-600 text-theme-xs mt-1">
              The user with ID <span className="font-stc-bold">{id}</span> does
              not exist.
            </p>
          </div>
        )}

     
        {user && (
          <>
         
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shadow-theme-sm">
                {user.profile_photo ? (
                  <img
                    src={user.profile_photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 text-2xl font-stc-bold">
                    {user.first_name?.charAt(0) || "U"}
                  </span>
                )}
              </div>

              <div>
                <p className="text-brand-500 font-stc-bold text-theme-xl">
                  {user.full_name}
                </p>
                <p className="text-theme-sm text-gray-600">{user.username}</p>
              </div>
            </div>

       
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Detail
                label="Title"
                value={titleMap[titleid as number] || "N/A"}
              />

              <Detail label="Username" value={user.username} />
              <Detail label="First Name" value={user.first_name} />
              <Detail label="Last Name" value={user.last_name} />
              <Detail label="Full Name" value={user.full_name} />

              <Detail
                label="Status"
                value={user.status === 1 ? "Active" : "Inactive"}
              />

              <Detail
                label="Gender"
                value={
                  profile?.gender === "M"
                    ? "Male"
                    : profile?.gender === "F"
                      ? "Female"
                      : "N/A"
                }
              />

              <Detail
                label="Is Manager"
                value={user.is_manager === 1 ? "Yes" : "No"}
              />
              <Detail
                label="Is Admin"
                value={user.is_admin === 1 ? "Yes" : "No"}
              />

              <Detail label="Email" value={profile?.email} />
              <Detail label="Phone Number" value={profile?.phone_number} />
              <Detail label="DOB" value={profile?.birth_date} />
              <Detail label="Company ID" value={profile?.company_id} />
              <Detail label="Job Title" value={profile?.job_title} />
              <Detail label="ID Type" value={idTypeName} />
              <Detail label="ID Number" value={profile?.idnumber} />

              <Detail label="User Type" value={profile?.user_type} />
              <Detail label="Reporting To" value={profile?.reporting_to} />



              <Detail label="Dealer ID" value={profile?.dealer_id} />
              <Detail label="Shop ID" value={profile?.shop_id} />
              <Detail label="MM ID" value={profile?.mm_id} />
              <Detail label="Terminal ID" value={profile?.terminalid} />
              <Detail label="POS ID" value={profile?.posid} />


              <Detail label="Nationality Code" value={profile?.nationality_code} />

              <Detail label="PIN" value={profile?.pin} />
              <Detail
                label="Suspicious"
                value={profile?.suspicious === 1 ? "Yes" : "No"}
              />

              <Detail label="Wallet MSISDN" value={profile?.wallet_msisdn} />
              <Detail label="MNP Charge" value={profile?.mnp_charge} />
              <Detail label="SIM Swap Charge" value={profile?.sim_swap_charge} />
              <Detail label="Created By" value={profile?.created_by} />
              <Detail label="Send Notification Type" value={profile?.send_notification_type} />

            </div>
          </>
        )}
      </div>
    </div>
  );
}


function Detail({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  const displayValue =
    value === null || value === undefined || value === "" ? "N/A" : value;

  return (
    <div className="rounded-xl border p-3 bg-gray-50 shadow-theme-xs">
      <p className="text-theme-xs text-gray-500">{label}</p>
      <p className="text-theme-sm font-stc-medium text-gray-900 mt-1">
        {displayValue}
      </p>
    </div>
  );
}
