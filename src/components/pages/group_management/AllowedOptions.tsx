"use client";

import React, { useState } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";

import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  SelectChangeEvent,
  IconButton,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import Button from "@/components/ui/button/Button";

type OptionsMap = {
  [key: string]: string[];
};

const allOptions: OptionsMap = {
  "Allowed ID Types": [
    "CPR with Finger Prints",
    "CPR with Facial Recognition",
    "ID Card",
    "Passport",
    "Document Without Barcode",
  ],
  "Allowed Service Types": [
    "Prepaid - Voice",
    "Prepaid - Starter Pack",
    "Prepaid - Broadband",
  ],
  "Allowed Plans": ["Plan A", "Plan B", "Plan C"],
  "Allowed Payment Mode": [
    "Cash",
    "STC Pay",
    "M2M Wallet",
    "Dealer Wallet",
    "Payment Link",
  ],
};

type RowData = {
  category: string;
  options: string[];
};

export default function AllowedOptionsTable() {
  const categories = Object.keys(allOptions);

  const [data, setData] = useState<RowData[]>([
    { category: "", options: [] },
  ]);

  const handleCategoryChange = (rowIndex: number, value: string) => {
    const newData = [...data];
    newData[rowIndex].category = value;
    newData[rowIndex].options = []; 
    setData(newData);
  };

  const handleOptionChange = (rowIndex: number, option: string) => {
    const newData = [...data];
    const currentOptions = newData[rowIndex].options;

    if (currentOptions.includes(option)) {
      newData[rowIndex].options = currentOptions.filter((o) => o !== option);
    } else {
      newData[rowIndex].options = [...currentOptions, option];
    }

    setData(newData);
  };

  const handleRemoveRow = (rowIndex: number) => {
    const newData = data.filter((_, i) => i !== rowIndex);
    setData(newData.length ? newData : [{ category: "", options: [] }]);
  };

  const handleAddRow = () => {
    setData([...data, { category: "", options: [] }]);
  };

  const columns: MRT_ColumnDef<RowData>[] = [
    {
      header: "Category",
      accessorKey: "category",
      Cell: ({ row }) => (
        <Select
          size="small"
          displayEmpty
          value={row.original.category}
          onChange={(e: SelectChangeEvent) =>
            handleCategoryChange(row.index, e.target.value)
          }
          style={{ minWidth: 180 }}
        >
          <MenuItem value="" disabled>
            Select Category
          </MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      header: "Options",
      accessorKey: "options",
      Cell: ({ row }) =>
        row.original.category ? (
          <FormGroup>
            {allOptions[row.original.category].map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={row.original.options.includes(option)}
                    onChange={() => handleOptionChange(row.index, option)}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
        ) : (
          <span style={{ color: "#aaa" }}>Select a category first</span>
        ),
    },
    {
      header: "Actions",
      id: "actions",
      Cell: ({ row }) => (
        <IconButton onClick={() => handleRemoveRow(row.index)}>
          <CancelIcon color="error" />
        </IconButton>
      ),
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data,
    enablePagination: false,
    enableColumnActions: false,
    enableSorting: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    muiTableBodyRowProps: () => ({
      sx: {
        "&:hover": {
          backgroundColor: "#f2f4f7", // light grey
        },
      },
    }),

    // Hover styling for cells (if you want per-cell hover)
    muiTableBodyCellProps: () => ({
      sx: {
        "&:hover": {
          backgroundColor: "#f2f4f7", // slightly darker grey
        },
      },
    })
  });

  return (
    <div className="p-4 md:p-6 lg:p-10">
      <MaterialReactTable table={table} />
      <Button
        onClick={handleAddRow}
        className="mt-4"
      >
        + Add Method
      </Button>
    </div>
  );
}
