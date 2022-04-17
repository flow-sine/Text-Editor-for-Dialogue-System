const {BrowserWindow, app, ipcMain, dialog, Notification} = require("electron");
const path = require("path");

const fs = require("fs");

require("electron-reloader")(module);

let mainWindow;
let openedFilePath;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        frame: false,
        width: 900,
        height: 700,
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: "#6b639c"
        },
        webPreferences: {
            preload: path.join(app.getAppPath(), "renderer.js"),
        },
    });

    //mainWindow.webContents.openDevTools();
    mainWindow.loadFile("index.html");
};

app.whenReady().then(createWindow);

const handleError = (error) => {
    new Notification({
        title: "Error",
        body: error
    }).show();
}

ipcMain.on("create-document-triggered", () => {
    dialog.showSaveDialog(mainWindow, {
        filters: [{name: "JSON files", extensions: ["json"]}]
    }).then(({filePath}) => {
        fs.writeFile(filePath, "", (error) => {
            if(error) {
                handleError(error);
            } else {
                mainWindow.webContents.send("document-created", filePath);
                openedFilePath = filePath;
            }
        });
    })
});

ipcMain.on("open-document-triggered", () => {
    dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [{name: "JSON files", extensions: ["json"]}]
    }).then(({filePaths}) => {
        const filePath = filePaths[0];
        fs.readFile(filePath, "utf8", (error, content) => {
            if(error) {
                handleError(error);
            } else {
                // Convert JSON into text
                const fileObj = JSON.parse(content);
                content = fileObj.dialogueLines.join("\n").toString();
                mainWindow.webContents.send("document-opened", {filePath, content});
                openedFilePath = filePath;
            }
        })
    })
});

ipcMain.on("file-content-updated", (_, textAreaContent) => {
    // Turn text into JSON
    const splitUpContent = textAreaContent.split(/\r?\n/);
    const fileObj = {dialogueLines: splitUpContent};

    fs.writeFile(openedFilePath, JSON.stringify(fileObj), (error) => {
        if(error) {
            handleError(error);
        }
    });
})