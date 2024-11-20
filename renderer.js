document.addEventListener('DOMContentLoaded', () => {
    const tunnelList = document.getElementById('tunnel-list');
    const addTunnelButton = document.getElementById('add-tunnel');
    const tunnelForm = document.getElementById('tunnel-form');
    const saveTunnelButton = document.getElementById('save-tunnel');
    const cancelTunnelButton = document.getElementById('cancel-tunnel');

    addTunnelButton.addEventListener('click', () => {
        tunnelForm.style.display = 'block';
    });

    cancelTunnelButton.addEventListener('click', () => {
        tunnelForm.style.display = 'none';
    });

    saveTunnelButton.addEventListener('click', () => {
        const name = document.getElementById('tunnel-name').value;
        const remoteHost = document.getElementById('remote-host').value;
        const sshUsername = document.getElementById('ssh-username').value;
        const localPort = document.getElementById('local-port').value;
        const remotePort = document.getElementById('remote-port').value;

        if (name && remoteHost && sshUsername && localPort && remotePort) {
            window.electronAPI.addTunnel({ name, remoteHost, sshUsername, localPort, remotePort });
            tunnelForm.style.display = 'none';
            loadTunnels();
        } else {
            console.error('All fields are required to create a new tunnel.');
        }
    });

    async function loadTunnels() {
        try {
            console.log('Loading tunnels...');
            const tunnels = await window.electronAPI.loadTunnels();
            tunnelList.innerHTML = '';
            tunnels.forEach(tunnel => {
                const tunnelRow = document.createElement('tr');
                tunnelRow.innerHTML = `
                    <td class="py-2 px-4 border-b text-center">
                        ${tunnel.status === 'running' ? `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" style="color: lime;">
                        <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
                        </svg>` : `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" style="color: red;">
                        <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clip-rule="evenodd" />
                        </svg>`}
                    </td>    
                    <td class="py-2 px-4 border-b text-center"><b>${tunnel.name}</b></td>
                    <td class="py-2 px-4 border-b text-center">${tunnel.remote_host}</td>
                    <td class="py-2 px-4 border-b text-center">${tunnel.ssh_username}</td>
                    <td class="py-2 px-4 border-b text-center">${tunnel.local_port}</td>
                    <td class="py-2 px-4 border-b text-center">${tunnel.remote_port}</td>
                    <td class="py-2 px-4 border-b text-center status-cell">${tunnel.status === 'running' ? 'Running' : 'Stopped'}</td>
                    <td class="py-2 px-4 border-b text-center">
                        <button class="start-stop-button" data-id="${tunnel.id}" data-status="${tunnel.status}" style="background: transparent; border: none; padding: 0; color: ${tunnel.status === 'running' ? 'red' : 'lime'};">
                            ${tunnel.status === 'running' ? `
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                <path fill-rule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clip-rule="evenodd" />
                            </svg>` : `
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
                            </svg>`}
                        </button>
                    </td>
                    <td class="py-2 px-4 border-b text-center">
                        <button class="delete-button" data-id="${tunnel.id}" style="background: transparent; border: none; padding: 0; color: red;">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </td>
                `;
                tunnelList.appendChild(tunnelRow);
            });

            document.querySelectorAll('.start-stop-button').forEach(button => {
                button.addEventListener('click', () => {
                    const tunnelId = button.getAttribute('data-id');
                    const status = button.getAttribute('data-status');
                    toggleTunnel(tunnelId, status, button);
                });
            });

            document.querySelectorAll('.delete-button').forEach(button => {
                button.addEventListener('click', () => {
                    const tunnelId = button.getAttribute('data-id');
                    deleteTunnel(tunnelId);
                });
            });
        } catch (error) {
            console.error('Failed to load tunnels:', error);
        }
    }

    function toggleTunnel(id, status, button) {
        if (status === 'running') {
            window.electronAPI.stopTunnel(id)
                .then(() => {
                    loadTunnels();  // Reload the tunnels list to reflect the updated state
                })
                .catch((error) => {
                    console.error('Failed to stop tunnel:', error);
                });
        } else {
            window.electronAPI.startTunnel(id)
                .then(() => {
                    loadTunnels();  // Reload the tunnels list to reflect the updated state
                })
                .catch((error) => {
                    console.error('Failed to start tunnel:', error);
                });
        }
    }

    function deleteTunnel(id) {
        window.electronAPI.deleteTunnel(id)
          .then(() => {
            loadTunnels();  // Reload the tunnel list to reflect the updated state
          })
          .catch((error) => {
            console.error('Failed to delete tunnel:', error);
          });
    }

    async function checkTunnelStatus() {
        try {
            console.log('Checking tunnel statuses...');
            const tunnels = await window.electronAPI.loadTunnels();
            tunnels.forEach(async (tunnel) => {
                const realStatus = await window.electronAPI.checkTunnelStatus(tunnel.id);
                console.log(`Tunnel ID: ${tunnel.id}, Real Status: ${realStatus}`);

                // Update UI if tunnel status has changed
                const button = document.querySelector(`.start-stop-button[data-id='${tunnel.id}']`);
                const statusCell = button ? button.parentElement.previousElementSibling : null;

                if (button && statusCell) {
                    if (realStatus === 'running' && button.getAttribute('data-status') !== 'running') {
                        console.log(`Updating tunnel ${tunnel.id} to Running state in UI.`);
                        button.setAttribute('data-status', 'running');
                        button.style.color = 'red';
                        button.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                <path fill-rule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clip-rule="evenodd" />
                            </svg>
                        `;
                        statusCell.textContent = 'Running';
                    } else if (realStatus === 'stopped' && button.getAttribute('data-status') !== 'stopped') {
                        console.log(`Updating tunnel ${tunnel.id} to Stopped state in UI.`);
                        button.setAttribute('data-status', 'stopped');
                        button.style.color = 'lime';
                        button.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
                            </svg>
                        `;
                        statusCell.textContent = 'Stopped';
                    }
                }
            });
        } catch (error) {
            console.error('Failed to check tunnel status:', error);
        }
    }

    // Initial load of tunnels
    loadTunnels();

    // Check tunnel status every 10 seconds
    setInterval(checkTunnelStatus, 10000);
});
