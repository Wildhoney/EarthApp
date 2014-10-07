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
                 * @method renderBigBen
                 * @param earth {THREE.Mesh}
                 * @return {THREE.Mesh}
                 */
                $scope.renderBigBen = function renderBigBen(earth) {

//                    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00}),
//                        cube     = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), material);

                    var loader = new THREE.ColladaLoader();
                    loader.load('models/BigBen.dae', function (result) {

                        result.scene.position.z = 47.5;
                        result.scene.position.x = 10;
                        result.scene.position.y = 10;

                        result.scene.rotation.x = -0.2;

                        result.scene.scale.x = 0.05;
                        result.scene.scale.y = 0.05;
                        result.scene.scale.z = 0.05;

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
                 * @method renderMoon
                 * @param scene {THREE.Scene}
                 * @return {THREE.Mesh}
                 */
                $scope.renderMoon = function renderMoon(scene) {

                    var centerObject = new THREE.Mesh(),
                        options      = $scope.options.earth;

                    /**
                     * @method renderCenterObject
                     * @return {void}
                     */
                    (function renderCenterObject() {

                        var material = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }),
                            sphere   = new THREE.SphereGeometry(options.radius, options.segments, options.rings);
                        centerObject = new THREE.Mesh(sphere, material);

                        centerObject.rotation.x = .2;
                        centerObject.rotation.y = .2;

                        scene.add(centerObject);

                    })();

                    (function renderMoon() {

                        var options = $scope.options.moon;

                        var material = new THREE.MeshPhongMaterial({
                            map: THREE.ImageUtils.loadTexture(options.map),
                            bumpMap: THREE.ImageUtils.loadTexture(options['bump_map']),
                            bumpScale: 0.75
                        });

                        var sphere = new THREE.SphereGeometry(options.radius, options.segments, options.rings),
                            mesh   = new THREE.Mesh(sphere, material);

                        // Offset the moon's position from the aforementioned center object.
                        mesh.position.z = 75;
                        mesh.position.y = 10;

                        centerObject.add(mesh);

                    })();

                    /**
                     * @method renderHalo
                     * @return {void}
                     */
                    (function renderHalo() {

                        var options = $scope.options.moon;

                        var material = new THREE.ShaderMaterial({
                            uniforms: {},
                            vertexShader: $scope.getShader('vertexShaderMoon'),
                            fragmentShader: $scope.getShader('fragmentShaderMoon'),
                            side: THREE.BackSide,
                            blending: THREE.AdditiveBlending,
                            transparent: true
                        });

                        var halo = new THREE.SphereGeometry((options.radius + 10), options.segments, options.rings),
                            mesh = new THREE.Mesh(halo, material);

                        mesh.position.z = 75.5;
                        mesh.position.y = 10;

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
                            bumpScale: 0.35
                        });

                        var sphere = new THREE.SphereGeometry(options.radius, options.segments, options.rings);
                        mesh       = new THREE.Mesh(sphere, material);

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
                 * @return {void}
                 */
                $scope.renderStars = function renderStars(scene) {

                    var options      = $scope.options.earth,
                        material     = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }),
                        sphere       = new THREE.SphereGeometry(options.radius, 1, 1),
                        centerObject = new THREE.Mesh(sphere, material);

                    var particleCount = 250000,
                        particles     = new THREE.Geometry(),
                        pMaterial     = new THREE.ParticleBasicMaterial({
                            size: 2,
                            map: THREE.ImageUtils.loadTexture('images/stars.png'),
                            blending: THREE.AdditiveBlending,
                            transparent: true
                    });

                    for (var p = 0; p < particleCount; p++) {

                        var pX = Math.random() * 1000 - 250,
                            pY = Math.random() * 900 - 250,
                            pZ = Math.random() * 600 - 850,
                            particle = new THREE.Vector3(pX, pY, pZ);

                        // add it to the geometry
                        particles.vertices.push(particle);
                    }

                    var particleSystem = new THREE.ParticleSystem(particles, pMaterial);

                    // Add the items to the scene.
                    scene.add(centerObject);
                    centerObject.add(particleSystem);

                };

                /**
                 * @method renderLights
                 * @param scene {THREE.Scene}
                 * @return {void}
                 */
                $scope.renderLights = function renderLights(scene) {

                    // Render the ambient light so that even the darkest areas have a little bit
                    // of light cast on them.
                    scene.add(new THREE.AmbientLight(0x222222));

                    /**
                     * @method renderPointLight
                     * @return {void}
                     */
                    (function renderPointLight() {

                        var options = $scope.options.light,
                            light   = new THREE.PointLight(0xffffff);

                        light.intensity = 0.75;
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
                    var earth = scope.renderEarth(scene),
                        moon  = scope.renderMoon(scene);
                    scope.renderLights(scene);
                    scope.renderStars(scene);

                    // Add some landmarks to planet earth!
                    scope.renderBigBen(earth);


                    // Render the entire scene.
                    renderer.render(scene, camera);

                    // Place in a rendering loop.
                    (function render() {

                        earth.rotation.y += 0.0015;
                        earth.rotation.x += 0.0001;
                        moon.rotation.y  -= 0.0006;
                        moon.rotation.x  -= 0.0001;

                        // Initialise the animation.
                        requestAnimationFrame(render);
                        renderer.render(scene, camera);

                    })();

                });

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
                        console.log('Changing to', name, '...');
                    }

                }

            }

        };

    }]);

})(window.angular, window.angular.module('earthApp'), window.jsyaml);