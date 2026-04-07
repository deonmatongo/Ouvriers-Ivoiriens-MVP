import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, MessageSquare, Handshake, Clock, CheckCircle2, Lock } from 'lucide-react';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { useLang } from '../../context/LangContext';
import { useToast } from '../../components/ui/Toast';
import { useConversations, useThread, useSendMessage } from '../../hooks/useMessages';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Conversation, ConvStatus } from '../../types';

interface PendingContact { id: string; name: string; }

function buildPending(c: PendingContact, convStatus: ConvStatus = 'pending_acceptance'): Conversation {
  const now = new Date().toISOString();
  return {
    request_id: `pending-${c.id}`,
    conv_status: convStatus,
    user: { id: c.id, name: c.name, email: '', phone_verified: false, role: 'artisan', created_at: now },
    last_message: { id: '', sender_id: '', receiver_id: '', request_id: `pending-${c.id}`, content: '...', is_read: true, sent_at: now },
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

export function Messages() {
  const { t, locale } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();

  const pendingContact: PendingContact | undefined = location.state?.pendingContact;
  // When navigating from BrowseArtisans, convStatus tells us whether this is
  // pending_acceptance (client-initiated) or active (artisan-initiated).
  const navConvStatus: ConvStatus = location.state?.convStatus ?? 'pending_acceptance';

  const { data: apiConversations = [], isLoading: convLoading } = useConversations();
  const allConversations: Conversation[] = pendingContact
    ? [buildPending(pendingContact, navConvStatus), ...apiConversations]
    : apiConversations;

  const [active, setActive] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [agreementStatus, setAgreementStatus] = useState<AgreementStatus>('none');
  const bottomRef = useRef<HTMLDivElement>(null);

  const isPendingNav = active?.request_id.startsWith('pending-');
  // A conversation is "locked" (pending artisan acceptance) if:
  //   • it's a real conv with conv_status = pending_acceptance, OR
  //   • it's a nav-created conv with navConvStatus = pending_acceptance
  const isLocked = active?.conv_status === 'pending_acceptance';

  const { data: messages = [], isLoading: msgLoading } = useThread(
    isPendingNav ? '' : (active?.request_id ?? '')
  );
  const sendMessage = useSendMessage();

  // Auto-select first conversation
  useEffect(() => {
    if (allConversations.length > 0 && !active) setActive(allConversations[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convLoading]);

  // Sync agreement status when switching conversations
  useEffect(() => {
    if (!active || isPendingNav || isLocked) { setAgreementStatus('none'); return; }
    setAgreementStatus(getAgreement(active.request_id));
  }, [active, isPendingNav, isLocked]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !active || isLocked) return;
    const content = input.trim();
    setInput('');
    if (isPendingNav) { toast.info('Message ready to send once backend is connected'); return; }
    try {
      await sendMessage.mutateAsync({ receiver_id: active.user.id, request_id: active.request_id, content });
    } catch {
      toast.error('Failed to send message');
      setInput(content);
    }
  };

  const handleProposeAgreement = async () => {
    if (!active || isPendingNav || isLocked || agreementStatus !== 'none') return;
    setAgreement(active.request_id, 'proposed');
    setAgreementStatus('proposed');
    try {
      await sendMessage.mutateAsync({
        receiver_id: active.user.id, request_id: active.request_id,
        content: `__SYS__:PROPOSAL:${user?.name ?? 'Le client'} a proposé un accord formel de travail. L'artisan doit accepter pour confirmer (−5 crédits).`,
      });
    } catch { /* ignore */ }
    toast.success(locale === 'fr' ? 'Accord proposé — en attente de confirmation' : 'Agreement proposed — awaiting confirmation');
  };

  return (
    <CustomerLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('messagesTitle')}</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex h-[calc(100vh-200px)]">
        {/* Conversation list */}
        <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <input
              placeholder={t('searchPlaceholder')}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {convLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex gap-3 items-center">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-32" /></div>
                </div>
              ))
            ) : allConversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">{t('noConversations')}</div>
            ) : (
              allConversations.map((c) => (
                <button
                  key={c.request_id}
                  onClick={() => setActive(c)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${active?.request_id === c.request_id ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold flex-shrink-0">
                      {c.user.name[0]?.toUpperCase()}
                    </div>
                    {c.conv_status === 'pending_acceptance' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                        <Clock size={9} className="text-white" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.user.name}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {new Date(c.last_message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-gray-500 truncate">
                        {c.conv_status === 'pending_acceptance'
                          ? (locale === 'fr' ? '⏳ En attente d\'acceptation' : '⏳ Awaiting acceptance')
                          : c.last_message.content}
                      </p>
                      {c.unread_count > 0 && (
                        <span className="ml-2 flex-shrink-0 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        {!active ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon={MessageSquare} title={t('noConversations')} description={t('noConversationsSub')} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold flex-shrink-0">
                {active.user.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{active.user.name}</p>
                {isLocked
                  ? <p className="text-xs text-amber-500 flex items-center gap-1"><Clock size={10} />{locale === 'fr' ? 'En attente de réponse' : 'Awaiting response'}</p>
                  : isPendingNav
                    ? <p className="text-xs text-primary-500">{t('startConversation')}</p>
                    : <p className="text-xs text-green-500">{t('online')}</p>
                }
              </div>

              {/* Agreement action — only for active non-locked conversations */}
              {!isPendingNav && !isLocked && (
                <div className="flex-shrink-0">
                  {agreementStatus === 'none' && (
                    <button onClick={handleProposeAgreement} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                      <Handshake size={13} />{locale === 'fr' ? 'Proposer un accord' : 'Propose Agreement'}
                    </button>
                  )}
                  {agreementStatus === 'proposed' && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                      <Clock size={12} />{locale === 'fr' ? 'Accord en attente...' : 'Awaiting response...'}
                    </span>
                  )}
                  {agreementStatus === 'accepted' && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                      <CheckCircle2 size={12} />{locale === 'fr' ? 'Accord confirmé ✓' : 'Agreement confirmed ✓'}
                    </span>
                  )}
                  {agreementStatus === 'declined' && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                      {locale === 'fr' ? 'Accord refusé' : 'Agreement declined'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Pending acceptance notice — replaces chat content when locked */}
            {isLocked && (
              <div className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex-shrink-0">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Clock size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      {locale === 'fr' ? 'Demande envoyée' : 'Request sent'}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {locale === 'fr'
                        ? 'Votre demande a été envoyée à l\'artisan. Une fois qu\'il l\'accepte, vous pourrez continuer la conversation.'
                        : 'Your request has been sent to the artisan. Once they accept, you\'ll be able to continue the conversation.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {isPendingNav && !isLocked ? (
                <div className="text-center py-8">
                  <MessageSquare size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">{t('typeFirstMessage')}</p>
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

            {/* Input — locked when awaiting artisan acceptance */}
            {isLocked ? (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg">
                  <Lock size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-400">
                    {locale === 'fr' ? 'Conversation verrouillée — en attente d\'acceptation' : 'Conversation locked — awaiting artisan acceptance'}
                  </span>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
