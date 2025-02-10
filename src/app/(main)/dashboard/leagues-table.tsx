"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DBPicksLeagueDetails } from "@/db/picksLeagues";
import { getPicksLeagueHomeUrl } from "@/models/picksLeagues";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<DBPicksLeagueDetails>[] = [
  {
    accessorKey: "name",
    header: "Leagues",
    cell: ({ row }) => {
      const league = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={league.logoUrl ?? undefined} alt={league.name} />
            <AvatarFallback className="text-base">
              {league.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="font-medium">{league.name}</p>
            <p className="text-sm text-muted-foreground">
              {league.sportLeagueAbbreviation} • {league.pickType}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const league = row.original;
      return (
        <div className="flex w-full justify-end">
          <Button asChild size="sm">
            <Link href={getPicksLeagueHomeUrl(league.id)}>
              Go to League
              <ChevronRight className="h-4 w-4 md:ml-2" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];

export function LeaguesTable({ leagues }: { leagues: DBPicksLeagueDetails[] }) {
  return <DataTable columns={columns} data={leagues} />;
}
