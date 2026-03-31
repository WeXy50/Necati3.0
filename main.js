import { SceneManager } from './Scene.js';

let sceneManager;
let currentReality = 'A'; // 'A' for Chaos, 'B' for 4th Dimension

function init() {
  // Initialize WebGL Scene
  sceneManager = new SceneManager(document.getElementById('canvas-container'));
  
  // Start the background WebGL clock and audio
  document.addEventListener('click', () => {
    sceneManager.startAudio();
  }, { once: true });

  // DOM Elements
  const changeBtn = document.getElementById('change-reality-btn');
  const realityA = document.getElementById('reality-a');
  const realityB = document.getElementById('reality-b');
  const clockElement = document.getElementById('hud-clock');
  
  // Window Expansion Logic
  const windows = document.querySelectorAll('.hud-window');
  
  windows.forEach(win => {
    const controls = win.querySelector('.window-controls');
    if (!controls) return;
    
    win.addEventListener('click', (e) => {
        if (e.target.closest('.window-close') || win.classList.contains('expanded')) {
            if (e.target.classList.contains('window-close')) {
                win.classList.remove('expanded');
                windows.forEach(w => { if(w !== win) w.style.pointerEvents = 'auto'; });
            }
        } else {
            win.classList.add('expanded');
            windows.forEach(w => { if(w !== win) w.style.pointerEvents = 'none'; });
        }
    });
  });

  // HUD Clock logic
  setInterval(() => {
    const d = new Date();
    clockElement.innerText = `SİS.ZAMAN: ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')} Z`;
  }, 1000);

  // Reality Toggle Logic
  changeBtn.addEventListener('click', () => {
    document.body.classList.add('glitching');
    sceneManager.playGlitchSound();

    // Reset expanded windows
    windows.forEach(win => {
        win.classList.remove('expanded');
        win.style.pointerEvents = 'auto';
    });

    setTimeout(() => {
      if (currentReality === 'A') {
        currentReality = 'B';
        document.body.classList.add('dark-reality');
        
        realityA.classList.remove('active');
        realityA.classList.add('hidden');
        
        realityB.classList.remove('hidden');
        realityB.classList.add('active');
        
        sceneManager.transitionToReality('B');
      } else {
        currentReality = 'A';
        document.body.classList.remove('dark-reality');
        
        realityB.classList.remove('active');
        realityB.classList.add('hidden');
        
        realityA.classList.remove('hidden');
        realityA.classList.add('active');
        
        sceneManager.transitionToReality('A');
      }
    }, 200);

    setTimeout(() => {
      document.body.classList.remove('glitching');
    }, 400);
  });

  window.addEventListener('resize', () => {
    sceneManager.resize();
  });
}

function animate() {
  if (sceneManager) {
    sceneManager.update();
  }
  requestAnimationFrame(animate);
}

// Ensure the page starts at the top
window.scrollTo(0, 0);

// Start everything
init();
animate();
