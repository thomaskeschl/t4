/**
 * Created by Thomas on 12/12/2014.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('AppController', AppController);

    AppController.$inject = ['$window'];

    function AppController($window) {
        var vm = this;

        vm.size = 3;

        vm.containerPct = 100 / vm.size;

        vm.init = init;

        vm.mark = mark;

        init();

        setSize();

        function init() {

            var data = {};

            data.cells = [];

            for (var i = 0; i < vm.size * vm.size; i++) {
                data.cells.push(0);
            }

            data.scores = [];

            for (var j = 0; j < (vm.size * 2) + 2; j++) {
                data.scores.push(0);
            }

            data.gameOver = false;

            data.winner = "";

            data.currPlayer = 1;

            vm.data = data;
        }

        function mark(index) {
            var curr = vm.data.cells[index];

            // bail if already marked
            if (curr != 0) {
                return;
            }

            vm.data.cells[index] = vm.data.currPlayer;
            var row = Math.floor(index / vm.size);
            var col = index % vm.size;
            updateScores(row, col, vm.data.currPlayer);
            checkWinner();
            vm.data.currPlayer = vm.data.currPlayer * -1;
        }

        /**
         * Updates the scores for each row, column and diagonal.
         * @param row the index of the row that was marked
         * @param col the index of the column that was marked
         * @param point the player that marked the cell
         */
        var updateScores = function (row, col, point) {
            vm.data.scores[row] += point;
            vm.data.scores[vm.size + col] += point;

            if (row === col) {
                vm.data.scores[2 * vm.size] += point;
            }

            if ((vm.size - 1 - col) === row) {
                vm.data.scores[2 * vm.size + 1] += point;
            }
        };

        function checkWinner() {
            for (var i = 0; i < vm.data.scores.length; i++) {
                var score = vm.data.scores[i];
                if (vm.size === Math.abs(score)) {
                    vm.data.gameOver = true;
                    vm.data.winner = (score / vm.size === 1) ? "Player X" : "Player O";
                    break;
                }
            }

            if (vm.data.gameOver === false && vm.data.cells.indexOf(0) == -1) {
                vm.data.gameOver = true;
                vm.data.winner = "Nobody"
            }
        }

        /**
         * Resize the container element to prevent it from being too big or too small.
         */
        angular.element($window).bind("resize", setSize);

        function setSize() {
            var containerElem = angular.element(document.querySelector('.container'))[0];
            var width = $window.innerWidth * .75;
            if (width >= 500) {
                containerElem.style.width = "500px";
                containerElem.style.height = "500px";
                containerElem.style.paddingBottom = "0";
            } else if (width <= 200) {
                containerElem.style.width = "200px";
                containerElem.style.height = "200px";
                containerElem.style.paddingBottom = "0";
            } else {
                containerElem.style.width = "75%";
                containerElem.style.height = "";
                containerElem.style.paddingBottom = "75%";
            }
        }
    }
})();