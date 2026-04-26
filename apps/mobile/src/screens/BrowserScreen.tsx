import React from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet } from 'react-native';

interface BrowserScreenProps {
  navigation: any;
  route: any;
}

export default function BrowserScreen({ navigation, route }: BrowserScreenProps) {
  const initialUrl = route?.params?.url || 'https://youtube.com';

  const handleNavigationStateChange = (navState: any) => {
    // Handle URL changes if needed
    console.log('Current URL:', navState.url);
  };

  const shouldStartLoadWithRequest = (request: any) => {
    // Allow all requests
    return true;
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: initialUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        shouldStartLoadWithRequest={shouldStartLoadWithRequest}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        cacheEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Inject JavaScript to extract video URLs when user wants to download
        injectedJavaScript={`
          (function() {
            // Add a listener for video elements
            document.addEventListener('click', function(e) {
              if (e.target.tagName === 'VIDEO') {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'video_clicked',
                  src: e.target.src
                }));
              }
            });
            
            // Expose a function to get current page info
            window.getPageInfo = function() {
              return JSON.stringify({
                url: window.location.href,
                title: document.title
              });
            };
          })();
          true;
        `}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'video_clicked') {
              // Handle video URL extraction
              console.log('Video found:', data.src);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
