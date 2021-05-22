const { app, BrowserWindow, ipcMain } = require("electron");
const puppeteer = require('puppeteer');
const fs = require('fs');
const teams = require('./teams.json');

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

/*
Pro
https://www.racefactorygaming.com/Events/Event?event=726
Am
https://www.racefactorygaming.com/Events/Event?event=728
http://mxsimulator.com/servers/official.mxslobby.com:19801/races/8371.html
*/

ipcMain.on("generateProSxStats", async (event, data) => {
    let coast = data.coast;

    await win.webContents.send("statsUpdates", 'Starting')

    await qual250Pro(data.proSxQualifying);
    await qual450Pro(data.proSxQualifying);
    await win.webContents.send("statsUpdates", 'Qualifying Done')

    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]Heat Results[/b][/u]\n`)
    await heats(`250 ${coast}`, "1", data.proSxHeat1_250);
    await heats(`250 ${coast}`, "2", data.proSxHeat2_250);
    await heats("450", "1", data.proSxHeat1_450);
    await heats("450", "2", data.proSxHeat2_450);
    await win.webContents.send("statsUpdates", 'Heats Done')

    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]LCQ Results[/b][/u]\n`)
    if(data.proSxLCQ_250Check === false){
        await lcq("250", data.proSxLCQ_250);
    }
    if(data.proSxLCQ_450Check === false){
        await lcq("450", data.proSxLCQ_450);
    }
    await win.webContents.send("statsUpdates", 'LCQs Done')

    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]Main Results[/b][/u]\n`)
    await mains("250", data.proSxMain_250);
    await mains("450", data.proSxMain_450);
    await win.webContents.send("statsUpdates", 'Mains Done')

    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]Top 20 in Points[/b][/u]\n`);
    await points250wPro(data.proSxQualifying);
    await points250ePro(data.proSxQualifying);
    await points450Pro(data.proSxQualifying);

    await win.webContents.send("statsUpdates", 'Finished!')
});

ipcMain.on("generateAmSxStats", async(event, data) =>{
    await win.webContents.send("statsUpdates", 'Starting')

    await qual250Novice(data.amSxQualifying);
    await qual250Am(data.amSxQualifying);
    await qual450Am(data.amSxQualifying);
    await win.webContents.send("statsUpdates", 'Qualifying Done')

    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]Heat Results[/b][/u]\n`)
    await heats(`250 Novice`, "1", data.amSxHeat1_nov);
    await heats(`250 Novice`, "2", data.amSxHeat2_nov);
    await heats(`250 Am`, "1", data.amSxHeat1_250);
    await heats(`250 Am`, "2", data.amSxHeat2_250);
    await heats("450 Am", "1", data.amSxHeat1_450);
    await heats("450 Am", "2", data.amSxHeat2_450);
    await win.webContents.send("statsUpdates", 'Heats Done')

    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]LCQ Results[/b][/u]\n`)

    if(data.amSxLCQ_NovCheck === false){
        await lcq("250 Novice", data.amSxLCQ_nov);
    }
    if(data.amSxLCQ_250Check === false){
        await lcq("250 Am", data.amSxLCQ_250);
    }
    if(data.amSxLCQ_450Check === false){
        await lcq("450 Am", data.amSxLCQ_450);
    }
    await win.webContents.send("statsUpdates", 'LCQs Done')

    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]Main Results[/b][/u]\n`)
    await mains("250 Novice", data.amSxMain_nov);
    await mains("250 Am", data.amSxMain_250);
    await mains("450 Am", data.amSxMain_450);
    await win.webContents.send("statsUpdates", 'Mains Done')

    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]Top 20 in Points[/b][/u]\n`);
    await points250Novice(data.amSxQualifying);
    await points250Am(data.amSxQualifying);
    await points450Am(data.amSxQualifying);

    await win.webContents.send("statsUpdates", 'Finished!')
})

