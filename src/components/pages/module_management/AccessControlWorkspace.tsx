"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageBreadcrumbDynamic from "@/components/common/PageBreadCrumbDynamic";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Switch,
} from "@mui/material";
import { useModulesDropdown } from "@/hooks/useModules";
import { useGroupsDropdown } from "@/hooks/useGroups";
import { useUsersDropdown } from "@/hooks/useApi";
import {
  useAssignModuleGroup,
  useAssignUser,
  useGroupAssignments,
  useModuleAssignments,
  useUnassignUserFromGroup,
  useUnlinkModuleGroup,
} from "@/hooks/useGroupAssignments";
import { usePaymentModes, useServiceTypes } from "@/hooks/useLookups";
import {
  useLinkPaymodeToGroup,
  usePayModLinks,
  useUnlinkPaymodeFromGroup,
} from "@/hooks/usePayModLinks";
import {
  useLinkServiceToGroup,
  useServiceLinks,
  useUnlinkServiceFromGroup,
} from "@/hooks/useServiceLinks";
import {
  useLinkSelectedIdType,
  useSelectedIdTypeLinks,
  useUnlinkSelectedIdType,
} from "@/hooks/useSelectedIdTypeLinks";
import { ID_TYPE_OPTIONS } from "@/constants/idTypes";

type AnyRecord = Record<string, any>;
type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error";
};

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const toPairKey = (left: unknown, right: unknown) =>
  `${String(left)}::${String(right)}`;

const extractErrorMessage = (error: any, fallback: string) => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  if (error?.data && typeof error.data === "object") {
    const firstFieldError = Object.values(error.data).flat().find(Boolean);
    if (typeof firstFieldError === "string" && firstFieldError.trim()) {
      return firstFieldError;
    }
  }

  return fallback;
};

const SectionTitle = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="h6" fontWeight={600}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {subtitle}
    </Typography>
  </Box>
);

