"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import SettingsIcon from "@mui/icons-material/Settings";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PasswordIcon from "@mui/icons-material/Password";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HistoryIcon from "@mui/icons-material/History";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import { IdCard } from "lucide-react";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import GroupsIcon from "@mui/icons-material/Groups";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AppsIcon from "@mui/icons-material/Apps";
import { ChevronDownIcon, HorizontaLDots } from "../icons/index";


type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <DashboardIcon sx={{ fontSize: 24 }} />,
    name: "Dashboard",
    path: "/"

  },
  {
    icon: <ManageAccountsIcon sx={{ fontSize: 24 }} />,
    name: "User Management",
    path: "/user_management",
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 24 }} />,
    name: "Group Management",
    subItems: [
      { name: "Groups", path: "/group_management" },
    ],
  },
  {
    icon: <AppsIcon sx={{ fontSize: 24 }} />,
    name: "Module Management",

    subItems: [
      { name: "Modules", path: "/module_management" },
      { name: "Access Control", path: "/module_management/assignments" },


    ],

  },

  {
    icon: <IdCard size={24} />,
    name: "Subscriber Fingerprint Update",
    path: "/subscribe_fingerprint_update",
  },
  {
    icon: <IdCard size={24} />,
    name: "Starter Pack Activation",
    path: "/new_order_ekyc",
  },

  {
    icon: <PasswordIcon sx={{ fontSize: 24 }} />,
    name: "Password Management",
    path: "/password_management",
  },

  {
    icon: <ReportProblemOutlinedIcon sx={{ fontSize: 24 }} />,
    name: "Incident Management",
    path: "/incident_management",
  },
  {
    icon: <WorkOutlineIcon sx={{ fontSize: 24 }} />,
    name: "Lead Management",
    path: "/lead_management",
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 24 }} />,
    name: "Incentive Management",
    path: "/incentive_management",
  },
  {
    icon: <ListAltIcon sx={{ fontSize: 24 }} />,
    name: "Incentive Audits",
    path: "/incentive_audits",
  },
  {
    icon: <HistoryIcon sx={{ fontSize: 24 }} />,

    name: "Login Activity Logs",

    path: "/activity_logs",
  },
  {
    icon: <NotificationsActiveIcon sx={{ fontSize: 24 }} />,
    name: "Notification Management",
    path: "/notification_management",
  },
  {
    icon: <SettingsIcon sx={{ fontSize: 24 }} />,
    name: "System Settings",
    path: "/settings_management",
  },
  {
    icon: <Inventory2Icon sx={{ fontSize: 24 }} />,
    name: "Product Catalogue",


    subItems: [
      { name: "Plans", path: "/product_catalogue/plans" },
      { name: "Devices", path: "/product_catalogue/device" },
      { name: "Banner Management", path: "/product_catalogue/banner_management" },


      // { name: "Prepaid Voice", path: "/product_catalogue/prepaid_voice_catalogue" },
      // { name: "Postpaid Voice", path: "/product_catalogue/postpaid_voice_catalogue" },

    ],
  }


];
const othersItems: NavItem[] = [];

const AppSidebar: React.FC<{ user: any }> = ({ user }) => {
  const hasRoleInfo = user?.is_admin !== undefined && user?.is_admin !== null;
  const isAdmin = Number(user?.is_admin) === 1;
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const ADMIN_HIDDEN_ITEMS = [
    "Subscriber Fingerprint Update",
    "Starter Pack Activation",
  ];

  const visibleNavItems = React.useMemo(() => {
    if (!hasRoleInfo) {
      return navItems;
    }

    if (isAdmin) {
      return navItems.filter(
        item => !ADMIN_HIDDEN_ITEMS.includes(item.name)
      );
    }


    return navItems.filter(
      item => ADMIN_HIDDEN_ITEMS.includes(item.name)
    );
  }, [hasRoleInfo, isAdmin]);



  const renderMenuItems = (
    visibleNavItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {visibleNavItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={` ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto h-5 w-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "text-brand-500 rotate-180"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 ml-9 space-y-1">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="ml-auto flex items-center gap-1">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const BASE_ROUTES = [
    "/group_management",
    "/module_management",
    "/product_catalogue",
  ];


  const isActive = useCallback(
    (path: string) => {

      if (pathname === path) return true;


      if (BASE_ROUTES.includes(path)) return false;


      return pathname.startsWith(path + "/");
    },
    [pathname]
  );




  useEffect(() => {
    let submenuMatched = false;

    visibleNavItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (
            pathname === subItem.path ||
            pathname.startsWith(subItem.path + "/")
          ) {
            setOpenSubmenu({
              type: "main",
              index,
            });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, visibleNavItems]);


  useEffect(() => {

    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 ${isExpanded || isMobileOpen
        ? "w-[290px]"
        : isHovered
          ? "w-[290px]"
          : "w-[90px]"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex py-8 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                src="/images/logo/logo3.svg"
                alt="Logo"
                width={84}
                height={55}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo3.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 flex text-xs leading-[20px] text-gray-400 uppercase ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(visibleNavItems, "main")}
            </div>

            {false && (
              <div className="">
                <h2
                  className={`mb-4 flex text-xs leading-[20px] text-gray-400 uppercase ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? "Others" : <HorizontaLDots />}
                </h2>

                {renderMenuItems(othersItems, "others")}
              </div>
            )}

          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;

