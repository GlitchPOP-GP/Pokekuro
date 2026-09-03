import { StyleSheet } from "react-native";

export const footerStyles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(255, 255, 255, 0.56)",
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.12)",
        overflow: 'hidden', 
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 10,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },

    button: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 58,
    },

    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },

    activeIconWrap: {
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    label: {
        color: "#746a63",
        fontSize: 10,
        fontWeight: "600",
        marginTop: -3,
    },
    activeLabel: {
        color: "#2f241e",
        fontWeight: "800",
    },
});
