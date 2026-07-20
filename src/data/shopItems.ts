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
  { id: "gold", label: "Tibia Gold", icon: "https://tibia.fandom.com/wiki/Special:FilePath/Gold_Ingot.gif" },
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

export const shopItems: ShopItem[] = [
  // 1. Tibia Gold
  {
    id: "tg_1kk",
    name: "1.000.000 Gold Pieces (1KK)",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Gold_Ingot.gif",
    category: "gold",
    description: "Pacote de 1 milhão de moedas de ouro entregues diretamente no banco do seu personagem.",
    attributes: ["Entregue no Bank", "Segurança 100% garantida"],
    vocation: [],
    level: 0,
    weight: 0,
    imbuementSlots: 0,
    priceCoins: 50,
    isBestSeller: true
  },

  // 3. Armaduras
  {
    id: "arm_mp",
    name: "Magic Plate Armor",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Magic_Plate_Armor.gif",
    category: "armors",
    description: "Uma armadura mágica incrivelmente resistente, polida com runas sagradas de proteção física.",
    attributes: ["Arm: 16", "Proteção physical +3%"],
    vocation: [4],
    level: 80,
    weight: 85,
    imbuementSlots: 2,
    priceCoins: 120,
    isBestSeller: true
  },
  {
    id: "arm_dsm",
    name: "Dragon Scale Mail",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Dragon_Scale_Mail.gif",
    category: "armors",
    description: "Esta armadura é feita inteiramente com escamas colhidas dos dragões mais antigos de Tibia.",
    attributes: ["Arm: 15", "Proteção fire +5%"],
    vocation: [4, 3],
    level: 40,
    weight: 114,
    imbuementSlots: 1,
    priceCoins: 80
  },

  // 4. Armas
  {
    id: "wep_scaxe",
    name: "Stonecutter Axe",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Stonecutter_Axe.gif",
    category: "weapons",
    description: "Diz a lenda que este machado lendário pode cortar até a rocha mais dura como se fosse manteiga.",
    attributes: ["Atk: 50", "Def: 30 +3", "Axe fighting +3"],
    vocation: [4],
    level: 75,
    weight: 95,
    imbuementSlots: 2,
    priceCoins: 150,
    hands: "Uma mão",
    isBestSeller: true
  },
  {
    id: "wep_magic_sword",
    name: "Magic Sword",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Magic_Sword.gif",
    category: "weapons",
    description: "Também conhecida como SOV (Sword of Valor). A espada de uma mão mais equilibrada e cobiçada do jogo.",
    attributes: ["Atk: 48", "Def: 35 +3", "Sword fighting +3"],
    vocation: [4],
    level: 75,
    weight: 42,
    imbuementSlots: 2,
    priceCoins: 150,
    hands: "Uma mão"
  },

  // 5. Distância
  {
    id: "dist_bow_cly",
    name: "Bow of Destruction",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Bow_of_Destruction.gif",
    category: "distance",
    description: "Arco destruidor de almas que canaliza a precisão absoluta do portador para disparos letais.",
    attributes: ["Atk: +6", "Hit% +5", "Distance +2"],
    vocation: [3],
    level: 100,
    weight: 47,
    imbuementSlots: 3,
    priceCoins: 180,
    hands: "Duas mãos",
    isNew: true
  },

  // 6. Wands & Rods
  {
    id: "wand_vortex",
    name: "Wand of Destruction",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Wand_of_Destruction.gif",
    category: "wands",
    description: "Uma wand carregada com pura energia de destruição. Perfeita para os Sorcerers mais implacáveis.",
    attributes: ["Dano do tipo Death", "Magic Level +2", "Dano médio 95"],
    vocation: [1],
    level: 100,
    weight: 31,
    imbuementSlots: 2,
    priceCoins: 140,
    hands: "Uma mão",
    isNew: true
  },
  {
    id: "rod_vortex",
    name: "Rod of Destruction",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Rod_of_Destruction.gif",
    category: "wands",
    description: "Cria tempestades congelantes de cura e destruição. A melhor amiga dos Druids veteranos.",
    attributes: ["Dano do tipo Ice", "Magic Level +2", "Dano médio 95"],
    vocation: [2],
    level: 100,
    weight: 31,
    imbuementSlots: 2,
    priceCoins: 140,
    hands: "Uma mão",
    isNew: true
  },

  // 7. Spellbooks
  {
    id: "spb_dark",
    name: "Spellbook of Dark Mysteries",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Spellbook_of_Dark_Mysteries.gif",
    category: "spellbooks",
    description: "Um livro sagrado que esconde mistérios profanos que dão imenso poder aos seus conjuradores.",
    attributes: ["Def: 19", "Magic Level +3"],
    vocation: [1, 2],
    level: 80,
    weight: 29,
    imbuementSlots: 1,
    priceCoins: 110
  },

  // 8. Capacetes
  {
    id: "hel_dh",
    name: "Demon Helmet",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Demon_Helmet.gif",
    category: "helmets",
    description: "Um capacete assustador forjado do puro metal de demônios antigos do Abismo de Kazordoon.",
    attributes: ["Arm: 10", "Proteção physical +3%"],
    vocation: [],
    level: 0,
    weight: 29.5,
    imbuementSlots: 2,
    priceCoins: 90,
    isBestSeller: true
  },

  // 9. Amuletos
  {
    id: "amu_ssa",
    name: "Stone Skin Amulet",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Stone_Skin_Amulet.gif",
    category: "amulets",
    description: "Garante 5 cargas de petrificação instantânea na pele, absorvendo quase todo dano físico.",
    attributes: ["5 Cargas", "Proteção physical +80%", "Proteção death +80%"],
    vocation: [],
    level: 0,
    weight: 7,
    imbuementSlots: 0,
    priceCoins: 35
  },

  // 10. Anéis
  {
    id: "rng_might",
    name: "Might Ring",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Might_Ring.gif",
    category: "rings",
    description: "Anel sagrado que absorve qualquer tipo de dano sofrido por 20 cargas.",
    attributes: ["20 Cargas", "Proteção all +20%"],
    vocation: [],
    level: 0,
    weight: 1.5,
    imbuementSlots: 0,
    priceCoins: 25
  },

  // 11. Botas
  {
    id: "bts_soft",
    name: "Soft Boots",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Soft_Boots.gif",
    category: "boots",
    description: "O calçado mais cobiçado para regenerar vida e mana de forma extremamente rápida por 4 horas.",
    attributes: ["Regeneração: Mana +12/s", "Regeneração: Vida +3/s", "Duração: 240 min"],
    vocation: [],
    level: 0,
    weight: 8,
    imbuementSlots: 0,
    priceCoins: 75,
    isBestSeller: true
  },
  {
    id: "bts_gold",
    name: "Golden Boots",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Golden_Boots.gif",
    category: "boots",
    description: "Botas raras feitas de puro ouro divino. Aumentam significativamente a velocidade de corrida.",
    attributes: ["Arm: 4", "Velocidade +30"],
    vocation: [],
    level: 0,
    weight: 32,
    imbuementSlots: 1,
    priceCoins: 160,
    isNew: true
  },

  // 12. Calças
  {
    id: "leg_gorg",
    name: "Golden Legs",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Golden_Legs.gif",
    category: "legs",
    description: "Calças forjadas em ouro que fornecem um balanço perfeito entre peso e defesa.",
    attributes: ["Arm: 9"],
    vocation: [4, 3],
    level: 0,
    weight: 56,
    imbuementSlots: 1,
    priceCoins: 60
  },

  // 13. Escudos
  {
    id: "shd_mms",
    name: "Mastermind Shield",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Mastermind_Shield.gif",
    category: "shields",
    description: "O mais clássico escudo azul de Tibia, polido com runas de aço e cristais místicos.",
    attributes: ["Def: 37", "Proteção physical +2%"],
    vocation: [],
    level: 0,
    weight: 57,
    imbuementSlots: 1,
    priceCoins: 85,
    isBestSeller: true
  },

  // 14. Mochilas
  {
    id: "bp_demon",
    name: "Demon Backpack",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Demon_Backpack.gif",
    category: "backpacks",
    description: "Uma mochila assustadoramente espaçosa de cor vermelha infernal com o emblema do Demon.",
    attributes: ["Capacidade: 24 slots", "Design exclusivo de colecionador"],
    vocation: [],
    level: 0,
    weight: 18,
    imbuementSlots: 0,
    priceCoins: 20
  },

  // 15. Runas
  {
    id: "run_sd",
    name: "100x Sudden Death Runes",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Sudden_Death_Rune.gif",
    category: "runes",
    description: "A clássica runa da caveira preta. Causa dano massivo e instantâneo do elemento Death.",
    attributes: ["100 Cargas", "Dano Death", "Magic Level requisitado: 15"],
    vocation: [1, 2],
    level: 45,
    weight: 12,
    imbuementSlots: 0,
    priceCoins: 40,
    isBestSeller: true
  },

  // 18. Montarias
  {
    id: "mnt_draptor",
    name: "Draptor Mount",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Draptor_Mount.gif",
    category: "mounts",
    description: "Domine e monte um feroz Draptor de guerra. Dá uma velocidade incrível e prestígio inigualável no templo.",
    attributes: ["Velocidade +50", "Bônus de prestígio visual"],
    vocation: [],
    level: 0,
    weight: 0,
    imbuementSlots: 0,
    priceCoins: 300,
    isBestSeller: true
  },
  {
    id: "mnt_neon",
    name: "Neon Spark Lion",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Neon_Spark_Lion_Mount.gif",
    category: "mounts",
    description: "Um majestoso leão de pura luz néon azul que deixa um rastro brilhante por onde passa.",
    attributes: ["Velocidade +50", "Efeito de luz ativo"],
    vocation: [],
    level: 0,
    weight: 0,
    imbuementSlots: 0,
    priceCoins: 250,
    isNew: true
  },

  // 20. Addons
  {
    id: "add_demon",
    name: "Demon Hunter Outfits Full",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Demon_Hunter_Outfit.gif",
    category: "addons",
    description: "Desbloqueie o clássico visual Demon Hunter com Addon 1 (Mochila de estacas) e Addon 2 (Máscara).",
    attributes: ["Looktype: 289", "Inclui Addon 1 & 2 permanentes"],
    vocation: [],
    level: 0,
    weight: 0,
    imbuementSlots: 0,
    priceCoins: 350,
    isBestSeller: true
  },

  // 21. Imbuements
  {
    id: "imb_crit",
    name: "Intricate Strike Imbuement Pack",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Critical_Hit.gif",
    category: "imbuements",
    description: "Pacote com todos os materiais necessários para imbuir dano crítico nível 2 em suas armas.",
    attributes: ["Duração: 20 horas de caça", "Dano crítico +15%", "Chances de crítico 10%"],
    vocation: [],
    level: 0,
    weight: 0,
    imbuementSlots: 0,
    priceCoins: 45
  },

  // 23. Ferramentas
  {
    id: "tol_obs",
    name: "Obsidian Knife",
    spriteUrl: "https://tibia.fandom.com/wiki/Special:FilePath/Obsidian_Knife.gif",
    category: "tools",
    description: "Faca afiada usada para retirar peles de monstros como Minotauros e Beholders com perfeição.",
    attributes: ["Uso infinito", "Chance de colher minotaur leather, hardened bones"],
    vocation: [],
    level: 0,
    weight: 6.5,
    imbuementSlots: 0,
    priceCoins: 25
  }
];
