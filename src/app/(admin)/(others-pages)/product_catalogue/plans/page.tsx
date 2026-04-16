"use client";

import React, { useState } from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import { Box, Tabs, Tab } from "@mui/material";

import PrepaidVoiceList from "@/components/pages/product_catalog/prepaid_voice_list";
import PostpaidVoiceList from "@/components/pages/product_catalog/postpaid_voice_list";
import PrepaidBroadbandList from "@/components/pages/product_catalog/prepaid_broadband_list";
import PostpaidBroadbandList from "@/components/pages/product_catalog/postpaid_broadband_list";
import PostpaidFiberList from "@/components/pages/product_catalog/postpaid_fiber_list";

export default function VoiceCatalogueUnified() {
    const [catalogType, setCatalogType] = useState("prepaid_voice");

    const renderCatalogue = () => {
        switch (catalogType) {
            case "prepaid_voice":
                return <PrepaidVoiceList />;

            case "postpaid_voice":
                return <PostpaidVoiceList />;

            case "prepaid_broadband":
                return <PrepaidBroadbandList />;

            case "postpaid_broadband":
                return <PostpaidBroadbandList />;

            case "postpaid_fiber":
                return <PostpaidFiberList />;

            default:
                return <PrepaidVoiceList />;
        }
    };

    return (
        <div>
            <PageBreadcrumbDynamic
                items={[
                    { label: "Home", href: "/" },
                    { label: "Plans" },
                ]}
            />

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs
                    value={catalogType}
                    onChange={(e, val) => setCatalogType(val)}
                >
                    <Tab label="Prepaid Voice" value="prepaid_voice" />
                    <Tab label="Postpaid Voice" value="postpaid_voice" />
                    <Tab label="Prepaid Broadband" value="prepaid_broadband" />
                    <Tab label="Postpaid Broadband" value="postpaid_broadband" />
                    <Tab label="Postpaid Fiber" value="postpaid_fiber" />
                </Tabs>
            </Box>

            {renderCatalogue()}
        </div>
    );
}
