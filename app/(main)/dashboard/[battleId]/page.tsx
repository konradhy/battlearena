"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PlayerDetails } from "../_components/player-details";
import { BattleMenu } from "../_components/battle-menu";
import { BattleAnnouncer } from "../_components/battle-announcer";
import { wait } from "@/shared/helpers";
import { useAIOpponent } from "@/hooks/use-ai-opponent";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useTrivia } from "@/hooks/use-trivia";
import { toast } from "sonner";

export default function BattlePage() {
  const params = useParams();
  const battleId = params.battleId;

  const { onOpen } = useTrivia();

  const battleDetails = useQuery(api.battle.getBattleDetails, {
    id: battleId as Id<"battles">,
  });
  const player1Details = useQuery(
    api.players.getPlayerById,
    battleDetails?.player1 ? { id: battleDetails?.player1 } : "skip",
  );
  const player2Details = useQuery(
    api.players.getPlayerById,
    battleDetails?.player2 ? { id: battleDetails?.player2 } : "skip",
  );
  const turn = battleDetails?.turn;
  const inSequence = battleDetails?.inSequence;

  const setSequenceMutation = useMutation(api.battle.setBattleSequence);
  const gameOver = useMutation(api.battle.gameOver);

  const handleAction = (mode: string) => {
    setSequenceMutation({
      id: battleId as Id<"battles">,
      mode: mode,
      turn: turn || 0,
    });
  };

  const aiChoice = useAIOpponent(turn); // this will be an action

  //ai player
  useEffect(() => {
    console.log(turn, "turn");
    if (aiChoice && turn === 1 && !inSequence) {
      setSequenceMutation({
        id: battleId as Id<"battles">,
        mode: aiChoice,
        turn: turn,
      });
    }
  }, [turn, aiChoice, inSequence]);

  useEffect(() => {
    if (player1Details?.health === 0 || player2Details?.health === 0) {
      (async () => {
        await wait(1000);
        toast.message("Game Over");
        gameOver({
          id: "j9723y3yc6afwnr68jp74c7mc16n6kcy" as Id<"battles">,
        });
      })();
    }
  }, [player1Details?.health, player2Details?.health, gameOver]);

  //i don't really understand useEffects and WHY we have to include certain things as dependencies. Like why do i need gameover as a dependencies? It's not like i expect the function to change?

  return (
    <div
      className="min-h-screen bg-no-repeat bg-cover bg-center flex flex-col items-center justify-center"
      style={{ backgroundImage: "url('/arena/arena.png')" }}
    >
      <div className="w-full flex justify-around items-start px-4">
        <div className="flex flex-col items-center">
          <PlayerDetails player={player1Details} />

          {!inSequence && turn === 0 && (
            <BattleMenu
              onSpecial={() => onOpen(battleId as Id<"battles">, turn)}
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
          <PlayerDetails player={player2Details} />

          {!inSequence && turn === 1 && (
            <BattleMenu
              onSpecial={() => onOpen(battleId as Id<"battles">, turn)}
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
