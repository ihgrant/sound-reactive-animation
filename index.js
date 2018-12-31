import Tone from 'tone';

const searchParams = new URLSearchParams(window.location.search);
const sourceType = searchParams.get('sourcetype');
const deviceId = searchParams.get('deviceid');
const FFT_SIZE = 32; // must be a power of 2 between 32 and 32768
const NUM_IMAGES = 8;
const VALUES_PER_IMAGE = FFT_SIZE / NUM_IMAGES;
const _source = new Tone.UserMedia();
const _fft = new Tone.FFT(FFT_SIZE);

// DOM stuff
const startButton = document.querySelector('.start');
const stopButton = document.querySelector('.stop');
const renderTarget = document.querySelector('.rendertarget');
const form = document.getElementById('source');
const sourceTypeInput = form.elements.sourcetype;

// temporary rendering to see if it's working or not.
const boxes = Array.from({ length: NUM_IMAGES }).map(el => {
    let box = document.createElement('div');
    box.setAttribute(
        'style',
        'height: 200px; width:200px; background-color:#d00'
    );
    renderTarget.append(box);

    return box;
});

sourceTypeInput.value = sourceType;
sourceTypeInput.addEventListener('change', () => {
    form.submit();
});

if (sourceType === 'device') {
    initializeDeviceSelect(document, form).catch(console.error);
}

//#region internals
function initializeDeviceSelect(_document, _form) {
    const deviceSelect = _document.createElement('select');
    const placeholderOption = _document.createElement('option');

    placeholderOption.append('Select a device...');
    deviceSelect.setAttribute('name', 'deviceid');
    deviceSelect.setAttribute('required', true);
    deviceSelect.append(placeholderOption);

    return Tone.UserMedia.enumerateDevices().then(devices => {
        devices.forEach(device => {
            let deviceOption = _document.createElement('option');
            deviceOption.setAttribute('value', device.deviceId);
            deviceOption.append(device.kind);
            deviceSelect.append(deviceOption);
        });

        deviceSelect.addEventListener('change', () => {
            _form.submit();
        });
        sourceTypeInput.insertAdjacentElement('afterend', deviceSelect);
        deviceSelect.value = deviceId;

        startButton.addEventListener('click', e => startMedia(e, deviceId));
    });
}

function startMedia(e, _deviceId) {
    e.preventDefault();

    if (!_deviceId) {
        return;
    }

    _source.connect(_fft);

    return _source
        .open(_deviceId)
        .then(() => {
            stopButton.addEventListener('click', () => {
                _source.close();
            });
            console.log('started');
            startLoop();
        })
        .catch(err => console.error('tone usermedia error', err));
}

function startLoop() {
    if (!_source || _source.state !== 'started') {
        return;
    }
    requestAnimationFrame(startLoop);
    let values = _fft.getValue();

    boxes.forEach((box, i) => {
        if (values[i]) {
            // console.log(values[i]);
            box.style.opacity = (values[i] + 100) / 100;
        }
    });
    // console.log('values', values);
}
//#endregion internals
