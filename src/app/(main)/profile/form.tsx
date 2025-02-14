"use client";

import { CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UpdateProfileFormSchema } from "@/models/users";
import { useForm } from "react-hook-form";
import { useFormStatus } from "react-dom";
import { updateProfileAction } from "./action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState, useActionState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { isUrl } from "@/shared/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import axios, { AxiosError } from "axios";

type FormSchema = z.infer<typeof UpdateProfileFormSchema>;

interface UpdateProfileFormProps {
  defaultValues: {
    username: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
    timezone: string;
  };
  postSubmitUrl?: string;
  showDelete: boolean;
  canDelete: boolean;
  cannotDeleteReason: string;
  mode: "signup" | "update";
}

export default function UpdateProfileForm({
  defaultValues,
  postSubmitUrl,
  showDelete,
  canDelete,
  cannotDeleteReason,
  mode,
}: UpdateProfileFormProps) {
  const router = useRouter();

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [formState, formAction] = useActionState(updateProfileAction, {});
  const form = useForm<FormSchema>({
    resolver: zodResolver(UpdateProfileFormSchema),
    defaultValues: {
      username: defaultValues.username,
      firstName: defaultValues.firstName,
      lastName: defaultValues.lastName,
      imageUrl: defaultValues.imageUrl ?? "", // needed because controlled inputs cannot have null default values
      timezone: mode === "signup" ? userTimezone : defaultValues.timezone,
    },
  });
  const formRef = useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();

  const imageUrl = form.watch("imageUrl");
  const username = form.watch("username");

  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const onDeleteAccount = async () => {
    try {
      setDeleteSubmitting(true);

      await axios.delete(`${process.env.NEXT_PUBLIC_HOST!}/api/users`);

      toast({
        title: "Account Deleted!",
        description: "Your account has been deleted.",
      });
      router.push(`/`);
      router.refresh(); // refresh to update profile menu
    } catch (e) {
      let description = "An unexpected error occurred, please try again later.";
      if (e instanceof AxiosError && e.response?.data.error) {
        description = e.response.data.error;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description,
      });

      setDeleteSubmitting(false);
    }
  };

  // needed to give time to give client side image to load
  if (!mounted) {
    return null;
  }

  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(async () => {
            const actionResponse = await updateProfileAction(
              formState,
              new FormData(formRef.current!),
            );

            if (actionResponse?.errors) {
              if (actionResponse?.errors?.username) {
                form.setError("username", {
                  type: "custom",
                  message: actionResponse.errors.username,
                });
              }
              if (actionResponse?.errors?.firstName) {
                form.setError("firstName", {
                  type: "custom",
                  message: actionResponse.errors.firstName,
                });
              }
              if (actionResponse?.errors?.lastName) {
                form.setError("lastName", {
                  type: "custom",
                  message: actionResponse.errors.lastName,
                });
              }
              if (actionResponse?.errors?.imageUrl) {
                form.setError("imageUrl", {
                  type: "custom",
                  message: actionResponse.errors.imageUrl,
                });
              }
              if (actionResponse?.errors?.timezone) {
                form.setError("timezone", {
                  type: "custom",
                  message: actionResponse.errors.timezone,
                });
              }

              return;
            }

            toast({
              title: "Profile updated",
              description: "Your profile has been successfully updated.",
            });

            if (postSubmitUrl) {
              router.push(postSubmitUrl);
              return;
            }

            // this is a quick hack to get the profile menu to refetched it's data
            // if this ends up causing jank behavior some work can be done to implement a cache and revalidation strategy for the profile menu
            router.refresh();
          })(e);
        }}
      >
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={imageUrl && isUrl(imageUrl) ? imageUrl : undefined}
                alt={"Your Profile Avatar"}
              />
              <AvatarFallback>
                {username.charAt(0).toUpperCase() ?? "A"}
              </AvatarFallback>
            </Avatar>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col gap-1">
                  <FormLabel>Profile Picture URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/your-image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Usernames are unique and must be between 8-20 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  name="timezone"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Intl.supportedValuesOf("timeZone").map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Your timezone will be used to display times in your local
                  timezone
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>

        <CardFooter className="mt-4 flex flex-col gap-4">
          <div className="flex w-full gap-4">
            <Button disabled={pending} type="submit" className="w-full">
              Save
            </Button>
          </div>

          {formState.errors?.form && (
            <p className="text-sm font-medium text-destructive">
              {formState.errors.form}
            </p>
          )}

          <Separator />

          {showDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full" variant="destructive">
                  <Trash /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  {!canDelete && (
                    <>
                      <AlertDialogTitle>
                        Cannot delete account yet
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {cannotDeleteReason}
                      </AlertDialogDescription>
                    </>
                  )}

                  {canDelete && (
                    <>
                      <AlertDialogTitle>
                        Are you sure you want to delete your account?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone You will not be able to sign into
                        this account again and all of your personal information
                        will be deleted. Your historical data in picks leagues
                        such as picks and standings will be retained but
                        anonymized. You can re-create a new account with the
                        same email you used for this one, but you cannot
                        re-attach your historical data like picks or standings.
                      </AlertDialogDescription>
                    </>
                  )}
                </AlertDialogHeader>

                <AlertDialogFooter>
                  {!canDelete && (
                    <>
                      <AlertDialogCancel>Ok</AlertDialogCancel>
                    </>
                  )}

                  {canDelete && (
                    <>
                      <AlertDialogCancel disabled={deleteSubmitting}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDeleteAccount}
                        disabled={deleteSubmitting}
                      >
                        Delete
                      </AlertDialogAction>
                    </>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </form>
    </Form>
  );
}
