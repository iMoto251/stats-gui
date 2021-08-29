const { app, BrowserWindow, ipcMain } = require("electron");
const puppeteer = require('puppeteer');
const fs = require('fs');
const teams = require('./teams.json');
const path = require('path');

let win = null;

const createWindow = () => {
    win = new BrowserWindow({
        width: 1600,
        height: 1000,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    win.maximize();
    win.loadFile("index.html").then(r => {});
};

app.whenReady().then(createWindow);

ipcMain.on("generateProSxStats", async (event, data) => {

    try{
        await win.webContents.send("statsUpdates", 'Starting')
        //await win.webContents.send("sendError", `${path.join(__dirname, "../../stats.txt")}`)
        await win.webContents.send("sendError", "")
        //`${__dirname}/stats.txt`
        //`${path.join(__dirname, "../../stats.txt")}`

        await qualSX250Pro(data.proSxQualifying);
        await qualSX450Pro(data.proSxQualifying);
        await win.webContents.send("statsUpdates", 'Qualifying Done')
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Qualifying')
        await win.webContents.send("sendError", e)
    }

    try{
        let coast = data.coast;
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Heat Results[/b][/u][/color]\n`)
        await heats(`250 ${coast}`, "1", data.proSxHeat1_250);
        await heats(`250 ${coast}`, "2", data.proSxHeat2_250);
        await heats("450", "1", data.proSxHeat1_450);
        await heats("450", "2", data.proSxHeat2_450);
        await win.webContents.send("statsUpdates", 'Heats Done')
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Heats')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]LCQ Results[/b][/u][/color]\n`)
        if(data.proSxLCQ_250Check === false){
            await lcq("250", data.proSxLCQ_250, "Supercross", "LCQ");
        }
        if(data.proSxLCQ_450Check === false){
            await lcq("450", data.proSxLCQ_450, "Supercross", "LCQ");
        }
        await win.webContents.send("statsUpdates", 'LCQs Done')
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in LCQs')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Main Results[/b][/u][/color]\n`)
        await mains("250", data.proSxMain_250, "Supercross", "Main Event");
        await mains("450", data.proSxMain_450, "Supercross", "Main Event");
        await win.webContents.send("statsUpdates", 'Mains Done')
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Mains')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Top 20 in Points[/b][/u][/color]\n`);
        await pointsSX250wPro(data.proSxQualifying);
        await pointsSX250ePro(data.proSxQualifying);
        await pointsSX450Pro(data.proSxQualifying);

        await win.webContents.send("statsUpdates", 'Finished!')
    } catch (e){
        await win.webContents.send("statsUpdates", 'Error in Points')
        await win.webContents.send("sendError", e)
    }

});

ipcMain.on("generateAmSxStats", async(event, data) =>{
    try{
        await win.webContents.send("statsUpdates", 'Starting')
        await win.webContents.send("sendError", "")

        await qualSX250Novice(data.amSxQualifying);
        await qualSX250Am(data.amSxQualifying);
        await qualSX450Am(data.amSxQualifying);
        await win.webContents.send("statsUpdates", 'Qualifying Done')
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Qualifying')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Heat Results[/b][/u][/color]\n`)
        await heats(`250 Novice`, "1", data.amSxHeat1_nov);
        await heats(`250 Novice`, "2", data.amSxHeat2_nov);
        await heats(`250 Am`, "1", data.amSxHeat1_250);
        await heats(`250 Am`, "2", data.amSxHeat2_250);
        await heats("450 Am", "1", data.amSxHeat1_450);
        await heats("450 Am", "2", data.amSxHeat2_450);
        await win.webContents.send("statsUpdates", 'Heats Done')
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Heats')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]LCQ Results[/b][/u][/color]\n`)

        if(data.amSxLCQ_NovCheck === false){
            await lcq("250 Novice", data.amSxLCQ_nov, "Supercross", "LCQ");
        }
        if(data.amSxLCQ_250Check === false){
            await lcq("250 Am", data.amSxLCQ_250, "Supercross", "LCQ");
        }
        if(data.amSxLCQ_450Check === false){
            await lcq("450 Am", data.amSxLCQ_450, "Supercross", "LCQ");
        }
        await win.webContents.send("statsUpdates", 'LCQs Done')
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in LCQs')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Main Results[/b][/u][/color]\n`)
        await mains("250 Novice", data.amSxMain_nov, "Supercross", "Main Event");
        await mains("250 Am", data.amSxMain_250, "Supercross", "Main Event");
        await mains("450 Am", data.amSxMain_450, "Supercross", "Main Event");
        await win.webContents.send("statsUpdates", 'Mains Done')
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Mains')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Top 20 in Points[/b][/u][/color]\n`);
        await pointsSX250Novice(data.amSxQualifying);
        await pointsSX250Am(data.amSxQualifying);
        await pointsSX450Am(data.amSxQualifying);

        await win.webContents.send("statsUpdates", 'Finished!')
    } catch (e){
        await win.webContents.send("statsUpdates", 'Error in Points')
        await win.webContents.send("sendError", e)
    }

});

ipcMain.on("generateProMxStats", async (event, data) => {
    try{
        await win.webContents.send("statsUpdates", 'Starting')
        await win.webContents.send("sendError", "")

        await qualMX250Pro(data.proMxQualifying);
        await qualMX450Pro(data.proMxQualifying);
        await win.webContents.send("statsUpdates", 'Qualifying Done')
    } catch (e) {
        await win.webContents.send("statsUpdates", 'Error in Qualifying')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Consi Results[/b][/u][/color]\n`)
        if(data.proMxConsi_250Check === false){
            await lcq("250", data.proMxConsi_250, "Motocross", "Consi");
        }
        if(data.proMxConsi_450Check === false){
            await lcq("450", data.proMxConsi_450, "Motocross", "Consi");
        }
        await win.webContents.send("statsUpdates", 'Consis Done')
    } catch (e){
        await win.webContents.send("statsUpdates", 'Error in Consi')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Moto Results[/b][/u][/color]\n`)
        await mains("250", data.proMxMoto1_250, "Motocross", "Moto 1");
        await mains("250", data.proMxMoto2_250, "Motocross", "Moto 2");
        await mains("450", data.proMxMoto1_450, "Motocross", "Moto 1");
        await mains("450", data.proMxMoto2_450, "Motocross", "Moto 2");
        await win.webContents.send("statsUpdates", 'Motos Done')
    } catch (e){
        await win.webContents.send("statsUpdates", 'Error in Motos')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Overall Results[/b][/u][/color]\n`);
        await overalls("250", data.proMxMoto1_250, data.proMxMoto2_250, "Motocross", "Overall")
        await overalls("450", data.proMxMoto1_450, data.proMxMoto2_450, "Motocross", "Overall")
        await win.webContents.send("statsUpdates", 'Overalls Done')
    } catch(e){
        await win.webContents.send("statsUpdates", 'Error in Overalls')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Qualifying to Overall Results Differences[/b][/u][/color]\n`);
        await diffOAQuali("250", data.proMxQualifying, data.proMxMoto1_250, data.proMxMoto2_250, "Motocross", "Quali - Overall Difference")
        await diffOAQuali("450", data.proMxQualifying, data.proMxMoto1_450, data.proMxMoto2_450, "Motocross", "Quali - Overall Difference")
        await win.webContents.send("statsUpdates", 'Overalls Done')
    } catch(e){
        await win.webContents.send("statsUpdates", 'Error in Quali to Overalls')
        await win.webContents.send("sendError", e)
    }

    try{
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Top 20 in Points[/b][/u][/color]\n`);
    await pointsMXPro(data.proMxQualifying, data.proMxStand_250, "250");
    await pointsMXPro(data.proMxQualifying, data.proMxStand_450, "450");
    await win.webContents.send("statsUpdates", 'Finished!')
    } catch (e){
    await win.webContents.send("statsUpdates", 'Error in Points')
    await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync()
    } catch (e){
        await win.webContents.send("statsUpdates", 'Error in Others')
        await win.webContents.send("sendError", e)
    }
});

ipcMain.on("generateAmMxStats", async (event, data) => {
    try {
        await win.webContents.send("statsUpdates", 'Starting')
        await win.webContents.send("sendError", "")

        await qualMX250Am(data.amMxQualifying);
        await qualMX450Am(data.amMxQualifying);
        await win.webContents.send("statsUpdates", 'Qualifying Done')
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Qualifying')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Consi Results[/b][/u][/color]\n`)
        if(data.amMxConsi_250Check === false){
            await lcq("250 Am", data.amMxConsi_250, "Motocross", "Consi");
        }
        if(data.amMxConsi_450Check === false){
            await lcq("450 Am", data.amMxConsi_450, "Motocross", "Consi");
        }
        await win.webContents.send("statsUpdates", 'Consis Done')
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Consi')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Moto Results[/b][/u][/color]\n`)
        await mains("250 Am", data.amMxMoto1_250, "Motocross", "Moto 1");
        await mains("250 Am", data.amMxMoto2_250, "Motocross", "Moto 2");
        await mains("450 Am", data.amMxMoto1_450, "Motocross", "Moto 1");
        await mains("450 Am", data.amMxMoto2_450, "Motocross", "Moto 2");
        await win.webContents.send("statsUpdates", 'Motos Done')
    } catch(e) {
        await win.webContents.send("statsUpdates", 'Error in Motos')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Overall Results[/b][/u][/color]\n`);
        await overalls("250 Am", data.amMxMoto1_250, data.amMxMoto2_250, "Motocross", "Overall")
        await overalls("450 Am", data.amMxMoto1_450, data.amMxMoto2_450, "Motocross", "Overall")
        await win.webContents.send("statsUpdates", 'Overalls Done')
    } catch(e){
        await win.webContents.send("statsUpdates", 'Error in Overalls')
        await win.webContents.send("sendError", e)
    }

    try{
        fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Qualifying to Overall Results Differences[/b][/u][/color]\n`);
        await diffOAQuali("250 Am", data.amMxQualifying, data.amMxMoto1_250, data.amMxMoto2_250, "Motocross", "Quali - Overall Difference")
        await diffOAQuali("450 Am", data.amMxQualifying, data.amMxMoto1_450, data.amMxMoto2_450, "Motocross", "Quali - Overall Difference")
        await win.webContents.send("statsUpdates", 'Quali - Overalls Done')
    } catch(e){
        await win.webContents.send("statsUpdates", 'Error in Quali to Overall')
        await win.webContents.send("sendError", e)
    }

    try{
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[color=#FF0000][b][u]Top 20 in Points[/b][/u][/color]\n`);
    await pointsMX250Am(data.amMxQualifying);
    await pointsMX450Am(data.amMxQualifying);

    await win.webContents.send("statsUpdates", 'Finished!')
    } catch (e) {
        await win.webContents.send("statsUpdates", 'Error in Points')
        await win.webContents.send("sendError", e)
    }

});

