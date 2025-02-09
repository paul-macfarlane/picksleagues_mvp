import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardContent } from "@/components/ui/card";
import { DBSportLeagueWithSeasonDetail } from "@/db/sportLeagues";
import { DBPicksLeagueSettingDetails } from "@/db/picksLeagues";
import { Separator } from "@/components/ui/separator";
import { Trophy, Users, Calendar, Lock, Eye, Target } from "lucide-react";
import { PicksLeagueVisibilities } from "@/models/picksLeagues";
import { getPicksLeagueMemberCount } from "@/db/picksLeagueMembers";

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description?: string;
}

function SettingItem({ icon, label, value, description }: SettingItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="space-y-1">
        <p className="font-medium leading-none">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground/80">{description}</p>
        )}
      </div>
    </div>
  );
}

export async function PicksLeagueSettingsViewer({
  sportLeague,
  picksLeague,
}: {
  sportLeague: DBSportLeagueWithSeasonDetail;
  picksLeague: DBPicksLeagueSettingDetails;
}) {
  const memberCount = await getPicksLeagueMemberCount(picksLeague.id);

  return (
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">League Identity</h3>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={picksLeague.logoUrl ?? undefined}
              alt={picksLeague.name}
            />
            <AvatarFallback className="text-2xl">
              {picksLeague.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-xl font-semibold">{picksLeague.name}</h4>
            <p className="text-sm text-muted-foreground">
              {sportLeague.name} • {sportLeague.season.name}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">League Settings</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <SettingItem
            icon={<Users className="h-4 w-4" />}
            label="League Size"
            value={`${memberCount} / ${picksLeague.size} Members`}
          />

          <SettingItem
            icon={<Target className="h-4 w-4" />}
            label="Pick Type"
            value={picksLeague.pickType}
            description={`${picksLeague.picksPerWeek} picks per week`}
          />

          <SettingItem
            icon={
              picksLeague.visibility === PicksLeagueVisibilities.PUBLIC ? (
                <Eye className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )
            }
            label="Visibility"
            value={
              picksLeague.visibility.charAt(0) +
              picksLeague.visibility.slice(1).toLowerCase()
            }
          />

          <SettingItem
            icon={<Calendar className="h-4 w-4" />}
            label="Season Duration"
            value={`${picksLeague.startSportLeagueWeek.name} - ${picksLeague.endSportLeagueWeek.name}`}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Season Information</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <SettingItem
            icon={<Trophy className="h-4 w-4" />}
            label="Sport League"
            value={sportLeague.name}
          />

          <SettingItem
            icon={<Calendar className="h-4 w-4" />}
            label="Season"
            value={sportLeague.season.name}
          />
        </div>
      </div>
    </CardContent>
  );
}
