const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

const imageInput = document.getElementById('imageInput');
const characterPrompt = document.getElementById('characterPrompt');
const extraPrompt = document.getElementById('extraPrompt');
const finalPrompt = document.getElementById('finalPrompt');
const resetPoseBtn = document.getElementById('resetPoseBtn');
const exportBtn = document.getElementById('exportBtn');

const defaultJoints = () => ({
  head: { x: 450, y: 150 },
  neck: { x: 450, y: 210 },
  leftShoulder: { x: 390, y: 235 },
  rightShoulder: { x: 510, y: 235 },
  leftElbow: { x: 350, y: 310 },
  rightElbow: { x: 550, y: 310 },
  leftHand: { x: 330, y: 385 },
  rightHand: { x: 570, y: 385 },
  torso: { x: 450, y: 300 },
  hip: { x: 450, y: 390 },
  leftHip: { x: 410, y: 390 },
  rightHip: { x: 490, y: 390 },
  leftKnee: { x: 405, y: 490 },
  rightKnee: { x: 495, y: 490 },
  leftFoot: { x: 400, y: 570 },
  rightFoot: { x: 500, y: 570 },
});

let joints = defaultJoints();
let draggingJoint = null;
let bgImage = null;

const bones = [
  ['head', 'neck'],
  ['neck', 'leftShoulder'],
  ['neck', 'rightShoulder'],
  ['leftShoulder', 'leftElbow'],
  ['leftElbow', 'leftHand'],
  ['rightShoulder', 'rightElbow'],
  ['rightElbow', 'rightHand'],
  ['neck', 'torso'],
  ['torso', 'hip'],
  ['hip', 'leftHip'],
  ['hip', 'rightHip'],
  ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftFoot'],
  ['rightHip', 'rightKnee'],
  ['rightKnee', 'rightFoot'],
];

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (bgImage) {
    const ratio = Math.min(canvas.width / bgImage.width, canvas.height / bgImage.height);
    const w = bgImage.width * ratio;
    const h = bgImage.height * ratio;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;
    ctx.globalAlpha = 0.85;
    ctx.drawImage(bgImage, x, y, w, h);
    ctx.globalAlpha = 1;
  }

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ff5555';
  bones.forEach(([a, b]) => {
    const p1 = joints[a];
    const p2 = joints[b];
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  });

  Object.entries(joints).forEach(([name, p]) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = draggingJoint === name ? '#5aa7ff' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#1e2a42';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getPointer(evt) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY,
  };
}

canvas.addEventListener('pointerdown', (evt) => {
  const p = getPointer(evt);
  const found = Object.entries(joints).find(([, joint]) => distance(joint, p) < 16);
  if (!found) return;
  draggingJoint = found[0];
  canvas.setPointerCapture(evt.pointerId);
  draw();
});

canvas.addEventListener('pointermove', (evt) => {
  if (!draggingJoint) return;
  const p = getPointer(evt);
  joints[draggingJoint] = { x: p.x, y: p.y };
  draw();
  updateFinalPrompt();
});

canvas.addEventListener('pointerup', () => {
  draggingJoint = null;
  draw();
});

canvas.addEventListener('pointercancel', () => {
  draggingJoint = null;
  draw();
});

imageInput.addEventListener('change', (evt) => {
  const file = evt.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      bgImage = img;
      draw();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

resetPoseBtn.addEventListener('click', () => {
  joints = defaultJoints();
  draw();
  updateFinalPrompt();
});

[characterPrompt, extraPrompt].forEach((el) => {
  el.addEventListener('input', updateFinalPrompt);
});

function serializePose() {
  return Object.entries(joints)
    .map(([name, p]) => `${name}(${Math.round(p.x)},${Math.round(p.y)})`)
    .join(', ');
}

function updateFinalPrompt() {
  const poseData = serializePose();
  const characterText = characterPrompt.value.trim() || 'персонаж не описан';
  const extraText = extraPrompt.value.trim();

  finalPrompt.value = [
    'Сгенерируй персонажа в целевой позе по данным ниже.',
    `Описание персонажа: ${characterText}.`,
    `Поза (координаты скелета): ${poseData}.`,
    extraText ? `Дополнительно: ${extraText}.` : '',
    'Сохрани идентичность лица, одежды и палитры относительно референса.',
  ]
    .filter(Boolean)
    .join('\n');
}

exportBtn.addEventListener('click', () => {
  const payload = {
    createdAt: new Date().toISOString(),
    characterPrompt: characterPrompt.value.trim(),
    extraPrompt: extraPrompt.value.trim(),
    pose: joints,
    finalPrompt: finalPrompt.value,
    referenceImage: bgImage ? 'embedded in exported PNG' : null,
  };

  const jsonBlob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  const jsonA = document.createElement('a');
  jsonA.href = jsonUrl;
  jsonA.download = 'pose-payload.json';
  jsonA.click();
  URL.revokeObjectURL(jsonUrl);

  const pngUrl = canvas.toDataURL('image/png');
  const pngA = document.createElement('a');
  pngA.href = pngUrl;
  pngA.download = 'pose-overlay.png';
  pngA.click();
});

draw();
updateFinalPrompt();
