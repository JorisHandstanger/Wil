/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	eval("__webpack_require__(1);\nmodule.exports = __webpack_require__(3);\n\n\n/*****************\n ** WEBPACK FOOTER\n ** multi main\n ** module id = 0\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///multi_main?");

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	eval("'use strict';\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }\n\nvar _modulesSpaceObject = __webpack_require__(2);\n\nvar _modulesSpaceObject2 = _interopRequireDefault(_modulesSpaceObject);\n\nvar socket = io.connect('http://localhost:8000');\n\nvar camera = undefined,\n    scene = undefined,\n    renderer = undefined;\n\nvar planet = undefined,\n    laser = undefined;\nvar laserActive = false;\nvar laserCooldown = false;\nvar rot = 0;\n\nvar stats = new Stats();\n\nvar spaceObjects = [];\n\nvar spaceObjectsToCollect = [3, 4, 5, 6];\nvar spaceObjectsProgress = [];\nvar spaceObjectsCollected = [];\n\nvar previousSpawnTime = performance.now();\n\nvar currentPos = 0;\n\nvar stopped = false;\n\nvar nextId = 0;\n\nvar leftPadPressed = true;\nvar rightPadPressed = true;\n\nvar speed = 0;\n\nvar init = function init() {\n\n  // Performance monitor voor development\n  stats.setMode(0); // 0: fps, 1: ms, 2: mb\n\n  socket.emit('lightStatus', 'laserLedon');\n\n  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);\n  camera.rotation.set(0, 0, 0);\n  camera.position.set(0, 490, 0);\n\n  scene = new THREE.Scene();\n  scene.fog = new THREE.Fog(0x000000, 0, 750);\n\n  var hemiLight = new THREE.HemisphereLight(0x3366ff, 0x3366ff, 0.4);\n  hemiLight.position.set(0, 800, 0);\n  scene.add(hemiLight);\n\n  var dirLight = new THREE.DirectionalLight(0xffcc66, 0.6);\n  dirLight.position.set(100, 600, 200);\n  dirLight.position.multiplyScalar(50);\n  dirLight.castShadow = true;\n  dirLight.shadowDarkness = 0.5;\n  dirLight.name = 'dirlight';\n  dirLight.shadow = true;\n\n  scene.add(dirLight);\n\n  socket.on('notification', function (data) {\n\n    switch (data.trim()) {\n\n      case 'q':\n        // q\n\n        if (rightPadPressed) {\n          speed += 0.001;\n\n          leftPadPressed = true;\n          rightPadPressed = false;\n        }\n\n        break;\n\n      case 'd':\n        // d\n        if (leftPadPressed) {\n          speed += 0.001;\n\n          rightPadPressed = true;\n          leftPadPressed = false;\n        }\n\n        break;\n\n      case 'z':\n        //L\n\n        if (!laserCooldown) {\n          laserActive = true;\n          socket.emit('lightStatus', 'laserLedoff');\n\n          setTimeout(function () {\n            laserActive = false;\n\n            laserCooldown = true;\n            setTimeout(function () {\n              laserCooldown = false;\n              socket.emit('lightStatus', 'laserLedon');\n            }, 5000);\n          }, 600);\n        }\n\n        break;\n\n      /*case 'x': //Launch\n        if(!laserCooldown){\n          laserActive = true;\n        }\n         break;*/\n\n      case 'l':\n        // left\n        if (currentPos > -1) {\n          currentPos -= 1;\n          stopped = false;\n        }\n\n        break;\n\n      case 'r':\n        // right\n        if (currentPos < 1) {\n          currentPos += 1;\n          stopped = false;\n        }\n\n        break;\n    }\n  });\n\n  var loader1 = new THREE.ColladaLoader();\n\n  loader1.load(\n  // resource URL\n  './assets/planet.dae',\n  // Function when resource is loaded\n  function (collada) {\n    planet = collada.scene;\n    scene.add(planet);\n    planet.castShadow = true;\n    planet.receiveShadow = false;\n    planet.scale.set(1, 1, 1);\n  });\n\n  var loader7 = new THREE.ColladaLoader();\n\n  loader7.load(\n  // resource URL\n  './assets/laser.dae',\n  // Function when resource is loaded\n  function (collada) {\n    laser = collada.scene.children[0].children[0];\n    console.log(laser);\n\n    var laserMaterial = new THREE.MeshLambertMaterial({\n      color: 0xccffcc,\n      transparent: true,\n      opacity: 0,\n      emissive: new THREE.Color(0.3, 0.8, 0.3)\n    });\n\n    laser.material = laserMaterial;\n\n    scene.add(laser);\n    laser.rotation.set(0, 0, 0);\n    laser.scale.set(99, 99, 99);\n  });\n\n  //\n  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });\n  renderer.shadowMap.Enabled = true;\n  renderer.setClearColor(0x000000, 0);\n  renderer.setPixelRatio(window.devicePixelRatio);\n  renderer.setSize(window.innerWidth, window.innerHeight);\n  document.body.appendChild(renderer.domElement);\n\n  renderer.autoClear = false;\n\n  window.addEventListener('resize', onWindowResize, false);\n};\n\nvar onWindowResize = function onWindowResize() {\n  camera.aspect = window.innerWidth / window.innerHeight;\n  camera.updateProjectionMatrix();\n\n  renderer.setSize(window.innerWidth, window.innerHeight);\n};\n\nvar animate = function animate() {\n\n  requestAnimationFrame(animate);\n\n  stats.begin(); // Begin van te monitoren code\n\n  if (performance.now() - previousSpawnTime >= 3000) {\n\n    var random = Math.floor(Math.random() * 10) + 1;\n\n    if (random <= 3) {\n\n      if (spaceObjectsToCollect.length >= 1) {\n        var part = new _modulesSpaceObject2['default'](spaceObjectsToCollect[0], nextId);\n        spaceObjects.push(part);\n\n        spaceObjectsProgress.push(spaceObjectsToCollect[0]);\n        spaceObjectsToCollect.splice(0, 1);\n\n        console.log(spaceObjectsToCollect);\n        console.log(spaceObjectsProgress);\n        console.log(spaceObjectsCollected);\n\n        nextId++;\n      }\n    } else {\n      var stone = new _modulesSpaceObject2['default'](2, nextId);\n      spaceObjects.push(stone);\n      nextId++;\n    }\n\n    previousSpawnTime = performance.now();\n  }\n\n  spaceObjects.forEach(function (e) {\n\n    //ongerenderde objecten renderen\n    if (e.render() && !e.loaded) {\n      scene.add(e.render());\n      e.loaded = true;\n    }\n\n    //rotatie aanpassen\n    if (!stopped) {\n      e.update(speed);\n    }\n\n    //voorbije objecten deleten\n    if (e.deletable) {\n      var selectedObject = scene.getObjectByName(e.id);\n      scene.remove(selectedObject);\n      spaceObjects.splice(e, 1);\n\n      if (e.type === 3 || e.type === 4 || e.type === 5 || e.type === 6) {\n        spaceObjectsProgress.splice(spaceObjectsToCollect.indexOf(e.type), 1);\n        spaceObjectsToCollect.push(e.type);\n\n        console.log(spaceObjectsToCollect);\n        console.log(spaceObjectsProgress);\n        console.log(spaceObjectsCollected);\n      }\n    }\n\n    //collisions checken\n    if (e.hPosition === currentPos && e.collided) {\n      if (e.type === 2) {\n        stopped = true;\n      } else if (e.type === 3 || e.type === 4 || e.type === 5 || e.type === 6) {\n        var selectedObject = scene.getObjectByName(e.id);\n        scene.remove(selectedObject);\n        spaceObjects.splice(e, 1);\n\n        spaceObjectsProgress.splice(spaceObjectsToCollect.indexOf(e.type), 1);\n        spaceObjectsCollected.push(e.type);\n\n        switch (spaceObjectsCollected.length) {\n          case 1:\n            socket.emit('lightStatus', 'partled1on');\n            break;\n          case 2:\n            socket.emit('lightStatus', 'partled2on');\n            break;\n          case 3:\n            socket.emit('lightStatus', 'partled3on');\n            break;\n          case 4:\n            socket.emit('lightStatus', 'partled4on');\n            allparts = true;\n            //socket.emit('lightStatus', 'launchLedon');\n            break;\n        }\n\n        console.log(spaceObjectsToCollect);\n        console.log(spaceObjectsProgress);\n        console.log(spaceObjectsCollected);\n      }\n    }\n  });\n\n  if (!stopped) {\n    rot += speed;\n  }\n\n  if (planet && !stopped) {\n    planet.rotation.set(rot, 0, 0);\n  }\n\n  if (speed >= 0) {\n    speed = speed / 1.03;\n  }\n\n  if (laserActive && laser) {\n\n    stopped = false;\n\n    laser.material.opacity = 0.9;\n\n    spaceObjects.forEach(function (e) {\n\n      if (e.hPosition === currentPos && e.type === 2) {\n        var selectedObject = scene.getObjectByName(e.id);\n        scene.remove(selectedObject);\n        spaceObjects.splice(spaceObjects.indexOf(e), 1);\n      }\n    });\n  } else if (laser) {\n    laser.material.opacity = 0;\n  }\n\n  if (camera.position.x < 16 * currentPos) {\n    var val = (16 * currentPos - camera.position.x) / 8;\n    camera.position.x += val;\n    if (laser) {\n      laser.position.x += val;\n    }\n  } else if (camera.position.x > 16 * currentPos) {\n    var val = (camera.position.x - 16 * currentPos) / 8;\n    camera.position.x -= val;\n    if (laser) {\n      laser.position.x -= val;\n    }\n  }\n\n  renderer.clear();\n  renderer.render(scene, camera);\n\n  stats.end();\n};\n\ninit();\nanimate();\n\n/*****************\n ** WEBPACK FOOTER\n ** ./_js/script.js\n ** module id = 1\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./_js/script.js?");

