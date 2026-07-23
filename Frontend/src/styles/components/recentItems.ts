import { StyleSheet } from "react-native";

export const recentItemsStyles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },

  titleWrapper: {
    marginLeft: 24,
    marginBottom: 18,
  },

  list: {
    paddingLeft: 24,
    paddingRight: 24,
  },

  itemCard: {
    width: 120,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",

    marginRight: 10,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },

  imageWrapper: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  itemImage: {
    width: "100%",
    height: 120,
  },

  info: {
    height: 38,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  itemName: {
  fontSize: 13,
  fontWeight: "600",
}

});