const ipcRenderer = require("electron").ipcRenderer;

const generateProSxStats =  () => {
    ipcRenderer.send(
        "generateProSxStats",
        {
            proSxQualifying: document.querySelector(".proSxQualifying").value,
            proSxHeat1_250: document.querySelector('.proSxHeat1_250').value,
            proSxHeat2_250: document.querySelector('.proSxHeat2_250').value,
            proSxHeat1_450: document.querySelector('.proSxHeat1_450').value,
            proSxHeat2_450: document.querySelector('.proSxHeat2_450').value,
            proSxLCQ_250: document.querySelector('.proSxLCQ_250').value,
            proSxLCQ_250Check: document.querySelector('.proSxLCQ_250Check').value,
            proSxLCQ_450: document.querySelector('.proSxLCQ_450').value,
            proSxLCQ_450Check: document.querySelector('.proSxLCQ_450Check').value,
            proSxMain_250: document.querySelector('.proSxMain_250').value,
            proSxMain_450: document.querySelector('.proSxMain_450').value,
            coast: document.querySelector('.coast').value
        },
        document.querySelector(".proSxQualifying").value,
        document.querySelector('.proSxHeat1_250').value,
        document.querySelector('.proSxHeat2_250').value,
        document.querySelector('.proSxHeat1_450').value,
        document.querySelector('.proSxHeat2_450').value,
        document.querySelector('.proSxLCQ_250').value,
        document.querySelector('.proSxLCQ_250Check').value,
        document.querySelector('.proSxLCQ_450').value,
        document.querySelector('.proSxLCQ_450Check').value,
        document.querySelector('.proSxMain_250').value,
        document.querySelector('.proSxMain_450').value,
        document.querySelector('.coast').value
    );
}

const generateAmSxStats = () => {
    ipcRenderer.send(
        "generateAmSxStats",
        {
            amSxQualifying: document.querySelector(".amSxQualifying").value,
            amSxHeat1_nov: document.querySelector('.amSxHeat1_nov').value,
            amSxHeat2_nov: document.querySelector('.amSxHeat2_nov').value,
            amSxHeat1_250: document.querySelector('.amSxHeat1_250').value,
            amSxHeat2_250: document.querySelector('.amSxHeat2_250').value,
            amSxHeat1_450: document.querySelector('.amSxHeat1_450').value,
            amSxHeat2_450: document.querySelector('.amSxHeat2_450').value,
            amSxLCQ_nov: document.querySelector('.amSxLCQ_nov').value,
            amSxLCQ_NovCheck: document.querySelector('.amSxLCQ_NovCheck').checked,
            amSxLCQ_250: document.querySelector('.amSxLCQ_250').value,
            amSxLCQ_250Check: document.querySelector('.amSxLCQ_250Check').checked,
            amSxLCQ_450: document.querySelector('.amSxLCQ_450').value,
            amSxLCQ_450Check: document.querySelector('.amSxLCQ_450Check').checked,
            amSxMain_nov: document.querySelector('.amSxMain_nov').value,
            amSxMain_250: document.querySelector('.amSxMain_250').value,
            amSxMain_450: document.querySelector('.amSxMain_450').value
        },
        document.querySelector(".amSxQualifying").value,
        document.querySelector('.amSxHeat1_nov').value,
        document.querySelector('.amSxHeat2_nov').value,
        document.querySelector('.amSxHeat1_250').value,
        document.querySelector('.amSxHeat2_250').value,
        document.querySelector('.amSxHeat1_450').value,
        document.querySelector('.amSxHeat2_450').value,
        document.querySelector('.amSxLCQ_nov').value,
        document.querySelector('.amSxLCQ_NovCheck').checked,
        document.querySelector('.amSxLCQ_250').value,
        document.querySelector('.amSxLCQ_250Check').checked,
        document.querySelector('.amSxLCQ_450').value,
        document.querySelector('.amSxLCQ_450Check').checked,
        document.querySelector('.amSxMain_nov').value,
        document.querySelector('.amSxMain_250').value,
        document.querySelector('.amSxMain_450').value
    );
}

ipcRenderer.on("statsUpdates", (event, data) => {
    const finishedTag = document.querySelector("#finished");
    finishedTag.innerText = data;
});