export default function AccessControlWorkspace() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({
    open: false,
    title: "",
    description: "",
  });
  const pendingConfirmActionRef = useRef<null | (() => Promise<void>)>(null);

  const [moduleSearch, setModuleSearch] = useState("");
  const [groupSearchInModuleTab, setGroupSearchInModuleTab] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [moduleSearchInGroupTab, setModuleSearchInGroupTab] = useState("");
  const [userSearchInGroupTab, setUserSearchInGroupTab] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [groupSearchInUserTab, setGroupSearchInUserTab] = useState("");

  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  const [moduleTabEntitlementGroupId, setModuleTabEntitlementGroupId] =
    useState<number | null>(null);
  const [groupTabEntitlementModuleId, setGroupTabEntitlementModuleId] =
    useState<number | null>(null);

  const dropdownParams = useMemo(
    () => ({
      limit: 1000,
      offset: 0,
    }),
    []
  );

  const mappingParams = useMemo(
    () => ({
      limit: 5000,
      offset: 0,
    }),
    []
  );

  const {
    data: modulesData,
    isLoading: modulesLoading,
    isFetching: modulesFetching,
  } = useModulesDropdown(dropdownParams);

  const {
    data: groupsData,
    isLoading: groupsLoading,
    isFetching: groupsFetching,
  } = useGroupsDropdown(dropdownParams);

  const {
    data: usersData,
    isLoading: usersLoading,
    isFetching: usersFetching,
  } = useUsersDropdown(dropdownParams);

  const {
    data: moduleAssignmentsData,
    isLoading: moduleAssignmentsLoading,
    isFetching: moduleAssignmentsFetching,
    refetch: refetchModuleAssignments,
  } = useModuleAssignments(mappingParams);

  const {
    data: groupAssignmentsData,
    isLoading: groupAssignmentsLoading,
    isFetching: groupAssignmentsFetching,
    refetch: refetchGroupAssignments,
  } = useGroupAssignments(mappingParams);

  const {
    data: payModLinksData,
    isLoading: payModLinksLoading,
    isFetching: payModLinksFetching,
    refetch: refetchPayModLinks,
  } = usePayModLinks(mappingParams);

  const {
    data: serviceLinksData,
    isLoading: serviceLinksLoading,
    isFetching: serviceLinksFetching,
    refetch: refetchServiceLinks,
  } = useServiceLinks(mappingParams);

  const {
    data: idTypeLinksData,
    isLoading: idTypeLinksLoading,
    isFetching: idTypeLinksFetching,
    refetch: refetchIdTypeLinks,
  } = useSelectedIdTypeLinks(mappingParams);

  const { data: paymentModesData, isLoading: paymentModesLoading } =
    usePaymentModes();
  const { data: serviceTypesData, isLoading: serviceTypesLoading } =
    useServiceTypes();

  const assignModuleGroupMutation = useAssignModuleGroup();
  const unlinkModuleGroupMutation = useUnlinkModuleGroup();
  const assignUserMutation = useAssignUser();
  const unassignUserMutation = useUnassignUserFromGroup();
  const linkPaymodeMutation = useLinkPaymodeToGroup();
  const unlinkPaymodeMutation = useUnlinkPaymodeFromGroup();
  const linkServiceMutation = useLinkServiceToGroup();
  const unlinkServiceMutation = useUnlinkServiceFromGroup();
  const linkIdTypeMutation = useLinkSelectedIdType();
  const unlinkIdTypeMutation = useUnlinkSelectedIdType();

  const modules = useMemo(() => modulesData?.data || [], [modulesData]);
  const groups = useMemo(() => groupsData?.data?.groups || [], [groupsData]);
  const users = useMemo(() => usersData?.data?.users || [], [usersData]);
  const moduleAssignmentRows = useMemo(
    () => moduleAssignmentsData?.data?.items || [],
    [moduleAssignmentsData]
  );
  const groupAssignmentRows = useMemo(
    () => groupAssignmentsData?.data?.links || [],
    [groupAssignmentsData]
  );
  const payModeRows = useMemo(
    () => payModLinksData?.json?.data?.items || [],
    [payModLinksData]
  );
  const serviceRows = useMemo(
    () => serviceLinksData?.json?.data?.items || [],
    [serviceLinksData]
  );
  const idTypeRows = useMemo(
    () => idTypeLinksData?.data?.items || [],
    [idTypeLinksData]
  );
  const paymentModes = useMemo(
    () => paymentModesData?.data || [],
    [paymentModesData]
  );
  const serviceTypes = useMemo(() => serviceTypesData || [], [serviceTypesData]);

  const modulesByName = useMemo(() => {
    const map = new Map<string, AnyRecord>();
    modules.forEach((moduleItem: AnyRecord) => {
      map.set(normalizeText(moduleItem.module_name), moduleItem);
    });
    return map;
  }, [modules]);

  const groupsByName = useMemo(() => {
    const map = new Map<string, AnyRecord>();
    groups.forEach((groupItem: AnyRecord) => {
      map.set(normalizeText(groupItem.group_name), groupItem);
    });
    return map;
  }, [groups]);

  const resolvedModuleAssignments = useMemo(() => {
    return (moduleAssignmentRows || []).map((row: AnyRecord) => {
      const resolvedModuleId =
        row.module_id ??
        modulesByName.get(normalizeText(row.module_name))?.module_id ??
        null;
      const resolvedGroupId =
        row.group_id ??
        groupsByName.get(normalizeText(row.group_name))?.group_id ??
        null;

      return {
        ...row,
        module_id:
          resolvedModuleId !== null && resolvedModuleId !== undefined
            ? Number(resolvedModuleId)
            : null,
        group_id:
          resolvedGroupId !== null && resolvedGroupId !== undefined
            ? Number(resolvedGroupId)
            : null,
      };
    });
  }, [moduleAssignmentRows, modulesByName, groupsByName]);

  const moduleGroupByPairId = useMemo(() => {
    const map = new Map<string, AnyRecord>();

    resolvedModuleAssignments.forEach((row: AnyRecord) => {
      if (row.module_id === null || row.group_id === null) return;
      map.set(toPairKey(row.module_id, row.group_id), row);
    });

    return map;
  }, [resolvedModuleAssignments]);

  const moduleGroupByPairName = useMemo(() => {
    const map = new Map<string, AnyRecord>();

    resolvedModuleAssignments.forEach((row: AnyRecord) => {
      map.set(
        toPairKey(normalizeText(row.module_name), normalizeText(row.group_name)),
        row
      );
    });

    return map;
  }, [resolvedModuleAssignments]);

  const getModuleGroupLink = useCallback(
    (moduleItem: AnyRecord | null, groupItem: AnyRecord | null) => {
      if (!moduleItem || !groupItem) return null;

      const idLink = moduleGroupByPairId.get(
        toPairKey(Number(moduleItem.module_id), Number(groupItem.group_id))
      );
      if (idLink) return idLink;

      return (
        moduleGroupByPairName.get(
          toPairKey(
            normalizeText(moduleItem.module_name),
            normalizeText(groupItem.group_name)
          )
        ) || null
      );
    },
    [moduleGroupByPairId, moduleGroupByPairName]
  );

  const resolvedGroupAssignments = useMemo(() => {
    return (groupAssignmentRows || []).map((row: AnyRecord) => {
      const resolvedGroupId =
        row.group_id ??
        groupsByName.get(normalizeText(row.group_name))?.group_id ??
        null;

      return {
        ...row,
        group_id:
          resolvedGroupId !== null && resolvedGroupId !== undefined
            ? Number(resolvedGroupId)
            : null,
      };
    });
  }, [groupAssignmentRows, groupsByName]);

  const groupUserByPair = useMemo(() => {
    const map = new Map<string, AnyRecord>();

    resolvedGroupAssignments.forEach((row: AnyRecord) => {
      if (row.group_id === null || !row.user_name) return;
      map.set(toPairKey(row.group_id, normalizeText(row.user_name)), row);
    });

    return map;
  }, [resolvedGroupAssignments]);

  const linkedGroupsByUser = useMemo(() => {
    const map = new Map<string, Set<number>>();

    resolvedGroupAssignments.forEach((row: AnyRecord) => {
      if (row.group_id === null || !row.user_name) return;

      const key = normalizeText(row.user_name);
      if (!map.has(key)) {
        map.set(key, new Set<number>());
      }
      map.get(key)?.add(Number(row.group_id));
    });

    return map;
  }, [resolvedGroupAssignments]);

  const linkedModulesByGroup = useMemo(() => {
    const map = new Map<number, Set<number>>();

    resolvedModuleAssignments.forEach((row: AnyRecord) => {
      if (row.module_id === null || row.group_id === null) return;
      if (!map.has(Number(row.group_id))) {
        map.set(Number(row.group_id), new Set<number>());
      }
      map.get(Number(row.group_id))?.add(Number(row.module_id));
    });

    return map;
  }, [resolvedModuleAssignments]);

  const paymodeSetByModuleGroupId = useMemo(() => {
    const map = new Map<number, Set<number>>();

    payModeRows.forEach((row: AnyRecord) => {
      const moduleGroupId = Number(row.module_group_id);
      const paymodeId = Number(row.mpos_paymode_id);

      if (!Number.isFinite(moduleGroupId) || !Number.isFinite(paymodeId)) return;

      if (!map.has(moduleGroupId)) {
        map.set(moduleGroupId, new Set<number>());
      }
      map.get(moduleGroupId)?.add(paymodeId);
    });

    return map;
  }, [payModeRows]);

  const serviceSetByModuleGroupId = useMemo(() => {
    const map = new Map<number, Set<number>>();

    serviceRows.forEach((row: AnyRecord) => {
      const moduleGroupId = Number(row.module_group_id);
      const serviceTypeId = Number(row.service_typeID);

      if (!Number.isFinite(moduleGroupId) || !Number.isFinite(serviceTypeId)) {
        return;
      }

      if (!map.has(moduleGroupId)) {
        map.set(moduleGroupId, new Set<number>());
      }
      map.get(moduleGroupId)?.add(serviceTypeId);
    });

    return map;
  }, [serviceRows]);

  const idTypeSetByModuleGroupId = useMemo(() => {
    const map = new Map<number, Set<string>>();

    idTypeRows.forEach((row: AnyRecord) => {
      const moduleGroupId = Number(row.module_group_id);
      const idTypeCode = String(row.select_id_types || "").trim();

      if (!Number.isFinite(moduleGroupId) || !idTypeCode) return;

      if (!map.has(moduleGroupId)) {
        map.set(moduleGroupId, new Set<string>());
      }
      map.get(moduleGroupId)?.add(idTypeCode);
    });

    return map;
  }, [idTypeRows]);

  const selectedModule = useMemo(
    () =>
      modules.find(
        (moduleItem: AnyRecord) =>
          Number(moduleItem.module_id) === Number(selectedModuleId)
      ) || null,
    [modules, selectedModuleId]
  );

  const selectedGroup = useMemo(
    () =>
      groups.find(
        (groupItem: AnyRecord) =>
          Number(groupItem.group_id) === Number(selectedGroupId)
      ) || null,
    [groups, selectedGroupId]
  );

  const selectedUser = useMemo(
    () =>
      users.find(
        (userItem: AnyRecord) =>
          normalizeText(userItem.user_name) === normalizeText(selectedUserName)
      ) || null,
    [users, selectedUserName]
  );

  const moduleTabEntitlementGroup = useMemo(
    () =>
      groups.find(
        (groupItem: AnyRecord) =>
          Number(groupItem.group_id) === Number(moduleTabEntitlementGroupId)
      ) || null,
    [groups, moduleTabEntitlementGroupId]
  );

  const groupTabEntitlementModule = useMemo(
    () =>
      modules.find(
        (moduleItem: AnyRecord) =>
          Number(moduleItem.module_id) === Number(groupTabEntitlementModuleId)
      ) || null,
    [modules, groupTabEntitlementModuleId]
  );

  const moduleTabEntitlementLink = useMemo(
    () => getModuleGroupLink(selectedModule, moduleTabEntitlementGroup),
    [selectedModule, moduleTabEntitlementGroup, getModuleGroupLink]
  );

  const groupTabEntitlementLink = useMemo(
    () => getModuleGroupLink(groupTabEntitlementModule, selectedGroup),
    [groupTabEntitlementModule, selectedGroup, getModuleGroupLink]
  );

  useEffect(() => {
    if (!modules.length) {
      setSelectedModuleId(null);
      return;
    }

    const exists = modules.some(
      (moduleItem: AnyRecord) =>
        Number(moduleItem.module_id) === Number(selectedModuleId)
    );

    if (!selectedModuleId || !exists) {
      setSelectedModuleId(Number(modules[0].module_id));
    }
  }, [modules, selectedModuleId]);

  useEffect(() => {
    if (!groups.length) {
      setSelectedGroupId(null);
      return;
    }

    const exists = groups.some(
      (groupItem: AnyRecord) =>
        Number(groupItem.group_id) === Number(selectedGroupId)
    );

    if (!selectedGroupId || !exists) {
      setSelectedGroupId(Number(groups[0].group_id));
    }
  }, [groups, selectedGroupId]);

  useEffect(() => {
    if (!users.length) {
      setSelectedUserName("");
      return;
    }

    const exists = users.some(
      (userItem: AnyRecord) =>
        normalizeText(userItem.user_name) === normalizeText(selectedUserName)
    );

    if (!selectedUserName || !exists) {
      setSelectedUserName(String(users[0].user_name || ""));
    }
  }, [users, selectedUserName]);

  useEffect(() => {
    if (!selectedModule) {
      setModuleTabEntitlementGroupId(null);
      return;
    }

    const linkedGroups = groups.filter((groupItem: AnyRecord) =>
      Boolean(getModuleGroupLink(selectedModule, groupItem))
    );

    if (!linkedGroups.length) {
      setModuleTabEntitlementGroupId(null);
      return;
    }

    const exists = linkedGroups.some(
      (groupItem: AnyRecord) =>
        Number(groupItem.group_id) === Number(moduleTabEntitlementGroupId)
    );

    if (!exists) {
      setModuleTabEntitlementGroupId(Number(linkedGroups[0].group_id));
    }
  }, [
    selectedModule,
    groups,
    moduleTabEntitlementGroupId,
    getModuleGroupLink,
    resolvedModuleAssignments,
  ]);

  useEffect(() => {
    if (!selectedGroup) {
      setGroupTabEntitlementModuleId(null);
      return;
    }

    const linkedModules = modules.filter((moduleItem: AnyRecord) =>
      Boolean(getModuleGroupLink(moduleItem, selectedGroup))
    );

    if (!linkedModules.length) {
      setGroupTabEntitlementModuleId(null);
      return;
    }

    const exists = linkedModules.some(
      (moduleItem: AnyRecord) =>
        Number(moduleItem.module_id) === Number(groupTabEntitlementModuleId)
    );

    if (!exists) {
      setGroupTabEntitlementModuleId(Number(linkedModules[0].module_id));
    }
  }, [
    selectedGroup,
    modules,
    groupTabEntitlementModuleId,
    getModuleGroupLink,
    resolvedModuleAssignments,
  ]);

  const showToast = useCallback(
    (severity: "success" | "error", message: string) => {
      setSnackbar({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  const requestConfirmation = useCallback(
    (title: string, description: string, action: () => Promise<void>) => {
      if (!isEditMode) return;

      pendingConfirmActionRef.current = action;
      setConfirmDialog({
        open: true,
        title,
        description,
      });
    },
    [isEditMode]
  );

  const handleConfirmAction = useCallback(async () => {
    if (!pendingConfirmActionRef.current) {
      setConfirmDialog((prev) => ({ ...prev, open: false }));
      return;
    }

    setIsConfirming(true);
    try {
      await pendingConfirmActionRef.current();
    } finally {
      pendingConfirmActionRef.current = null;
      setIsConfirming(false);
      setConfirmDialog({
        open: false,
        title: "",
        description: "",
      });
    }
  }, []);

  const refreshAllModuleGroupDependentData = useCallback(async () => {
    await refetchModuleAssignments();
    await refetchPayModLinks();
    await refetchServiceLinks();
    await refetchIdTypeLinks();
  }, [
    refetchIdTypeLinks,
    refetchModuleAssignments,
    refetchPayModLinks,
    refetchServiceLinks,
  ]);

  const isAnyMutationPending =
    assignModuleGroupMutation.isPending ||
    unlinkModuleGroupMutation.isPending ||
    assignUserMutation.isPending ||
    unassignUserMutation.isPending ||
    linkPaymodeMutation.isPending ||
    unlinkPaymodeMutation.isPending ||
    linkServiceMutation.isPending ||
    unlinkServiceMutation.isPending ||
    linkIdTypeMutation.isPending ||
    unlinkIdTypeMutation.isPending;

  const handleToggleModuleGroup = useCallback(
    async (moduleItem: AnyRecord, groupItem: AnyRecord) => {
      const link = getModuleGroupLink(moduleItem, groupItem);

      try {
        if (link?.module_group_id) {
          await unlinkModuleGroupMutation.mutateAsync({
            module_group_id: Number(link.module_group_id),
          });
          showToast(
            "success",
            `Removed "${groupItem.group_name}" from "${moduleItem.module_name}".`
          );
        } else {
          await assignModuleGroupMutation.mutateAsync({
            module_id: Number(moduleItem.module_id),
            group_id: Number(groupItem.group_id),
          });
          showToast(
            "success",
            `Linked "${groupItem.group_name}" to "${moduleItem.module_name}".`
          );
        }

        await refreshAllModuleGroupDependentData();
      } catch (error: any) {
        showToast(
          "error",
          extractErrorMessage(error, "Failed to update module-group mapping.")
        );
      }
    },
    [
      assignModuleGroupMutation,
      getModuleGroupLink,
      refreshAllModuleGroupDependentData,
      showToast,
      unlinkModuleGroupMutation,
    ]
  );

  const handleToggleUserGroup = useCallback(
    async (groupItem: AnyRecord, userItem: AnyRecord) => {
      const pairKey = toPairKey(
        Number(groupItem.group_id),
        normalizeText(userItem.user_name)
      );
      const existingLink = groupUserByPair.get(pairKey);

      try {
        if (existingLink?.group_user_id) {
          await unassignUserMutation.mutateAsync({
            group_user_id: Number(existingLink.group_user_id),
          });
          showToast(
            "success",
            `Removed "${userItem.user_name}" from "${groupItem.group_name}".`
          );
        } else {
          await assignUserMutation.mutateAsync({
            group_id: Number(groupItem.group_id),
            user_name: userItem.user_name,
          });
          showToast(
            "success",
            `Assigned "${userItem.user_name}" to "${groupItem.group_name}".`
          );
        }
        await refetchGroupAssignments();
      } catch (error: any) {
        showToast(
          "error",
          extractErrorMessage(error, "Failed to update user-group assignment.")
        );
      }
    },
    [
      assignUserMutation,
      groupUserByPair,
      refetchGroupAssignments,
      showToast,
      unassignUserMutation,
    ]
  );

  const handleTogglePaymode = useCallback(
    async (moduleGroupId: number, paymodeId: number, checked: boolean) => {
      try {
        if (checked) {
          await unlinkPaymodeMutation.mutateAsync({
            module_group_id: moduleGroupId,
            mpos_paymode_id: paymodeId,
          });
          showToast("success", "Payment mode unlinked.");
        } else {
          await linkPaymodeMutation.mutateAsync({
            module_group_id: moduleGroupId,
            mpos_paymode_id: paymodeId,
            is_active: 1,
          });
          showToast("success", "Payment mode linked.");
        }

        await refetchPayModLinks();
      } catch (error: any) {
        showToast("error", extractErrorMessage(error, "Failed to update paymode."));
      }
    },
    [linkPaymodeMutation, refetchPayModLinks, showToast, unlinkPaymodeMutation]
  );

  const handleToggleServiceType = useCallback(
    async (moduleGroupId: number, serviceTypeId: number, checked: boolean) => {
      try {
        if (checked) {
          await unlinkServiceMutation.mutateAsync({
            module_group_id: moduleGroupId,
            service_typeID: serviceTypeId,
          });
          showToast("success", "Service type unlinked.");
        } else {
          await linkServiceMutation.mutateAsync({
            module_group_id: moduleGroupId,
            service_typeID: serviceTypeId,
            is_active: 1,
          });
          showToast("success", "Service type linked.");
        }

        await refetchServiceLinks();
      } catch (error: any) {
        showToast(
          "error",
          extractErrorMessage(error, "Failed to update service type.")
        );
      }
    },
    [linkServiceMutation, refetchServiceLinks, showToast, unlinkServiceMutation]
  );

  const handleToggleIdType = useCallback(
    async (moduleGroupId: number, idTypeCode: string, checked: boolean) => {
      try {
        if (checked) {
          await unlinkIdTypeMutation.mutateAsync({
            module_group_id: moduleGroupId,
            select_id_types: idTypeCode,
          });
          showToast("success", "ID type unlinked.");
        } else {
          const idTypeConfig = ID_TYPE_OPTIONS.find(
            (item) => item.code === idTypeCode
          );
          await linkIdTypeMutation.mutateAsync({
            module_group_id: moduleGroupId,
            select_id_types: idTypeCode,
            select_id_type_order: idTypeConfig?.order ?? 1,
            is_active: 1,
          });
          showToast("success", "ID type linked.");
        }
        await refetchIdTypeLinks();
      } catch (error: any) {
        showToast(
          "error",
          extractErrorMessage(error, "Failed to update ID type.")
        );
      }
    },
    [linkIdTypeMutation, refetchIdTypeLinks, showToast, unlinkIdTypeMutation]
  );

  const filteredModules = useMemo(() => {
    const searchKey = normalizeText(moduleSearch);
    if (!searchKey) return modules;
    return modules.filter((moduleItem: AnyRecord) =>
      normalizeText(moduleItem.module_name).includes(searchKey)
    );
  }, [moduleSearch, modules]);

  const filteredGroupsInModuleTab = useMemo(() => {
    const searchKey = normalizeText(groupSearchInModuleTab);
    if (!searchKey) return groups;
    return groups.filter((groupItem: AnyRecord) =>
      normalizeText(groupItem.group_name).includes(searchKey)
    );
  }, [groupSearchInModuleTab, groups]);

  const filteredGroups = useMemo(() => {
    const searchKey = normalizeText(groupSearch);
    if (!searchKey) return groups;
    return groups.filter((groupItem: AnyRecord) =>
      normalizeText(groupItem.group_name).includes(searchKey)
    );
  }, [groupSearch, groups]);

  const filteredModulesInGroupTab = useMemo(() => {
    const searchKey = normalizeText(moduleSearchInGroupTab);
    if (!searchKey) return modules;
    return modules.filter((moduleItem: AnyRecord) =>
      normalizeText(moduleItem.module_name).includes(searchKey)
    );
  }, [moduleSearchInGroupTab, modules]);

  const filteredUsersInGroupTab = useMemo(() => {
    const searchKey = normalizeText(userSearchInGroupTab);
    if (!searchKey) return users;
    return users.filter((userItem: AnyRecord) =>
      normalizeText(userItem.user_name).includes(searchKey)
    );
  }, [userSearchInGroupTab, users]);

  const filteredUsers = useMemo(() => {
    const searchKey = normalizeText(userSearch);
    if (!searchKey) return users;
    return users.filter((userItem: AnyRecord) =>
      normalizeText(userItem.user_name).includes(searchKey)
    );
  }, [userSearch, users]);

  const filteredGroupsInUserTab = useMemo(() => {
    const searchKey = normalizeText(groupSearchInUserTab);
    if (!searchKey) return groups;
    return groups.filter((groupItem: AnyRecord) =>
      normalizeText(groupItem.group_name).includes(searchKey)
    );
  }, [groupSearchInUserTab, groups]);

  const selectedUserGroupIds = useMemo(() => {
    if (!selectedUser?.user_name) return new Set<number>();
    return (
      linkedGroupsByUser.get(normalizeText(selectedUser.user_name)) ||
      new Set<number>()
    );
  }, [linkedGroupsByUser, selectedUser]);

  const selectedUserEffectiveModules = useMemo(() => {
    if (!selectedUser?.user_name) return [];

    const groupIds = selectedUserGroupIds;
    const moduleNameSet = new Set<string>();

    resolvedModuleAssignments.forEach((row: AnyRecord) => {
      if (row.group_id === null || !groupIds.has(Number(row.group_id))) return;
      moduleNameSet.add(String(row.module_name || ""));
    });

    return Array.from(moduleNameSet).filter(Boolean).sort();
  }, [resolvedModuleAssignments, selectedUser, selectedUserGroupIds]);

  const renderEntitlementPanel = (
    moduleGroupLink: AnyRecord | null,
    moduleName: string,
    groupName: string
  ) => {
    if (!moduleGroupLink?.module_group_id) {
      return (
        <Alert severity="info" sx={{ mt: 1 }}>
          Link module and group first, then entitlement checkboxes will appear here.
        </Alert>
      );
    }

    const moduleGroupId = Number(moduleGroupLink.module_group_id);
    const linkedPaymodes = paymodeSetByModuleGroupId.get(moduleGroupId) || new Set();
    const linkedServices =
      serviceSetByModuleGroupId.get(moduleGroupId) || new Set<number>();
    const linkedIdTypes =
      idTypeSetByModuleGroupId.get(moduleGroupId) || new Set<string>();

    return (
      <Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mb: 1.5 }}
        >
          <Chip
            label={`Module: ${moduleName}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Group: ${groupName}`}
            color="secondary"
            variant="outlined"
          />
          <Chip label={`Link ID: ${moduleGroupId}`} variant="outlined" />
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
              <SectionTitle
                title="Paymodes"
                subtitle="Check to link, uncheck to unlink."
              />
              <Divider sx={{ mb: 1 }} />
              <List dense sx={{ maxHeight: 260, overflow: "auto", py: 0 }}>
                {paymentModes.map((paymode: AnyRecord) => {
                  const paymodeId = Number(paymode.id);
                  const checked = linkedPaymodes.has(paymodeId);

                  return (
                    <ListItemButton
                      key={paymodeId}
                      dense
                      disabled={!isEditMode || isAnyMutationPending || isConfirming}
                      onClick={() => {
                        const actionLabel = checked ? "unlink" : "link";
                        requestConfirmation(
                          "Confirm Paymode Change",
                          `Are you sure you want to ${actionLabel} "${paymode.Paymentmode}" for "${moduleName} / ${groupName}"?`,
                          () => handleTogglePaymode(moduleGroupId, paymodeId, checked)
                        );
                      }}
                    >
                      <Checkbox
                        edge="start"
                        checked={checked}
                        tabIndex={-1}
                        disableRipple
                        disabled={!isEditMode || isAnyMutationPending || isConfirming}
                      />
                      <ListItemText primary={paymode.Paymentmode} />
                    </ListItemButton>
                  );
                })}
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
              <SectionTitle
                title="Service Types"
                subtitle="Check to link, uncheck to unlink."
              />
              <Divider sx={{ mb: 1 }} />
              <List dense sx={{ maxHeight: 260, overflow: "auto", py: 0 }}>
                {serviceTypes.map((service: AnyRecord) => {
                  const serviceTypeId = Number(service.service_typeID);
                  const checked = linkedServices.has(serviceTypeId);

                  return (
                    <ListItemButton
                      key={serviceTypeId}
                      dense
                      disabled={!isEditMode || isAnyMutationPending || isConfirming}
                      onClick={() => {
                        const actionLabel = checked ? "unlink" : "link";
                        requestConfirmation(
                          "Confirm Service Type Change",
                          `Are you sure you want to ${actionLabel} "${service.service_type}" for "${moduleName} / ${groupName}"?`,
                          () =>
                            handleToggleServiceType(
                              moduleGroupId,
                              serviceTypeId,
                              checked
                            )
                        );
                      }}
                    >
                      <Checkbox
                        edge="start"
                        checked={checked}
                        tabIndex={-1}
                        disableRipple
                        disabled={!isEditMode || isAnyMutationPending || isConfirming}
                      />
                      <ListItemText
                        primary={service.service_type}
                        secondary={service.service_type_slug || ""}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
              <SectionTitle
                title="ID Types"
                subtitle="Check to link, uncheck to unlink."
              />
              <Divider sx={{ mb: 1 }} />
              <List dense sx={{ maxHeight: 260, overflow: "auto", py: 0 }}>
                {ID_TYPE_OPTIONS.map((idType) => {
                  const checked = linkedIdTypes.has(idType.code);
                  return (
                    <ListItemButton
                      key={idType.code}
                      dense
                      disabled={!isEditMode || isAnyMutationPending || isConfirming}
                      onClick={() => {
                        const actionLabel = checked ? "unlink" : "link";
                        requestConfirmation(
                          "Confirm ID Type Change",
                          `Are you sure you want to ${actionLabel} "${idType.label}" for "${moduleName} / ${groupName}"?`,
                          () => handleToggleIdType(moduleGroupId, idType.code, checked)
                        );
                      }}
                    >
                      <Checkbox
                        edge="start"
                        checked={checked}
                        tabIndex={-1}
                        disableRipple
                        disabled={!isEditMode || isAnyMutationPending || isConfirming}
                      />
                      <ListItemText
                        primary={idType.label}
                        secondary={`Code: ${idType.code}`}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const showGlobalLoading =
    modulesLoading ||
    groupsLoading ||
    usersLoading ||
    moduleAssignmentsLoading ||
    groupAssignmentsLoading ||
    payModLinksLoading ||
    serviceLinksLoading ||
    idTypeLinksLoading ||
    paymentModesLoading ||
    serviceTypesLoading;

  const showGlobalFetching =
    modulesFetching ||
    groupsFetching ||
    usersFetching ||
    moduleAssignmentsFetching ||
    groupAssignmentsFetching ||
    payModLinksFetching ||
    serviceLinksFetching ||
    idTypeLinksFetching;

  if (showGlobalLoading) {
    return (
      <Box
        sx={{
          minHeight: 420,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageBreadcrumbDynamic
        items={[
          { label: "Home", href: "/" },
          { label: "Module Management", href: "/module_management" },
          { label: "Access Control" },
        ]}
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        Standard flow: Module -&gt; Group -&gt; User. Use checkboxes to link and unlink
        everywhere.
      </Alert>

      {(isAnyMutationPending || isConfirming) && (
        <Alert
          severity="info"
          icon={<CircularProgress size={16} />}
          sx={{ mb: 2 }}
        >
          Applying changes...
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={1}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Access Control Workspace
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unified management for module-group-user mapping and entitlement
              linking.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={isEditMode}
                  onChange={(event) => setIsEditMode(event.target.checked)}
                />
              }
              label={isEditMode ? "Edit Mode" : "View Only"}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => router.push("/group_management/create")}
            >
              Create Group
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => router.push("/user_management/create")}
            >
              Create User
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Modules" />
          <Tab label="Groups" />
          <Tab label="Users" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
              <SectionTitle
                title="Modules"
                subtitle="Select one module to manage linked groups."
              />
              <TextField
                size="small"
                fullWidth
                placeholder="Search modules..."
                value={moduleSearch}
                onChange={(event) => setModuleSearch(event.target.value)}
                sx={{ mb: 1 }}
              />
              <List dense sx={{ maxHeight: 520, overflow: "auto", py: 0 }}>
                {filteredModules.map((moduleItem: AnyRecord) => {
                  const selected =
                    Number(selectedModule?.module_id) ===
                    Number(moduleItem.module_id);
                  const linkedCount =
                    Array.from(linkedModulesByGroup.values()).filter((moduleSet) =>
                      moduleSet.has(Number(moduleItem.module_id))
                    ).length;

                  return (
                    <ListItemButton
                      key={moduleItem.module_id}
                      selected={selected}
                      onClick={() => setSelectedModuleId(Number(moduleItem.module_id))}
                    >
                      <ListItemText
                        primary={moduleItem.module_name}
                        secondary={`${linkedCount} linked group(s)`}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
              <SectionTitle
                title="Groups Linked To Module"
                subtitle="Checkboxes add or remove group from selected module."
              />
              <TextField
                size="small"
                fullWidth
                placeholder="Search groups..."
                value={groupSearchInModuleTab}
                onChange={(event) => setGroupSearchInModuleTab(event.target.value)}
                sx={{ mb: 1 }}
              />
              <List dense sx={{ maxHeight: 520, overflow: "auto", py: 0 }}>
                {filteredGroupsInModuleTab.map((groupItem: AnyRecord) => {
                  const moduleGroupLink = getModuleGroupLink(
                    selectedModule,
                    groupItem
                  );
                  const checked = Boolean(moduleGroupLink?.module_group_id);
                  const isEntitlementTarget =
                    Number(moduleTabEntitlementGroup?.group_id) ===
                    Number(groupItem.group_id);

                  return (
                    <ListItemButton
                      key={groupItem.group_id}
                      dense
                      disabled={
                        !selectedModule ||
                        isAnyMutationPending ||
                        isConfirming
                      }
                      onClick={() => {
                        if (!selectedModule || !isEditMode) return;
                        const moduleName = selectedModule.module_name;
                        const actionLabel = checked ? "unlink" : "link";
                        requestConfirmation(
                          "Confirm Module-Group Change",
                          `Are you sure you want to ${actionLabel} "${groupItem.group_name}" ${checked ? "from" : "to"} "${moduleName}"?`,
                          () => handleToggleModuleGroup(selectedModule, groupItem)
                        );
                      }}
                    >
                      <Checkbox
                        checked={checked}
                        tabIndex={-1}
                        disableRipple
                        disabled={!isEditMode || isAnyMutationPending || isConfirming}
                      />
                      <ListItemText
                        primary={groupItem.group_name}
                        secondary={
                          checked
                            ? `Link ID: ${moduleGroupLink?.module_group_id}`
                            : "Not linked"
                        }
                      />
                      <Button
                        size="small"
                        variant={isEntitlementTarget ? "contained" : "text"}
                        disabled={!checked}
                        onClick={(event) => {
                          event.stopPropagation();
                          setModuleTabEntitlementGroupId(Number(groupItem.group_id));
                        }}
                      >
                        Configure
                      </Button>
                    </ListItemButton>
                  );
                })}
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
              <SectionTitle
                title="Module + Group Entitlements"
                subtitle="Configure paymodes, service types, and ID types for selected pair."
              />
              {renderEntitlementPanel(
                moduleTabEntitlementLink,
                selectedModule?.module_name || "N/A",
                moduleTabEntitlementGroup?.group_name || "N/A"
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
              <SectionTitle
                title="Groups"
                subtitle="Select one group to manage modules and users."
              />
              <TextField
                size="small"
                fullWidth
                placeholder="Search groups..."
                value={groupSearch}
                onChange={(event) => setGroupSearch(event.target.value)}
                sx={{ mb: 1 }}
              />
              <List dense sx={{ maxHeight: 520, overflow: "auto", py: 0 }}>
                {filteredGroups.map((groupItem: AnyRecord) => {
                  const selected =
                    Number(selectedGroup?.group_id) === Number(groupItem.group_id);
                  const linkedModuleCount =
                    linkedModulesByGroup.get(Number(groupItem.group_id))?.size || 0;
                  const linkedUserCount = resolvedGroupAssignments.filter(
                    (assignment: AnyRecord) =>
                      Number(assignment.group_id) === Number(groupItem.group_id)
                  ).length;

                  return (
                    <ListItemButton
                      key={groupItem.group_id}
                      selected={selected}
                      onClick={() => setSelectedGroupId(Number(groupItem.group_id))}
                    >
                      <ListItemText
                        primary={groupItem.group_name}
                        secondary={`${linkedModuleCount} module(s), ${linkedUserCount} user link(s)`}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
              <SectionTitle
                title="Modules Linked To Group"
                subtitle="Checkboxes add or remove selected group from modules."
              />
              <TextField
                size="small"
                fullWidth
                placeholder="Search modules..."
                value={moduleSearchInGroupTab}
                onChange={(event) => setModuleSearchInGroupTab(event.target.value)}
                sx={{ mb: 1 }}
              />
              <List dense sx={{ maxHeight: 250, overflow: "auto", py: 0 }}>
                {filteredModulesInGroupTab.map((moduleItem: AnyRecord) => {
                  const moduleGroupLink = getModuleGroupLink(
                    moduleItem,
                    selectedGroup
                  );
                  const checked = Boolean(moduleGroupLink?.module_group_id);
                  const isEntitlementTarget =
                    Number(groupTabEntitlementModule?.module_id) ===
                    Number(moduleItem.module_id);

                  return (
                    <ListItemButton
                      key={moduleItem.module_id}
                      dense
                      disabled={
                        !selectedGroup ||
                        isAnyMutationPending ||
                        isConfirming
                      }
                      onClick={() => {
                        if (!selectedGroup || !isEditMode) return;
                        const actionLabel = checked ? "unlink" : "link";
                        requestConfirmation(
                          "Confirm Group-Module Change",
                          `Are you sure you want to ${actionLabel} "${moduleItem.module_name}" ${checked ? "from" : "to"} "${selectedGroup.group_name}"?`,
                          () => handleToggleModuleGroup(moduleItem, selectedGroup)
                        );
                      }}
                    >
                      <Checkbox
                        checked={checked}
                        tabIndex={-1}
                        disableRipple
                        disabled={!isEditMode || isAnyMutationPending || isConfirming}
                      />
                      <ListItemText
                        primary={moduleItem.module_name}
                        secondary={
                          checked
                            ? `Link ID: ${moduleGroupLink?.module_group_id}`
                            : "Not linked"
                        }
                      />
                      <Button
                        size="small"
                        variant={isEntitlementTarget ? "contained" : "text"}
                        disabled={!checked}
                        onClick={(event) => {
                          event.stopPropagation();
                          setGroupTabEntitlementModuleId(Number(moduleItem.module_id));
                        }}
                      >
                        Configure
                      </Button>
                    </ListItemButton>
                  );
                })}
              </List>

              <Divider sx={{ my: 1.5 }} />

              <SectionTitle
                title="Users Linked To Group"
                subtitle="Checkboxes add or remove users from selected group."
              />
              <TextField
                size="small"
                fullWidth
                placeholder="Search users..."
                value={userSearchInGroupTab}
                onChange={(event) => setUserSearchInGroupTab(event.target.value)}
                sx={{ mb: 1 }}
              />
              <List dense sx={{ maxHeight: 250, overflow: "auto", py: 0 }}>
                {filteredUsersInGroupTab.map((userItem: AnyRecord) => {
                  const pairKey = toPairKey(
                    Number(selectedGroup?.group_id),
                    normalizeText(userItem.user_name)
                  );
                  const checked = groupUserByPair.has(pairKey);

                  return (
                    <ListItemButton
                      key={userItem.user_name}
                      dense
                      disabled={
                        !selectedGroup ||
                        isAnyMutationPending ||
                        isConfirming
                      }
                      onClick={() => {
                        if (!selectedGroup || !isEditMode) return;
                        const actionLabel = checked ? "remove" : "assign";
                        requestConfirmation(
                          "Confirm Group-User Change",
                          `Are you sure you want to ${actionLabel} "${userItem.user_name}" ${checked ? "from" : "to"} "${selectedGroup.group_name}"?`,
                          () => handleToggleUserGroup(selectedGroup, userItem)
                        );
                      }}
                    >
                      <Checkbox
                        checked={checked}
                        tabIndex={-1}
                        disableRipple
                        disabled={!isEditMode || isAnyMutationPending || isConfirming}
                      />
                      <ListItemText primary={userItem.user_name} />
                    </ListItemButton>
                  );
                })}
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
              <SectionTitle
                title="Module + Group Entitlements"
                subtitle="Configure entitlements for selected module-group pair."
              />
              {renderEntitlementPanel(
                groupTabEntitlementLink,
                groupTabEntitlementModule?.module_name || "N/A",
                selectedGroup?.group_name || "N/A"
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
              <SectionTitle
                title="Users"
                subtitle="Select one user to manage group assignments."
              />
              <TextField
                size="small"
                fullWidth
                placeholder="Search users..."
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                sx={{ mb: 1 }}
              />
              <List dense sx={{ maxHeight: 520, overflow: "auto", py: 0 }}>
                {filteredUsers.map((userItem: AnyRecord) => {
                  const selected =
                    normalizeText(selectedUser?.user_name) ===
                    normalizeText(userItem.user_name);
                  const linkedGroups =
                    linkedGroupsByUser.get(normalizeText(userItem.user_name))
                      ?.size || 0;

                  return (
                    <ListItemButton
                      key={userItem.user_name}
                      selected={selected}
                      onClick={() => setSelectedUserName(userItem.user_name)}
                    >
                      <ListItemText
                        primary={userItem.user_name}
                        secondary={`${linkedGroups} group(s)`}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
              <SectionTitle
                title="Groups Assigned To User"
                subtitle="Checkboxes add or remove selected user from groups."
              />
              <TextField
                size="small"
                fullWidth
                placeholder="Search groups..."
                value={groupSearchInUserTab}
                onChange={(event) => setGroupSearchInUserTab(event.target.value)}
                sx={{ mb: 1 }}
              />
              <List dense sx={{ maxHeight: 520, overflow: "auto", py: 0 }}>
                {filteredGroupsInUserTab.map((groupItem: AnyRecord) => {
                  const pairKey = toPairKey(
                    Number(groupItem.group_id),
                    normalizeText(selectedUser?.user_name)
                  );
                  const checked = groupUserByPair.has(pairKey);

                  return (
                    <ListItemButton
                      key={groupItem.group_id}
                      dense
                      disabled={
                        !selectedUser ||
                        isAnyMutationPending ||
                        isConfirming
                      }
                      onClick={() => {
                        if (!selectedUser || !isEditMode) return;
                        const actionLabel = checked ? "remove" : "assign";
                        requestConfirmation(
                          "Confirm User-Group Change",
                          `Are you sure you want to ${actionLabel} "${groupItem.group_name}" ${checked ? "from" : "to"} "${selectedUser.user_name}"?`,
                          () => handleToggleUserGroup(groupItem, selectedUser)
                        );
                      }}
                    >
                      <Checkbox
                        checked={checked}
                        tabIndex={-1}
                        disableRipple
                        disabled={!isEditMode || isAnyMutationPending || isConfirming}
                      />
                      <ListItemText primary={groupItem.group_name} />
                    </ListItemButton>
                  );
                })}
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
              <SectionTitle
                title="Effective Module Access"
                subtitle="Modules available to selected user through assigned groups."
              />

              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap">
                <Chip
                  label={`User: ${selectedUser?.user_name || "N/A"}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`Groups: ${selectedUserGroupIds.size}`}
                  variant="outlined"
                />
                <Chip
                  label={`Modules: ${selectedUserEffectiveModules.length}`}
                  variant="outlined"
                />
              </Stack>
              <Button
                size="small"
                variant="contained"
                sx={{ mb: 1.5 }}
                disabled={!selectedUser?.id}
                onClick={() => {
                  if (!selectedUser?.id) return;
                  router.push(`/user_management/view/${selectedUser.id}`);
                }}
              >
                View User Details
              </Button>

              <Divider sx={{ mb: 1 }} />

              {selectedUserEffectiveModules.length ? (
                <List dense sx={{ maxHeight: 520, overflow: "auto", py: 0 }}>
                  {selectedUserEffectiveModules.map((moduleName) => (
                    <ListItemButton key={moduleName} dense>
                      <ListItemText primary={moduleName} />
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  No module access yet. Assign one or more groups to this user.
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      <Dialog
        open={confirmDialog.open}
        onClose={() => {
          if (isConfirming) return;
          pendingConfirmActionRef.current = null;
          setConfirmDialog({ open: false, title: "", description: "" });
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent dividers>{confirmDialog.description}</DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              pendingConfirmActionRef.current = null;
              setConfirmDialog({ open: false, title: "", description: "" });
            }}
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmAction}
            disabled={isConfirming}
          >
            {isConfirming ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          mt: "72px",
          zIndex: (theme) => theme.zIndex.modal + 100,
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {showGlobalFetching && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Refreshing latest links...
          </Typography>
        </Box>
      )}
    </Box>
  );
}