async function qual250Pro(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.writeFile(`${__dirname}/stats.txt`, `[url=${qualurl}][color=#0080BF][b]Top 10 Qualifiers[/b][/color][/url]\n\n[b][u]250 Supercross[/b][/u]\n`, 'utf8', () =>{});

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
        let bikeColor = '';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(qualifying.uidArray[j] === teams[k].UID){
                bikeColor = teams[k].Bike;
                teamStr = teams[k].Team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function qual450Pro(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]450 Supercross[/b][/u]\n`);

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
        let bikeColor = '';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(qualifying.uidArray[j] === teams[k].UID){
                bikeColor = teams[k].Bike;
                teamStr = teams[k].Team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function qual250Novice(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.writeFile(`${__dirname}/stats.txt`, `[url=${qualurl}][color=#0080BF][b]Top 10 Qualifiers[/b][/color][/url]\n\n[b][u]250 Novice Supercross[/b][/u]\n`, 'utf8', () =>{});

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
        let bikeColor = '';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(qualifying.uidArray[j] === teams[k].UID){
                bikeColor = teams[k].Bike;
                teamStr = teams[k].Team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        }
    }

    await browser.close();
}

async function qual250Am(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]250 Am Supercross[/b][/u]\n`);

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
        let bikeColor = '';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(qualifying.uidArray[j] === teams[k].UID){
                bikeColor = teams[k].Bike;
                teamStr = teams[k].Team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        }
    }

    await browser.close();
}

async function qual450Am(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]450 Am Supercross[/b][/u]\n`);

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
        let bikeColor = '';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(qualifying.uidArray[j] === teams[k].UID){
                bikeColor = teams[k].Bike;
                teamStr = teams[k].Team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${qualifying.numberArray[j]}[/size][/i] - ${qualifying.nameArray[j]} - [size=85][i]${qualifying.timeArray[j]}[/i][/size]\n`)
        }

    }
    await browser.close();
}

async function heats(title, num, url){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(url);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]${title} Supercross Heat ${num}[/b][/u]\n`);

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
            uidArray[i] = parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`))
        }
        return {numberArray, nameArray, posNum, uidArray};
    });

    for(let j = 0; j<results.posNum;j++){
        if(j<9){
            let helper = results.nameArray[j];
            let n = helper.includes("|");
            if(!n){
                fs.appendFileSync(`${__dirname}/stats.txt`, `[color=#00BF00]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] ${helper}\n`)
            } else {
                let name = helper.substring(0,helper.indexOf("|")-1);
                let team = helper.substring(helper.indexOf("|")+2);
                let bikeColor = '';
                for(let k=0; k<teams.length; k++){
                    if(results.uidArray[j] === teams[k].UID){
                        bikeColor = teams[k].Bike;
                    } else{
                        //do nothing
                    }
                }
                if(team === "Privateer"){bikeColor='000000'}
                fs.appendFileSync(`${__dirname}/stats.txt`, `[color=#00BF00]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] ${name} | [size=85][color=#${bikeColor}]${team}[/color][/size]\n`)
            }
        } else {
            let helper = results.nameArray[j];
            let n = helper.includes("|");
            if(!n){
                fs.appendFileSync(`${__dirname}/stats.txt`, `[color=#FF0000]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] ${helper}\n`)
            } else {
                let name = helper.substring(0,helper.indexOf("|")-1);
                let team = helper.substring(helper.indexOf("|")+2);
                let bikeColor = '';
                for(let k=0; k<teams.length; k++){
                    if(results.uidArray[j] === teams[k].UID){
                        bikeColor = teams[k].Bike;
                    } else{
                        //do nothing
                    }
                }
                if(team === "Privateer"){bikeColor='000000'}
                fs.appendFileSync(`${__dirname}/stats.txt`, `[color=#FF0000]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] ${name} | [size=85][color=#${bikeColor}]${team}[/color][/size]\n`)
            }
        }
    }
    await browser.close();
}

