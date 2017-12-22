/**
 * @author Mücahid Dayan
 * Clock Picker Angular Module
 */

let getTemplateFile = (name, ext = 'html') => {
    return name + '.' + ext;
}
let clockPicker = angular.module('clockPicker', []);

clockPicker.controller('clockpickerController', ['$scope', ($scope) => {
    $scope.obj = {
        date: 0
    };
}]);

clockPicker.directive('clockpicker', ['$document', ($document) => {

    let link = (scope, element, attributes, controllers) => {
        const date = {
            setHours: hours => {
                date.hours = hours > 9 ? hours : '0' + hours;
            },
            setMinutes: minutes => {
                date.minutes = minutes > 9 ? minutes : '0' + minutes;
            },
            getHours: () => {
                return date.hours;
            },
            getMinutes: () => {
                return date.minutes;
            },
            getDuration: (stringify = false) => {
                return stringify ? JSON.stringify({ hour: date.getHours(), minute: date.getMinutes() }) : `${date.hours}:${date.minutes}`;
            },
            minuteToDegree: (value) => value * 6,
            hourToDegree: (value) => value * 30,
        };

        let convertToNumber = val => {
            return isNaN(parseInt(val)) ? 0 : parseInt(val);

        }

        scope.time = {
            hour: 0,
            minute: 15,
            validateHour: () => {
                let hour = convertToNumber(scope.time.hour);
                hour %= 24;
                if (hour < 0) hour += 24;
                scope.time.hour = hour;
                scope.clock.update();
            },
            validateMinute: () => {
                let minute = convertToNumber(scope.time.minute);
                minute %= 60;
                if (minute < 0) minute += 60;
                scope.time.minute = minute;
                scope.clock.update();
            },
            update: () => {
                date.setHours(scope.time.hour);
                date.setMinutes(scope.time.minute);
                scope.cpModel = date.getDuration(scope.cpStringfyResult);
            },
            value: null
        };

        scope.clock = {
            minuteHand: { 'transform': `rotate(${date.minuteToDegree(15)}deg)` },
            hourHand: { 'transform': `rotate(${date.hourToDegree(12)}deg)` },
            update: () => {
                scope.clock.minuteHand = { 'transform': `rotate(${date.minuteToDegree(scope.time.minute)}deg)` };
                scope.clock.hourHand = { 'transform': `rotate(${date.hourToDegree(scope.time.hour)}deg)` };
            },
            open: () => {
                scope.clock.opened = true;
                scope.cpModel = null;
            },
            close: () => {
                scope.clock.opened = false;
            },
            done: () => {
                scope.time.update();
                scope.clock.close();
            },
            opened: false,
        }

        scope.prevent = () => {
            scope.clock.open();
        }

        $document.bind('keypress, keydown', event => {
            console.log(event.which, event.which == 27);
            if (event.which == 27) { // escape
                scope.$apply(scope.clock.close())
                console.log(scope.clock.opened);
            }
            if (event.which == 13) {
                scope.$apply(scope.clock.done());
            }
        });

        let destroy = () => {
            $document.unbind('keypress');
        }

        scope.$on('$destroy', () => {
            destroy();
        });
    }

    let template = (element, attribute) => `
    <div class="clockpicker-wrapper">
    <div class="clock-preview" ng-click="clock.open()" title="{{cpModel}}">
        <svg viewBox="0 0 100 100">
            <g transform="translate(50,50)" class="clock">
                <circle class="clock-frame"></circle>
                <line y1="2" y2="-30" ng-style="clock.hourHand" class="hour-hand" title="{{clock.hourHand}}"></line>
                <line y1="2" y2="-40" ng-style="clock.minuteHand" class="minute-hand" title="{{clock.minuteHand}}"></line>
            </g>
        </svg>
    </div>
    <div class="clockpicker" ng-form name="clockpicker" ng-attr-placeholder="cpPlaceholder" ng-show="clock.opened" ng-attr-data-hour="time.hour"
        ng-attr-data-minute="time.minute">
        <div class="hour-wrapper cp-item">
            <input autofocus type="number" name="hour" id="hour" ng-model-options="{ debounce: 0 }" ng-change="time.validateHour()" ng-model="time.hour"
            />
        </div>
        <span class="clock-splitter">:</span>
        <div class="minute-wrapper cp-item">
            <input type="number" name="minute" id="minute" ng-model-options="{ debounce: 0 }" ng-change="time.validateMinute()" ng-model="time.minute"
            />
        </div>
        <i class="button" ng-click="clock.done()">Done</i>
    </div>
</div>`;

    return {
        restrict: 'E',
        scope: {
            cpModel: '=?',
            cpPlaceholder: '@?',
            cpStringfyResult: '@?',
        },
        template,
        link,
    };
}]);