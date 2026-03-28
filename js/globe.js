/* ============================================================
   Peak Up – globe.js
   Three.js 3D rotating globe with export route arcs
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('globe-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // --- Scene Setup ---
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 2.8);

  // --- Lighting ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x7A5AF8, 1.2);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);

  const backLight = new THREE.DirectionalLight(0xEFA222, 0.4);
  backLight.position.set(-5, -2, -3);
  scene.add(backLight);

  // --- Globe ---
  const globeGeo = new THREE.SphereGeometry(1, 64, 64);

  // Globe base material (dark, slightly reflective)
  const globeMat = new THREE.MeshPhongMaterial({
    color: 0x0d0a24,
    emissive: 0x1a0f4a,
    emissiveIntensity: 0.3,
    shininess: 40,
    transparent: true,
    opacity: 0.95,
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  scene.add(globe);

  // --- Wireframe Overlay ---
  const wireGeo = new THREE.SphereGeometry(1.002, 24, 24);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x7A5AF8,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wire);

  // --- Atmosphere Glow ---
  const atmGeo = new THREE.SphereGeometry(1.12, 32, 32);
  const atmMat = new THREE.MeshBasicMaterial({
    color: 0x7A5AF8,
    transparent: true,
    opacity: 0.06,
    side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(atmGeo, atmMat));

  // --- Lat/Lon to 3D point ---
  function latLonToVec3(lat, lon, r) {
    const phi   = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  // --- City Dots ---
  const cities = [
    { lat: 41.0,  lon: 28.9  }, // Istanbul
    { lat: 51.5,  lon: -0.1  }, // London
    { lat: 48.8,  lon: 2.3   }, // Paris
    { lat: 52.5,  lon: 13.4  }, // Berlin
    { lat: 40.7,  lon: -74.0 }, // New York
    { lat: 34.0,  lon: -118.2}, // Los Angeles
    { lat: 35.6,  lon: 139.7 }, // Tokyo
    { lat: 31.2,  lon: 121.5 }, // Shanghai
    { lat: 22.3,  lon: 114.2 }, // Hong Kong
    { lat: 1.3,   lon: 103.8 }, // Singapore
    { lat: 25.2,  lon: 55.3  }, // Dubai
    { lat: 24.7,  lon: 46.7  }, // Riyadh
    { lat: 30.0,  lon: 31.2  }, // Cairo
    { lat: -33.9, lon: 18.4  }, // Cape Town
    { lat: 19.4,  lon: -99.1 }, // Mexico City
    { lat: -23.5, lon: -46.6 }, // São Paulo
    { lat: 55.7,  lon: 37.6  }, // Moscow
    { lat: 28.6,  lon: 77.2  }, // Delhi
    { lat: 37.5,  lon: 127.0 }, // Seoul
    { lat: -37.8, lon: 144.9 }, // Melbourne
  ];

  const dotGeo = new THREE.CircleGeometry(0.012, 8);
  cities.forEach(city => {
    const pos  = latLonToVec3(city.lat, city.lon, 1.01);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xEFA222, transparent: true, opacity: .9 });
    const dot  = new THREE.Mesh(dotGeo, mat);
    dot.position.copy(pos);
    dot.lookAt(pos.clone().multiplyScalar(2));
    scene.add(dot);
  });

  // --- Route Arcs ---
  function createArc(p1, p2, color, opacity) {
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(1.4); // lift arc above surface

    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    const pts   = curve.getPoints(60);
    const geo   = new THREE.BufferGeometry().setFromPoints(pts);
    const mat   = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    return new THREE.Line(geo, mat);
  }

  // Istanbul as hub + routes
  const hub   = latLonToVec3(41.0, 28.9, 1.01);
  const routes = [
    { city: cities[1],  color: 0x7A5AF8, op: .5 }, // London
    { city: cities[2],  color: 0xEFA222, op: .4 }, // Paris
    { city: cities[3],  color: 0x7A5AF8, op: .4 }, // Berlin
    { city: cities[4],  color: 0xEFA222, op: .35}, // New York
    { city: cities[6],  color: 0x7A5AF8, op: .4 }, // Tokyo
    { city: cities[7],  color: 0xEFA222, op: .4 }, // Shanghai
    { city: cities[10], color: 0x7A5AF8, op: .5 }, // Dubai
    { city: cities[11], color: 0xEFA222, op: .4 }, // Riyadh
    { city: cities[12], color: 0x7A5AF8, op: .35}, // Cairo
    { city: cities[17], color: 0xEFA222, op: .35}, // Delhi
  ];

  routes.forEach(r => {
    const arc = createArc(hub, latLonToVec3(r.city.lat, r.city.lon, 1.01), r.color, r.op);
    scene.add(arc);
  });

  // --- Stars Background ---
  const starsGeo = new THREE.BufferGeometry();
  const starPositions = [];
  for (let i = 0; i < 1200; i++) {
    const r = 8 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    starPositions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }
  starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: .55 });
  scene.add(new THREE.Points(starsGeo, starsMat));

  // --- Mouse Parallax ---
  let targetRotY = 0;
  let targetRotX = 0;
  let currentRotY = 0;
  let currentRotX = 0;

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    targetRotY = ((e.clientX - cx) / cx) *  0.3;
    targetRotX = ((e.clientY - cy) / cy) * -0.15;
  });

  // --- Resize ---
  function onResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);
  onResize();

  // --- Animate ---
  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame += 0.003;

    // Auto-rotate
    globe.rotation.y += 0.002;
    wire.rotation.y  += 0.001;

    // Parallax lerp
    currentRotY += (targetRotY - currentRotY) * 0.05;
    currentRotX += (targetRotX - currentRotX) * 0.05;
    scene.rotation.y = currentRotY;
    scene.rotation.x = currentRotX;

    // Pulse dot brightness
    cities.forEach((_, i) => {
      const dot = scene.children.find(c => c.isMesh && c.geometry.type === 'CircleGeometry');
      // no-op: dots stay visible
    });

    renderer.render(scene, camera);
  }
  animate();
})();
