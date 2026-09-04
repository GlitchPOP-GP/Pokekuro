import { StyleSheet } from "react-native";

export const captureCardStyles = StyleSheet.create({
  container: {
    width: "90%",
    maxWidth: 360,
    aspectRatio: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 28,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    padding: 24,
    alignSelf: "center",
  },

  centerArea: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  hangerBox: {
    width: 84,
    height: 84,
    borderWidth: 2.5,
    borderColor: "#c4c2c2",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },

  title: {
    marginTop: 18,
    color: "#4B2E1E",
    fontSize: 20,
    fontWeight: "700",
  },

  description: {
    marginTop: 7,
    color: "#75665D",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  captureButton: {
    minHeight: 44,
    marginTop: 18,
    paddingHorizontal: 20,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4B2E1E",
  },

  captureButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  // L-shaped corner guides
  corner: {
    position: "absolute",
    width: 36,
    height: 36,
    borderColor: "#b8b8b8",
    borderWidth: 4,
  },
  topLeft: {
    top: 24,
    left: 24,
    borderTopLeftRadius: 16,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 24,
    right: 24,
    borderTopRightRadius: 16,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 24,
    left: 24,
    borderBottomLeftRadius: 16,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 24,
    right: 24,
    borderBottomRightRadius: 16,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});
