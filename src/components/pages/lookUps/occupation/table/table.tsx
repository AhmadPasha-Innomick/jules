"use client";
import React from "react";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DynamicTable from "@/components/common/DynamicTable";


type Occupation = {
  Occupation_Code: string;
  Occupation_Desc: string;
  Occupation_Category: string;
  is_active: string;
};


const users: Occupation[] = [
  {
    Occupation_Code: "OCC001",
    Occupation_Desc: "Software Engineer",
    Occupation_Category: "IT",
    is_active: "Active",
  },
  {
    Occupation_Code: "OCC002",
    Occupation_Desc: "Doctor",
    Occupation_Category: "Healthcare",
    is_active: "Active",
  },
  {
    Occupation_Code: "OCC003",
    Occupation_Desc: "Teacher",
    Occupation_Category: "Education",
    is_active: "In-Active",
  },
  {
    Occupation_Code: "OCC004",
    Occupation_Desc: "Civil Engineer",
    Occupation_Category: "Construction",
    is_active: "Active",
  },
  {
    Occupation_Code: "OCC005",
    Occupation_Desc: "Lawyer",
    Occupation_Category: "Legal",
    is_active: "Active",
  },
  {
    Occupation_Code: "OCC006",
    Occupation_Desc: "Nurse",
    Occupation_Category: "Healthcare",
    is_active: "In-Active",
  },
  {
    Occupation_Code: "OCC007",
    Occupation_Desc: "Pilot",
    Occupation_Category: "Aviation",
    is_active: "Active",
  },
  {
    Occupation_Code: "OCC008",
    Occupation_Desc: "Accountant",
    Occupation_Category: "Finance",
    is_active: "Active",
  },
  {
    Occupation_Code: "OCC009",
    Occupation_Desc: "Chef",
    Occupation_Category: "Hospitality",
    is_active: "In-Active",
  },
  {
    Occupation_Code: "OCC010",
    Occupation_Desc: "Police Officer",
    Occupation_Category: "Security",
    is_active: "Active",
  },
];

export default function BlankPage() {
  const router = useRouter();
  return (
    <div>
      <DynamicTable
        data={users}
        showCreateButton
        onCreate={() => router.push("/look_Ups/occupation/create")}
        rowActions={[
          {
            icon: <VisibilityIcon fontSize="small" />,
            label: "View",
            onClick: (row) => alert(`Viewing ${row.Occupation_Code}`),
            color: "default",
          },
          {
            icon: <EditIcon fontSize="small" />,
            label: "Edit",
            onClick: (row) => alert(`Editing ${row.Occupation_Code}`),
            color: "info",
          },
          {
            icon: <DeleteIcon fontSize="small" />,
            label: "Delete",
            onClick: (row) => alert(`Deleting ${row.Occupation_Code}`),
            color: "error",
          },
        ]}
      />
    </div>
  );
}
