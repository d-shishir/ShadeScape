import { View, Text, StyleSheet, Pressable, Image, Platform, ActivityIndicator, Alert } from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { wp, hp, getFormattedCount } from "../../helpers/common";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { apiCall } from "../../api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

const ImageDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top : 20;
  const [status, setStatus] = useState('');
  const [isFavourite, setIsFavourite] = useState(false);

  // Check if image is in favourites on mount
  useFocusEffect(
    useCallback(() => {
        checkIfFavourite();
    }, [params.id])
  );

  const checkIfFavourite = async () => {
    try {
        const savedFavourites = await AsyncStorage.getItem('favourites');
        if (savedFavourites) {
            const favourites = JSON.parse(savedFavourites);
            setIsFavourite(favourites.some(item => item.id === params.id));
        }
    } catch (e) {
        console.error(e);
    }
  };

  const toggleFavourite = async () => {
    try {
        const savedFavourites = await AsyncStorage.getItem('favourites');
        let favourites = savedFavourites ? JSON.parse(savedFavourites) : [];
        
        if (isFavourite) {
            // Remove from favourites
            favourites = favourites.filter(item => item.id !== params.id);
            setIsFavourite(false);
        } else {
            // Add to favourites
            // Reconstruct the photo object from params
            const photoObj = {
                id: params.id,
                urls: {
                    regular: params.url,
                    full: params.fullUrl,
                    small: params.url // using regular as small for card
                },
                links: {
                    download_location: params.downloadLocation
                },
                user: {
                    name: params.userName,
                    username: params.userHandle
                },
                views: params.views,
                downloads: params.downloads,
                likes: params.likes,
                // We need dimensions for the masonry grid
                width: 1000, 
                height: 1500
            };
            favourites.push(photoObj);
            setIsFavourite(true);
        }
        await AsyncStorage.setItem('favourites', JSON.stringify(favourites));
    } catch (e) {
        console.error("Error toggling favourite:", e);
    }
  };

  // Fallback image handling
  const imageUrl = params.fullUrl || params.url || "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2688&auto=format&fit=crop";
  const views = params.views ? getFormattedCount(parseInt(params.views)) : "N/A";
  const downloads = params.downloads ? getFormattedCount(parseInt(params.downloads)) : "N/A";
  const likes = params.likes ? getFormattedCount(parseInt(params.likes)) : "0";
  const tagsList = params.tags ? params.tags.split(',').map(tag => tag.trim()) : ['Nature'];

  const handleDownloadImage = async () => {
    setStatus('downloading');
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
         setStatus('');
         Alert.alert('Permission Denied', 'Please grant media loop permissions to download.');
         return;
      }

      // Trigger Unsplash Download tracking
      if (params.downloadLocation) {
        await apiCall({ downloadUrl: params.downloadLocation });
      }

      // Download URI -> FileSystem -> Media Library
      let fileName = imageUrl.split('/').pop() || 'wallpaper.jpg';
      const fileUri = FileSystem.documentDirectory + fileName.split('?')[0]; // strip query params for filename

      const downloadRes = await FileSystem.downloadAsync(imageUrl, fileUri);
      if(downloadRes.status !== 200) {
        setStatus('');
        Alert.alert('Error', 'Failed to download image.');
        return;
      }
      
      const asset = await MediaLibrary.createAssetAsync(downloadRes.uri);
      await MediaLibrary.createAlbumAsync("ShadeScape", asset, false);
      setStatus("success");
      Alert.alert('Success', 'Wallpaper successfully saved to gallery!');
    } catch (e) {
      console.log(e);
      setStatus('');
      Alert.alert('Error', 'An error occurred while saving the image.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={{ uri: imageUrl }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Top Navigation Overlay */}
      <View style={[styles.topNav, { paddingTop }]}>
        <Pressable 
            onPress={() => router.back()} 
            style={styles.backButton}
        >
          <BlurView intensity={intensityValue} tint="dark" style={styles.blurContainerRound}>
            <Feather name="arrow-left" size={24} color={theme.colors.white} />
          </BlurView>
        </Pressable>

        <Pressable style={styles.favoriteButton} onPress={toggleFavourite}>
          <BlurView intensity={intensityValue} tint="dark" style={styles.blurContainerRound}>
            <Ionicons name="heart" size={24} color={isFavourite ? "rgba(255, 60, 60, 1)" : theme.colors.white} />
          </BlurView>
        </Pressable>
      </View>

      {/* Bottom Detail Panel with Glassmorphism */}
      <View style={styles.bottomSheetContainer}>
        <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint="dark" style={styles.bottomSheetBlur}>
          
          <View>
            <Text style={styles.imageTitle}>{params.userName ? `Photo by ${params.userName}` : "Beautiful Wallpaper"}</Text>
            <Text style={{color: 'rgba(255,255,255,0.7)', fontSize: hp(1.4), marginTop: 2}}>on Unsplash</Text>
          </View>
          
          <View style={styles.statsContainer}>
             <View style={styles.statBox}>
               <Text style={styles.statValue}>{views}</Text>
               <Text style={styles.statLabel}>Views</Text>
             </View>
             <View style={styles.statBox}>
               <Text style={styles.statValue}>{downloads}</Text>
               <Text style={styles.statLabel}>Downloads</Text>
             </View>
             <View style={styles.statBox}>
               <Text style={styles.statValue}>{likes}</Text>
               <Text style={styles.statLabel}>Likes</Text>
             </View>
          </View>

          <View style={styles.tagsContainer}>
             {tagsList.map((tag, idx) => (
                <View key={idx} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</Text>
                </View>
             ))}
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.actionButtonRound}>
              <Feather name="image" size={24} color={theme.colors.black} />
            </Pressable>
            
            <View style={styles.paginationDots}>
               <Feather name="chevron-right" size={20} color={theme.colors.white} style={{opacity: 0.9}}/>
               <Feather name="chevron-right" size={20} color={theme.colors.white} style={{opacity: 0.6}}/>
               <Feather name="chevron-right" size={20} color={theme.colors.white} style={{opacity: 0.3}}/>
            </View>

            <Pressable style={styles.downloadButton} onPress={handleDownloadImage}>
              {status === 'downloading' ? (
                <ActivityIndicator size="small" color={theme.colors.black} />
              ) : (
                <Feather name="check" size={24} color={theme.colors.black} />
              )}
            </Pressable>
          </View>
        </BlurView>
      </View>
    </View>
  );
};

