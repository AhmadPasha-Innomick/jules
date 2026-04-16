"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { refreshTokenThunk } from "@/store/authSlice";
import NotFound from "@/app/not-found";

const ADMIN_ONLY_ROUTES = [
  "/user_management",
  "/group_management",
  "/group_management/assignments",
  "/module_management",
  "/module_management/assignments",
  "/password_management",
  "/incident_management",
  "/activity_logs",
  "/notification_management",
  "/profile",
  "/module_management/selected_id_types",
  "/module_management/service_types",
  "/module_management/payment_modes"



];

const NON_ADMIN_ALLOWED_ROUTES = [
  "/",
  "/subscribe_fingerprint_update",
  "/new_order_ekyc",
];

const publicRoutes = [
  "/login",
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, accessToken } = useAuth();

  const pathname = usePathname(); 
  const isPublicRoute = publicRoutes.includes(pathname); 

  const { data: userData, isLoading: userLoading } = useAuthUser(
    !isPublicRoute && !!accessToken
  );

  const user = userData?.json?.data;

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();


  useEffect(() => {
    if (isPublicRoute && isAuthenticated && accessToken) {
      router.replace("/");
    }
  }, [isPublicRoute, isAuthenticated, accessToken, router]);


  useEffect(() => {
    if (!isPublicRoute && !accessToken) {
      dispatch(refreshTokenThunk())
        .unwrap()
        .catch(() => router.replace("/signin"));
    }
  }, [accessToken, isPublicRoute, dispatch, router]);

 
  if (isPublicRoute) {
    return <>{children}</>;
  }


  if (!isAuthenticated || userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdmin = Number(user?.is_admin) === 1;
  const isManager = Number(user?.is_manager) === 1;

  const isAllowedForNonAdmin = NON_ADMIN_ALLOWED_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  );

  if (!isAdmin && !isAllowedForNonAdmin) {
    return <NotFound />;
  }

  return <>{children}</>;
}
