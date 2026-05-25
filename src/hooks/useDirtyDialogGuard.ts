import { useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * Wraps a dialog's `onOpenChange` handler so that an attempt to close the
 * dialog while the form is dirty triggers a confirmation prompt. If the user
 * cancels, the close is aborted; the dialog stays open.
 *
 * Usage:
 *   const guardedOnOpenChange = useDirtyDialogGuard(formState.isDirty, onOpenChange);
 *   <Dialog open={open} onOpenChange={guardedOnOpenChange}>...</Dialog>
 */
export function useDirtyDialogGuard(
  isDirty: boolean,
  onOpenChange: (open: boolean) => void
) {
  const { t } = useTranslation();

  return useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isDirty) {
        const confirmed = window.confirm(t("common.unsavedWarning"));
        if (!confirmed) {
          return;
        }
      }
      onOpenChange(nextOpen);
    },
    [isDirty, onOpenChange, t]
  );
}
