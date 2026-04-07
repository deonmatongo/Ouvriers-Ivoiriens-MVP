import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ArtisanProfile } from '../types';

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_MY_PROFILE: ArtisanProfile = {
  id: 'mock-profile-1',
  user_id: 'mock-artisan-1',
  category: 'Électricité',
  skills: [
    'Installation tableau::Pose et câblage de tableaux électriques résidentiels et commerciaux::25000',
    'Dépannage électrique::Diagnostic et réparation de pannes électriques toutes origines::15000',
    'Installation climatiseur::Pose et raccordement d\'unités split toutes marques::35000',
    'Éclairage LED::Remplacement et installation d\'éclairage basse consommation::12000',
  ],
  bio: 'Électricien certifié avec 8 ans d\'expérience dans l\'installation électrique résidentielle et commerciale à Abidjan. Travail soigné, respect des normes et des délais garantis.',
  hourly_rate: 4500,
  experience_years: 8,
  is_verified: true,
  is_available: true,
  rating_avg: 4.8,
  total_jobs: 47,
  created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
};

const MOCK_PROFILES: Record<string, ArtisanProfile> = {
  'a1': { id: 'a1', user_id: 'a1', category: 'Électricité', skills: ['Installation tableau::Installation complète::25000', 'Dépannage::Réparation panne::15000'], bio: 'Électricien certifié, 8 ans d\'expérience. Spécialisé en résidentiel.', hourly_rate: 4500, experience_years: 8, is_verified: true, is_available: true, rating_avg: 4.8, total_jobs: 47, created_at: new Date().toISOString() },
  'a2': { id: 'a2', user_id: 'a2', category: 'Plomberie', skills: ['Fuite d\'eau::Détection et réparation::18000', 'Débouchage::Débouchage canalisation::12000'], bio: 'Plombière expérimentée, intervention rapide dans tout Abidjan.', hourly_rate: 3800, experience_years: 5, is_verified: true, is_available: true, rating_avg: 4.6, total_jobs: 32, created_at: new Date().toISOString() },
  'a3': { id: 'a3', user_id: 'a3', category: 'Menuiserie', skills: ['Meubles sur mesure::Fabrication mobilier bois::45000', 'Parquet::Pose et finition parquet::30000'], bio: 'Menuisier artisan passionné. Fabrication sur mesure et pose de parquet.', hourly_rate: 5000, experience_years: 12, is_verified: true, is_available: false, rating_avg: 4.9, total_jobs: 68, created_at: new Date().toISOString() },
  'a4': { id: 'a4', user_id: 'a4', category: 'Peinture', skills: ['Peinture intérieure::Peinture murs et plafonds::20000', 'Enduit::Application enduit décoratif::18000'], bio: 'Peintre décoratrice. Enduit, peinture intérieure et extérieure.', hourly_rate: 3500, experience_years: 4, is_verified: false, is_available: true, rating_avg: 4.5, total_jobs: 21, created_at: new Date().toISOString() },
  'a5': { id: 'a5', user_id: 'a5', category: 'Maçonnerie', skills: ['Carrelage::Pose carrelage sol et mur::28000', 'Gros œuvre::Construction et rénovation::50000'], bio: 'Maçon qualifié, construction et rénovation. 15 ans d\'expérience.', hourly_rate: 6000, experience_years: 15, is_verified: true, is_available: true, rating_avg: 4.7, total_jobs: 53, created_at: new Date().toISOString() },
  'a6': { id: 'a6', user_id: 'a6', category: 'Climatisation', skills: ['Installation::Pose unité split::35000', 'Maintenance::Entretien annuel::15000'], bio: 'Technicienne en climatisation, toutes marques.', hourly_rate: 8000, experience_years: 6, is_verified: true, is_available: true, rating_avg: 4.8, total_jobs: 29, created_at: new Date().toISOString() },
  'mock-artisan-1': MOCK_MY_PROFILE,
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useMyProfile() {
  return useQuery({
    queryKey: ['artisan-profile', 'me'],
    queryFn: async (): Promise<ArtisanProfile> => MOCK_MY_PROFILE,
    staleTime: Infinity,
  });
}

export function useArtisanProfile(id: string) {
  return useQuery({
    queryKey: ['artisan-profile', id],
    queryFn: async (): Promise<ArtisanProfile> =>
      MOCK_PROFILES[id] ?? { ...MOCK_MY_PROFILE, id, user_id: id },
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useUpsertProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ArtisanProfile>): Promise<ArtisanProfile> => {
      await new Promise((r) => setTimeout(r, 600));
      return { ...MOCK_MY_PROFILE, ...payload };
    },
    onSuccess: (data) => qc.setQueryData(['artisan-profile', 'me'], data),
  });
}

export function useUpdateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (is_available: boolean): Promise<ArtisanProfile> => {
      await new Promise((r) => setTimeout(r, 400));
      return { ...MOCK_MY_PROFILE, is_available };
    },
    onSuccess: (data) => qc.setQueryData(['artisan-profile', 'me'], data),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_file: File): Promise<ArtisanProfile> => {
      await new Promise((r) => setTimeout(r, 800));
      return MOCK_MY_PROFILE;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['artisan-profile'] }),
  });
}