async function qualSX250Pro(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.writeFile(`${path.join(__dirname, "../../stats.txt")}`, `[url=${qualurl}][color=#0080BF][b]Top 10 Qualifiers[/b][/color][/url]\n\n[b][u]250 Supercross[/b][/u]\n`, 'utf8', () =>{});

    let qualifying = await page.evaluate(() =>{
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
            numberArray[i] = document.querySelector(`#DataTables_Table_4 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#DataTables_Table_4 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML);
            timeArray[i] = document.querySelector(`#DataTables_Table_4 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#DataTables_Table_4 > tbody > tr:nth-child(${i+1}) > td:nth-child(6)`).innerHTML)
        }
        return {numberArray, nameArray, timeArray, uidArray};
    });
    for(let j = 0; j<10; j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(qualifying.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function qualSX450Pro(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]450 Supercross[/b][/u]\n`);

    let qualifying = await page.evaluate(() =>{
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
            numberArray[i] = document.querySelector(`#DataTables_Table_3 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#DataTables_Table_3 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML);
            timeArray[i] = document.querySelector(`#DataTables_Table_3 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#DataTables_Table_3 > tbody > tr:nth-child(${i+1}) > td:nth-child(6)`).innerHTML)
        }
        return {numberArray, nameArray, timeArray, uidArray};
    });
    for(let j = 0; j<10; j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(qualifying.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function qualSX250Novice(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.writeFile(`${path.join(__dirname, "../../stats.txt")}`, `[url=${qualurl}][color=#0080BF][b]Top 10 Qualifiers[/b][/color][/url]\n\n[b][u]250 Novice Supercross[/b][/u]\n`, 'utf8', () =>{});

    let qualifying = await page.evaluate(() =>{
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
            numberArray[i] = document.querySelector(`#DataTables_Table_6 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#DataTables_Table_6 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML);
            timeArray[i] = document.querySelector(`#DataTables_Table_6 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#DataTables_Table_6 > tbody > tr:nth-child(${i+1}) > td:nth-child(6)`).innerHTML)
        }
        return {numberArray, nameArray, timeArray, uidArray};
    });
    for(let j = 0; j<10; j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(qualifying.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        }
    }

    await browser.close();
}

async function qualSX250Am(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]250 Am Supercross[/b][/u]\n`);

    let qualifying = await page.evaluate(() =>{
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
            numberArray[i] = document.querySelector(`#DataTables_Table_5 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#DataTables_Table_5 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML);
            timeArray[i] = document.querySelector(`#DataTables_Table_5 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#DataTables_Table_5 > tbody > tr:nth-child(${i+1}) > td:nth-child(6)`).innerHTML)
        }
        return {numberArray, nameArray, timeArray, uidArray};
    });
    for(let j = 0; j<10; j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(qualifying.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        }
    }

    await browser.close();
}

