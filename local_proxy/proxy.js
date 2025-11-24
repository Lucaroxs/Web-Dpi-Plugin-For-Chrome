const http = require('http');
const net = require('net');
const https = require('https');
const dns = require('dns');
const { spawn } = require('child_process');

const PORT = 8080;
const IS_BACKGROUND = process.argv.includes('--background');

async function resolveDoH(hostname) {
    return new Promise((resolve, reject) => {
        if (net.isIP(hostname)) return resolve(hostname);

        const options = {
            hostname: '1.1.1.1',
            path: `/dns-query?name=${hostname}&type=A`,
            method: 'GET',
            headers: { 'Accept': 'application/dns-json' }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.Answer && json.Answer.length > 0) {
                        const record = json.Answer.find(a => a.type === 1);
                        if (record) resolve(record.data);
                        else reject(new Error('No A record'));
                    } else {
                        reject(new Error('Query failed'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

function resolveSystemDNS(hostname) {
    return new Promise((resolve, reject) => {
        dns.lookup(hostname, (err, address) => {
            if (err) reject(err);
            else resolve(address);
        });
    });
}

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Proxy Active');
});

server.on('connect', async (req, clientSocket, head) => {
    let hostname, port;
    try {
        const u = new URL(`http://${req.url}`);
        hostname = u.hostname;
        port = u.port || 443;
    } catch (e) {
        const parts = req.url.split(':');
        hostname = parts[0];
        port = parts[1] || 443;
    }

    let targetIP;
    try {
        targetIP = await resolveDoH(hostname);
    } catch (e) {
        try {
            targetIP = await resolveSystemDNS(hostname);
        } catch (e2) {
            clientSocket.end();
            return;
        }
    }

    const serverSocket = net.connect(port, targetIP, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        if (head && head.length) serverSocket.write(head);
        serverSocket.pipe(clientSocket);
    });

    let firstPacket = true;
    clientSocket.on('data', (data) => {
        if (firstPacket) {
            firstPacket = false;
            const chunk1 = data.slice(0, 1);
            const chunk2 = data.slice(1);
            serverSocket.write(chunk1);
            setImmediate(() => {
                serverSocket.write(chunk2);
            });
        } else {
            serverSocket.write(data);
        }
    });

    serverSocket.on('error', () => clientSocket.end());
    clientSocket.on('error', () => serverSocket.end());
    clientSocket.on('end', () => serverSocket.end());
    serverSocket.on('end', () => clientSocket.end());
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        if (!IS_BACKGROUND) {
            console.log('\x1b[31m%s\x1b[0m', 'Error: Port 8080 is already in use!');
            console.log('It seems the proxy is already running in the background.');
            console.log('You can close this window, the proxy is working.');
        }
        process.exit(1);
    } else {
        console.error(e);
        process.exit(1);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    if (!IS_BACKGROUND) {
        console.clear();
        console.log('\x1b[32m%s\x1b[0m', 'Running...');
        console.log('');
        console.log('1 > Hide Console');
        console.log('2 > Close');

        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.setEncoding('utf8');

            process.stdin.on('data', (key) => {
                if (key === '1') {
                    const subprocess = spawn(process.argv[0], [process.argv[1], '--background'], {
                        detached: true,
                        stdio: 'ignore',
                        windowsHide: true
                    });
                    subprocess.unref();
                    process.exit(0);
                } else if (key === '2' || key === '\u0003') {
                    process.exit(0);
                }
            });
        }
    }
});
