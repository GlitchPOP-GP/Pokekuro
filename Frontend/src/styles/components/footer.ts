export const footerStyles =({
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
    },

    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },

    activeIconWrap: {
        backgroundColor: "#rgba(255, 255, 255, 0.85)",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
});
