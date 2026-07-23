import React, { useMemo, useState } from 'react';

import { View, ActivityIndicator, StyleSheet } from 'react-native';
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
    const data = event.nativeEvent.data;
    if (data === 'ready') {
      setLoading(false);
    } else if (data === 'tap') {
      onTap?.();
    } else if (data?.startsWith('error:')) {
      console.warn('[ModelViewer]', data);
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        key={uri}
        source={{ uri }}
        onMessage={handleMessage}
        onLoadStart={() => setLoading(true)}
        originWhitelist={['*']}
        style={{ backgroundColor: 'transparent' }}
        containerStyle={{ backgroundColor: 'transparent' }}
        overScrollMode="never"
        bounces={false}
        javaScriptEnabled
        domStorageEnabled
      />

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
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
