const path = require('path');
const { getDefaultConfig } = require(
  path.resolve(__dirname, '../node_modules/expo/metro-config')
);

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules'),
];

config.resolver.blockList = [
  /src\/app\/api\/.*/,
  /node_modules\/next\/.*/,
];

module.exports = config;
