import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import FilterLeaguesForm from "@/app/(main)/leagues/join/filter-leagues-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllDBSportsWithActiveSeason } from "@/db/sports";
import { filterDBLeagues } from "@/db/leagues";
import { z } from "zod";
import {
  MAX_LEAGUE_SIZE,
  MAX_PICKS_PER_WEEK,
  MIN_LEAGUE_SIZE,
  MIN_PICKS_PER_WEEK,
  PickTypes,
} from "@/models/leagues";
import { JoinLeagueForm } from "@/app/(main)/leagues/join/join-league-form";

const MAX_VISIBLE_PAGES = 5;
const PAGE_SIZE = 6;

function getPages(currentPage: number, totalPages: number): (number | "...")[] {
  const pages: (number | "...")[] = [];
  if (totalPages <= MAX_VISIBLE_PAGES) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
  }

  if (currentPage > 3) {
    pages.push("...");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  if (!pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return pages;
}

function getPageNumberUrl(
  searchParams: { [key: string]: string | string[] | undefined },
  pageNum: number,
): string {
  const activeParams = Object.fromEntries(
    Object.entries(searchParams)
      .filter(([_, value]) => Boolean(value))
      .map(([key, value]) => [key, String(value)]),
  );
  activeParams["page"] = `${pageNum}`;
  const queryParams = new URLSearchParams(activeParams).toString();

  return `/leagues/join?${queryParams}`;
}

export default async function JoinLeagues({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth");
  }

  if (!searchParams["page"]) {
    searchParams["page"] = "1";
  }

  let currentPage = 1;
  const parsePageNumber = z.coerce
    .number()
    .min(1)
    .safeParse(searchParams["page"]);
  if (parsePageNumber.success) {
    currentPage = parsePageNumber.data;
  }

  let sportId: string | undefined;
  if (searchParams["sportId"]) {
    const parseSportId = z.string().uuid().safeParse(searchParams["sportId"]);
    if (parseSportId.success) {
      sportId = parseSportId.data;
    }
  }

  let pickType: PickTypes | undefined;
  if (searchParams["pickType"]) {
    const parsePickType = z
      .enum([
        PickTypes.PICK_TYPE_AGAINST_THE_SPREAD,
        PickTypes.PICK_TYPE_STRAIGHT_UP,
        PickTypes.PICK_TYPE_OVER_UNDER,
      ])
      .safeParse(searchParams["pickType"]);
    if (parsePickType.success) {
      pickType = parsePickType.data;
    }
  }

  let startWeekId: string | undefined;
  if (searchParams["startWeekId"]) {
    const parseStartWeekId = z
      .string()
      .uuid()
      .safeParse(searchParams["startWeekId"]);
    if (parseStartWeekId.success) {
      startWeekId = parseStartWeekId.data;
    }
  }

  let endWeekId: string | undefined;
  if (searchParams["endWeekId"]) {
    const parseEndWeekId = z
      .string()
      .uuid()
      .safeParse(searchParams["endWeekId"]);
    if (parseEndWeekId.success) {
      endWeekId = parseEndWeekId.data;
    }
  }

  let picksPerWeek: number | undefined;
  if (searchParams["picksPerWeek"]) {
    const parsePicks = z.coerce
      .number()
      .min(MIN_PICKS_PER_WEEK)
      .max(MAX_PICKS_PER_WEEK)
      .safeParse(searchParams["picksPerWeek"]);
    if (parsePicks.success) {
      picksPerWeek = parsePicks.data;
    }
  }

  let size: number | undefined;
  if (searchParams["size"]) {
    const parseSize = z.coerce
      .number()
      .min(MIN_LEAGUE_SIZE)
      .max(MAX_LEAGUE_SIZE)
      .safeParse(searchParams["size"]);
    if (parseSize.success) {
      size = parseSize.data;
    }
  }

  const { leagues, total } = await filterDBLeagues(
    {
      sportId,
      pickType,
      picksPerWeek,
      startWeekId,
      endWeekId,
      size,
    },
    session.user.id,
    PAGE_SIZE,
    (currentPage - 1) * PAGE_SIZE,
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pages = getPages(currentPage, totalPages);

  const dbSports = await getAllDBSportsWithActiveSeason();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Join Leagues</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Leagues</CardTitle>
          <CardDescription>
            Filter leagues to join by attributes
          </CardDescription>
        </CardHeader>
        <FilterLeaguesForm sports={dbSports} />
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {leagues.map((league) => (
          <JoinLeagueForm key={league.id} league={league} />
        ))}
      </div>

      {leagues.length > 0 && (
        <Pagination className="mt-8">
          <PaginationContent>
            {currentPage > 1 ? (
              <PaginationItem>
                <PaginationPrevious
                  href={getPageNumberUrl(searchParams, currentPage - 1)}
                />
              </PaginationItem>
            ) : (
              <></>
            )}

            {pages.map((page) => (
              <PaginationItem key={page}>
                {page === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    isActive={page === currentPage}
                    href={getPageNumberUrl(searchParams, page)}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {currentPage < totalPages ? (
              <PaginationItem>
                <PaginationNext
                  href={getPageNumberUrl(searchParams, currentPage + 1)}
                />
              </PaginationItem>
            ) : (
              <></>
            )}
          </PaginationContent>
        </Pagination>
      )}

      {leagues.length === 0 ? (
        <p className="w-full text-center">No leagues found</p>
      ) : (
        <></>
      )}
    </div>
  );
}
