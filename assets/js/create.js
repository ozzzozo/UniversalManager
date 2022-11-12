
const fileTypes = [
    "image/apng",
    "image/gif",
    "image/jpeg",
    "image/pjpeg",
    "image/png",
];
  
function validFileType(file) {
    return fileTypes.includes(file.type);
}

function returnFileSize(number) {
    if (number < 1024) {
        return `${number} bytes`;
    } else if (number >= 1024 && number < 1048576) {
        return `${(number / 1024).toFixed(1)} KB`;
    } else if (number >= 1048576) {
        return `${(number / 1048576).toFixed(1)} MB`;
    }
}
  

function updateImageDisplay() {
    while(preview.firstChild) {
        preview.removeChild(preview.firstChild);
    }

    const curFiles = uploadInput.files;

    if (curFiles.length === 0) {
        const para = document.createElement('p');
        para.textContent = 'No files currently selected for upload';

        uploadText.classList.remove("hidden");
        preview.appendChild(para);
    } else {
        const list = document.createElement('ol');
        preview.appendChild(list);

        for (const file of curFiles) {
            const listItem = document.createElement('li');
            const para = document.createElement('p');
            if (validFileType(file)) {
                para.textContent = `File name ${file.name}, file size ${returnFileSize(file.size)}.`;
                const image = document.createElement('img');
                image.src = URL.createObjectURL(file);
                image.classList.add("previewImage");

                uploadText.classList.add("hidden");
                listItem.appendChild(image);
                listItem.appendChild(para);
            } else {
                para.textContent = `File name ${file.name}: Not a valid file type.`;
                listItem.appendChild(para);
            }

            list.appendChild(listItem);
        }
    }
}

const uploadInput = document.querySelector(".imageUpload");
const uploadText = document.getElementById('uploadText');
const preview = document.querySelector('.preview');

uploadInput.addEventListener('change', updateImageDisplay);