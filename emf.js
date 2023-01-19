const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");


async function qualifyingEMF(qualurl, bikeClass, teams){
    let selectorTable=''
    let qualSelector=''
    if(bikeClass === "250"){
        selectorTable = '#affiche-contenu-1'
        qualSelector = "#contenu_1"
    } else {
        selectorTable = '#affiche-contenu-2'
        qualSelector = "#contenu_2"
    }
    let browser = await puppeteer.launch({headless: false});
    let page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(qualurl);
    await page.click(selectorTable)

    let qualifying = await page.evaluate((qualSelector) =>{
        function capitalize(str) {
            return str.replace(
                /\w\S*/g,
                function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                }
            );
        }

        function replaceSymbols(str) {
            return str.replace(/['"]/g, function(char) {
              return char === "'" ? ":" : ".";
            });
        }

        let numberArray = [];
        let nameArray = [];
        let timeArray = [];
        let uidArray = [];
        for(let i = 0;i<10;i++){
            timeArray[i] = replaceSymbols(document.querySelector(`${qualSelector} > div:nth-child(3) > div:nth-child(${i+1}) > div:nth-child(5)`).innerHTML);
            nameArray[i] = capitalize(document.querySelector(`${qualSelector} > div:nth-child(3) > div:nth-child(${i+1}) > div:nth-child(4)`).innerHTML.trim());
            numberArray[i] = document.querySelector(`${qualSelector} > div:nth-child(3) > div:nth-child(${i+1}) > div:nth-child(7)`).innerHTML;
            uidArray[i] = parseInt((document.querySelector(`${qualSelector} > div:nth-child(3) > div:nth-child(${i+1})`).outerHTML).match(/\d+/));
        }
        return {numberArray,nameArray,timeArray,uidArray}    
    },qualSelector)


    for(let i = 0;i<10;i++){
        let teamStr = '';
        let name = '';
        let bikeColor = '000000';
        for(let j=0; j<teams.length; j++){
            if(qualifying.uidArray[i] === parseInt(teams[j].uid)){
                teamStr = teams[j].team;
                bikeColor = teams[j].bike;
                name = teams[j].name;
            }
        }
        if(teamStr !== '' && teamStr !== "Privateer"){
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `${i+1}. [i][size=85]#${qualifying.numberArray[i]}[/size][/i] - ${name} | [size=85][color=#${bikeColor}]${teamStr}[/color][/size] - [size=85][i]${qualifying.timeArray[i]}[/i][/size]\n`)
        } else {
            fs.appendFileSync(`${path.join(__dirname, "stats.txt")}`, `${i+1}. [i][size=85]#${qualifying.numberArray[i]}[/size][/i] - ${name} - [size=85][i]${qualifying.timeArray[i]}[/i][/size]\n`)
        }
    }

    await browser.close();
}

exports.qualifyingEMF = qualifyingEMF;