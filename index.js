import Tone from 'tone';

const searchParams = new URLSearchParams(window.location.search);
const sourceType = searchParams.get('sourcetype');
const deviceId = searchParams.get('deviceid');

// DOM stuff
let renderTarget = document.querySelector('.rendertarget');
let box = document.createElement('div');
box.setAttribute('style', 'height: 200px; width:200px; background-color:#d00');

renderTarget.innerHTML = '';
renderTarget.append(box);

// sound stuff
const form = document.getElementById('source');
const sourceTypeInput = form.elements.sourcetype;
sourceTypeInput.value = sourceType;

sourceTypeInput.addEventListener('change', () => {
    form.submit();
});

console.log(sourceType);

if (sourceType === 'device') {
    initializeDeviceSelect().catch(console.error);
}

function initializeDeviceSelect() {
    const deviceSelect = document.createElement('select');
    const placeholderOption = document.createElement('option');
    placeholderOption.append('Select a device...');
    deviceSelect.setAttribute('name', 'deviceid');
    deviceSelect.append(placeholderOption);

    return Tone.UserMedia.enumerateDevices().then(devices => {
        devices.forEach(device => {
            let deviceOption = document.createElement('option');
            deviceOption.setAttribute('value', device.deviceId);
            deviceOption.append(device.kind);
            deviceSelect.append(deviceOption);
        });

        deviceSelect.addEventListener('change', () => {
            form.submit();
        });
        sourceTypeInput.insertAdjacentElement('afterend', deviceSelect);
        deviceSelect.value = deviceId;
    });
}
