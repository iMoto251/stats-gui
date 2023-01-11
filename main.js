const { app, BrowserWindow, ipcMain } = require('electron')
const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

let teams = [];
let stats = [];
let riders = [];

let naStatsURL = 'https://opensheet.elk.sh/1IHACz7Rg342djrRl9uffGFI141cuydRBG3mmU88_I1I/NA%20Output';
let euStatsURL = 'https://opensheet.elk.sh/1IHACz7Rg342djrRl9uffGFI141cuydRBG3mmU88_I1I/EU%20Output';
let amStatsURL = 'https://opensheet.elk.sh/1IHACz7Rg342djrRl9uffGFI141cuydRBG3mmU88_I1I/AM%20Output';

const createWindow = () => {
    win = new BrowserWindow({
        width:1400,
        height:1000,
        minWidth:1400,
        minHeight:1000,
        resizable:true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration:true,
            contextIsolation: false
        }
    })

    win.loadFile('index.html').then(r => {});
}

app.whenReady().then(createWindow)

async function getTeams(){
    const teamsURL = 'https://opensheet.elk.sh/1IHACz7Rg342djrRl9uffGFI141cuydRBG3mmU88_I1I/Teams'
    try{
        const response = await fetch(teamsURL);
        teams = await response.json();
    } catch(e){
        console.log(e)
    }
}
//getTeams();



