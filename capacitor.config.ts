import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.divelog.studio",
  appName: "DiveLog Studio",
  webDir: "out",
  server: {
    // Remote-URL-Modus: Die native Shell lädt die Live-Webapp.
    // Für Offline/Bundled-Modus: Diese Zeile entfernen und
    // `npm run build:static` ausführen.
    url: "https://divelog.copilot.ovh",
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: "#0c1f2e",
      showSpinner: false,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#0c1f2e",
    },
  },
  ios: {
    scheme: "DiveLog Studio",
    contentInset: "automatic",
  },
  android: {
    buildOptions: {
      signingType: "apksigner",
    },
  },
};

export default config;
