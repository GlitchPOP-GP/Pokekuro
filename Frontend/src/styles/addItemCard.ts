import { StyleSheet } from "react-native";

export const addItemCardStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        marginHorizontal: 15,
        marginTop: 10,
        marginBottom: 30,

        paddingHorizontal: 20,
        paddingVertical: 22,

        backgroundColor: "#F8F3EC",
        borderRadius: 28,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
    },

    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    textContainer: {
        flex: 1,
        flexShrink: 1,
    },

    previewContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
    },

    previewImage: {
        width: 55,
        height: 55,
        borderRadius: 12,
        marginLeft: -10,
    },

    plusButton: {
        width: 50,
        height: 50,
        borderRadius: 32,

        backgroundColor: "#4B2E1E",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 16,
    },

    plusText: {
        color: "#FFFFFF",
        fontSize: 38,
        fontWeight: "300",
        lineHeight: 40,
    },

    title: {
        color: "#4B2E1E",
        fontSize: 16,
        fontWeight: "700",
        lineHeight: 24,
    },

    subtitle: {
        color: "#4B2E1E",
        fontSize: 12,
        fontWeight: "400",
        lineHeight: 16,
    },
});