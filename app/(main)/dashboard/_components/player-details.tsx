"use client";


import { Doc } from "@/convex/_generated/dataModel";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bar } from "./bar";

interface PlayerDetailsProps {
  player?: Doc<"characters"> | null;
}

export const PlayerDetails = ({ player }: PlayerDetailsProps) => {
  if (!player) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-96  bg-opacity-80  bg-stone-500 shadow-lg rounded-lg overflow-hidden m-2">
      <CardHeader className="p-3 bg-opacity-80  bg-stone-500 text-white">
        <div className=" flex item-center justify-between ">
          <CardTitle className="text-lg font-semibold">{player.name}</CardTitle>
          Level {player.level}
        </div>
      </CardHeader>
      <CardContent className="text-sm flex-col space-y-2 flex">
        <div className="w-full flex items-start justify-start">
          <Bar
            value={player.health}
            maxValue={player.maxHealth}
            label="health"
          />
        </div>

     

   
      </CardContent>
    </Card>
  );
};
