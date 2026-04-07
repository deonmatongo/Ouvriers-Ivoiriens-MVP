import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, MessageSquare, Handshake, CheckCircle, XCircle, Coins, InboxIcon } from 'lucide-react';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { useLang } from '../../context/LangContext';
import { useToast } from '../../components/ui/Toast';
import { useWorkerConversations, useThread, useSendMessage, useAcceptConversation, useDeclineConversation, isAlreadyAccepted } from '../../hooks/useMessages';
import { useAuth } from '../../context/AuthContext';
import { useTokens } from '../../context/TokenContext';
import { Skeleton } from '../../components/ui/Skeleton';
import type { Conversation } from '../../types';

interface PendingContact { id: string; name: string; }

function buildPendingConversation(contact: PendingContact, jobTitle?: string): Conversation {
  const now = new Date().toISOString();
  const rid = `pending-${contact.id}`;
  return {
    request_id: rid,
    conv_status: 'active', // artisan-initiated → active immediately
    user: { id: contact.id, name: contact.name, email: '', phone_verified: false, role: 'client', created_at: now },
    last_message: { id: '', sender_id: '', receiver_id: '', request_id: rid, content: jobTitle ? `Re: ${jobTitle}` : '...', is_read: true, sent_at: now },
    unread_count: 0,
  };
}

// ── Agreement helpers ──────────────────────────────────────────────────────
type AgreementStatus = 'none' | 'proposed' | 'accepted' | 'declined';
function getAgreement(rid: string): AgreementStatus {
  return (localStorage.getItem(`agreement_${rid}`) as AgreementStatus) ?? 'none';
}
function setAgreement(rid: string, status: AgreementStatus) {
  localStorage.setItem(`agreement_${rid}`, status);
}

const ACCEPT_REQUEST_COST = 5; // cost to accept client-initiated inbound request
const ACCEPT_AGREEMENT_COST = 5; // cost to accept formal agreement in chat

