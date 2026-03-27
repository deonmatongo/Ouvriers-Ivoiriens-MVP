import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LangProvider } from '../context/LangContext';
import { AuthProvider } from '../context/AuthContext';
import { TokenProvider } from '../context/TokenContext';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <AuthProvider>
          <TokenProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
          </TokenProvider>
        </AuthProvider>
      </LangProvider>
    </QueryClientProvider>
  );
}
