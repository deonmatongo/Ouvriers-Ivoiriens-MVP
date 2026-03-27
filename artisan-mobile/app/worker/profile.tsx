import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, spacing, font, radius } from '../../lib/theme';
import { initials } from '../../lib/utils';

const CATEGORIES = [
  'Plomberie',
  'Électricité',
  'Menuiserie',
  'Peinture',
  'Maçonnerie',
  'Climatisation',
  'Soudure',
  'Autre',
];

const MOCK_PROFILE = {
  bio: 'Électricien certifié avec 8 ans d\'expérience dans l\'installation électrique résidentielle et commerciale. Travail soigné et délais respectés.',
  location: 'Cocody, Abidjan',
  category: 'Électricité',
  hourly_rate: '4500',
  experience_years: '8',
};

export default function WorkerProfile() {
  const { t } = useLang();
  const { user } = useAuth();

  const [bio, setBio] = useState(MOCK_PROFILE.bio);
  const [location, setLocation] = useState(MOCK_PROFILE.location);
  const [category, setCategory] = useState(MOCK_PROFILE.category);
  const [hourlyRate, setHourlyRate] = useState(MOCK_PROFILE.hourly_rate);
  const [experienceYears, setExperienceYears] = useState(MOCK_PROFILE.experience_years);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!bio.trim() || !location.trim() || !category) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    Alert.alert('Profil mis à jour', 'Vos informations ont été enregistrées avec succès.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('workerProfileTitle')}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Avatar section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{user ? initials(user.name) : 'AR'}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{user?.name ?? 'Artisan'}</Text>
              <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
            </View>
          </View>

          {/* Bio */}
          <Input
            label={t('bioLabel')}
            placeholder={t('bioPlaceholder')}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.bioInput}
          />

          {/* Location */}
          <Input
            label={t('locationLabel2')}
            placeholder={t('locationPlaceholder2')}
            value={location}
            onChangeText={setLocation}
          />

          {/* Category */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('mainCategory')}</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Hourly rate */}
          <Input
            label={t('hourlyRate')}
            placeholder="Ex: 4500"
            value={hourlyRate}
            onChangeText={setHourlyRate}
            keyboardType="numeric"
          />

          {/* Experience */}
          <Input
            label={t('experienceYears')}
            placeholder="Ex: 8"
            value={experienceYears}
            onChangeText={setExperienceYears}
            keyboardType="numeric"
          />

          {/* Save */}
          <Button
            label={t('saveChanges')}
            onPress={handleSave}
            loading={saving}
            size="lg"
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: { padding: spacing.lg, gap: spacing.md },

  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 20 },
  userName: { fontSize: 16, fontWeight: '700', color: colors.text },
  userEmail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },

  bioInput: { minHeight: 100, textAlignVertical: 'top' as const },

  fieldGroup: { gap: spacing.sm },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  categoryChipTextActive: { color: '#fff' },

  saveBtn: { marginTop: spacing.sm, marginBottom: spacing.xl },
});
