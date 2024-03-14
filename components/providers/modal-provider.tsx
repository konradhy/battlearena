"use client";

import { useEffect, useState } from "react";
import { TriviaModal } from "../modals/trivia-modal";
import { SearchModal } from "../modals/battle-search-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  return (
    <>
      <TriviaModal />
      <SearchModal />
    </>
  );
};
