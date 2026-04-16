"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@mui/material";
import ActionConfirmationDialog from "@/components/common/ActionConfirmationDialog";
import Button from "@/components/ui/button/Button";
import type {
  IncentiveBoosterProps,
  IncentiveSchemeDetail,
  IncentiveSchemePayload,
  IncentiveSlab,
  IncentiveSubscriber,
} from "@/types/incentive";

type Mode = "create" | "edit" | "view";

type Props = {
  mode: Mode;
  initialData?: IncentiveSchemeDetail | null;
  isSubmitting?: boolean;
  onSubmit: (payload: IncentiveSchemePayload) => Promise<void> | void;
  onCancel: () => void;
  onInsertAllUsers?: (payload: {
    scheme_code?: string;
    scheme_type?: string;
    ind_target?: number | string | null;
    ind_payout?: number | string | null;
  }) => Promise<IncentiveSubscriber[]>;
  onCloneFromCurrent?: () => void;
};

type FormState = {
  scheme_code: string;
  scheme_name: string;
  scheme_type: string;
  scheme_method: string;
  service_type: string;
  slab_method: string;
  booster: "Y" | "N";
  start_date: string;
  end_date: string;
  status: string;
  booster_properties: IncentiveBoosterProps;
  slabs: IncentiveSlab[];
  subscribers: IncentiveSubscriber[];
};

type ConfirmDialogState = {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmVariant: "brand" | "warning" | "danger";
};

const slabMethodOptions = [
  "Based On Plan",
  "Based on Sales Volume",
  "Based on Nationality",
  "Based on Contract Ratio",
  "Based on MRC Revenue",
  "Based on Plan MRC",
];

const schemeMethodOptions = ["SLAB", "BOOSTER", "INDTARGET", "PERCENT"];
const serviceTypeOptions = ["All", "Prepaid", "Postpaid"];

const boosterFields: Array<{ key: keyof IncentiveBoosterProps; label: string }> = [
  { key: "mnp", label: "MNP" },
  { key: "mid_end_plan", label: "Mid End Plan" },
  { key: "high_end_plan", label: "High End Plan" },
  { key: "fiber", label: "Fiber" },
  { key: "postpaid_upgrade", label: "Postpaid Upgrade" },
  { key: "prepaid", label: "Prepaid" },
  { key: "device_sale", label: "Device Sale" },
  { key: "home_5g", label: "5G Home" },
  { key: "mbb_booster", label: "MBB Booster" },
  { key: "voice_booster", label: "Voice Booster" },
];

const emptySlab = (): IncentiveSlab => ({
  slab_start: "",
  slab_end: "",
  payout: "",
  minperline: "",
  payoutadd: "",
});

const emptySubscriber = (): IncentiveSubscriber => ({
  user_name: "",
  ind_target: "",
  ind_payout: "",
});

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const normalized = value.replace(" ", "T");
  return normalized.length >= 16 ? normalized.slice(0, 16) : normalized;
};

const toApiDateTime = (value?: string | null) => {
  if (!value) return "";
  return `${value.replace("T", " ")}:00`;
};

const normalizeServiceTypeOption = (value?: string | null) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "all") return "All";
  if (normalized === "prepaid") return "Prepaid";
  if (normalized === "postpaid") return "Postpaid";
  return "";
};

const buildDefaultForm = (): FormState => ({
  scheme_code: "",
  scheme_name: "",
  scheme_type: "Dealer",
  scheme_method: "SLAB",
  service_type: "",
  slab_method: slabMethodOptions[0],
  booster: "N",
  start_date: "",
  end_date: "",
  status: "Inactive",
  booster_properties: {},
  slabs: [emptySlab()],
  subscribers: [emptySubscriber()],
});

const normalizeNumberInput = (value: any) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const hasUpTo3Decimals = (value: string) => /^-?\d+(\.\d{1,3})?$/.test(value);

const hasNoOverlappingSlabs = (slabs: IncentiveSlab[]) => {
  const ranges = slabs
    .map((slab, index) => ({
      index,
      start: Number(slab.slab_start),
      end: Number(slab.slab_end),
    }))
    .filter((row) => !Number.isNaN(row.start) && !Number.isNaN(row.end))
    .sort((a, b) => a.start - b.start);

  for (let i = 1; i < ranges.length; i += 1) {
    if (ranges[i].start <= ranges[i - 1].end) return false;
  }
  return true;
};

