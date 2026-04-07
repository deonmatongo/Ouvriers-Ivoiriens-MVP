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

const DEMO_SEED: Record<string, { balance: number; reasons: string[] }> = {
  'mock-artisan-1': {
    balance: 35,
    reasons: [
      'Achat pack Pro — 50 crédits',
      'Acceptation demande — Réparation tableau électrique',
      'Contact client — Installation prise terrasse',
      'Acceptation demande — Mise aux normes installation',
    ],
  },
};

function seedDemoBalance(userId: string) {
  const seed = DEMO_SEED[userId];
  if (!seed) return;
  const alreadySeeded = localStorage.getItem(`tokens_seeded_${userId}`);
  if (alreadySeeded) return;
  writeBalance(userId, seed.balance);
  const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
  const seedTxns: TokenTransaction[] = [
    { id: 'seed-t1', type: 'credit', amount: 50, reason: seed.reasons[0], created_at: daysAgo(10) },
    { id: 'seed-t2', type: 'debit',  amount: 5,  reason: seed.reasons[1], created_at: daysAgo(8) },
    { id: 'seed-t3', type: 'debit',  amount: 1,  reason: seed.reasons[2], created_at: daysAgo(5) },
    { id: 'seed-t4', type: 'debit',  amount: 5,  reason: seed.reasons[3], created_at: daysAgo(3) },
    { id: 'seed-t5', type: 'credit', amount: 0,  reason: '← Solde de départ: 35 crédits', created_at: daysAgo(10) },
  ];
  localStorage.setItem(txnKey(userId), JSON.stringify(seedTxns));
  localStorage.setItem(`tokens_seeded_${userId}`, '1');
}

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

  const [balance, setBalance] = useState<number>(() => {
    if (!uid) return 0;
    seedDemoBalance(uid);
    return readBalance(uid);
  });
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
