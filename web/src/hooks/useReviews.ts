import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Review } from '../types';

// ─── Mock data ───────────────────────────────────────────────────────────────

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

const MOCK_MY_REVIEWS: Review[] = [
  {
    id: 'r1', client_id: 'c10', artisan_id: 'mock-artisan-1', request_id: 'old-job-1', rating: 5,
    comment: 'Travail impeccable, très professionnel. Le tableau a été remplacé en moins de 3h. Je recommande vivement !',
    created_at: daysAgo(5),
    client: { id: 'c10', name: 'Konan Marius', email: 'marius@test.com', phone_verified: true, role: 'client', created_at: daysAgo(120) },
    request: { id: 'old-job-1', client_id: 'c10', title: 'Remplacement tableau électrique', description: '', category: 'Électricité', status: 'completed', created_at: daysAgo(7), budget: 45000 },
  },
  {
    id: 'r2', client_id: 'c11', artisan_id: 'mock-artisan-1', request_id: 'old-job-2', rating: 5,
    comment: 'Ponctuel, propre et efficace. L\'installation du climatiseur s\'est passée sans problème. Très satisfait.',
    created_at: daysAgo(12),
    client: { id: 'c11', name: 'Adjoua Florence', email: 'florence@test.com', phone_verified: true, role: 'client', created_at: daysAgo(90) },
    request: { id: 'old-job-2', client_id: 'c11', title: 'Installation climatiseur bureau', description: '', category: 'Climatisation', status: 'completed', created_at: daysAgo(14), budget: 85000 },
  },
  {
    id: 'r3', client_id: 'c12', artisan_id: 'mock-artisan-1', request_id: 'old-job-3', rating: 4,
    comment: 'Bon travail dans l\'ensemble. Quelques petits détails à revoir mais rien de grave. Reviendrai si besoin.',
    created_at: daysAgo(20),
    client: { id: 'c12', name: 'Yao Brice', email: 'brice@test.com', phone_verified: false, role: 'client', created_at: daysAgo(150) },
    request: { id: 'old-job-3', client_id: 'c12', title: 'Dépannage électrique appartement', description: '', category: 'Électricité', status: 'completed', created_at: daysAgo(22), budget: 20000 },
  },
  {
    id: 'r4', client_id: 'c13', artisan_id: 'mock-artisan-1', request_id: 'old-job-4', rating: 5,
    comment: 'Excellent artisan ! Rapide, sérieux, et le prix était très raisonnable. Vraiment top.',
    created_at: daysAgo(35),
    client: { id: 'c13', name: 'Tanon Marie', email: 'tanon@test.com', phone_verified: true, role: 'client', created_at: daysAgo(200) },
    request: { id: 'old-job-4', client_id: 'c13', title: 'Installation prises électriques terrasse', description: '', category: 'Électricité', status: 'completed', created_at: daysAgo(37), budget: 18000 },
  },
  {
    id: 'r5', client_id: 'c14', artisan_id: 'mock-artisan-1', request_id: 'old-job-5', rating: 5,
    comment: 'Très bonne expérience. Je le recommande les yeux fermés.',
    created_at: daysAgo(50),
    client: { id: 'c14', name: 'Bamba Sali', email: 'bamba@test.com', phone_verified: true, role: 'client', created_at: daysAgo(250) },
    request: { id: 'old-job-5', client_id: 'c14', title: 'Mise aux normes installation électrique', description: '', category: 'Électricité', status: 'completed', created_at: daysAgo(52) },
  },
];

const MOCK_ARTISAN_REVIEWS: Record<string, Review[]> = {
  'mock-artisan-1': MOCK_MY_REVIEWS,
  'a1': MOCK_MY_REVIEWS.map((r) => ({ ...r, artisan_id: 'a1' })),
  'a2': [
    { id: 'ra1', client_id: 'c20', artisan_id: 'a2', request_id: 'rj1', rating: 5, comment: 'La fuite est réparée en 2h. Très professionnel et propre.', created_at: daysAgo(8), client: { id: 'c20', name: 'Kouamé Roselyne', email: 'r@test.com', phone_verified: true, role: 'client', created_at: daysAgo(100) } },
    { id: 'ra2', client_id: 'c21', artisan_id: 'a2', request_id: 'rj2', rating: 4, comment: 'Bon travail, un peu de retard mais résultat nickel.', created_at: daysAgo(15), client: { id: 'c21', name: 'Gbané Seydou', email: 'g@test.com', phone_verified: true, role: 'client', created_at: daysAgo(80) } },
  ],
};

// ─── In-memory store ─────────────────────────────────────────────────────────

let inMemoryReviews: Review[] = [...MOCK_MY_REVIEWS];

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useMyReviews() {
  return useQuery({
    queryKey: ['reviews', 'me'],
    queryFn: async (): Promise<Review[]> => inMemoryReviews,
    staleTime: 0,
  });
}

export function useArtisanReviews(artisanId: string) {
  return useQuery({
    queryKey: ['reviews', artisanId],
    queryFn: async (): Promise<Review[]> =>
      MOCK_ARTISAN_REVIEWS[artisanId] ?? MOCK_MY_REVIEWS.map((r) => ({ ...r, artisan_id: artisanId })),
    enabled: !!artisanId,
    staleTime: Infinity,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Review, 'id' | 'created_at'>): Promise<Review> => {
      await new Promise((r) => setTimeout(r, 600));
      const review: Review = { ...payload, id: `r${Date.now()}`, created_at: new Date().toISOString() };
      inMemoryReviews = [review, ...inMemoryReviews];
      return review;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}
