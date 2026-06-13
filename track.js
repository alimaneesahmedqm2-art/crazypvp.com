// ═══════════════════════════════════════════════════════════════
//  TRACK.JS — 3D track generation using Three.js
// ═══════════════════════════════════════════════════════════════

const ROAD_WIDTH = 14;
const WALL_HEIGHT = 2.2;
const TRACK_DETAIL = 12; // catmull steps

function makeTrackWaypointsForTrack(trackId, radius) {
  const layouts = {
    city: () => {
      const pts = [];
      for(let a = 0; a < Math.PI*2; a += 0.22)
        pts.push({x: Math.cos(a)*radius, z: Math.sin(a)*radius*0.72});
      return pts;
    },
    desert: () => {
      const pts = [];
      for(let a = 0; a < Math.PI*2; a += 0.18) {
        const r = radius + Math.sin(a*2)*radius*0.28;
        pts.push({x: Math.cos(a)*r, z: Math.sin(a)*r*0.65});
      }
      return pts;
    },
    coastal: () => {
      const pts = [];
      for(let a = 0; a < Math.PI*2; a += 0.15)
        pts.push({x: Math.cos(a)*radius*1.15, z: Math.sin(a)*radius*0.5});
      return pts;
    },
    mountain: () => [
      {x:-radius,z:-radius*.7},{x:0,z:-radius},{x:radius,z:-radius*.7},
      {x:radius,z:0},{x:radius*.5,z:radius*.8},{x:-radius*.5,z:radius*.8},{x:-radius,z:0}
    ],
    neon: () => {
      const pts = [];
      for(let a = 0; a < Math.PI*2; a += 0.15) {
        const r = radius + Math.sin(a*3)*radius*0.2;
        pts.push({x: Math.cos(a)*r, z: Math.sin(a)*r*0.7});
      }
      return pts;
    },
    industrial: () => [
      {x:-radius*.9,z:-radius*.6},{x:radius*.9,z:-radius*.6},
      {x:radius*.9,z:-radius*.2},{x:radius*.4,z:radius*.6},
      {x:-radius*.4,z:radius*.6},{x:-radius*.9,z:-radius*.2}
    ],
    frozen: () => {
      const pts = [];
      for(let a = 0; a < Math.PI*2; a += 0.2)
        pts.push({x: Math.cos(a)*radius*.95, z: Math.sin(a)*radius*.95});
      return pts;
    },
    volcano: () => {
      const pts = [];
      for(let i = 0; i < 8; i++) {
        const a = (i/8)*Math.PI*2;
        const r = i%2===0 ? radius*.9 : radius*.5;
        pts.push({x: Math.cos(a)*r, z: Math.sin(a)*r});
      }
      return pts;
    },
    skyway: () => {
      const pts = [];
      for(let a = 0; a < Math.PI*2; a += 0.16) {
        const r = radius + Math.sin(a*2)*radius*.15;
        pts.push({x: Math.cos(a)*r*1.1, z: Math.sin(a)*r*.55});
      }
      return pts;
    },
    vortex: () => {
      const pts = [];
      for(let a = 0; a < Math.PI*2; a += 0.13) {
        const r = radius + Math.sin(a*3)*radius*.12;
        pts.push({x: Math.cos(a)*r, z: Math.sin(a)*r*.7 + Math.sin(a*2)*radius*.06});
      }
      return pts;
    },
    sandstorm: () => {
      const pts = [];
      for(let a = 0; a < Math.PI*2; a += 0.22)
        pts.push({x: Math.cos(a)*radius*1.05, z: Math.sin(a)*radius*.65});
      return pts;
    },
    ice: () => {
      const pts = [];
      for(let a = 0; a < Math.PI*2; a += 0.18)
        pts.push({x: Math.cos(a)*radius, z: Math.sin(a)*radius*.9});
      return pts;
    },
    thunder: () => {
      const pts = [];
      for(let a = 0; a < Math.PI*2; a += 0.2) {
        const r = radius + Math.sin(a*4)*radius*.1;
        pts.push({x: Math.cos(a)*r, z: Math.sin(a)*r*.75});
      }
      return pts;
    },
    tokyo: () => {
      const pts = [];
      for(let a = 0; a < Math.PI*2; a += 0.14) {
        const r = radius + Math.cos(a*2)*radius*.22;
        pts.push({x: Math.cos(a)*r, z: Math.sin(a)*r*.68});
      }
      return pts;
    },
    space: () => {
      const pts = [];
      for(let a = 0; a < Math.PI*2; a += 0.16) {
        const r = radius + Math.sin(a*3)*radius*.18;
        pts.push({x: Math.cos(a)*r, z: Math.sin(a)*r*.72 + Math.sin(a*2)*radius*.04});
      }
      return pts;
    },
  };
  const fn = layouts[trackId] || layouts.city;
  return fn();
}