/***/ },
/* 2 */
/***/ function(module, exports) {

	eval("'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\n\nvar _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }\n\nvar spaceObject = (function () {\n  function spaceObject(type, id) {\n    var _this = this;\n\n    _classCallCheck(this, spaceObject);\n\n    this.id = id;\n\n    this.type = type;\n\n    this.rotation = this.radians(45);\n\n    this.loaded = false;\n\n    this.collided = false;\n    this.deletable = false;\n\n    this.obj = {};\n\n    this.hPosition = Math.floor(Math.random() * 3) + 1 - 2;\n\n    this.redMaterial = new THREE.MeshPhongMaterial({\n      color: 0xe62626,\n      emissive: new THREE.Color(0.6, 0.1, 0.2),\n      shading: THREE.SmoothShading\n    });\n\n    this.whiteMaterial = new THREE.MeshPhongMaterial({\n      color: 0xffffff,\n      emissive: new THREE.Color(0.6, 0.6, 0.6),\n      shading: THREE.SmoothShading\n    });\n\n    var group = new THREE.Object3D();\n\n    var objloader = new THREE.OBJLoader();\n\n    switch (this.type) {\n      case 1:\n\n        var loader = new THREE.ColladaLoader();\n        loader.options.convertUpAxis = true;\n        loader.load(\n        // resource URL\n        './assets/rocketExportTest.dae',\n        // Function when resource is loaded\n        function (collada) {\n          var theObject = collada.scene;\n          theObject.position.set(_this.hPosition * 16, 0, -470);\n\n          theObject.rotation.set(_this.radians(-90), 0, 0);\n\n          group.add(theObject);\n\n          group.name = id;\n\n          _this.obj.shape = group;\n        });\n\n        break;\n\n      case 2:\n\n        var loader2 = new THREE.ColladaLoader();\n        loader2.options.convertUpAxis = true;\n        loader2.load(\n        // resource URL\n        './assets/rock.dae',\n        // Function when resource is loaded\n        function (collada) {\n          var theObject = collada.scene;\n          theObject.position.set(_this.hPosition * 16, 0, -440);\n          theObject.scale.set(0.1, 0.2, 0.1);\n\n          theObject.rotation.set(_this.radians(-90), _this.radians(90), 0);\n\n          group.add(theObject);\n\n          group.name = id;\n\n          _this.obj.shape = group;\n        });\n\n        break;\n\n      case 3:\n        objloader.load(\n        // resource URL\n        './assets/engine.obj',\n        // Function when resource is loaded\n        function (object) {\n\n          object.children[0].material = _this.redMaterial;\n          object.position.set(_this.hPosition * 16 - 2, 0, -467);\n\n          object.rotation.set(_this.radians(-90), 0, 0);\n          object.scale.set(0.01, 0.01, 0.01);\n\n          group.add(object);\n\n          group.name = id;\n\n          _this.obj.shape = group;\n        });\n\n        break;\n\n      case 4:\n        objloader.load(\n        // resource URL\n        './assets/poten.obj',\n        // Function when resource is loaded\n        function (object) {\n\n          object.children[0].material = _this.redMaterial;\n\n          object.position.set(_this.hPosition * 16 - 2, 0, -468);\n\n          object.rotation.set(_this.radians(-90), 0, 0);\n          object.scale.set(0.006, 0.006, 0.006);\n\n          group.add(object);\n\n          group.name = id;\n\n          _this.obj.shape = group;\n        });\n\n        break;\n\n      case 5:\n        objloader.load(\n        // resource URL\n        './assets/hull.obj',\n        // Function when resource is loaded\n        function (object) {\n          object.children[0].material = _this.whiteMaterial;\n          object.position.set(_this.hPosition * 16, 0, -465);\n\n          object.rotation.set(_this.radians(-90), 0, 0);\n          object.scale.set(0.01, 0.01, 0.01);\n\n          group.add(object);\n\n          group.name = id;\n\n          _this.obj.shape = group;\n        });\n\n        break;\n\n      case 6:\n\n        objloader.load(\n        // resource URL\n        './assets/antenna.obj',\n        // Function when resource is loaded\n        function (object) {\n          object.children[0].material = _this.redMaterial;\n          object.position.set(_this.hPosition * 16, 0, -465);\n\n          object.rotation.set(_this.radians(-90), 0, 0);\n          object.scale.set(0.01, 0.01, 0.01);\n\n          group.add(object);\n\n          group.name = id;\n\n          _this.obj.shape = group;\n        });\n\n        break;\n    }\n  }\n\n  _createClass(spaceObject, [{\n    key: 'update',\n    value: function update(speed) {\n\n      this.rotation += speed;\n\n      if (this.obj.shape) {\n        this.obj.shape.rotation.set(this.rotation, 0, 0);\n      }\n\n      if (this.rotation >= this.radians(96)) {\n        this.deletable = true;\n      } else if (this.rotation >= this.radians(87)) {\n        this.collided = true;\n      } else if (this.rotation >= this.radians(87.2)) {\n        this.collided = false;\n      }\n    }\n  }, {\n    key: 'render',\n    value: function render() {\n      return this.obj.shape;\n    }\n  }, {\n    key: 'radians',\n    value: function radians(degrees) {\n      return degrees * Math.PI / 180;\n    }\n  }]);\n\n  return spaceObject;\n})();\n\nexports['default'] = spaceObject;\nmodule.exports = exports['default'];\n\n/*****************\n ** WEBPACK FOOTER\n ** ./_js/modules/spaceObject.js\n ** module id = 2\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./_js/modules/spaceObject.js?");

/***/ },
/* 3 */
/***/ function(module, exports) {

	eval("// removed by extract-text-webpack-plugin\n\n/*****************\n ** WEBPACK FOOTER\n ** ./_scss/style.scss\n ** module id = 3\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./_scss/style.scss?");

/***/ }
/******/ ]);