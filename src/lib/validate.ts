import { z } from "zod";

export const emailSchema = z.string().email().max(255);

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .max(128, "A senha deve ter no máximo 128 caracteres")
  .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "Deve conter pelo menos um número");

export const characterNameSchema = z
  .string()
  .min(2)
  .max(30)
  .regex(/^[A-Za-zÀ-ÿ'\-\s]+$/, "Nome contém caracteres inválidos");

export const spriteFilenameSchema = z
  .string()
  .regex(/^[\w\-\.]+\.(gif|png|jpg|jpeg|webp)$/i)
  .refine((s) => !s.includes(".."), "Path traversal detectado");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const createCharacterSchema = z.object({
  name: characterNameSchema,
  vocation: z.enum(["Knight", "Elite Knight", "Sorcerer", "Master Sorcerer", "Druid", "Elder Druid", "Paladin", "Royal Paladin", "Monk", "Exalted Monk"]),
  gender: z.enum(["Masculino", "Feminino"]),
});

export const bazaarListSchema = z.object({
  characterName: z.string().min(1),
  price: z.number().int().min(50, "Preço mínimo é 50 Coins"),
});

export const houseBidSchema = z.object({
  characterName: z.string().min(1),
  amount: z.number().int().min(25, "Lance mínimo é 25 Coins"),
});

export const adminConfigSchema = z.object({
  serverName: z.string().optional(),
  experienceRate: z.number().int().positive().optional(),
  boostedCreatureName: z.string().optional(),
  boostedCreatureLooktype: z.string().optional(),
  maintenanceMode: z.boolean().optional(),
  eventDoubleXp: z.boolean().optional(),
  eventDoubleSkill: z.boolean().optional(),
  maxPlayers: z.number().int().positive().optional(),
  activeEvents: z.string().optional(),
});
