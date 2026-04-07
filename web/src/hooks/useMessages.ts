import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Conversation, ConvStatus, Message } from '../types';

// ─── Conv-status localStorage store ──────────────────────────────────────────
// Persists conversation status (active / pending_acceptance) across navigations.
// Artisan acceptance updates this store, so both panels reflect the change.

function convStatusKey(rid: string) { return `conv_status_${rid}`; }
function convAcceptedKey(rid: string) { return `conv_accepted_${rid}`; }

export function getConvStatus(rid: string, defaultStatus: ConvStatus = 'active'): ConvStatus {
  return (localStorage.getItem(convStatusKey(rid)) as ConvStatus) ?? defaultStatus;
}
function persistConvStatus(rid: string, status: ConvStatus) {
  localStorage.setItem(convStatusKey(rid), status);
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();
const minsAgo = (n: number) => new Date(Date.now() - n * 60000).toISOString();
const hoursAgo = (n: number) => new Date(Date.now() - n * 3600000).toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

// ── Client-side conversations ────────────────────────────────────────────────
// 'req-pending-1' is a client-initiated inbound request awaiting artisan acceptance.
// The artisan hasn't responded yet, so the client sees a locked input with a notice.
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    request_id: 'job1',
    conv_status: 'active',
    user: { id: 'a2', name: 'Fatou Plomberie', email: 'fatou@test.com', phone_verified: true, role: 'artisan', created_at: daysAgo(200) },
    last_message: { id: 'msg-l1', sender_id: 'a2', receiver_id: 'mock-client-1', request_id: 'job1', content: 'Je serai disponible demain matin à 9h, ça vous convient ?', is_read: false, sent_at: minsAgo(22) },
    unread_count: 2,
  },
  {
    request_id: 'job5',
    conv_status: 'active',
    user: { id: 'a6', name: 'Ama Climatisation', email: 'ama@test.com', phone_verified: true, role: 'artisan', created_at: daysAgo(300) },
    last_message: { id: 'msg-l2', sender_id: 'mock-client-1', receiver_id: 'a6', request_id: 'job5', content: 'Merci, le rendez-vous est confirmé pour vendredi.', is_read: true, sent_at: hoursAgo(3) },
    unread_count: 0,
  },
  {
    request_id: 'job3',
    conv_status: 'active',
    user: { id: 'a4', name: 'Adjoua Peinture', email: 'adjoua@test.com', phone_verified: true, role: 'artisan', created_at: daysAgo(180) },
    last_message: { id: 'msg-l3', sender_id: 'a4', receiver_id: 'mock-client-1', request_id: 'job3', content: 'Travail terminé, j\'espère que vous êtes satisfaite !', is_read: true, sent_at: daysAgo(5) },
    unread_count: 0,
  },
  // ↓ Client-initiated inbound request — awaiting artisan acceptance (locked input)
  {
    request_id: 'req-pending-1',
    conv_status: 'pending_acceptance',
    user: { id: 'mock-artisan-1', name: 'Konan Électricité', email: 'artisan@test.com', phone_verified: true, role: 'artisan', created_at: daysAgo(365) },
    last_message: { id: 'rp-msg1', sender_id: 'mock-client-1', receiver_id: 'mock-artisan-1', request_id: 'req-pending-1', content: 'Bonjour, j\'ai besoin d\'une intervention urgente pour mon tableau électrique.', is_read: false, sent_at: minsAgo(10) },
    unread_count: 0,
  },
];

// ── Artisan-side conversations ───────────────────────────────────────────────
// 'req-pending-1' appears in the artisan's "Requests" tab until they accept.
const MOCK_WORKER_CONVERSATIONS: Conversation[] = [
  {
    request_id: 'req-w1',
    conv_status: 'active',
    user: { id: 'mock-client-1', name: 'Marie Ouédraogo', email: 'client@test.com', phone_verified: true, role: 'client', created_at: daysAgo(60) },
    last_message: { id: 'msg-wl1', sender_id: 'mock-client-1', receiver_id: 'mock-artisan-1', request_id: 'req-w1', content: 'Bonjour, quand pouvez-vous venir voir le tableau ?', is_read: false, sent_at: minsAgo(45) },
    unread_count: 3,
  },
  {
    request_id: 'req-w2',
    conv_status: 'active',
    user: { id: 'c2', name: 'Yao Thierry', email: 'yao@test.com', phone_verified: true, role: 'client', created_at: daysAgo(30) },
    last_message: { id: 'msg-wl2', sender_id: 'mock-artisan-1', receiver_id: 'c2', request_id: 'req-w2', content: 'Très bien, je confirme le rendez-vous jeudi à 10h.', is_read: true, sent_at: hoursAgo(6) },
    unread_count: 0,
  },
  {
    request_id: 'req-w3',
    conv_status: 'active',
    user: { id: 'c4', name: 'Koffi Brice', email: 'koffi@test.com', phone_verified: false, role: 'client', created_at: daysAgo(90) },
    last_message: { id: 'msg-wl3', sender_id: 'c4', receiver_id: 'mock-artisan-1', request_id: 'req-w3', content: 'Merci beaucoup, excellent travail !', is_read: true, sent_at: daysAgo(2) },
    unread_count: 0,
  },
  // ↓ New inbound request from a client — pending artisan acceptance (5 credits to accept)
  {
    request_id: 'req-pending-1',
    conv_status: 'pending_acceptance',
    user: { id: 'c-new-1', name: 'Awa Traoré', email: 'awa@test.com', phone_verified: true, role: 'client', created_at: daysAgo(5) },
    last_message: { id: 'rp-msg1', sender_id: 'c-new-1', receiver_id: 'mock-artisan-1', request_id: 'req-pending-1', content: 'Bonjour, j\'ai besoin d\'une intervention urgente pour mon tableau électrique.', is_read: false, sent_at: minsAgo(10) },
    unread_count: 1,
  },
];

