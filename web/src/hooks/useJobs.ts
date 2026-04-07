import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Job, JobFilters, Quote, RequestStatus } from '../types';

// ─── Mock data ───────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

const MOCK_QUOTES: Quote[] = [
  {
    id: 'q1', request_id: 'job2', artisan_id: 'mock-artisan-1', price: 45000,
    message: 'Bonjour, je peux intervenir dès demain. Ce tarif comprend la main d\'œuvre et les matériaux.', status: 'pending',
    created_at: daysAgo(1),
    artisan: { id: 'mock-profile-1', user_id: 'mock-artisan-1', category: 'Électricité', skills: [], bio: '', hourly_rate: 4500, experience_years: 8, is_verified: true, is_available: true, rating_avg: 4.8, total_jobs: 47, created_at: daysAgo(365) },
  },
  {
    id: 'q2', request_id: 'job2', artisan_id: 'a2', price: 38000,
    message: 'Disponible cette semaine. Réduction de 10% si paiement immédiat.', status: 'pending',
    created_at: daysAgo(1),
    artisan: { id: 'a2', user_id: 'a2', category: 'Électricité', skills: [], bio: '', hourly_rate: 3800, experience_years: 5, is_verified: true, is_available: true, rating_avg: 4.6, total_jobs: 32, created_at: daysAgo(200) },
  },
];

const INITIAL_MOCK_JOBS: Job[] = [
  {
    id: 'job1', client_id: 'mock-client-1', title: 'Réparation fuite d\'eau salle de bain',
    description: 'Fuite sous le lavabo, tuyau qui goutte depuis 3 jours. Urgence relative.', category: 'Plomberie',
    status: 'in_progress', location_address: 'Cocody, Rue des Jardins, Abidjan', budget: 30000,
    created_at: daysAgo(7),
    client: { id: 'mock-client-1', name: 'Marie Ouédraogo', email: 'client@test.com', phone_verified: true, role: 'client', created_at: daysAgo(60) },
    artisan: { id: 'mock-artisan-1', name: 'Konan Électricité', email: 'artisan@test.com', phone_verified: true, role: 'artisan', created_at: daysAgo(365) },
    quotes: [],
  },
  {
    id: 'job2', client_id: 'mock-client-1', title: 'Installation tableau électrique',
    description: 'Tableau électrique principal à remplacer, ancien modèle non conforme aux normes actuelles.', category: 'Électricité',
    status: 'quoted', location_address: 'Plateau, Avenue Chardy, Abidjan', budget: 75000,
    created_at: daysAgo(3),
    client: { id: 'mock-client-1', name: 'Marie Ouédraogo', email: 'client@test.com', phone_verified: true, role: 'client', created_at: daysAgo(60) },
    quotes: MOCK_QUOTES,
  },
  {
    id: 'job3', client_id: 'mock-client-1', title: 'Peinture salon et couloir',
    description: 'Deux pièces à peindre, environ 45m² au total. Couleur beige souhaitée.', category: 'Peinture',
    status: 'completed', location_address: 'Yopougon, Abidjan', budget: 120000,
    created_at: daysAgo(21),
    client: { id: 'mock-client-1', name: 'Marie Ouédraogo', email: 'client@test.com', phone_verified: true, role: 'client', created_at: daysAgo(60) },
    artisan: { id: 'a4', name: 'Adjoua Peinture', email: 'adjoua@test.com', phone_verified: true, role: 'artisan', created_at: daysAgo(200) },
    quotes: [],
  },
  {
    id: 'job4', client_id: 'mock-client-1', title: 'Pose carrelage terrasse',
    description: 'Terrasse de 20m² à carreler, les carreaux sont déjà achetés.', category: 'Maçonnerie',
    status: 'requested', location_address: 'Marcory, Abidjan',
    created_at: daysAgo(1),
    client: { id: 'mock-client-1', name: 'Marie Ouédraogo', email: 'client@test.com', phone_verified: true, role: 'client', created_at: daysAgo(60) },
    quotes: [],
  },
  {
    id: 'job5', client_id: 'mock-client-1', title: 'Installation climatiseur chambre',
    description: 'Pose d\'un split 12000 BTU dans la chambre principale, unité extérieure en façade.', category: 'Climatisation',
    status: 'accepted', location_address: 'Cocody, Abidjan', budget: 85000,
    created_at: daysAgo(5),
    client: { id: 'mock-client-1', name: 'Marie Ouédraogo', email: 'client@test.com', phone_verified: true, role: 'client', created_at: daysAgo(60) },
    artisan: { id: 'a6', name: 'Ama Climatisation', email: 'ama@test.com', phone_verified: true, role: 'artisan', created_at: daysAgo(300) },
    quotes: [],
  },
];

