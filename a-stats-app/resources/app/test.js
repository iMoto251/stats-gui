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
        let positionArray = [];
        let numberArray = [];
        let nameArray = [];
        let uidArray = [];
        let pointsArray = [];
        let posNum = position.length;
        for(let i=0;i<position.length;i++){
            positionArray[i] = parseInt(document.querySelector(`body > div.main > table:nth-child(5) > tbody > tr:nth-child(${i+2}) > td.pos`).innerHTML)
            numberArray[i] = document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(2)`).innerHTML;
            nameArray[i] = capitalize(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(3) > a:nth-child(1)`).innerHTML);
            uidArray[i] = parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`).innerHTML)
            pointsArray[i] = motoPoints(i+1)
        }
        return {positionArray, numberArray, nameArray, posNum, uidArray, pointsArray};
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
        let uidArray = [];
        let pointsArray = [];
        let posNum = position.length;
        let obj = {};
        for(let i=0;i<position.length;i++){
            obj[i] = {uid:parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`).innerHTML), position:(i+1), points:motoPoints(i+1)}
            uidArray[i] = parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`).innerHTML);
            pointsArray[i] = motoPoints(i+1)
        }
        return {posNum, uidArray, pointsArray, obj};
    });

    await console.log(resultsm2.obj)
    let overall = [];
    let overallName = [];
    let overallNumber = [];
    let m1pos = [];
    let m2pos = [];
    let points = [];
    for(let i=0;i<resultsm1.posNum;i++){
        for(let j=0;j<resultsm2.posNum;j++){
            if(resultsm2.uidArray[i] === resultsm1.uidArray[j]){
                overall[j] = {name:resultsm1.nameArray[j], number:resultsm1.numberArray[j],moto1:resultsm1.positionArray[j]}
            }
        }
    }

    await browser.close();
}


