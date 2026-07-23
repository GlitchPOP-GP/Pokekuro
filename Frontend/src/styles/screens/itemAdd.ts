import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const itemAddStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.01)",
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 110, // Avoid bottom tab bar overlapping
    alignItems: "center",
    gap: 16,
  },
  imageCard: {
    width: "100%",
    aspectRatio: 1.05,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 24,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
  formContainer: {
    width: "100%",
    gap: 16,
    marginTop: 8,
  },
  confirmButton: {
    width: "60%", // Make button layout match the reference screenshot (centered, medium width)
    backgroundColor: "#000000",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    alignSelf: "center",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
