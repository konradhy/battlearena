import { Doc } from "./_generated/dataModel";

export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

export const attack = ({
  attacker,
  receiver,
}: {
  attacker: Doc<"characters">;
  receiver: Doc<"characters">;
}) => {
  const receivedDamage =
    attacker.attack - (attacker.level - receiver.level) * 1.25;

  const finalDamage = receivedDamage - receiver.defense / 2;

  return finalDamage;
};
export const specialAttack = ({
  attacker,
  receiver,
}: {
  attacker: Doc<"characters">;
  receiver: Doc<"characters">;
}) => {
  const receivedDamage =
    attacker.specialAttack - (attacker.level - receiver.level) * 1.25;

  const finalDamage = receivedDamage - receiver.specialDefense / 2;

  return finalDamage;
};
export const heal = ({
  attacker,
  receiver,
}: {
  attacker: Doc<"characters">;
  receiver: Doc<"characters">;
}) => {
  return attacker.specialAttack - receiver.specialDefense;
};
