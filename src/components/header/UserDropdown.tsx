"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useDispatch } from "react-redux";
import { logoutThunk } from "@/store/authSlice";
import type { AppDispatch } from "@/store/store";
import Cookies from "js-cookie";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/navigation";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

interface UserDropdownProps {
  user?: any;
  isLoading?: boolean;
}

export default function UserDropdown({ user, isLoading }: UserDropdownProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [preview, setPreview] = useState<string>("/images/user/profile-icon.jpg");
  const router = useRouter();
  const isManager = Number(user?.is_manager) === 1;
  const hasAuthSession = Boolean(Cookies.get("accessToken"));

  useEffect(() => {
    setMounted(true);
  }, []);
  const username = useMemo(() => {
    return Cookies.get("username") || user?.full_name || "Public User";
  }, [user?.full_name]);
  useEffect(() => {
    if (user?.profile_photo && user.profile_photo.trim() !== "") {
      setPreview(user.profile_photo);
    } else {
      setPreview("/images/user/profile-icon.jpg");
    }
  }, [user?.profile_photo]);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSignOut = async () => {
    await dispatch(logoutThunk())
  };

  if (!mounted) {
    return (
      <div className="flex items-center">
        <span className="mr-3 h-11 w-11 rounded-full bg-gray-300 animate-pulse" />
        <span className="w-24 h-4 bg-gray-300 rounded animate-pulse" />
      </div>
    );
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-3">
        <CircularProgress size={24} />
      </div>
    );
  }


  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center text-white"
      >

        <span className="mr-3 h-11 w-11 overflow-hidden rounded-full bg-gray-200">
          <span className="mr-3 h-11 w-11 overflow-hidden rounded-full bg-gray-200">
            {preview.startsWith("data:") ? (

              <img
                src={preview}
                alt="User"
                className="h-full w-full object-cover rounded-full"
                onError={() => setPreview("/images/user/profile-icon.jpg")}
              />
            ) : (

              <img
                width={44}
                height={44}
                src={preview}
                alt="User"
                className="object-cover rounded-full"
                onError={() => setPreview("/images/user/profile-icon.jpg")}

              />
            )}
          </span>
        </span>

        <span className="text-theme-sm mr-1 block font-stc-medium">{username}
        </span>

        <svg
          className={`stroke-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="shadow-theme-lg absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3"
      >
        <div className="px-3">
          <span className="text-theme-sm block font-stc-medium text-gray-700">
            {user?.full_name || "Public Access"}
          </span>
          <span className="text-theme-xs mt-0.5 block text-gray-500">
            {user?.email || "Authentication disabled"}
          </span>
        </div>


        <ul className="flex flex-col gap-1 border-b border-gray-200 pt-4 pb-3">

          {hasAuthSession && !isManager && (
            <li>
              <DropdownItem
                onItemClick={() => {
                  closeDropdown();
                  router.push("/profile");
                }}
                className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-stc-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700"
              >
                <EditOutlinedIcon
                  sx={{
                    fontSize: 18,
                    color: "#6b7280",
                  }}
                  className="group-hover:text-gray-700"
                />
                <span>Edit profile</span>
              </DropdownItem>
            </li>
          )}



        </ul>
        {hasAuthSession && (
          <button
            onClick={handleSignOut}
            className="group text-theme-sm mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 font-stc-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700"
          >
            <LogoutOutlinedIcon
              sx={{ fontSize: 18 }}
              className="text-gray-500 transition-colors group-hover:text-gray-700"
            />
            <span>Sign out</span>
          </button>
        )}

      </Dropdown>
    </div>
  );
}












