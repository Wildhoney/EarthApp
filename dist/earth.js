(function($angular) {

    "use strict";

    // To hell with good intentions.
    $angular.module('earthApp', []);

})(window.angular);
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
(function($angular, $app, $yaml, $window) {

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
                 * @method renderEarth
                 * @param scene {THREE.Scene}
                 * @return {THREE.Mesh}
                 */
                $scope.renderEarth = function renderEarth(scene) {

                    var mesh    = {},
                        options = $scope.options.earth;

                    /**
                     * @method renderEarth
                     * @return {void}
                     */
                    (function renderEarth() {

                        var material = new THREE.MeshPhongMaterial({
                            map: THREE.ImageUtils.loadTexture('images/earth_cloudy_diffuse.jpg'),
                            bumpMap: THREE.ImageUtils.loadTexture('images/earth_normal.jpg'),
                            bumpScale: 0.25
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
                            vertexShader: $scope.getShader('vertexShader'),
                            fragmentShader: $scope.getShader('fragmentShader'),
                            side: THREE.BackSide,
                            blending: THREE.AdditiveBlending,
                            transparent: true
                        });

                        var halo = new THREE.SphereGeometry((options.radius + 10), options.segments, options.rings);
                        var mesh = new THREE.Mesh(halo, material);
                        scene.add(mesh);

                    })();

                    return mesh;

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
                $http.get('earth.yaml', { cache: $cacheFactory }).then(function then(response) {

                    // Parse the YAML configuration!
                    var config      = $yaml.load(response.data),
                        options     = config.scene,
                        aspectRatio = ($window.innerWidth / $window.innerHeight),
                        renderer    = new THREE.WebGLRenderer({ alpha: options.transparent, antialias: options['anti_alias'] }),
                        camera      = new THREE.PerspectiveCamera(options.angle, aspectRatio, options.near, options.far),
                        scene       = new THREE.Scene();

                    // Define the options in the controller to prevent us from passing them around
                    // as function dependencies.
                    scope.setOptions(config);

                    scene.add(camera);
                    camera.position.z = config.camera['z_position'];
                    renderer.setSize($window.innerWidth, $window.innerHeight);
                    element.append(renderer.domElement);

                    // Render our representation of planet earth to the scene.
                    var earth = scope.renderEarth(scene);
                    scope.renderLights(scene);
                    renderer.render(scene, camera);

                    // Place in a rendering loop.
                    (function render() {
                        earth.rotation.y += 0.0005;
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

})(window.angular, window.angular.module('earthApp'), window.jsyaml, window);