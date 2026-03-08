import { StyleSheet, Text, View, Image, Pressable, Platform } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { wp, hp } from "../helpers/common";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { theme } from "../constants/theme";
import { useRouter } from "expo-router";

// This screen uses local images for a high-performance onboarding experience.
// No network or download tracking is needed here.

const WELCOME_IMAGES = [
  require("../assets/images/welcome1.jpg"),
  require("../assets/images/welcome2.jpg"),
  require("../assets/images/welcome3.jpg"),
  require("../assets/images/welcome4.jpg"),
  require("../assets/images/welcome5.jpg"),
  require("../assets/images/welcome6.jpg"),
  require("../assets/images/welcome7.jpg"),
  require("../assets/images/welcome8.jpg"),
  require("../assets/images/welcome9.jpg"),
  require("../assets/images/welcome10.jpg"),
  require("../assets/images/welcome11.jpg"),
  require("../assets/images/welcome12.jpg"),
];

const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Dynamic Background Layout matching Reference */}
      <View style={styles.masonryContainer}>
        <View style={styles.column}>
          {WELCOME_IMAGES.slice(0, 4).map((img, i) => (
            <Image key={`col1-${i}`} source={img} style={[styles.gridImage, { height: i % 2 === 0 ? 150 : 200 }]} />
          ))}
        </View>
        <View style={styles.column}>
          {WELCOME_IMAGES.slice(4, 8).map((img, i) => (
             <Image key={`col2-${i}`} source={img} style={[styles.gridImage, { height: i % 2 === 0 ? 220 : 130 }]} />
          ))}
        </View>
        <View style={styles.column}>
          {WELCOME_IMAGES.slice(8, 12).map((img, i) => (
             <Image key={`col3-${i}`} source={img} style={[styles.gridImage, { height: i % 2 === 0 ? 140 : 210 }]} />
          ))}
        </View>
      </View>
      <Animated.View entering={FadeInDown.duration(600)} style={{ flex: 1 }}>
        <LinearGradient
          colors={[
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.5)",
            "white",
            "white",
          ]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.8 }}
        />
        <View style={styles.contentContainer}>
          <Animated.Text
            entering={FadeInDown.delay(400).springify()}
            style={styles.title}
          >
            Explore 4K{"\n"}Wallpapers
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(500).springify()}
            style={styles.punchline}
          >
            Explore, Create, Share{"\n"}Ultra 4K Wallpapers Now!
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(600).springify()}>
            <Pressable
              onPress={() => {
                router.push("home");
              }}
              style={styles.startButton}
            >
              <Text style={styles.startText}>Start Explore</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA', // Light bg based on reference
  },
  masonryContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: -hp(5),
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8,
    gap: 8,
    zIndex: 0,
  },
  column: {
    flex: 1,
    gap: 8,
  },
  gridImage: {
    width: '100%',
    borderRadius: theme.radius.md,
    resizeMode: 'cover',
    backgroundColor: '#eee', // Placeholder color if image fails
  },
  gradient: {
    width: wp(100),
    height: hp(55),
    bottom: 0,
    position: "absolute",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 14,
  },
  title: {
    fontSize: hp(5.5),
    color: theme.colors.black,
    fontWeight: theme.fontWeights.bold,
    textAlign: "center",
    lineHeight: hp(6.5),
  },
  punchline: {
    fontSize: hp(2),
    letterSpacing: 0.5,
    marginBottom: 20,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.neutral(0.6),
    textAlign: "center",
    lineHeight: hp(3),
  },
  startButton: {
    marginBottom: 50,
    backgroundColor: theme.colors.neutral(0.9),
    padding: 18,
    paddingHorizontal: 100,
    borderRadius: theme.radius.xl * 1.5,
  },
  startText: {
    color: theme.colors.white,
    fontSize: hp(2.5),
    fontWeight: theme.fontWeights.medium,
    letterSpacing: 0.5,
  },
});
