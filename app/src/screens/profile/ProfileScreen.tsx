import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  User,
  Bell,
  BellOff,
  LogOut,
  Info,
  ShieldCheck,
  BookOpen,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileSettingsRow } from '@/components/profile/ProfileSettingsRow';
import { Toggle } from '@/components/ui/Toggle';
import { LogoutConfirmBottomSheet } from '@/components/bottom-sheets/LogoutConfirmBottomSheet';
import { PushPermissionBottomSheet } from '@/components/bottom-sheets/PushPermissionBottomSheet';
import { AccountDetailsBottomSheet } from '@/components/bottom-sheets/AccountDetailsBottomSheet';
import { MOCK_PROFILE } from '@/constants/mockData';
import Constants from 'expo-constants';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProfileScreenProps {
  onLogout: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const profile = MOCK_PROFILE;

  const [pushEnabled, setPushEnabled] = useState(profile.pushEnabled);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [pushSheetVisible, setPushSheetVisible] = useState(false);
  const [accountDetailsVisible, setAccountDetailsVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handlePushToggle = (value: boolean) => {
    if (value) {
      setPushSheetVisible(true);
    } else {
      // TODO(api-wiring): POST /api/notifications/devices/deactivate/
      setPushEnabled(false);
    }
  };

  const handleEnablePush = () => {
    // TODO(api-wiring): expo-notifications.requestPermissionsAsync() + POST /api/notifications/devices/
    setPushEnabled(true);
    setPushSheetVisible(false);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    // TODO(api-wiring): clear SecureStore tokens, deactivate push token
    setTimeout(() => {
      setIsLoggingOut(false);
      setLogoutVisible(false);
      onLogout();
    }, 800);
  };

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Brand label */}
        <View style={styles.brandRow}>
          <Text style={styles.brandLabel}>NSUK TimeMap</Text>
        </View>

        {/* Profile header card */}
        <View style={styles.headerCard}>
          <ProfileHeader profile={profile} />
        </View>

        {/* Settings sections */}

        {/* Notifications section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionCard}>
            <ProfileSettingsRow
              icon={pushEnabled ? <Bell size={18} color={colors.primary} /> : <BellOff size={18} color={colors.textMuted} />}
              label="Push Notifications"
              description={pushEnabled ? 'Receiving real-time updates' : 'Enable to get schedule alerts'}
              isStatic
              rightElement={
                <Toggle
                  value={pushEnabled}
                  onValueChange={handlePushToggle}
                />
              }
            />
          </View>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionCard}>
            <ProfileSettingsRow
              icon={<User size={18} color={colors.textMuted} />}
              label="Account Details"
              description="View your profile information"
              onPress={() => setAccountDetailsVisible(true)}
            />
            {profile.isClassRep ? (
              <ProfileSettingsRow
                icon={<BookOpen size={18} color={colors.primary} />}
                label="Class Rep"
                description="You are the class rep for your department"
                isStatic
                rightElement={
                  <View style={styles.repPill}>
                    <Text style={styles.repPillText}>Active</Text>
                  </View>
                }
              />
            ) : null}
          </View>
        </View>

        {/* App section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.sectionCard}>
            <ProfileSettingsRow
              icon={<Info size={18} color={colors.textMuted} />}
              label="Version"
              description="NSUK TimeMap Mobile"
              isStatic
              rightElement={
                <Text style={styles.versionText}>v{appVersion}</Text>
              }
            />
            <ProfileSettingsRow
              icon={<ShieldCheck size={18} color={colors.textMuted} />}
              label="Privacy & Security"
              description="Your data is stored securely on-device"
              isStatic
            />
          </View>
        </View>

        {/* Logout section */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <View style={styles.sectionCard}>
            <ProfileSettingsRow
              icon={<LogOut size={18} color={colors.danger} />}
              label="Log Out"
              description="Sign out of your account"
              onPress={() => setLogoutVisible(true)}
              destructive
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom sheets */}
      <LogoutConfirmBottomSheet
        visible={logoutVisible}
        onClose={() => setLogoutVisible(false)}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <PushPermissionBottomSheet
        visible={pushSheetVisible}
        onClose={() => setPushSheetVisible(false)}
        onEnable={handleEnablePush}
      />

      <AccountDetailsBottomSheet
        visible={accountDetailsVisible}
        onClose={() => setAccountDetailsVisible(false)}
        profile={profile}
      />
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
    paddingBottom: 32,
  },
  brandRow: {
    paddingTop: 16,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  brandLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  headerCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  repPill: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  repPillText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 13,
    color: colors.textSubtle,
    fontWeight: '600',
  },
});
