import { useState } from "react";
import { Progress } from "@/components/ui/progress";

interface BarProps {
  value: number;
  maxValue: number;
  label: string;
}

export const Bar = ({ value, maxValue, label }: BarProps) => {
  // Define a mapping from label to TailwindCSS class names
  const colorClass = (label: string) => {
    switch (label) {
      case "health":
        return "bg-red-500";
      case "special":
        return "bg-blue-500";
      case "experience":
        return "bg-green-500";
      default:
        return "bg-black"; // Default class for labels not matching any case
    }
  };

  return (
    <Progress
      value={value}
      max={maxValue}
      className={colorClass(label)} // Use the mapping function to determine the class
    />
  );
};
