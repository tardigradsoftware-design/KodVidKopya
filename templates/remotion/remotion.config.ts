import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
// WebGL effects (light leaks, blur, glow...) need this during rendering.
Config.setChromiumOpenGlRenderer("swangle");
