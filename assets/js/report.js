
const textarea = document.getElementsByTagName("textarea")[0]

async function saveReport() {
    let currentReport = window.btoa(encodeURIComponent(textarea.value));

    let data = {
        'reportContent': currentReport
    }

    let sendData = [];
    for(var property in data) {
        sendData.push(property + "=" + data[property]);
    }

    sendData = sendData.join("&");

    const response = await fetch("save", {
    method: 'POST',
    headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },

    body: sendData,

    });

    response.json().then(data => {
    });
}


const interval = setInterval(function() {
    saveReport();
}, 5000);
 
if(window.location.href.endsWith("/")) {
} else {
    window.location.href += "/" ;
}

if(reportMD) {
    reportMD = window.atob(reportMD);
    reportMD = decodeURIComponent(reportMD);
    textarea.value = reportMD;
}