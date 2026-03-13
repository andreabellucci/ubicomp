import { AudioClassifier, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-audio@0.10.0";

let audioClassifier;
let audioBuffer = []; // Buffer para acumular muestras para YAMNet

const soundText = document.querySelector("#sound-name");
const confidenceText = document.querySelector("#confidence-val");

async function init() {
    const audio = await FilesetResolver.forAudioTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-audio@0.10.0/wasm");
    audioClassifier = await AudioClassifier.createFromOptions(audio, {
        baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/audio_classifier/yamnet/float32/1/yamnet.tflite" },
        runningMode: "AUDIO_STREAM"
    });
}

async function startAudio() {
    const audioCtx = new AudioContext({
        latencyHint: "playback"
    });
    console.log(audioCtx.sampleRate);

    const NUM_SECONDS = 3;
    const BUFFER_SIZE = audioCtx.sampleRate * NUM_SECONDS; //Muestra para YAMNet
    await audioCtx.audioWorklet.addModule('audio-processor.js');

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioCtx.createMediaStreamSource(stream);
    const workletNode = new AudioWorkletNode(audioCtx, 'audio-processor');

    workletNode.port.onmessage = (event) => {

        const chunk = event.data;
        audioBuffer.push(...chunk);

        // Cuando el buffer tiene suficientes datos, clasificamos
        if (audioBuffer.length >= BUFFER_SIZE) {
            const floatData = new Float32Array(audioBuffer);
            const results = audioClassifier.classify(floatData, audioCtx.sampleRate);

            applyHeuristics(results);
            audioBuffer = []; // Limpiamos buffer
        }
    };

    source.connect(workletNode);
}

function applyHeuristics(results) {
    // Obtenemos la clasificación con mayor probabilidad del primer bloque de resultados
    const topCategory = results[0].classifications[0].categories[0];

    const name = topCategory.categoryName;
    const score = (topCategory.score * 100).toFixed(1);

    soundText.innerText = name.toUpperCase();
    confidenceText.innerText = score;

    // Lógica personalizada basada en eventos específicos
    if (name === "Clapping" && topCategory.score > 0.6) {
        soundText.className = "active";
        console.log("¡He detectado un aplauso!");
    } else {
        soundText.className = "";
    }
}

// Inicialización
document.querySelector("#start-btn").addEventListener("click", startAudio);
init();