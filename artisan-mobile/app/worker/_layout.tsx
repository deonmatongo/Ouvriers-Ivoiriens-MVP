import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useTokens } from '../../context/TokenContext';
import { colors } from '../../lib/theme';

function CreditsBadge({ balance }: { balance: number }) {
  if (balance <= 0) {
    return (
      <View style={styles.warnBadge}>
        <Text style={styles.warnText}>!</Text>
      </View>
    );
  }
  return (
    <View style={styles.countBadge}>
      <Text style={styles.countText}>{balance > 99 ? '99+' : balance}</Text>
    </View>
  );
}

export default function WorkerLayout() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const { balance } = useTokens();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'artisan')) {
      router.replace('/auth/login');
    }
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
      <Tabs.Screen
        name="index"
        options={{
          title: t('navDashboard'),
          tabBarIcon: ({ color }) => <Ionicons name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: t('navBrowse'),
          tabBarIcon: ({ color }) => <Ionicons name="search" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t('navMessages'),
          tabBarIcon: ({ color }) => <Ionicons name="chatbubble" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="credits"
        options={{
          title: t('navCredits'),
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons name="wallet" size={22} color={color} />
              <CreditsBadge balance={balance} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('navProfile'),
          tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: 9999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  countText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  warnBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.warning,
    borderRadius: 9999,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
});
