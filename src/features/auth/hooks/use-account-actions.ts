"use client";

import { useCallback } from "react";

import { useAuth } from "@/providers/auth-provider";
import { useDemoData } from "@/providers/demo-data-provider";

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

  const resetPassword = useCallback(
    async ({ memberId, newPassword }: ResetPasswordParams) => {
      const target = members.find((member) => member.id === memberId);
      if (!target) {
        return { success: false as const, error: "Mitglied wurde nicht gefunden." };
      }

      const trimmed = newPassword.trim();
      if (trimmed.length < 6) {
        return { success: false as const, error: "Passwort benötigt mindestens 6 Zeichen." };
      }

      const result = await resetMemberPassword({ id: memberId, newPassword: trimmed });
      if (!result.success) {
        return { success: false as const, error: result.error ?? "Passwort konnte nicht aktualisiert werden." };
      }

      return { success: true as const };
    },
    [members, resetMemberPassword]
  );

  const deleteAccount = useCallback(
    async ({ memberId, placeholderName }: DeleteAccountParams) => {
      const target = members.find((member) => member.id === memberId);
      if (!target) {
        return { success: false as const, error: "Mitglied wurde nicht gefunden." };
      }

      purgeMemberContent({ memberId, placeholderName });
      const result = await removeMember({ id: memberId });

      if (!result.success) {
        return { success: false as const, error: result.error ?? "Konto konnte nicht gelöscht werden." };
      }

      return { success: true as const };
    },
    [members, purgeMemberContent, removeMember]
  );

  return {
    resetPassword,
    deleteAccount
  };
}
