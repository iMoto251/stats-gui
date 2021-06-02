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
        console.log(overall[a].uid);

        if(!n){
            fs.appendFileSync(`${__dirname}/stats.txt`, `${a+1}. [i][size=85]#${overall[a].number}[/size][/i] - ${helper} [i][size=85](${overall[a].moto1} - ${overall[a].moto2})[/size][/i]\n`)
        } else{
            let name = helper.substring(0,helper.indexOf("|")).trim();
            let team = '';
            team = helper.substring(helper.indexOf("|")+1).trim();
            let bikeColor = '000000';
            for(let b=0;b<teams.length;b++){
                if(overall[a].uid === teams[b].uid){
                    bikeColor = teams[b].bike;
                    team = teams[b].team;
                } else {
                    //do nothing
                }
            }
            if(team === "Privateer"){bikeColor='000000'}
            fs.appendFileSync(`${__dirname}/stats.txt`, `${a+1}. [i][size=85]#${overall[a].number}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${team}[/color][/size] [i][size=85](${overall[a].moto1} - ${overall[a].moto2})[/i][/size]\n`)
        }
    }
    await browser.close();
}
