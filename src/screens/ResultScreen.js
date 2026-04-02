import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DOCUMENT_TYPES } from '../utils/constants';
import { useTheme, spacing, radius, typography, shadows } from '../utils/theme';
import * as Clipboard from 'expo-clipboard';
import { normalizeExtractionResult } from '../services/api';

const ResultField = ({ icon, label, value, theme, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 80,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const hasValue = value !== null && value !== undefined && value !== '';
  const displayValue = hasValue ? String(value) : 'Not detected';

  const handleCopy = async () => {
    if (hasValue) {
      await Clipboard.setStringAsync(displayValue);
    }
  };

  return (
    <Animated.View
      style={[
        styles(theme).fieldRow,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles(theme).fieldIconWrap}>
        <Text style={styles(theme).fieldIcon}>{icon}</Text>
      </View>
      <View style={styles(theme).fieldBody}>
        <Text style={styles(theme).fieldLabel}>{label}</Text>
        <Text
          style={[
            styles(theme).fieldValue,
            !hasValue && styles(theme).fieldValueEmpty,
          ]}
        >
          {displayValue}
        </Text>
      </View>
      {hasValue && (
        <TouchableOpacity style={styles(theme).copyBtn} onPress={handleCopy} activeOpacity={0.6}>
          <Text style={styles(theme).copyIcon}>📋</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const ResultScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { rawResult = {}, documentType } = route.params || {};

  // If user used old navigation params directly
  const sourceResult = rawResult.status ? rawResult : route.params?.result || {};
  const normalized = normalizeExtractionResult(sourceResult);
  const result = normalized.fields || {};

  const getDocTypeInfo = (type) => {
    switch (type) {
      case 'pan': return { label: 'PAN Card', icon: '🧾' };
      case 'aadhaar': return { label: 'Aadhaar Card', icon: '🪪' };
      case 'passport': return { label: 'Passport', icon: '🛂' };
      case 'dl': return { label: 'Driving License', icon: '🚗' };
      case 'voter': return { label: 'Voter ID', icon: '🗳️' };
      default: return { label: type || documentType || 'Unknown Document', icon: '📄' };
    }
  };
  
  const docInfo = getDocTypeInfo(normalized.documentType || documentType);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, {
      toValue: 1,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [headerAnim]);

  const s = styles(theme);

  return (
    <View
      style={[
        s.safeArea,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <StatusBar style={theme.text === '#F9FAFB' ? 'light' : 'dark'} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            s.successBanner,
            {
              opacity: headerAnim,
              transform: [
                {
                  scale: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={s.successHeaderRow}>
            <Text style={s.docTypeIcon}>{docInfo.icon}</Text>
            <Text style={s.successTitle}>{docInfo.label}</Text>
          </View>
          <Text style={s.successSubtitle}>Document processed successfully</Text>
        </Animated.View>

        {normalized.blurScore !== undefined && normalized.blurScore < 100 && (
          <View style={[s.card, { borderColor: theme.error, backgroundColor: theme.errorBg }]}>
            <View style={s.warningCardInner}>
              <Text style={s.warningIcon}>⚠️</Text>
              <Text style={[s.warningText, { color: theme.error }]}>
                Image quality is low. Results may be inaccurate.
              </Text>
            </View>
          </View>
        )}

        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardHeaderTitle}>Document Meta</Text>
            <View style={s.cardBadge}>
              <Text style={s.cardBadgeText}>Info</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.metaContainer}>
            <Text style={s.metaText}>
              <Text style={s.metaLabel}>Document Type:</Text> {docInfo.label}
            </Text>
            <Text style={s.metaText}>
              <Text style={s.metaLabel}>Blur Score:</Text> {normalized.blurScore ?? 'N/A'}
            </Text>
            <Text style={s.metaText}>
              <Text style={s.metaLabel}>Rotation Applied:</Text> {normalized.rotationAngle !== null && normalized.rotationAngle !== undefined ? `${normalized.rotationAngle}°` : 'N/A'}
            </Text>
            <Text style={s.metaText}>
              <Text style={s.metaLabel}>Auto Crop:</Text> {normalized.documentCropped ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardHeaderTitle}>Extracted Information</Text>
            <View style={s.cardBadge}>
              <Text style={s.cardBadgeText}>AI Result</Text>
            </View>
          </View>

          <View style={s.divider} />

          {Object.keys(result).filter(k => result[k] !== undefined).map((key, idx) => {
            const getIconAndLabel = (k) => {
              const friendlyLabels = {
                name: { label: 'Name', icon: '👤' },
                father_name: { label: 'Father Name', icon: '👴' },
                dob: { label: 'DOB', icon: '🎂' },
                pan_number: { label: 'PAN Number', icon: '💳' },
                gender: { label: 'Gender', icon: '🚻' },
                aadhaar_number: { label: 'Aadhaar Number', icon: '💳' },
                address: { label: 'Address', icon: '🏠' },
                passport_number: { label: 'Passport Number', icon: '🛂' },
                nationality: { label: 'Nationality', icon: '🏳️' },
                dl_number: { label: 'DL Number', icon: '🚗' },
                expiry_date: { label: 'Expiry Date', icon: '📅' },
                voter_id: { label: 'Voter ID', icon: '🗳️' },
              };
              if (friendlyLabels[k]) return friendlyLabels[k];
              return { 
                label: k.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), 
                icon: '📄' 
              };
            };
            
            const fieldInfo = getIconAndLabel(key);

            return (
              <ResultField
                key={key}
                icon={fieldInfo.icon}
                label={fieldInfo.label}
                value={result[key]}
                theme={theme}
                index={idx}
              />
            );
          })}
          {Object.keys(result).length === 0 && (
            <View style={{ padding: spacing.lg }}>
              <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>No extracted fields found.</Text>
            </View>
          )}
        </View>

        {normalized.qrData && (
          <RawResponseCard title="QR Data" result={normalized.qrData} theme={theme} s={s} />
        )}
        
        {normalized.rawText && (
          <RawResponseCard title="OCR Raw Text" text={normalized.rawText} theme={theme} s={s} />
        )}

        <RawResponseCard title="Raw API Response" result={sourceResult} theme={theme} s={s} />

        <TouchableOpacity
          style={s.primaryBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={s.primaryBtnIcon}>📤</Text>
          <Text style={s.primaryBtnText}>Scan Another Document</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.secondaryBtn}
          onPress={() => navigation.navigate('UploadScreen')}
          activeOpacity={0.8}
        >
          <Text style={s.secondaryBtnText}>🏠 Go to Home</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
};

const RawResponseCard = ({ title, text, result, theme, s }) => {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setExpanded(prev => !prev);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={s.rawCard}>
      <TouchableOpacity
        onPress={toggle}
        style={s.rawHeader}
        activeOpacity={0.7}
      >
        <Text style={s.rawTitle}>{title || 'Raw API Response'}</Text>
        <Animated.Text
          style={[s.rawChevron, { transform: [{ rotate: rotation }] }]}
        >
          ▼
        </Animated.Text>
      </TouchableOpacity>
      {expanded && (
        <ScrollView style={{ maxHeight: 300, marginTop: spacing.sm }} nestedScrollEnabled showsVerticalScrollIndicator={true}>
          <Text style={s.rawText} selectable>
            {text !== undefined && text !== null ? text : JSON.stringify(result, null, 2)}
          </Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = theme =>
  StyleSheet.create({
    safeArea: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { padding: spacing.lg },

    successBanner: {
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: radius.xl,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: theme.success + '40',
      ...shadows.md,
    },
    successHeaderRow: {
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: spacing.sm,
    },
    docTypeIcon: {
      fontSize: 28, 
      marginRight: 8,
    },
    successTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.extrabold,
      color: theme.text,
    },
    successSubtitle: {
      fontSize: typography.sizes.sm,
      color: theme.textSecondary,
      textAlign: 'center',
    },

    warningCardInner: {
      flexDirection: 'row', 
      alignItems: 'center', 
      padding: spacing.md,
    },
    warningIcon: {
      fontSize: 20, 
      marginRight: 8,
    },
    warningText: {
      flex: 1, 
      fontWeight: '500',
    },

    metaContainer: {
      padding: spacing.md, 
      paddingHorizontal: spacing.lg,
    },
    metaText: {
      fontSize: typography.sizes.sm, 
      color: theme.textSecondary, 
      marginBottom: 4,
    },
    metaLabel: {
      fontWeight: 'bold',
      color: theme.text,
    },

    card: {
      backgroundColor: theme.card,
      borderRadius: radius.xl,
      overflow: 'hidden',
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.md,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    cardHeaderTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: theme.text,
    },
    cardBadge: {
      backgroundColor: theme.primary + '20',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs / 2,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: theme.primary + '40',
    },
    cardBadgeText: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.bold,
      color: theme.primary,
      letterSpacing: 0.5,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: spacing.lg,
    },

    fieldRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    fieldIconWrap: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    fieldIcon: { fontSize: 20 },
    fieldBody: { flex: 1, justifyContent: 'center' },
    fieldLabel: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold,
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    fieldValue: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.medium,
      color: theme.text,
      lineHeight: 22,
    },
    fieldValueEmpty: {
      color: theme.textSecondary,
      fontStyle: 'italic',
    },
    copyBtn: {
      padding: spacing.xs,
      justifyContent: 'center',
      alignItems: 'center',
    },
    copyIcon: {
      fontSize: 18,
    },

    rawCard: {
      backgroundColor: theme.card,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: theme.border,
    },
    rawTitle: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    rawText: {
      fontSize: typography.sizes.xs,
      color: theme.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },

    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      borderRadius: radius.xl,
      paddingVertical: spacing.md + 2,
      gap: spacing.sm,
      marginBottom: spacing.sm,
      ...shadows.lg,
    },
    primaryBtnIcon: { fontSize: 20 },
    primaryBtnText: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: '#fff',
    },
    secondaryBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderRadius: radius.xl,
      paddingVertical: spacing.md,
      borderWidth: 1.5,
      borderColor: theme.border,
    },
    secondaryBtnText: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
      color: theme.textSecondary,
    },

    rawHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rawChevron: {
      fontSize: 12,
      color: theme.textSecondary,
    },
  });

export default ResultScreen;
