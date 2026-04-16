"use client";
import React from "react";
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import { useBannerList } from "@/hooks/useBanners";
import { useRouter } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import Button from "@/components/ui/button/Button";
import RefreshIcon from "@mui/icons-material/Refresh";
import { IconButton, Tooltip } from "@mui/material";

type BannerCategory = "product_catalog" | "home";

const ProductCatalogGrid = () => {
    const router = useRouter();


    const [category, setCategory] = React.useState<BannerCategory>(
        "home"
    );


    const {
        data,
        isLoading,
        error,
        refetch,
        isFetching,
    } = useBannerList(category);


    const products = data?.data || [];
    const isInitialLoading = isLoading && products.length === 0;
    const isToggleLoading = isFetching && !isLoading;


    const handleCategoryChange = (
        _: React.MouseEvent<HTMLElement>,
        newCategory: BannerCategory | null
    ) => {
        if (newCategory) {
            setCategory(newCategory);
        }
    };

    return (
        <>

            <Box
                sx={{
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                        onClick={() => router.push("/product_catalogue/banner_management/create")}
                        className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                    >
                        <AddIcon fontSize="small" />
                        Add Banner
                    </Button>



                </Box>


                <ToggleButtonGroup
                    value={category}
                    exclusive
                    onChange={handleCategoryChange}
                    size="small"
                    disabled={isFetching}
                    sx={{
                        "& .MuiToggleButton-root": {
                            minWidth: 160,
                            textTransform: "none",
                            fontWeight: 500,
                            borderColor: "#4f008c",
                            color: "#4f008c",
                            "&.Mui-selected": {
                                backgroundColor: "#4f008c",
                                color: "#fff",
                                "&:hover": {
                                    backgroundColor: "#3e006f",
                                },
                            },
                        },
                    }}
                >
                    <ToggleButton value="home">
                        Home
                    </ToggleButton>

                    <ToggleButton value="product_catalog">
                        Product Catalogue
                    </ToggleButton>

                </ToggleButtonGroup>
            </Box>




            {isInitialLoading && (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="60vh"
                >
                    <CircularProgress />
                </Box>

            )}







            {!isLoading && (
                <Box position="relative" sx={{ mt: 6 }}>

                    {isFetching && (
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                zIndex: 10,
                                backgroundColor: "rgba(255,255,255,0.6)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CircularProgress size={32} />
                        </Box>
                    )}

                    {!isInitialLoading && !isToggleLoading && <Grid container spacing={3}>
                        {products.map((item: any) => {
                            const extension = (item.extension || "png").toLowerCase();
                            const mimeType = extension === "jpg" ? "jpeg" : extension;

                            const imageSrc = item.image_base64
                                ? `data:image/${mimeType};base64,${item.image_base64}`
                                : undefined;

                            return (
                                // @ts-expect-error MUI Grid typing limitation (runtime-safe)
                                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                                    <Card
                                        onClick={() =>
                                            router.push(`banner_management/view/${item.id}`)
                                        }
                                        sx={{
                                            width: "100%",
                                            height: 360,
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
                                            borderRadius: 2,
                                            boxShadow: 2,
                                            transition: "transform 0.2s, box-shadow 0.2s",
                                            "&:hover": {
                                                transform: "translateY(-4px)",
                                                boxShadow: 6,
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 180,
                                                height: 370,
                                                margin: "0 auto",
                                                backgroundColor: "#f5f5f5",
                                                overflow: "hidden",
                                                borderRadius: 1,
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={imageSrc}
                                                alt={item.title}
                                                sx={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </Box>


                                        <CardContent sx={{ flexGrow: 1, px: 2, py: 1.5 }}>
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight={600}
                                                sx={{
                                                    lineHeight: 1.3,
                                                    mb: 0.5,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                }}
                                            >
                                                {item.title}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "text.secondary",
                                                    fontSize: "0.8rem",
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                Category:{" "}
                                                <Box component="span" sx={{ fontWeight: 500, color: "text.primary" }}>
                                                    {item.category.replace("_", " ")}
                                                </Box>
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>}
                </Box>
            )}

        </>
    );
};

export default ProductCatalogGrid;







