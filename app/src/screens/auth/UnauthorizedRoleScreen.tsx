import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldAlert, ExternalLink, LogOut, UserCheck } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';

const ADMIN_WEB_PORTAL_URL = 'https://timemap.nsuk.edu.ng/admin';

export const UnauthorizedRoleScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAdmin = user?.role === 'admin';
  const roleLabel =
    user?.role === 'admin'
      ? 'Administrator'
      : user?.role
      ? user.role.toUpperCase()
      : 'Restricted Account';

  const handleOpenWebPortal = async () => {
    try {
      const supported = await Linking.canOpenURL(ADMIN_WEB_PORTAL_URL);
      if (supported) {
        await Linking.openURL(ADMIN_WEB_PORTAL_URL);
      } else {
        await Linking.openURL(ADMIN_WEB_PORTAL_URL);
      }
    } catch (err) {
      console.warn('[UnauthorizedRoleScreen] Could not open URL:', err);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header Icon */}
          <View style={styles.iconWrapper}>
            <ShieldAlert size={44} color={colors.warning} />
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>Mobile Access Restricted</Text>
          <Text style={styles.description}>
            The NSUK TimeMap Mobile Application is designed exclusively for Students, Class Representatives, and Lecturers.
          </Text>

          {/* User Profile Badge */}
          {user ? (
            <Card variant="flat" style={styles.userCard}>
              <View style={styles.userRow}>
                <View style={styles.userAvatar}>
                  <UserCheck size={20} color={colors.primary} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.fullName}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <Badge variant="warning" style={styles.roleBadge}>
                  {roleLabel}
                </Badge>
              </View>
            </Card>
          ) : null}

          {/* Admin Web Portal Link Card */}
          {isAdmin ? (
            <Card variant="outlined" style={styles.adminCard}>
              <View style={styles.adminCardHeader}>
                <ExternalLink size={20} color={colors.primary} />
                <Text style={styles.adminCardTitle}>Web Admin Dashboard</Text>
              </View>
              <Text style={styles.adminCardBody}>
                As an Administrator, you can manage timetables, user roles, venues, and system settings from the official Web Portal.
              </Text>
              <Button
                variant="primary"
                size="md"
                onPress={handleOpenWebPortal}
                rightIcon={<ExternalLink size={16} color="#ffffff" />}
                style={styles.adminBtn}
              >
                Go to Web Admin Portal
              </Button>
            </Card>
          ) : (
            <Card variant="outlined" style={styles.adminCard}>
              <Text style={styles.adminCardBody}>
                If you believe you should have mobile access, please contact your department timetable administrator.
              </Text>
            </Card>
          )}

          {/* Logout Action */}
          <Button
            variant="secondary"
            size="md"
            onPress={handleLogout}
            isLoading={isLoggingOut}
            leftIcon={<LogOut size={16} color={colors.textMain} />}
            style={styles.logoutBtn}
          >
            Sign In with Different Account
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSubtle,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  userCard: {
    width: '100%',
    marginBottom: 20,
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'center',
  },
  adminCard: {
    width: '100%',
    marginBottom: 24,
    padding: 18,
    backgroundColor: colors.surface,
  },
  adminCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  adminCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  adminCardBody: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 16,
  },
  adminBtn: {
    width: '100%',
  },
  logoutBtn: {
    width: '100%',
  },
});
