import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi, quotesApi } from '../lib/apiService';
import type { JobFilters, RequestStatus } from '../types';

export function useJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobsApi.list(filters),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: jobsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useUpdateJobStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      jobsApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, price, message }: { jobId: string; price: number; message?: string }) =>
      quotesApi.create(jobId, { price, message }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useAcceptQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (quoteId: string) => quotesApi.accept(quoteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useRejectQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (quoteId: string) => quotesApi.reject(quoteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

// Derived: job stats for customer dashboard
export function useJobStats() {
  const { data: jobs = [], isLoading } = useJobs();
  return {
    isLoading,
    active: jobs.filter((j) => ['requested', 'quoted', 'accepted', 'in_progress'].includes(j.status)).length,
    pending: jobs.filter((j) => j.status === 'quoted').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
  };
}
