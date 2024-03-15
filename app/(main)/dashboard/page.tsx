"use client";
import Head from "next/head";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const createBattle = useMutation(api.battle.createBattle);
  const router = useRouter();
  const handleCreateBattle = async () => {
    try {
      const id = await createBattle();
      router.push(`/dashboard/${id}`);
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <>
      <Head>
        <title>BattleArenaAI - Home</title>
        <meta
          name="description"
          content="Dive into the digital arena where AI champions battle for supremacy. Join BattleArenaAI today and prove your strategy."
        />
      </Head>
      <div
        className="flex flex-col min-h-screen"
        style={{
          backgroundImage: "url(/arena/arena-zoom.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <main
          className="flex-grow container mx-auto flex flex-col justify-center items-center text-center px-4 py-12"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", color: "#fff" }}
        >
          <h2 className="text-4xl font-bold mb-4">Welcome to BattleArenaAI</h2>
          <p className="text-xl mb-8">
            Experience the ultimate AI-driven battle arena. Strategize, compete,
            and win in a world where only the smartest prevail.
          </p>
          <Button onClick={handleCreateBattle}>Create Battle</Button>
        </main>
      </div>
    </>
  );
}
