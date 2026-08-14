import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/ui/Text';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Index() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>TimeMap</Text>
      <Text style={styles.subtitle}>NSUK TimeMap</Text>
      <Card>
        <Text style={styles.description}>
          Welcome to TimeMap. Access your lecture/exam/event timetable, manage discrepancies.
        </Text></Card>

      <Button variant='primary' onPress={() => { router.replace('/(auth)/login') }} style={{ marginTop: 20 }}>Login</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
});
