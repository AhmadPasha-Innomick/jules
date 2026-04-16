"use client";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar user={null} />
      <Backdrop />
      <AppHeader user={null}>{children}</AppHeader>
    </div>
  );
}
