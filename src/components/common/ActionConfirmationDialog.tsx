"use client";

import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Button from "@/components/ui/button/Button";

type ConfirmVariant = "brand" | "warning" | "danger";

type ActionConfirmationDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ConfirmVariant;
  onClose: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
};

const ActionConfirmationDialog = ({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "warning",
  onClose,
  onConfirm,
  confirmDisabled = false,
}: ActionConfirmationDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="text-lg font-stc-bold text-gray-900">{title}</DialogTitle>
      <DialogContent>
        <p className="text-sm text-gray-600">{message}</p>
      </DialogContent>
      <DialogActions>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={confirmDisabled}
          className="rounded-xl px-5 py-2 text-sm font-stc-medium"
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={confirmDisabled}
          className="rounded-xl px-5 py-2 text-sm font-stc-bold"
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActionConfirmationDialog;
