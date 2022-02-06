
// #################### import ###########################
// -------------------------------------------------------

// require
const { desktopCapturer, remote}   = require('electron');
const { Menu }                     = remote;
const { dialog }                   = remote;
const { writeFile }                = require('fs');


// const & variable
const videoElement                 = document.querySelector('video');
const startBtn                     = document.getElementById('startBtn');
const stopBtn                      = document.getElementById('stopBtn');
const videoSelectBtn               = document.getElementById('videoSelectBtn');

videoSelectBtn.onclick             = getVideoSources;


// déclaration
let mediaRecorder;
const recordedChunks = [];

// -------------------------------------------------------
// #######################################################





// ################### fonction ##########################
// -------------------------------------------------------

async function getVideoSources() {

    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );

    videoOptionsMenu.popup();
};

async function selectSource(source) {

    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

    const stream = await navigator.mediaDevices
        .getUserMedia(constraints);

    videoElement.srcObject = stream;
    videoElement.play();    

    const options = {
        mimeType: 'video/webm; codecs=vp9'
    };

    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop          = handleStop;

};

function handleDataAvailable(e) {
    console.log('video data available');
    recordedChunks.push(e.data);
};

async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });

    const buffer        = Buffer.from(await blob.arrayBuffer());

    const { filePath }  = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.webm`
    });

    console.log(filePath);

    writeFile(filePath, buffer, () => {console.log('vidéo saved successfully !!! Ouhou')});

};

stopBtn.onclick = (e) => {
    mediaRecorder.stop();
    startBtn.classList.remove('BTN-red');
    startBtn.classList.add('BTN-green');
};
startBtn.onclick = (e) => {
  mediaRecorder.start();
  startBtn.classList.add('BTN-red');
  startBtn.classList.remove('BTN-green');
};

// -------------------------------------------------------
// #######################################################