(function($angular) {

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