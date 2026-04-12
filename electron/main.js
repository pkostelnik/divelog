/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, nativeTheme, Menu } = require("electron");
const path = require("path");

// Zentrale URL — änderbar über .env.local (NEXT_PUBLIC_SITE_URL)
const REMOTE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://divelog.copilot.ovh";
const APP_NAME = "DiveLog Studio";

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    title: APP_NAME,
    icon: path.join(__dirname, "../public/assets/Copilot_20260410_212123.png"),
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#0c1f2e" : "#f8fafc",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  win.loadURL(REMOTE_URL);

  win.once("ready-to-show", () => {
    win.show();
  });

  // macOS: native window controls
  if (process.platform === "darwin") {
    win.setWindowButtonVisibility(true);
  }
}

// macOS: App-Menü
if (process.platform === "darwin") {
  const template = [
    {
      label: APP_NAME,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Bearbeiten",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "Ansicht",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Fenster",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        { type: "separator" },
        { role: "front" },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
