import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Doc } from "@/convex/_generated/dataModel";

interface BattleAiProps {
  battle: Doc<"battles"> | null | undefined;
}

export const BattleAi = ({ battle }: BattleAiProps) => {
    const user = useUser();
    const battleAi = useMutation(api.battle.battleAi);

    if (!battle) {
        console.log("No battle data");
        return null; 
    }

    const handleClick = () => {
        battleAi({id: battle._id});
    };
       if (battle.challenger || battle.creatorEmail !== user.user?.primaryEmailAddress?.emailAddress) {
        return null;
    }

    return (
        <>
            <Button  onClick={handleClick}>BattleAi</Button>
         
        </>
    );
};