async function qualSX450Am(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]450 Am Supercross[/b][/u]\n`);

    let qualifying = await page.evaluate(() =>{
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
        for(let i=0; i<10; i++){
            numberArray[i] = document.querySelector(`#DataTables_Table_4 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#DataTables_Table_4 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML);
            timeArray[i] = document.querySelector(`#DataTables_Table_4 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#DataTables_Table_4 > tbody > tr:nth-child(${i+1}) > td:nth-child(6)`).innerHTML)
        }
        return {numberArray, nameArray, timeArray, uidArray};
    });
    for(let j = 0; j<10; j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(qualifying.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        }

    }
    await browser.close();
}

async function heats(title, num, url){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(url);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]${title} Supercross Heat ${num}[/b][/u]\n`);

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

    for(let j = 0; j<results.posNum;j++){
        if(j<9){
            let helper = results.nameArray[j];
            let n = helper.includes("|");
            if(!n){
                fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `[color=#00BF00]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] - ${helper}\n`)
            } else {
                let name = '';
                name = helper.substring(0,helper.indexOf("|")).trim();
                let team = '';
                team = helper.substring(helper.indexOf("|")+1).trim();
                let bikeColor = '000000';
                for(let k=0; k<teams.length; k++){
                    if(results.uidArray[j] === teams[k].uid){
                        bikeColor = teams[k].bike;
                        team = teams[k].team;
                        name = teams[k].name;
                    } else{
                        //do nothing
                    }
                }
                if(team === "Privateer"){bikeColor='000000'}
                fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `[color=#00BF00]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${team}[/color][/size]\n`)
            }
        } else {
            let helper = results.nameArray[j];
            let n = helper.includes("|");
            if(!n){
                fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `[color=#FF0000]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] - ${helper}\n`)
            } else {
                let name = '';
                name = helper.substring(0,helper.indexOf("|")).trim();
                let team = '';
                team = helper.substring(helper.indexOf("|")+1).trim();
                let bikeColor = '000000';
                for(let k=0; k<teams.length; k++){
                    if(results.uidArray[j] === teams[k].uid){
                        bikeColor = teams[k].bike;
                        team = teams[k].team;
                        name = teams[k].name;
                    } else{
                        //do nothing
                    }
                }
                if(team === "Privateer"){bikeColor='000000'}
                fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `[color=#FF0000]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${team}[/color][/size]\n`)
            }
        }
    }
    await browser.close();
}

