const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Theme
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),

  // External links
  openExternal: (url) => ipcRenderer.send('open-external', url),

  // Platform info
  platform: process.platform,

  // App info
  appVersion: process.env.npm_package_version || '1.0.0',

  // Listen for theme changes
  onThemeChange: (callback) => {
    ipcRenderer.on('theme-changed', (event, theme) => callback(theme));
  }
});