export function WorkerMessages() {
  const { t, locale } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const { balance, deduct } = useTokens();

  const pendingContact: PendingContact | undefined = location.state?.pendingContact;
  const jobTitle: string | undefined = location.state?.jobTitle;
  const showAgreementFromNav: boolean = !!location.state?.showAgreement;

  const { data: apiConversations = [], isLoading: convLoading } = useWorkerConversations();
  const acceptConversation = useAcceptConversation();
  const declineConversation = useDeclineConversation();

  // Split conversations: active ones go to "Conversations" tab, pending_acceptance to "Requests" tab
  const pendingContactConv = pendingContact ? [buildPendingConversation(pendingContact, jobTitle)] : [];

  const activeConvs: Conversation[] = [
    ...pendingContactConv,
    ...apiConversations.filter((c) => c.conv_status === 'active'),
  ];
  const requestConvs: Conversation[] = apiConversations.filter(
    (c) => c.conv_status === 'pending_acceptance'
  );

  const [tab, setTab] = useState<'conversations' | 'requests'>(() =>
    // Open on requests tab if there are pending ones and no navigation target
    requestConvs.length > 0 && !pendingContact ? 'requests' : 'conversations'
  );
  const [active, setActive] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [agreementStatus, setAgreementStatus] = useState<AgreementStatus>('none');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isPending = active?.request_id.startsWith('pending-');
  const { data: messages = [], isLoading: msgLoading } = useThread(
    active && !isPending ? active.request_id : ''
  );
  const sendMessage = useSendMessage();

  // Auto-select first active conversation
  useEffect(() => {
    if (activeConvs.length > 0 && !active && tab === 'conversations') {
      setActive(activeConvs[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convLoading, tab]);

  // Sync agreement status when switching conversations
  useEffect(() => {
    if (!active) { setAgreementStatus('none'); return; }
    if (isPending) {
      setAgreementStatus(showAgreementFromNav ? 'proposed' : 'none');
      return;
    }
    setAgreementStatus(getAgreement(active.request_id));
  }, [active, isPending, showAgreementFromNav]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !active) return;
    const content = input.trim();
    setInput('');
    if (isPending) { toast.info('Message ready to send once backend is connected'); return; }
    try {
      await sendMessage.mutateAsync({ receiver_id: active.user.id, request_id: active.request_id, content });
    } catch {
      toast.error('Failed to send message');
      setInput(content);
    }
  };

  // ── Accept inbound request (Rule #2: deducts 5 credits, higher cost) ───────
  const handleAcceptRequest = async (conv: Conversation) => {
    if (acceptingId) return; // prevent double-click
    // Idempotency: already accepted in a previous click
    if (isAlreadyAccepted(conv.request_id)) {
      setTab('conversations');
      setActive(conv);
      return;
    }
    if (balance < ACCEPT_REQUEST_COST) {
      toast.error(locale === 'fr'
        ? `Crédits insuffisants — il faut ${ACCEPT_REQUEST_COST} crédits pour accepter cette demande`
        : `Insufficient credits — need ${ACCEPT_REQUEST_COST} credits to accept this request`
      );
      return;
    }
    const ok = deduct(ACCEPT_REQUEST_COST, `${locale === 'fr' ? 'Acceptation demande inbound' : 'Inbound request accepted'} — ${conv.user.name}`);
    if (!ok) { toast.error(locale === 'fr' ? 'Crédits insuffisants' : 'Insufficient credits'); return; }

    setAcceptingId(conv.request_id);
    try {
      await acceptConversation.mutateAsync(conv.request_id);
      toast.success(locale === 'fr'
        ? `Demande de ${conv.user.name} acceptée — ${ACCEPT_REQUEST_COST} crédits déduits`
        : `${conv.user.name}'s request accepted — ${ACCEPT_REQUEST_COST} credits deducted`
      );
      setTab('conversations');
      setActive({ ...conv, conv_status: 'active' });
    } catch {
      toast.error('Failed to accept request');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDeclineRequest = async (conv: Conversation) => {
    try {
      await declineConversation.mutateAsync(conv.request_id);
      toast.info(locale === 'fr' ? 'Demande refusée — aucun crédit déduit' : 'Request declined — no credits deducted');
    } catch {
      toast.error('Failed to decline request');
    }
  };

  // ── Accept formal agreement in chat (separate from accepting an inbound request) ──
  const handleAcceptAgreement = async () => {
    if (!active) return;
    if (balance < ACCEPT_AGREEMENT_COST) {
      toast.error(locale === 'fr' ? `Crédits insuffisants — il faut ${ACCEPT_AGREEMENT_COST} crédits` : `Insufficient credits — need ${ACCEPT_AGREEMENT_COST} credits`);
      return;
    }
    const ok = deduct(ACCEPT_AGREEMENT_COST, `${locale === 'fr' ? 'Accord accepté' : 'Agreement accepted'} — ${active.user.name}`);
    if (!ok) { toast.error(locale === 'fr' ? 'Crédits insuffisants' : 'Insufficient credits'); return; }
    if (!isPending) setAgreement(active.request_id, 'accepted');
    setAgreementStatus('accepted');
    if (!isPending) {
      try {
        await sendMessage.mutateAsync({
          receiver_id: active.user.id, request_id: active.request_id,
          content: `__SYS__:ACCEPTED:Accord accepté par l'artisan. ${ACCEPT_AGREEMENT_COST} crédits déduits. Le travail peut commencer.`,
        });
      } catch { /* ignore */ }
    }
    toast.success(locale === 'fr' ? `Accord accepté — ${ACCEPT_AGREEMENT_COST} crédits déduits` : `Agreement accepted — ${ACCEPT_AGREEMENT_COST} credits deducted`);
  };

  const handleDeclineAgreement = async () => {
    if (!active) return;
    if (!isPending) setAgreement(active.request_id, 'declined');
    setAgreementStatus('declined');
    if (!isPending) {
      try {
        await sendMessage.mutateAsync({
          receiver_id: active.user.id, request_id: active.request_id,
          content: `__SYS__:DECLINED:L'artisan a refusé l'accord proposé. Aucun crédit déduit.`,
        });
      } catch { /* ignore */ }
    }
    toast.info(locale === 'fr' ? 'Accord refusé — aucun crédit déduit' : 'Agreement declined — no credits deducted');
  };

  // ─── Conversation list item ──────────────────────────────────────────────
  const ConvItem = ({ c }: { c: Conversation }) => (
    <button
      key={c.request_id}
      onClick={() => { setActive(c); setTab('conversations'); }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${active?.request_id === c.request_id ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
    >
      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold flex-shrink-0">
        {c.user.name[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">{c.user.name}</p>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
            {new Date(c.last_message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-gray-500 truncate">{c.last_message.content}</p>
          {c.unread_count > 0 && (
            <span className="ml-2 flex-shrink-0 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {c.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );

  return (
    <WorkerLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('navWorkerMessages')}</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex h-[calc(100vh-200px)]">
        {/* Left panel */}
        <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setTab('conversations')}
              className={`flex-1 py-3 text-xs font-semibold transition-colors ${tab === 'conversations' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {locale === 'fr' ? 'Conversations' : 'Conversations'}
              {activeConvs.length > 0 && (
                <span className="ml-1.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {activeConvs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('requests')}
              className={`flex-1 py-3 text-xs font-semibold transition-colors relative ${tab === 'requests' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {locale === 'fr' ? 'Demandes' : 'Requests'}
              {requestConvs.length > 0 && (
                <span className="ml-1.5 bg-primary-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {requestConvs.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {convLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex gap-3 items-center">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-32" /></div>
                </div>
              ))
            ) : tab === 'conversations' ? (
              activeConvs.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">{t('noConversations')}</div>
              ) : (
                activeConvs.map((c) => <ConvItem key={c.request_id} c={c} />)
              )
            ) : (
              /* Requests tab — pending_acceptance inbound requests */
              requestConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                  <InboxIcon size={24} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">{locale === 'fr' ? 'Aucune demande en attente' : 'No pending requests'}</p>
                </div>
              ) : (
                requestConvs.map((c) => (
                  <div key={c.request_id} className="px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold flex-shrink-0">
                        {c.user.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{c.user.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(c.last_message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {c.unread_count > 0 && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 italic line-clamp-2 mb-3">"{c.last_message.content}"</p>
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 mb-3 flex items-center gap-1.5">
                      <Coins size={11} className="text-amber-600 flex-shrink-0" />
                      <p className="text-xs text-amber-700 font-medium">
                        {locale === 'fr'
                          ? `Accepter déduira ${ACCEPT_REQUEST_COST} crédits (solde: ${balance})`
                          : `Accepting deducts ${ACCEPT_REQUEST_COST} credits (balance: ${balance})`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeclineRequest(c)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-gray-200 text-gray-500 text-xs font-semibold rounded-lg hover:bg-gray-50"
                      >
                        <XCircle size={12} />
                        {locale === 'fr' ? 'Refuser' : 'Decline'}
                      </button>
                      <button
                        onClick={() => handleAcceptRequest(c)}
                        disabled={balance < ACCEPT_REQUEST_COST || acceptingId === c.request_id}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-40"
                      >
                        <CheckCircle size={12} />
                        {acceptingId === c.request_id
                          ? '...'
                          : locale === 'fr' ? `Accepter —${ACCEPT_REQUEST_COST}🪙` : `Accept —${ACCEPT_REQUEST_COST}🪙`}
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Chat area */}
        {tab === 'requests' && !active ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-xs">
              <InboxIcon size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-600 mb-1">
                {locale === 'fr' ? 'Demandes entrantes' : 'Incoming requests'}
              </p>
              <p className="text-sm text-gray-400">
                {locale === 'fr'
                  ? `Acceptez une demande (−${ACCEPT_REQUEST_COST} crédits) pour ouvrir la conversation. Déclinez pour refuser sans frais.`
                  : `Accept a request (−${ACCEPT_REQUEST_COST} credits) to open the conversation. Decline at no cost.`}
              </p>
            </div>
          </div>
        ) : !active ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">{t('noConversationsSub')}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold flex-shrink-0">
                {active.user.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{active.user.name}</p>
                {isPending && jobTitle
                  ? <p className="text-xs text-primary-500">{t('startConversation')} • {jobTitle}</p>
                  : <p className="text-xs text-green-500">{t('online')}</p>
                }
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-lg">
                <Coins size={12} />
                {balance} {locale === 'fr' ? 'crédits' : 'credits'}
              </div>
            </div>

            {/* Agreement banner (for formal in-chat agreements proposed by client) */}
            {agreementStatus === 'proposed' && (
              <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4 flex-shrink-0">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                    <Handshake size={18} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-900">
                      {locale === 'fr' ? `${active.user.name} a proposé un accord formel` : `${active.user.name} proposed a formal agreement`}
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      {locale === 'fr'
                        ? `Accepter déduira ${ACCEPT_AGREEMENT_COST} crédits · Solde: ${balance}`
                        : `Accepting will deduct ${ACCEPT_AGREEMENT_COST} credits · Balance: ${balance}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={handleDeclineAgreement} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50">
                    <XCircle size={13} />{locale === 'fr' ? 'Refuser' : 'Decline'}
                  </button>
                  <button onClick={handleAcceptAgreement} disabled={balance < ACCEPT_AGREEMENT_COST} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-40">
                    <CheckCircle size={13} />{locale === 'fr' ? `Accepter — ${ACCEPT_AGREEMENT_COST} crédits` : `Accept — ${ACCEPT_AGREEMENT_COST} credits`}
                    <span className="bg-primary-500 px-1.5 py-0.5 rounded text-[10px]">🪙</span>
                  </button>
                </div>
              </div>
            )}
            {agreementStatus === 'accepted' && (
              <div className="mx-4 mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex-shrink-0">
                <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
                <p className="text-xs font-semibold text-green-700">
                  {locale === 'fr' ? `Accord accepté · ${ACCEPT_AGREEMENT_COST} crédits déduits` : `Agreement accepted · ${ACCEPT_AGREEMENT_COST} credits deducted`}
                </p>
              </div>
            )}
            {agreementStatus === 'declined' && (
              <div className="mx-4 mt-3 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex-shrink-0">
                <XCircle size={15} className="text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  {locale === 'fr' ? 'Accord refusé — aucun crédit déduit' : 'Agreement declined — no credits deducted'}
                </p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {isPending ? (
                <div className="text-center py-8">
                  <MessageSquare size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">{t('typeFirstMessage')}</p>
                  {showAgreementFromNav && agreementStatus === 'proposed' && (
                    <p className="text-xs text-amber-600 mt-2 font-medium">
                      {locale === 'fr' ? '↑ Répondez à l\'accord ci-dessus avant de commencer.' : '↑ Respond to the agreement above before chatting.'}
                    </p>
                  )}
                </div>
              ) : msgLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
                  </div>
                ))
              ) : (
                messages.map((m) => {
                  if (m.content.startsWith('__SYS__:')) {
                    const text = m.content.replace(/^__SYS__:[A-Z]+:/, '');
                    const isAccepted = m.content.includes(':ACCEPTED:');
                    const isDeclined = m.content.includes(':DECLINED:');
                    return (
                      <div key={m.id} className="flex justify-center my-1">
                        <div className={`text-xs px-4 py-2 rounded-full max-w-sm text-center border ${isAccepted ? 'bg-green-50 border-green-200 text-green-700' : isDeclined ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                          <Handshake size={11} className="inline mr-1.5" />{text}
                        </div>
                      </div>
                    );
                  }
                  const isMe = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                        <p>{m.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                          {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={t('messagePlaceholder')}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sendMessage.isPending}
                className="p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </WorkerLayout>
  );
}
