import { auth } from "@/auth";
import { ApplicationError } from "@/models/errors";
import { deleteAccount } from "@/services/users";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json(
      { error: "Unauthorized" },
      {
        status: 401,
      },
    );
  }

  try {
    await deleteAccount(session.user.id);
  } catch (e) {
    let status = 500;
    let message = "Internal Server Error";
    if (e instanceof ApplicationError) {
      status = e.statusCode;
    }
    if (e instanceof Error) {
      message = e.message;
    }

    return Response.json(
      {
        error: message,
      },
      {
        status,
      },
    );
  }

  return Response.json(
    {
      message: "Success",
    },
    {
      status: 200,
    },
  );
}