function catmullRom3D(pts, steps) {
  const result = [];
  const n = pts.length;
  for(let i = 0; i < n; i++) {
    const p0 = pts[(i-1+n)%n], p1 = pts[i], p2 = pts[(i+1)%n], p3 = pts[(i+2)%n];
    for(let t = 0; t < steps; t++) {
      const tt = t/steps, t2 = tt*tt, t3 = t2*tt;
      result.push({
        x: .5*((-p0.x+3*p1.x-3*p2.x+p3.x)*t3+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+p2.x)*tt+2*p1.x),
        z: .5*((-p0.z+3*p1.z-3*p2.z+p3.z)*t3+(2*p0.z-5*p1.z+4*p2.z-p3.z)*t2+(-p0.z+p2.z)*tt+2*p1.z),
        y: 0,
      });
    }
  }
  return result;
}

function buildTrack3D(trackDef, scene) {
  const radius = 65;
  const rawPts = makeTrackWaypointsForTrack(trackDef.id, radius);
  const pts = catmullRom3D(rawPts, TRACK_DETAIL);
  const n = pts.length;

  // Compute normals and tangents
  for(let i = 0; i < n; i++) {
    const nx = pts[(i+1)%n], pr = pts[(i-1+n)%n];
    const dx = nx.x - pr.x, dz = nx.z - pr.z;
    const len = Math.hypot(dx, dz) || 1;
    pts[i].nx = -dz/len;
    pts[i].nz =  dx/len;
    pts[i].angle = Math.atan2(dx, dz);
    const pn = pts[(i-1+n)%n];
    pts[i].dist = i===0 ? 0 : (pts[i-1].dist || 0) + Math.hypot(pts[i].x-pn.x, pts[i].z-pn.z);
  }
  const totalLen = pts[n-1].dist + Math.hypot(pts[0].x-pts[n-1].x, pts[0].z-pts[n-1].z);

  const env = trackDef.env;
  const roadColor = new THREE.Color(env.road);
  const grassColor = new THREE.Color(env.grass);

  // ── GROUND PLANE ──
  const groundGeo = new THREE.PlaneGeometry(600, 600);
  const groundMat = new THREE.MeshLambertMaterial({color: grassColor});
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI/2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ── ROAD SURFACE ──
  const roadMat = new THREE.MeshLambertMaterial({color: roadColor});
  const roadVertices = [];
  const roadIndices = [];
  const rw = ROAD_WIDTH;

  for(let i = 0; i < n; i++) {
    const pt = pts[i];
    const lx = pt.x - pt.nx * rw;
    const lz = pt.z - pt.nz * rw;
    const rx = pt.x + pt.nx * rw;
    const rz = pt.z + pt.nz * rw;
    roadVertices.push(lx, 0.01, lz, rx, 0.01, rz);
  }

  for(let i = 0; i < n; i++) {
    const ni = (i+1)%n;
    const a = i*2, b = i*2+1, c = ni*2, d = ni*2+1;
    roadIndices.push(a, b, c, b, d, c);
  }

  const roadGeo = new THREE.BufferGeometry();
  roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadVertices, 3));
  roadGeo.setIndex(roadIndices);
  roadGeo.computeVertexNormals();
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.receiveShadow = true;
  scene.add(roadMesh);

  // ── CENTER LINE (dashes) ──
  const dashMat = new THREE.MeshBasicMaterial({color: env.stripe || '#ffffff'});
  for(let i = 0; i < n; i += 6) {
    const pt = pts[i], np = pts[(i+1)%n];
    const geo = new THREE.BoxGeometry(0.3, 0.02, 2.0);
    const mesh = new THREE.Mesh(geo, dashMat);
    mesh.position.set(pt.x, 0.03, pt.z);
    mesh.rotation.y = pt.angle;
    scene.add(mesh);
  }

  // ── WALLS / BARRIERS ──
  const wallMat = new THREE.MeshLambertMaterial({color: new THREE.Color(env.wall)});
  const kerb1Mat = new THREE.MeshLambertMaterial({color: 0xee2222});
  const kerb2Mat = new THREE.MeshLambertMaterial({color: 0xeeeeee});

  for(let i = 0; i < n; i++) {
    const pt = pts[i], np = pts[(i+1)%n];
    const dx = np.x - pt.x, dz = np.z - pt.z;
    const segLen = Math.hypot(dx, dz);
    if(segLen < 0.1) continue;

    // Left wall
    const wgl = new THREE.BoxGeometry(0.5, WALL_HEIGHT, segLen);
    const wml = new THREE.Mesh(wgl, wallMat);
    wml.position.set(
      (pt.x + np.x)/2 - pt.nx*(rw+0.25),
      WALL_HEIGHT/2,
      (pt.z + np.z)/2 - pt.nz*(rw+0.25)
    );
    wml.rotation.y = Math.atan2(dx, dz);
    wml.castShadow = true;
    scene.add(wml);

    // Right wall
    const wgr = new THREE.BoxGeometry(0.5, WALL_HEIGHT, segLen);
    const wmr = new THREE.Mesh(wgr, wallMat);
    wmr.position.set(
      (pt.x + np.x)/2 + pt.nx*(rw+0.25),
      WALL_HEIGHT/2,
      (pt.z + np.z)/2 + pt.nz*(rw+0.25)
    );
    wmr.rotation.y = Math.atan2(dx, dz);
    wmr.castShadow = true;
    scene.add(wmr);

    // Kerb strips every other segment
    if(i%2===0) {
      const km = i%4===0 ? kerb1Mat : kerb2Mat;
      const kk = i%4===0 ? kerb2Mat : kerb1Mat;
      const kGeo = new THREE.BoxGeometry(1.0, 0.08, segLen);
      const kl = new THREE.Mesh(kGeo, km);
      kl.position.set((pt.x+np.x)/2 - pt.nx*(rw-0.5), 0.04, (pt.z+np.z)/2 - pt.nz*(rw-0.5));
      kl.rotation.y = Math.atan2(dx, dz);
      scene.add(kl);
      const kr = new THREE.Mesh(kGeo, kk);
      kr.position.set((pt.x+np.x)/2 + pt.nx*(rw-0.5), 0.04, (pt.z+np.z)/2 + pt.nz*(rw-0.5));
      kr.rotation.y = Math.atan2(dx, dz);
      scene.add(kr);
    }
  }

  // ── START/FINISH LINE ──
  const sfGeo = new THREE.BoxGeometry(ROAD_WIDTH*2, 0.04, 1.2);
  const sfMat = new THREE.MeshBasicMaterial({color: 0xffffff});
  const sf = new THREE.Mesh(sfGeo, sfMat);
  sf.position.set(pts[0].x, 0.02, pts[0].z);
  sf.rotation.y = pts[0].angle;
  scene.add(sf);
  // checkered
  for(let ci = 0; ci < 16; ci++) {
    const cx = ((ci%8)/8 - 0.5) * ROAD_WIDTH*2;
    const cz = ci < 8 ? -0.3 : 0.3;
    const cGeo = new THREE.BoxGeometry(ROAD_WIDTH*2/8 - 0.1, 0.05, 0.6);
    const cMat = new THREE.MeshBasicMaterial({color: ci%2===0 ? 0xffffff : 0x000000});
    const cm = new THREE.Mesh(cGeo, cMat);
    cm.position.set(pts[0].x + Math.cos(pts[0].angle)*cz + cx*Math.cos(pts[0].angle+Math.PI/2), 0.025,
                    pts[0].z + Math.sin(pts[0].angle)*cz + cx*Math.sin(pts[0].angle+Math.PI/2));
    cm.rotation.y = pts[0].angle;
    scene.add(cm);
  }

  // ── SCENERY ──
  addScenery(trackDef, pts, scene, radius);

  // ── LIGHTING ──
  scene.fog = new THREE.Fog(env.fog, env.fogNear, env.fogFar);
  scene.background = new THREE.Color(env.sky);

  const ambient = new THREE.AmbientLight(env.ambient, 0.9);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(env.sun, 1.2);
  sun.position.set(50, 80, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 400;
  sun.shadow.camera.left = -150;
  sun.shadow.camera.right = 150;
  sun.shadow.camera.top = 150;
  sun.shadow.camera.bottom = -150;
  scene.add(sun);

  // Track lights for dark tracks
  if(['neon','vortex','tokyo','space','thunder'].includes(trackDef.id)) {
    const lampColor = trackDef.id === 'neon' ? 0xff00cc : trackDef.id === 'tokyo' ? 0xff00ff : 0x4466ff;
    for(let i = 0; i < n; i += Math.floor(n/20)) {
      const pt = pts[i];
      const pl = new THREE.PointLight(lampColor, 1.0, 18);
      pl.position.set(pt.x, 4, pt.z);
      scene.add(pl);
    }
  }

  return { pts, n, totalLen };
}

