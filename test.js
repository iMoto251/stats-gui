//const { app, BrowserWindow, ipcMain } = require("electron");
const puppeteer = require('puppeteer');
//const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');



async function makeSXPoints(title, url, coast, round){
    let browser = await puppeteer.launch({headless: true});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(url);
    await page.waitForTimeout(2000);

    let results = await page.evaluate(() =>{
        let position = document.querySelectorAll(`td.pos`);
        let uidArray = [];
        let posNum = position.length;
        for(let i=0;i<position.length;i++){
            uidArray[i] = parseInt(document.querySelector(`table.laptimes:nth-child(5) > tbody:nth-child(1) > tr:nth-child(${i+2}) > td:nth-child(9)`).innerHTML)
        }
        return {posNum, uidArray};
    });

    let pointsJSON = []
    let points = 26
    for(let i=0;i<results.posNum;i++){
        if(i===0){
            pointsJSON[i] = {uid: results.uidArray[i], points: points}
            points = 23
        } else
        if(i===1){
            pointsJSON[i] = {uid: results.uidArray[i], points: points}
            points = 21
        } else
        if(i===2){
            pointsJSON[i] = {uid: results.uidArray[i], points: points}
            points = 19
        } else{
            pointsJSON[i] = {uid: results.uidArray[i], points: points}
            points--
        }
    }

    const pointString = JSON.stringify(pointsJSON)
    //let season250epoints = []
    //let season250wpoints = []
    //let season450points = []
    //fs.writeFileSync(`./${title}etotal.json`, pointString)
    if(coast === "East"){
        if(title === "250"){
            try{
                let rawdata = fs.readFileSync(path.resolve(__dirname, '250etotal.json'))
                let season250epoints = JSON.parse(rawdata)
                for(i=0; i<results.posNum; i++){
                    for(j=0; j<season250epoints.length; j++){
                        //console.log("loop")
                        //console.log(results.uidArray[i] + " " + season250epoints[j].uid)
                        if(results.uidArray[i] === season250epoints[j].uid){
                            season250epoints[j].points = season250epoints[j].points + pointsJSON[i].points
                        }
                    }
                }
                const writeData = JSON.stringify(season250epoints)
                fs.writeFileSync(`./${title}etotal.json`, writeData)
            } catch (e){
                console.log(e)
                fs.writeFileSync(`./${title}etotal.json`, pointString)
            }

        }
        if(title === "450"){
            try{
                let rawdata = fs.readFileSync(path.resolve(__dirname, '450total.json'))
                let season450points = JSON.parse(rawdata)
                fs.writeFileSync(`./${title}total.json`, pointString)
            } catch (e){
                fs.writeFileSync(`./${title}total.json`, pointString)
            }
            
            
        }
    }
    if(coast === "West"){
        if(title === "250"){
            fs.writeFileSync(`./${title}wtotal.json`, pointString)
        }
        if(title === "450"){
            fs.writeFileSync(`./${title}total.json`, pointString)
        }
    }

    
    //console.log(pointsJSON)
    await browser.close();
}

async function main(){
    try{
        await makeSXPoints("250", "https://mxsimulator.com/servers/na.rfgservers.com/races/370.html", "East", "A1");
        await makeSXPoints("450", "https://mxsimulator.com/servers/na.rfgservers.com/races/371.html", "East", "A1");
    } catch(e){
        console.log(e)
    }
}

main();