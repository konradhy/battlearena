"use client";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle } from "lucide-react";
import { appName } from "@/lib/utils";
import { useConvexAuth } from "convex/react";
import { Spinner } from "@/components/spinner";
import Link from "next/link";
import { SignInButton } from "@clerk/clerk-react";

export const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return (
    <div className="max-w-3xl space-y-4 dark:text-amber-50">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
        {appName}: AI <span className="italic text-amber-500">Enhanced</span> {" "}
        <span className="text-red-500">Gaming</span>
      </h1>
      <h2 className="text-base sm:text-xl md:text-2xl font-medium dark:text-amber-50">
A proof of concept 
      </h2>
      {isLoading && (
        <div className="w-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}

      {isAuthenticated && !isLoading && (
        <div className="flex gap-4 items-center justify-center">
          <Button asChild>
            <Link href="/dashboard">
              Enter {`${appName}`}
              <ArrowRightCircle className="h-4 w-4 ml-2" />
            </Link>
          </Button>

    
        </div>
      )}

      {!isAuthenticated && !isLoading && (
        <SignInButton mode="modal">
          <Button>
            Play {appName} now
            <ArrowRightCircle className="h-4 w-4 ml-2" />
          </Button>
        </SignInButton>
      )}
    </div>
  );
};
