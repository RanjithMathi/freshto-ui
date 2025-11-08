// src/components/CircleMenu.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';

type Props = {
  title: string;
  iconUri: ImageSourcePropType;
  onPress?: () => void;
};

const CircleMenu = ({ title, iconUri, onPress }: Props) => {
  // Extract Tamil and English text from the title
  const extractTexts = (fullTitle: string) => {
    // Match pattern: "English (Tamil)"
    const match = fullTitle.match(/^(.+?)\s*\((.+?)\)$/);
    if (match) {
      return {
        tamil: match[2].trim(),
        english: match[1].trim(),
      };
    }
    // If pattern doesn't match, return the full title
    return {
      tamil: '',
      english: fullTitle,
    };
  };

  const { tamil, english } = extractTexts(title);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.circle}>
        <Image source={iconUri} style={styles.icon} />
      </View>
      <View style={styles.textContainer}>
        {tamil && <Text style={styles.tamilLabel}>{tamil}</Text>}
        <Text style={styles.englishLabel}>{english}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 12,
    width: 90, // Fixed width to ensure consistent spacing
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f1e9eaff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F3CF4B',
  },
  icon: {
    width: 70,
    height: 70,
    resizeMode: 'cover',
  },
  textContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  tamilLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  englishLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default CircleMenu;