"use client";
import { useParams } from "next/navigation";
import { useEffect,  } from "react";
import { PlayerDetails } from "../_components/player-details";
import { BattleMenu } from "../_components/battle-menu";
import { BattleAnnouncer } from "../_components/battle-announcer";
import { wait } from "@/shared/helpers";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useTrivia } from "@/hooks/use-trivia";
import { toast } from "sonner";
import { JoinBattle } from "../_components/join-battle";
import { BattleAi } from "../_components/battle-ai";

export default function BattlePage() {
  const params = useParams();
  const battleId = params.battleId;


  const { onOpen } = useTrivia();

  const battleDetails = useQuery(api.battle.getBattleDetails, {
    id: battleId as Id<"battles">,
  });
  const player1Details = useQuery(
    api.characters.getPlayerById,
    battleDetails?.player1 ? { id: battleDetails?.player1 } : "skip",
  );
  const player2Details = useQuery(
    api.characters.getPlayerById,
    battleDetails?.player2 ? { id: battleDetails?.player2 } : "skip",
  );
  const turn  = battleDetails?.turn || 0;
  const inSequence = battleDetails?.inSequence;

  const setSequenceMutation = useMutation(api.battle.setBattleSequence);
  const selectAiMove = useMutation(api.battle.selectAiMove);
  const gameOver = useMutation(api.battle.gameOver);

  const handleAction = (mode: string) => {
    setSequenceMutation({
      id: battleId as Id<"battles">,
      mode: mode,
      turn: turn || 0,
    });
  };




  //ai player
  useEffect(() => {
    if(battleDetails?.aiBattle){
    if ( turn === 1 && !inSequence) {
      selectAiMove({
        id: battleId as Id<"battles">,
   
      });

    }
  }
  }, [turn, inSequence, ]);


  useEffect(() => {
    if(!player1Details || !player2Details){
      return;
    }
    if (player1Details.health   < 0 || player2Details.health  < 0) {
      (async () => {
        
        toast.message(`Game Over, the battle has ended. The winner is ${player1Details.health < 0 ? "Player 2" : "Player 1"}`);
          await wait(5000);
        gameOver({
           id: battleId as Id<"battles">,
        });
      })();
    }
  }, [player1Details?.health, player2Details?.health, gameOver, battleId]);


  if(!battleDetails){
    return <div>Loading...</div>
  }

 

 if (battleDetails.result === "over") {
  return (
    <div style={{ textAlign: "center", fontSize: "1.2rem", fontWeight: "bold", padding: "20px" }}>
      Game Over. The battle has ended. Please start a new game.
    </div>
  );
}

 
  return (
    <div
      className="min-h-screen bg-no-repeat bg-cover bg-center flex flex-col items-center justify-center"
      style={{ backgroundImage: "url('/arena/arena.png')" }}
    >
      <div className="w-full flex justify-around items-start px-4">
        <div className="flex flex-col items-center">
          <PlayerDetails player={player1Details} />

          {!inSequence &&battleDetails.challenger && turn === 0 ? (
            <BattleMenu
              onSpecial={() => onOpen(battleId as Id<"battles">, turn)}
              onAttack={() => handleAction("attack")}
              onHeal={() => handleAction("heal")}
            />
          ):(
            <div className="w-96 h-40  bg-opacity-80 bg-gray-800 text-white rounded-lg shadow-xl">
            <div className="p-4">
              <ul className="list-none space-y-2">
                <li
                  className=" p-2 rounded-md"
                >
                  waiting...
                </li>
          
              </ul>
            </div>
          </div>

          )
          
          }

          <img
            src={player1Details?.image }
            alt="Player 1"
            className="mt-4 w-72 h-64 object-cover"
          />
        </div>
        <BattleAnnouncer
          message={battleDetails?.announcerMessage || "What will happen next?"}
        />

       <div className="m-4">
        <JoinBattle battle={battleDetails} />
        <BattleAi battle={battleDetails} />
        </div>



        <div className="flex flex-col items-center">
          <PlayerDetails player={player2Details} />

           {!inSequence && turn === 1 ? (
            <BattleMenu
              onSpecial={() => onOpen(battleId as Id<"battles">, turn)}
              onAttack={() => handleAction("attack")}
              onHeal={() => handleAction("heal")}
            />
          ):(
            <div className="w-96 h-40 bg-opacity-80 bg-gray-800 text-white rounded-lg shadow-xl">
            <div className="p-4">
              <ul className="list-none space-y-2">
                <li
                  className=" p-2 rounded-md"
                >
                  waiting...
                </li>
          
              </ul>
            </div>
          </div>

          )
          
          }
          <img
             src={player2Details?.image }
            alt="Player 2"
            className="mt-10 w-72 h-64 object-cover"
          />
        </div>
      </div>
    </div>
  );
}
