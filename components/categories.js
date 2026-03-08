import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import React from "react";
import { data } from "../constants/data";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";

const Categories = ({ activeCategory, handleChangeCategory }) => {
  // Reorder categories slightly for the reference look
  const categories = ["Recents", "Trending", "Nature", "Animals", ...data.categories.filter(c => !["nature", "animals"].includes(c))];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map((item, index) => {
          const isActive = activeCategory === item;
          const isDark = isActive; // In the reference, active is dark, others are light
          
          return (
            <Pressable
              key={index}
              onPress={() => handleChangeCategory(isActive ? null : item)}
              style={[
                styles.categoryPill,
                { backgroundColor: isDark ? theme.colors.black : theme.colors.grayBG }
              ]}
            >
              <Text 
                style={[
                  styles.categoryText, 
                  { 
                    color: isDark ? theme.colors.white : theme.colors.black,
                    fontWeight: isDark ? theme.fontWeights.semibold : theme.fontWeights.medium 
                  }
                ]}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scrollContainer: {
    paddingHorizontal: wp(4),
    gap: 10,
  },
  categoryPill: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.radius.xl,
  },
  categoryText: {
    fontSize: hp(1.8),
  }
});

export default Categories;
