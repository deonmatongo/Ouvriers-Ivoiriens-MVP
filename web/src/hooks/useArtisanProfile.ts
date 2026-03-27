import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { artisanApi } from '../lib/apiService';
import type { ArtisanProfile } from '../types';

export function useMyProfile() {
  return useQuery({
    queryKey: ['artisan-profile', 'me'],
    queryFn: artisanApi.getMyProfile,
  });
}

export function useArtisanProfile(id: string) {
  return useQuery({
    queryKey: ['artisan-profile', id],
    queryFn: () => artisanApi.getProfile(id),
    enabled: !!id,
  });
}

export function useUpsertProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ArtisanProfile>) => artisanApi.upsertProfile(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['artisan-profile'] }),
  });
}

export function useUpdateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (is_available: boolean) => artisanApi.updateAvailability(is_available),
    onSuccess: (data) => {
      qc.setQueryData(['artisan-profile', 'me'], data);
    },
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => artisanApi.uploadAvatar(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['artisan-profile'] }),
  });
}
