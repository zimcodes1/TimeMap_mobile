import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { colors } from '@/theme/colors';
import { Text } from '../ui/Text';

interface SplashScreenViewProps {
  appName?: string;
  subtitle?: string;
}

export const SplashScreenView: React.FC<SplashScreenViewProps> = ({
  appName = 'TimeMap',
  subtitle = 'NSUK TimeMap',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../../assets/images/logo-transparent.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>{appName}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textMain,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
