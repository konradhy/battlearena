"use client";
import { useEffect, useState } from "react";

import { PlayerDetails } from "./_components/player-details";
import { BattleMenu } from "./_components/battle-menu";
import { BattleAnnouncer } from "./_components/battle-announcer";
import { wait } from "@/shared/helpers";
import { useAIOpponent } from "@/hooks/use-ai-opponent";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useTrivia } from "@/hooks/use-trivia";
import { toast } from "sonner";

export default function DashboardPage() {
  const [sequence, setSequence] = useState({ mode: "", turn: 0 });
  const { isOpen, onClose, onOpen } = useTrivia();

  const battleDetails = useQuery(api.battle.getBattleDetails, {
    id: "j9723y3yc6afwnr68jp74c7mc16n6kcy" as Id<"battles">,
  });
  const playerStats = useQuery(api.players.getPlayerById, {
    id: "j576peqr02d98a77qenqx02bf16mmxxt" as Id<"players">,
  });

  const opponentStats = useQuery(api.players.getPlayerById, {
    id: "j574mtg9zp29j3akk9v6m49we56mnsdz" as Id<"players">,
  });
  const turn = battleDetails?.turn;
  const inSequence = battleDetails?.inSequence;

  const setSequenceMutation = useMutation(api.battle.setBattleSequence);
  const gameOver = useMutation(api.battle.gameOver);

  const handleAction = (mode: string) => {
    setSequenceMutation({
      id: "j9723y3yc6afwnr68jp74c7mc16n6kcy" as Id<"battles">,
      mode: mode,
      turn: turn || 0,
    });
  };

  // const aiChoice = useAIOpponent(turn); // this will be an action

  // //this is how the AI plays
  // useEffect(() => {
  //   console.log(turn, "turn");
  //   if (aiChoice && turn === 1 && !inSequence) {
  //     setSequenceMutation({
  //       id: "j9723y3yc6afwnr68jp74c7mc16n6kcy" as Id<"battles">,
  //       mode: aiChoice,
  //       turn: turn,
  //     });
  //   }
  // }, [turn, aiChoice, inSequence]);

  useEffect(() => {
    if (playerStats?.health === 0 || opponentStats?.health === 0) {
      (async () => {
        await wait(1000);
        toast.message("Game Over");
        gameOver({
          id: "j9723y3yc6afwnr68jp74c7mc16n6kcy" as Id<"battles">,
        });
      })();
    }
  }, [playerStats?.health, opponentStats?.health]);

  return (
    <div
      className="min-h-screen bg-no-repeat bg-cover bg-center flex flex-col items-center justify-center"
      style={{ backgroundImage: "url('/arena/arena.png')" }}
    >
      <div className="w-full flex justify-around items-start px-4">
        <div className="flex flex-col items-center">
          <PlayerDetails player={playerStats} />

          {!inSequence && turn === 0 && (
            <BattleMenu
              onSpecial={() =>
                onOpen(
                  "j9723y3yc6afwnr68jp74c7mc16n6kcy" as Id<"battles">,
                  turn,
                )
              }
              onAttack={() => handleAction("attack")}
              onHeal={() => handleAction("heal")}
            />
          )}

          <img
            src="/players/tiger.png"
            alt="Player 1"
            className="mt-4 w-64 h-100 object-cover"
          />
        </div>
        <BattleAnnouncer
          message={battleDetails?.announcerMessage || "What will happen next?"}
        />

        <div className="flex flex-col items-center">
          <PlayerDetails player={opponentStats} />

          {!inSequence && turn === 1 && (
            <BattleMenu
              onSpecial={() =>
                onOpen(
                  "j9723y3yc6afwnr68jp74c7mc16n6kcy" as Id<"battles">,
                  turn,
                )
              }
              onAttack={() => handleAction("attack")}
              onHeal={() => handleAction("heal")}
            />
          )}
          <img
            src="/players/player2.png"
            alt="Player 2"
            className="mt-10 w-64 h-100 object-cover"
          />
        </div>
      </div>
    </div>
  );
}

/*
1. Create rooms
- function create room 
  - creates a new battle with player 1 data 
  - renders on battle/[battleId]
  - sae the email and name of the user who created the room in the battle schema
  - you can search for all existing battles. When you click it you go to the room
  - Once you're in the room you can click join
  - if there is no player2 then you'll join the room
  - if there is a player2 then we simple don't use the AI answer stuff
Step 1 create the create battle button which is a button on the menu
step 2 When created you are redirected to the correct page 
step 3 rewrite the page except we get the battle id from the url
step 4 create a search room button
step 5 when clicked a search module of all existing rooms is shown
step 6 When you click on the room you are redirected to the room
step 7 indicate in the list whether the room is already full or not as well as the name of the creator
step 8 build the  join room button. This is in the room itself, when clicked you join the room as player 2
step 9 build the playAI button. When clicked A new player is created and that is the player2, and we use the AI to play

*/
