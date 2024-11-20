const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const db = require('./database');
const { startTunnel, stopTunnel } = require('./tunnelManager');
const { exec, spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    icon: path.join(__dirname, 'assets', 'app_icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  Menu.setApplicationMenu(null);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('add-tunnel', (event, tunnelData) => {
  const { name, remoteHost, sshUsername, localPort, remotePort } = tunnelData;
  db.run('INSERT INTO tunnels (name, remote_host, ssh_username, local_port, remote_port) VALUES (?, ?, ?, ?, ?)', [name, remoteHost, sshUsername, localPort, remotePort], (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
});

ipcMain.handle('load-tunnels', async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM tunnels', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});

// ipcMain.on('start-tunnel', (event, id) => {
//   startTunnel(id, () => {
//     console.log(`Tunnel ${id} started`);
//   });
// });

// ipcMain.on('stop-tunnel', (event, id) => {
//   stopTunnel(id, () => {
//     console.log(`Tunnel ${id} stopped`);
//   });
// });

ipcMain.handle('delete-tunnel', async (event, id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM tunnels WHERE id = ?', [id], (err, tunnel) => {
        if (err) {
          console.error(`Failed to fetch tunnel from database: ${err.message}`);
          reject(err);
          return;
        }
  
        // If the tunnel is running, stop it first
        if (tunnel.status === 'running' && tunnel.pid) {
          const command = `taskkill /PID ${tunnel.pid} /F`;
          exec(command, (killError) => {
            if (killError) {
              console.error(`Failed to kill SSH process: ${killError.message}`);
              reject(killError);
              return;
            }
  
            console.log(`Tunnel ${id} stopped successfully. Proceeding to delete from database.`);
            // Proceed to delete the tunnel from the database
            db.run('DELETE FROM tunnels WHERE id = ?', [id], (deleteErr) => {
              if (deleteErr) {
                console.error(`Failed to delete tunnel from database: ${deleteErr.message}`);
                reject(deleteErr);
              } else {
                console.log(`Tunnel ${id} deleted successfully from database.`);
                resolve();
              }
            });
          });
        } else {
          // If the tunnel is not running, delete it directly from the database
          db.run('DELETE FROM tunnels WHERE id = ?', [id], (deleteErr) => {
            if (deleteErr) {
              console.error(`Failed to delete tunnel from database: ${deleteErr.message}`);
              reject(deleteErr);
            } else {
              console.log(`Tunnel ${id} deleted successfully from database.`);
              resolve();
            }
          });
        }
      });
    });
  });

ipcMain.handle('start-tunnel', async (event, id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM tunnels WHERE id = ?', [id], (err, tunnel) => {
        if (err) {
          console.error(`Failed to fetch tunnel from database: ${err.message}`);
          reject(err);
          return;
        }
  
        // Spawn SSH tunnel command to start the tunnel
        const args = [
          '-f', '-N',
          '-L', `${tunnel.local_port}:${tunnel.remote_host}:${tunnel.remote_port}`,
          `${tunnel.ssh_username}@${tunnel.remote_host}`
        ];
  
        const sshProcess = spawn('ssh', args, {
          detached: true, // Run the process independently
          stdio: 'ignore' // Ignore stdio so the process can run in the background
        });
  
        sshProcess.unref(); // Allow the SSH process to keep running after Node.js exits
  
        sshProcess.on('error', (error) => {
          console.error(`Failed to start SSH tunnel: ${error.message}`);
          reject(error);
        });
  
        sshProcess.on('spawn', () => {
          const pid = sshProcess.pid;
  
          // Save the PID in the database
          db.run('UPDATE tunnels SET status = ?, pid = ? WHERE id = ?', ['running', pid, id], (updateErr) => {
            if (updateErr) {
              console.error(`Failed to update tunnel status in database: ${updateErr.message}`);
              reject(updateErr);
            } else {
              console.log(`Tunnel ${id} started successfully with PID ${pid}`);
              resolve();
            }
          });
        });
      });
    });
});
  
ipcMain.handle('stop-tunnel', async (event, id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM tunnels WHERE id = ?', [id], (err, tunnel) => {
        if (err) {
          console.error(`Failed to fetch tunnel from database: ${err.message}`);
          reject(err);
          return;
        }
  
        if (!tunnel.pid) {
          console.error(`No PID found for tunnel ${id}`);
          resolve();  // Tunnel is already stopped if no PID is available
          return;
        }
  
        // Kill the process using taskkill with the stored PID
        const command = `taskkill /PID ${tunnel.pid} /F`;
        exec(command, (killError) => {
          if (killError) {
            console.error(`Failed to kill SSH process: ${killError.message}`);
            reject(killError);
            return;
          }
  
          // Update the tunnel status in the database
          db.run('UPDATE tunnels SET status = ?, pid = NULL WHERE id = ?', ['stopped', id], (updateErr) => {
            if (updateErr) {
              console.error(`Failed to update tunnel status in database: ${updateErr.message}`);
              reject(updateErr);
            } else {
              console.log(`Tunnel ${id} stopped successfully and status updated in database`);
              resolve();
            }
          });
        });
      });
    });
});
  
  



ipcMain.handle('check-tunnel-status', async (event, id) => {
  return new Promise((resolve) => {
    db.get('SELECT * FROM tunnels WHERE id = ?', [id], (err, tunnel) => {
      if (err) {
        console.error(`Failed to fetch tunnel from database: ${err.message}`);
        resolve('stopped');
        return;
      }

      // Use netstat command to check if the port is open on Windows
      const command = `netstat -ano | findstr :${tunnel.local_port}`;
      exec(command, (error, stdout) => {
        if (error || !stdout.includes(tunnel.local_port)) {
          // If there's an error or no output, assume the tunnel is not running
          resolve('stopped');
        } else {
          // If there's output, the tunnel is running
          resolve('running');
        }
      });
    });
  });
});

  
  
  