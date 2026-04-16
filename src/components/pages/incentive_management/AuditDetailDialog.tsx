"use client";

import React, { useMemo } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Button from "@/components/ui/button/Button";

type DiffRow = {
  field: string;
  oldValue: unknown;
  newValue: unknown;
};

type Props = {
  open: boolean;
  title: string;
  entityLabel: string;
  entityValue?: string | number | null;
  action?: string | null;
  userId?: string | null;
  timestamp?: string | null;
  beforeData?: Record<string, any>;
  afterData?: Record<string, any>;
  onClose: () => void;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const flattenObject = (
  value: unknown,
  basePath = "",
  output: Record<string, unknown> = {}
): Record<string, unknown> => {
  if (Array.isArray(value)) {
    if (!value.length) {
      output[basePath || "(root)"] = [];
      return output;
    }
    value.forEach((item, index) => {
      const path = basePath ? `${basePath}[${index}]` : `[${index}]`;
      flattenObject(item, path, output);
    });
    return output;
  }

  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    if (!keys.length) {
      output[basePath || "(root)"] = {};
      return output;
    }
    keys.forEach((key) => {
      const path = basePath ? `${basePath}.${key}` : key;
      flattenObject(value[key], path, output);
    });
    return output;
  }

  output[basePath || "(root)"] = value;
  return output;
};

const valuesAreEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);

const formatCellValue = (value: unknown) => {
  if (value === undefined) return "-";
  if (value === null) return "null";
  if (typeof value === "string" && value.trim() === "") return "(empty)";
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

const prettyJson = (value: unknown) => {
  if (value === undefined) return "{}";
  return JSON.stringify(value, null, 2);
};

const AuditDetailDialog = ({
  open,
  title,
  entityLabel,
  entityValue,
  action,
  userId,
  timestamp,
  beforeData = {},
  afterData = {},
  onClose,
}: Props) => {
  const diffRows = useMemo<DiffRow[]>(() => {
    const beforeFlat = flattenObject(beforeData || {});
    const afterFlat = flattenObject(afterData || {});
    const allFields = Array.from(new Set([...Object.keys(beforeFlat), ...Object.keys(afterFlat)])).sort();

    return allFields
      .filter((field) => !valuesAreEqual(beforeFlat[field], afterFlat[field]))
      .map((field) => ({
        field,
        oldValue: beforeFlat[field],
        newValue: afterFlat[field],
      }));
  }, [beforeData, afterData]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      sx={{
        zIndex: 100000,
        "& .MuiDialog-paper": {
          mt: { xs: 2, md: 3 },
          mb: { xs: 2, md: 3 },
          maxHeight: "calc(100% - 48px)",
        },
      }}
    >
      <DialogTitle className="text-lg font-stc-bold text-gray-900">{title}</DialogTitle>
      <DialogContent dividers>
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">{entityLabel}</p>
            <p className="font-stc-medium text-gray-900">{entityValue || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Action</p>
            <p className="font-stc-medium text-gray-900">{action || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">User</p>
            <p className="font-stc-medium text-gray-900">{userId || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Timestamp</p>
            <p className="font-stc-medium text-gray-900">{timestamp || "-"}</p>
          </div>
        </div>

        <div className="mb-5">
          <h4 className="mb-2 text-sm font-stc-bold uppercase tracking-wide text-gray-700">Changed Fields</h4>
          <div className="max-h-72 overflow-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Field</th>
                  <th className="px-3 py-2 text-left">Old Value</th>
                  <th className="px-3 py-2 text-left">New Value</th>
                </tr>
              </thead>
              <tbody>
                {diffRows.length === 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-3 py-3 text-gray-500" colSpan={3}>
                      No field-level differences found.
                    </td>
                  </tr>
                )}
                {diffRows.map((row) => (
                  <tr key={row.field} className="border-t border-gray-100 align-top">
                    <td className="px-3 py-2 font-stc-medium text-gray-900">{row.field}</td>
                    <td className="px-3 py-2 text-gray-700 whitespace-pre-wrap break-words">
                      {formatCellValue(row.oldValue)}
                    </td>
                    <td className="px-3 py-2 text-gray-700 whitespace-pre-wrap break-words">
                      {formatCellValue(row.newValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-red-50/40 p-3">
            <h4 className="mb-2 text-sm font-stc-bold uppercase tracking-wide text-red-700">Before</h4>
            <pre className="max-h-80 overflow-auto rounded-lg border border-red-100 bg-white p-3 text-xs text-gray-700">
              {prettyJson(beforeData)}
            </pre>
          </div>
          <div className="rounded-xl border border-gray-200 bg-emerald-50/40 p-3">
            <h4 className="mb-2 text-sm font-stc-bold uppercase tracking-wide text-emerald-700">After</h4>
            <pre className="max-h-80 overflow-auto rounded-lg border border-emerald-100 bg-white p-3 text-xs text-gray-700">
              {prettyJson(afterData)}
            </pre>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-6 py-2.5 text-sm font-stc-medium">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuditDetailDialog;
