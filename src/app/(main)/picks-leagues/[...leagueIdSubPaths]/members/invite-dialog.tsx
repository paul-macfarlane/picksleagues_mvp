"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Search, User, Check, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { picksLeagueInviteAction } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/members/invite-action";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/useDebounce";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { DBUser } from "@/db/users";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PicksLeagueMemberRoles } from "@/models/picksLeagueMembers";
import { useRouter } from "next/navigation";

export function PicksLeagueInviteDialog({ leagueId }: { leagueId: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DBUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<PicksLeagueMemberRoles>(
    PicksLeagueMemberRoles.MEMBER,
  );
  const [inviteLink, setInviteLink] = useState<string>("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { toast } = useToast();
  const router = useRouter();

  const generateInviteLink = async (role: PicksLeagueMemberRoles) => {
    setIsGeneratingLink(true);
    try {
      const formData = new FormData();
      formData.append("leagueId", leagueId);
      formData.append("role", role);

      const actionResponse = await picksLeagueInviteAction({}, formData);
      if (actionResponse?.errors || !actionResponse?.inviteUrl) {
        let errorMessage =
          "An unexpected error occurred while generating invite link";
        if (actionResponse?.errors?.leagueId) {
          errorMessage = actionResponse?.errors?.leagueId;
        }

        if (actionResponse?.errors?.form) {
          errorMessage = actionResponse.errors.form;
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (actionResponse?.inviteUrl) {
        setInviteLink(actionResponse.inviteUrl);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate invite link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyInviteLink = () => {
    if (!inviteLink) return;

    void navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    toast({
      title: "Success",
      description: "Invite link copied to clipboard",
    });

    setTimeout(() => {
      setLinkCopied(false);
    }, 2000);
  };

  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedSearch.length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axios.get(
          `/api/users/search?q=${encodeURIComponent(debouncedSearch)}&leagueId=${encodeURIComponent(leagueId)}`,
        );
        const data = await response.data;
        setSearchResults(data.users);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    void searchUsers();
  }, [debouncedSearch, leagueId]);

  const handleDirectInvite = async () => {
    if (!selectedUser) return;

    setIsInviting(true);
    try {
      const formData = new FormData();
      formData.append("leagueId", leagueId);
      formData.append("userId", selectedUser.id);
      formData.append("role", selectedRole);

      const actionResponse = await picksLeagueInviteAction({}, formData);
      if (actionResponse?.errors) {
        let errorMessage =
          "An unexpected error occurred while inviting user to league";
        if (actionResponse?.errors?.leagueId) {
          errorMessage = actionResponse?.errors?.leagueId;
        }

        if (actionResponse?.errors?.form) {
          errorMessage = actionResponse.errors.form;
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Successfully invited @${selectedUser.username} to the league.`,
        });
        setSelectedUser(null);
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to invite user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="submit"
          onClick={() => {
            setLinkCopied(false);
            setSearchQuery("");
            setSearchResults([]);
            setSelectedUser(null);
          }}
          className="mt-4"
        >
          <User className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Search for a user to invite to your league or generate an invite
            link.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="direct"
          onValueChange={(value) => {
            if (value === "link" && !inviteLink) {
              generateInviteLink(selectedRole);
            }
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Direct Invite</TabsTrigger>
            <TabsTrigger value="link">Invite Link</TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4">
            <div className="flex flex-col space-y-4">
              <Command className="rounded-lg border pt-2 shadow-md">
                <div className="flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    className="flex w-full border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isInviting}
                  />
                </div>

                <CommandEmpty>
                  {searchQuery.length < 3
                    ? "Enter at least 3 characters to search..."
                    : "No users found."}
                </CommandEmpty>
                <CommandGroup>
                  {isSearching ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    searchResults.map((user) => (
                      <CommandItem
                        key={user.id}
                        onSelect={() => {
                          setSelectedUser(user);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.image ?? undefined}
                            alt={user.username ?? ""}
                          />
                          <AvatarFallback>
                            {user.username
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm">@{user.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </CommandItem>
                    ))
                  )}
                </CommandGroup>
              </Command>

              {selectedUser && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={selectedUser.image ?? undefined}
                          alt={selectedUser.username ?? ""}
                        />
                        <AvatarFallback>
                          {selectedUser.username
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          @{selectedUser.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </span>
                      </div>
                    </div>
                    <Select
                      value={selectedRole}
                      onValueChange={(value: PicksLeagueMemberRoles) =>
                        setSelectedRole(value)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PicksLeagueMemberRoles.MEMBER}>
                          {PicksLeagueMemberRoles.MEMBER}
                        </SelectItem>
                        <SelectItem value={PicksLeagueMemberRoles.COMMISSIONER}>
                          {PicksLeagueMemberRoles.COMMISSIONER}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleDirectInvite}
                    disabled={isInviting}
                    className="w-full"
                  >
                    {isInviting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Invite @{selectedUser.username} as {selectedRole}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Select
                  value={selectedRole}
                  onValueChange={(value: PicksLeagueMemberRoles) => {
                    setSelectedRole(value);
                    setInviteLink(""); // Clear existing link when role changes
                    generateInviteLink(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PicksLeagueMemberRoles.MEMBER}>
                      {PicksLeagueMemberRoles.MEMBER}
                    </SelectItem>
                    <SelectItem value={PicksLeagueMemberRoles.COMMISSIONER}>
                      {PicksLeagueMemberRoles.COMMISSIONER}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Input
                    readOnly
                    value={inviteLink}
                    placeholder={
                      isGeneratingLink
                        ? "Generating link..."
                        : "No invite link generated"
                    }
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={copyInviteLink}
                    disabled={!inviteLink || isGeneratingLink}
                  >
                    {linkCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {isGeneratingLink && (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
