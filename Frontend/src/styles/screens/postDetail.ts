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
  followingButton: {
    backgroundColor: "rgba(255,255,255,0.24)",
  },

  caption: {
    flex: 1,
    fontSize: 14,
    color: "rgba(255,255,255,0.88)",
    lineHeight: 20,
  },

  captionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  keepButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(75,46,30,0.94)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
  },

  keptButton: {
    backgroundColor: "#F8F3EC",
    borderColor: "#F8F3EC",
  },

  keepButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  keptButtonText: {
    color: "#4B2E1E",
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
  missingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    backgroundColor: "#f4eee7",
  },
  missingTitle: {
    color: "#3f3129",
    fontSize: 20,
    fontWeight: "800",
  },
  missingText: {
    marginTop: 8,
    color: "#796a60",
    fontSize: 14,
    textAlign: "center",
  },
  backButton: {
    marginTop: 22,
    borderRadius: 20,
    backgroundColor: "#4b2e1e",
    paddingHorizontal: 24,
    paddingVertical: 11,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
