import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../context/LangContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { colors, spacing, font, radius } from '../../lib/theme';
import { initials } from '../../lib/utils';

interface Artisan {
  id: string;
  name: string;
  category: string;
  location: string;
  hourly_rate: number;
  rating: number;
  review_count: number;
  experience_years: number;
  bio: string;
  skills: string[];
  available: boolean;
}

const MOCK_ARTISANS: Artisan[] = [
  {
    id: 'a1',
    name: 'Konan Électricité',
    category: 'Électricité',
    location: 'Cocody, Abidjan',
    hourly_rate: 4500,
    rating: 4.8,
    review_count: 47,
    experience_years: 8,
    bio: 'Électricien certifié avec 8 ans d\'expérience dans l\'installation et la réparation électrique.',
    skills: ['Installation', 'Dépannage', 'Tableau électrique'],
    available: true,
  },
  {
    id: 'a2',
    name: 'Fatou Plomberie',
    category: 'Plomberie',
    location: 'Plateau, Abidjan',
    hourly_rate: 3800,
    rating: 4.6,
    review_count: 32,
    experience_years: 5,
    bio: 'Plombière expérimentée, spécialiste des fuites et installations sanitaires.',
    skills: ['Fuites', 'Robinetterie', 'Canalisations'],
    available: true,
  },
  {
    id: 'a3',
    name: 'Ibrahim Menuiserie',
    category: 'Menuiserie',
    location: 'Yopougon, Abidjan',
    hourly_rate: 5000,
    rating: 4.9,
    review_count: 68,
    experience_years: 12,
    bio: 'Maître menuisier, fabrication de meubles sur mesure et pose de parquet.',
    skills: ['Meubles sur mesure', 'Parquet', 'Portes'],
    available: false,
  },
  {
    id: 'a4',
    name: 'Adjoua Peinture',
    category: 'Peinture',
    location: 'Marcory, Abidjan',
    hourly_rate: 3500,
    rating: 4.5,
    review_count: 21,
    experience_years: 4,
    bio: 'Peintre intérieur/extérieur, finitions soignées et délais respectés.',
    skills: ['Peinture intérieure', 'Décoration', 'Enduit'],
    available: true,
  },
  {
    id: 'a5',
    name: 'Kouassi Maçonnerie',
    category: 'Maçonnerie',
    location: 'Abobo, Abidjan',
    hourly_rate: 6000,
    rating: 4.7,
    review_count: 53,
    experience_years: 15,
    bio: 'Maçon chevronné, construction, rénovation et carrelage toutes surfaces.',
    skills: ['Construction', 'Carrelage', 'Rénovation'],
    available: true,
  },
  {
    id: 'a6',
    name: 'Ama Climatisation',
    category: 'Climatisation',
    location: 'Cocody, Abidjan',
    hourly_rate: 8000,
    rating: 4.8,
    review_count: 29,
    experience_years: 6,
    bio: 'Technicienne climatisation certifiée, installation et entretien de tous systèmes.',
    skills: ['Installation', 'Entretien', 'Dépannage'],
    available: true,
  },
];

const ALL_CATEGORIES = ['Toutes', 'Électricité', 'Plomberie', 'Menuiserie', 'Peinture', 'Maçonnerie', 'Climatisation'];

function ArtisanCard({ artisan, onContact }: { artisan: Artisan; onContact: () => void }) {
  const { t, locale } = useLang();

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials(artisan.name)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.artisanName}>{artisan.name}</Text>
          <Text style={styles.artisanCategory}>{artisan.category}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={colors.warning} />
            <Text style={styles.ratingText}>{artisan.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({artisan.review_count} {t('reviewsLabel')})</Text>
          </View>
        </View>
        <Badge
          label={artisan.available ? t('available') : t('unavailable')}
          variant={artisan.available ? 'success' : 'default'}
        />
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>{artisan.location}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>{artisan.experience_years} {t('experienceLabel')}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.rate}>{artisan.hourly_rate.toLocaleString('fr-CI')} FCFA<Text style={styles.perHour}>{t('perHour')}</Text></Text>
        </View>
        <Button
          label={t('contactArtisan')}
          onPress={onContact}
          size="sm"
          disabled={!artisan.available}
        />
      </View>
    </View>
  );
}

export default function ClientBrowse() {
  const { t } = useLang();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  const filtered = useMemo(() => {
    return MOCK_ARTISANS.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q);
      const matchCategory =
        selectedCategory === 'Toutes' || a.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

  const handleContact = (artisan: Artisan) => {
    router.push({
      pathname: '/client/messages',
      params: { artisanId: artisan.id, artisanName: artisan.name },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('browseArtisansTitle')}</Text>
        <Text style={styles.headerSub}>{t('browseArtisansSub')}</Text>

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
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === item && styles.categoryChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ArtisanCard artisan={item} onContact={() => handleContact(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="person-outline" size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>Aucun artisan trouvé</Text>
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
  headerTitle: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: font.sm, color: colors.textMuted },
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
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cardInfo: { flex: 1 },
  artisanName: { fontSize: 15, fontWeight: '700', color: colors.text },
  artisanCategory: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  ratingText: { fontSize: 13, fontWeight: '700', color: colors.text },
  reviewCount: { fontSize: 12, color: colors.textMuted },

  cardMeta: { flexDirection: 'row', gap: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textMuted },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  rate: { fontSize: 16, fontWeight: '800', color: colors.text },
  perHour: { fontSize: 12, fontWeight: '400', color: colors.textMuted },

  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.sm },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
