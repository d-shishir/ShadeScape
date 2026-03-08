import { Dimensions } from "react-native";

const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window");

export const wp = (percentage) => {
  const width = deviceWidth;
  return (percentage * width) / 100;
};

export const hp = (percentage) => {
  const height = deviceHeight;
  return (percentage * height) / 100;
};

// Formats large numbers into string abbreviations (e.g., 1000 -> "1K")
export const getFormattedCount = (count) => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count?.toString();
};

export const getImageSize = (height, width) => {
  if (width > height) {
    // landscape
    return 250;
  } else if (width < height) {
    // portrait
    return 300;
  } else {
    // square
    return 200;
  }
};
