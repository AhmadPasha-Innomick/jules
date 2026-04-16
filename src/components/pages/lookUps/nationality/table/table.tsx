"use client";

import React from "react";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DynamicTable from "@/components/common/DynamicTable";
import { useNationalities } from "@/hooks/useLookups"; 

export default function NationalityTable() {
  const router = useRouter();


  const { data, isLoading, isError } = useNationalities();


  if (isLoading) return <p>Loading nationalities...</p>;

  if (isError) return <p>Failed to load nationalities</p>;


  const formattedData = data.map((item: any) => ({
    nationality_id: item.nationality_id,
    Nationality_Code: item.nationality_code, 
    Status: "Active",
  }));

  return (
    <div>
      <DynamicTable
        data={formattedData}
        showCreateButton
        onCreate={() => router.push("/look_Ups/nationality/create")}
  
      />
    </div>
  );
}
