import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ITEM_SIZE = (SCREEN_WIDTH - 3) / 3;

export const shopStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    alignSelf: "center",
  },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },

  searchTouchable: {
    width: "100%",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 44,
    borderRadius: 14,
    overflow: "hidden",
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.55)",
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    margin: 0,
    marginBottom: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    borderRadius: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  gridContent: {
    paddingBottom: 90,
  },

  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.35,
    margin: 0.5,
    backgroundColor: "#e8e0d8",
    overflow: "hidden",
  },

  gridItemImage: {
    width: "100%",
    height: "100%",
  },

  userBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.42)",
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 7,
    gap: 4,
  },

  userAvatarDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  userName: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  modalContainer: {
    flex: 1,
    position: "relative",
  },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },

  modalSearchHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
});