"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeagueTab, LeagueTabIds } from "@/models/leagues";

export interface SelectedTabWithContent {
  id: LeagueTabIds;
  content: React.ReactNode;
}

export default function LeagueTabs({
  leagueId,
  defaultValue,
  tabs,
  selectedTab,
}: {
  leagueId: string;
  defaultValue: string;
  tabs: LeagueTab[];
  selectedTab: SelectedTabWithContent;
}) {
  const router = useRouter();

  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList
        className={`grid h-auto grid-cols-1 ${tabs.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            onClick={() => router.push(`/leagues/${leagueId}/${tab.id}`)}
          >
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={selectedTab.id}>{selectedTab.content}</TabsContent>
    </Tabs>
  );
}