// In-memory store so mutations persist within a session
let mockJobsStore: Job[] = [...INITIAL_MOCK_JOBS];

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async (): Promise<Job[]> => {
      let results = [...mockJobsStore];
      if (filters?.status) results = results.filter((j) => j.status === filters.status);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        results = results.filter((j) => j.title.toLowerCase().includes(q) || j.category.toLowerCase().includes(q));
      }
      if (filters?.limit) results = results.slice(0, filters.limit);
      return results;
    },
    staleTime: 0,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: async (): Promise<Job> => mockJobsStore.find((j) => j.id === id) ?? INITIAL_MOCK_JOBS[0],
    enabled: !!id,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Job, 'id' | 'client_id' | 'created_at' | 'status' | 'quotes'>): Promise<Job> => {
      await new Promise((r) => setTimeout(r, 700));
      const newJob: Job = {
        ...payload,
        id: `job${Date.now()}`,
        client_id: 'mock-client-1',
        status: 'requested',
        created_at: now(),
        client: { id: 'mock-client-1', name: 'Marie Ouédraogo', email: 'client@test.com', phone_verified: true, role: 'client', created_at: daysAgo(60) },
        quotes: [],
      };
      mockJobsStore = [newJob, ...mockJobsStore];
      return newJob;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useUpdateJobStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RequestStatus }): Promise<Job> => {
      await new Promise((r) => setTimeout(r, 400));
      mockJobsStore = mockJobsStore.map((j) => j.id === id ? { ...j, status } : j);
      return mockJobsStore.find((j) => j.id === id)!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, price, message }: { jobId: string; price: number; message?: string }): Promise<Quote> => {
      await new Promise((r) => setTimeout(r, 600));
      const newQuote: Quote = {
        id: `q${Date.now()}`, request_id: jobId, artisan_id: 'mock-artisan-1',
        price, message: message ?? '', status: 'pending', created_at: now(),
      };
      mockJobsStore = mockJobsStore.map((j) =>
        j.id === jobId ? { ...j, status: 'quoted' as RequestStatus, quotes: [...(j.quotes ?? []), newQuote] } : j
      );
      return newQuote;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useAcceptQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quoteId: string): Promise<Quote> => {
      await new Promise((r) => setTimeout(r, 500));
      let accepted!: Quote;
      mockJobsStore = mockJobsStore.map((j) => {
        const q = j.quotes?.find((q) => q.id === quoteId);
        if (!q) return j;
        accepted = { ...q, status: 'accepted' };
        return { ...j, status: 'accepted' as RequestStatus, quotes: j.quotes?.map((q2) => q2.id === quoteId ? accepted : { ...q2, status: 'rejected' as const }) };
      });
      return accepted;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useRejectQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quoteId: string): Promise<Quote> => {
      await new Promise((r) => setTimeout(r, 400));
      let rejected!: Quote;
      mockJobsStore = mockJobsStore.map((j) => ({
        ...j,
        quotes: j.quotes?.map((q) => {
          if (q.id !== quoteId) return q;
          rejected = { ...q, status: 'rejected' };
          return rejected;
        }),
      }));
      return rejected;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useJobStats() {
  const { data: jobs = [], isLoading } = useJobs();
  return {
    isLoading,
    active: jobs.filter((j) => ['requested', 'quoted', 'accepted', 'in_progress'].includes(j.status)).length,
    pending: jobs.filter((j) => j.status === 'quoted').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
  };
}