const IncentiveSchemeForm = ({
  mode,
  initialData,
  isSubmitting,
  onSubmit,
  onCancel,
  onInsertAllUsers,
  onCloneFromCurrent,
}: Props) => {
  const [form, setForm] = useState<FormState>(buildDefaultForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const [isInsertingAllUsers, setIsInsertingAllUsers] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    confirmVariant: "warning",
  });
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [subscriberVisibleCount, setSubscriberVisibleCount] = useState(20);
  const [subscriberLoadStep, setSubscriberLoadStep] = useState(20);
  const subscriberScrollRef = useRef<HTMLDivElement | null>(null);
  const initialSlabSnapshotRef = useRef<string>("[]");
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);

  const slabSnapshot = (slabs: IncentiveSlab[]) =>
    JSON.stringify(
      slabs.map((slab) => ({
        slab_start: normalizeNumberInput(slab.slab_start).trim(),
        slab_end: normalizeNumberInput(slab.slab_end).trim(),
        payout: normalizeNumberInput(slab.payout).trim(),
        minperline: normalizeNumberInput(slab.minperline).trim(),
        payoutadd: normalizeNumberInput(slab.payoutadd).trim(),
      }))
    );

  const requestConfirmation = ({
    title,
    message,
    confirmText = "Confirm",
    confirmVariant = "warning",
  }: {
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: "brand" | "warning" | "danger";
  }) =>
    new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmDialog({
        open: true,
        title,
        message,
        confirmText,
        confirmVariant,
      });
    });

  const resolveConfirmation = (value: boolean) => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(value);
      confirmResolverRef.current = null;
    }
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    return () => {
      if (confirmResolverRef.current) {
        confirmResolverRef.current(false);
        confirmResolverRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!initialData) {
      initialSlabSnapshotRef.current = slabSnapshot([emptySlab()]);
      return;
    }

    const mapped: FormState = {
      scheme_code: initialData.scheme?.scheme_code || "",
      scheme_name: initialData.scheme?.scheme_name || "",
      scheme_type: initialData.scheme?.scheme_type || "Dealer",
      scheme_method: String(initialData.scheme?.scheme_method || "SLAB").toUpperCase(),
      service_type: normalizeServiceTypeOption(initialData.scheme?.service_type),
      slab_method:
        initialData.scheme?.slab_method ||
        initialData.scheme?.subservice_type ||
        slabMethodOptions[0],
      booster:
        String(initialData.scheme?.booster || "N").toUpperCase() === "Y"
          ? "Y"
          : "N",
      start_date: toDateTimeLocal(initialData.scheme?.start_date),
      end_date: toDateTimeLocal(initialData.scheme?.end_date),
      status: initialData.scheme?.status || "Inactive",
      booster_properties: initialData.booster_properties || {},
      slabs:
        initialData.slabs && initialData.slabs.length > 0
          ? initialData.slabs.map((slab) => ({
              ...slab,
              slab_start: normalizeNumberInput(slab.slab_start),
              slab_end: normalizeNumberInput(slab.slab_end),
              payout: normalizeNumberInput(slab.payout),
              minperline: normalizeNumberInput(slab.minperline),
              payoutadd: normalizeNumberInput(slab.payoutadd),
            }))
          : [emptySlab()],
      subscribers:
        initialData.subscribers && initialData.subscribers.length > 0
          ? initialData.subscribers.map((sub) => ({
              ...sub,
              ind_target: normalizeNumberInput(sub.ind_target),
              ind_payout: normalizeNumberInput(sub.ind_payout),
            }))
          : [emptySubscriber()],
    };

    setForm(mapped);
    initialSlabSnapshotRef.current = slabSnapshot(mapped.slabs || []);
  }, [initialData]);

  const isViewMode = mode === "view";
  const isDateOnlyEdit = mode === "edit" && Boolean(initialData?.edit_limited_to_dates);
  const isActiveScheme = mode === "edit" && String(initialData?.scheme?.status || "").toLowerCase() === "active";
  const isBasicDetailsLockedForActive = isActiveScheme && !isDateOnlyEdit;
  const isSlabMode = String(form.scheme_method).toUpperCase() === "SLAB";
  const isIndTargetMode = String(form.scheme_method).toUpperCase() === "INDTARGET";

  const lockField = (name: string) => {
    if (isViewMode) return true;
    if (isBasicDetailsLockedForActive) {
      return [
        "scheme_name",
        "scheme_type",
        "scheme_method",
        "service_type",
        "slab_method",
        "booster",
        "start_date",
        "end_date",
        "status",
      ].includes(name);
    }
    if (!isDateOnlyEdit) return false;
    return !["start_date", "end_date"].includes(name);
  };

  const lockSection = isViewMode || isDateOnlyEdit;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const normalizeSubscribersForPayload = (subscribers: IncentiveSubscriber[]) =>
    subscribers
      .map((sub) => {
        const userName = (sub.user_name || "").trim();
        const targetValue =
          sub.ind_target !== null && sub.ind_target !== undefined && String(sub.ind_target).trim() !== ""
            ? sub.ind_target
            : null;
        const payoutValue =
          sub.ind_payout !== null && sub.ind_payout !== undefined && String(sub.ind_payout).trim() !== ""
            ? sub.ind_payout
            : null;

        return {
          ...sub,
          user_name: userName,
          ind_target: targetValue,
          ind_payout: payoutValue,
        };
      })
      .filter(
        (sub) =>
          Boolean(sub.user_name) ||
          sub.ind_target !== null ||
          sub.ind_payout !== null
      );

  const filteredSubscriberIndexes = useMemo(() => {
    const keyword = subscriberSearch.trim().toLowerCase();
    if (!keyword) {
      return form.subscribers.map((_, index) => index);
    }

    return form.subscribers
      .map((sub, index) => ({ sub, index }))
      .filter(({ sub }) => {
        const userName = String(sub.user_name || "").toLowerCase();
        const target = String(sub.ind_target ?? "").toLowerCase();
        const payout = String(sub.ind_payout ?? "").toLowerCase();
        return userName.includes(keyword) || target.includes(keyword) || payout.includes(keyword);
      })
      .map(({ index }) => index);
  }, [form.subscribers, subscriberSearch]);

  const subscriberTotalCount = filteredSubscriberIndexes.length;
  const visibleSubscriberIndexes = filteredSubscriberIndexes.slice(0, subscriberVisibleCount);
  const hasMoreSubscribers = visibleSubscriberIndexes.length < subscriberTotalCount;

  useEffect(() => {
    setSubscriberVisibleCount((prev) => {
      const base = Math.max(15, subscriberLoadStep);
      if (subscriberTotalCount === 0) return base;
      return Math.min(Math.max(prev, base), subscriberTotalCount);
    });
  }, [subscriberTotalCount, subscriberLoadStep]);

  const handleSubscriberScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const threshold = 28;
    const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - threshold;
    if (!reachedBottom || !hasMoreSubscribers) return;

    setSubscriberVisibleCount((prev) => Math.min(prev + subscriberLoadStep, subscriberTotalCount));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (mode !== "create" && !form.scheme_code.trim()) nextErrors.scheme_code = "Scheme code is required.";
    if (form.scheme_code.trim() && form.scheme_code.trim().length > 15) {
      nextErrors.scheme_code = "Scheme code must be 15 characters or less.";
    }
    if (!form.scheme_name.trim()) nextErrors.scheme_name = "Scheme name is required.";
    if (!form.scheme_type.trim()) nextErrors.scheme_type = "Scheme type is required.";
    if (!form.scheme_method.trim()) nextErrors.scheme_method = "Scheme method is required.";
    if (!form.service_type.trim()) nextErrors.service_type = "Service type is required.";
    if (!form.start_date) nextErrors.start_date = "Start date is required.";
    if (form.start_date && form.end_date) {
      const start = new Date(form.start_date).getTime();
      const end = new Date(form.end_date).getTime();
      if (Number.isFinite(start) && Number.isFinite(end) && end < start) {
        nextErrors.end_date = "End date must be greater than or equal to start date.";
      }
    }

    if (form.booster === "Y") {
      boosterFields.forEach(({ key, label }) => {
        const value = form.booster_properties?.[key];
        if (value === null || value === undefined || value === "") return;
        const stringValue = String(value);
        if (Number.isNaN(Number(stringValue)) || !hasUpTo3Decimals(stringValue)) {
          nextErrors[`booster_${String(key)}`] = `${label} must be numeric with up to 3 decimals.`;
        }
      });
    }

    if (isSlabMode) {
      if (!form.slabs.length) {
        nextErrors.slabs = "At least one slab is required.";
      }
      form.slabs.forEach((slab, idx) => {
        const prefix = `slab_${idx}`;
        if (slab.slab_start === "" || slab.slab_start === null) {
          nextErrors[`${prefix}_start`] = "Start is required.";
        } else if (Number.isNaN(Number(slab.slab_start))) {
          nextErrors[`${prefix}_start`] = "Start must be numeric.";
        }
        if (slab.slab_end === "" || slab.slab_end === null) {
          nextErrors[`${prefix}_end`] = "End is required.";
        } else if (Number.isNaN(Number(slab.slab_end))) {
          nextErrors[`${prefix}_end`] = "End must be numeric.";
        }
        if (
          slab.slab_start !== "" &&
          slab.slab_end !== "" &&
          !Number.isNaN(Number(slab.slab_start)) &&
          !Number.isNaN(Number(slab.slab_end)) &&
          Number(slab.slab_end) < Number(slab.slab_start)
        ) {
          nextErrors[`${prefix}_end`] = "End must be greater than or equal to start.";
        }
        if (slab.payout !== "" && slab.payout !== null && Number.isNaN(Number(slab.payout))) {
          nextErrors[`${prefix}_payout`] = "Payout must be numeric.";
        }
        if (
          slab.minperline !== "" &&
          slab.minperline !== null &&
          Number.isNaN(Number(slab.minperline))
        ) {
          nextErrors[`${prefix}_minperline`] = "Min per line must be numeric.";
        }
        if (
          slab.payoutadd !== "" &&
          slab.payoutadd !== null &&
          Number.isNaN(Number(slab.payoutadd))
        ) {
          nextErrors[`${prefix}_payoutadd`] = "Additional payout must be numeric.";
        }
      });

      if (form.slabs.length > 1 && !hasNoOverlappingSlabs(form.slabs)) {
        nextErrors.slabs = "Slab ranges cannot overlap.";
      }
    }

    if (isIndTargetMode) {
      form.subscribers.forEach((sub, idx) => {
        const hasAnyValue =
          Boolean(sub.user_name?.trim()) ||
          (sub.ind_target !== "" && sub.ind_target !== null && sub.ind_target !== undefined) ||
          (sub.ind_payout !== "" && sub.ind_payout !== null && sub.ind_payout !== undefined);

        if (!hasAnyValue) {
          return;
        }

        if (!sub.user_name?.trim()) nextErrors[`subscriber_${idx}_user_name`] = "User name is required.";
        if (sub.ind_target === "" || sub.ind_target === null || Number.isNaN(Number(sub.ind_target))) {
          nextErrors[`subscriber_${idx}_target`] = "Target is mandatory for INDTARGET.";
        }
        if (sub.ind_payout === "" || sub.ind_payout === null || Number.isNaN(Number(sub.ind_payout))) {
          nextErrors[`subscriber_${idx}_payout`] = "Payout is mandatory for INDTARGET.";
        }
      });
    }

    const seenSubscribers = new Map<string, number>();
    form.subscribers.forEach((sub, idx) => {
      const userName = String(sub.user_name || "").trim();
      if (!userName) return;
      const key = userName.toLowerCase();
      if (seenSubscribers.has(key)) {
        nextErrors[`subscriber_${idx}_user_name`] = "Duplicate user name is not allowed.";
      } else {
        seenSubscribers.set(key, idx);
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = (): IncentiveSchemePayload => {
    if (isDateOnlyEdit) {
      return {
        scheme_code: form.scheme_code.trim(),
        start_date: toApiDateTime(form.start_date),
        end_date: toApiDateTime(form.end_date),
      };
    }

    return {
      scheme_code: form.scheme_code.trim(),
      scheme_name: form.scheme_name.trim(),
      scheme_type: form.scheme_type,
      scheme_method: form.scheme_method,
      service_type: form.service_type,
      slab_method: isSlabMode ? form.slab_method : "",
      start_date: toApiDateTime(form.start_date),
      end_date: toApiDateTime(form.end_date),
      status: form.status || "Inactive",
      booster: form.booster,
      booster_properties: form.booster === "Y" ? form.booster_properties : {},
      slabs: isSlabMode
        ? form.slabs.map((slab) => ({
            slab_start: slab.slab_start,
            slab_end: slab.slab_end,
            payout: slab.payout,
            minperline: slab.minperline,
            payoutadd: slab.payoutadd,
          }))
        : [],
      subscribers: normalizeSubscribersForPayload(form.subscribers),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineMessage(null);
    if (!validateForm()) return;

    const isActivating =
      form.status === "Active" &&
      String(initialData?.scheme?.status || "").toLowerCase() !== "active";

    if (isActivating) {
      const proceed = await requestConfirmation({
        title: "Activate Scheme",
        message: "Are you sure you want to activate this scheme?",
        confirmText: "Activate",
        confirmVariant: "warning",
      });
      if (!proceed) return;
    }

    if (mode === "edit" && !isDateOnlyEdit && isSlabMode) {
      const currentSlabSnapshot = slabSnapshot(form.slabs || []);
      if (currentSlabSnapshot !== initialSlabSnapshotRef.current) {
        const proceed = await requestConfirmation({
          title: "Update Slab Settings",
          message: "Are you sure you want to update slab settings?",
          confirmText: "Update",
          confirmVariant: "warning",
        });
        if (!proceed) return;
      }
    }

    await onSubmit(buildPayload());
  };

  const handleInsertAllUsers = async () => {
    if (!onInsertAllUsers || isInsertingAllUsers) return;
    if (!form.scheme_type) {
      setInlineMessage("Select Scheme Type before inserting users.");
      return;
    }

    try {
      setIsInsertingAllUsers(true);
      setInlineMessage("Loading users...");
      const subscribers = await onInsertAllUsers({
        scheme_code: form.scheme_code || undefined,
        scheme_type: form.scheme_type || undefined,
      });

      if (!subscribers.length) {
        setInlineMessage("No active users found for the selected scheme type.");
        return;
      }

      const mergedSubscribers = [...form.subscribers];
      const existingKeys = new Set(
        form.subscribers
          .map((s) => String(s.user_name || "").trim().toLowerCase())
          .filter(Boolean)
      );
      subscribers.forEach((sub) => {
        const key = String(sub.user_name || "").trim().toLowerCase();
        if (key && !existingKeys.has(key)) {
          existingKeys.add(key);
          mergedSubscribers.push(sub);
        }
      });

      setForm((prev) => ({
        ...prev,
        subscribers: mergedSubscribers,
      }));
      setInlineMessage(`${subscribers.length} users loaded successfully.`);
    } catch (err: any) {
      setInlineMessage(err?.message || "Failed to insert users.");
    } finally {
      setIsInsertingAllUsers(false);
    }
  };

  const pageTitle = useMemo(() => {
    if (mode === "view") return "View Incentive Scheme";
    if (mode === "edit") return "Edit Incentive Scheme";
    return "Create Incentive Scheme";
  }, [mode]);

  const submitVariant = mode === "edit" ? "warning" : "brand";
  const submitLabel = isSubmitting
    ? mode === "edit"
      ? "Updating..."
      : "Creating..."
    : mode === "edit"
      ? "Update Scheme"
      : "Create Scheme";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-md">
      <div className="border-b border-gray-200 bg-gradient-to-r from-brand-50 to-white px-6 py-5">
        <h3 className="text-theme-xl font-stc-bold text-gray-900">{pageTitle}</h3>
        <p className="mt-1 text-sm text-gray-600">
          Configure scheme basics, booster rules, slab settings, and subscriber assignments.
        </p>
      </div>

      <div className="px-6 py-6">

      {isDateOnlyEdit && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              Active scheme: only Start Date and End Date can be updated here. For slab or subscriber changes, clone this scheme.
            </span>
            {onCloneFromCurrent && (
              <Button
                type="button"
                variant="outline"
                onClick={onCloneFromCurrent}
                className="rounded-xl border-brand-300 text-brand-700 hover:border-brand-400 hover:bg-brand-50 px-3 py-1.5 text-xs font-stc-medium"
              >
                Clone & Edit Full Config
              </Button>
            )}
          </div>
        </Alert>
      )}

      {isBasicDetailsLockedForActive && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Active scheme: Basic Details are locked. You can still update Booster values, Slabs, and Subscribers.
        </Alert>
      )}

      {inlineMessage && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {inlineMessage}
        </Alert>
      )}

      <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
        <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
          <h4 className="mb-3 text-sm font-stc-bold uppercase tracking-wide text-gray-700">Basic Details</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-stc-medium">Scheme Code</label>
            <input
              value={form.scheme_code}
              onChange={(e) => setField("scheme_code", e.target.value)}
              disabled
              placeholder="Auto generated (INC-YYYY-DD-MM)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {errors.scheme_code && <p className="mt-1 text-xs text-red-600">{errors.scheme_code}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-stc-medium">Scheme Name</label>
            <input
              value={form.scheme_name}
              onChange={(e) => setField("scheme_name", e.target.value)}
              disabled={lockField("scheme_name")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {errors.scheme_name && <p className="mt-1 text-xs text-red-600">{errors.scheme_name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-stc-medium">Scheme Type</label>
            <select
              value={form.scheme_type}
              onChange={(e) => setField("scheme_type", e.target.value)}
              disabled={lockField("scheme_type")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              <option value="Dealer">Dealer</option>
              <option value="Agent">Agent</option>
            </select>
            {errors.scheme_type && <p className="mt-1 text-xs text-red-600">{errors.scheme_type}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-stc-medium">Scheme Method</label>
            <select
              value={form.scheme_method}
              onChange={(e) => setField("scheme_method", e.target.value)}
              disabled={lockField("scheme_method")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              {schemeMethodOptions.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            {errors.scheme_method && <p className="mt-1 text-xs text-red-600">{errors.scheme_method}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-stc-medium">Service Type</label>
            <select
              value={form.service_type}
              onChange={(e) => setField("service_type", e.target.value)}
              disabled={lockField("service_type")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              {serviceTypeOptions.map((serviceType) => (
                <option key={serviceType} value={serviceType}>
                  {serviceType}
                </option>
              ))}
            </select>
            {errors.service_type && <p className="mt-1 text-xs text-red-600">{errors.service_type}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-stc-medium">Booster</label>
            <select
              value={form.booster}
              onChange={(e) => setField("booster", e.target.value as "Y" | "N")}
              disabled={lockField("booster")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="N">N</option>
              <option value="Y">Y</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-stc-medium">Start Date</label>
            <input
              type="datetime-local"
              value={form.start_date}
              onChange={(e) => setField("start_date", e.target.value)}
              disabled={lockField("start_date")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {errors.start_date && <p className="mt-1 text-xs text-red-600">{errors.start_date}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-stc-medium">End Date</label>
            <input
              type="datetime-local"
              value={form.end_date}
              onChange={(e) => setField("end_date", e.target.value)}
              disabled={lockField("end_date")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {errors.end_date && <p className="mt-1 text-xs text-red-600">{errors.end_date}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-stc-medium">Status</label>
            <select
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
              disabled={lockField("status")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="Inactive">Inactive</option>
              <option value="Active">Active</option>
            </select>
          </div>

          {isSlabMode && (
            <div>
              <label className="mb-1 block text-sm font-stc-medium">Scheme Slab Method</label>
              <select
                value={form.slab_method}
                onChange={(e) => setField("slab_method", e.target.value)}
                disabled={lockField("slab_method")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {slabMethodOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        </div>

        {form.booster === "Y" && (
          <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
            <h4 className="mb-3 text-sm font-stc-bold uppercase tracking-wide text-gray-700">Booster Properties</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {boosterFields.map(({ key, label }) => (
                <div key={String(key)}>
                  <label className="mb-1 block text-sm font-stc-medium">{label}</label>
                  <input
                    value={normalizeNumberInput(form.booster_properties?.[key])}
                    onChange={(e) =>
                      setField("booster_properties", {
                        ...form.booster_properties,
                        [key]: e.target.value,
                      })
                    }
                    disabled={lockSection}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  {errors[`booster_${String(key)}`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`booster_${String(key)}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isSlabMode && (
          <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-stc-bold uppercase tracking-wide text-gray-700">Slab Settings</h4>
              {!lockSection && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setField("slabs", [...form.slabs, emptySlab()])}
                  className="rounded-xl border-brand-300 text-brand-600 hover:border-brand-400 hover:bg-brand-50 px-4 py-2 font-stc-medium"
                >
                  Add Slab
                </Button>
              )}
            </div>
            {errors.slabs && <p className="mb-2 text-xs text-red-600">{errors.slabs}</p>}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Start</th>
                    <th className="px-3 py-2 text-left">End</th>
                    <th className="px-3 py-2 text-left">Payout</th>
                    <th className="px-3 py-2 text-left">Min Per Line</th>
                    <th className="px-3 py-2 text-left">Additional Payout</th>
                    {!lockSection && <th className="px-3 py-2 text-left">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {form.slabs.map((slab, idx) => (
                    <tr key={`slab-${idx}`} className="border-t border-gray-100">
                      <td className="px-3 py-2">
                        <input
                          value={normalizeNumberInput(slab.slab_start)}
                          onChange={(e) => {
                            const next = [...form.slabs];
                            next[idx] = { ...next[idx], slab_start: e.target.value };
                            setField("slabs", next);
                          }}
                          disabled={lockSection}
                          className="w-full rounded border border-gray-300 px-2 py-1"
                        />
                        {errors[`slab_${idx}_start`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`slab_${idx}_start`]}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={normalizeNumberInput(slab.slab_end)}
                          onChange={(e) => {
                            const next = [...form.slabs];
                            next[idx] = { ...next[idx], slab_end: e.target.value };
                            setField("slabs", next);
                          }}
                          disabled={lockSection}
                          className="w-full rounded border border-gray-300 px-2 py-1"
                        />
                        {errors[`slab_${idx}_end`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`slab_${idx}_end`]}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={normalizeNumberInput(slab.payout)}
                          onChange={(e) => {
                            const next = [...form.slabs];
                            next[idx] = { ...next[idx], payout: e.target.value };
                            setField("slabs", next);
                          }}
                          disabled={lockSection}
                          className="w-full rounded border border-gray-300 px-2 py-1"
                        />
                        {errors[`slab_${idx}_payout`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`slab_${idx}_payout`]}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={normalizeNumberInput(slab.minperline)}
                          onChange={(e) => {
                            const next = [...form.slabs];
                            next[idx] = { ...next[idx], minperline: e.target.value };
                            setField("slabs", next);
                          }}
                          disabled={lockSection}
                          className="w-full rounded border border-gray-300 px-2 py-1"
                        />
                        {errors[`slab_${idx}_minperline`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`slab_${idx}_minperline`]}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={normalizeNumberInput(slab.payoutadd)}
                          onChange={(e) => {
                            const next = [...form.slabs];
                            next[idx] = { ...next[idx], payoutadd: e.target.value };
                            setField("slabs", next);
                          }}
                          disabled={lockSection}
                          className="w-full rounded border border-gray-300 px-2 py-1"
                        />
                        {errors[`slab_${idx}_payoutadd`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`slab_${idx}_payoutadd`]}</p>
                        )}
                      </td>
                      {!lockSection && (
                        <td className="px-3 py-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 px-3 py-1.5 text-xs font-stc-medium"
                            onClick={() => {
                              void requestConfirmation({
                                title: "Delete Slab",
                                message: "Are you sure you want to delete this slab?",
                                confirmText: "Delete",
                                confirmVariant: "danger",
                              }).then((proceed) => {
                                if (!proceed) return;
                                const next = form.slabs.filter((_, i) => i !== idx);
                                setField("slabs", next.length ? next : [emptySlab()]);
                              });
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isSlabMode && (
          <Alert severity="info" sx={{ mt: 1 }}>
            Slab settings are available only when Scheme Method is set to SLAB.
          </Alert>
        )}

        <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-stc-bold uppercase tracking-wide text-gray-700">Subscribers</h4>
            <div className="flex gap-2">
              {!lockSection && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleInsertAllUsers}
                  disabled={isInsertingAllUsers}
                  className="rounded-xl border-emerald-300 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 px-4 py-2 font-stc-medium"
                >
                  {isInsertingAllUsers ? "Loading Users..." : "Insert All User"}
                </Button>
              )}
              {!lockSection && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-brand-300 text-brand-600 hover:border-brand-400 hover:bg-brand-50 px-4 py-2 font-stc-medium"
                  onClick={() => setField("subscribers", [...form.subscribers, emptySubscriber()])}
                >
                  Add Subscriber
                </Button>
              )}
            </div>
          </div>

          <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={subscriberSearch}
                onChange={(e) => {
                  setSubscriberSearch(e.target.value);
                  setSubscriberVisibleCount(Math.max(15, subscriberLoadStep));
                  subscriberScrollRef.current?.scrollTo({ top: 0 });
                }}
                placeholder="Search users..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:w-64"
              />
              {subscriberSearch && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl px-4 py-2 font-stc-medium"
                  onClick={() => {
                    setSubscriberSearch("");
                    setSubscriberVisibleCount(Math.max(15, subscriberLoadStep));
                    subscriberScrollRef.current?.scrollTo({ top: 0 });
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Rows</span>
              <select
                value={subscriberLoadStep}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setSubscriberLoadStep(next);
                  setSubscriberVisibleCount(next);
                  subscriberScrollRef.current?.scrollTo({ top: 0 });
                }}
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
              >
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
              <span>
                {subscriberTotalCount === 0
                  ? "No users found"
                  : `Showing ${visibleSubscriberIndexes.length} of ${subscriberTotalCount}`}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div
              ref={subscriberScrollRef}
              onScroll={handleSubscriberScroll}
              className="max-h-[420px] overflow-auto"
            >
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">User Name</th>
                  {isIndTargetMode && <th className="px-3 py-2 text-left">Target</th>}
                  {isIndTargetMode && <th className="px-3 py-2 text-left">Payout</th>}
                  {!lockSection && <th className="px-3 py-2 text-left">Action</th>}
                </tr>
                </thead>
                <tbody>
                  {visibleSubscriberIndexes.length === 0 && (
                    <tr className="border-t border-gray-100">
                      <td
                        className="px-3 py-4 text-center text-sm text-gray-500"
                        colSpan={isIndTargetMode ? (lockSection ? 3 : 4) : lockSection ? 1 : 2}
                      >
                        No users available for the current filter.
                      </td>
                    </tr>
                  )}

                  {visibleSubscriberIndexes.map((idx) => {
                    const sub = form.subscribers[idx];
                    return (
                      <tr key={`sub-${idx}`} className="border-t border-gray-100">
                    <td className="px-3 py-2">
                      <input
                        value={sub.user_name || ""}
                        onChange={(e) => {
                          const next = [...form.subscribers];
                          next[idx] = { ...next[idx], user_name: e.target.value };
                          setField("subscribers", next);
                        }}
                        disabled={lockSection}
                        className="w-full rounded border border-gray-300 px-2 py-1"
                      />
                      {errors[`subscriber_${idx}_user_name`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`subscriber_${idx}_user_name`]}</p>
                      )}
                    </td>
                    {isIndTargetMode && (
                      <td className="px-3 py-2">
                        <input
                          value={normalizeNumberInput(sub.ind_target)}
                          onChange={(e) => {
                            const next = [...form.subscribers];
                            next[idx] = { ...next[idx], ind_target: e.target.value };
                            setField("subscribers", next);
                          }}
                          disabled={lockSection}
                          className="w-full rounded border border-gray-300 px-2 py-1"
                        />
                        {errors[`subscriber_${idx}_target`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`subscriber_${idx}_target`]}</p>
                        )}
                      </td>
                    )}
                    {isIndTargetMode && (
                      <td className="px-3 py-2">
                        <input
                          value={normalizeNumberInput(sub.ind_payout)}
                          onChange={(e) => {
                            const next = [...form.subscribers];
                            next[idx] = { ...next[idx], ind_payout: e.target.value };
                            setField("subscribers", next);
                          }}
                          disabled={lockSection}
                          className="w-full rounded border border-gray-300 px-2 py-1"
                        />
                        {errors[`subscriber_${idx}_payout`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`subscriber_${idx}_payout`]}</p>
                        )}
                      </td>
                    )}
                    {!lockSection && (
                      <td className="px-3 py-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 px-3 py-1.5 text-xs font-stc-medium"
                          onClick={() => {
                            void requestConfirmation({
                              title: "Delete Subscriber",
                              message: "Are you sure you want to delete this subscriber?",
                              confirmText: "Delete",
                              confirmVariant: "danger",
                            }).then((proceed) => {
                              if (!proceed) return;
                              const next = form.subscribers.filter((_, i) => i !== idx);
                              setField("subscribers", next.length ? next : [emptySubscriber()]);
                            });
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 text-right text-xs text-gray-500">
            {hasMoreSubscribers ? "Scroll down to load more users..." : "All matching users are loaded."}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl px-6 py-2.5 text-sm font-stc-medium"
          >
            Cancel
          </Button>
          {!isViewMode && (
            <Button
              type="submit"
              variant={submitVariant}
              disabled={Boolean(isSubmitting)}
              className="min-w-[170px] rounded-xl px-7 py-2.5 text-sm font-stc-bold tracking-wide disabled:opacity-60"
            >
              {submitLabel}
            </Button>
          )}
        </div>
      </form>
      </div>
      <ActionConfirmationDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        confirmVariant={confirmDialog.confirmVariant}
        onClose={() => resolveConfirmation(false)}
        onConfirm={() => resolveConfirmation(true)}
      />
    </div>
  );
};

export default IncentiveSchemeForm;
