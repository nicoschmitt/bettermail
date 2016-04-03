(function() {
    angular.module('myApp').directive('mdChips', function () {
    return {
        restrict: 'E',
        require: 'mdChips', // Extends the original mdChips directive
        link: function (scope, element, attributes, mdChipsCtrl) {
            mdChipsCtrl.onInputBlur = function () {
                this.inputHasFocus = false;

                var chipBuffer = this.getChipBuffer();
                if (chipBuffer != "") { 
                    this.appendChip(chipBuffer);
                    this.resetChipBuffer();
                }
            };
        }
    }
    });
}());