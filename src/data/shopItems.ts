export interface ShopItem {
  id: string;
  name: string;
  spriteUrl: string;     // https://tibia.fandom.com/wiki/Special:FilePath/{Nome}.gif
  category: string;
  description: string;
  attributes: string[];  // ["Arm: 16", "distance fighting +3", "protection physical +5%"]
  vocation: number[];    // [4] Knight, [1,2] Sorc/Druid, [] = todos
  level: number;         // nível mínimo (0 = sem req)
  weight: number;        // peso em oz
  imbuementSlots: number;
  priceCoins: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  hands?: string;        // "Uma mão" | "Duas mãos"
}

export const SHOP_CATEGORIES = [
  { id: "gold", label: "Tibia Gold", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Crystal_Coin.gif" },
  { id: "armors", label: "Armaduras", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Magic_Plate_Armor.gif" },
  { id: "weapons", label: "Armas", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Stonecutter_Axe.gif" },
  { id: "distance", label: "Distância", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Crystalline_Arrow.gif" },
  { id: "wands", label: "Wands & Rods", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Wand_of_Defiance.gif" },
  { id: "spellbooks", label: "Spellbooks", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Spellbook_of_Ancient_Arcana.gif" },
  { id: "helmets", label: "Capacetes", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Demon_Helmet.gif" },
  { id: "amulets", label: "Amuletos", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Stone_Skin_Amulet.gif" },
  { id: "rings", label: "Anéis", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Might_Ring.gif" },
  { id: "boots", label: "Botas", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Soft_Boots.gif" },
  { id: "legs", label: "Calças", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Golden_Legs.gif" },
  { id: "shields", label: "Escudos", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Mastermind_Shield.gif" },
  { id: "backpacks", label: "Mochilas", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Demon_Backpack.gif" },
  { id: "runes", label: "Runas", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Sudden_Death_Rune.gif" },
  { id: "mounts", label: "Montarias", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Blazebringer.gif" },
  { id: "addons", label: "Addons", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Ferumbras%27_Hat.gif" },
  { id: "tools", label: "Ferramentas", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Squeezing_Gear_of_Girlpower.gif" }
];

export const VOCATION_NAMES: Record<number, string> = {
  1: "Sorcerer", 5: "Master Sorcerer",
  2: "Druid", 6: "Elder Druid",
  3: "Paladin", 7: "Royal Paladin",
  4: "Knight", 8: "Elite Knight",
  9: "Monk", 10: "Exalted Monk"
};

export const shopItems: ShopItem[] = [];
