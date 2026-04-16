"use client";

import React from "react";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DynamicTable from "@/components/common/DynamicTable";
import { useIdTypes } from "@/hooks/useLookups"; // <-- import hook

export default function Table() {
  const router = useRouter();
  const { data, isLoading, isError } = useIdTypes();


  if (isLoading) return <p>Loading ID Types...</p>;


  if (isError) return <p>Failed to load ID Types</p>;


  const formattedData = data.map((item: any) => ({
    ID_Type_Name: item.idtype_name,
    Status: "Active",
    id: item.id,
  }));

  return (
    <div>
      <DynamicTable
        data={formattedData}
        showCreateButton
        onCreate={() => router.push("/look_Ups/idTypes/create")}

      />
    </div>
  );
}