async function lcq(title, url){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(url);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]${title} Supercross LCQ[/b][/u]\n`);

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
            uidArray[i] = parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`))
        }
        return {numberArray, nameArray, posNum, uidArray};
    });

    for(let j = 0; j<results.posNum;j++){
        if(j<4){
            let helper = results.nameArray[j];
            let n = helper.includes("|");
            if(!n){
                fs.appendFileSync(`${__dirname}/stats.txt`, `[color=#00BF00]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] ${helper}\n`)
            } else {
                let name = helper.substring(0,helper.indexOf("|")-1);
                let team = helper.substring(helper.indexOf("|")+2);
                let bikeColor = '';
                for(let k=0; k<teams.length; k++){
                    if(results.uidArray[j] === teams[k].UID){
                        bikeColor = teams[k].Bike;
                    } else{
                        //do nothing
                    }
                }
                if(team === "Privateer"){bikeColor='000000'}
                fs.appendFileSync(`${__dirname}/stats.txt`, `[color=#00BF00]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] ${name} | [size=85][color=#${bikeColor}]${team}[/color][/size]\n`)
            }
        } else {
            let helper = results.nameArray[j];
            let n = helper.includes("|");
            if(!n){
                fs.appendFileSync(`${__dirname}/stats.txt`, `[color=#FF0000]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] ${helper}\n`)
            } else {
                let name = helper.substring(0,helper.indexOf("|")-1);
                let team = helper.substring(helper.indexOf("|")+2);
                let bikeColor = '';
                for(let k=0; k<teams.length; k++){
                    if(results.uidArray[j] === teams[k].UID){
                        bikeColor = teams[k].Bike;
                    } else{
                        //do nothing
                    }
                }
                if(team === "Privateer"){bikeColor='000000'}
                fs.appendFileSync(`${__dirname}/stats.txt`, `[color=#FF0000]${j+1}.[/color] [i][size=85]#${results.numberArray[j]}[/size][/i] ${name} | [size=85][color=#${bikeColor}]${team}[/color][/size]\n`)
            }
        }
    }
    await browser.close();
}

async function mains(title, url){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(url);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]${title} Supercross Main Event[/b][/u]\n`);

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
            uidArray[i] = parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`))
        }
        return {numberArray, nameArray, posNum, uidArray};
    });

    for(let j = 0; j<results.posNum;j++){
        let helper = results.nameArray[j];
        let n = helper.includes("|");
        if(!n){
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${results.numberArray[j]}[/size][/i] ${helper}\n`)
        } else {
            let name = helper.substring(0,helper.indexOf("|")-1);
            let team = helper.substring(helper.indexOf("|")+2);
            let bikeColor = '';
            for(let k=0; k<teams.length; k++){
                if(results.uidArray[j] === teams[k].UID){
                    bikeColor = teams[k].Bike;
                } else{
                    //do nothing
                }
            }
            if(team === "Privateer"){bikeColor='000000'}
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${results.numberArray[j]}[/size][/i] ${name} | [size=85][color=#${bikeColor}]${team}[/color][/size]\n`)
        }
    }
    await browser.close();
}

async function points250wPro(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]250 West Supercross[/b][/u]\n`);

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
            let bikeColor = '';
            let teamStr = '';
            for(let k=0; k<teams.length; k++){
                if(points.uidArray[j] === teams[k].UID){
                    bikeColor = teams[k].Bike;
                    teamStr = teams[k].Team;
                } else{
                    //do nothing
                }
            }
            if(teamStr !== ''){
                fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
            } else{
                fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
            }
        }    }
    await browser.close();
}

async function points250ePro(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]250 East Supercross[/b][/u]\n`);

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
        let bikeColor = '';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(points.uidArray[j] === teams[k].UID){
                bikeColor = teams[k].Bike;
                teamStr = teams[k].Team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function points450Pro(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]450 Supercross[/b][/u]\n`);

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
        let bikeColor = '';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(points.uidArray[j] === teams[k].UID){
                bikeColor = teams[k].Bike;
                teamStr = teams[k].Team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function points250Novice(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]250 Novice Supercross[/b][/u]\n`);

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
        let bikeColor = '';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(points.uidArray[j] === teams[k].UID){
                bikeColor = teams[k].Bike;
                teamStr = teams[k].Team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function points250Am(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]250 Am Supercross[/b][/u]\n`);

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
        let bikeColor = '';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(points.uidArray[j] === teams[k].UID){
                bikeColor = teams[k].Bike;
                teamStr = teams[k].Team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}

async function points450Am(qualurl){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(qualurl);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]450 Am Supercross[/b][/u]\n`);

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
        let bikeColor = '';
        let teamStr = '';
        for(let k=0; k<teams.length; k++){
            if(points.uidArray[j] === teams[k].UID){
                bikeColor = teams[k].Bike;
                teamStr = teams[k].Team;
            } else{
                //do nothing
            }
        }
        if(teamStr !== ''){
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        } else{
            fs.appendFileSync(`${__dirname}/stats.txt`, `${j+1}. [i][size=85]#${points.numberArray[j]}[/size][/i] - ${points.nameArray[j]} - [size=85][i]${points.pointArray[j]}[/i][/size]\n`)
        }
    }
    await browser.close();
}