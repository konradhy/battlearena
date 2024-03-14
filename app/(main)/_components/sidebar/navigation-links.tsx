"use client";

import { useEffect } from "react";
import {
  ChevronsLeft,
  MenuIcon,
  Home,
  ClipboardList,
  Folder,
  NotebookPen,
  UploadCloud,
  Bot,
  Plus,
  PenLine,
  GripVertical,
  HandCoins,
  LucideIcon,
  Settings,
  Mic,
} from "lucide-react";

export interface NavLink {
  title: string;
  label?: string;
  icon: LucideIcon;
  variant: "default" | "ghost";
  onClick?: () => void;
  link?: string;
  hotkey?: string;
  name?: string;
}

export let initialTopLinks: NavLink[] = [
  {
    title: "Home",
    icon: Home,
    variant: "default",
    link: "/dashboard",
    name: "dashboard",
  },

];
