/// <reference types="nativewind/types" />

// Allow side-effect CSS imports (e.g. `import "../global.css"`) — this is
// the file Metro hands to NativeWind's compiler at bundle time.
declare module "*.css";
