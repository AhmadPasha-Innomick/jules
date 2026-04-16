"use client";
import React from "react";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DynamicTable from "@/components/common/DynamicTable";


type Occupation = {
  service_typeID: number;
  service_type: string;
};


const users: Occupation[] = [
  { service_typeID: 101, service_type: "Plumbing" },
  { service_typeID: 245, service_type: "Electrical" },
  { service_typeID: 312, service_type: "Carpentry" },
  { service_typeID: 478, service_type: "Painting" },
  { service_typeID: 529, service_type: "Masonry" },
  { service_typeID: 634, service_type: "Gardening" },
  { service_typeID: 782, service_type: "Cleaning" },
  { service_typeID: 853, service_type: "Security" },
  { service_typeID: 927, service_type: "Catering" },
  { service_typeID: 999, service_type: "Transport" },
];

export default function BlankPage() {
  const router = useRouter();
  return (
    <div>
      <DynamicTable
        data={users}
        showCreateButton
        onCreate={() => router.push("/look_Ups/service_types/create")}
        rowActions={[
          {
            icon: <VisibilityIcon fontSize="small" />,
            label: "View",
            onClick: (row: Occupation) =>
              alert(`Viewing ${row.service_type} (${row.service_typeID})`),
            color: "default",
          },
          {
            icon: <EditIcon fontSize="small" />,
            label: "Edit",
            onClick: (row: Occupation) =>
              alert(`Editing ${row.service_type} (${row.service_typeID})`),
            color: "info",
          },
          {
            icon: <DeleteIcon fontSize="small" />,
            label: "Delete",
            onClick: (row: Occupation) =>
              alert(`Deleting ${row.service_type} (${row.service_typeID})`),
            color: "error",
          },
        ]}
      />
    </div>
  );
}
