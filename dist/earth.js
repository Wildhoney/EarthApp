(function($angular) {

    "use strict";

    // To hell with good intentions.
    $angular.module('earthApp', []);

})(window.angular);
(function($angular, $app, $yaml) {

    "use strict";

    /**
     * @module Earth
     * @author Adam Timberlake
     * @link https://github.com/Wildhoney/Earth
     * @directive Earth
     */
    $app.directive('earth', ['$window', '$http', '$cacheFactory', function EarthDirective($window, $http, $cacheFactory) {

        return {

            /**
             * @property restrict
             * @type {String}
             */
            restrict: 'E',

            /**
             * @property require
             * @type {String}
             */
            require: 'ngModel',

            /**
             * @property scope
             * @type {Object}
             */
            scope: {
                model: '=ngModel'
            },

            /**
             * @method controller
             * @param $scope {Object}
             * @return {void}
             */
            controller: ['$scope', function controller($scope) {

                // Hmm ColladaLoader is broken, so we'll mock this method to prevent it from throwing
                // an error.
                THREE.Geometry.prototype.computeCentroids = $angular.noop;

                /**
                 * @constant CONFIG_FILE
                 * @type {String}
                 */
                $scope.CONFIG_FILE = 'earth-app.yml';

                /**
                 * @property objects
                 * @type {Array}
                 */
                $scope.objects = [];

                /**
                 * @property animationFrame
                 * @type {Number}
                 */
                $scope.animationFrame = 0;

                /**
                 * @property isMouseDown
                 * @type {Boolean}
                 */
                $scope.isMouseDown = false;

                /**
                 * @property options
                 * @type {Object}
                 */
                $scope.options = {};

                /**
                 * @method setOptions
                 * @type {Object}
                 * @return {void}
                 */
                $scope.setOptions = function setOptions(options) {
                    $scope.options = options;
                };

                /**
                 * @method getShader
                 * @param name {String}
                 * @return {String}
                 */
                $scope.getShader = function getShader(name) {
                    return $window.document.getElementById(name).textContent;
                };

                /**
                 * @method renderTowerBridge
                 * @param earth {THREE.Mesh}
                 * @return {THREE.Mesh}
                 */
                $scope.renderTowerBridge = function renderTowerBridge(earth) {

//                    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00}),
//                        cube     = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), material);

                    var loader = new THREE.ColladaLoader();
                    loader.load('models/TowerBridge.dae', function (result) {

                        result.scene.position.z = 47;
                        result.scene.position.x = 10;
                        result.scene.position.y = 10;

                        result.scene.rotation.x = -0.2;

                        result.scene.scale.x = 0.025;
                        result.scene.scale.y = 0.025;
                        result.scene.scale.z = 0.025;

                        earth.add(result.scene);
                    });
//
//                    cube.position.z = 50;
////                    cube.position.x = 10;
////                    cube.position.y = 10;
////                    cube.rotation.x = 110;
////                    cube.rotation.y = 110;
//
//                    earth.add(cube);
//                    return cube;

                };

                /**
                 * @method renderClouds
                 * @param scene {THREE.Scene}
                 * @return {THREE.Mesh}
                 */
                $scope.renderClouds = function renderClouds(scene) {

                    var centerObject = new THREE.Mesh(),
                        options      = $scope.options.earth;

                    /**
                     * @method renderCenterObject
                     * @return {void}
                     */
                    (function renderCenterObject() {

                        var material = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }),
                            sphere   = new THREE.SphereGeometry(options.radius, 1, 1);
                        centerObject = new THREE.Mesh(sphere, material);

                        centerObject.rotation.x = 0.2;
                        centerObject.rotation.y = 0.2;

                        scene.add(centerObject);

                    })();

                    /**
                     * @method renderClouds
                     * @return {void}
                     */
                    (function renderClouds() {

                        var options = $scope.options;

                        var material = new THREE.MeshPhongMaterial({
                            map: THREE.ImageUtils.loadTexture(options.clouds.map),
                            bumpMap: THREE.ImageUtils.loadTexture(options.clouds['bump_map']),
                            bumpScale: 0.35,
                            transparent: true,
                            opacity: 0.3
                        });

                        var sphere = new THREE.SphereGeometry(options.earth.radius + 0.05, options.earth.segments, options.earth.rings),
                            mesh   = new THREE.Mesh(sphere, material);

                        centerObject.add(mesh);

                    })();

                    return centerObject;

                };

                /**
                 * @method renderEarth
                 * @param scene {THREE.Scene}
                 * @return {THREE.Mesh}
                 */
                $scope.renderEarth = function renderEarth(scene) {

                    var mesh    = new THREE.Mesh(),
                        options = $scope.options.earth;

                    /**
                     * @method renderEarth
                     * @return {void}
                     */
                    (function renderEarth() {

                        var material = new THREE.MeshPhongMaterial({
                            map: THREE.ImageUtils.loadTexture(options.map),
                            bumpMap: THREE.ImageUtils.loadTexture(options['bump_map']),
                            bumpScale: options['bump_scale']
                        });

                        var sphere = new THREE.SphereGeometry(options.radius, options.segments, options.rings);
                        mesh       = new THREE.Mesh(sphere, material);

                        $scope.objects.push(mesh);
                        scene.add(mesh);

                    })();

                    /**
                     * @method renderHalo
                     * @return {void}
                     */
                    (function renderHalo() {

                        var material = new THREE.ShaderMaterial({
                            uniforms: {},
                            vertexShader: $scope.getShader('vertexShaderEarth'),
                            fragmentShader: $scope.getShader('fragmentShaderEarth'),
                            side: THREE.BackSide,
                            blending: THREE.AdditiveBlending,
                            transparent: true
                        });

                        var halo = new THREE.SphereGeometry((options.radius + 10), options.segments, options.rings),
                            mesh = new THREE.Mesh(halo, material);

                        scene.add(mesh);

                    })();

                    return mesh;

                };

                /**
                 * @method renderStars
                 * @param scene {THREE.Scene}
                 * @return {THREE.Mesh}
                 */
                $scope.renderStars = function renderStars(scene) {

                    var options      = $scope.options.earth,
                        material     = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }),
                        sphere       = new THREE.SphereGeometry(options.radius, 1, 1),
                        centerObject = new THREE.Mesh(sphere, material);

                    var particleCount    = $scope.options.stars.count,
                        particles        = new THREE.Geometry(),
                        particleMaterial = new THREE.ParticleBasicMaterial({
                            size: 2,
                            map: THREE.ImageUtils.loadTexture('images/stars.png'),
                            blending: THREE.AdditiveBlending,
                            transparent: true,
                            opacity: 0.75
                    });

                    for (var p = 0; p < particleCount; p++) {

                        var pX = Math.random() * ($window.innerWidth * 2) - 250,
                            pY = Math.random() * ($window.innerWidth * 2) - 250,
                            pZ = Math.random() * 1000 - 1000,
                            particle = new THREE.Vector3(pX, pY, pZ);

                        // add it to the geometry
                        particles.vertices.push(particle);
                    }

                    var particleSystem = new THREE.ParticleSystem(particles, particleMaterial);

                    // Add the items to the scene.
                    scene.add(centerObject);
                    centerObject.add(particleSystem);
                    return centerObject;

                };

                /**
                 * @method renderLights
                 * @param scene {THREE.Scene}
                 * @return {void}
                 */
                $scope.renderLights = function renderLights(scene) {

                    // Render the ambient light so that even the darkest areas have a little bit
                    // of light cast on them.
                    scene.add(new THREE.AmbientLight(0x555555));

                    /**
                     * @method renderPointLight
                     * @return {void}
                     */
                    (function renderPointLight() {

                        var options = $scope.options.light,
                            light   = new THREE.PointLight(0xFFFFFF);

                        light.intensity  = 1;
                        light.position.x = -100;
                        light.position.y = 50;
                        light.position.z = options['z_position'];
                        light.castShadow = true;

                        scene.add(light);

                    })();

                };

            }],

            /**
             * @method link
             * @param scope {Object}
             * @param element {Object}
             * @return {void}
             */
            link: function link(scope, element) {

                var projector = new THREE.Projector();

                // Read the YAML configuration document.
                $http.get(scope.CONFIG_FILE, { cache: $cacheFactory }).then(function then(response) {

                    // Parse the YAML configuration!
                    var config      = $yaml.load(response.data),
                        options     = config.scene,
                        aspectRatio = ($window.innerWidth / $window.innerHeight),
                        renderer    = new THREE.WebGLRenderer({ alpha: options.transparent, antialias: options['anti_alias'] }),
                        camera      = new THREE.PerspectiveCamera(options.angle, aspectRatio, options.near, options.far),
                        scene       = new THREE.Scene();

                    scene.add(camera);
                    camera.position.z = config.camera['z_position'];
                    renderer.setSize($window.innerWidth, $window.innerHeight);
                    element.append(renderer.domElement);

                    // Define the options in the controller to prevent us from passing them around
                    // as function dependencies.
                    scope.setOptions(config);

                    // Render our representation of planet earth to the scene.
                    var earth  = scope.renderEarth(scene),
                        clouds = scope.renderClouds(scene),
                        stars  = scope.renderStars(scene);
                    scope.renderLights(scene);

                    // Add some landmarks to planet earth!
//                    scope.renderBigBen(earth);
//                    scope.renderTowerBridge(earth);

                    // Render the entire scene.
                    renderer.render(scene, camera);

                    // Place in a rendering loop.
                    var render = function render() {

                        earth.rotation.y += 0.0005;
                        earth.rotation.x += 0.0001;

                        clouds.rotation.y += 0.001;
                        clouds.rotation.x += 0.0001;

                        stars.rotation.z += 0.0005;

                        // Initialise the animation.
                        scope.animationFrame = requestAnimationFrame(render);
                        renderer.render(scene, camera);

                    };

                    // Voila!
                    render();

                    /**
                     * @method attachEvents
                     * @param $document {$window.document}
                     * @return {void}
                     */
                    (function attachEvents($document) {

                        // Re-render the scene when the user resizes the window.
                        $window.addEventListener('resize', function onResize() {

                            camera.aspect = $window.innerWidth / $window.innerHeight;
                            camera.updateProjectionMatrix();
                            renderer.setSize($window.innerWidth, $window.innerHeight);

                        }, false);

                        var startPosition;

                        $document.addEventListener('mousedown', function onMouseDown(event) {

                            event.preventDefault();

                            var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
                            projector.unprojectVector(vector, camera);

                            var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize()),
                                intersects = raycaster.intersectObjects(scope.objects);

                            // We're only interested in events taking place on the earth object.
                            if (intersects.length > 0 && intersects[0].object === earth) {
                                startPosition = { x: event.clientX, y: event.clientY };
                                scope.isMouseDown = true;
                            }

                        });

                        $document.addEventListener('mouseup', function onMouseUp() {
                            scope.isMouseDown = false;
                            startPosition = null;
                        });

                        $document.addEventListener('mousemove', function(event) {

                            if (!startPosition) {
                                return;
                            }

                            var xPosition = startPosition.x - event.clientX,
                                yPosition = startPosition.y - event.clientY;

                            /**
                             * @method getRotation
                             * @param model {Object}
                             * @return {Object}
                             */
                            var getRotation = function getRotation(model) {

                                return {
                                    x: model.rotation.x + -(yPosition / ($window.innerWidth * 3)),
                                    y: model.rotation.y + -(xPosition / ($window.innerHeight * 3))
                                };

                            };

                            // Rotate the planet!
                            earth.rotation.y  = getRotation(earth).y;
                            earth.rotation.x  = getRotation(earth).x;
                            clouds.rotation.y = getRotation(clouds).y;
                            clouds.rotation.x = getRotation(clouds).x;

                        });

                    })($window.document);

                    /**
                     * @property model
                     * @type {Object}
                     */
                    scope.model = {

                        /**
                         * @method setCountry
                         * @param name {String}
                         * @return {void}
                         */
                        setCountry: function setCountry(name) {

                            /**
                             * @property _countryMap
                             * @type {Object}
                             * @private
                             */
                            var _countryMap = {
                                'United Kingdom': { y: 4.7, x: 1 }
                            };

                            // Cancel the current animation.
//                            cancelAnimationFrame(scope.animationFrame);

                            var ySteps        = _countryMap[name].y / 100,
                                xSteps        = _countryMap[name].x / 100,
                                locationFrame = 0;

                            /**
                             * @method renderToLocation
                             * @return {void}
                             */
                            (function renderToLocation() {

                                earth.rotation.y += ySteps;
                                earth.rotation.x += xSteps;

                                var yMatches = earth.rotation.y.toFixed(2) === _countryMap[name].y.toFixed(2),
                                    xMatches = earth.rotation.x.toFixed(2) === _countryMap[name].x.toFixed(2);

                                // Determine when we've reached the desired point.
                                if (yMatches && xMatches) {

                                    earth.rotation.y = _countryMap[name].y;
                                    earth.rotation.x = _countryMap[name].x;
                                    cancelAnimationFrame(locationFrame);
                                    render();
                                    return;

                                }

                                // Otherwise slowly move to the desired location.
//                                locationFrame = requestAnimationFrame(renderToLocation);
                                earth.rotation.y = _countryMap[name].y;
                                earth.rotation.x = _countryMap[name].x;

                            })();

                        }

                    }

                });

            }

        };

    }]);

})(window.angular, window.angular.module('earthApp'), window.jsyaml);
(function($angular) {

    "use strict";

    /**
     * @module Earth
     * @author Adam Timberlake
     * @link https://github.com/Wildhoney/Earth
     * @controller ApplicationController
     */
    $angular.module('earthApp').controller('ApplicationController', ['$scope', function ApplicationController($scope) {

        /**
         * @property current
         * @type {Object|null}
         */
        $scope.current = { name: null };

        /**
         * @property interface
         * @type {Object}
         */
        $scope.interface = {

            /**
             * @property setCountry
             * @type {Function}
             */
            setCountry: $angular.noop

        };

        /**
         * @method setCountry
         * @param name {String}
         * @return {void}
         */
        $scope.setCountry = function setCountry(name) {
            $scope.current.name = name;
            $scope.interface.setCountry(name);
        }

    }]);

})(window.angular);