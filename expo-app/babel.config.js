module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@shared': '../shared',
            '@': './',
          },
        },
      ],
      'react-native-reanimated/plugin', // Keep this if you use Reanimated
    ],
  };
};