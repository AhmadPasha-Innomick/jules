"use client";

import React, { useMemo, useState, useEffect } from "react";
import DynamicTable from "@/components/common/DynamicProductPlansTable";
import { Snackbar, Alert } from "@mui/material";
import { useProductCatalogue } from "@/hooks/useProductCatalogue";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import { useDeletePostpaidVoice } from "@/hooks/useCreatePlan";



export default function SelectedIdTypeLinkingPage() {
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const [globalFilter, setGlobalFilter] = useState("");
    const [columnFilters, setColumnFilters] = useState<any[]>([]);
    const [sorting, setSorting] = useState<any[]>([]);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedDeleteRow, setSelectedDeleteRow] = useState<any>(null);


    const router = useRouter();
    const deleteMutation = useDeletePostpaidVoice();


    const apiParams = useMemo(() => {
        return {
            limit: pagination.pageSize,
            offset: pagination.pageIndex * pagination.pageSize,
            search: globalFilter || "",
            sort_by: "order_by",
            sort_order: "asc" as const,
            status:
                columnFilters.find((f) => f.id === "is_active")?.value ?? "",

        };
    }, [pagination, globalFilter, columnFilters, sorting]);



    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useProductCatalogue("postpaid_voice", apiParams);

    const rows = data?.data?.items || [];
    const totalRowCount = data?.data?.totalCount || 0;

    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [globalFilter]);

    const columns = useMemo(
        () => [
            {
                accessorKey: "crm_product_code",
                header: "CRM Product Code",
                enableSorting: false,
            },
            {
                accessorKey: "crm_product_name",
                header: "CRM Product Name",
                enableSorting: false,
            },
            {
                accessorKey: "display_name",
                header: "Display Name",
                enableSorting: false,
            },
            {
                accessorKey: "plan_validity",
                header: "Plan Validity",
                enableSorting: false,
                Cell: ({ row }: any) => {
                    const rawValidity =
                        row?.original?.plan_validity ??
                        row?.original?.contract_duration;

                    if (rawValidity === null || rawValidity === undefined || rawValidity === "") {
                        return "N/A";
                    }

                    return String(rawValidity);
                },
            },
        ],
        []
    );



    const rowActions = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            label: "View",
            onClick: (row: any) => {


                sessionStorage.setItem("selectedPlan", JSON.stringify(row));

                router.push(
                    `/product_catalogue/plans/postpaid_voice_catalogue/view/${row.plan_product_id}`
                );
            },
        },

        {
            icon: <EditIcon fontSize="small" />,
            label: "Edit",
            onClick: (row: any) => {
                sessionStorage.setItem("selectedPlan", JSON.stringify(row));
                router.push(
                    `/product_catalogue/plans/postpaid_voice_catalogue/edit/${row.plan_product_id}`
                );
            },

        },
        {
            icon: <DeleteIcon fontSize="small" />,
            label: "Delete",
            color: "error",
            onClick: (row: any) => {
                setSelectedDeleteRow(row);
                setOpenDeleteDialog(true);
            },
        },

    ];


    const handleAddNew = () => router.push("/product_catalogue/plans/postpaid_voice_catalogue/create");


    const handleConfirmDelete = async () => {
        if (!selectedDeleteRow) return;

        try {
            setErrorMsg("");
            setSuccessMsg("");

            await deleteMutation.mutateAsync({
                plan_product_id: selectedDeleteRow.plan_product_id,
                contract_duration: Number(selectedDeleteRow.contract_duration),
            });

            setSuccessMsg("Plan deleted successfully");

            setOpenDeleteDialog(false);
            setSelectedDeleteRow(null);

            refetch();

        } catch (err: any) {
            const apiError = err?.response?.data || err;

            setErrorMsg(apiError?.message || "Failed to delete plan");
        }
    };




    return (
        <div>


            <DynamicTable
                data={rows}
                columns={columns}
                rowActions={rowActions.filter((action) => action.label !== "Delete")}
                isLoading={isLoading || isFetching}
                createButtonLabel="Create New Plan"
                onCreate={handleAddNew}
                isError={isError}
                error={error}
                refetch={refetch}
                enableServerSide={true}
                onPaginationChange={setPagination}
                onGlobalFilterChange={setGlobalFilter}
                onColumnFiltersChange={setColumnFilters}
                onSortingChange={setSorting}
                pagination={pagination}
                globalFilter={globalFilter}
                columnFilters={columnFilters}
                showCreateButton={false}
                sorting={sorting}
                totalRowCount={totalRowCount}
            />

            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Delete Plan</DialogTitle>

                <DialogContent dividers>
                    Are you sure you want to delete plan{" "}
                    <strong>{selectedDeleteRow?.plan_product_id}</strong>?
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleConfirmDelete}
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>






            <Snackbar
                open={Boolean(successMsg || errorMsg)}
                autoHideDuration={4000}
                onClose={() => {
                    setSuccessMsg("");
                    setErrorMsg("");
                }}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{
                    mt: "72px",
                    zIndex: (theme) => theme.zIndex.modal + 100,
                }}
            >
                <Alert
                    severity={errorMsg ? "error" : "success"}
                    variant="filled"
                >
                    {errorMsg || successMsg}
                </Alert>
            </Snackbar>
        </div>
    );
}
