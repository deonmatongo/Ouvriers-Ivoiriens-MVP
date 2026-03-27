import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '../lib/apiService';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: messagesApi.getConversations,
    refetchInterval: 10_000, // poll every 10s until Socket.io is added
  });
}

export function useThread(requestId: string) {
  return useQuery({
    queryKey: ['messages', requestId],
    queryFn: () => messagesApi.getThread(requestId),
    enabled: !!requestId,
    refetchInterval: 5_000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: messagesApi.send,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['messages', variables.request_id] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
