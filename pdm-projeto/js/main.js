// registrando o service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      let reg = await navigator.serviceWorker.register('/sw.js', { type: 'module' });
      console.log('🦄 Service worker registrado! ', reg);
    } catch (err) {
      console.log('🧨 Service worker registro falhou: ', err);
    }
  });
}

// Configurações da câmera
let usandoFrontal = true;
let fotos = [];
let db;

// IndexedDB setup
const request = indexedDB.open("cameraDB", 1);
request.onupgradeneeded = e => {
  db = e.target.result;
  db.createObjectStore("fotos", { autoIncrement: true });
};
request.onsuccess = e => {
  db = e.target.result;
  carregarFotosSalvas();
};

// Funções IndexedDB
function salvarFoto(foto) {
  if (!db) return;
  const tx = db.transaction("fotos", "readwrite");
  const store = tx.objectStore("fotos");
  store.add(foto);
}

function carregarFotosSalvas() {
  const tx = db.transaction("fotos", "readonly");
  const store = tx.objectStore("fotos");
  const req = store.getAll();
  req.onsuccess = () => {
    fotos = req.result.slice(-3).reverse();
    mostrarFotos();
  };
}

// Configuração da câmera
var constraints = { video: { facingMode: "user" }, audio: false };

// Elementos
const cameraView = document.querySelector("#camera--view"),
      cameraOutput = document.querySelector("#camera--output"),
      cameraSensor = document.querySelector("#camera--sensor"),
      cameraTrigger = document.querySelector("#camera--trigger");

// Cria galeria de fotos
const galeria = document.createElement("div");
galeria.id = "galeria";
document.body.appendChild(galeria);

// Cria botão pra trocar câmera
const botaoTrocar = document.createElement("button");
botaoTrocar.textContent = "Trocar câmera";
botaoTrocar.style.position = "fixed";
botaoTrocar.style.top = "20px";
botaoTrocar.style.left = "20px";
botaoTrocar.style.padding = "10px";
botaoTrocar.style.background = "black";
botaoTrocar.style.color = "white";
botaoTrocar.style.border = "none";
botaoTrocar.style.borderRadius = "20px";
botaoTrocar.style.cursor = "pointer";
document.body.appendChild(botaoTrocar);

// Inicia a câmera
function cameraStart() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      let track = stream.getTracks()[0];
      cameraView.srcObject = stream;
    })
    .catch(function (error) {
      console.error("Ocorreu um erro.", error);
    });
}

// Troca câmera
function trocarCamera() {
  usandoFrontal = !usandoFrontal;
  constraints.video.facingMode = usandoFrontal ? "user" : "environment";
  cameraStart();
}

botaoTrocar.onclick = trocarCamera;

// Função tirar foto
cameraTrigger.onclick = function () {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
  const foto = cameraSensor.toDataURL("image/webp");

  cameraOutput.src = foto;
  cameraOutput.classList.add("taken");

  fotos.unshift(foto);
  if (fotos.length > 3) fotos = fotos.slice(0, 3);
  mostrarFotos();
  salvarFoto(foto);
};

// Mostra as 3 últimas fotos
function mostrarFotos() {
  galeria.innerHTML = "";
  fotos.forEach(f => {
    const img = document.createElement("img");
    img.src = f;
    img.classList.add("thumb");
    galeria.appendChild(img);
  });
}

// Inicia ao carregar
window.addEventListener("load", cameraStart, false);
