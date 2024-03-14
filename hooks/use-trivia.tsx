import { Id } from "@/convex/_generated/dataModel";
import { create } from "zustand";

type TriviaStore = {
  isOpen: boolean;
  turn: number | null;

  id: Id<"battles"> | null;
  onClose: () => void;

  onOpen: (id: Id<"battles">, turn: number) => void;
};

export const useTrivia = create<TriviaStore>((set) => ({
  isOpen: false,
  id: null,
  turn: null,
  onOpen: (id, turn) => set({ isOpen: true, id, turn }),
  onClose: () => set({ isOpen: false }),
}));
