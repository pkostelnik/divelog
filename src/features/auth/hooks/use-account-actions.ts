"use client";

import { useCallback } from "react";

import { useAuth } from "@/providers/auth-provider";
import { useDemoData } from "@/providers/demo-data-provider";
import { useI18n } from "@/providers/i18n-provider";

export type ResetPasswordParams = {
  memberId: string;
  newPassword: string;
};

export type DeleteAccountParams = {
  memberId: string;
  placeholderName?: string;
};

export function useAccountActions() {
  const { resetMemberPassword, removeMember, members } = useAuth();
  const { purgeMemberContent } = useDemoData();
  const { t } = useI18n();

  const resetPassword = useCallback(
    async ({ memberId, newPassword }: ResetPasswordParams) => {
      const target = members.find((member) => member.id === memberId);
      if (!target) {
        return { success: false as const, error: t("auth.account.memberNotFound") };
      }

      const trimmed = newPassword.trim();
      if (trimmed.length < 6) {
        return { success: false as const, error: t("auth.account.password.error.short") };
      }

      const result = await resetMemberPassword({ id: memberId, newPassword: trimmed });
      if (!result.success) {
        return { success: false as const, error: result.error ?? t("auth.account.password.error.generic") };
      }

      return { success: true as const };
    },
    [members, resetMemberPassword, t]
  );

  const deleteAccount = useCallback(
    async ({ memberId, placeholderName }: DeleteAccountParams) => {
      const target = members.find((member) => member.id === memberId);
      if (!target) {
        return { success: false as const, error: t("auth.account.memberNotFound") };
      }

      purgeMemberContent({ memberId, placeholderName });
      const result = await removeMember({ id: memberId });

      if (!result.success) {
        return { success: false as const, error: result.error ?? t("auth.account.delete.error") };
      }

      return { success: true as const };
    },
    [members, purgeMemberContent, removeMember, t]
  );

  return {
    resetPassword,
    deleteAccount
  };
}
