"use client";

import { CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UpdateProfileFormSchema } from "@/models/users";
import { useForm, UseFormReturn } from "react-hook-form";
import { useFormState, useFormStatus } from "react-dom";
import { updateProfileAction } from "./action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { isUrl } from "@/lib/utils";

type FormSchema = z.infer<typeof UpdateProfileFormSchema>;

function FormContent({
  form,
  errorMessage,
}: {
  form: UseFormReturn<FormSchema>;
  errorMessage?: string;
}) {
  const { pending } = useFormStatus();

  const imageUrl = form.watch("imageUrl");
  const username = form.watch("username");

  return (
    <>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={imageUrl && isUrl(imageUrl) ? imageUrl : ""}
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
      </CardContent>

      <CardFooter className="mt-4 flex flex-col gap-4">
        <div className="flex w-full gap-4">
          <Button disabled={pending} type="submit" className="w-full">
            Save
          </Button>
        </div>

        <p className="text-sm font-medium text-destructive">{errorMessage}</p>
      </CardFooter>
    </>
  );
}

interface UpdateProfileFormProps {
  defaultValues: {
    username: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
  postSubmitUrl?: string;
}

export default function UpdateProfileForm({
  defaultValues,
  postSubmitUrl,
}: UpdateProfileFormProps) {
  const router = useRouter();

  const [formState, formAction] = useFormState(updateProfileAction, {});
  const form = useForm<FormSchema>({
    resolver: zodResolver(UpdateProfileFormSchema),
    defaultValues: {
      username: defaultValues.username,
      firstName: defaultValues.firstName,
      lastName: defaultValues.lastName,
      imageUrl: defaultValues.imageUrl,
    },
  });
  const formRef = useRef<HTMLFormElement>(null);

  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        <FormContent form={form} errorMessage={formState.errors?.form} />
      </form>
    </Form>
  );
}
