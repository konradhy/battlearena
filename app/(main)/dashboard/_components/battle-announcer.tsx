import { useTypedMessage } from "@/hooks/use-typed-message";

export const BattleAnnouncer = ({ message }: { message: string }) => {
  const typedMessage = useTypedMessage(message);
  return (
    <div className="w-80 bg-opacity-80 bg-stone-500 text-white rounded-lg shadow-lg p-4 m-2">
      <p>{typedMessage}</p>
    </div>
  );
};
