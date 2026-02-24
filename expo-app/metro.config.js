const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const projectRoot = path.resolve(__dirname, '..');

// 1. Force Metro to resolve from the root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// 2. Watch the root for shared code and services
config.watchFolders = [
  projectRoot,
  path.resolve(projectRoot, 'shared'),
  path.resolve(projectRoot, 'services'),
];

// 3. Block backend routes
config.resolver.blockList = [
  /src\/app\/api\/.*/,
  /node_modules\/next\/.*/,
];

module.exports = config;