"use client";

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
    console.log("clicked");
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
              value={battle.player1 + battle._id}
              title={battle.player1}
              onSelect={() => handleClick(battle._id)}
   
    

              
            >
              <span className="flex justify-between cursor-pointer">
                {battle.player1}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
