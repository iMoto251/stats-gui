const {app, BrowserWindow} = require("electron");

let win = null;

const createWindow = () =>{
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        resizable: false,
        webPreferences:{
            nodeIntegration: true
        }
    });

    win.loadFile('index.html');
};

app.whenReady().then(createWindow);