const MOCK_THREADS: Record<string, Message[]> = {
  'job1': [
    { id: 'm1', sender_id: 'mock-client-1', receiver_id: 'a2', request_id: 'job1', content: 'Bonjour, j\'ai une fuite sous le lavabo depuis 3 jours. Pouvez-vous venir cette semaine ?', is_read: true, sent_at: daysAgo(2) },
    { id: 'm2', sender_id: 'a2', receiver_id: 'mock-client-1', request_id: 'job1', content: 'Bonjour ! Oui, je suis disponible. Quelle est votre adresse exacte et à quel étage ?', is_read: true, sent_at: daysAgo(2) },
    { id: 'm3', sender_id: 'mock-client-1', receiver_id: 'a2', request_id: 'job1', content: 'Cocody, rue des Jardins, résidence les Flamboyants, appartement 4B au 2ème étage.', is_read: true, sent_at: daysAgo(1) },
    { id: 'm4', sender_id: 'a2', receiver_id: 'mock-client-1', request_id: 'job1', content: 'Parfait, je peux passer demain entre 9h et 11h. Tarif constaté + devis sur place.', is_read: true, sent_at: daysAgo(1) },
    { id: 'm5', sender_id: 'mock-client-1', receiver_id: 'a2', request_id: 'job1', content: 'Super, 9h c\'est parfait pour moi.', is_read: true, sent_at: minsAgo(50) },
    { id: 'm6', sender_id: 'a2', receiver_id: 'mock-client-1', request_id: 'job1', content: 'Je serai disponible demain matin à 9h, ça vous convient ?', is_read: false, sent_at: minsAgo(22) },
  ],
  'job5': [
    { id: 'm7', sender_id: 'mock-client-1', receiver_id: 'a6', request_id: 'job5', content: 'Bonjour Ama, votre devis pour l\'installation du climatiseur m\'intéresse.', is_read: true, sent_at: daysAgo(4) },
    { id: 'm8', sender_id: 'a6', receiver_id: 'mock-client-1', request_id: 'job5', content: 'Bonjour ! Oui, ce tarif comprend la pose, les câbles et la mise en service.', is_read: true, sent_at: daysAgo(4) },
    { id: 'm9', sender_id: 'mock-client-1', receiver_id: 'a6', request_id: 'job5', content: 'D\'accord, quand seriez-vous disponible ?', is_read: true, sent_at: daysAgo(3) },
    { id: 'm10', sender_id: 'a6', receiver_id: 'mock-client-1', request_id: 'job5', content: 'Je suis libre vendredi matin. Ça vous convient ?', is_read: true, sent_at: daysAgo(3) },
    { id: 'm11', sender_id: 'mock-client-1', receiver_id: 'a6', request_id: 'job5', content: 'Merci, le rendez-vous est confirmé pour vendredi.', is_read: true, sent_at: hoursAgo(3) },
  ],
  'job3': [
    { id: 'm12', sender_id: 'mock-client-1', receiver_id: 'a4', request_id: 'job3', content: 'Bonjour, la peinture est terminée, je suis très contente du résultat !', is_read: true, sent_at: daysAgo(6) },
    { id: 'm13', sender_id: 'a4', receiver_id: 'mock-client-1', request_id: 'job3', content: 'Merci, c\'est gentil ! N\'hésitez pas à me recommander.', is_read: true, sent_at: daysAgo(5) },
    { id: 'm14', sender_id: 'a4', receiver_id: 'mock-client-1', request_id: 'job3', content: 'Travail terminé, j\'espère que vous êtes satisfaite !', is_read: true, sent_at: daysAgo(5) },
  ],
  // Pending request — only 1 message (client's initial contact)
  'req-pending-1': [
    { id: 'rp-msg1', sender_id: 'c-new-1', receiver_id: 'mock-artisan-1', request_id: 'req-pending-1', content: 'Bonjour, j\'ai besoin d\'une intervention urgente pour mon tableau électrique qui disjoncte souvent.', is_read: false, sent_at: minsAgo(10) },
  ],
  'req-w1': [
    { id: 'wm1', sender_id: 'mock-client-1', receiver_id: 'mock-artisan-1', request_id: 'req-w1', content: 'Bonjour, j\'ai vu votre profil et j\'aurais besoin de vous pour mon tableau électrique.', is_read: true, sent_at: hoursAgo(5) },
    { id: 'wm2', sender_id: 'mock-artisan-1', receiver_id: 'mock-client-1', request_id: 'req-w1', content: 'Bonjour Marie ! Oui je suis disponible. Quel est le problème exactement ?', is_read: true, sent_at: hoursAgo(4) },
    { id: 'wm3', sender_id: 'mock-client-1', receiver_id: 'mock-artisan-1', request_id: 'req-w1', content: 'Le tableau disjoncte souvent, surtout quand j\'utilise le four et le micro-onde en même temps.', is_read: true, sent_at: hoursAgo(3) },
    { id: 'wm4', sender_id: 'mock-client-1', receiver_id: 'mock-artisan-1', request_id: 'req-w1', content: 'Bonjour, quand pouvez-vous venir voir le tableau ?', is_read: false, sent_at: minsAgo(45) },
  ],
  'req-w2': [
    { id: 'wm5', sender_id: 'c2', receiver_id: 'mock-artisan-1', request_id: 'req-w2', content: 'Bonjour, j\'ai besoin d\'une prise étanche pour ma terrasse.', is_read: true, sent_at: daysAgo(1) },
    { id: 'wm6', sender_id: 'mock-artisan-1', receiver_id: 'c2', request_id: 'req-w2', content: 'Bonjour ! Oui c\'est faisable. Quelle est la distance depuis le tableau ?', is_read: true, sent_at: daysAgo(1) },
    { id: 'wm7', sender_id: 'mock-artisan-1', receiver_id: 'c2', request_id: 'req-w2', content: 'Très bien, je confirme le rendez-vous jeudi à 10h.', is_read: true, sent_at: hoursAgo(6) },
  ],
};

