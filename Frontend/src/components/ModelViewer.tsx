import React, { useEffect, useMemo, useState } from 'react';

import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

import { SelectedItems } from '../hooks/useClosetSelection';
import { ClosetItem } from '../types/closet';
import { getApiBaseUrl } from '../api/client';

type Props = {
  selectedItems: SelectedItems;
  items: ClosetItem[];
  onTap?: () => void;
};

// 3D表示は react-three-fiber(expo-gl) をやめ、Backend が配信する
// three.js ページ（/viewer.html）を WebView で表示する方式に変更した。
//
// 理由: @react-three/fiber/native は GLB 本体の読み込みに
// 「ファイル全体をBase64文字列で読んでJS側でデコードし直す」実装が入っており
// （node_modules/@react-three/fiber/native/dist/*.js の FileLoader パッチ）、
// 10MB超のGLBだと数秒単位で重くなる。WebView 内は本物のブラウザエンジンなので
// fetch・画像デコード・WebGLがすべてネイティブ最適化されており、この問題を回避できる。
export default function ModelViewer({
  selectedItems,
  items,
  onTap,
}: Props) {
  const [loading, setLoading] = useState(true);

  const uri = useMemo(() => {
    const base = '/models/koba.glb';
    const params = new URLSearchParams();
    params.set('glb', base);

    // 選択中の各カテゴリのアイテムについて、3Dフィッティングが完了していれば
    // （clothing_items.glb_url が入っていれば）アバターに重ねて表示する。
    // "demo" はプリセットのお試しアイテムなのでGLBを持たず、素のアバターのまま。
    Object.values(selectedItems).forEach((itemId) => {
      if (!itemId || itemId === 'demo') return;
      const item = items.find((i) => i.id === itemId);
      if (item?.glbUrl) {
        params.append('cloth', item.glbUrl);
      }
    });

    return `${getApiBaseUrl()}/viewer.html?${params.toString()}`;
  }, [selectedItems, items]);

  const handleMessage = (event: WebViewMessageEvent) => {
    handleViewerMessage(event.nativeEvent.data);
  };

  const handleViewerMessage = (data: string) => {
    if (data === 'ready') {
      setLoading(false);
    } else if (data === 'tap') {
      onTap?.();
    } else if (data?.startsWith('error:')) {
      console.warn('[ModelViewer]', data);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const expectedOrigin = new URL(uri, window.location.href).origin;
    const onWebMessage = (event: MessageEvent) => {
      if (event.origin !== expectedOrigin || typeof event.data !== 'string') return;
      handleViewerMessage(event.data);
    };

    window.addEventListener('message', onWebMessage);
    return () => window.removeEventListener('message', onWebMessage);
  }, [uri, onTap]);

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === 'web'
        ? React.createElement('iframe', {
            key: uri,
            src: uri,
            title: '3D試着プレビュー',
            onLoad: () => setLoading(false),
            allow: 'fullscreen',
            style: {
              width: '100%',
              height: '100%',
              border: 0,
              display: 'block',
              backgroundColor: 'transparent',
            },
          })
        : (
          <WebView
            key={uri}
            source={{ uri }}
            onMessage={handleMessage}
            onLoadStart={() => setLoading(true)}
            originWhitelist={getApiBaseUrl() ? [`${getApiBaseUrl()}/*`] : ['*']}
            style={{ backgroundColor: 'transparent' }}
            containerStyle={{ backgroundColor: 'transparent' }}
            overScrollMode="never"
            bounces={false}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="never"
            allowsInlineMediaPlayback
          />
        )}

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
