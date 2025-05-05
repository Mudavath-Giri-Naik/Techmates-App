// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultconfig = getDefaultConfig(__dirname);
defaultconfig.resolver.assetExts.push('cjs');
defaultconfig.resolver.unstable_enablePackageExports = false;
module.exports = defaultconfig;
