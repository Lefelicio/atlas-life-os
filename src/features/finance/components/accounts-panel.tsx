import { useState } from "react";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFinance } from "../store";
import { accountBalance, currency, totalBalance } from "../utils";
import { AccountDialog } from "./account-dialog";
import type { Account } from "../types";

export function AccountsPanel() {
  const { accounts, transactions, removeAccount } = useFinance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Account | null>(null);

  const total = totalBalance(accounts, transactions);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Saldo total
          </p>
          <p className="text-2xl font-semibold tabular-nums">{currency(total)}</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Conta
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-muted/20">
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-muted">
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhuma conta cadastrada
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              Adicionar primeira conta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => {
            const bal = accountBalance(a, transactions);
            return (
              <Card
                key={a.id}
                className="group relative overflow-hidden border-border/60 bg-card/60"
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5"
                  style={{ backgroundColor: a.color }}
                />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.name}</p>
                      <p className="mt-1 text-lg font-semibold tabular-nums">
                        {currency(bal)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditing(a);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setConfirmDelete(a)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AccountDialog open={open} onOpenChange={setOpen} account={editing} />

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os lançamentos associados a "{confirmDelete?.name}" também serão
              removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) removeAccount(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
