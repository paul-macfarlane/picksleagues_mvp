"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const router = useRouter();

  return (
    <Tabs defaultValue={defaultValue} className={"space-y-4"}>
      <TabsList
        className={`grid h-auto grid-cols-1 ${tabs.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            onClick={() => router.push(`/picks-leagues/${leagueId}/${tab.id}`)}
          >
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={selectedTab.id}>{selectedTab.content}</TabsContent>
    </Tabs>
  );
}
