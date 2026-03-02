const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.watchFolders = [
  path.resolve(__dirname, 'expo-app'),
  path.resolve(__dirname, 'shared'),
];

config.resolver.blockList = [
  /src\/app\/api\/.*/,
  /node_modules\/next\/.*/,
  /\.next\/.*/,
];

module.exports = config;
