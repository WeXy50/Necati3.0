import * as THREE from 'three';

export class Particles {
  constructor(scene) {
    this.scene = scene;
    this.count = 20000; 
    
    this.sigma = 10;
    this.rho = 28;
    this.beta = 8 / 3;
    this.dt = 0.003; 
    
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.count * 3);
    this.colors = new Float32Array(this.count * 3);
    this.originalPositions = new Float32Array(this.count * 3);
    
    for (let i = 0; i < this.count; i++) {
        const x = (Math.random() - 0.5) * 40;
        const y = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        
        this.positions[i * 3] = x;
        this.positions[i * 3 + 1] = y;
        this.positions[i * 3 + 2] = z;
        this.originalPositions[i * 3] = x;
        this.originalPositions[i * 3 + 1] = y;
        this.originalPositions[i * 3 + 2] = z;
        
        this.colors[i * 3] = 0.0;     
        this.colors[i * 3 + 1] = 1.0; 
        this.colors[i * 3 + 2] = 1.0; 
    }
    
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    
    this.material = new THREE.PointsMaterial({
        size: 0.15,
        transparent: true,
        opacity: 0, 
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);
    
    this.targetOpacity = 0;
    this.chaosLevel = 0;
    this.groupScale = new THREE.Vector3(1, 1, 1);
  }

  show() {
    this.targetOpacity = 0.8;
    this.chaosLevel = 1.3;
  }

  hide() {
    this.targetOpacity = 0.0;
    this.chaosLevel = 0.1;
  }
  
  setState(stateIndex) {
      if (stateIndex === 2) { 
          this.show();
          this.targetOpacity = 0.9;
          this.chaosLevel = 1.2;
          this.groupScale.set(1.2, 1.2, 1.2);
      } else { 
          this.hide();
      }
  }

  update(time, mouse) {
    this.material.opacity += (this.targetOpacity - this.material.opacity) * 0.05;
    this.mesh.scale.lerp(this.groupScale, 0.05);
    
    if (this.material.opacity < 0.01) return;
    
    const positions = this.mesh.geometry.attributes.position.array;
    const colors = this.mesh.geometry.attributes.color.array;
    
    for (let i = 0; i < this.count; i++) {
        let x = positions[i * 3];
        let y = positions[i * 3 + 1];
        let z = positions[i * 3 + 2];
        
        const dx = (this.sigma * (y - x)) * this.dt * this.chaosLevel;
        const dy = (x * (this.rho - z) - y) * this.dt * this.chaosLevel;
        const dz = (x * y - this.beta * z) * this.dt * this.chaosLevel;
        
        const dist = Math.sqrt(Math.pow(x - (mouse.x * 30), 2) + Math.pow(y - (-mouse.y * 30), 2));
        const warpX = (dist < 15) ? (mouse.x * 2) : 0;
        const warpY = (dist < 15) ? (-mouse.y * 2) : 0;
        
        positions[i * 3]     = x + dx + warpX;
        positions[i * 3 + 1] = y + dy + warpY;
        positions[i * 3 + 2] = z + dz;
        
        const speed = Math.sqrt(dx*dx + dy*dy + dz*dz) * 15;
        colors[i * 3] = 0.8 / Math.max(1, speed);
        colors[i * 3 + 1] = Math.min(1.0, speed * 0.5); 
        colors[i * 3 + 2] = 1.0; 
        
        if (x > 150 || x < -150 || y > 150 || y < -150 || z > 150 || z < -150 || isNaN(x)) {
            positions[i * 3]     = this.originalPositions[i*3];
            positions[i * 3 + 1] = this.originalPositions[i*3+1];
            positions[i * 3 + 2] = this.originalPositions[i*3+2];
        }
    }
    
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.geometry.attributes.color.needsUpdate = true;
    
    this.mesh.rotation.y = time * 0.15;
    this.mesh.rotation.x = Math.sin(time * 0.1) * 0.2;
  }
}
