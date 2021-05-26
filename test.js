const { app, BrowserWindow, ipcMain } = require("electron");
const puppeteer = require('puppeteer');
const fs = require('fs');
const teams = require('./teams.json');

mains("450", "http://mxsimulator.com/servers/official.mxslobby.com:19801/races/8539.html", "http://mxsimulator.com/servers/official.mxslobby.com:19801/races/8541.html",
    "Motocross", "Overall")

async function mains(title, urlm1, urlm2, series, race){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(urlm1);
    await page.waitForTimeout(2000);
    fs.appendFileSync(`${__dirname}/stats.txt`, `\n[b][u]${title} ${series} ${race}[/b][/u]\n`);

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
        let numberArray = [];
        let nameArray = [];
        let uidArray = [];
        let obj = {};
        let posNum = position.length;
        for(let i=0;i<position.length;i++){
            numberArray[i] = document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(3) > a:nth-child(1)`).innerHTML);
            uidArray[i] = parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`).innerHTML)
        }
        return {numberArray, nameArray, posNum, uidArray};
    });

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
        let uidArray = [];
        let posNum = position.length;
        for(let i=0;i<position.length;i++){
            uidArray[i] = parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`).innerHTML)
        }
        return {posNum, uidArray};
    });

    for(let i=0;i<resultsm2.posNum;i++){
        let pointValue=0;

    }

    await browser.close();
}
