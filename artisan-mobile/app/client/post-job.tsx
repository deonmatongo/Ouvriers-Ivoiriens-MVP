import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLang } from '../../context/LangContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, spacing, font, radius } from '../../lib/theme';

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

const schema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  category: z.string().min(1, 'La catégorie est requise'),
  description: z.string().min(20, 'La description doit faire au moins 20 caractères'),
  location: z.string().optional(),
  budget: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function PostJob() {
  const { t } = useLang();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      category: '',
      description: '',
      location: '',
      budget: '',
    },
  });

  const selectedCategory = watch('category');

  const onSubmit = async (_data: FormData) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    Alert.alert(
      'Demande publiée !',
      'Votre demande a été publiée avec succès. Les artisans pourront vous envoyer des devis.',
      [
        {
          text: 'Voir mes demandes',
          onPress: () => router.replace('/client/jobs'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('postJobTitle')}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label={t('jobTitleLabel')}
                placeholder={t('jobTitlePlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
              />
            )}
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('categoryLabel')}</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setValue('category', cat, { shouldValidate: true })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.category && (
              <Text style={styles.errorText}>{errors.category.message}</Text>
            )}
          </View>

          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label={t('descriptionLabel')}
                placeholder={t('descriptionPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={styles.descInput}
              />
            )}
          />

          <Controller
            control={control}
            name="location"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label={t('locationLabel')}
                placeholder={t('locationPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />

          <Controller
            control={control}
            name="budget"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label={t('budgetLabel')}
                placeholder={t('budgetPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
              />
            )}
          />

          <View style={styles.actions}>
            <Button
              label={t('publish')}
              onPress={handleSubmit(onSubmit)}
              loading={submitting}
              style={styles.submitBtn}
            />
            <Button
              label={t('cancel')}
              onPress={() => router.back()}
              variant="outline"
              style={styles.cancelBtn}
            />
          </View>
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
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  categoryChipTextActive: { color: '#fff' },
  errorText: { fontSize: 12, color: colors.error, marginTop: 2 },

  descInput: { minHeight: 100, textAlignVertical: 'top' as const },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
  submitBtn: {},
  cancelBtn: {},
});
