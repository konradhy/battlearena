"use client";

import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bar } from "./bar";

interface PlayerDetailsProps {
  player?: Doc<"players"> | null;
}

export const PlayerDetails = ({ player }: PlayerDetailsProps) => {
  if (!player) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-96 h-36 bg-opacity-80  bg-stone-500 shadow-lg rounded-lg overflow-hidden m-2">
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

        <div className="w-3/4 flex ">
          <Bar
            value={player.health}
            maxValue={player.maxHealth}
            label="special"
          />
        </div>

        <div className="w-1/2 flex ">
          <Bar
            value={player.health}
            maxValue={player.maxHealth}
            label="experience"
          />
        </div>
      </CardContent>
    </Card>
  );
};
