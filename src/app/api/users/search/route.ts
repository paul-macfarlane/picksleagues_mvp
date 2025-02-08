import { auth } from "@/auth";
import { searchUsersNotInLeague } from "@/db/users";
import { z } from "zod";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const queryParsed = z.string().safeParse(searchParams.get("q"));
  if (!queryParsed.success) {
    return Response.json({ error: "Invalid query" }, { status: 400 });
  }
  const query = queryParsed.data;

  const leagueIdParsed = z.string().safeParse(searchParams.get("leagueId"));
  if (!leagueIdParsed.success) {
    return Response.json({ error: "Invalid leagueId" }, { status: 400 });
  }
  const leagueId = leagueIdParsed.data;

  if (query.length < 3) {
    return Response.json({ users: [] });
  }

  const searchResults = await searchUsersNotInLeague(leagueId, query, 5);

  return Response.json({ users: searchResults });
}
