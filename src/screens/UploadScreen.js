import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import ImagePreview from '../components/ImagePreview';
import FilePreview from '../components/FilePreview';
import { extractDocument } from '../services/api';
import {
  DOCUMENT_TYPES,
  FILE_TYPES,
  MAX_FILE_SIZE_MB,
} from '../utils/constants';
import { useTheme, spacing, radius, typography, shadows } from '../utils/theme';

const UploadScreen = ({ navigation }) => {
  const theme = useTheme();

  const [documentType, setDocumentType] = useState('');
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  const styles = makeStyles(theme);

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: uploadProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [uploadProgress, progressAnim]);

  const handleImageResponse = useCallback((result, setter) => {
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset) return;

    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setError('');
    setter({
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.fileName || `image_${Date.now()}.jpg`,
      fileName: asset.fileName || `image_${Date.now()}.jpg`,
      fileSize: asset.fileSize,
      fileType: FILE_TYPES.IMAGE,
    });
  }, []);

  const pickImage = useCallback(
    async setter => {
      Alert.alert('Select Source', 'Choose how to add the image', [
        {
          text: 'Camera',
          onPress: async () => {
            const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraResult.status !== 'granted') {
              Alert.alert('Permission Required', 'Camera permission is needed to take a photo.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              allowsEditing: false,
            });
            handleImageResponse(result, setter);
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const mediaResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaResult.status !== 'granted') {
              Alert.alert('Permission Required', 'Photo library permission is needed to pick an image.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              allowsEditing: false,
            });
            handleImageResponse(result, setter);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [handleImageResponse],
  );

  const pickPDF = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset) return;

      if (asset.size && asset.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`PDF too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }

      setError('');
      setPdfFile({
        uri: asset.uri,
        type: asset.mimeType || 'application/pdf',
        name: asset.name || `document_${Date.now()}.pdf`,
        fileName: asset.name || `document_${Date.now()}.pdf`,
        fileSize: asset.size,
        fileType: FILE_TYPES.PDF,
      });
    } catch (err) {
      setError('Failed to pick PDF. Please try again.');
    }
  }, []);

  const validate = () => {
    if (!documentType) {
      setError('Please select a document type.');
      return false;
    }
    if (!frontImage && !pdfFile) {
      setError('Please upload at least a front image or PDF.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validate()) return;

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const rawResult = await extractDocument(
        { documentType, frontImage, backImage, pdfFile },
        progress => {
          setUploadProgress(progress);
        }
      );

      if (rawResult.status && rawResult.status !== "success") {
        setIsLoading(false);
        setError(rawResult.reason || "Extraction failed");
        return;
      }

      navigation.navigate('ResultScreen', {
        rawResult,
        documentType,
      });
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Document Scanner</Text>
        <Text style={styles.headerSubtitle}>
          Upload your identity document for AI extraction
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Type</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              mode="dropdown"
              selectedValue={documentType}
              onValueChange={val => {
                setDocumentType(val);
                setError('');
              }}
              style={[styles.picker, { color: theme.text }]}
              itemStyle={{ color: theme.text, fontSize: 16, height: Platform.OS === 'ios' ? 120 : 52 }}
              dropdownIconColor={theme.primary}
            >
              {DOCUMENT_TYPES.map(dt => (
                <Picker.Item
                  key={dt.value}
                  label={dt.label}
                  value={dt.value}
                  color={Platform.OS === 'ios' ? theme.text : theme.text}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Files</Text>

          <TouchableOpacity
            style={[styles.uploadBtn, frontImage && styles.uploadBtnDone]}
            onPress={() => pickImage(setFrontImage)}
            activeOpacity={0.8}
          >
            <Text style={styles.uploadBtnIcon}>{frontImage ? '✅' : '📷'}</Text>
            <View style={styles.uploadBtnTextWrap}>
              <Text style={styles.uploadBtnLabel}>
                {frontImage ? 'Front Image Selected' : 'Upload Front Image'}
              </Text>
              <Text style={styles.uploadBtnHint}>
                Camera or Gallery · Required
              </Text>
            </View>
            <Text style={styles.uploadBtnArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadBtn, backImage && styles.uploadBtnDone]}
            onPress={() => pickImage(setBackImage)}
            activeOpacity={0.8}
          >
            <Text style={styles.uploadBtnIcon}>{backImage ? '✅' : '🔄'}</Text>
            <View style={styles.uploadBtnTextWrap}>
              <Text style={styles.uploadBtnLabel}>
                {backImage ? 'Back Image Selected' : 'Upload Back Image'}
              </Text>
              <Text style={styles.uploadBtnHint}>
                Camera or Gallery · Optional
              </Text>
            </View>
            <Text style={styles.uploadBtnArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadBtn, pdfFile && styles.uploadBtnDone]}
            onPress={pickPDF}
            activeOpacity={0.8}
          >
            <Text style={styles.uploadBtnIcon}>{pdfFile ? '✅' : '📎'}</Text>
            <View style={styles.uploadBtnTextWrap}>
              <Text style={styles.uploadBtnLabel}>
                {pdfFile ? 'PDF Selected' : 'Upload PDF Document'}
              </Text>
              <Text style={styles.uploadBtnHint}>
                PDF files only · Optional
              </Text>
            </View>
            <Text style={styles.uploadBtnArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {(frontImage || backImage || pdfFile) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Files</Text>
            {frontImage && (
              <ImagePreview
                file={frontImage}
                label="Front Side"
                onRemove={() => setFrontImage(null)}
              />
            )}
            {backImage && (
              <ImagePreview
                file={backImage}
                label="Back Side"
                onRemove={() => setBackImage(null)}
              />
            )}
            {pdfFile && (
              <FilePreview
                file={pdfFile}
                label="PDF Document"
                onRemove={() => setPdfFile(null)}
              />
            )}
          </View>
        )}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {isLoading && uploadProgress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[styles.progressFill, { width: progressWidth }]}
              />
            </View>
            <Text style={styles.progressText}>{uploadProgress}% uploaded</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.submitBtn,
            (isLoading || (!frontImage && !pdfFile)) &&
              styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <View style={styles.submitBtnContent}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitBtnText}>Extracting...</Text>
            </View>
          ) : (
            <View style={styles.submitBtnContent}>
              <Text style={styles.submitBtnIcon}>🔍</Text>
              <Text style={styles.submitBtnText}>Extract Document</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = theme =>
  StyleSheet.create({
    safeArea: { flex: 1 },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: typography.sizes.xxl,
      fontWeight: typography.weights.extrabold,
      color: theme.text,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: typography.sizes.sm,
      color: theme.textSecondary,
      marginTop: spacing.xs,
    },
    scroll: { flex: 1 },
    scrollContent: { padding: spacing.lg },

    section: { marginBottom: spacing.lg },
    sectionTitle: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.sm,
    },

    pickerWrapper: {
      backgroundColor: theme.card,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: theme.border,
      overflow: 'hidden',
      justifyContent: 'center',
      ...shadows.sm,
    },
    picker: {
      height: Platform.OS === 'ios' ? 120 : 52,
      width: '100%',
      backgroundColor: 'transparent',
    },

    uploadBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: theme.border,
      padding: spacing.md,
      marginBottom: spacing.sm,
      ...shadows.sm,
    },
    uploadBtnDone: {
      borderColor: theme.success,
      backgroundColor: theme.card,
    },
    uploadBtnIcon: { fontSize: 24, marginRight: spacing.md },
    uploadBtnTextWrap: { flex: 1 },
    uploadBtnLabel: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
      color: theme.text,
    },
    uploadBtnHint: {
      fontSize: typography.sizes.xs,
      color: theme.textSecondary,
      marginTop: 2,
    },
    uploadBtnArrow: {
      fontSize: 22,
      color: theme.textSecondary,
      marginLeft: spacing.sm,
    },

    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.errorBg,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: theme.error,
      gap: spacing.sm,
    },
    errorIcon: { fontSize: 18 },
    errorText: {
      flex: 1,
      fontSize: typography.sizes.sm,
      color: theme.error,
      fontWeight: typography.weights.medium,
    },

    progressContainer: { marginBottom: spacing.md },
    progressTrack: {
      height: 6,
      backgroundColor: theme.border,
      borderRadius: radius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.primary,
      borderRadius: radius.full,
    },
    progressText: {
      fontSize: typography.sizes.xs,
      color: theme.textSecondary,
      textAlign: 'right',
      marginTop: spacing.xs,
    },

    submitBtn: {
      backgroundColor: theme.primary,
      borderRadius: radius.xl,
      paddingVertical: spacing.md + 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.sm,
      ...shadows.lg,
    },
    submitBtnDisabled: {
      backgroundColor: theme.textDisabled,
      ...shadows.sm,
    },
    submitBtnContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    submitBtnIcon: { fontSize: 20 },
    submitBtnText: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: '#fff',
      letterSpacing: 0.3,
    },
  });

export default UploadScreen;