// In-memory message store for sent messages (persists within session)
let liveThreads: Record<string, Message[]> = { ...MOCK_THREADS };

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    // Read conv_status from localStorage so acceptance is reflected immediately
    queryFn: async (): Promise<Conversation[]> =>
      MOCK_CONVERSATIONS.map((c) => ({
        ...c,
        conv_status: getConvStatus(c.request_id, c.conv_status),
      })),
    staleTime: 0,
  });
}

export function useWorkerConversations() {
  return useQuery({
    queryKey: ['worker-conversations'],
    queryFn: async (): Promise<Conversation[]> =>
      MOCK_WORKER_CONVERSATIONS.map((c) => ({
        ...c,
        conv_status: getConvStatus(c.request_id, c.conv_status),
      })),
    staleTime: 0,
  });
}

export function useThread(requestId: string) {
  return useQuery({
    queryKey: ['messages', requestId],
    queryFn: async (): Promise<Message[]> => liveThreads[requestId] ?? [],
    enabled: !!requestId,
    staleTime: 0,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { receiver_id: string; request_id: string; content: string }): Promise<Message> => {
      await new Promise((r) => setTimeout(r, 300));
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const msg: Message = {
        id: `msg-${Date.now()}`,
        sender_id: storedUser.id ?? 'mock-client-1',
        receiver_id: payload.receiver_id,
        request_id: payload.request_id,
        content: payload.content,
        is_read: false,
        sent_at: now(),
      };
      liveThreads = {
        ...liveThreads,
        [payload.request_id]: [...(liveThreads[payload.request_id] ?? []), msg],
      };
      return msg;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['messages', variables.request_id] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// ── Artisan accepts an inbound client request (deducts 5 credits) ─────────────
// Idempotent: second call checks localStorage flag and skips deduction.
export function useAcceptConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string): Promise<string> => {
      await new Promise((r) => setTimeout(r, 400));
      persistConvStatus(requestId, 'active');
      // Mark as accepted for idempotency (prevents double-deduction on retry)
      localStorage.setItem(convAcceptedKey(requestId), '1');
      return requestId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      qc.invalidateQueries({ queryKey: ['worker-conversations'] });
    },
  });
}

export function useDeclineConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string): Promise<string> => {
      await new Promise((r) => setTimeout(r, 300));
      persistConvStatus(requestId, 'active'); // store 'declined' so UI can clean it up
      // We reuse 'active' here because we just remove from the requests list
      // In a real backend, you'd have a 'declined' status
      localStorage.setItem(convStatusKey(requestId), 'declined');
      return requestId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['worker-conversations'] });
    },
  });
}

// Exported for idempotency check in BrowseJobs
export function isAlreadyAccepted(requestId: string): boolean {
  return !!localStorage.getItem(convAcceptedKey(requestId));
}
