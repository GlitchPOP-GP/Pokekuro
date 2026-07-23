import { StyleSheet } from "react-native";

export const mockTabBarStyles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  row: {
    flexDirection: "row",
    height: 70,
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 8,
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    padding: 6,
  },
  centerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
});
