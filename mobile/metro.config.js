// Metro config — wraps Expo's default config with NativeWind's CSS pipeline.
// The `input` path points at the file that contains the @tailwind directives;
// NativeWind compiles it into runtime style atoms at bundle time.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
