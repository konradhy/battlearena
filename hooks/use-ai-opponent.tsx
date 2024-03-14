import { useEffect, useState } from "react";
//ai will take a look at the current stats, as well as an explanation on how the choices work, then they'll make a choice.

export const useAIOpponent = (turn: number | undefined) => {
  const [aiChoice, setAIChoice] = useState("");

  useEffect(() => {
    if (turn === 1) {
      const options = ["attack", "special", "heal"];
      setAIChoice(options[Math.floor(Math.random() * options.length)]);
    }
  }, [turn]);

  return aiChoice;
};
