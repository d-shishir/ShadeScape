// Force bundle-busting for iOS Metro cache: 2026-03-08-v2
import { View, Text, StyleSheet, Pressable, TextInput, Image, ActivityIndicator, Platform } from "react-native";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { wp, hp, getImageSize } from "../../helpers/common";
import { useRouter } from "expo-router";
import Categories from "../../components/categories";
import { apiCall } from "../../api";
import { FlashList } from "@shopify/flash-list";

let page = 1;

const HomeScreen = () => {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 10 : 30;
  
  const [search, setSearch] = useState("");
  const searchInputRef = useRef(null);
  
  const [wallpapers, setWallpapers] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isEndReached, setIsEndReached] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async (params = { page: 1 }, append = true) => {
    setLoading(true);
    let res = await apiCall(params);
    setLoading(false);
    
    if (res.success && res.data) {
      if (res.data.length === 0) {
        setIsEndReached(true);
        return;
      }
      if (append) {
        setWallpapers([...wallpapers, ...res.data]);
      } else {
        setWallpapers([...res.data]);
        setIsEndReached(false);
      }
    }
  };

  const handleChangeCategory = (cat) => {
    setActiveCategory(cat);
    clearSearch();
    page = 1;
    let params = {
      page,
      category: cat
    };
    fetchImages(params, false);
  };

  const handleSearch = (text) => {
    setSearch(text);
    if(text.length > 2) {
      page = 1;
      setActiveCategory(null);
      fetchImages({ page, query: text }, false);
    }
    if (text == "") {
      page = 1;
      searchInputRef?.current?.clear();
      setActiveCategory(null);
      fetchImages({ page }, false);
    }
  };

  const clearSearch = () => {
    setSearch("");
    searchInputRef?.current?.clear();
  };

  const ImageCard = ({ item, index }) => {
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
            likes: item.likes
          }})}
        >
          <Image source={{uri: item.urls.small}} style={[styles.feedImage, {height: imageHeight}]} />
          <View style={styles.heartButton}>
            <Ionicons name="heart" size={18} color={theme.colors.white} />
          </View>
        </Pressable>
      </View>
    );
  };

  const applyNavigation = () => {
     page = 1;
     setActiveCategory(null);
     clearSearch();
     fetchImages({ page }, false);
  };

  return (
    <View style={[styles.container, { paddingTop }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable>
            <FontAwesome6 name="bars" size={24} color={theme.colors.black} />
          </Pressable>
          <Text style={styles.title}>4K Wallpaper</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="notifications" size={20} color={theme.colors.neutral(0.7)} />
          </Pressable>
          <Pressable>
            <View style={styles.avatarPlaceholder} />
          </Pressable>
        </View>
      </View>

      <View style={styles.SearchBar}>
          <View style={styles.searchIcon}>
            <Feather
              name="search"
              size={24}
              color={theme.colors.neutral(0.4)}
            />
          </View>
          <TextInput
            placeholder="Search for photos..."
            value={search}
            ref={searchInputRef}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
          {search && (
            <Pressable style={styles.closeIcon} onPress={clearSearch}>
               <Ionicons
                 name="close"
                 size={24}
                 color={theme.colors.neutral(0.6)}
               />
             </Pressable>
          )}
      </View>

      {/* category section */}
      <View style={styles.categories}>
          <Categories activeCategory={activeCategory} handleChangeCategory={handleChangeCategory}/>
      </View>

      {/* Masonry Grid via FlashList */}
      <View style={{ flex: 1, paddingHorizontal: wp(4) }}>
        <FlashList
          data={wallpapers}
          numColumns={2}
          masonry={true}
          initialNumToRender={10}
          contentContainerStyle={styles.listContainerStyle}
          renderItem={({ item, index }) => <ImageCard item={item} index={index} />}
          estimatedItemSize={200}
          onEndReached={() => {
            if (!isEndReached && !loading) {
               page++;
               let params = { 
                 page, 
                 category: activeCategory, 
                 query: search 
               };
               fetchImages(params, true);
            }
          }}
          onEndReachedThreshold={0.2}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loading && !isEndReached ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color={theme.colors.neutral(0.3)} />
              </View>
            ) : null
          }
        />
      </View>

      {/* Floating Bottom Navigation */}
      <View style={[styles.bottomNavContainer, { paddingBottom: top > 0 ? top : 20 }]}>
         <View style={styles.bottomNav}>
            <Pressable style={styles.navItem} onPress={applyNavigation}>
              <View style={styles.navActiveIndicator}>
                <Ionicons name="home" size={20} color={theme.colors.black} />
              </View>
            </Pressable>
            <Pressable style={styles.navItem}>
              <Ionicons name="grid" size={22} color={theme.colors.white} />
            </Pressable>
            <Pressable style={styles.navItem} onPress={() => router.push("home/favourites")}>
              <Ionicons name="heart" size={24} color={theme.colors.white} />
            </Pressable>
         </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
  },
  header: {
    marginHorizontal: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.black,
  },
  iconButton: {
    backgroundColor: theme.colors.grayBG,
    padding: 8,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ccc', // Placeholder for actual image
  },
  SearchBar: {
    marginHorizontal: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.grayBG,
    backgroundColor: theme.colors.white,
    padding: 2,
    paddingLeft: 12,
    borderRadius: theme.radius.xl,
  },
  searchIcon: {
    padding: 8,
  },
  searchInput: {
    flex: 1,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    fontSize: hp(1.8),
  },
  closeIcon: {
    padding: 8,
    borderRadius: theme.radius.sm,
  },
  column: {
    flex: 1,
    gap: 10,
  },
  imageCard: {
    position: 'relative',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  feedImage: {
    width: '100%',
    borderRadius: theme.radius.lg,
  },
  heartButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255, 60, 60, 0.95)', // Vibrant red for active heart like reference
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 20, 30, 0.75)', // Dark glassmorphic background
    borderRadius: 40,
    paddingHorizontal: 25,
    paddingVertical: 12,
    gap: 30,
    alignItems: 'center',
  },
  navItem: {
    padding: 8,
  },
  navActiveIndicator: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  listContainerStyle: {
    paddingBottom: 100,
  },
  loader: {
    width: '100%',
    marginTop: 30,
    marginBottom: 100,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
export default HomeScreen;
