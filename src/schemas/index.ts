import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const onboardingSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome"),
    monthlySalary: z.number().positive("Informe o salário mensal"),
    payday: z.number().int().min(1).max(31),
    initialSavings: z.number().min(0),
    goalType: z.enum(["fixed", "percent"]),
    monthlySavingsGoal: z.number().positive("Informe a meta de economia"),
  })
  .superRefine((data, ctx) => {
    if (data.goalType === "percent" && data.monthlySavingsGoal > 100) {
      ctx.addIssue({
        code: "custom",
        message: "O percentual deve ser no máximo 100%",
        path: ["monthlySavingsGoal"],
      });
    }
  });

export const transactionSchema = z.object({
  amount: z.number().positive("Informe o valor"),
  description: z.string().min(1, "Informe a descrição"),
  categoryId: z.string().uuid("Selecione uma categoria").nullable().optional(),
  necessityType: z.enum(["essential", "non_essential"]).nullable().optional(),
  transactionDate: z.string().min(1),
  notes: z.string().optional(),
  transactionType: z.enum(["income", "expense", "reserve"]),
  isRecurring: z.boolean().optional(),
});

export const reserveSchema = z.object({
  amount: z.number().positive("Informe o valor"),
  transactionDate: z.string().min(1),
  notes: z.string().optional(),
  type: z.enum(["deposit", "withdrawal"]),
});

export const goalSchema = z.object({
  name: z.string().min(1, "Informe o nome da meta"),
  targetAmount: z.number().positive("Informe o valor da meta"),
  currentAmount: z.number().min(0).optional(),
  targetDate: z.string().optional().nullable(),
});

export const recurringSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  categoryId: z.string().uuid().nullable().optional(),
  necessityType: z.enum(["essential", "non_essential"]).nullable().optional(),
  billingDay: z.number().int().min(1).max(31),
  recurrence: z.enum(["monthly", "weekly", "yearly"]),
  active: z.boolean(),
});

export const profileSettingsSchema = z.object({
  name: z.string().min(2),
  monthlySalary: z.number().positive(),
  payday: z.number().int().min(1).max(31),
  monthlySavingsGoal: z.number().positive(),
  goalType: z.enum(["fixed", "percent"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type ReserveInput = z.infer<typeof reserveSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type RecurringInput = z.infer<typeof recurringSchema>;
export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
