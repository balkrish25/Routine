// script.js - single page app logic for the Routine game
// Uses dummy filenames. Replace files in assets/images and assets/sounds as needed.

/* ---------- CONFIG: tasks & filenames (change names to match your real assets) ---------- */
/* Tasks 1..15 in order, filenames are placeholders you will replace later. */
const TASKS = [
  { id: 1, label: '1. Get up', img: './Assets/images/img1_get_up.jpg' },
  { id: 2, label: '2. Brush the teeth', img: './Assets/images/img2_brush_teeth.jpg' },
  { id: 3, label: '3. Take bath', img: './Assets/images/img3_take_bath.jpg' },
  { id: 4, label: '4. Have breakfast', img: './Assets/images/img4_breakfast.jpg' },
  { id: 5, label: '5. Go to school', img: './Assets/images/img5_go_to_school.jpg' },
  { id: 6, label: '6. Be in class', img: './Assets/images/img6_be_in_class.jpg' },
  { id: 7, label: '7. Have lunch', img: './Assets/images/img7_have_lunch.jpg' },
  { id: 8, label: '8. Back to home', img: './Assets/images/img8_back_to_home.jpg' },
  { id: 9, label: '9. Wash hands', img: './Assets/images/img9_wash_hands.jpg' },
  { id: 10, label: '10. Play with friends', img: './Assets/images/img10_play_with_friends.jpg' },
  { id: 11, label: '11. Do your homework', img: './Assets/images/img11_do_homework.jpg' },
  { id: 12, label: '12. Have dinner', img: './Assets/images/img12_have_dinner.jpg' },
  { id: 13, label: '13. Read stories', img: './Assets/images/img13_read_stories.jpg' },
  { id: 14, label: '14. Go to bed', img: './Assets/images/img14_go_to_bed.jpg' }
];

/* ---------- DOM elements ---------- */
const screenStart = document.getElementById('screen-start');
const screenPart1 = document.getElementById('screen-part1');
const screenPart2 = document.getElementById('screen-part2');
const screenSuccess = document.getElementById('screen-success');

const btnStart = document.getElementById('btn-start');
const btnPlayAgain = document.getElementById('btn-playagain');
const home1 = document.getElementById('home1');
const home2 = document.getElementById('home2');

const targetsPart1 = document.getElementById('targets-part1');
const bottomBarPart1 = document.getElementById('bottom-bar-part1');

const targetsPart2 = document.getElementById('targets-part2');
const bottomBarPart2 = document.getElementById('bottom-bar-part2');

const audioCorrect = document.getElementById('audio-correct');
const audioWrong = document.getElementById('audio-wrong');
const audioCongrats = document.getElementById('audio-congrats');

/* ---------- helper utilities ---------- */
function showScreen(el) {
  [screenStart, screenPart1, screenPart2, screenSuccess].forEach(s => s.classList.remove('active'));
  el.classList.add('active');
}

function createSlot(task) {
  const slot = document.createElement('div');
  slot.className = 'slot';
  slot.dataset.accept = task.img; // accept this filename
  const p = document.createElement('p');
  p.textContent = task.label;
  slot.appendChild(p);

  // drop handlers
  slot.addEventListener('dragover', e => e.preventDefault());
  slot.addEventListener('drop', onDropHandler);

  return slot;
}

function createDraggable(task) {
  const d = document.createElement('div');
  d.className = 'draggable';
  d.draggable = true;
  d.id = 'drag-' + task.img;
  d.dataset.img = task.img;

  const img = document.createElement('img');
  img.src = task.img;
  img.alt = task.label;
  d.appendChild(img);

  d.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', d.id);
    // hide while dragging to emulate native drag UX
    setTimeout(() => { d.style.visibility = 'hidden'; }, 0);
  });
  d.addEventListener('dragend', e => {
    d.style.visibility = 'visible';
  });

  return d;
}

