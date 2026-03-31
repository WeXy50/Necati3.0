import * as THREE from 'three';
import { Particles } from './Particles.js';
import { Tesseract } from './Tesseract.js';

export class SceneManager {
    constructor(container) {
        this.container = container;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.02);
        
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
        this.camera.position.z = 20;
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
        
        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2(0, 0);
        this.targetMouse = new THREE.Vector2(0, 0);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        this.particles = new Particles(this.scene);
        this.tesseract = new Tesseract(this.scene);
        
        this.particles.setState(2); 
        this.tesseract.setState(0);
        
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        this.audioCtx = null;
        this.droneOsc = null;
        this.gainNode = null;
    }

    onMouseMove(event) {
        this.targetMouse.x = (event.clientX / this.width) * 2 - 1;
        this.targetMouse.y = -(event.clientY / this.height) * 2 + 1;
    }

    startAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioCtx.createGain();
            this.gainNode.connect(this.audioCtx.destination);
            this.gainNode.gain.value = 0;
            
            this.droneOsc = this.audioCtx.createOscillator();
            this.droneOsc.type = 'sine';
            this.droneOsc.frequency.setValueAtTime(65, this.audioCtx.currentTime);
            this.droneOsc.connect(this.gainNode);
            this.droneOsc.start();
            
            this.gainNode.gain.linearRampToValueAtTime(0.15, this.audioCtx.currentTime + 2);
        }
    }

    playGlitchSound() {
        if (!this.audioCtx) return;
        const glitchTime = this.audioCtx.currentTime;
        
        const osc = this.audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, glitchTime);
        osc.frequency.exponentialRampToValueAtTime(800, glitchTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(50, glitchTime + 0.3);
        
        const glitchGain = this.audioCtx.createGain();
        glitchGain.gain.setValueAtTime(0.1, glitchTime);
        glitchGain.gain.linearRampToValueAtTime(0, glitchTime + 0.4);
        
        osc.connect(glitchGain);
        glitchGain.connect(this.audioCtx.destination);
        osc.start(glitchTime);
        osc.stop(glitchTime + 0.4);
    }

    transitionToReality(realityId) {
        const time = this.audioCtx ? this.audioCtx.currentTime : 0;
        
        if (realityId === 'A') {
            this.particles.setState(2);
            this.tesseract.setState(0);
            
            if (this.droneOsc) {
                this.droneOsc.frequency.setTargetAtTime(65, time, 1);
            }
        } else if (realityId === 'B') {
            this.particles.setState(0);
            this.tesseract.setState(3);
            
            this.camera.position.z = 15;
            
            if (this.droneOsc) {
                this.droneOsc.frequency.setTargetAtTime(110, time, 1);
            }
        }
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(this.width, this.height);
    }

    update() {
        const time = this.clock.getElapsedTime();
        
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
        
        this.camera.position.x += (this.mouse.x * 2 - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.mouse.y * 2 - this.camera.position.y) * 0.05;
        this.camera.lookAt(this.scene.position);
        
        this.particles.update(time, this.mouse);
        this.tesseract.update(time, this.mouse);
        
        this.renderer.render(this.scene, this.camera);
    }
}