async function getStats(url){
    const statsURL = url;
    try{
        const response = await fetch(statsURL);
        stats = await response.json();
    } catch (e){
    }
    
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on("generateProSxStats", async (event, data) => {
    await getTeams();
    let nation = data.proNation;
    let coast = data.coast;
    try{
        await win.webContents.send("statsUpdates", 'Starting')
        await win.webContents.send("sendError", "")
        //await makePoints("250", data.proSxMain_250, "Supercross", "Main Event");
        if(data.proSxQualifying !== ""){
            fs.writeFileSync(`${path.join(__dirname, "stats.txt")}`, `[url=${data.proSxQualifying}][color=#0080BF][b]Top 10 Qualifiers[/b][/color][/url]\n\n`)
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]250 Supercross[/b][/u][/color]\n`)
            await qualifyingFunction(data.proSxQualifying, nation, coast, "Pro", "250")

            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]450 Supercross[/b][/u][/color]\n`)
            await qualifyingFunction(data.proSxQualifying, nation, coast, "Pro", "450")

            await win.webContents.send("statsUpdates", 'Qualifying Done')
        } else {
            fs.writeFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]250 Supercross[/b][/u][/color]\n`)
            await win.webContents.send("statsUpdates", 'Qualifying Skipped')
        }
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Qualifying')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]Heat Results[/b][/u][/color]\n`)
        if(coast != "None"){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 ${coast} Supercross Heat 1[/b][/u]\n`);
            await qualifiers(data.proSxHeat1_250, "Heat")
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 ${coast} Supercross Heat 2[/b][/u]\n`);
            await qualifiers(data.proSxHeat2_250, "Heat")
        } else {
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 Supercross Heat 1[/b][/u]\n`);
            await qualifiers(data.proSxHeat1_250, "Heat")
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 Supercross Heat 2[/b][/u]\n`);
            await qualifiers(data.proSxHeat2_250, "Heat")
        }
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 Supercross Heat 1[/b][/u]\n`);
        await qualifiers(data.proSxHeat1_450, "Heat")
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 Supercross Heat 2[/b][/u]\n`);
        await qualifiers(data.proSxHeat2_450,"Heat")
        await win.webContents.send("statsUpdates", 'Heats Done')
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Heats')
        await win.webContents.send("sendError", e)
    }

    try{
        if(data.proSxLCQ_250 !== "" || data.proSxLCQ_450 !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]LCQ Results[/b][/u][/color]\n`)
        }
        if(data.proSxLCQ_250 !== ""){
            if(coast != "None"){
                fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 ${coast} Supercross LCQ[/b][/u]\n`);
                await qualifiers(data.proSxLCQ_250, "LCQ")
            } else {
                fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 Supercross LCQ[/b][/u]\n`);
                await qualifiers(data.proSxLCQ_250, "LCQ")
            }
        }
        if(data.proSxLCQ_450 !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 Supercross LCQ[/b][/u]\n`);
            await qualifiers(data.proSxLCQ_450, "LCQ")
        }
        await win.webContents.send("statsUpdates", 'LCQs Done')
    } catch(e){
        await win.webContents.send("statsUpdates", 'Error in LCQs')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]Main Event Results[/b][/u][/color]\n`)
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 Supercross Main[/b][/u]\n`);
        await main(data.proSxMain_250);
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 Supercross Main[/b][/u]\n`);
        await main(data.proSxMain_450);
        await win.webContents.send("statsUpdates", 'Mains Done')
    } catch (e){
        await win.webContents.send("statsUpdates", 'Error in Mains')
        await win.webContents.send("sendError", e)
    }

    try{
        if(data.proSxQualifying !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]Top 20 in Points[/b][/u][/color]\n\n`);
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]250 Supercross[/b][/u][/color]\n`)
            await points(data.proSxQualifying, nation, coast, "Pro", "250")

            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]450 Supercross[/b][/u][/color]\n`)
            await points(data.proSxQualifying, nation, coast, "Pro", "450")
            
            if(nation === "NA"){
                await getStats(naStatsURL);
            } else {
                await getStats(euStatsURL);
            }
            await doStats();
            await win.webContents.send("statsUpdates", 'Finished!')
        } else {
            fs.writeFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]250 Supercross[/b][/u][/color]\n`)
            await win.webContents.send("statsUpdates", 'Points Skipped')
        }
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Points')
        await win.webContents.send("sendError", e)
    }
});

ipcMain.on("generateProSxTCStats", async (event, data) => {
    await getTeams();
    let nation = data.proNation;
    let coast = data.coast;
    try{
        await win.webContents.send("statsUpdates", 'Starting')
        await win.webContents.send("sendError", "")
        if(data.proSxTcQualifying !== ""){
            fs.writeFileSync(`${path.join(__dirname, "stats.txt")}`, `[url=${data.proSxTcQualifying}][color=#0080BF][b]Top 10 Qualifiers[/b][/color][/url]\n\n`)
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]250 Supercross[/b][/u][/color]\n`)
            await qualifyingFunction(data.proSxTcQualifying, nation, coast, "Pro", "250")

            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]450 Supercross[/b][/u][/color]\n`)
            await qualifyingFunction(data.proSxTcQualifying, nation, coast, "Pro", "450")

            await win.webContents.send("statsUpdates", 'Qualifying Done')
        } else {
            fs.writeFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]250 Supercross[/b][/u][/color]\n`)
            await win.webContents.send("statsUpdates", 'Qualifying Skipped')
        }
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Qualifying')
        await win.webContents.send("sendError", e)
    }

    try{
        if(data.proSxTcLCQ_250 !== "" || data.proSxTcLCQ_450 !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]LCQ Results[/b][/u][/color]\n`)
        }
        if(data.proSxTcLCQ_250 !== ""){
            if(coast != "None"){
                fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 ${coast} Supercross LCQ[/b][/u]\n`);
                await qualifiers(data.proSxTcLCQ_250, "LCQ")
            } else {
                fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 Supercross LCQ[/b][/u]\n`);
                await qualifiers(data.proSxTcLCQ_250, "LCQ")
            }
        }
        if(data.proSxTcLCQ_450 !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 Supercross LCQ[/b][/u]\n`);
            await qualifiers(data.proSxTcLCQ_450, "LCQ")
        }
        await win.webContents.send("statsUpdates", 'LCQs Done')
    } catch(e){
        await win.webContents.send("statsUpdates", 'Error in LCQs')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]Main Event Results[/b][/u][/color]\n`)
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 Supercross Main 1[/b][/u]\n`);
        await main(data.proSxTcMain1_250);
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 Supercross Main 2[/b][/u]\n`);
        await main(data.proSxTcMain2_250);
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 Supercross Main 3[/b][/u]\n`);
        await main(data.proSxTcMain3_250);

        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 Supercross Main 1[/b][/u]\n`);
        await main(data.proSxTcMain1_450);
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 Supercross Main 2[/b][/u]\n`);
        await main(data.proSxTcMain2_450);
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 Supercross Main 3[/b][/u]\n`);
        await main(data.proSxTcMain3_450);

        await win.webContents.send("statsUpdates", 'Mains Done')
    } catch (e){
        await win.webContents.send("statsUpdates", 'Error in Mains')
        await win.webContents.send("sendError", e)
    }

    try {
        let coast = data.coast
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]Triple Crown Overalls[/b][/u][/color]\n\n`);
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]250 ${coast} Supercross Triple Crown[/b][/u][/color]\n`)
        await tcOverall(data.proSxTcMain1_250, data.proSxTcMain2_250, data.proSxTcMain3_250);
        
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]450 Supercross Triple Crown[/b][/u][/color]\n`)
        await tcOverall(data.proSxTcMain1_450, data.proSxTcMain2_450, data.proSxTcMain3_450);
        await win.webContents.send("statsUpdates", 'Triple Crown Overall Done')
    } catch(e){
        await win.webContents.send("statsUpdates", 'Error in Triple Crown Overalls')
        await win.webContents.send("sendError", e)
    }

    try{
        if(data.proSxTcQualifying !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]Top 20 in Points[/b][/u][/color]\n\n`);
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]250 Supercross[/b][/u][/color]\n`)
            await points(data.proSxTcQualifying, nation, coast, "Pro", "250")

            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]450 Supercross[/b][/u][/color]\n`)
            await points(data.proSxTcQualifying, nation, coast, "Pro", "450")
            
            if(nation === "NA"){
                await getStats(naStatsURL);
            } else {
                await getStats(euStatsURL);
            }
            doStats();
            await win.webContents.send("statsUpdates", 'Finished!')
        } else {
            fs.writeFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]250 Supercross[/b][/u][/color]\n`)
            await win.webContents.send("statsUpdates", 'Points Skipped')
        }
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Points')
        await win.webContents.send("sendError", e)
    }
});

ipcMain.on("generateAmSxStats", async(event, data) =>{
    await getTeams();
    try{
        await win.webContents.send("statsUpdates", 'Starting')
        await win.webContents.send("sendError", "")
        //await makePoints("250", data.proSxMain_250, "Supercross", "Main Event");
        if(data.amSxQualifying !== ""){
            fs.writeFileSync(`${path.join(__dirname, "stats.txt")}`, `[url=${data.amSxQualifying}][color=#0080BF][b]Top 10 Qualifiers[/b][/color][/url]\n\n`)

            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]Novice Supercross[/b][/u][/color]\n`)
            await qualifyingFunction(data.amSxQualifying, "NA", "coast", "Am", "Nov")
            
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]250 Am Supercross[/b][/u][/color]\n`)
            await qualifyingFunction(data.amSxQualifying, "NA", "coast", "Am", "250")

            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]450 Am Supercross[/b][/u][/color]\n`)
            await qualifyingFunction(data.amSxQualifying, "NA", "coast", "Am", "450")

            await win.webContents.send("statsUpdates", 'Qualifying Done')
        } else {
            fs.writeFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]250 Supercross[/b][/u][/color]\n`)
            await win.webContents.send("statsUpdates", 'Qualifying Skipped')
        }
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Qualifying')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]Heat Results[/b][/u][/color]\n`)
        
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]Novice Supercross Heat 1[/b][/u]\n`);
        await qualifiers(data.amSxHeat1_nov, "Heat")
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]Novice Supercross Heat 2[/b][/u]\n`);
        await qualifiers(data.amSxHeat2_nov, "Heat")

        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 AM Supercross Heat 1[/b][/u]\n`);
        await qualifiers(data.amSxHeat1_250, "Heat")
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 AM Supercross Heat 2[/b][/u]\n`);
        await qualifiers(data.amSxHeat2_250, "Heat")


        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 AM Supercross Heat 1[/b][/u]\n`);
        await qualifiers(data.amSxHeat1_450, "Heat")
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 AM Supercross Heat 2[/b][/u]\n`);
        await qualifiers(data.amSxHeat2_450, "Heat")

        await win.webContents.send("statsUpdates", 'Heats Done')
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Heats')
        await win.webContents.send("sendError", e)
    }

    try{
        if(data.amSxLCQ_nov !== "" || data.amSxLCQ_250 !== "" || data.amSxLCQ_450 !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]LCQ Results[/b][/u][/color]\n`)
        }
        if(data.amSxLCQ_nov !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]Novice Supercross LCQ[/b][/u]\n`);
            await qualifiers(data.amSxLCQ_nov, "LCQ")
        }
        if(data.amSxLCQ_250 !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 AM Supercross LCQ[/b][/u]\n`);
            await qualifiers(data.amSxLCQ_250, "LCQ")
        }
        if(data.amSxLCQ_450 !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 AM Supercross LCQ[/b][/u]\n`);
            await qualifiers(data.amSxLCQ_450, "LCQ")
        }
        await win.webContents.send("statsUpdates", 'LCQs Done')
    } catch(e){
        await win.webContents.send("statsUpdates", 'Error in LCQs')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]Main Event Results[/b][/u][/color]\n`)
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]Novice Supercross Main[/b][/u]\n`);
        await main(data.amSxMain_nov);
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 AM Supercross Main[/b][/u]\n`);
        await main(data.amSxMain_250);
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 AM Supercross Main[/b][/u]\n`);
        await main(data.amSxMain_450);
        await win.webContents.send("statsUpdates", 'Mains Done')
    } catch (e){
        await win.webContents.send("statsUpdates", 'Error in Mains')
        await win.webContents.send("sendError", e)
    }

    try{
        if(data.amSxQualifying !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]Top 20 in Points[/b][/u][/color]\n\n`);
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]Novice Supercross[/b][/u][/color]\n`)
            await points(data.amSxQualifying, "NA", "coast", "Am", "Nov")

            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]250 AM Supercross[/b][/u][/color]\n`)
            await points(data.amSxQualifying, "NA", "coast", "Am", "250")

            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]450 AM Supercross[/b][/u][/color]\n`)
            await points(data.amSxQualifying, "NA", "coast", "Am", "450")
            
            await getStats(amStatsURL);
            await doStats();
            await win.webContents.send("statsUpdates", 'Finished!')
        } else {
            fs.writeFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]250 Supercross[/b][/u][/color]\n`)
            await win.webContents.send("statsUpdates", 'Points Skipped')
        }
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Points')
        await win.webContents.send("sendError", e)
    }
});

ipcMain.on("generateAmSxTCStats", async (event, data) => {
    await getTeams();
    try{
        await win.webContents.send("statsUpdates", 'Starting')
        await win.webContents.send("sendError", "")
        if(data.amSxTcQualifying !== ""){
            fs.writeFileSync(`${path.join(__dirname, "stats.txt")}`, `[url=${data.amSxTcQualifying}][color=#0080BF][b]Top 10 Qualifiers[/b][/color][/url]\n\n`)
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]250 Am Supercross[/b][/u][/color]\n`)
            await qualifyingFunction(data.amSxTcQualifying, "NA", "coast", "Am", "Nov")

            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]250 Am Supercross[/b][/u][/color]\n`)
            await qualifyingFunction(data.amSxTcQualifying, "NA", "coast", "Am", "250")

            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]450 Am Supercross[/b][/u][/color]\n`)
            await qualifyingFunction(data.amSxTcQualifying, "NA", "coast", "Am", "450")

            await win.webContents.send("statsUpdates", 'Qualifying Done')
        } else {
            fs.writeFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]250 Supercross[/b][/u][/color]\n`)
            await win.webContents.send("statsUpdates", 'Qualifying Skipped')
        }
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Qualifying')
        await win.webContents.send("sendError", e)
    }

    try{
        if(data.amSxTcLCQ_Nov !== "" || data.amSxTcLCQ_250 !== "" || data.amSxTcLCQ_450 !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]LCQ Results[/b][/u][/color]\n`)
        }
        if(data.amSxTcLCQ_Nov !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 Supercross LCQ[/b][/u]\n`);
            await qualifiers(data.amSxTcLCQ_Nov, "LCQ")
        }
        if(data.amSxTcLCQ_250 !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 Supercross LCQ[/b][/u]\n`);
            await qualifiers(data.amSxTcLCQ_250, "LCQ")
        }
        if(data.amSxTcLCQ_450 !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 Supercross LCQ[/b][/u]\n`);
            await qualifiers(data.amSxTcLCQ_450, "LCQ")
        }
        await win.webContents.send("statsUpdates", 'LCQs Done')
    } catch(e){
        await win.webContents.send("statsUpdates", 'Error in LCQs')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]Main Event Results[/b][/u][/color]\n`)
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]Novice Supercross Main 1[/b][/u]\n`);
        await main(data.amSxTcMain1_Nov);
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]Novice Supercross Main 2[/b][/u]\n`);
        await main(data.amSxTcMain2_Nov);
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]Novice Supercross Main 3[/b][/u]\n`);
        await main(data.amSxTcMain3_Nov);

        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 Am Supercross Main 1[/b][/u]\n`);
        await main(data.amSxTcMain1_250);
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 Am Supercross Main 2[/b][/u]\n`);
        await main(data.amSxTcMain2_250);
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]250 Am Supercross Main 3[/b][/u]\n`);
        await main(data.amSxTcMain3_250);

        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 Am Supercross Main 1[/b][/u]\n`);
        await main(data.amSxTcMain1_450);
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 Am Supercross Main 2[/b][/u]\n`);
        await main(data.amSxTcMain2_450);
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[b][u]450 Am Supercross Main 3[/b][/u]\n`);
        await main(data.amSxTcMain3_450);

        await win.webContents.send("statsUpdates", 'Mains Done')
    } catch (e){
        await win.webContents.send("statsUpdates", 'Error in Mains')
        await win.webContents.send("sendError", e)
    }

    try {
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]Triple Crown Overalls[/b][/u][/color]\n\n`);

        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]Novice Supercross Triple Crown[/b][/u][/color]\n`)
        await tcOverall(data.amSxTcMain1_Nov, data.amSxTcMain2_Nov, data.amSxTcMain3_Nov);

        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]250 Am Supercross Triple Crown[/b][/u][/color]\n`)
        await tcOverall(data.amSxTcMain1_250, data.amSxTcMain2_250, data.amSxTcMain3_250);
        
        fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]450 Am Supercross Triple Crown[/b][/u][/color]\n`)
        await tcOverall(data.amSxTcMain1_450, data.amSxTcMain2_450, data.amSxTcMain3_450);
        await win.webContents.send("statsUpdates", 'Triple Crown Overall Done')
    } catch(e){
        await win.webContents.send("statsUpdates", 'Error in Triple Crown Overalls')
        await win.webContents.send("sendError", e)
    }

    try{
        if(data.amSxTcQualifying !== ""){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]Top 20 in Points[/b][/u][/color]\n\n`);
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]Novice Supercross[/b][/u][/color]\n`)
            await points(data.amSxTcQualifying, "NA", "coast", "Am", "Nov")

            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]250 Am Supercross[/b][/u][/color]\n`)
            await points(data.amSxTcQualifying, "NA", "coast", "Am", "250")

            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n[color=#FF0000][b][u]450 Am Supercross[/b][/u][/color]\n`)
            await points(data.amSxTcQualifying, "NA", "coast", "Am", "450")
            
            doStats(amStatsURL);
            await win.webContents.send("statsUpdates", 'Finished!')
        } else {
            fs.writeFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000][b][u]250 Supercross[/b][/u][/color]\n`)
            await win.webContents.send("statsUpdates", 'Points Skipped')
        }
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Points')
        await win.webContents.send("sendError", e)
    }
});

ipcMain.on("generateProMxStats", async (event, data) => {
    console.log("Test")
});

ipcMain.on("generateAmMxStats", async (event, data) => {
    console.log("Test")
});

ipcMain.on("getRidersFunc", async (event, data) =>{
    await win.webContents.send("statsUpdates", 'Starting grabbing riders')
    await getRiders();
    await win.webContents.send("statsUpdates", 'Finished grabbing riders')
    //console.log(riders)
})


async function qualifyingFunction(qualurl, nation, coast, raceClass, bikeClass){
    let selectorTable=''
    let classSelector=''
    if(nation === "NA"){
        if(raceClass === "Pro"){
            if(bikeClass === "250"){
                if(coast === "West"){
                    //NA 250W
                    selectorTable='DataTables_Table_4'
                    classSelector='2'
                } else if(coast === "East"){
                    //NA 250E
                    selectorTable='DataTables_Table_4'
                } else {
                    //NA No Coast
                    selectorTable='DataTables_Table_4'
                }
            } else {
                //NA 450
                selectorTable='DataTables_Table_3'
                classSelector='1'
            }
        } else if(raceClass === "Am"){
            if(bikeClass === "Nov"){
                selectorTable='DataTables_Table_6'
                classSelector='80'
            } else if(bikeClass === "250"){
                selectorTable='DataTables_Table_5'
                classSelector='76'
            } else {
                selectorTable='DataTables_Table_4'
                classSelector='74'
            }
        }
    } else if(nation === "EU"){
        if(bikeClass === "250"){
            //EU 250
            selectorTable='DataTables_Table_3'
            classSelector='8'
            } else {
            //EU 450
            selectorTable='DataTables_Table_4'
            classSelector='37'
        }
    }

    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForSelector(`#nav-qualifying-tab`)
    await page.click('#nav-qualifying-tab')
    await page.waitForSelector(`#${selectorTable}_length > label > select`)
    await page.select(`#${selectorTable}_length > label > select`,'100')
    await page.select('#qualifyingListClassSelector', `${classSelector}`)

    let qualifying = await page.evaluate((selectorTable) =>{
        function capitalize(str) {
            return str.replace(
                /\w\S*/g,
                function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                }
            );
        }
        let numberArray = [];
        let nameArray = [];
        let timeArray = [];
        let uidArray = [];
        for(let i=0;i<10;i++){
            numberArray[i] = document.querySelector(`#${selectorTable} > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#${selectorTable} > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML);
            timeArray[i] = document.querySelector(`#${selectorTable} > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(6)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#${selectorTable} > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(7)`).innerHTML)
            }
        return {numberArray, nameArray, timeArray, uidArray};
        
    }, selectorTable);

    //console.log(teams)

    for(let i = 0; i<10; i++){
        let bikeColor = '000000';
        let teamStr = '';
        let name = qualifying.nameArray[i]
        for(let j=0; j<teams.length; j++){
            if(qualifying.uidArray[i] === parseInt(teams[j].uid)){
                bikeColor = teams[j].bike;
                teamStr = teams[j].team;
                name = teams[j].name;
            } else{
                //do nothing
            }
        }
        if(teamStr === "Privateer"){console.log("Privateer")};
        if(teamStr !== '' && teamStr !== "Privateer"){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `${i+1}. [i][size=85]#${qualifying.numberArray[i]}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[i]}[/i][/size]\n`)
        } else {
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `${i+1}. [i][size=85]#${qualifying.numberArray[i]}[/size][/i] - ${name} - [size=85][i]${qualifying.timeArray[i]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function qualifiers(url, race){
    let transfers = 0
    if(race === "Heat"){
        transfers = 9
    } else if (race === "LCQ" || race === "Consi"){
        transfers = 4
    }

    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(url);
    await page.waitForNetworkIdle();

    let results = await page.evaluate(() =>{
        function capitalize(str) {
            return str.replace(
                /\w\S*/g,
                function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1);
                }
            );
        }

        let position = document.querySelectorAll(`td.pos`);
        let numberArray = [];
        let nameArray = [];
        let uidArray = [];
        let posNum = position.length;
        for(let i=0;i<position.length;i++){
            numberArray[i] = document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(3) > a:nth-child(1)`).innerHTML);
            uidArray[i] = parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`).innerHTML)
        }
        return {numberArray, nameArray, posNum, uidArray};
    });

    for(let i = 0;i<results.posNum;i++){
        let name = '';
        let team = '';
        let bikeColor = '000000';
        for(let j=0; j<teams.length; j++){
            if(results.uidArray[i] === parseInt(teams[j].uid)){
                bikeColor = teams[j].bike;
                team = teams[j].team;
                name = teams[j].name;
            } else{
                //do nothing
            }
        }
        if(team === "Privateer"){
            if(i<transfers){
                fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#00BF00]${i+1}.[/color] [i][size=85]#${results.numberArray[i]}[/size][/i] - ${name}\n`)
            } else{
                fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000]${i+1}.[/color] [i][size=85]#${results.numberArray[i]}[/size][/i] - ${name}\n`)
            }
        } else{ 
            if(i<transfers){
                fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#00BF00]${i+1}.[/color] [i][size=85]#${results.numberArray[i]}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${team}[/color][/size]\n`)
            } else{
                fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `[color=#FF0000]${i+1}.[/color] [i][size=85]#${results.numberArray[i]}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${team}[/color][/size]\n`)
            }
        }
    }
    await browser.close();
}

