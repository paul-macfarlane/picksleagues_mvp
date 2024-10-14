"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useFormState, useFormStatus } from "react-dom";
import { profileSetupAction } from "@/actions/profile-setup";
import { useRef } from "react";
import { ProfileSetupFormSchema } from "@/models/profile-setup";

type FormSchema = z.infer<typeof ProfileSetupFormSchema>;

function FormContent({
  form,
  errorMessage,
}: {
  form: UseFormReturn<FormSchema>;
  errorMessage?: string;
}) {
  // inner form is needed because the only way to detect the status of the form is in a child of the form
  const { pending } = useFormStatus();

  return (
    <>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Choose a unique username between 8-20 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem className="flex flex-col">
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
            <FormItem className="flex flex-col">
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button disabled={pending} type="submit" className="w-full">
          Complete Profile Setup
        </Button>

        <p className="text-sm font-medium text-destructive">{errorMessage}</p>
      </CardFooter>
    </>
  );
}

interface ProfileSetupFormProps {
  defaultValues: FormSchema;
}

export default function ProfileSetupForm({
  defaultValues,
}: ProfileSetupFormProps) {
  const [formState, formAction] = useFormState(profileSetupAction, {});
  const form = useForm<FormSchema>({
    resolver: zodResolver(ProfileSetupFormSchema),
    defaultValues: {
      username: defaultValues.username,
      firstName: defaultValues.firstName,
      lastName: defaultValues.lastName,
      ...(formState?.fields ?? {}),
    },
  });
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(async () => {
            const actionResponse = await profileSetupAction(
              formState,
              new FormData(formRef.current!),
            );

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
          })(e);
        }}
      >
        <FormContent form={form} errorMessage={formState.errors?.submit} />
      </form>
    </Form>
  );
}
