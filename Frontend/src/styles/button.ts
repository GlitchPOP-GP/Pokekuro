import { StyleSheet } from "react-native";

export const buttonStyles = StyleSheet.create({
    button: {
        width: "100%",
        maxWidth: 380,
        paddingVertical: 18,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#4B2E1E",
        borderWidth: 1,
        borderColor: "#4B2E1E",
    },

    disabled: {
        opacity: 0.55,
    },

    text: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});