async function main(url){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(url);
    await page.waitForNetworkIdle();

    let results = await page.evaluate(() =>{
        function capitalize(str) {
            return str.replace(
                /\w\S*/g,
                function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1);
                }
            );
        }

        let position = document.querySelectorAll(`td.pos`);
        let numberArray = [];
        let nameArray = [];
        let uidArray = [];
        let totMins = [];
        let totSecs = [];
        let completedLaps = [];
        let posNum = position.length;
        for(let i=0;i<position.length;i++){
            numberArray[i] = document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(3) > a:nth-child(1)`).innerHTML);
            completedLaps[i] = parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(5)`).innerHTML)
            totMins[i] = parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(6)`).innerHTML.substring(0,document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(6)`).innerHTML.indexOf(":")).trim())
            totSecs[i] = parseFloat(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(6)`).innerHTML.substring(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(6)`).innerHTML.indexOf(":")+1).trim())
            uidArray[i] = parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`).innerHTML)
        }
        return {numberArray, nameArray, posNum, totMins, totSecs, completedLaps, uidArray};
    });

    let timeBehind = [];
    for(let i = 0;i<results.posNum;i++){
        if(i===0){
            timeBehind[i] = results.totMins[i].toString() + ":" + results.totSecs[i].toString()
        } else if(results.completedLaps[i] === results.completedLaps[0]){
            if(results.totMins[i] === results.totMins[0]){
                if((results.totSecs[i]-results.totSecs[0])<10){
                    timeBehind[i] = "0:0" + (results.totSecs[i]-results.totSecs[0]).toFixed(3)
                }else{
                    timeBehind[i] = "0:" + (results.totSecs[i]-results.totSecs[0]).toFixed(3)
                }

            } else if(results.totMins[i] !== results.totMins[0] && results.totSecs[i] < results.totSecs[0]){
                if((results.totSecs[i]-results.totSecs[0]+60)<10){
                    timeBehind[i] = "+" + (results.totMins[i]-results.totMins[0] - 1) + ":0" + (results.totSecs[i]-results.totSecs[0]+60).toFixed(3)
                }else{
                    timeBehind[i] = "+" + (results.totMins[i]-results.totMins[0] - 1) + ":" + (results.totSecs[i]-results.totSecs[0]+60).toFixed(3)
                }
            } else if(results.totMins[i] !== results.totMins[0] && results.totSecs[i] > results.totSecs[0]){
                if((results.totSecs[i]-results.totSecs[0])<10){
                    timeBehind[i] = "+" + (results.totMins[i]-results.totMins[0]) + ":0" + (results.totSecs[i]-results.totSecs[0]).toFixed(3)
                }else{
                    timeBehind[i] = "+" + (results.totMins[i]-results.totMins[0]) + ":" + (results.totSecs[i]-results.totSecs[0]).toFixed(3)
                }
            }
        } else{
            if(results.totMins[0] <= results.totMins[i]){
                if((results.completedLaps[0] - results.completedLaps[i]) === 1){
                    timeBehind[i] = "+" + (results.completedLaps[0] - results.completedLaps[i]) + " lap"
                } else {
                    timeBehind[i] = "+" + (results.completedLaps[0] - results.completedLaps[i]) + " laps"
                }
            } else{
                timeBehind[i] = "DNF"
            }

        }
    }

    for(let i = 0; i<results.posNum;i++){        
        let name = '';
        let team = '';
        let bikeColor = '000000';
        for(let j=0; j<teams.length; j++){
            if(results.uidArray[i] === parseInt(teams[j].uid)){
                bikeColor = teams[j].bike;
                team = teams[j].team;
                name = teams[j].name;
            } else{
                //do nothing
            }
        }

        if(team === "Privateer"){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `${i+1}. [i][size=85]#${results.numberArray[i]}[/size][/i] - ${name} [size=85]- ${timeBehind[i]}[/size]\n`)
        } else {
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `${i+1}. [i][size=85]#${results.numberArray[i]}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${team}[/color]- ${timeBehind[i]}[/size]\n`)
        }
    }
    await browser.close();
}

