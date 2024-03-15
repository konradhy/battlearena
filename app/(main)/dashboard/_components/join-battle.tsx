import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Doc } from "@/convex/_generated/dataModel";

interface JoinBattleProps {
  battle: Doc<"battles"> | null | undefined;
}

export const JoinBattle = ({ battle }: JoinBattleProps) => {
  const user = useUser();
  const joinBattle = useMutation(api.battle.joinBattle);

  if (!battle) {
    console.log("No battle data");
    return null;
  }

  const handleClick = () => {
    joinBattle({ id: battle._id, challenger: user.user?.firstName || "anon" });
  };
  if (
    battle.challenger ||
    battle.creatorEmail === user.user?.primaryEmailAddress?.emailAddress
  ) {
    return null;
  }

  return (
    <>
      <Button onClick={handleClick}>Join Battle</Button>
    </>
  );
};
