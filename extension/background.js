const config = {
    mode: "fixed_servers",
    rules: {
        singleProxy: {
            scheme: "http",
            host: "127.0.0.1",
            port: 8080
        },
        bypassList: ["localhost", "127.0.0.1"]
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.cmd === "GET_STATUS") {
        chrome.proxy.settings.get({ incognito: false }, (details) => {
            const active = details.value.mode === "fixed_servers";
            sendResponse({ enabled: active });
        });
        return true;
    }

    if (request.cmd === "TOGGLE") {
        if (request.value) {
            chrome.proxy.settings.set({ value: config, scope: "regular" }, () => {
                sendResponse({ status: true });
            });
        } else {
            chrome.proxy.settings.clear({ scope: "regular" }, () => {
                sendResponse({ status: false });
            });
        }
        return true;
    }
});
