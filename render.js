const ipcRenderer = require("electron").ipcRenderer;

const generateProSxStats =  () => {
    ipcRenderer.send(
        "generateProSxStats",
        {
            proNation: document.querySelector(".proNation").value,
            proSxQualifying: document.querySelector(".proSxQualifying").value,
            proSxHeat1_250: document.querySelector('.proSxHeat1_250').value,
            proSxHeat2_250: document.querySelector('.proSxHeat2_250').value,
            proSxHeat1_450: document.querySelector('.proSxHeat1_450').value,
            proSxHeat2_450: document.querySelector('.proSxHeat2_450').value,
            proSxLCQ_250: document.querySelector('.proSxLCQ_250').value,
            proSxLCQ_450: document.querySelector('.proSxLCQ_450').value,
            proSxMain_250: document.querySelector('.proSxMain_250').value,
            proSxMain_450: document.querySelector('.proSxMain_450').value,
            coast: document.querySelector('.coast').value
        },
        document.querySelector(".proNation").value,
        document.querySelector(".proSxQualifying").value,
        document.querySelector('.proSxHeat1_250').value,
        document.querySelector('.proSxHeat2_250').value,
        document.querySelector('.proSxHeat1_450').value,
        document.querySelector('.proSxHeat2_450').value,
        document.querySelector('.proSxLCQ_250').value,
        document.querySelector('.proSxLCQ_450').value,
        document.querySelector('.proSxMain_250').value,
        document.querySelector('.proSxMain_450').value,
        document.querySelector('.coast').value
    );
}

const generateProSxTCStats = () => {
    ipcRenderer.send(
        "generateProSxTCStats",
        {
            proSxTcQualiCheck: document.querySelector(".proSxTcQualiCheck").checked,
            proSxTcQualifying: document.querySelector(".proSxTcQualifying").value,
            proSxTcLCQ_250: document.querySelector(".proSxTcLCQ_250").value,
            proSxTcLCQ_250Check: document.querySelector('.proSxTcLCQ_250Check').checked,
            proSxTcLCQ_450: document.querySelector(".proSxTcLCQ_450").value,
            proSxTcLCQ_450Check: document.querySelector('.proSxTcLCQ_450Check').checked,
            proSxTcMain1_250: document.querySelector('.proSxTcMain1_250').value,
            proSxTcMain2_250: document.querySelector('.proSxTcMain2_250').value,
            proSxTcMain3_250: document.querySelector('.proSxTcMain3_250').value,
            proSxTcMain1_450: document.querySelector('.proSxTcMain1_450').value,
            proSxTcMain2_450: document.querySelector('.proSxTcMain2_450').value,
            proSxTcMain3_450: document.querySelector('.proSxTcMain3_450').value,
            coast: document.querySelector('.coast').value
        },
        document.querySelector(".proSxTcQualiCheck").checked,
        document.querySelector(".proSxTcQualifying").value,
        document.querySelector(".proSxTcLCQ_250").value,
        document.querySelector('.proSxTcLCQ_250Check').checked,
        document.querySelector(".proSxTcLCQ_450").value,
        document.querySelector('.proSxTcLCQ_450Check').checked,
        document.querySelector('.proSxTcMain1_250').value,
        document.querySelector('.proSxTcMain2_250').value,
        document.querySelector('.proSxTcMain3_250').value,
        document.querySelector('.proSxTcMain1_450').value,
        document.querySelector('.proSxTcMain2_450').value,
        document.querySelector('.proSxTcMain3_450').value,
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
            amSxLCQ_250: document.querySelector('.amSxLCQ_250').value,
            amSxLCQ_450: document.querySelector('.amSxLCQ_450').value,
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
        document.querySelector('.amSxLCQ_250').value,
        document.querySelector('.amSxLCQ_450').value,
        document.querySelector('.amSxMain_nov').value,
        document.querySelector('.amSxMain_250').value,
        document.querySelector('.amSxMain_450').value
    );
}

