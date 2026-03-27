import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  addTokens: (amount: number, reason: string) => Promise<void>;
  deduct: (amount: number, reason: string) => Promise<boolean>;
  deductForArtisan: (artisanId: string, amount: number, reason: string) => Promise<void>;
}

const TokenContext = createContext<TokenContextType | null>(null);

function balanceKey(id: string) { return `tokens_balance_${id}`; }
function txnKey(id: string) { return `tokens_txns_${id}`; }

async function readBalance(id: string): Promise<number> {
  const v = await AsyncStorage.getItem(balanceKey(id));
  return Number(v ?? 0);
}

async function writeBalance(id: string, val: number) {
  await AsyncStorage.setItem(balanceKey(id), String(Math.max(0, val)));
}

async function readTxns(id: string): Promise<TokenTransaction[]> {
  try {
    const v = await AsyncStorage.getItem(txnKey(id));
    return JSON.parse(v ?? '[]');
  } catch { return []; }
}

async function appendTxn(id: string, txn: Omit<TokenTransaction, 'id' | 'created_at'>) {
  const all = await readTxns(id);
  const entry: TokenTransaction = { ...txn, id: Math.random().toString(36).slice(2), created_at: new Date().toISOString() };
  await AsyncStorage.setItem(txnKey(id), JSON.stringify([entry, ...all].slice(0, 20)));
}

export function TokenProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id ?? '';

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);

  const refresh = useCallback(async () => {
    if (!uid) return;
    setBalance(await readBalance(uid));
    setTransactions(await readTxns(uid));
  }, [uid]);

  // Load on mount / uid change
  useState(() => { refresh(); });

  const addTokens = useCallback(async (amount: number, reason: string) => {
    if (!uid) return;
    const newBal = (await readBalance(uid)) + amount;
    await writeBalance(uid, newBal);
    await appendTxn(uid, { type: 'credit', amount, reason });
    await refresh();
  }, [uid, refresh]);

  const deduct = useCallback(async (amount: number, reason: string): Promise<boolean> => {
    if (!uid) return false;
    const cur = await readBalance(uid);
    if (cur < amount) return false;
    await writeBalance(uid, cur - amount);
    await appendTxn(uid, { type: 'debit', amount, reason });
    await refresh();
    return true;
  }, [uid, refresh]);

  const deductForArtisan = useCallback(async (artisanId: string, amount: number, reason: string) => {
    const cur = await readBalance(artisanId);
    await writeBalance(artisanId, cur - amount);
    await appendTxn(artisanId, { type: 'debit', amount, reason });
    if (artisanId === uid) await refresh();
  }, [uid, refresh]);

  return (
    <TokenContext.Provider value={{ balance, transactions, addTokens, deduct, deductForArtisan }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokens() {
  const ctx = useContext(TokenContext);
  if (!ctx) throw new Error('useTokens must be inside TokenProvider');
  return ctx;
}