async function lcq(title, url, series, race){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(url);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]${title} ${series} ${race}[/b][/u]\n`);

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

    for(let j = 0; j<results.posNum;j++){
        if(j<4){
            let helper = results.nameArray[j];
            let n = helper.includes("|");
            if(!n){
                fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `[color=#00BF00]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] - ${helper}\n`)
            } else {
                let name = '';
                name = helper.substring(0,helper.indexOf("|")).trim();
                let team = '';
                team = helper.substring(helper.indexOf("|")+1).trim();
                let bikeColor = '000000';
                for(let k=0; k<teams.length; k++){
                    if(results.uidArray[j] === teams[k].uid){
                        bikeColor = teams[k].bike;
                        team = teams[k].team;
                        name = teams[k].name;
                    } else{
                        //do nothing
                    }
                }
                if(team === "Privateer"){bikeColor='000000'}
                fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `[color=#00BF00]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${team}[/color][/size]\n`)
            }
        } else {
            let helper = results.nameArray[j];
            let n = helper.includes("|");
            if(!n){
                fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `[color=#FF0000]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] - ${helper}\n`)
            } else {
                let name = '';
                name = helper.substring(0,helper.indexOf("|")).trim();
                let team = '';
                team = helper.substring(helper.indexOf("|")+1).trim();
                let bikeColor = '000000';
                for(let k=0; k<teams.length; k++){
                    if(results.uidArray[j] === teams[k].uid){
                        bikeColor = teams[k].bike;
                        team = teams[k].team;
                        name = teams[k].name;
                    } else{
                        //do nothing
                    }
                }
                if(team === "Privateer"){bikeColor='000000'}
                fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `[color=#FF0000]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${team}[/color][/size]\n`)
            }
        }
    }
    await browser.close();
}

