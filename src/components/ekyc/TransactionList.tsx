



"use client";

import React, { useMemo } from "react";
import { Transaction } from "@/types/types";
import {
  MRT_ColumnDef,
  MRT_TableInstance,
} from "material-react-table";
import { Box, Typography, Checkbox } from "@mui/material";
import DynamicModuleTable from "@/components/common/DynamicKycTable";
import Button from "@/components/ui/button/Button";

interface TransactionListProps {
  transactions: Transaction[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onProceed: () => void;
  isError?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onProceed,
  isError = false,
}) => {
  const columns = useMemo<MRT_ColumnDef<Transaction>[]>(
    () => [
      {
        id: "select",
        header: "", // ← This fixes the TS error
        // Header: ({ table }: { table: MRT_TableInstance<Transaction> }) => (
        //   <Checkbox
        //     checked={table.getIsAllRowsSelected()}
        //     indeterminate={table.getIsSomeRowsSelected()}
        //     onChange={(e) => onSelectAll(e.target.checked)}
        //     size="small"
        //   />
        // ),
        size: 60,
        maxSize: 60,
        minSize: 60,
        enableSorting: false,
        enableColumnFilter: false,
        enableResizing: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.includes(row.original.id)}
            onChange={() => onToggleSelect(row.original.id)}
            onClick={(e) => e.stopPropagation()}
            size="small"
          />
        ),
      },
      {
        accessorKey: "transactionId",
        header: "Transaction ID",
        size: 150,
      },
      {
        accessorKey: "cprNumber",
        header: "CPR Number",
        size: 150,
      },
      {
        accessorKey: "msisdn",
        header: "MSISDN",
        size: 150,
      },
    ],
    [selectedIds, onToggleSelect, onSelectAll]
  );

  if (transactions.length === 0) return null;

  if (isError) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          bgcolor: "background.paper",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography color="error" fontWeight="medium">
          Search failed. Please try again.
        </Typography>
      </Box>
    );
  }

  const selectedCount = selectedIds.length;

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" fontWeight="semibold">
          Search Results ({transactions.length})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select one or more transactions to proceed
        </Typography>
      </Box>

      <DynamicModuleTable<Transaction>
        data={transactions}
        columns={columns}
        enableServerSide={false}
        isLoading={false}
        totalRowCount={transactions.length}
        muiTableProps={{
          enableColumnActions: false, // ✅ hides ONLY the 3 dots
          enableRowActions: false,    // optional safety
          enableEditing: false,       // optional safety
          enableToolbarInternalActions: false,
          enableRowNumbers: false,
          muiTableBodyRowProps: ({ row }) => ({
            onClick: () => onToggleSelect(row.original.id),
            sx: {
              cursor: "pointer",
              backgroundColor: selectedIds.includes(row.original.id)
                ? "rgba(59, 130, 246, 0.1)"
                : "inherit",
              "&:hover": {
                backgroundColor: "rgba(59, 130, 246, 0.05)",
              },
            },
          }),
          enableRowSelection: false,
          enableMultiRowSelection: false,
        }}
      />

      <Box
        sx={{
          mt: 4,
          position: { xs: "fixed", md: "static" },
          bottom: { xs: 0, md: "auto" },
          left: { xs: 0, md: "auto" },
          right: { xs: 0, md: "auto" },
          bgcolor: { xs: "background.paper", md: "transparent" },
          borderTop: { xs: "1px solid", md: "none" },
          borderColor: { xs: "divider", md: "transparent" },
          p: { xs: 2, md: 0 },
          boxShadow: { xs: 3, md: "none" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", md: "block" } }}
          >
            {selectedCount} selected
          </Typography>

          <Button
            onClick={onProceed}
            disabled={selectedCount === 0}
            className={`
              px-6 py-3 rounded-lg font-medium text-white transition-all
              ${selectedCount === 0
                ? "bg-gray-400 opacity-70 cursor-not-allowed"
                : "bg-brand-500 hover:bg-brand-600 shadow-lg"
              }
            `}
          >
            Proceed to EKYC
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TransactionList;





