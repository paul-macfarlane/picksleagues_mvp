import { DBSportLeagueWeek } from "@/db/sportLeagueWeeks";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PicksLeagueTabIds } from "@/models/picksLeagues";

export interface WeekSwitcherProps {
  previousWeek: DBSportLeagueWeek | null;
  picksLeagueId: string;
  selectedDBWeek: DBSportLeagueWeek;
  nextWeek: DBSportLeagueWeek | null;
  tab: PicksLeagueTabIds;
}

export function WeekSwitcher({
  previousWeek,
  picksLeagueId,
  selectedDBWeek,
  nextWeek,
  tab,
}: WeekSwitcherProps) {
  return (
    <Pagination>
      <PaginationContent>
        {previousWeek && (
          <PaginationItem>
            <PaginationLink
              className={"w-full p-2 sm:p-4"}
              href={`/picks-leagues/${picksLeagueId}/${tab}?weekId=${previousWeek.id}`}
            >
              <ChevronLeft />{" "}
              <span className="hidden sm:flex">{previousWeek.name}</span>
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationLink
            isActive
            className={"w-full p-2 sm:p-4"}
            href={`/picks-leagues/${picksLeagueId}/${tab}?weekId=${selectedDBWeek.id}`}
          >
            {selectedDBWeek.name}
          </PaginationLink>
        </PaginationItem>

        {nextWeek && (
          <PaginationItem>
            <PaginationLink
              className={"w-full p-2 sm:p-4"}
              href={`/picks-leagues/${picksLeagueId}/${tab}?weekId=${nextWeek.id}`}
            >
              <span className="hidden sm:flex">{nextWeek.name}</span>{" "}
              <ChevronRight />
            </PaginationLink>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
