import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme/tokens';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications (Phase 1 Stub)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.typography.family.serif,
    fontSize: theme.typography.sizes.h2,
    color: theme.colors.primary,
  },
});
