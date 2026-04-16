"use client";

import React, { useMemo, useState, useEffect } from "react";
import DynamicTable from "@/components/common/DynamicProductPlansTable";
import { Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import { useProductCatalogue } from "@/hooks/useProductCatalogue";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useDeletePostpaidFiber } from "@/hooks/useCreatePlan";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";




export default function PostpaidFiberList() {
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const [globalFilter, setGlobalFilter] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedDeleteRow, setSelectedDeleteRow] = useState<any>(null);

    const deleteMutation = useDeletePostpaidFiber();

    const router = useRouter();

    const apiParams = useMemo(() => {
        return {
            limit: pagination.pageSize,
            offset: pagination.pageIndex * pagination.pageSize,
            search: globalFilter || "",
            sort_by: "order_by",
            sort_order: "asc" as const,
        };
    }, [pagination, globalFilter]);

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useProductCatalogue("postpaid_fiber", apiParams);
    const rows = data?.data?.items || [];
    const totalRowCount = data?.data?.totalCount || 0;


    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [globalFilter]);

    const columns = useMemo(
        () => [
            { accessorKey: "crm_product_code", header: "CRM Product Code" },
            {
                accessorKey: "crm_product_name",
                header: "CRM Product Name",
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    return value !== null && value !== undefined && value !== "" ? value : "N/A";
                },
            },

            { accessorKey: "display_name", header: "Display Name" },
            {
                accessorKey: "plan_validity",
                header: "Plan Validity",
                Cell: ({ row }) => {
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
                    `/product_catalogue/plans/postpaid_fiber/view/${row.plan_product_id}`
                );
            },
        },

        {
            icon: <EditIcon fontSize="small" />,
            label: "Edit",
            onClick: (row: any) => {
                sessionStorage.setItem("selectedPlan", JSON.stringify(row));

                router.push(
                    `/product_catalogue/plans/postpaid_fiber/edit/${row.plan_product_id}`
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
        ,
    ];


    const handleConfirmDelete = async () => {
        try {
            await deleteMutation.mutateAsync({
                plan_product_id: selectedDeleteRow.plan_product_id,
                contract_duration: selectedDeleteRow.contract_duration,
            });

            setSuccessMsg("Postpaid Fiber plan deleted successfully");

            setOpenDeleteDialog(false);
            setSelectedDeleteRow(null);

            refetch();

        } catch (err: any) {
            setErrorMsg(err?.message || "Failed to delete plan");
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
                onCreate={() =>
                    router.push("/product_catalogue/plans/postpaid_fiber/create")
                }
                showCreateButton={false}

                isError={isError}
                error={error}
                refetch={refetch}
                enableServerSide={true}
                onPaginationChange={setPagination}
                onGlobalFilterChange={setGlobalFilter}


                pagination={pagination}
                globalFilter={globalFilter}


                totalRowCount={totalRowCount}
            />

            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Delete Fiber Plan</DialogTitle>

                <DialogContent dividers>
                    Are you sure you want to delete plan with ID:
                    <strong> {selectedDeleteRow?.plan_product_id} </strong> ?
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
                    onClose={() => {
                        setSuccessMsg("");
                        setErrorMsg("");
                    }}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {errorMsg || successMsg}
                </Alert>
            </Snackbar>

        </div>
    );
}
