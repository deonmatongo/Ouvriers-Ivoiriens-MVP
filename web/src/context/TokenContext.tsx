import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface TokenTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  created_at: string;
}

interface TokenContextType {
  balance: number;
  transactions: TokenTransaction[];
  addTokens: (amount: number, reason: string) => void;
  deduct: (amount: number, reason: string) => boolean;
  /** Used by the client side to deduct tokens from a specific artisan on agreement */
  deductForArtisan: (artisanId: string, amount: number, reason: string) => void;
}

const TokenContext = createContext<TokenContextType | null>(null);

function balanceKey(userId: string) { return `tokens_balance_${userId}`; }
function txnKey(userId: string) { return `tokens_txns_${userId}`; }

function readBalance(userId: string): number {
  return Number(localStorage.getItem(balanceKey(userId)) ?? 0);
}

function writeBalance(userId: string, val: number) {
  localStorage.setItem(balanceKey(userId), String(Math.max(0, val)));
}

function readTxns(userId: string): TokenTransaction[] {
  try { return JSON.parse(localStorage.getItem(txnKey(userId)) ?? '[]'); } catch { return []; }
}

function writeTxn(userId: string, txn: Omit<TokenTransaction, 'id' | 'created_at'>) {
  const all = readTxns(userId);
  const entry: TokenTransaction = {
    ...txn,
    id: Math.random().toString(36).slice(2),
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(txnKey(userId), JSON.stringify([entry, ...all].slice(0, 20)));
}

export function TokenProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id ?? '';

  const [balance, setBalance] = useState<number>(() => (uid ? readBalance(uid) : 0));
  const [transactions, setTransactions] = useState<TokenTransaction[]>(() => (uid ? readTxns(uid) : []));

  const refresh = useCallback(() => {
    if (!uid) return;
    setBalance(readBalance(uid));
    setTransactions(readTxns(uid));
  }, [uid]);

  const addTokens = useCallback((amount: number, reason: string) => {
    if (!uid) return;
    const newBal = readBalance(uid) + amount;
    writeBalance(uid, newBal);
    writeTxn(uid, { type: 'credit', amount, reason });
    refresh();
  }, [uid, refresh]);

  const deduct = useCallback((amount: number, reason: string): boolean => {
    if (!uid) return false;
    const cur = readBalance(uid);
    if (cur < amount) return false;
    writeBalance(uid, cur - amount);
    writeTxn(uid, { type: 'debit', amount, reason });
    refresh();
    return true;
  }, [uid, refresh]);

  const deductForArtisan = useCallback((artisanId: string, amount: number, reason: string) => {
    const cur = readBalance(artisanId);
    writeBalance(artisanId, cur - amount);
    writeTxn(artisanId, { type: 'debit', amount, reason });
    // If the current user IS that artisan, refresh their view
    if (artisanId === uid) refresh();
  }, [uid, refresh]);

  return (
    <TokenContext.Provider value={{ balance, transactions, addTokens, deduct, deductForArtisan }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokens() {
  const ctx = useContext(TokenContext);
  if (!ctx) throw new Error('useTokens must be used inside TokenProvider');
  return ctx;
}
