import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../lib/theme';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/auth/login'); return; }
    if (user.role === 'client')  { router.replace('/client'); return; }
    if (user.role === 'artisan') { router.replace('/worker'); return; }
    router.replace('/auth/login');
  }, [user, loading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primaryLight }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
