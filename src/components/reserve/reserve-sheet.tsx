"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { nowInSaoPaulo, toISODate } from "@/lib/utils/date";
import { useFinance } from "@/providers/finance-provider";
import { toast } from "sonner";
import type { ReserveType } from "@/types/database";

interface ReserveSheetProps {
  open: boolean;
  onClose: () => void;
  defaultType?: ReserveType;
}

export function ReserveSheet({
  open,
  onClose,
  defaultType = "deposit",
}: ReserveSheetProps) {
  const { addReserveMovement } = useFinance();
  const [type, setType] = useState<ReserveType>(defaultType);
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(toISODate(nowInSaoPaulo()));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setType(defaultType);
  }, [open, defaultType]);

  async function handleSave() {
    if (amount <= 0) {
      toast.error("Informe o valor.");
      return;
    }
    setSaving(true);
    try {
      await addReserveMovement({
        amount,
        type,
        transactionDate: date,
        notes: notes.trim() || undefined,
      });
      setAmount(0);
      setNotes("");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível registrar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={type === "deposit" ? "Guardar dinheiro" : "Retirar da reserva"}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
          <button
            type="button"
            className={`h-11 rounded-xl text-sm font-medium ${
              type === "deposit"
                ? "bg-white text-primary shadow-card"
                : "text-text-secondary"
            }`}
            onClick={() => setType("deposit")}
          >
            Guardar
          </button>
          <button
            type="button"
            className={`h-11 rounded-xl text-sm font-medium ${
              type === "withdrawal"
                ? "bg-white text-primary shadow-card"
                : "text-text-secondary"
            }`}
            onClick={() => setType("withdrawal")}
          >
            Retirar
          </button>
        </div>

        <CurrencyInput label="Valor" value={amount} onChange={setAmount} large />
        <Input
          label="Data"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="Observação"
          placeholder="Opcional"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Button
          size="lg"
          className="w-full"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {saving ? "Salvando..." : "Confirmar"}
        </Button>
      </div>
    </BottomSheet>
  );
}
