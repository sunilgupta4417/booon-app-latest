// react-native.config.js
module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null,
      },
    },
  },
  project: {
    ios: {
      sourceDir: './ios',
    },
  },
  assets: ['./assets/fonts'],
};
