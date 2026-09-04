import { StyleSheet } from "react-native";
const CARD_HEIGHT = 240;

export const todayPickStyles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 20,
    marginTop: 30,
    alignItems: "center",
    paddingHorizontal: 15,
  },
  cardFrame: {
    height: CARD_HEIGHT + 20,

    backgroundColor: "#F8F3EC",

    borderRadius: 30,

    padding: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 6,
  },

  container: {
    flex: 1,

    borderRadius: 25,
    overflow: "hidden",
  },
  card: {
    width: "100%",
    height: CARD_HEIGHT,

    backgroundColor: "#F8F3EC",

    borderRadius: 22,

    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 6,
  },

  video: {
    ...StyleSheet.absoluteFill,
  },

  thumbnailContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: 5,
  },

  thumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 6,
  },

  /* ==========================
      TODAY'S PICK
  ========================== */

  header: {
    position: "absolute",

    top: 18,
    left: 20,
    right: 20,

    zIndex: 20,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
  },

  arrow: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "700",
  },

  /* ==========================
      PLAY
  ========================== */

  playButton: {
    position: "absolute",

    width: 72,
    height: 72,

    borderRadius: 40,

    backgroundColor: "rgba(0,0,0,0.45)",

    justifyContent: "center",
    alignItems: "center",

    top: "50%",
    left: "50%",

    marginTop: -36,
    marginLeft: -36,

    zIndex: 12,
  },

  playIcon: {
    color: "#FFF",
    fontSize: 30,
    marginLeft: 5,
  },

  /* ==========================
      下情報
  ========================== */

  infoContainer: {
    position: "absolute",

    left: 20,
    right: 20,
    bottom: 55,

    zIndex: 15,
  },

  user: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  videoTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },

  /* ==========================
      Indicator
  ========================== */

  indicatorContainer: {
    position: "absolute",

    bottom: 18,
    left: 0,
    right: 0,

    flexDirection: "row",
    justifyContent: "center",

    zIndex: 20,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.45)",
    marginHorizontal: 4,
  },

  activeDot: {
    width: 26,
    borderRadius: 4,
    backgroundColor: "#FFF",
  },
  emptyState: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8d7768",
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 1,
  },
  emptyText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    marginTop: 8,
  },
});
