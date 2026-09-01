/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface WheelMeshRef {
  group: THREE.Group;
  mesh: THREE.Mesh;
  isLeft: boolean;
  positionOffset: THREE.Vector3;
}

export class RoverModel {
  public group: THREE.Group;
  public chassisGroup: THREE.Group;
  public wheels: WheelMeshRef[] = [];
  public roboticArmGroup: THREE.Group;
  public drillBitMesh: THREE.Mesh;
  public antennaDish: THREE.Group;
  public mastGroup: THREE.Group;
  public headlightLeft: THREE.SpotLight;
  public headlightRight: THREE.SpotLight;
  public headlightGlowLeft: THREE.Mesh;
  public headlightGlowRight: THREE.Mesh;
  public thrusterPlumes: THREE.Mesh[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.chassisGroup = new THREE.Group();
    this.group.add(this.chassisGroup);

    // Materials
    const goldFoilMat = new THREE.MeshStandardMaterial({
      color: 0xdfa010,
      metalness: 0.9,
      roughness: 0.25,
      bumpScale: 0.05,
    });

    const whiteChassisMat = new THREE.MeshStandardMaterial({
      color: 0xeaebee,
      metalness: 0.2,
      roughness: 0.4,
    });

    const darkCarbonMat = new THREE.MeshStandardMaterial({
      color: 0x222428,
      metalness: 0.7,
      roughness: 0.6,
    });

    const solarPanelMat = new THREE.MeshStandardMaterial({
      color: 0x142850,
      metalness: 0.85,
      roughness: 0.15,
    });

    const wheelTreadMat = new THREE.MeshStandardMaterial({
      color: 0x6e727a,
      metalness: 0.85,
      roughness: 0.35,
      wireframe: false,
    });

    const glassLensMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.05,
      emissive: 0xffffff,
      emissiveIntensity: 0.8,
    });

    // 1. Main Avionics / Science Hull
    const mainBodyGeo = new THREE.BoxGeometry(1.6, 0.7, 2.4);
    const mainBody = new THREE.Mesh(mainBodyGeo, whiteChassisMat);
    mainBody.position.set(0, 0.65, 0);
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    this.chassisGroup.add(mainBody);

    // Lower Gold MLI Thermal Insulation Belly
    const bellyGeo = new THREE.BoxGeometry(1.5, 0.35, 2.2);
    const belly = new THREE.Mesh(bellyGeo, goldFoilMat);
    belly.position.set(0, 0.25, 0);
    belly.castShadow = true;
    this.chassisGroup.add(belly);

    // 2. Solar Array Deck (Top)
    const solarBaseGeo = new THREE.BoxGeometry(1.7, 0.05, 2.2);
    const solarBase = new THREE.Mesh(solarBaseGeo, darkCarbonMat);
    solarBase.position.set(0, 1.03, -0.1);
    this.chassisGroup.add(solarBase);

    const solarCellsGeo = new THREE.BoxGeometry(1.55, 0.06, 2.0);
    const solarCells = new THREE.Mesh(solarCellsGeo, solarPanelMat);
    solarCells.position.set(0, 1.04, -0.1);
    this.chassisGroup.add(solarCells);

    // Grid lines on solar panel
    const gridHelper = new THREE.GridHelper(1.8, 8, 0x3b82f6, 0x2563eb);
    gridHelper.position.set(0, 1.08, -0.1);
    this.chassisGroup.add(gridHelper);

    // 3. Mast & Stereoscopic Science Cameras
    this.mastGroup = new THREE.Group();
    this.mastGroup.position.set(0.45, 1.05, 0.8);

    const mastPoleGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.0, 12);
    const mastPole = new THREE.Mesh(mastPoleGeo, darkCarbonMat);
    mastPole.position.y = 0.5;
    mastPole.castShadow = true;
    this.mastGroup.add(mastPole);

    const cameraHeadGeo = new THREE.BoxGeometry(0.35, 0.16, 0.2);
    const cameraHead = new THREE.Mesh(cameraHeadGeo, whiteChassisMat);
    cameraHead.position.set(0, 1.0, 0);
    this.mastGroup.add(cameraHead);

    // Dual stereo lenses
    const lensGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.08, 16);
    lensGeo.rotateX(Math.PI / 2);
    const lensL = new THREE.Mesh(lensGeo, darkCarbonMat);
    lensL.position.set(-0.1, 1.0, 0.11);
    const lensR = new THREE.Mesh(lensGeo, darkCarbonMat);
    lensR.position.set(0.1, 1.0, 0.11);
    this.mastGroup.add(lensL);
    this.mastGroup.add(lensR);

    this.chassisGroup.add(this.mastGroup);

    // 4. High-Gain Earth Comm Dish Antenna
    this.antennaDish = new THREE.Group();
    this.antennaDish.position.set(-0.5, 1.1, -0.7);

    const dishPoleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8);
    const dishPole = new THREE.Mesh(dishPoleGeo, darkCarbonMat);
    dishPole.position.y = 0.2;
    this.antennaDish.add(dishPole);

    const dishGeo = new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xdfa010,
      metalness: 0.9,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 0.45, 0);
    dish.rotation.x = -Math.PI * 0.35;
    dish.rotation.y = Math.PI * 0.2;
    this.antennaDish.add(dish);

    this.chassisGroup.add(this.antennaDish);

    // 5. Robotic Arm & Diamond Drill
    this.roboticArmGroup = new THREE.Group();
    this.roboticArmGroup.position.set(0, 0.55, 1.25);

    const armBaseGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.15, 12);
    const armBase = new THREE.Mesh(armBaseGeo, darkCarbonMat);
    this.roboticArmGroup.add(armBase);

    const armSegment1Geo = new THREE.BoxGeometry(0.1, 0.6, 0.1);
    const armSeg1 = new THREE.Mesh(armSegment1Geo, whiteChassisMat);
    armSeg1.position.set(0, 0.3, 0.15);
    armSeg1.rotation.x = 0.5;
    this.roboticArmGroup.add(armSeg1);

    const armSegment2Geo = new THREE.BoxGeometry(0.08, 0.55, 0.08);
    const armSeg2 = new THREE.Mesh(armSegment2Geo, darkCarbonMat);
    armSeg2.position.set(0, 0.55, 0.45);
    armSeg2.rotation.x = -0.7;
    this.roboticArmGroup.add(armSeg2);

    // Drill Bit Turret
    const drillTurretGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.2, 12);
    const drillTurret = new THREE.Mesh(drillTurretGeo, goldFoilMat);
    drillTurret.position.set(0, 0.3, 0.7);
    this.roboticArmGroup.add(drillTurret);

    const drillBitGeo = new THREE.ConeGeometry(0.06, 0.28, 8);
    drillBitGeo.rotateX(Math.PI);
    this.drillBitMesh = new THREE.Mesh(drillBitGeo, darkCarbonMat);
    this.drillBitMesh.position.set(0, 0.15, 0.7);
    this.roboticArmGroup.add(this.drillBitMesh);

    this.chassisGroup.add(this.roboticArmGroup);

    // 6. Dual LED Headlights (High-Lumen Projectors)
    const lightHousingGeo = new THREE.BoxGeometry(0.2, 0.12, 0.12);
    const lightHousingL = new THREE.Mesh(lightHousingGeo, darkCarbonMat);
    lightHousingL.position.set(-0.6, 0.7, 1.22);
    const lightHousingR = new THREE.Mesh(lightHousingGeo, darkCarbonMat);
    lightHousingR.position.set(0.6, 0.7, 1.22);
    this.chassisGroup.add(lightHousingL);
    this.chassisGroup.add(lightHousingR);

    // Glow lenses
    const glowGeo = new THREE.CircleGeometry(0.06, 16);
    this.headlightGlowLeft = new THREE.Mesh(glowGeo, glassLensMat);
    this.headlightGlowLeft.position.set(-0.6, 0.7, 1.29);
    this.headlightGlowRight = new THREE.Mesh(glowGeo, glassLensMat);
    this.headlightGlowRight.position.set(0.6, 0.7, 1.29);
    this.chassisGroup.add(this.headlightGlowLeft);
    this.chassisGroup.add(this.headlightGlowRight);

    // Three.js Spotlights with harsh shadows
    this.headlightLeft = new THREE.SpotLight(0xf4f8ff, 8.0, 50, Math.PI / 5, 0.4, 1.2);
    this.headlightLeft.position.set(-0.6, 0.7, 1.3);
    this.headlightLeft.castShadow = true;
    this.headlightLeft.shadow.bias = -0.001;
    this.headlightLeft.shadow.mapSize.width = 1024;
    this.headlightLeft.shadow.mapSize.height = 1024;

    const targetL = new THREE.Object3D();
    targetL.position.set(-0.6, 0.0, 18.0);
    this.group.add(targetL);
    this.headlightLeft.target = targetL;
    this.chassisGroup.add(this.headlightLeft);

    this.headlightRight = new THREE.SpotLight(0xf4f8ff, 8.0, 50, Math.PI / 5, 0.4, 1.2);
    this.headlightRight.position.set(0.6, 0.7, 1.3);
    this.headlightRight.castShadow = true;
    this.headlightRight.shadow.bias = -0.001;
    this.headlightRight.shadow.mapSize.width = 1024;
    this.headlightRight.shadow.mapSize.height = 1024;

    const targetR = new THREE.Object3D();
    targetR.position.set(0.6, 0.0, 18.0);
    this.group.add(targetR);
    this.headlightRight.target = targetR;
    this.chassisGroup.add(this.headlightRight);

    // 7. RCS Cold-Gas Thruster Nozzles (Belly & Corners)
    const nozzlePositions = [
      new THREE.Vector3(-0.7, 0.25, 1.0),
      new THREE.Vector3(0.7, 0.25, 1.0),
      new THREE.Vector3(-0.7, 0.25, -1.0),
      new THREE.Vector3(0.7, 0.25, -1.0),
    ];

    const nozzleGeo = new THREE.CylinderGeometry(0.04, 0.07, 0.12, 10);
    const plumeMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.0,
    });
    const plumeGeo = new THREE.ConeGeometry(0.12, 0.45, 12);
    plumeGeo.rotateX(Math.PI);

    nozzlePositions.forEach((pos) => {
      const nozzle = new THREE.Mesh(nozzleGeo, darkCarbonMat);
      nozzle.position.copy(pos);
      this.chassisGroup.add(nozzle);

      const plume = new THREE.Mesh(plumeGeo, plumeMat);
      plume.position.set(pos.x, pos.y - 0.25, pos.z);
      this.chassisGroup.add(plume);
      this.thrusterPlumes.push(plume);
    });

    // 8. 6 Heavy-Duty Lunar Mesh Wheels & Rocker-Bogie Suspension
    const wheelPositions = [
      { x: -1.05, y: 0.35, z: 0.95, isLeft: true },  // Front Left
      { x: 1.05, y: 0.35, z: 0.95, isLeft: false },  // Front Right
      { x: -1.15, y: 0.35, z: 0.0, isLeft: true },   // Mid Left
      { x: 1.15, y: 0.35, z: 0.0, isLeft: false },   // Mid Right
      { x: -1.05, y: 0.35, z: -0.95, isLeft: true }, // Rear Left
      { x: 1.05, y: 0.35, z: -0.95, isLeft: false }, // Rear Right
    ];

    wheelPositions.forEach((wp) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(wp.x, wp.y, wp.z);

      // Suspension Arm connector
      const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8);
      strutGeo.rotateZ(wp.isLeft ? -0.5 : 0.5);
      const strut = new THREE.Mesh(strutGeo, darkCarbonMat);
      strut.position.set(wp.isLeft ? 0.15 : -0.15, 0.1, 0);
      this.chassisGroup.add(strut);

      // Wheel Mesh: Wire mesh cylinder + titanium chevron grousers
      const wheelRadius = 0.36;
      const wheelWidth = 0.32;
      const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
      wheelGeo.rotateZ(Math.PI / 2);

      const wheelMesh = new THREE.Mesh(wheelGeo, wheelTreadMat);
      wheelMesh.castShadow = true;
      wheelMesh.receiveShadow = true;

      // Hubcap & Motor Hub
      const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, wheelWidth + 0.04, 12);
      hubGeo.rotateZ(Math.PI / 2);
      const hubMesh = new THREE.Mesh(hubGeo, goldFoilMat);
      wheelMesh.add(hubMesh);

      wheelGroup.add(wheelMesh);
      this.group.add(wheelGroup);

      this.wheels.push({
        group: wheelGroup,
        mesh: wheelMesh,
        isLeft: wp.isLeft,
        positionOffset: new THREE.Vector3(wp.x, wp.y, wp.z),
      });
    });
  }

  public setHeadlights(enabled: boolean) {
    this.headlightLeft.visible = enabled;
    this.headlightRight.visible = enabled;
    (this.headlightGlowLeft.material as THREE.MeshStandardMaterial).emissiveIntensity = enabled ? 1.0 : 0.0;
    (this.headlightGlowRight.material as THREE.MeshStandardMaterial).emissiveIntensity = enabled ? 1.0 : 0.0;
  }

  public setThrusterActive(active: boolean) {
    this.thrusterPlumes.forEach((plume) => {
      (plume.material as THREE.MeshBasicMaterial).opacity = active ? 0.85 : 0.0;
    });
  }

  public animateDrill(isDrilling: boolean, delta: number) {
    if (isDrilling) {
      this.drillBitMesh.rotation.y += delta * 35.0;
      this.roboticArmGroup.position.y = 0.45 + Math.sin(Date.now() * 0.02) * 0.05;
    } else {
      this.roboticArmGroup.position.y = 0.55;
    }
  }

  public updateWheelAnimation(speed: number, steerAngle: number, delta: number) {
    const rotationIncrement = (speed / 0.36) * delta;

    this.wheels.forEach((w, index) => {
      // Wheel rotation
      w.mesh.rotation.x += rotationIncrement;

      // Front wheels steering (index 0 and 1)
      if (index === 0 || index === 1) {
        w.group.rotation.y = steerAngle;
      }
      // Rear wheels counter-steering slightly for tight turns (index 4 and 5)
      else if (index === 4 || index === 5) {
        w.group.rotation.y = -steerAngle * 0.5;
      }
    });
  }
}
