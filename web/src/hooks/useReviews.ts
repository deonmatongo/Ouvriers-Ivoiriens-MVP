import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../lib/apiService';

export function useMyReviews() {
  return useQuery({
    queryKey: ['reviews', 'me'],
    queryFn: () => reviewsApi.getForArtisan(),
  });
}

export function useArtisanReviews(artisanId: string) {
  return useQuery({
    queryKey: ['reviews', artisanId],
    queryFn: () => reviewsApi.getForArtisan(artisanId),
    enabled: !!artisanId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}