/* ---------- Drop logic (used for both parts) ---------- */
function onDropHandler(e) {
  e.preventDefault();
  const draggedId = e.dataTransfer.getData('text/plain');
  const dragged = document.getElementById(draggedId);
  if (!dragged) return; // safety

  const expected = this.dataset.accept;
  const provided = dragged.dataset.img;

  if (provided === expected) {
    // correct
    playAudio(audioCorrect);
    // lock the piece into the slot
    dragged.draggable = false;
    dragged.style.cursor = 'default';
    dragged.style.position = 'relative';
    dragged.style.margin = '0';
    this.appendChild(dragged);
    this.classList.add('filled');
    checkPageCompletion();
  } else {
    // wrong
    playAudio(audioWrong);
    // return to the original bottom bar - determine which bar contains this draggable by inspecting its id
    setTimeout(() => {
      // if the draggable belongs to part1 or part2 based on its img index
      // find whether its image name is among part1 or part2 tasks:
      const imgName = dragged.dataset.img;
      const belongsToPart1 = TASKS.slice(0,8).some(t => t.img === imgName);
      const targetBar = belongsToPart1 ? bottomBarPart1 : bottomBarPart2;
      targetBar.appendChild(dragged);
      dragged.style.visibility = 'visible';
    }, 150);
  }
}

/* ---------- Check if current visible page is complete ---------- */
function checkPageCompletion() {
  if (screenPart1.classList.contains('active')) {
    const slots = targetsPart1.querySelectorAll('.slot');
    let allFilled = true;
    slots.forEach(s => {
      const child = s.querySelector('.draggable');
      if (!child || child.draggable) allFilled = false;
    });
    if (allFilled) {
      // move to part2 after a short delay
      setTimeout(() => { initPart2(); showScreen(screenPart2); }, 700);
    }
  } else if (screenPart2.classList.contains('active')) {
    const slots = targetsPart2.querySelectorAll('.slot');
    let allFilled = true;
    slots.forEach(s => {
      const child = s.querySelector('.draggable');
      if (!child || child.draggable) allFilled = false;
    });
    if (allFilled) {
      // finished all tasks: play congrats then show success
      playAudio(audioCongrats);
      setTimeout(() => { showScreen(screenSuccess); }, 900);
    }
  }
}

/* ---------- Play audio helper (reset to start) ---------- */
function playAudio(audioEl) {
  try {
    audioEl.currentTime = 0;
    audioEl.play();
  } catch (err) {
    // some browsers block autoplay; still safe to call
    console.warn('Audio play failed:', err);
  }
}

/* ---------- Initialize Part 1 (tasks 1..8) ---------- */
function initPart1() {
  // clear containers
  targetsPart1.innerHTML = '';
  bottomBarPart1.innerHTML = '';

  const part1Tasks = TASKS.slice(0, 8); // tasks 1-8

  // create 8 target slots (4x2 grid accounted by CSS)
  part1Tasks.forEach(t => {
    const slot = createSlot(t);
    targetsPart1.appendChild(slot);
  });

  // create draggable images for part1
  part1Tasks.forEach(t => {
    const d = createDraggable(t);
    bottomBarPart1.appendChild(d);
  });
}

/* ---------- Initialize Part 2 (tasks 9..15) ---------- */
function initPart2() {
  targetsPart2.innerHTML = '';
  bottomBarPart2.innerHTML = '';

  const part2Tasks = TASKS.slice(8, 15); // tasks 9-15 (7 tasks)

  // create 7 target slots (grid will auto-flow)
  part2Tasks.forEach(t => {
    const slot = createSlot(t);
    targetsPart2.appendChild(slot);
  });

  // create draggables for part2
  part2Tasks.forEach(t => {
    const d = createDraggable(t);
    bottomBarPart2.appendChild(d);
  });
}

/* ---------- Reset game to start state ---------- */
function resetGame() {
  // reload everything fresh (simple and reliable)
  // Optionally, you can clear slots and recreate; page reload ensures all audio/DOM state reset.
  window.location.reload();
}

/* ---------- Event listeners ---------- */
btnStart.addEventListener('click', () => {
  initPart1();
  showScreen(screenPart1);
});

// home buttons send back to start and reset
home1.addEventListener('click', () => { resetGame(); });
home2.addEventListener('click', () => { resetGame(); });

btnPlayAgain.addEventListener('click', () => { resetGame(); });

/* ---------- Start on the Start screen ---------- */
showScreen(screenStart);
