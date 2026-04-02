import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme, spacing, radius, typography, shadows } from '../utils/theme';

const ImagePreview = ({ file, label, onRemove }) => {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const styles = makeStyles(theme);

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
    >
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.card}>
        <Image
          source={{ uri: file.uri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        <View style={styles.infoBar}>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name || file.fileName || 'image.jpg'}
            </Text>
            {file.fileSize ? (
              <Text style={styles.fileSize}>
                {(file.fileSize / 1024).toFixed(1)} KB
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.removeBtn}
            onPress={onRemove}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const makeStyles = theme =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: theme.textSecondary,
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.md,
    },
    thumbnail: {
      width: '100%',
      height: 160,
    },
    infoBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    fileInfo: {
      flex: 1,
    },
    fileName: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: theme.text,
    },
    fileSize: {
      fontSize: typography.sizes.xs,
      color: theme.textSecondary,
      marginTop: 2,
    },
    removeBtn: {
      width: 28,
      height: 28,
      borderRadius: radius.full,
      backgroundColor: theme.error,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.sm,
    },
    removeBtnText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: typography.weights.bold,
    },
  });

export default ImagePreview;
