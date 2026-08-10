const { withAndroidManifest } = require("@expo/config-plugins");

const withTabletOrientation = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainActivity =
      config.modResults.manifest.application?.[0]?.activity?.find(
        (a) => a.$["android:name"] === ".MainActivity",
      );

    if (mainActivity) {
      // Use sensorPortrait for phones (portrait only, handles upside-down)
      // Tablets will use unspecified via runtime lock
      mainActivity.$["android:screenOrientation"] = "unspecified";
    }

    return config;
  });
};

module.exports = withTabletOrientation;