async function mains(title, url, series, race){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(url);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]${title} ${series} ${race}[/b][/u]\n`);

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

    for(let j = 0; j<results.posNum;j++){
        let helper = results.nameArray[j];
        let n = helper.includes("|");

        if(!n){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${results.numberArray[j]}[/size][/i] - ${helper} [size=85]- ${timeBehind[j]}[/size]\n`)
        } else {
            let name = '';
            name = helper.substring(0,helper.indexOf("|")).trim();
            let team = '';
            team = helper.substring(helper.indexOf("|")+1).trim();
            let bikeColor = '000000';
            for(let k=0; k<teams.length; k++){
                if(results.uidArray[j] === teams[k].uid){
                    bikeColor = teams[k].bike;
                    team = teams[k].team;
                    name = teams[k].name;
                } else{
                    //do nothing
                }
            }
            if(team === "Privateer"){bikeColor='000000'}
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${results.numberArray[j]}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${team}[/color] - ${timeBehind[j]}[/size]\n`)
        }
    }
    await browser.close();
}

async function pointsSX250wPro(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]250 West Supercross[/b][/u]\n`);

    let points = await page.evaluate(() =>{
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
            numberArray[i] = document.querySelector(`#standings-2 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#standings-2 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(3)`).innerHTML);
            pointArray[i] = document.querySelector(`#standings-2 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#standings-2 > table > tbody > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML)
        }
        return {numberArray, nameArray, pointArray, uidArray};
    });
    for(let j = 0; j<20;j++){
        for(let j = 0; j<20;j++){
            let bikeColor = '000000';
            let teamStr = '';
            for(let k=0; k<teams.length; k++){
                if(points.uidArray[j] === teams[k].uid){
                    bikeColor = teams[k].bike;
                    teamStr = teams[k].team;
                } else{
                    //do nothing
                }
            }
            if(teamStr !== ''){
                fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
            } else{
                fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
            }
        }    }
    await browser.close();
}

async function pointsSX250ePro(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]250 East Supercross[/b][/u]\n`);

    let points = await page.evaluate(() =>{
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
            numberArray[i] = document.querySelector(`#standings-3 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#standings-3 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(3)`).innerHTML);
            pointArray[i] = document.querySelector(`#standings-3 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#standings-3 > table > tbody > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML)
        }
        return {numberArray, nameArray, pointArray, uidArray};
    });
    for(let j = 0; j<20;j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(points.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function pointsSX450Pro(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]450 Supercross[/b][/u]\n`);

    let points = await page.evaluate(() =>{
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
            numberArray[i] = document.querySelector(`#standings-1 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#standings-1 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(3)`).innerHTML);
            pointArray[i] = document.querySelector(`#standings-1 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#standings-1 > table > tbody > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML)
        }
        return {numberArray, nameArray, pointArray, uidArray};
    });
    for(let j = 0; j<20;j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(points.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function pointsSX250Novice(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]250 Novice Supercross[/b][/u]\n`);

    let points = await page.evaluate(() =>{
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
            numberArray[i] = document.querySelector(`#standings-80 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#standings-80 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(3)`).innerHTML);
            pointArray[i] = document.querySelector(`#standings-80 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#standings-80 > table > tbody > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML)
        }
        return {numberArray, nameArray, pointArray, uidArray};
    });
    for(let j = 0; j<20;j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(points.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function pointsSX250Am(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]250 Am Supercross[/b][/u]\n`);

    let points = await page.evaluate(() =>{
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
            numberArray[i] = document.querySelector(`#standings-76 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#standings-76 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(3)`).innerHTML);
            pointArray[i] = document.querySelector(`#standings-76 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#standings-76 > table > tbody > tr:nth-child(1${i+1} > td:nth-child(4)`).innerHTML)
        }
        return {numberArray, nameArray, pointArray, uidArray};
    });
    for(let j = 0; j<20;j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(points.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function pointsSX450Am(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]450 Am Supercross[/b][/u]\n`);

    let points = await page.evaluate(() =>{
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
            numberArray[i] = document.querySelector(`#standings-74 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#standings-74 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(3)`).innerHTML);
            pointArray[i] = document.querySelector(`#standings-74 > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#standings-74 > table > tbody > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML)
        }
        return {numberArray, nameArray, pointArray, uidArray};
    });
    for(let j = 0; j<20;j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(points.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function qualMX250Pro(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.writeFile(`${path.join(__dirname, "../../stats.txt")}`, `[url=${qualurl}][color=#0080BF][b]Top 10 Qualifiers[/b][/color][/url]\n\n[b][u]250 Motocross[/b][/u]\n`, 'utf8', () =>{});

    let qualifying = await page.evaluate(() =>{
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
            numberArray[i] = document.querySelector(`#DataTables_Table_4 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#DataTables_Table_4 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML);
            timeArray[i] = document.querySelector(`#DataTables_Table_4 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#DataTables_Table_4 > tbody > tr:nth-child(${i+1}) > td:nth-child(6)`).innerHTML)
        }
        return {numberArray, nameArray, timeArray, uidArray};
    });
    for(let j = 0; j<10; j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(qualifying.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function qualMX450Pro(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]450 Motocross[/b][/u]\n`);

    let qualifying = await page.evaluate(() =>{
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
            numberArray[i] = document.querySelector(`#DataTables_Table_3 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#DataTables_Table_3 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML);
            timeArray[i] = document.querySelector(`#DataTables_Table_3 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#DataTables_Table_3 > tbody > tr:nth-child(${i+1}) > td:nth-child(6)`).innerHTML)
        }
        return {numberArray, nameArray, timeArray, uidArray};
    });
    for(let j = 0; j<10; j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(qualifying.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function qualMX250Am(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.writeFile(`${path.join(__dirname, "../../stats.txt")}`, `[url=${qualurl}][color=#0080BF][b]Top 10 Qualifiers[/b][/color][/url]\n\n[b][u]250 Am Motocross[/b][/u]\n`, 'utf8', () =>{});

    let qualifying = await page.evaluate(() =>{
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
            numberArray[i] = document.querySelector(`#DataTables_Table_3 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#DataTables_Table_3 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML);
            timeArray[i] = document.querySelector(`#DataTables_Table_3 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#DataTables_Table_3 > tbody > tr:nth-child(${i+1}) > td:nth-child(6)`).innerHTML)
        }
        return {numberArray, nameArray, timeArray, uidArray};
    });
    for(let j = 0; j<10; j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(qualifying.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function qualMX450Am(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]450 Am Motocross[/b][/u]\n`);

    let qualifying = await page.evaluate(() =>{
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
            numberArray[i] = document.querySelector(`#DataTables_Table_4 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#DataTables_Table_4 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML);
            timeArray[i] = document.querySelector(`#DataTables_Table_4 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#DataTables_Table_4 > tbody > tr:nth-child(${i+1}) > td:nth-child(6)`).innerHTML)
        }
        return {numberArray, nameArray, timeArray, uidArray};
    });
    for(let j = 0; j<10; j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(qualifying.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function pointsMXPro(qualurl, stand, race){
    let standings = '';
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    switch(stand){
        case "4":
            standings = 'DataTables_Table_14'
            break;
        case "83":
            standings = 'DataTables_Table_14'
            break;
        case "85":
            standings = 'DataTables_Table_14'
            break;
        case "5":
            standings = 'DataTables_Table_13'
            break;
        case "84":
            standings = 'DataTables_Table_13'
            break;
        case "86":
            standings = 'DataTables_Table_13'
            break;
        default:
            standings = ''
            break;
    }
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]${race} Motocross[/b][/u]\n`);
    await page.click('#nav-standings-tab')
    await page.select('#standingsClassSelector', stand)
    await page.select(`#${standings}_length > label:nth-child(1) > select:nth-child(1)`, '100')
    await page.waitForTimeout(5000)
    console.log(stand + " " + standings)


    let points = await page.evaluate((standings) =>{
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
            //#DataTables_Table_14 > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(2)
            numberArray[i] = document.querySelector(`#${standings} > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#${standings} > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(3)`).innerHTML);
            pointArray[i] = document.querySelector(`#${standings} > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#${standings} > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML)
        }
        return {numberArray, nameArray, pointArray, uidArray};
    }, standings);
    for(let j = 0; j<20;j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(points.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function pointsMX250Am(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]250 Am Motocross[/b][/u]\n`);
    await page.click('#nav-standings-tab')
    await page.select('#standingsClassSelector', '39')
    await page.select('#DataTables_Table_14_length > label:nth-child(1) > select:nth-child(1)', '100')


    let points = await page.evaluate(() =>{
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
        //#DataTables_Table_14 > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(2)
        for(let i=0;i<20;i++){
            numberArray[i] = document.querySelector(`#DataTables_Table_14 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#DataTables_Table_14 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(3)`).innerHTML);
            pointArray[i] = document.querySelector(`#DataTables_Table_14 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#DataTables_Table_14 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML)
        }
        return {numberArray, nameArray, pointArray, uidArray};
    });
    for(let j = 0; j<20;j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(points.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function pointsMX450Am(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]450 Am Motocross[/b][/u]\n`);
    await page.click('#nav-standings-tab')
    await page.select('#standingsClassSelector', '40')
    await page.select('#DataTables_Table_13_length > label:nth-child(1) > select:nth-child(1)', '100')

    let points = await page.evaluate(() =>{
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
        //#DataTables_Table_13 > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(2)
        for(let i=0;i<20;i++){
            numberArray[i] = document.querySelector(`#DataTables_Table_13 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#DataTables_Table_13 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(3)`).innerHTML);
            pointArray[i] = document.querySelector(`#DataTables_Table_13 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(5)`).innerHTML;
            uidArray[i] = parseInt(document.querySelector(`#DataTables_Table_13 > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML)
        }
        return {numberArray, nameArray, pointArray, uidArray};
    });
    for(let j = 0; j<20;j++){
        let bikeColor = '000000';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(points.uidArray[j] === teams[k].uid){
                bikeColor = teams[k].bike;
                teamStr = teams[k].team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function overalls(title, urlm1, urlm2, series, race){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(urlm1);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]${title} ${series} ${race}[/b][/u]\n`);

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
    await page.waitForTimeout(2000);

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
    for(let i=0;i<overall.length;i++){
        overall[i].overallPos = (i+1)
    }

    for(let a = 0;a<overall.length;a++){
        let helper = overall[a].name;
        let n = helper.includes("|");

        if(!n){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${a+1}. [i][size=85]#${overall[a].number}[/size][/i] - ${helper} [i][size=85](${overall[a].moto1} - ${overall[a].moto2})[/size][/i]\n`)
        } else{
            let name = '';
            name = helper.substring(0,helper.indexOf("|")).trim();
            let team = '';
            team = helper.substring(helper.indexOf("|")+1).trim();
            let bikeColor = '000000';
            for(let b=0;b<teams.length;b++){
                if(overall[a].uid === teams[b].uid){
                    bikeColor = teams[b].bike;
                    team = teams[b].team;
                    name = teams[b].name;
                } else {
                    //do nothing
                }
            }
            if(team === "Privateer"){bikeColor='000000'}
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${a+1}. [i][size=85]#${overall[a].number}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${team}[/color][/size] [i][size=85](${overall[a].moto1} - ${overall[a].moto2})[/size][/i]\n`)
        }
    }
    await browser.close();
}

async function diffOAQuali(title, quali, urlm1, urlm2, series, race){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(quali);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `\n[b][u]${title} ${series} ${race}[/b][/u]\n`);

    let dataTable = '';
    if(title === "250" || title === "450 Am"){
        await page.click('#nav-qualifying-tab');
        await page.select('#DataTables_Table_4_length > label > select','100');
        dataTable = 'DataTables_Table_4'
    } else if(title === "450" || title === "250 Am"){
        await page.click('#nav-qualifying-tab');
        await page.select('#DataTables_Table_3_length > label > select','100');
        dataTable = 'DataTables_Table_3'
    }

    let qualifying = await page.evaluate((dataTable) =>{
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
        let uidArray = [];
        let entry = document.querySelectorAll(`#${dataTable} > tbody:nth-child(2) > tr`);
        let entryNum = entry.length;
        for(let i=0;i<entry.length;i++){
            numberArray[i] = document.querySelector(`#${dataTable} > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`#${dataTable} > tbody:nth-child(2) > tr:nth-child(${i+1}) > td:nth-child(4)`).innerHTML);
            uidArray[i] = parseInt(document.querySelector(`#${dataTable} > tbody > tr:nth-child(${i+1}) > td:nth-child(6)`).innerHTML)
        }
        return {numberArray, nameArray, uidArray, entryNum};
    }, dataTable);

    await page.goto(urlm1);
    await page.waitForTimeout(2000);

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
    await page.waitForTimeout(2000);

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
    for(let i=0;i<overall.length;i++){
        overall[i].overallPos = (i+1)
    }

    let overQuali = [];
    for(let i=0;i<overall.length;i++){
        for(let j=0;j<qualifying.entryNum;j++){
            if(qualifying.uidArray[j] === overall[i].uid){
                overQuali[i] = {
                    name: overall[i].name,
                    uid: overall[i].uid,
                    number: overall[i].number,
                    oaPos: parseInt(overall[i].overallPos),
                    qualiPos: j+1,
                    difference: (j+1) - parseInt(overall[i].overallPos)
                }
            }
        }
    }
    overQuali.sort((a,b)=>(a.difference < b.difference) ? 1 : -1)

    for(let i=0; i<overQuali.length; i++){
        let helper = overQuali[i].name;
        let n = helper.includes("|");

        if(i === 0){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `Top 5 Most Improved\n`)
        }
        if(i === (overQuali.length-5)){
            fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `Top 5 Least Improved\n`)
        }

        if(i < 5 || i > (overQuali.length-6)){
            if(!n){
                fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${i+1}. [i][size=85]#${overQuali[i].number}[/size][/i] - ${helper} [i][size=85](Qualifying: ${overQuali[i].qualiPos} - Overall: ${overQuali[i].oaPos} - Positions Gained/Lost: ${overQuali[i].difference})[/size][/i]\n`)
            } else{
                let name = '';
                name = helper.substring(0,helper.indexOf("|")).trim();
                let team = '';
                team = helper.substring(helper.indexOf("|")+1).trim();
                let bikeColor = '000000';
                for(let b=0;b<teams.length;b++){
                    if(overQuali[i].uid === teams[b].uid){
                        bikeColor = teams[b].bike;
                        team = teams[b].team;
                        name = teams[b].name;
                    } else {
                        //do nothing
                    }
                }
                if(team === "Privateer"){bikeColor='000000'}
                fs.appendFileSync(`${path.join(__dirname, "../../stats.txt")}`, `${i+1}. [i][size=85]#${overQuali[i].number}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${team}[/color][/size] [i][size=85](Qualifying: ${overQuali[i].qualiPos} - Overall: ${overQuali[i].oaPos} - Positions Gained/Lost: ${overQuali[i].difference})[/size][/i]\n`)
            }
        }

    }

    await browser.close();
}
