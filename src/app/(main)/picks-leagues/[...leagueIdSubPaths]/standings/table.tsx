"use client";

import { DBPicksLeagueStandingsWithMembers } from "@/db/picksLeagueStandings";
import { Column, ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export interface StandingsTableProps {
  dbLeagueStandingsWithMembers: DBPicksLeagueStandingsWithMembers[];
}

function TableHeader({
  column,
  name,
}: {
  column: Column<DBPicksLeagueStandingsWithMembers, unknown>;
  name: string;
}) {
  return (
    <Button
      className="-ml-2 px-1"
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {name}
      <ArrowUpDown className="h-4 w-4" />
    </Button>
  );
}

const columns: ColumnDef<DBPicksLeagueStandingsWithMembers>[] = [
  {
    accessorKey: "standings.rank",
    header: ({ column }) => TableHeader({ column, name: "Rank" }),
  },
  {
    accessorKey: "user.username",
    header: ({ column }) => TableHeader({ column, name: "Member" }),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage
              src={row.original.user.image ?? undefined}
              alt={row.original.user.username!}
            />
            <AvatarFallback>
              {row.original.user
                .username!.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <span>
            {row.original.user.username} ({row.original.user.firstName}){" "}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "standings.points",
    header: ({ column }) => TableHeader({ column, name: "Points" }),
  },
  {
    accessorKey: "standings.wins",
    header: ({ column }) => TableHeader({ column, name: "Wins" }),
  },
  {
    accessorKey: "standings.losses",
    header: ({ column }) => TableHeader({ column, name: "Losses" }),
  },
  {
    accessorKey: "standings.pushes",
    header: ({ column }) => TableHeader({ column, name: "Pushes" }),
  },
];

export function StandingsTable({
  dbLeagueStandingsWithMembers,
}: StandingsTableProps) {
  return <DataTable columns={columns} data={dbLeagueStandingsWithMembers} />;
}
