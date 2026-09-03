import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },

  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingTop: 20,
  },

  addItemButton: {
    width: 330,
    height: 160,
    marginLeft: 30,
    borderRadius: 14,
    marginBottom: 35,
    overflow: "hidden",
  },

  addItemBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  addItemOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },

  addItemText: {
    paddingHorizontal: 20,
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    zIndex: 1,
  },
});