async function points(qualurl, nation, coast, raceClass, bikeClass){
    let selectorTable=''
    let classSelector=''
    if(nation === "NA"){
        if(raceClass === "Pro"){
            if(bikeClass === "250"){
                if(coast === "West"){
                    //NA 250W
                    selectorTable='DataTables_Table_13' //#DataTables_Table_13 > tbody > tr:nth-child(1) > td:nth-child(2)
                    classSelector='2'
                } else if(coast === "East"){
                    //NA 250E
                    selectorTable='DataTables_Table_4'
                } else {
                    //NA No Coast
                    selectorTable='DataTables_Table_4'
                }
            } else {
                //NA 450
                selectorTable='DataTables_Table_14'
                classSelector='1'
            }
        } else if(raceClass === "Am"){
            if(bikeClass === "Nov"){
                selectorTable='DataTables_Table_21'
                classSelector='80'
            } else if(bikeClass === "250"){
                selectorTable='DataTables_Table_20'
                classSelector='76'
            } else {
                selectorTable='DataTables_Table_19'
                classSelector='74'
            }
        }
    } else if(nation === "EU"){
        if(bikeClass === "250"){
            //EU 250
            selectorTable='DataTables_Table_14'
            classSelector='8'
            } else {
            //EU 450
            selectorTable='DataTables_Table_13'
            classSelector='37'
        }
    }

    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForNetworkIdle();

    await page.click('#nav-standings-tab')
    await page.select('#standingsClassSelector', classSelector)
    await page.select(`#${selectorTable}_length > label:nth-child(1) > select:nth-child(1)`, '100')
    await page.waitForNetworkIdle();

    let points = await page.evaluate((selectorTable) =>{
        function capitalize(str) {
            return str.replace(
                /\w\S*/g,
                function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                }
            );
        }
        let numberArray = [];
        let nameArray = [];
        let pointArray = [];
        let uidArray = [];
        
        for(let i=0;i<20;i++){
            numberArray[i] = document.querySelector(`#${selectorTable} > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#${selectorTable} > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML);
            pointArray[i] = document.querySelector(`#${selectorTable} > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(7)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#${selectorTable} > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(6)`).innerHTML);
        }

        return {numberArray, nameArray, pointArray, uidArray};
    }, selectorTable);

    for(let i = 0;i<20;i++){
        let bikeColor = '000000';
        let teamStr = '';
        let name = points.nameArray[i]
        for(let j=0; j<teams.length; j++){
            if(points.uidArray[i] === parseInt(teams[j].uid)){
                bikeColor = teams[j].bike;
                teamStr = teams[j].team;
                name = teams[j].name;
            } else{
                //do nothing
            }
        }
        if(teamStr !== '' && teamStr !== "Privateer"){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `${i+1}. [i][size=85]#${points.numberArray[i]}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[i]}[/i][/size]\n`)
        } else {
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `${i+1}. [i][size=85]#${points.numberArray[i]}[/size][/i] - ${name} - [size=85][i]${points.pointArray[i]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function tcOverall(urlm1, urlm2, urlm3){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(urlm1);
    await page.waitForNetworkIdle();

    let resultsm1 = await page.evaluate(() =>{
        function capitalize(str) {
            return str.replace(
                /\w\S*/g,
                function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1);
                }
            );
        }

        let position = document.querySelectorAll(`td.pos`);
        let main1 = [];
        let posNum = position.length;
        for(let i=0;i<position.length;i++){
                main1[i]={
                    position: parseInt(document.querySelector(`body > div.main > table:nth-child(5) > tbody > tr:nth-child(${i+2}) > td.pos`).innerHTML),
                    number: document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(2)`).innerHTML,
                    name: capitalize(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(3) > a:nth-child(1)`).innerHTML),
                    uid: parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`).innerHTML),
                    points: i+1
            }
        }
        return {posNum, main1};
    });

    await page.goto(urlm2)
    await page.waitForNetworkIdle();

    let resultsm2 = await page.evaluate(() =>{
        function capitalize(str) {
            return str.replace(
                /\w\S*/g,
                function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1);
                }
            );
        }

        let position = document.querySelectorAll(`td.pos`);
        let main2 = [];
        let posNum = position.length;
        for(let i=0;i<position.length;i++){
                main2[i]={
                    position: parseInt(document.querySelector(`body > div.main > table:nth-child(5) > tbody > tr:nth-child(${i+2}) > td.pos`).innerHTML),
                    number: document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(2)`).innerHTML,
                    name: capitalize(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(3) > a:nth-child(1)`).innerHTML),
                    uid: parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`).innerHTML),
                    points: i+1
            }
        }
        return {posNum, main2};
    });

    await page.goto(urlm3)
    await page.waitForNetworkIdle();

    let resultsm3 = await page.evaluate(() =>{
        function capitalize(str) {
            return str.replace(
                /\w\S*/g,
                function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1);
                }
            );
        }

        let position = document.querySelectorAll(`td.pos`);
        let main3 = [];
        let posNum = position.length;
        for(let i=0;i<position.length;i++){
                main3[i]={
                    position: parseInt(document.querySelector(`body > div.main > table:nth-child(5) > tbody > tr:nth-child(${i+2}) > td.pos`).innerHTML),
                    number: document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(2)`).innerHTML,
                    name: capitalize(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(3) > a:nth-child(1)`).innerHTML),
                    uid: parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`).innerHTML),
                    points: i+1
            }
        }
        return {posNum, main3};
    });

    let overall = [];
    for(let i=0; i<resultsm1.posNum; i++){
        overall[i] = {
            name: resultsm1.main1[i].name,
            uid: resultsm1.main1[i].uid,
            number: resultsm1.main1[i].number,
            main1: resultsm1.main1[i].position,
            main2: "DNS",
            main3: "DNS",
            points: null,
            overallPos: null
        }
        for(let j=0; j<resultsm2.posNum; j++){
            if(resultsm2.main2[j].uid === resultsm1.main1[i].uid){
                overall[i] = {
                    name: resultsm1.main1[i].name,
                    uid: resultsm1.main1[i].uid,
                    number: resultsm1.main1[i].number,
                    main1: resultsm1.main1[i].position,
                    main2: resultsm2.main2[j].position,
                    main3: "DNS",
                    points: null,
                    overallPos: null
                }
            }
            for(let k=0;k<resultsm3.posNum;k++){
                if(resultsm3.main3[k].uid === resultsm1.main1[i].uid){
                    overall[i].main3 = resultsm3.main3[k].position;
                }
            }
        }        
    }

    for(let i=0; i<overall.length;i++){ 
        overall[i].points = (parseInt(overall[i].main1) + parseInt(overall[i].main2) + parseInt(overall[i].main3) + (parseInt(overall[i].main3)*.01)) 
    }

    overall.sort((a,b)=>(a.points - b.points))

    for(let i=0; i<overall.length;i++){ 
        overall[i].overallPos = (i+1)
    }

    for(let i=0;i<overall.length;i++){
        let name = '';
        let team = '';
        let bikeColor = '000000';

        for(let j=0; j<teams.length; j++){
            if(overall[i].uid === parseInt(teams[j].uid)){
                bikeColor = teams[j].bike;
                team = teams[j].team;
                name = teams[j].name;
            } else{
                //do nothing
            }
        }

        if(team === "Privateer"){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `${i+1}. [i][size=85]#${overall[i].number}[/size][/i] - ${name} [i][size=85](${overall[i].main1} - ${overall[i].main2} - ${overall[i].main3})[/size][/i]\n`)
        } else {
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `${i+1}. [i][size=85]#${overall[i].number}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${team}[/color] [i](${overall[i].main1} - ${overall[i].main2} - ${overall[i].main3})[/i][/size]\n`)
        }
    }

}

