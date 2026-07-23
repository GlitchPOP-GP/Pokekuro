import { StyleSheet } from "react-native";

export const postDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  fullImage: {
    flex: 1,
  },

  innerContainer: {
    flex: 1,
    justifyContent: "space-between",
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  arrowRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.52)",
    gap: 10,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#888",
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  username: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },

  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },

  followText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  caption: {
    fontSize: 14,
    color: "rgba(255,255,255,0.88)",
    lineHeight: 20,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 20,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  actionText: {
    color: "#fff",
    fontSize: 13,
  },
});
