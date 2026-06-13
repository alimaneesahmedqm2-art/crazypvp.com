// ═══════════════════════════════════════════════════════════════
//  CARS.JS — 3D car mesh builder using Three.js
// ═══════════════════════════════════════════════════════════════

function buildCarMesh(carDef, scene) {
  const group = new THREE.Group();
  const color = carDef.color;
  const bc = new THREE.Color(carDef.bodyColor);
  const ac = new THREE.Color(carDef.accentColor);

  const w = carDef.widthR || 1.0;
  const h = carDef.heightR || 0.42;
  const l = carDef.lengthR || 2.0;

  // Materials
  const bodyMat = new THREE.MeshPhongMaterial({
    color: bc, shininess: 120, specular: new THREE.Color(0x888888),
  });
  const glassMat = new THREE.MeshPhongMaterial({
    color: 0x88bbcc, transparent: true, opacity: 0.6, shininess: 200,
  });
  const wheelMat = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 40 });
  const rimMat   = new THREE.MeshPhongMaterial({ color: 0xcccccc, shininess: 160 });
  const accentMat = new THREE.MeshPhongMaterial({ color: ac, shininess: 80 });
  const lightMat  = new THREE.MeshPhongMaterial({ color: 0xffff88, emissive: 0xffff44, emissiveIntensity:0.8 });
  const brakeLight = new THREE.MeshPhongMaterial({ color: 0xff2200, emissive: 0xff0000, emissiveIntensity:0.6 });
  const underMat  = new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 10 });

  // ── BODY ──
  // Main lower body
  const lowerGeo = new THREE.BoxGeometry(w * 1.8, h * 0.55, l * 2.0);
  const lower = new THREE.Mesh(lowerGeo, bodyMat);
  lower.position.y = h * 0.28;
  lower.castShadow = true;
  lower.receiveShadow = true;
  group.add(lower);

  // Upper cabin (tapered using manual geometry for realism)
  const cabinGeo = new THREE.BoxGeometry(w * 1.6, h * 0.55, l * 1.1);
  const cabin = new THREE.Mesh(cabinGeo, bodyMat);
  cabin.position.set(0, h * 0.78, l * 0.05);
  cabin.castShadow = true;
  group.add(cabin);

  // Hood (slightly raised front)
  const hoodGeo = new THREE.BoxGeometry(w * 1.8, h * 0.12, l * 0.7);
  const hood = new THREE.Mesh(hoodGeo, bodyMat);
  hood.position.set(0, h * 0.56, -l * 0.65);
  hood.rotation.x = -0.08;
  group.add(hood);

  // Trunk
  const trunkGeo = new THREE.BoxGeometry(w * 1.8, h * 0.15, l * 0.5);
  const trunk = new THREE.Mesh(trunkGeo, bodyMat);
  trunk.position.set(0, h * 0.58, l * 0.72);
  group.add(trunk);

  // Front bumper
  const bumperFGeo = new THREE.BoxGeometry(w * 1.85, h * 0.28, l * 0.12);
  const bumperF = new THREE.Mesh(bumperFGeo, underMat);
  bumperF.position.set(0, h * 0.15, -l * 1.04);
  group.add(bumperF);

  // Rear bumper
  const bumperRGeo = new THREE.BoxGeometry(w * 1.85, h * 0.28, l * 0.12);
  const bumperR = new THREE.Mesh(bumperRGeo, underMat);
  bumperR.position.set(0, h * 0.15, l * 1.04);
  group.add(bumperR);

  // Side skirts
  [-1, 1].forEach(side => {
    const skirtGeo = new THREE.BoxGeometry(w * 0.08, h * 0.22, l * 1.6);
    const skirt = new THREE.Mesh(skirtGeo, accentMat);
    skirt.position.set(side * w * 0.96, h * 0.11, 0);
    group.add(skirt);
  });

  // Roof
  const roofGeo = new THREE.BoxGeometry(w * 1.55, h * 0.1, l * 1.0);
  const roof = new THREE.Mesh(roofGeo, bodyMat);
  roof.position.set(0, h * 1.07, l * 0.05);
  group.add(roof);

  // Windshield (front glass)
  const wsFGeo = new THREE.BoxGeometry(w * 1.5, h * 0.5, l * 0.08);
  const wsF = new THREE.Mesh(wsFGeo, glassMat);
  wsF.position.set(0, h * 0.88, -l * 0.55);
  wsF.rotation.x = 0.5;
  group.add(wsF);

  // Rear glass
  const wsRGeo = new THREE.BoxGeometry(w * 1.45, h * 0.44, l * 0.08);
  const wsR = new THREE.Mesh(wsRGeo, glassMat);
  wsR.position.set(0, h * 0.85, l * 0.6);
  wsR.rotation.x = -0.4;
  group.add(wsR);

  // Side windows
  [-1, 1].forEach(side => {
    const swGeo = new THREE.BoxGeometry(w * 0.06, h * 0.36, l * 0.7);
    const sw = new THREE.Mesh(swGeo, glassMat);
    sw.position.set(side * w * 0.82, h * 0.9, l * 0.02);
    group.add(sw);
  });

  // ── HEADLIGHTS ──
  const hlGeo = new THREE.BoxGeometry(w * 0.38, h * 0.14, l * 0.06);
  [-0.45, 0.45].forEach(xOff => {
    const hl = new THREE.Mesh(hlGeo, lightMat);
    hl.position.set(xOff * w, h * 0.38, -l * 1.02);
    group.add(hl);
    // headlight glow
    const ptLight = new THREE.PointLight(0xffffaa, 0.5, 8);
    ptLight.position.set(xOff * w, h * 0.38, -l * 1.15);
    group.add(ptLight);
  });

  // ── TAIL LIGHTS ──
  const tlGeo = new THREE.BoxGeometry(w * 0.36, h * 0.12, l * 0.05);
  [-0.46, 0.46].forEach(xOff => {
    const tl = new THREE.Mesh(tlGeo, brakeLight);
    tl.position.set(xOff * w, h * 0.4, l * 1.02);
    group.add(tl);
  });

  // Exhaust pipes
  [-0.28, 0.28].forEach(xOff => {
    const exGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.22, 8);
    const ex = new THREE.Mesh(exGeo, new THREE.MeshPhongMaterial({color:0x666666, shininess:100}));
    ex.rotation.x = Math.PI / 2;
    ex.position.set(xOff, h * 0.08, l * 1.04);
    group.add(ex);
  });

  // Front grille
  const grilleGeo = new THREE.BoxGeometry(w * 1.1, h * 0.22, l * 0.04);
  const grille = new THREE.Mesh(grilleGeo, new THREE.MeshPhongMaterial({color:0x111111, shininess:20}));
  grille.position.set(0, h * 0.22, -l * 1.02);
  group.add(grille);

  // ── WHEELS ──
  const wheelPositions = [
    [-w * 0.92, 0,  -l * 0.62], [w * 0.92, 0,  -l * 0.62],  // front
    [-w * 0.92, 0,   l * 0.65], [w * 0.92, 0,   l * 0.65],  // rear
  ];

  const wheels = [];
  wheelPositions.forEach((pos, idx) => {
    const wg = new THREE.Group();
    // tire
    const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.26, 24);
    const tire = new THREE.Mesh(tireGeo, wheelMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wg.add(tire);

    // rim
    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.28, 16);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    wg.add(rim);

    // spokes
    for(let s = 0; s < 5; s++) {
      const spokeGeo = new THREE.BoxGeometry(0.04, 0.04, 0.38);
      const spoke = new THREE.Mesh(spokeGeo, rimMat);
      spoke.rotation.z = (s / 5) * Math.PI * 2;
      spoke.position.y = Math.sin(spoke.rotation.z) * 0.12;
      spoke.position.z = Math.cos(spoke.rotation.z) * 0.12;
      wg.add(spoke);
    }

    // hub cap center
    const hubGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.32, 8);
    const hub = new THREE.Mesh(hubGeo, new THREE.MeshPhongMaterial({color: carDef.color, shininess:200}));
    hub.rotation.z = Math.PI / 2;
    wg.add(hub);

    wg.position.set(...pos);
    group.add(wg);
    wheels.push(wg);
  });

  // Brake calipers
  wheelPositions.forEach(pos => {
    const calGeo = new THREE.BoxGeometry(0.1, 0.12, 0.08);
    const cal = new THREE.Mesh(calGeo, new THREE.MeshPhongMaterial({color:0xcc2200, shininess:60}));
    cal.position.set(pos[0] > 0 ? pos[0]-0.18 : pos[0]+0.18, pos[1]+0.08, pos[2]);
    group.add(cal);
  });

  // ── SPECIAL DETAILS per car ──
  if(carDef.id === 'demon' || carDef.id === 'camaro') {
    // Hood scoop
    const scoopGeo = new THREE.BoxGeometry(w * 0.5, h * 0.16, l * 0.35);
    const scoop = new THREE.Mesh(scoopGeo, bodyMat);
    scoop.position.set(0, h * 0.68, -l * 0.45);
    group.add(scoop);
  }

  if(carDef.id === 'huracan' || carDef.id === 'ferrari' || carDef.id === 'mclaren') {
    // Rear wing
    const wingGeo = new THREE.BoxGeometry(w * 2.0, h * 0.06, l * 0.28);
    const wing = new THREE.Mesh(wingGeo, accentMat);
    wing.position.set(0, h * 1.0, l * 0.95);
    group.add(wing);
    // Wing supports
    [-0.7, 0.7].forEach(xo => {
      const suppGeo = new THREE.BoxGeometry(0.05, h * 0.32, 0.05);
      const supp = new THREE.Mesh(suppGeo, bodyMat);
      supp.position.set(xo * w, h * 0.82, l * 0.95);
      group.add(supp);
    });
  }

  if(carDef.id === 'chiron' || carDef.id === 'jesko') {
    // Large rear wing
    const wingGeo = new THREE.BoxGeometry(w * 2.1, h * 0.07, l * 0.4);
    const wing = new THREE.Mesh(wingGeo, new THREE.MeshPhongMaterial({color: ac, shininess:200}));
    wing.position.set(0, h * 1.15, l * 0.9);
    group.add(wing);
  }

  if(carDef.id === 'vortexX1') {
    // Glowing trim
    const trimMat = new THREE.MeshPhongMaterial({color:0x00ffff, emissive:0x00aaaa, emissiveIntensity:0.6});
    [-0.9, 0.9].forEach(xo => {
      const trimGeo = new THREE.BoxGeometry(0.04, h * 0.04, l * 1.8);
      const trim = new THREE.Mesh(trimGeo, trimMat);
      trim.position.set(xo * w, h * 0.28, 0);
      group.add(trim);
    });
    // Extra glow
    const glow = new THREE.PointLight(0x00ffff, 1.5, 6);
    glow.position.set(0, h * 0.5, 0);
    group.add(glow);
  }

  group.castShadow = true;
  group.userData.wheels = wheels;
  group.userData.carDef = carDef;

  return group;
}