async function mxOveralls(urlm1, urlm2, nation, series ){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(urlm1);
    await page.waitForNetworkIdle();

    let resultsm1 = await page.evaluate(() =>{
        function capitalize(str) {
            return str.replace(
                /\w\S*/g,
                function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1);
                }
            );
        }
        function motoPoints(pos){
            switch(pos){
                case 1:
                    return 25;
                case 2:
                    return 22;
                case 3:
                    return 20;
                case 4:
                    return 18;
                case 5:
                    return 16;
                case 6:
                    return 15;
                case 7:
                    return 14;
                case 8:
                    return 13;
                case 9:
                    return 12;
                case 10:
                    return 11;
                case 11:
                    return 10;
                case 12:
                    return 9;
                case 13:
                    return 8;
                case 14:
                    return 7;
                case 15:
                    return 6;
                case 16:
                    return 5;
                case 17:
                    return 4;
                case 18:
                    return 3;
                case 19:
                    return 2;
                case 20:
                    return 1;
                default:
                    return 0;
            }

        }

        let position = document.querySelectorAll(`td.pos`);
        let moto1 = [];
        let posNum = position.length;
        for(let i=0;i<position.length;i++){
            moto1[i] = {
                position: parseInt(document.querySelector(`body > div.main > table:nth-child(5) > tbody > tr:nth-child(${i+2}) > td.pos`).innerHTML),
                number: document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(2)`).innerHTML,
                name: capitalize(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(3) > a:nth-child(1)`).innerHTML),
                uid: parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`).innerHTML),
                points: motoPoints(i+1)
            }

        }
        return {posNum, moto1};
    });

    await page.goto(urlm2);
    await page.waitForNetworkIdle();

    let resultsm2 = await page.evaluate(() =>{
        function capitalize(str) {
            return str.replace(
                /\w\S*/g,
                function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1);
                }
            );
        }
        function motoPoints(pos){
            switch(pos){
                case 1:
                    return 25;
                case 2:
                    return 22;
                case 3:
                    return 20;
                case 4:
                    return 18;
                case 5:
                    return 16;
                case 6:
                    return 15;
                case 7:
                    return 14;
                case 8:
                    return 13;
                case 9:
                    return 12;
                case 10:
                    return 11;
                case 11:
                    return 10;
                case 12:
                    return 9;
                case 13:
                    return 8;
                case 14:
                    return 7;
                case 15:
                    return 6;
                case 16:
                    return 5;
                case 17:
                    return 4;
                case 18:
                    return 3;
                case 19:
                    return 2;
                case 20:
                    return 1;
                default:
                    return 0;
            }

        }

        let position = document.querySelectorAll(`td.pos`);
        let moto2 = [];
        let posNum = position.length;
        for(let i=0;i<position.length;i++){
            moto2[i] = {
                position: parseInt(document.querySelector(`body > div.main > table:nth-child(5) > tbody > tr:nth-child(${i+2}) > td.pos`).innerHTML),
                number: document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(2)`).innerHTML,
                name: capitalize(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(3) > a:nth-child(1)`).innerHTML),
                uid: parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`).innerHTML),
                points: motoPoints(i+1)
            }

        }
        return {posNum, moto2};
    });

    let overall = [];
    for(let i=0;i<resultsm1.posNum;i++){
        overall[i] = {
            name: resultsm1.moto1[i].name,
            uid: resultsm1.moto1[i].uid,
            number: resultsm1.moto1[i].number,
            moto1: resultsm1.moto1[i].position,
            moto2: "DNS",
            points: (0 - parseInt(resultsm1.moto1[i].position) - 60),
            overallPos: null
        }
        for(let j=0;j<resultsm2.posNum;j++){
            if(resultsm2.moto2[j].uid === resultsm1.moto1[i].uid){
                if((resultsm1.moto1[i].points + resultsm2.moto2[j].points) > 0){
                    overall[i] = {
                        name:resultsm1.moto1[i].name,
                        uid: resultsm1.moto1[i].uid,
                        number:resultsm1.moto1[i].number,
                        moto1:resultsm1.moto1[i].position,
                        moto2:resultsm2.moto2[j].position,
                        points:(resultsm1.moto1[i].points + resultsm2.moto2[j].points),
                        overallPos: null
                    }
                } else {
                    overall[i] = {
                        name:resultsm1.moto1[i].name,
                        uid: resultsm1.moto1[i].uid,
                        number:resultsm1.moto1[i].number,
                        moto1:resultsm1.moto1[i].position,
                        moto2:resultsm2.moto2[j].position,
                        points:(0 - parseInt(resultsm1.moto1[i].position) - parseInt(resultsm2.moto2[j].position)),
                        overallPos: null
                    }
                }
            }
        }
    }
    overall.sort((a,b)=>(a.points < b.points) ? 1 : -1)

    for(let i = 0;i<overall.length;i++){
        let name = '';
        let team = '';
        let bikeColor = '000000';
        for(let b=0;b<teams.length;b++){
            if(overall[a].uid === parseInt(teams[b].uid)){
                bikeColor = teams[b].bike;
                team = teams[b].team;
                name = teams[b].name;
            } else {
                //do nothing
            }
        }

        if(team === "Privateer"){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `${i+1}. [i][size=85]#${overall[i].number}[/size][/i] - ${name} [i][size=85](${overall[i].moto1} - ${overall[i].moto2})[/size][/i]\n`)
        } else {
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `${a+1}. [i][size=85]#${overall[i].number}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${team}[/color][/size] [i][size=85](${overall[i].moto1} - ${overall[i].moto2})[/size][/i]\n`)
        }
    }
    await browser.close();
}

