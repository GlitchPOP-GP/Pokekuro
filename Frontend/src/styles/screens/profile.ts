import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  userSection: {
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.07)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  // 設定ボタンのスタイル
  settingsButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    right: 6,
    zIndex: 1,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    marginLeft: 30,
    marginTop: 25,
    backgroundColor: "#e0d5c5",
    overflow: "hidden",
    borderWidth: 2.5,
    borderColor: "#fff",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  statsRow: {
    flex: 1,
    flexDirection: "row",
    // justifyContent: "space-around", // 均等に配置するためのスタイル
    marginTop: 25,
    marginLeft: 20,
  },
  // 投稿数、フォロワー数、フォロー数の各項目を縦に並べるためのスタイル
  statItem: {
    alignItems: "center",
  },
  // 投稿数の数字のフォントやサイズ
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  // 投稿数ラベル
  statLabel: {
    fontSize: 15,
    color: "#666",
    marginTop: 2,
  },
  // ユーザープロフィールの名前
  username: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  // ユーザープロフィールの自己紹介文
  // bio: {
  //   fontSize: 13,
  //   color: "#555",
  //   lineHeight: 19,
  //   marginBottom: 14,
  // },

  gridItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 1,
    backgroundColor: "#e8e0d8",
    overflow: "hidden",
  },

  gridItemImage: {
    width: "100%",
    height: "100%",
  },
  postsGrid: {
    paddingBottom: 96,
  },

  tabRow: {
    width: "100%",
    height: 64,
    flexDirection: "row",
    marginTop: 20,
  },
  
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    width: "65%",
    height: 3,
    backgroundColor: "#333",
  },
  
  emptyContainer: {
    width: "100%",
    paddingVertical: 40,
    alignItems: "center",
  },
  
  emptyText: {
    fontSize: 14,
    color: "#777",
  },
});
