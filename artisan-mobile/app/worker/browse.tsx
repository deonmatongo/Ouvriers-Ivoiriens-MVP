import { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../context/LangContext';
import { useTokens } from '../../context/TokenContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { colors, spacing, font, radius } from '../../lib/theme';
import { formatCurrency, timeAgo, initials } from '../../lib/utils';

interface ClientJob {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  budget?: number;
  posted_at: string;
  client: { id: string; name: string };
}

const MOCK_JOBS: ClientJob[] = [
  {
    id: 'cj1',
    title: "Réparation fuite d'eau sous évier",
    category: 'Plomberie',
    description: "J'ai une fuite d'eau importante sous mon évier de cuisine. L'eau coule en permanence depuis deux jours.",
    location: 'Cocody, Abidjan',
    budget: 50000,
    posted_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    client: { id: 'cl1', name: 'Marie Ouédraogo' },
  },
  {
    id: 'cj2',
    title: 'Installation tableau électrique',
    category: 'Électricité',
    description: "Besoin d'un tableau électrique neuf pour un appartement de 3 pièces. Travaux à prévoir rapidement.",
    location: 'Plateau, Abidjan',
    budget: 120000,
    posted_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    client: { id: 'cl2', name: 'Jean-Claude Brou' },
  },
  {
    id: 'cj3',
    title: 'Peinture salon + 2 chambres',
    category: 'Peinture',
    description: "Refaire la peinture complète de mon salon et deux chambres. Superficie totale environ 60m².",
    location: 'Marcory, Abidjan',
    posted_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    client: { id: 'cl3', name: 'Aïssatou Diallo' },
  },
  {
    id: 'cj4',
    title: 'Fabrication meuble TV sur mesure',
    category: 'Menuiserie',
    description: 'Meuble TV en bois massif, avec rangements latéraux et niche centrale pour écran 65 pouces.',
    location: 'Yopougon, Abidjan',
    budget: 180000,
    posted_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    client: { id: 'cl4', name: 'Koffi Yao' },
  },
  {
    id: 'cj5',
    title: 'Installation de climatiseur',
    category: 'Climatisation',
    description: "Installation d'un split system 1.5 CV dans la chambre principale. L'appareil est déjà acheté.",
    location: 'Cocody, Abidjan',
    budget: 60000,
    posted_at: new Date(Date.now() - 36 * 3600000).toISOString(),
    client: { id: 'cl5', name: 'Fatou Camara' },
  },
  {
    id: 'cj6',
    title: 'Carrelage salle de bain',
    category: 'Maçonnerie',
    description: 'Dépose et pose de carrelage pour salle de bain 8m². Fourniture carrelage à la charge du client.',
    location: 'Abobo, Abidjan',
    budget: 95000,
    posted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    client: { id: 'cl6', name: 'Ibrahim Coulibaly' },
  },
  {
    id: 'cj7',
    title: 'Soudure portail métallique',
    category: 'Soudure',
    description: 'Réparation et renforcement d\'un portail métallique de 3m de large. Quelques barreaux à ressouder.',
    location: 'Attécoubé, Abidjan',
    posted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    client: { id: 'cl7', name: 'Kouamé Assié' },
  },
  {
    id: 'cj8',
    title: 'Remplacement robinetterie cuisine',
    category: 'Plomberie',
    description: 'Remplacement de la robinetterie de la cuisine et du lave-mains. Matériel fourni par le client.',
    location: 'Treichville, Abidjan',
    budget: 35000,
    posted_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    client: { id: 'cl8', name: 'Adjoua Koné' },
  },
];

const ALL_CATEGORIES = ['Toutes', 'Plomberie', 'Électricité', 'Menuiserie', 'Peinture', 'Maçonnerie', 'Climatisation', 'Soudure'];

function JobCard({ job, onContact }: { job: ClientJob; onContact: () => void }) {
  const { t, locale } = useLang();

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
          <Badge label={job.category} variant="primary" />
        </View>
        <Text style={styles.jobDescription} numberOfLines={2}>{job.description}</Text>
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>{job.location}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>{timeAgo(job.posted_at, locale)}</Text>
        </View>
        {job.budget && (
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={13} color={colors.primary} />
            <Text style={[styles.metaText, styles.budgetText]}>{formatCurrency(job.budget)}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.clientRow}>
          <View style={styles.clientAvatar}>
            <Text style={styles.clientAvatarText}>{initials(job.client.name)}</Text>
          </View>
          <Text style={styles.clientName}>{job.client.name}</Text>
        </View>
        <TouchableOpacity style={styles.contactBtn} onPress={onContact} activeOpacity={0.8}>
          <Text style={styles.contactBtnText}>{t('contactClient')}</Text>
          <Text style={styles.coinLabel}> 🪙1</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function WorkerBrowse() {
  const { t, locale } = useLang();
  const { balance, deduct } = useTokens();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  const filtered = useMemo(() => {
    return MOCK_JOBS.filter((j) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.category.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q);
      const matchCat = selectedCategory === 'Toutes' || j.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory]);

  const handleContact = async (job: ClientJob) => {
    if (balance < 1) {
      Alert.alert(
        t('insufficientCredits'),
        t('insufficientCreditsSub'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('buyCreditsNow'), onPress: () => router.push('/worker/credits') },
        ]
      );
      return;
    }
    const reason = `Contacter client pour: ${job.title}`;
    const ok = await deduct(1, reason);
    if (ok) {
      router.push({
        pathname: '/worker/messages',
        params: { clientId: job.client.id, clientName: job.client.name, jobTitle: job.title },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>{t('browseJobsTitle')}</Text>
            <Text style={styles.headerSub}>{t('browseJobsSub')}</Text>
          </View>
          <View style={styles.balanceChip}>
            <Text style={styles.balanceIcon}>🪙</Text>
            <Text style={styles.balanceText}>{balance}</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.categoryBar}>
        <FlatList
          data={ALL_CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === item && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(item)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.categoryChipText, selectedCategory === item && styles.categoryChipTextActive]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(j) => j.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <JobCard job={item} onContact={() => handleContact(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>Aucune offre trouvée</Text>
            <Text style={styles.emptySub}>Modifiez votre recherche ou catégorie.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: font.sm, color: colors.textMuted },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  balanceIcon: { fontSize: 14 },
  balanceText: { fontSize: 14, fontWeight: '800', color: colors.primaryText },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },

  categoryBar: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryList: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  categoryChipTextActive: { color: '#fff' },

  list: { padding: spacing.md, gap: spacing.sm },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardTop: { padding: spacing.md, gap: spacing.sm },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  jobTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  jobDescription: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },

  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textMuted },
  budgetText: { color: colors.primary, fontWeight: '600' },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.bg,
  },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  clientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientAvatarText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  clientName: { fontSize: 13, fontWeight: '600', color: colors.text },

  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  contactBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  coinLabel: { fontSize: 13 },

  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.sm },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
