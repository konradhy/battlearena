import {
  Card,
  CardContent,

} from "@/components/ui/card";

export const BattleMenu = ({ onAttack, onSpecial, onHeal }: any) => {
  return (
    <Card className="w-96 bg-opacity-80 bg-gray-800 text-white rounded-lg shadow-xl">
      <CardContent className="p-4">
        <ul className="list-none space-y-2">
          <li
            className="cursor-pointer hover:bg-gray-700 p-2 rounded-md"
            onClick={onAttack}
          >
            Attack
          </li>
          <li
            className="cursor-pointer hover:bg-gray-700 p-2 rounded-md"
            onClick={onSpecial}
          >
            Special
          </li>
          <li
            className="cursor-pointer hover:bg-gray-700 p-2 rounded-md"
            onClick={onHeal}
          >
            Heal
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
