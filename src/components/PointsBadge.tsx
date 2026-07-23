import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, rankForPoints } from '@/constants/theme';

export function PointsBadge({ points }: { points: number }) {
  return (
    <View style={styles.container}>
      <Text style={styles.points}>
        {points} pts <Text style={styles.rank}>· {rankForPoints(points)}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'baseline' },
  points: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: Colors.accentOrange,
  },
  rank: {
    fontFamily: Fonts.monoRegular,
    color: Colors.textMuted,
  },
});