const generateAmSxTCStats = () => {
    ipcRenderer.send(
        "generateAmSxTCStats",
        {
            amSxTcQualiCheck: document.querySelector(".amSxTcQualiCheck").checked,
            amSxTcQualifying: document.querySelector(".amSxTcQualifying").value,
            amSxTcLCQ_Nov: document.querySelector(".amSxTcLCQ_Nov").value,
            amSxTcLCQ_NovCheck: document.querySelector(".amSxTcLCQ_NovCheck").checked,
            amSxTcLCQ_250: document.querySelector(".amSxTcLCQ_250").value,
            amSxTcLCQ_250Check: document.querySelector(".amSxTcLCQ_250Check").checked,
            amSxTcLCQ_450: document.querySelector(".amSxTcLCQ_450").value,
            amSxTcLCQ_450Check: document.querySelector(".amSxTcLCQ_450Check").checked,
            amSxTcMain1_Nov: document.querySelector('.amSxTcMain1_Nov').value,
            amSxTcMain2_Nov: document.querySelector('.amSxTcMain2_Nov').value,
            amSxTcMain3_Nov: document.querySelector('.amSxTcMain3_Nov').value,
            amSxTcMain1_250: document.querySelector('.amSxTcMain1_250').value,
            amSxTcMain2_250: document.querySelector('.amSxTcMain2_250').value,
            amSxTcMain3_250: document.querySelector('.amSxTcMain3_250').value,
            amSxTcMain1_450: document.querySelector('.amSxTcMain1_450').value,
            amSxTcMain2_450: document.querySelector('.amSxTcMain2_450').value,
            amSxTcMain3_450: document.querySelector('.amSxTcMain3_450').value,
        },
        document.querySelector(".amSxTcQualiCheck").checked,
        document.querySelector(".amSxTcLCQ_Nov").value,
        document.querySelector(".amSxTcLCQ_NovCheck").checked,
        document.querySelector(".amSxTcLCQ_250").value,
        document.querySelector(".amSxTcLCQ_250Check").checked,
        document.querySelector(".amSxTcLCQ_450").value,
        document.querySelector(".amSxTcLCQ_450Check").checked,
        document.querySelector(".amSxTcQualifying").value,
        document.querySelector('.amSxTcMain1_Nov').value,
        document.querySelector('.amSxTcMain2_Nov').value,
        document.querySelector('.amSxTcMain3_Nov').value,
        document.querySelector('.amSxTcMain1_250').value,
        document.querySelector('.amSxTcMain2_250').value,
        document.querySelector('.amSxTcMain3_250').value,
        document.querySelector('.amSxTcMain1_450').value,
        document.querySelector('.amSxTcMain2_450').value,
        document.querySelector('.amSxTcMain3_450').value,
    );
}

const generateProMxStats =  () => {
    ipcRenderer.send(
        "generateProMxStats",
        {
            proMxQualiCheck: document.querySelector(".proMxQualiCheck").checked,
            proMxQualifying: document.querySelector(".proMxQualifying").value,
            proMxConsi_250Check: document.querySelector(".proMxConsi_250Check").checked,
            proMxConsi_250: document.querySelector(".proMxConsi_250").value,
            proMxMoto1_250: document.querySelector(".proMxMoto1_250").value,
            proMxMoto2_250: document.querySelector(".proMxMoto2_250").value,
            proMxStand_250: document.querySelector(".standings250").value,
            proMxConsi_450Check: document.querySelector(".proMxConsi_450Check").checked,
            proMxConsi_450: document.querySelector(".proMxConsi_450").value,
            proMxMoto1_450: document.querySelector(".proMxMoto1_450").value,
            proMxMoto2_450: document.querySelector(".proMxMoto2_450").value,
            proMxStand_450: document.querySelector(".standings450").value,
        },
        document.querySelector(".proMxQualiCheck").checked,
        document.querySelector(".proMxQualifying").value,
        document.querySelector(".proMxConsi_250Check").checked,
        document.querySelector(".proMxConsi_250").value,
        document.querySelector(".proMxMoto1_250").value,
        document.querySelector(".proMxMoto2_250").value,
        document.querySelector(".standings250").value,
        document.querySelector(".proMxConsi_450Check").checked,
        document.querySelector(".proMxConsi_450").value,
        document.querySelector(".proMxMoto1_450").value,
        document.querySelector(".proMxMoto2_450").value,
        document.querySelector(".standings450").value,
    );
}

const generateAmMxStats =  () => {
    ipcRenderer.send(
        "generateAmMxStats",
        {
            amMxQualiCheck: document.querySelector(".amMxQualiCheck").checked,
            amMxQualifying: document.querySelector(".amMxQualifying").value,
            amMxConsi_250Check: document.querySelector(".amMxConsi_250Check").checked,
            amMxConsi_250: document.querySelector(".amMxConsi_250").value,
            amMxMoto1_250: document.querySelector(".amMxMoto1_250").value,
            amMxMoto2_250: document.querySelector(".amMxMoto2_250").value,
            amMxConsi_450Check: document.querySelector(".amMxConsi_450Check").checked,
            amMxConsi_450: document.querySelector(".amMxConsi_450").value,
            amMxMoto1_450: document.querySelector(".amMxMoto1_450").value,
            amMxMoto2_450: document.querySelector(".amMxMoto2_450").value
        },
        document.querySelector(".amMxQualiCheck").checked,
        document.querySelector(".amMxQualifying").value,
        document.querySelector(".amMxConsi_250Check").checked,
        document.querySelector(".amMxConsi_250").value,
        document.querySelector(".amMxMoto1_250").value,
        document.querySelector(".amMxMoto2_250").value,
        document.querySelector(".amMxConsi_450Check").checked,
        document.querySelector(".amMxConsi_450").value,
        document.querySelector(".amMxMoto1_450").value,
        document.querySelector(".amMxMoto2_450").value
    );
}

ipcRenderer.on("statsUpdates", (event, data) => {
    const finishedTag = document.querySelector("#finished");
    finishedTag.innerText = data;
});

ipcRenderer.on("sendError", (event, data) => {
    const errorTag = document.querySelector("#error");
    errorTag.innerText = data;
});