import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const fittingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  avatarSection: {
    height: SCREEN_HEIGHT * 0.44,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },

  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },

  gridLineVert: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#000000",
  },

  gridLineHoriz: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#000000",
  },

  modelContainer: {
    width: "80%",
    maxWidth: 540,
    height: "100%",
    marginTop: 20,
  },
});
