/* ============================================================
   Peak Up – globe.js
   Three.js 3D realistic Earth globe with export route arcs
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
  const ambientLight = new THREE.AmbientLight(0xc0d8ff, 0.6);
  scene.add(ambientLight);

  // Sun-like directional light
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  sunLight.position.set(5, 3, 5);
  scene.add(sunLight);

  // Soft fill light from opposite side
  const fillLight = new THREE.DirectionalLight(0x8899bb, 0.2);
  fillLight.position.set(-5, -2, -3);
  scene.add(fillLight);

  // --- Texture Loader ---
  const loader = new THREE.TextureLoader();

  const earthTexURL    = 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg';
  const earthBumpURL   = 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_normal_2048.jpg';
  const earthSpecURL   = 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_specular_2048.jpg';
  const earthCloudsURL = 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_clouds_1024.png';

  // --- Globe ---
  const globeGeo = new THREE.SphereGeometry(1, 64, 64);

  const globeMat = new THREE.MeshPhongMaterial({
    shininess: 25,
  });

  loader.load(earthTexURL, function (tex) {
    globeMat.map = tex;
    globeMat.needsUpdate = true;
  });
  loader.load(earthBumpURL, function (tex) {
    globeMat.bumpMap = tex;
    globeMat.bumpScale = 0.05;
    globeMat.needsUpdate = true;
  });
  loader.load(earthSpecURL, function (tex) {
    globeMat.specularMap = tex;
    globeMat.specular = new THREE.Color(0x336699);
    globeMat.needsUpdate = true;
  });

  const globe = new THREE.Mesh(globeGeo, globeMat);
  scene.add(globe);

  // --- Cloud Layer ---
  const cloudGeo = new THREE.SphereGeometry(1.015, 64, 64);
  const cloudMat = new THREE.MeshPhongMaterial({
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  loader.load(earthCloudsURL, function (tex) {
    cloudMat.map = tex;
    cloudMat.alphaMap = tex;
    cloudMat.needsUpdate = true;
  });
  const clouds = new THREE.Mesh(cloudGeo, cloudMat);
  scene.add(clouds);

  // --- Atmosphere Glow ---
  const atmGeo = new THREE.SphereGeometry(1.08, 32, 32);
  const atmMat = new THREE.MeshBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.07,
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

  // --- Stars Background ---
  const starsGeo = new THREE.BufferGeometry();
  const starPositions = [];
  for (let i = 0; i < 1200; i++) {
    const r     = 8 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    starPositions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }
  starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: .5 });
  scene.add(new THREE.Points(starsGeo, starsMat));

  // --- Mouse Parallax ---
  let targetRotY = 0, targetRotX = 0;
  let currentRotY = 0, currentRotX = 0;

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
  function animate() {
    requestAnimationFrame(animate);

    globe.rotation.y  += 0.002;
    clouds.rotation.y += 0.0015;

    currentRotY += (targetRotY - currentRotY) * 0.05;
    currentRotX += (targetRotX - currentRotX) * 0.05;
    scene.rotation.y = currentRotY;
    scene.rotation.x = currentRotX;

    renderer.render(scene, camera);
  }
  animate();
})();