// Build AI car (simplified version for performance)
function buildAICar(colorHex) {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhongMaterial({color: colorHex, shininess:80});
  const darkMat = new THREE.MeshPhongMaterial({color:0x111111});
  const glassMat = new THREE.MeshPhongMaterial({color:0x88bbcc, transparent:true, opacity:0.5});

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 3.8), mat);
  body.position.y = 0.28; group.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 2.0), mat);
  cabin.position.set(0, 0.72, 0.1); group.add(cabin);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.08), glassMat);
  glass.position.set(0, 0.82, -1.0); glass.rotation.x=0.5; group.add(glass);

  [[-.88,-.62],[.88,-.62],[-.88,.65],[.88,.65]].forEach(([x,z]) => {
    const wg = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.24,12), darkMat);
    tire.rotation.z = Math.PI/2; wg.add(tire);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.26,8),
      new THREE.MeshPhongMaterial({color:0xaaaaaa}));
    rim.rotation.z = Math.PI/2; wg.add(rim);
    wg.position.set(x, 0, z); group.add(wg);
    group.userData.wheels = group.userData.wheels || [];
    group.userData.wheels.push(wg);
  });

  // Headlights
  const hlMat = new THREE.MeshPhongMaterial({color:0xffffaa, emissive:0xffff44, emissiveIntensity:0.6});
  [-0.5,0.5].forEach(x => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.32,0.1,0.05), hlMat);
    hl.position.set(x, 0.35, -1.92); group.add(hl);
  });
  const tlMat = new THREE.MeshPhongMaterial({color:0xff2200, emissive:0xff0000, emissiveIntensity:0.5});
  [-0.5,0.5].forEach(x => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.1,0.05), tlMat);
    tl.position.set(x, 0.35, 1.92); group.add(tl);
  });

  group.castShadow = true;
  return group;
}

// Spin wheels based on speed
function updateWheels(carGroup, speed, steer=0) {
  const wheels = carGroup.userData.wheels;
  if(!wheels) return;
  wheels.forEach((wg, i) => {
    wg.children[0] && (wg.children[0].rotation.x += speed * 0.8);
    // front wheels steer
    if(i < 2) { wg.rotation.y = steer * 0.45; }
  });
}
