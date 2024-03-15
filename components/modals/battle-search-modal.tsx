"use client";
/*

Add the tooltip


Types for the different characters 
5 different characters data stored in a helper file
characters randomly selected upon battle creation
A new move called crit that will win you the game if your hp is below 25% and your Opponent is between 25% and 50%
AI to be handled by an llm 


*/

import { use, useEffect, useState } from "react";
import { File } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { Trash } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from "@/components/ui/command";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSearch } from "@/hooks/use-search";
import { api } from "@/convex/_generated/api";

import { Id } from "@/convex/_generated/dataModel";

export const SearchModal = () => {
  const { isOpen, onClose } = useSearch();
  const router = useRouter();
  const pendingBattles = useQuery(api.battle.listBattles);

  const handleClick = (id: Id<"battles">) => {
    router.push(`/dashboard/${id}`);
    onClose();

  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder="Search for a battle" />

      <CommandList>
        <CommandEmpty>No results found</CommandEmpty>
        <CommandGroup heading="Pending Battles">
          {pendingBattles?.map((battle, index) => (
            <CommandItem
              key={battle._id}
              value={battle.createdBy + index + battle.challenger}
              title={battle.player1}
              onSelect={() => handleClick(battle._id)}
   
    

              
            >
              <span className="flex justify-between cursor-pointer">
                Join {battle.createdBy}&apos;s room
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
