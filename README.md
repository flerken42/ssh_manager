# ssh_manager

## Purpose
With this tool you are able to have a better overview over your ssh tunnels. If you have multiple remote hosts with which you are connecting via an SSH Tunnel because you want to forward a port, or even multiple ports for every host, then it can be difficult to keep an overview about all connections. You have to keep track about what port you have to forward for what host and also you always have to run everything manually.

This app allows you to keep track of everything. You can enter your SSH Tunnels and they will be saved as long as you like. Also they are being shown in a list and you can open and close a tunnel with just one click. Also you can see if a tunnel is open or not.


## Disclaimer
Although this is an Electron project, the current version has been developed for Windows only. The only reason is the difference between Windows and UNIX when it comes to the commands being used for opening an SSH tunnel, getting the process id and killing a process. It is planned to introduce also functionality for UNIX systems later.


## How to run
This is an Electron project. So you need Node.js and npm.

### 1. Download Node.js:
Visit https://nodejs.org/ and download the latest stable version (LTS). This will also install npm (Node Package Manager), which is required for managing dependencies.

- Make sure Node.js is added to your system PATH during installation.

### Verify Installation:

- Open a command prompt (press Win + R, type cmd, and hit Enter).
- Type ```node -v``` to check the Node.js version.
- Type ```npm -v``` to verify the npm installation.

### 2. Install Electron CLI Tools:

Install Electron globally: Open the command prompt and run the following command to install Electron:

```bash
npm install -g electron
```

### Verify Installation:

Type ```electron -v``` to ensure it was installed successfully.


### 3. Initialize NPM:
Open a command line and ```cd``` into the project folder and initialize the project:

```bash
npm install
```

### 4. Run the application:

```bash
npm start
```