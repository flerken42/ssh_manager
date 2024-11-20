const { exec } = require('child_process');
const db = require('./database');

function startTunnel(id, callback) {
  db.get('SELECT * FROM tunnels WHERE id = ?', [id], (err, tunnel) => {
    if (err) {
      console.error(err);
      return;
    }
    const command = `ssh -f -N -L ${tunnel.local_port}:${tunnel.remote_host}:${tunnel.remote_port} ${tunnel.ssh_username}@${tunnel.remote_host}`;
    exec(command, (error) => {
      if (error) {
        console.error(`Error starting tunnel: ${error.message}`);
        return;
      }
      db.run('UPDATE tunnels SET status = ? WHERE id = ?', ['running', id], (err) => {
        if (err) {
          console.error(err);
          return;
        }
        callback();
      });
    });
  });
}

function stopTunnel(id, callback) {
  db.get('SELECT * FROM tunnels WHERE id = ?', [id], (err, tunnel) => {
    if (err) {
      console.error(err);
      return;
    }
    const command = `pkill -f 'ssh -f -N -L ${tunnel.local_port}:${tunnel.remote_host}:${tunnel.remote_port}'`;
    exec(command, (error) => {
      if (error) {
        console.error(`Error stopping tunnel: ${error.message}`);
        return;
      }
      db.run('UPDATE tunnels SET status = ? WHERE id = ?', ['stopped', id], (err) => {
        if (err) {
          console.error(err);
          return;
        }
        callback();
      });
    });
  });
}

module.exports = { startTunnel, stopTunnel };