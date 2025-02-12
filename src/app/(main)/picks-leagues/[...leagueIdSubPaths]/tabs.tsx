import Link from "next/link";
import { PicksLeagueTab, PicksLeagueTabIds } from "@/models/picksLeagues";
import { ReactNode } from "react";

export interface SelectedTabWithContent {
  id: PicksLeagueTabIds;
  content: ReactNode;
}

export default function PicksLeagueTabs({
  leagueId,
  defaultValue,
  tabs,
  selectedTab,
}: {
  leagueId: string;
  defaultValue: string;
  tabs: PicksLeagueTab[];
  selectedTab: SelectedTabWithContent;
}) {
  // using divs with a link instead of tabs component because tabs component has some weird bug where scrolling down then up and then clicking did not fire an on click event, preventing user navigation
  return (
    <div className="space-y-4">
      <div className="grid h-auto grid-cols-1 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground md:grid-cols-5">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/picks-leagues/${leagueId}/${tab.id}`}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              defaultValue === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-muted-foreground"
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </div>
      <div>{defaultValue === selectedTab.id && selectedTab.content}</div>
    </div>
  );
}
