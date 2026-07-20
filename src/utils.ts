import { CharacterDetails } from "./types";

export const VOCATIONS = [
  "None",
  "Sorcerer",
  "Druid",
  "Paladin",
  "Knight",
  "Master Sorcerer",
  "Elder Druid",
  "Royal Paladin",
  "Elite Knight",
  "Monk",
  "Exalted Monk"
];

export function getVocationName(vocId: number | string | any): string {
  const id = typeof vocId === "number" ? vocId : Number(vocId);
  return VOCATIONS[id] || String(vocId);
}

export function getOutfitImage(looktype: number): string {
  const lt = looktype || 128;
  return `/sprites/Outfit_${lt}.gif`;
}

export function getSpriteUrl(name: string): string {
  if (name.startsWith("/sprites/") || name.startsWith("http")) {
    return name;
  }
  if (name.startsWith("Outfit_")) {
    return `/sprites/${name}`;
  }
  return `/api/proxy/sprite/${encodeURIComponent(name)}`;
}

export function generateCharacterDetails(
  charName: string,
  vocation: string | number,
  level: number,
  mainSkillVal: number = 75,
  shieldSkillVal: number = 75
): CharacterDetails {
  const vocStr = typeof vocation === "number" ? getVocationName(vocation) : vocation;
  const isMonk = vocStr.toLowerCase().includes("monk");
  const isKnight = vocStr.toLowerCase().includes("knight");
  const isPaladin = vocStr.toLowerCase().includes("paladin");
  const isSorcerer = vocStr.toLowerCase().includes("sorcerer");
  const isDruid = vocStr.toLowerCase().includes("druid");

  // Default values
  let helmet = { name: "Leather Helmet", sprite: "🪖", desc: "Arm: 1. Proteção básica." };
  let amulet = { name: "Platinum Amulet", sprite: "📿", desc: "Arm: 2. Um amuleto abençoado." };
  let weapon = { name: "Spike Sword", sprite: "⚔️", desc: "Atk: 24, Def: 21. Leve e rápida." };
  let armor = { name: "Leather Armor", sprite: "👕", desc: "Arm: 4. Confortável." };
  let shield = { name: "Dwarven Shield", sprite: "🛡️", desc: "Def: 26. Feito de ferro anão." };
  let ring = { name: "Life Ring", sprite: "💍", desc: "Aumenta regeneração de HP e Mana." };
  let legs = { name: "Plate Legs", sprite: "👖", desc: "Arm: 7. Pesada mas resistente." };
  let boots = { name: "Leather Boots", sprite: "🥾", desc: "Arm: 1. Proteção simples." };
  let backpack = { name: "Red Backpack", sprite: "🎒", desc: "Capacidade de 20 slots." };

  if (isMonk) {
    helmet = { name: "Circlet of Light", sprite: "👑", desc: "Arm: 8. Um diadema brilhante que purifica os pensamentos do portador." };
    amulet = { name: "Sacred Tree Amulet", sprite: "📿", desc: "Proteção física +5% e contra terra +10%." };
    weapon = { name: "Monk Staff", sprite: "🦯", desc: "Atk: 45, Def: 35. Um bastão de madeira sagrada usado pelos monges guerreiros." };
    armor = { name: "Exalted Monk Robe", sprite: "👘", desc: "Arm: 14. Uma veste leve imbuída com runas de proteção espiritual." };
    shield = { name: "Spiritual Ward", sprite: "🛡️", desc: "Def: 35. Um escudo místico de pura energia concentrada." };
    ring = { name: "Life Ring", sprite: "💍", desc: "Acelera significativamente a regeneração de HP e Mana." };
    legs = { name: "Blue Legs", sprite: "👖", desc: "Arm: 8. Tecido leve abençoado com mana pura." };
    boots = { name: "Sandals of Speed", sprite: "🥾", desc: "Velocidade +25. Sinta os passos ficarem leves como pluma." };
    backpack = { name: "Red Backpack", sprite: "🎒", desc: "Capacidade de 24 slots." };
  } else if (isKnight) {
    helmet = { name: "Demon Helmet", sprite: "😈", desc: "Arm: 10. Forjado nas profundezas do inferno." };
    amulet = { name: "Gear Wheel Chain", sprite: "📿", desc: "Arm: 3. Aumenta a defesa física em 3%." };
    weapon = { name: "Stonecutter Axe", sprite: "🪓", desc: "Atk: 50, Def: 30. O lendário machado de cortar pedras." };
    armor = { name: "Dragon Scale Mail", sprite: "🧥", desc: "Arm: 15. Feito de escamas de dragão verde." };
    shield = { name: "Mastermind Shield", sprite: "🛡️", desc: "Def: 37. Proteção extrema para cavaleiros." };
    ring = { name: "Sword Ring", sprite: "💍", desc: "Aumenta skill de espada temporariamente." };
    legs = { name: "Golden Legs", sprite: "👖", desc: "Arm: 9. Feito de ouro místico e resistente." };
    boots = { name: "Boots of Haste", sprite: "🥾", desc: "Velocidade +20. Sinta o vento nos pés!" };
    backpack = { name: "Golden Backpack", sprite: "🎒", desc: "Capacidade de 30 slots. Edição rara de luxo." };
  } else if (isPaladin) {
    helmet = { name: "Elite Draken Helmet", sprite: "👑", desc: "Arm: 9, Dist: +2. Capacete draconiano de elite." };
    amulet = { name: "Koshei's Ancient Amulet", sprite: "📿", desc: "Proteção contra morte e físico." };
    weapon = { name: "Royal Crossbow", sprite: "🏹", desc: "Atk: +5, Range: 6. Balancete de mira implacável." };
    armor = { name: "Paladin Armor", sprite: "🦺", desc: "Arm: 13, Dist: +2. Leve e ágil para arqueiros." };
    shield = { name: "Prismatic Shield", sprite: "🛡️", desc: "Def: 36. Defesa mística para paladinos." };
    ring = { name: "Ring of Healing", sprite: "💍", desc: "Regenera HP e Mana extremamente rápido." };
    legs = { name: "Yalahari Leg Piece", sprite: "👖", desc: "Arm: 8, Dist: +2. Tecnologia mágica antiga." };
    boots = { name: "Soft Boots", sprite: "🥾", desc: "Regeneração massiva de mana por 4 horas de uso." };
    backpack = { name: "Crown Backpack", sprite: "🎒", desc: "Capacidade de 24 slots. Símbolo de realeza." };
  } else if (isSorcerer || isDruid) {
    helmet = { name: "Yalahari Mask", sprite: "🧙", desc: "Arm: 5, Magic Level: +2. Máscara mística de Yalahar." };
    amulet = { name: "Sacred Tree Amulet", sprite: "📿", desc: "Proteção natural contra terra e físico." };
    weapon = { name: "Wand of Starstorm", sprite: "🪄", desc: "Atk: Energia. Canaliza o poder de estrelas cadentes." };
    armor = { name: "Royal Scale Robe", sprite: "👘", desc: "Arm: 12, Magic Level: +2. Proteção mágica majestosa." };
    shield = { name: "Spellbook of Vigilance", sprite: "📖", desc: "Def: 18, Magic Level: +1. Livro de magias raras." };
    ring = { name: "Mind Ring", sprite: "💍", desc: "Aumenta magic level em +1 temporariamente." };
    legs = { name: "Blue Legs", sprite: "👖", desc: "Arm: 8. Tecido leve e abençoado com mana pura." };
    boots = { name: "Soft Boots", sprite: "🥾", desc: "Regeneração massiva de mana por 4 horas de uso." };
    backpack = { name: "Demon Backpack", sprite: "🎒", desc: "Capacidade de 28 slots. Feito com couro abissal." };
  }

  // Estimar as skills do personagem com base nas informações básicas
  const magicLevel = isSorcerer || isDruid ? mainSkillVal : isMonk ? Math.max(15, Math.floor(mainSkillVal / 1.5)) : Math.max(2, Math.floor(level / 25));
  const fist = isMonk ? mainSkillVal : isKnight ? 20 : 15;
  const club = isKnight ? 15 : 10;
  const sword = isKnight ? mainSkillVal : 10;
  const axe = isKnight ? mainSkillVal - 5 : 10;
  const distance = isPaladin ? mainSkillVal : 10;
  const shielding = isKnight || isPaladin || isMonk ? shieldSkillVal : Math.max(15, Math.floor(level / 12));
  const fishing = Math.max(10, Math.floor(level / 8));

  // Outfit customizado
  const outfitName = isMonk ? "Ascetic Monk Outfit" : isKnight ? "Elite Knight Outfit" : isPaladin ? "Royal Archer Outfit" : "Mage Guild Robes";
  const outfitDesc = isMonk ? "Completo com Faixa Preta e Terço Budista de madeira sagrada." : "Completo com Addon 1 & 2 destravados através de quests.";
  const outfitColors = isMonk ? "Primária: Laranja Açafrão, Secundária: Marrom Rústico" : "Primária: Preto Obsidiana, Secundária: Dourado Imperial";
  const outfitPreview = isMonk ? "🥋👊" : isKnight ? "⚔️🛡️" : isPaladin ? "🏹✨" : "🧙‍♂️🔥";

  // Montarias destravadas
  const mounts = [
    { name: "Black Sheep", sprite: "🐑", speedBonus: "+10" },
    { name: "Neon Spark", sprite: "⚡", speedBonus: "+25" }
  ];

  if (level >= 150) {
    mounts.push({ name: "War Bear", sprite: "🐻", speedBonus: "+20" });
  }
  if (level >= 250) {
    mounts.push({ name: "Draptor Legend", sprite: "🦖", speedBonus: "+30" });
  }

  // Itens do Depot simulados
  const depotItems = [
    { name: "Gold Ingot", sprite: "🪙", qty: 25, desc: "Barra de ouro místico puro." },
    { name: "Sudden Death Rune", sprite: "💀", qty: 850, desc: "Dano massivo de morte de alvo único." },
    { name: "Avalanche Rune", sprite: "❄️", qty: 600, desc: "Dano de área de gelo ideal para caças." },
    { name: "Great Mana Potion", sprite: "🧪", qty: 400, desc: "Restauração sênior de mana." },
    { name: "Magic Sulphur", sprite: "🧪", qty: 2, desc: "Pó místico altamente valorizado." }
  ];

  return {
    equipment: { helmet, amulet, weapon, armor, shield, ring, legs, boots, backpack },
    skills: { magicLevel, fist, club, sword, axe, distance, shielding, fishing },
    outfit: { name: outfitName, description: outfitDesc, colors: outfitColors, preview: outfitPreview },
    mounts,
    depotItems
  };
}
