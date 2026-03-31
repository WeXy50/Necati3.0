import * as THREE from 'three';

export class Tesseract {
    constructor(scene) {
        this.scene = scene;
        
        this.vertices4D = [];
        this.edges = [];
        
        for (let x = -1; x <= 1; x += 2) {
            for (let y = -1; y <= 1; y += 2) {
                for (let z = -1; z <= 1; z += 2) {
                    for (let w = -1; w <= 1; w += 2) {
                        this.vertices4D.push([x, y, z, w]);
                    }
                }
            }
        }
        
        for (let i = 0; i < 16; i++) {
            for (let j = i + 1; j < 16; j++) {
                let diff = 0;
                for (let k = 0; k < 4; k++) {
                    if (this.vertices4D[i][k] !== this.vertices4D[j][k]) diff++;
                }
                if (diff === 1) this.edges.push([i, j]);
            }
        }
        
        this.material = new THREE.LineBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0,
            linewidth: 2 
        });
        
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.edges.length * 6);
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        
        this.mesh = new THREE.LineSegments(this.geometry, this.material);
        this.mesh.scale.set(3, 3, 3);
        this.scene.add(this.mesh);
        
        this.targetOpacity = 0;
        this.angleW = 0;
    }

    setState(stateIndex) {
        if (stateIndex === 3) { 
            this.targetOpacity = 0.9;
        } else {
            this.targetOpacity = 0.0;
        }
    }

    rotate4D(point, angleInW) {
        let [x, y, z, w] = point;
        
        let nx = x * Math.cos(angleInW) - w * Math.sin(angleInW);
        let nw = x * Math.sin(angleInW) + w * Math.cos(angleInW);
        x = nx;
        w = nw;
        
        let w_distance = 3;
        let p = 1 / (w_distance - w); 
        
        return [x * p, y * p, z * p];
    }

    update(time, mouse) {
        this.material.opacity += (this.targetOpacity - this.material.opacity) * 0.05;
        
        if (this.material.opacity < 0.01) return;
        
        this.angleW += 0.01 + (mouse.x * 0.02); 
        this.mesh.rotation.y = time * 0.5 + (mouse.x * 0.5);
        this.mesh.rotation.x = time * 0.3 + (-mouse.y * 0.5);
        
        const posArray = this.mesh.geometry.attributes.position.array;
        
        let idx = 0;
        for (let i = 0; i < this.edges.length; i++) {
            const v1_4d = this.vertices4D[this.edges[i][0]];
            const v2_4d = this.vertices4D[this.edges[i][1]];
            
            const v1_3d = this.rotate4D(v1_4d, this.angleW);
            const v2_3d = this.rotate4D(v2_4d, this.angleW);
            
            const s = 4;
            
            posArray[idx++] = v1_3d[0] * s;
            posArray[idx++] = v1_3d[1] * s;
            posArray[idx++] = v1_3d[2] * s;
            
            posArray[idx++] = v2_3d[0] * s;
            posArray[idx++] = v2_3d[1] * s;
            posArray[idx++] = v2_3d[2] * s;
        }
        
        this.mesh.geometry.attributes.position.needsUpdate = true;
    }
}
