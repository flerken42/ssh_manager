const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  addTunnel: (tunnelData) => ipcRenderer.send('add-tunnel', tunnelData),
  loadTunnels: () => ipcRenderer.invoke('load-tunnels'),
  startTunnel: (id) => ipcRenderer.invoke('start-tunnel', id),
  stopTunnel: (id) => ipcRenderer.invoke('stop-tunnel', id),
  deleteTunnel: (id) => ipcRenderer.invoke('delete-tunnel', id),
  checkTunnelStatus: (id) => ipcRenderer.invoke('check-tunnel-status', id)  // Added checkTunnelStatus
});
