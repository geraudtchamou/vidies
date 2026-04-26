import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { videoDownloader, detectPlatform } from '@videotools/core';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchVideo = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a video URL');
      return;
    }

    setIsLoading(true);

    try {
      const platform = detectPlatform(url);
      if (platform === 'unknown') {
        Alert.alert('Unsupported Platform', 'Please enter a URL from YouTube, TikTok, or Instagram');
        setIsLoading(false);
        return;
      }

      const videoInfo = await videoDownloader.fetchVideoInfo(url);
      
      navigation.navigate('VideoDetails', {
        videoInfo,
        sourceUrl: url
      });
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to fetch video info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowsePlatforms = () => {
    navigation.navigate('Browser');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>VideoTools</Text>
        <Text style={styles.subtitle}>Download • Convert • Compress</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* URL Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Paste Video URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor="#9CA3AF"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>

        {/* Fetch Button */}
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleFetchVideo}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Fetch Video Info</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </div>

        {/* Browse Platforms Button */}
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleBrowsePlatforms}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Browse Platforms
          </Text>
        </TouchableOpacity>

        {/* Supported Platforms */}
        <View style={styles.platformsContainer}>
          <Text style={styles.platformsLabel}>Supported platforms:</Text>
          <View style={styles.platforms}>
            <View style={styles.platformBadge}>
              <Text style={styles.platformBadgeText}>YouTube</Text>
            </View>
            <View style={styles.platformBadge}>
              <Text style={styles.platformBadgeText}>TikTok</Text>
            </View>
            <View style={styles.platformBadge}>
              <Text style={styles.platformBadgeText}>Instagram</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresGrid}>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>⬇️</Text>
          <Text style={styles.featureTitle}>Download</Text>
          <Text style={styles.featureDescription}>High quality videos</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🎵</Text>
          <Text style={styles.featureTitle}>Convert</Text>
          <Text style={styles.featureDescription}>Extract audio</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📦</Text>
          <Text style={styles.featureTitle}>Compress</Text>
          <Text style={styles.featureDescription}>Reduce file size</Text>
        </View>
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacyNotice}>
        <Text style={styles.privacyText}>
          🔒 Privacy First: All processing happens on your device
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    background: 'linear-gradient(90deg, #3B82F6 0%, #9333EA 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#374151',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 14,
  },
  platformsContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  platformsLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  platforms: {
    flexDirection: 'row',
    gap: 8,
  },
  platformBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  platformBadgeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  privacyNotice: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 8,
  },
  privacyText: {
    fontSize: 12,
    color: '#1E40AF',
    textAlign: 'center',
  },
});
