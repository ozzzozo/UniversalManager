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

    let response = await fetch("save", {
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

async function uploadImage(data) {
    let imageData = {
        'data': encodeURIComponent(data) 
    }

    let sendData = [];
    for(var property in imageData) {
        sendData.push(property + "=" + imageData[property]);
    }

    sendData = sendData.join("&");

    let response = await fetch("saveImage", {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },

    body: sendData,
    });

    return response.json();
}

document.getElementById('report-editor').onpaste = async function (event) {
    var items = (event.clipboardData  || event.originalEvent.clipboardData).items;
    
    var blob = null;

    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") === 0) {
        blob = items[i].getAsFile();
      }
    }

    if (blob !== null) {
        var reader = new FileReader();
        reader.onload = async function(event) {
            let uploadedImage = await uploadImage(event.target.result);

            if(uploadedImage.hasOwnProperty("url")) {
                let lines = document.getElementsByClassName("CodeMirror-code")[0].childNodes;
                let index;

                for(let i = 0; i < lines.length; i++) {
                    if(lines[i].innerHTML.includes("activeline")) {
                        index = i;
                    }
                }
                
                let markdown = editor.getMarkdown().split("\n");
                let insert = `![](${window.location.origin}${uploadedImage["url"]})`;

                markdown[index] += insert;
                markdown = markdown.join("\n");

                editor.setMarkdown(markdown);
            }
      };
      reader.readAsDataURL(blob);
    }

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
