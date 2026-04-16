import React from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import ProductCatalogGrid from "@/components/pages/product_catalog/ProductCatalogGrid";

export default function ProductCatalogPage() {
    return (
        <div>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Banner Management" },
                ]}
            />

            <div className="mt-10">
                <ProductCatalogGrid />
            </div>
        </div>
    );
}
