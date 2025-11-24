# DPI & DNS Unblocker

This project is a specialized tool designed to bypass DPI (Deep Packet Inspection) and DNS restrictions without using a VPN. It consists of a local proxy server that fragments packets to evade detection and a Chrome extension to manage the connection.

## Components

1.  **Extension (`extension/`)**: Manages browser proxy settings.
2.  **Local Proxy (`local_proxy/`)**: Runs locally on your machine to handle DNS over HTTPS (DoH) and SNI fragmentation.

## Installation & Usage

### Step 1: Start the Proxy
1.  Run the `start_proxy.bat` file.
2.  A window will appear showing "Running...".
3.  You can press **1** to hide the console (it will continue running in the background) or **2** to close it.

### Step 2: Install the Extension
1.  Open your Chromium-based browser (Chrome, Brave, Opera, etc.).
2.  Go to `chrome://extensions`.
3.  Enable **Developer Mode** in the top right corner.
4.  Click **Load unpacked**.
5.  Select the `extension` folder from this project.

### Step 3: Connect
1.  Click the extension icon in your browser toolbar.
2.  Click **Enable**.
3.  You can now access blocked websites.
