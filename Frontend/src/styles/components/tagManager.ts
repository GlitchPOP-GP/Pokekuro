import { StyleSheet } from "react-native";

export const tagManagerStyles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5d5c5",
    padding: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eae0d5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d5c5b5",
  },
  tagText: {
    fontSize: 14,
    color: "#4a4a4a",
    fontWeight: "500",
  },
  xIcon: {
    marginLeft: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 120,
    flex: 1,
  },
  input: {
    flex: 1,
    height: 30,
    fontSize: 14,
    color: "#111",
    paddingVertical: 0,
  },
  addButton: {
    padding: 4,
  },
});
