const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin to prevent generation and usage of ic_launcher_round on Android.
 */
module.exports = function disableRoundIconPlugin(config) {
  // 1. Remove android:roundIcon attribute from AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];
    if (mainApplication && mainApplication.$) {
      delete mainApplication.$['android:roundIcon'];
    }
    return config;
  });

  // 2. Delete any ic_launcher_round files generated in android/app/src/main/res/mipmap-*
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const resDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/res');
      if (fs.existsSync(resDir)) {
        const mipmapDirs = fs.readdirSync(resDir).filter((d) => d.startsWith('mipmap'));
        for (const dir of mipmapDirs) {
          const mipmapPath = path.join(resDir, dir);
          const roundFiles = fs.readdirSync(mipmapPath).filter((f) => f.startsWith('ic_launcher_round'));
          for (const file of roundFiles) {
            const filePath = path.join(mipmapPath, file);
            try {
              fs.unlinkSync(filePath);
            } catch (e) {
              console.warn(`[disableRoundIconPlugin] Error removing ${file}:`, e.message);
            }
          }
        }
      }
      return config;
    },
  ]);

  return config;
};
