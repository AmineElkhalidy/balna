// Babel config for Expo SDK 56 + NativeWind v4 + Reanimated 4.
//
// Order matters:
//   - babel-preset-expo MUST come first.
//   - jsxImportSource: "nativewind" enables NativeWind's JSX transform so the
//     `className` prop on RN components is recognised at type + runtime level.
//   - "nativewind/babel" is required to compile className strings.
//
// Reanimated 4 no longer needs its own plugin (worklets are wired through
// `react-native-worklets` automatically), so we don't list a reanimated entry.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
