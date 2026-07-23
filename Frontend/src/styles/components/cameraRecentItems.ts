import { StyleSheet } from "react-native";

export const recentItemsStyles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 20,
  },

  titleWrapper: {
    marginLeft: 30,
    marginBottom: 16,
  },

  list: {
    paddingLeft: 30,
    paddingRight: 15,
  },

  column: {
    flexDirection: "column",
    marginRight: 16,
  },

  itemCard: {
    width: 96,
    aspectRatio: 0.85,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 6,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
    borderColor: "transparent",
    borderWidth: 2,
    marginBottom: 12,
  },

  itemImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    resizeMode: "cover",
  },
});
