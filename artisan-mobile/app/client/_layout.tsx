import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { colors } from '../../lib/theme';

export default function ClientLayout() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'client')) router.replace('/auth/login');
  }, [user, loading]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border, elevation: 0 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('navDashboard'), tabBarIcon: ({ color }) => <Ionicons name="home" size={22} color={color} /> }} />
      <Tabs.Screen name="browse" options={{ title: t('navBrowse'), tabBarIcon: ({ color }) => <Ionicons name="search" size={22} color={color} /> }} />
      <Tabs.Screen name="jobs" options={{ title: t('navJobs'), tabBarIcon: ({ color }) => <Ionicons name="briefcase" size={22} color={color} /> }} />
      <Tabs.Screen name="post-job" options={{ title: t('navNewJob'), tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={22} color={color} /> }} />
      <Tabs.Screen name="messages" options={{ title: t('navMessages'), tabBarIcon: ({ color }) => <Ionicons name="chatbubble" size={22} color={color} /> }} />
    </Tabs>
  );
}