function addScenery(trackDef, pts, scene, radius) {
  const id = trackDef.id;

  // Generic buildings / trees outside track
  const angles = [];
  for(let a = 0; a < Math.PI*2; a += 0.3) angles.push(a);

  if(['city','neon','tokyo','cyber'].includes(id)) {
    // Buildings
    const bldMats = [
      new THREE.MeshLambertMaterial({color:0x223344}),
      new THREE.MeshLambertMaterial({color:0x334455}),
      new THREE.MeshLambertMaterial({color:0x112233}),
    ];
    for(let i = 0; i < 40; i++) {
      const a = (i/40)*Math.PI*2;
      const r = radius * 1.45 + Math.random()*30;
      const h = 8 + Math.random()*30;
      const geo = new THREE.BoxGeometry(5+Math.random()*8, h, 5+Math.random()*8);
      const mesh = new THREE.Mesh(geo, bldMats[i%3]);
      mesh.position.set(Math.cos(a)*r, h/2, Math.sin(a)*r);
      mesh.castShadow = true;
      scene.add(mesh);
      // windows
      if(id==='neon' || id==='tokyo') {
        const wMat = new THREE.MeshBasicMaterial({color: Math.random()>0.5?0xff00cc:0x00ddff});
        for(let w = 0; w < 6; w++) {
          const wGeo = new THREE.BoxGeometry(0.8, 0.6, 0.1);
          const wm = new THREE.Mesh(wGeo, wMat);
          wm.position.set(
            mesh.position.x + (Math.random()-0.5)*4,
            Math.random()*h,
            mesh.position.z + (mesh.position.z>0?-2.6:2.6)
          );
          scene.add(wm);
        }
      }
    }
  }

  if(['desert','sandstorm'].includes(id)) {
    // Cacti / rocks
    const rockMat = new THREE.MeshLambertMaterial({color:0x8a7050});
    for(let i = 0; i < 30; i++) {
      const a = (i/30)*Math.PI*2;
      const r = radius*1.35+Math.random()*40;
      const h = 1+Math.random()*3;
      const geo = new THREE.CylinderGeometry(0.4+Math.random()*0.4, 0.6+Math.random()*0.4, h, 8);
      const mesh = new THREE.Mesh(geo, rockMat);
      mesh.position.set(Math.cos(a)*r, h/2, Math.sin(a)*r);
      scene.add(mesh);
    }
  }

  if(['mountain'].includes(id)) {
    // Mountains in background
    const mMat = new THREE.MeshLambertMaterial({color:0x444444});
    for(let i = 0; i < 12; i++) {
      const a = (i/12)*Math.PI*2;
      const r = radius*1.8+Math.random()*30;
      const h = 20+Math.random()*50;
      const geo = new THREE.ConeGeometry(10+Math.random()*15, h, 6);
      const mesh = new THREE.Mesh(geo, mMat);
      mesh.position.set(Math.cos(a)*r, h/2, Math.sin(a)*r);
      scene.add(mesh);
    }
  }

  if(['frozen','ice'].includes(id)) {
    // Ice pillars / snow mounds
    const iceMat = new THREE.MeshPhongMaterial({color:0xc0e8ff, transparent:true, opacity:0.85, shininess:200});
    for(let i = 0; i < 20; i++) {
      const a = (i/20)*Math.PI*2;
      const r = radius*1.3+Math.random()*35;
      const geo = new THREE.CylinderGeometry(0.5, 1.5, 3+Math.random()*6, 6);
      const mesh = new THREE.Mesh(geo, iceMat);
      mesh.position.set(Math.cos(a)*r, (3+Math.random()*6)/2, Math.sin(a)*r);
      scene.add(mesh);
    }
  }

  if(['volcano'].includes(id)) {
    // Volcano in center
    const lavaMat = new THREE.MeshPhongMaterial({color:0xff4400, emissive:0xff2200, emissiveIntensity:0.5});
    const volcGeo = new THREE.ConeGeometry(18, 35, 8);
    const volc = new THREE.Mesh(volcGeo, lavaMat);
    volc.position.set(0, 17.5, 0);
    scene.add(volc);
    const ptL = new THREE.PointLight(0xff4400, 2, 80);
    ptL.position.set(0, 30, 0);
    scene.add(ptL);
  }

  if(['space'].includes(id)) {
    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starVerts = [];
    for(let s = 0; s < 2000; s++) {
      starVerts.push((Math.random()-0.5)*600, Math.random()*200, (Math.random()-0.5)*600);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({color:0xffffff, size:0.5}));
    scene.add(stars);
    // Platform pillars
    const pilMat = new THREE.MeshLambertMaterial({color:0x224466});
    for(let i = 0; i < 15; i++) {
      const a = (i/15)*Math.PI*2, r = radius*1.4;
      const geo = new THREE.CylinderGeometry(0.4, 0.8, 20, 8);
      const mesh = new THREE.Mesh(geo, pilMat);
      mesh.position.set(Math.cos(a)*r, -10, Math.sin(a)*r);
      scene.add(mesh);
    }
  }

  if(['skyway'].includes(id)) {
    // Cloud platforms
    const cloudMat = new THREE.MeshLambertMaterial({color:0xffffff, transparent:true, opacity:0.7});
    for(let c = 0; c < 20; c++) {
      const a = Math.random()*Math.PI*2, r = radius*1.3+Math.random()*50;
      const geo = new THREE.SphereGeometry(3+Math.random()*5, 8, 6);
      const mesh = new THREE.Mesh(geo, cloudMat);
      mesh.position.set(Math.cos(a)*r, 10+Math.random()*20, Math.sin(a)*r);
      scene.add(mesh);
    }
  }

  // Generic trees for green tracks
  if(['coastal','industrial'].includes(id)) {
    const treeTrunk = new THREE.MeshLambertMaterial({color:0x4a2800});
    const treeLeaf = new THREE.MeshLambertMaterial({color:0x226622});
    for(let i = 0; i < 25; i++) {
      const a = (i/25)*Math.PI*2, r = radius*1.4+Math.random()*40;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.3,.4,3,6), treeTrunk);
      trunk.position.set(Math.cos(a)*r, 1.5, Math.sin(a)*r);
      scene.add(trunk);
      const leaves = new THREE.Mesh(new THREE.ConeGeometry(2.5,5,8), treeLeaf);
      leaves.position.set(Math.cos(a)*r, 5.5, Math.sin(a)*r);
      scene.add(leaves);
    }
  }
}

// Find nearest point on track
function nearestTrackPoint(pts, n, x, z) {
  let best = 0, bestD = Infinity;
  for(let i = 0; i < n; i++) {
    const d = (pts[i].x-x)**2 + (pts[i].z-z)**2;
    if(d < bestD) { bestD = d; best = i; }
  }
  return best;
}

function trackProgress(pts, idx, totalLen) {
  return (pts[idx]?.dist || 0) / totalLen;
}
