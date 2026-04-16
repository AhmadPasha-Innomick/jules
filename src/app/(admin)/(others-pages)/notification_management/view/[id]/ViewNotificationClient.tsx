"use client";

import React from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import { useNotificationDetails } from "@/hooks/useNotifications";
import { Box, CircularProgress } from "@mui/material";
interface ViewNotificationClientProps {
  id: string;
}

export default function ViewNotificationClient({ id }: ViewNotificationClientProps) {


  const { data, isLoading, isError } = useNotificationDetails(id);

  const notification = data?.data;
  const apiMessage = data?.message;

  return (
    <div className="space-y-6">
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Notification_Management", href: "/notification_management" },
          { label: `View Notification (${id})` },
        ]}
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-md">
        <h3 className="text-theme-xl font-stc-bold text-gray-900 mb-6">
          Notification Details
        </h3>


        {isLoading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        )}


        {isError && (
          <p className="text-red-600 text-theme-sm">
            {apiMessage || "Failed to load notification."}
          </p>
        )}

        {!isLoading && !notification && data?.success === false && (
          <div className="p-4 border border-red-300 bg-red-50 rounded-xl shadow-theme-xs">
            <p className="text-red-700 font-stc-medium text-theme-sm">
              {apiMessage || "Notification not found."}
            </p>
            <p className="text-gray-600 text-theme-xs mt-1">
              The notification with ID <span className="font-stc-bold">{id}</span> does not exist.
            </p>
          </div>
        )}

    
        {notification && (
          <>
      
            <div className="flex items-start gap-6 mb-8">
              <div className="flex items-start gap-6 mb-8">
                {notification.image ? (
                  <div className="w-32 h-32 rounded-xl overflow-hidden shadow-theme-sm flex-shrink-0">
                    <img
                      src={`data:image/jpeg;base64,${notification.image}`}
                      alt="Notification"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-gray-200 flex items-center justify-center shadow-theme-sm flex-shrink-0">
                    <span className="text-gray-500 text-4xl font-stc-bold">N</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="text-brand-500 font-stc-bold text-theme-2xl mb-2">
                  {notification.title || "Untitled Notification"}
                </p>
                <div className="flex flex-wrap gap-4 text-theme-sm text-gray-600">
                  <span>
                    <strong>Category:</strong> {notification.category || "N/A"}
                  </span>
                  <span >
                    <strong >Status:</strong>{" "}
                    {notification.status || "N/A"}

                  </span>

                </div>
              </div>
            </div>

        
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

              <Detail label="Category" value={notification.category} />
              <Detail label="Title" value={notification.title} />

              <Detail
                label="Scheduled Start"
                value={
                  notification.schedule_start
                    ? new Date(notification.schedule_start).toLocaleString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "numeric",
                      hour12: true,
                    })

                    : "Immediate"
                }
              />
              <Detail
                label="Scheduled End"
                value={
                  notification.schedule_end
                    ? new Date(notification.schedule_end).toLocaleString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "numeric",
                      hour12: true,
                    })
                    : "No expiry"
                }
              />

              <Detail label="Created By" value={notification.created_by || "System"} />
              <Detail label="Created At" value={new Date(notification.created_date_time).toLocaleString()} />
            </div>


            <div className="mb-8">
              <h4 className="font-stc-bold text-theme-lg text-gray-900 mb-3">
                Description
              </h4>
              <div className="p-4 bg-gray-50 rounded-xl border">
                <p className="text-theme-sm text-gray-800 whitespace-pre-wrap">
                  {notification.description || "No description provided."}
                </p>
              </div>
            </div>



            {notification.groups && notification.groups.length > 0 && (
              <div>
                <h4 className="font-stc-bold text-theme-lg text-gray-900 mb-3">
                  Target Groups ({notification.groups.length})
                </h4>
                <div className="flex flex-wrap gap-3">
                  {notification.groups.map((group: { id: number; name: string }, idx: number) => (
                    <span
                      key={group.id}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-theme-sm font-stc-medium"
                    >
                      {group.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
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