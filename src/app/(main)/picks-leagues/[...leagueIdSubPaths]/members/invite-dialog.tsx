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
import { Link, Loader2, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRef, useState, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { picksLeagueInviteAction } from "@/app/(main)/picks-leagues/[...leagueIdSubPaths]/members/invite-action";
import { PicksLeagueInviteFormSchema } from "@/models/picksLeagueInvites";
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

type FormSchema = z.infer<typeof PicksLeagueInviteFormSchema>;

export function PicksLeagueInviteDialog({ leagueId }: { leagueId: string }) {
  const [inviteLink, setInviteLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DBUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const copyInviteLink = () => {
    void navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
  };

  const [formState, formAction] = useActionState(picksLeagueInviteAction, {});
  const form = useForm<FormSchema>({
    resolver: zodResolver(PicksLeagueInviteFormSchema),
  });
  const formRef = useRef<HTMLFormElement>(null);

  const { toast } = useToast();

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

      const actionResponse = await picksLeagueInviteAction(formState, formData);
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
    <Form {...form}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(async () => {
            const actionResponse = await picksLeagueInviteAction(
              formState,
              new FormData(formRef.current!),
            );

            if (actionResponse?.errors) {
              if (actionResponse?.errors?.leagueId) {
                form.setError("leagueId", {
                  type: "custom",
                  message: actionResponse.errors.leagueId,
                });
              }

              return;
            }

            if (!actionResponse?.inviteUrl) {
              setError("An unexpected error occurred. Please try again later.");
              return;
            }

            setError("");
            setInviteLink(actionResponse.inviteUrl);
          })(e);
        }}
      >
        <input
          {...form.register("leagueId")}
          name="leagueId"
          type="hidden"
          value={leagueId}
        />

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
              className="mt-4 w-full"
            >
              <User className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xs md:max-w-lg">
            <DialogHeader>
              <DialogTitle>Invite New Member</DialogTitle>
              <DialogDescription>
                Search for users or share an invite link.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="search">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search">Search Users</TabsTrigger>
                <TabsTrigger value="link">Invite Link</TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-4">
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(null)}
                        >
                          Clear
                        </Button>
                      </div>

                      <Button
                        onClick={handleDirectInvite}
                        disabled={isInviting}
                        className="w-full"
                      >
                        {isInviting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Invite @{selectedUser.username}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="link" className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  {inviteLink ? (
                    <>
                      <Input value={inviteLink} readOnly />
                      {linkCopied ? (
                        <Button type="button">Link Copied!</Button>
                      ) : (
                        <Button type="button" onClick={copyInviteLink}>
                          <Link className="mr-2 h-4 w-4" />
                          Copy Invite Link
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      {form.formState.errors.leagueId && (
                        <span className="text-sm text-destructive">
                          {form.formState.errors.leagueId.message}
                        </span>
                      )}

                      {error && (
                        <span className="text-sm text-destructive">
                          {error}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </form>
    </Form>
  );
}
