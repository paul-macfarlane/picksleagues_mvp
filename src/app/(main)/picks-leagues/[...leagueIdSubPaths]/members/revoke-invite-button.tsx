import { Button } from "@/components/ui/button";
import { DBPicksLeagueInviteWithUser } from "@/db/picksLeagueInvite";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { revokeInviteAction } from "./revoke-invite-action";

interface RevokeInviteButtonProps {
  invite: DBPicksLeagueInviteWithUser;
}

export function RevokeInviteButton({ invite }: RevokeInviteButtonProps) {
  const [isRevoking, setIsRevoking] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      const formData = new FormData();
      formData.append("inviteId", invite.id);

      const response = await revokeInviteAction({}, formData);
      if (response?.errors) {
        let errorMessage = "An error occurred while revoking the invite";
        if (response.errors.form) {
          errorMessage = response.errors.form;
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Successfully revoked invite for @${invite.user.username}`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke invite. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleRevoke}
      disabled={isRevoking}
    >
      Revoke
    </Button>
  );
}
