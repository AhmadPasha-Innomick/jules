"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@mui/material";


import {

    Box,
    Typography,
    CircularProgress,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import { useBannerView } from "@/hooks/useBanners";
import { useDeleteBanner } from "@/hooks/useBanners";

export default function ProductCatalogViewPage() {
    const { id } = useParams();
    const router = useRouter();

    const bannerId = Number(id);
    const { data, isLoading, error } = useBannerView(bannerId);
    const deleteBannerMutation = useDeleteBanner();

    const banner = data?.data;



    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedBannerId, setSelectedBannerId] = useState<number | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);



    const handleOpenDeletePopup = (id: number) => {
        setSelectedBannerId(id);
        setOpenDeleteDialog(true);
    };

    const confirmDeleteBanner = () => {
        if (!selectedBannerId) return;

        deleteBannerMutation.mutate(selectedBannerId, {
            onSuccess: () => {
                setOpenDeleteDialog(false);
                setDeleteSuccess("Banner deleted successfully!");

            },
            onError: (err: any) => {
                setDeleteError(
                    err?.message ||
                    err?.error_message ||
                    "Failed to delete banner"
                );
            },
        });
    };


    if (isLoading) {
        return (
            <Box sx={{ mt: 6, px: 3 }}>
                <PageBreadcrumbDynamic
                    items={[
                        { label: "Home", href: "/" },
                        { label: "Banner Management", href: "/product_catalogue/banner_management" },
                        { label: "Loading..." },
                    ]}
                />

                <Box
                    sx={{
                        mt: 3,
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: "#fff",
                        boxShadow: 2,
                    }}
                >

                    <Box
                        sx={{
                            width: "100%",
                            height: { xs: 180, sm: 240, md: 300 },
                            borderRadius: 2,
                            mb: 3,
                            backgroundColor: "#e0e0e0",
                            animation: "pulse 1.5s ease-in-out infinite",
                        }}
                    />


                    <Box sx={{ width: "40%", height: 24, backgroundColor: "#e0e0e0", mb: 2 }} />
                    <Box sx={{ width: "30%", height: 18, backgroundColor: "#e0e0e0", mb: 1 }} />
                    <Box sx={{ width: "25%", height: 18, backgroundColor: "#e0e0e0" }} />


                    <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Box sx={{ width: 100, height: 36, backgroundColor: "#e0e0e0", borderRadius: 1 }} />
                        <Box sx={{ width: 100, height: 36, backgroundColor: "#e0e0e0", borderRadius: 1 }} />
                    </Box>
                </Box>
            </Box>
        );
    }


    if (error || !banner) {
        return (
            <Alert severity="error" sx={{ mt: 3 }}>
                Failed to load banner details
            </Alert>
        );
    }

    const handleCloseSuccess = () => {
        setDeleteSuccess(null);
        router.push("/product_catalogue/banner_management");
    };

    const handleCloseError = () => {
        setDeleteError(null);
    };

    return (
        <>
            <Box>
                <PageBreadcrumbDynamic
                    items={[
                        { label: "Home", href: "/" },
                        { label: "Banner Management", href: "/product_catalogue/banner_management" },
                        { label: banner.title },
                    ]}
                />

                <Box
                    sx={{
                        mt: 3,
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: "#fff",
                        boxShadow: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: "100%",
                            borderRadius: 2,
                            overflow: "hidden",
                            mb: 3,
                            backgroundColor: "#eaeaea",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Box
                            component="img"
                            src={`data:image/${banner.extension === "jpg" ? "jpeg" : banner.extension
                                };base64,${banner.image_base64}`}
                            alt={banner.title}
                            sx={{
                                width: "100%",
                                objectFit: "cover",
                            }}

                        />
                    </Box>




                    <Typography variant="h5" fontWeight={600} gutterBottom>
                        {banner.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Category: {banner.category}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Display Order: {banner.order}
                    </Typography>


                    <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}>


                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => router.push(`/product_catalogue/banner_management/edit/${banner.id}`)}
                        >  Update



                        </Button>

                        <Button
                            variant="contained"
                            onClick={() => handleOpenDeletePopup(banner.id)}
                        >
                            Delete
                        </Button>

                    </Box>
                </Box>
            </Box>


            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Banner</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete <strong>{banner?.title}</strong>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={deleteBannerMutation.isPending}
                        onClick={confirmDeleteBanner}
                    >
                        {deleteBannerMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>

                </DialogActions>
            </Dialog>

            <Snackbar
                open={Boolean(deleteSuccess)}
                autoHideDuration={2000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{
                    mt: "72px",
                    zIndex: (theme) => theme.zIndex.modal + 100,
                }}
                onClose={handleCloseSuccess}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    onClose={handleCloseSuccess}
                    sx={{ minWidth: 300 }}
                >
                    {deleteSuccess}
                </Alert>
            </Snackbar>


            <Snackbar
                open={Boolean(deleteError)}
                autoHideDuration={5500}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{
                    mt: "72px",
                    zIndex: (theme) => theme.zIndex.modal + 100,
                }}
                onClose={handleCloseError}
            >
                <Alert
                    severity="error"
                    variant="filled"
                    onClose={handleCloseError}
                    sx={{ minWidth: 300 }}
                >
                    {deleteError}
                </Alert>
            </Snackbar>


        </>
    );
}