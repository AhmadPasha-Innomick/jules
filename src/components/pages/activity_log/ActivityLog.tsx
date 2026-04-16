"use client";

import React, { useState } from "react";
import { Delete } from "@mui/icons-material";
import DynamicTable from "@/components/common/DynamicTable";


type ActivityLogRow = {
  username: string;
  login_successful: "Y" | "N";
  reason: string;
  ip_address: string;
  imei: string;
  device_id: string;
  mac_address: string;
  latitude: string;
  longitude: string;
  created_date_time: string;
};

export default function ActivityLog() {
  const [rows, setRows] = useState<ActivityLogRow[]>([]);




  const handleDelete = (row: ActivityLogRow) => {
    setRows((prev) => prev.filter((r) => r.username !== row.username));
  };

  const columns = [
    { accessorKey: "username", header: "Username" },
    {
      accessorKey: "login_successful",
      header: "Login Successful",
      Cell: (props: {
        cell: { getValue: () => unknown };
        column: unknown;
        renderedCellValue: React.ReactNode;
        row: unknown;
        rowRef?: React.RefObject<HTMLTableRowElement>;
        staticColumnIndex?: number;
        staticRowIndex?: number;
        table: unknown;
      }) => {
        const value = props.cell.getValue() as "Y" | "N";
        return (
          <span
            className={`rounded-full px-3 py-1 text-sm font-stc-medium ${value === "Y"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}
          >
            {value === "Y" ? "Yes" : "No"}
          </span>
        );
      },
    },
    { accessorKey: "reason", header: "Reason" },
    { accessorKey: "ip_address", header: "IP Address" },
    { accessorKey: "imei", header: "IMEI" },
    { accessorKey: "device_id", header: "Device ID" },
    { accessorKey: "mac_address", header: "MAC Address" },
    { accessorKey: "latitude", header: "Latitude" },
    { accessorKey: "longitude", header: "Longitude" },
    { accessorKey: "created_date_time", header: "Created Date/Time" },
  ];

  return (
    <div>
      <DynamicTable
        data={rows}
        showCreateButton={false}
        columns={columns}
        rowActions={[

          {
            icon: <Delete fontSize="small" />,
            label: "Delete",
            onClick: handleDelete,
            color: "error",
          },
        ]}

      />
    </div>
  );
}