async function doStats(){
    var count = Object.keys(stats).length;

    for(let i =0;i<count;i++){
        if(stats[i].Filters === undefined){
            //do nothing
        } else if(stats[i].Filters === "LineBreak"){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n`);
        } else {
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `\n${stats[i].Filters}`);
        }  
    }
}

async function getRiders(){
    const ridersURL = 'https://opensheet.elk.sh/1IHACz7Rg342djrRl9uffGFI141cuydRBG3mmU88_I1I/findNames'
    fs.writeFileSync(`${path.join(__dirname, "riderNames.txt")}`, ``)
    
    try {
        const response = await fetch(ridersURL);
        riders = await response.json();

        let browser = await puppeteer.launch({headless: true});
        let page = await browser.newPage();
        await page.setViewport({width: 1920, height: 1080})
        await page.setDefaultNavigationTimeout(120000);
        await page.goto(`https://racefactorygaming.com/Profiles/Rider?uid=11747`);
        await page.waitForNetworkIdle();


        for(i=0;i<riders.length;i++){
            
            await page.goto(`https://racefactorygaming.com/Profiles/Rider?uid=${riders[i].uid}`)
            await page.waitForNetworkIdle();

            let riderNames = await page.evaluate(() =>{
                function capitalize(str) {
                    return str.replace(
                        /\w\S*/g,
                        function(txt) {
                            return txt.charAt(0).toUpperCase() + txt.substr(1);
                        }
                    );
                }
                let rider;
                rider = capitalize(document.querySelector(`#nav-home-profile > div.col-sm-8 > div:nth-child(2)`).innerHTML);
        
                return {rider};
            });
            let newRider = riderNames.rider.trim();
            fs.appendFileSync(`${path.join(__dirname, "riderNames.txt")}`, `${riders[i].uid}` + "," + newRider + "\n")
            
        }
        await browser.close();
    } catch (e){
        console.log(e)
    }
}
