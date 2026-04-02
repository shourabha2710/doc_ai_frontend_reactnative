import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

const FilePreview = ({ file, onRemove }) => {

    const isImage = file?.type?.includes("image");

    return (
        <View style={styles.card}>

            {isImage ? (
                <Image source={{ uri: file.uri }} style={styles.image} />
            ) : (
                <Text style={styles.fileText}>{file.name}</Text>
            )}

            <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => onRemove(file)}
            >
                <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 10,
        margin: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8
    },
    fileText: {
        fontSize: 16
    },
    removeBtn: {
        marginTop: 5
    },
    removeText: {
        color: "red"
    }
});

export default FilePreview;