"use client";

import { newUserAction, NewUserFormState } from "@/app/actions/users";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useFormState, useFormStatus } from "react-dom";

function NewUserInnerForm({ formState }: { formState: NewUserFormState }) {
  // inner form is needed because the only way to detect the status of the form is in a child of the form
  const { pending } = useFormStatus();

  return (
    <Stack
      direction={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      gap={2}
    >
      <TextField
        name={"username"}
        error={!!formState.errors?.username}
        helperText={formState.errors?.username}
        required
        label="Username"
        sx={{ width: 300 }}
        slotProps={{
          htmlInput: {
            maxLength: 20,
          },
        }}
      ></TextField>

      <Button
        disabled={pending}
        type="submit"
        size="large"
        variant="contained"
        sx={{
          maxWidth: "min-content",
        }}
      >
        Submit
      </Button>

      {!!formState.errors?.submit && (
        <Typography color={"error"} variant="body1">
          {formState.errors?.submit}
        </Typography>
      )}
    </Stack>
  );
}

export default function NewUserForm() {
  const [formState, formAction] = useFormState(newUserAction, {
    errors: {},
  });

  return (
    <form action={formAction}>
      <NewUserInnerForm formState={formState} />
    </form>
  );
}
