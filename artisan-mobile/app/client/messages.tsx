import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, font, radius } from '../../lib/theme';
import { initials } from '../../lib/utils';

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  timestamp: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  unread: number;
  messages: Message[];
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    name: 'Fatou Plomberie',
    lastMessage: 'Je serai disponible demain matin...',
    unread: 2,
    messages: [
      { id: 'm1', text: "Bonjour, j'ai besoin d'une réparation urgente.", fromMe: true, timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'm2', text: "Bonjour ! Je peux passer demain matin, ça vous convient ?", fromMe: false, timestamp: new Date(Date.now() - 3500000).toISOString() },
      { id: 'm3', text: "Oui, 9h c'est parfait.", fromMe: true, timestamp: new Date(Date.now() - 3400000).toISOString() },
      { id: 'm4', text: "Je serai disponible demain matin, pas de souci.", fromMe: false, timestamp: new Date(Date.now() - 1800000).toISOString() },
      { id: 'm5', text: "Quel est votre adresse exacte ?", fromMe: false, timestamp: new Date(Date.now() - 900000).toISOString() },
    ],
  },
  {
    id: 'c2',
    name: 'Konan Électricité',
    lastMessage: "Bonjour, j'ai bien reçu votre demande...",
    unread: 0,
    messages: [
      { id: 'm1', text: "Bonjour, j'ai besoin d'une installation électrique.", fromMe: true, timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: 'm2', text: "Bonjour, j'ai bien reçu votre demande. Je vous fais un devis rapidement.", fromMe: false, timestamp: new Date(Date.now() - 7000000).toISOString() },
      { id: 'm3', text: "Merci beaucoup !", fromMe: true, timestamp: new Date(Date.now() - 6800000).toISOString() },
    ],
  },
];

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-CI', { hour: '2-digit', minute: '2-digit' });
}

export default function ClientMessages() {
  const { t } = useLang();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ artisanId?: string; artisanName?: string }>();

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (params.artisanId && params.artisanName) {
      const exists = MOCK_CONVERSATIONS.find((c) => c.id === params.artisanId);
      if (!exists) {
        const newConv: Conversation = {
          id: params.artisanId,
          name: params.artisanName,
          lastMessage: '',
          unread: 0,
          messages: [],
        };
        return [newConv, ...MOCK_CONVERSATIONS];
      }
    }
    return MOCK_CONVERSATIONS;
  });

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (params.artisanId) return params.artisanId;
    return null;
  });

  const [inputText, setInputText] = useState('');
  const flatRef = useRef<FlatList>(null);

  const selectedConv = conversations.find((c) => c.id === selectedId) ?? null;

  const handleSelectConv = (conv: Conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
    );
    setSelectedId(conv.id);
  };

  const handleSend = () => {
    if (!inputText.trim() || !selectedId) return;
    const newMsg: Message = {
      id: Math.random().toString(36),
      text: inputText.trim(),
      fromMe: true,
      timestamp: new Date().toISOString(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.text }
          : c
      )
    );
    setInputText('');
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => {
    if (selectedConv && selectedConv.messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [selectedId]);

  if (selectedConv) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedId(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.chatAvatarCircle}>
            <Text style={styles.chatAvatarText}>{initials(selectedConv.name)}</Text>
          </View>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>{selectedConv.name}</Text>
            <Text style={styles.chatHeaderSub}>{t('online')}</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <FlatList
            ref={flatRef}
            data={selectedConv.messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.messageList}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.fromMe ? styles.bubbleMe : styles.bubbleThem]}>
                <Text style={[styles.bubbleText, item.fromMe && styles.bubbleTextMe]}>
                  {item.text}
                </Text>
                <Text style={[styles.bubbleTime, item.fromMe && styles.bubbleTimeMe]}>
                  {formatTime(item.timestamp)}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatText}>{t('typeFirstMessage')}</Text>
              </View>
            }
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.messageInput}
              placeholder={t('messagePlaceholder')}
              placeholderTextColor={colors.textLight}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.7}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('messagesTitle')}</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-outline" size={56} color={colors.border} />
          <Text style={styles.emptyTitle}>{t('noConversations')}</Text>
          <Text style={styles.emptySub}>{t('startConversation')}</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.convList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.convRow}
              onPress={() => handleSelectConv(item)}
              activeOpacity={0.7}
            >
              <View style={styles.convAvatar}>
                <Text style={styles.convAvatarText}>{initials(item.name)}</Text>
              </View>
              <View style={styles.convInfo}>
                <Text style={styles.convName}>{item.name}</Text>
                <Text style={styles.convLast} numberOfLines={1}>{item.lastMessage || t('typeFirstMessage')}</Text>
              </View>
              {item.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: font.xl, fontWeight: '800', color: colors.text },

  convList: { paddingVertical: spacing.sm },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  convAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convAvatarText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  convInfo: { flex: 1 },
  convName: { fontSize: 15, fontWeight: '700', color: colors.text },
  convLast: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textMuted },

  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backBtn: { padding: 4 },
  chatAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  chatHeaderInfo: { flex: 1 },
  chatHeaderName: { fontSize: 15, fontWeight: '700', color: colors.text },
  chatHeaderSub: { fontSize: 12, color: colors.success },

  messageList: { padding: spacing.md, gap: spacing.sm },
  bubble: {
    maxWidth: '80%',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  bubbleText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  bubbleTextMe: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: colors.textMuted, alignSelf: 'flex-end' },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.7)' },

  emptyChat: { alignItems: 'center', marginTop: 60 },
  emptyChatText: { fontSize: 14, color: colors.textMuted, fontStyle: 'italic' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.border },
});
