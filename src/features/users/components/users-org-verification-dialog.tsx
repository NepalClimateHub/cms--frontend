import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/query/apiClient";
import OrganizationVerificationViewDialog from "@/ui/organisms/dashboard/organization-verification-view-dialog";
import { Button } from "@/ui/shadcn/button";
import { DialogFooter } from "@/ui/shadcn/dialog";
import { Label } from "@/ui/shadcn/label";
import { Textarea } from "@/ui/shadcn/textarea";
import { getRoleFromToken } from "@/utils/jwt.util";
import { isVerificationAdmin } from "@/utils/role-check.util";
import type { User } from "../data/schema";

type Props = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function toOrgProfile(user: User) {
  const org = user.organization;
  if (!org) return null;
  return {
    id: org.id,
    name: org.name,
    logoImageUrl: org.logoImageUrl ?? "",
    logoImageId: org.logoImageId ?? null,
    verificationDocumentUrl: org.verificationDocumentUrl ?? null,
    verificationDocumentId: org.verificationDocumentId ?? null,
    verificationDocuments: org.verificationDocuments ?? null,
    verificationRequestRemarks: org.verificationRequestRemarks ?? null,
    verificationRequestedAt: org.verificationRequestedAt ?? null,
    verificationAdminMessage: org.verificationAdminMessage ?? null,
    verificationMessageSentAt: org.verificationMessageSentAt ?? null,
    verificationMessages: org.verificationMessages ?? [],
  };
}

export function UsersOrgVerificationDialog({
  user,
  open,
  onOpenChange,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<
    "verify" | "feedback" | null
  >(null);
  const [feedback, setFeedback] = useState("");
  const role = getRoleFromToken();
  const canVerify = isVerificationAdmin(role);
  const orgProfile = user ? toOrgProfile(user) : null;
  const orgId = orgProfile?.id;
  const showVerify = Boolean(
    canVerify && orgProfile && user && !user.isVerifiedByAdmin,
  );

  const handleVerify = async () => {
    if (!orgId) return;
    setPendingAction("verify");
    try {
      await apiClient.patch(`/api/v1/organizations/${orgId}/verify`, {
        isVerified: true,
      });
      toast({
        title: "Organization verified",
        description: "The organization is now marked as verified.",
      });
      await queryClient.invalidateQueries({
        predicate: (q) => q.queryKey[0] === "userControllerGetUsers",
      });
      await queryClient.invalidateQueries({
        predicate: (q) =>
          q.queryKey[0] === "analyticsControllerGetAdminAnalytics",
      });
      onOpenChange(false);
    } catch {
      toast({
        title: "Verification failed",
        description: "Could not verify this organization.",
        variant: "destructive",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleSendFeedback = async () => {
    if (!orgId || !feedback.trim()) {
      toast({
        title: "Message required",
        description: "Explain what information or documents are needed.",
        variant: "destructive",
      });
      return;
    }
    setPendingAction("feedback");
    try {
      await apiClient.patch(`/api/v1/organizations/${orgId}/verify`, {
        isVerified: false,
        message: feedback.trim(),
      });
      toast({
        title: "Message sent",
        description: "The organization has been notified.",
      });
      await queryClient.invalidateQueries({
        predicate: (q) => q.queryKey[0] === "userControllerGetUsers",
      });
      setFeedback("");
      onOpenChange(false);
    } catch {
      toast({ title: "Message could not be sent", variant: "destructive" });
    } finally {
      setPendingAction(null);
    }
  };

  if (!orgProfile) {
    return null;
  }

  return (
    <OrganizationVerificationViewDialog
      open={open}
      onOpenChange={onOpenChange}
      organization={orgProfile}
      adminView
      footer={
        showVerify ? (
          <div className='space-y-4 border-t pt-4'>
            <div className='space-y-2'>
              <Label htmlFor='organization-verification-feedback'>
                Request changes
              </Label>
              <Textarea
                id='organization-verification-feedback'
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder='Explain what is incomplete or incorrect…'
                rows={3}
                disabled={pendingAction !== null}
              />
            </div>
            <DialogFooter className='gap-2 sm:justify-end'>
              <Button
                type='button'
                variant='secondary'
                onClick={handleSendFeedback}
                disabled={isSending || isVerifying || !feedback.trim()}
              >
                {isSending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Sending…
                  </>
                ) : (
                  "Send message"
                )}
              </Button>
              <Button
                type='button'
                onClick={handleVerify}
                disabled={pendingAction !== null}
              >
                {pendingAction === "verify" ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Verifying…
                  </>
                ) : (
                  "Verify organization"
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : null
      }
    />
  );
}
