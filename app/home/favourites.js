import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { wp, hp, getImageSize } from "../../helpers/common";
import { useRouter, useFocusEffect } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from "react-native";

const FavouritesScreen = () => {
    const router = useRouter();
    const { top } = useSafeAreaInsets();
    const paddingTop = top > 0 ? top + 10 : 30;
    
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadFavourites = async () => {
        setLoading(true);
        try {
            const savedFavourites = await AsyncStorage.getItem('favourites');
            if (savedFavourites) {
                setFavourites(JSON.parse(savedFavourites));
            } else {
                setFavourites([]);
            }
        } catch (error) {
            console.error("Error loading favourites:", error);
        } finally {
            setLoading(false);
        }
    };

    // Reload favourites every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadFavourites();
        }, [])
    );

    const ImageCard = ({ item }) => {
        // Since we stored the photo object, we can calculate height
        let imageHeight = getImageSize(item.height, item.width);

        return (
            <View style={{ padding: 5 }}>
                <Pressable 
                    style={[styles.imageCard, { height: imageHeight }]} 
                    onPress={() => router.push({ pathname: "home/image", params: { 
                        id: item.id,
                        url: item.urls.regular, 
                        fullUrl: item.urls.full,
                        downloadLocation: item.links.download_location,
                        userName: item.user.name,
                        userHandle: item.user.username,
                        views: item.views, 
                        downloads: item.downloads,
                        likes: item.likes,
                        // Add a flag to indicate it's from favourites if needed
                    }})}
                >
                    <Image source={{ uri: item.urls.small }} style={[styles.feedImage, { height: imageHeight }]} />
                    <View style={styles.heartButton}>
                        <Ionicons name="heart" size={18} color="rgba(255, 60, 60, 0.95)" />
                    </View>
                </Pressable>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop }]}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.black} />
                </Pressable>
                <Text style={styles.title}>Favourites</Text>
                <View style={{ width: 24 }} /> 
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.black} />
                </View>
            ) : favourites.length > 0 ? (
                <View style={{ flex: 1, paddingHorizontal: wp(2) }}>
                    <FlashList
                        data={favourites}
                        numColumns={2}
                        masonry={true}
                        renderItem={({ item }) => <ImageCard item={item} />}
                        estimatedItemSize={200}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 50 }}
                    />
                </View>
            ) : (
                <View style={styles.center}>
                    <Feather name="heart" size={50} color={theme.colors.neutral(0.2)} />
                    <Text style={styles.emptyText}>No favourites yet.</Text>
                    <Pressable style={styles.exploreButton} onPress={() => router.push("home")}>
                        <Text style={styles.exploreText}>Explore Wallpapers</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: theme.colors.grayBG,
        padding: 8,
        borderRadius: 12,
    },
    title: {
        fontSize: hp(2.5),
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.black,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
    },
    imageCard: {
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
        backgroundColor: theme.colors.grayBG,
    },
    feedImage: {
        width: '100%',
        borderRadius: theme.radius.lg,
    },
    heartButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'white',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    emptyText: {
        fontSize: hp(2),
        color: theme.colors.neutral(0.5),
        fontWeight: theme.fontWeights.medium,
    },
    exploreButton: {
        backgroundColor: theme.colors.black,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: theme.radius.xl,
        marginTop: 10,
    },
    exploreText: {
        color: 'white',
        fontWeight: theme.fontWeights.semibold,
    }
});

export default FavouritesScreen;
