"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { nowInSaoPaulo, toISODate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { useFinance } from "@/providers/finance-provider";
import type { Transaction } from "@/types/database";
import type { TransactionType, NecessityType } from "@/types/database";
import { toast } from "sonner";

interface AddTransactionSheetProps {
  open: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  editing?: Transaction | null;
}

export function AddTransactionSheet({
  open,
  onClose,
  defaultType = "expense",
  editing = null,
}: AddTransactionSheetProps) {
  const { categories, addTransaction, updateTransaction, deleteTransaction } =
    useFinance();
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [necessity, setNecessity] = useState<NecessityType>("essential");
  const [date, setDate] = useState(toISODate(nowInSaoPaulo()));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editing) {
      setType(editing.transaction_type);
      setAmount(Number(editing.amount));
      setDescription(editing.description);
      setCategoryId(editing.category_id);
      setNecessity(editing.necessity_type ?? "essential");
      setDate(editing.transaction_date);
      setNotes(editing.notes ?? "");
    } else {
      setType(defaultType);
      setAmount(0);
      setDescription("");
      setCategoryId(null);
      setNecessity("essential");
      setDate(toISODate(nowInSaoPaulo()));
      setNotes("");
    }
    setConfirmDelete(false);
  }, [open, editing, defaultType]);

  const filteredCategories = categories.filter((c) => {
    if (type === "income") return c.category_type === "income" || c.category_type === "both";
    if (type === "expense") return c.category_type === "expense" || c.category_type === "both";
    return true;
  });

  async function handleSave() {
    if (amount <= 0) {
      toast.error("Informe o valor.");
      return;
    }
    if (!description.trim()) {
      toast.error("Informe a descrição.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        amount,
        description: description.trim(),
        categoryId,
        necessityType: type === "expense" ? necessity : null,
        transactionDate: date,
        notes: notes.trim() || undefined,
        transactionType: type,
      };

      if (editing) {
        await updateTransaction(editing.id, payload);
      } else {
        await addTransaction(payload);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar esta movimentação. Tente novamente."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    setSaving(true);
    try {
      await deleteTransaction(editing.id);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível excluir a movimentação.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editing ? "Editar movimentação" : type === "income" ? "Nova receita" : "Novo gasto"}
    >
      <div className="space-y-5">
        {!editing ? (
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "h-11 rounded-xl text-sm font-medium transition",
                  type === t
                    ? "bg-white text-primary shadow-card"
                    : "text-text-secondary"
                )}
              >
                {t === "expense" ? "Despesa" : "Receita"}
              </button>
            ))}
          </div>
        ) : null}

        <CurrencyInput
          label="Valor"
          value={amount}
          onChange={setAmount}
          large
          autoFocus={!editing}
        />

        <Input
          label="Descrição"
          placeholder={type === "income" ? "Ex: Freelance" : "Ex: iFood"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-text-secondary">Categoria</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filteredCategories.map((c) => (
              <CategoryChip
                key={c.id}
                label={c.name}
                selected={categoryId === c.id}
                onClick={() => setCategoryId(c.id)}
              />
            ))}
          </div>
        </div>

        {type === "expense" ? (
          <div>
            <p className="mb-2 text-sm font-medium text-text-secondary">
              Classificação
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNecessity("essential")}
                className={cn(
                  "h-12 rounded-2xl border text-sm font-medium transition",
                  necessity === "essential"
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-text-secondary"
                )}
              >
                Essencial
              </button>
              <button
                type="button"
                onClick={() => setNecessity("non_essential")}
                className={cn(
                  "h-12 rounded-2xl border text-sm font-medium transition",
                  necessity === "non_essential"
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-text-secondary"
                )}
              >
                Não essencial
              </button>
            </div>
          </div>
        ) : null}

        <Input
          label="Data"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Input
          label="Observação (opcional)"
          placeholder="Opcional"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Button
          size="lg"
          className="w-full"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving
            ? "Salvando..."
            : editing
              ? "Salvar alterações"
              : type === "income"
                ? "Salvar receita"
                : "Salvar gasto"}
        </Button>

        {editing ? (
          confirmDelete ? (
            <div className="rounded-2xl bg-danger-soft p-4">
              <p className="text-sm font-medium text-danger">
                Excluir movimentação?
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Essa ação não poderá ser desfeita.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => void handleDelete()}
                  disabled={saving}
                >
                  Excluir
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full text-danger"
              onClick={() => setConfirmDelete(true)}
            >
              Excluir movimentação
            </Button>
          )
        ) : null}
      </div>
    </BottomSheet>
  );
}