const intensityValue = Platform.OS === 'ios' ? 30 : 100;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  topNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  blurContainerRound: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backButton: {},
  favoriteButton: {},
  
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: theme.radius.xl * 1.5,
    borderTopRightRadius: theme.radius.xl * 1.5,
    overflow: 'hidden',
  },
  bottomSheetBlur: {
    padding: wp(6),
    paddingBottom: hp(5),
    gap: 20,
  },
  imageTitle: {
    color: theme.colors.white,
    fontSize: hp(2.5),
    fontWeight: theme.fontWeights.semibold,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.radius.lg,
    padding: 10,
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.white,
    fontSize: hp(2),
    fontWeight: theme.fontWeights.bold,
  },
  statLabel: {
    color: theme.colors.neutral(0.7),
    fontSize: hp(1.2),
    marginTop: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: theme.colors.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.xl,
  },
  tagText: {
    color: theme.colors.black,
    fontSize: hp(1.5),
    fontWeight: theme.fontWeights.medium,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtonRound: {
    backgroundColor: theme.colors.white,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDots: {
    flexDirection: 'row',
    gap: -4,
  },
  downloadButton: {
    backgroundColor: 'rgba(255,255,255,0.8)', // Matching the off-white tinted download button in reference
    width: 80,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default ImageDetailScreen;
