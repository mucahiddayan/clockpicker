/**
 * @author Mücahid Dayan
 * Clock Picker Angular Module
 */

let getTemplateFile = (name, ext = 'html') => {
    return name + '.' + ext;
}
let clockPicker = angular.module('clockPicker', []);

const FOURFIFTHS = .8;
const THREEFIFTHS = .6;

clockPicker.controller('clockpickerController', ['$scope', ($scope) => {
    $scope.obj = {
        date: 0
    };
}]);

let spion;

clockPicker.directive('clockpicker', ['$document', '$window','$timeout', ($document, $window, $timeout) => {

    let link = (scope, element, attributes, controllers) => {

        if (!angular.isDefined(scope.cpSize)) {
            scope.cpSize = 20;
        }

        
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

        let style = () => {
            let elementBoundingClientRect = element[0].getBoundingClientRect()
            let clockStyle = {};
            if ($window.innerWidth - elementBoundingClientRect.left < 235) {
                clockStyle.right = '10px';
            }
            if ($window.innerHeight - elementBoundingClientRect.bottom < 60) {
                clockStyle.marginTop = '-105px';
            }

            scope.clock.style = clockStyle;
        }

        let isAttributeSet = attribute => {
            return attribute in attributes;
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
            active:false,
            activate: (element)=>{
                scope.clock.deactivateAll();
                angular.element(element).addClass('active');
            },
            deactivateAll:()=>[].map.call(document.querySelectorAll('.clockpicker'),cp=>angular.element(cp).removeClass('active')),
            minuteHand: {
                style: { 'transform': `rotate(${date.minuteToDegree(15)}deg)` },
                y2: (scope.cpSize * (- (FOURFIFTHS - .05) ))
            },
            hourHand: {
                style: { 'transform': `rotate(${date.hourToDegree(0)}deg)` },
                y2: (scope.cpSize * (- THREEFIFTHS))
            },
            update: () => {
                scope.clock.minuteHand.style = { 'transform': `rotate(${date.minuteToDegree(scope.time.minute)}deg)` };
                scope.clock.hourHand.style = { 'transform': `rotate(${date.hourToDegree(scope.time.hour)}deg)` };
            },
            toggle: () => {                
                scope.clock.opened = !scope.clock.opened;
                style();
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
            style: {},
            frame: {
                style: {
                    r: scope.cpSize * FOURFIFTHS
                },
            },
            g: {
                style: 'translate(' + scope.cpSize + ',' + scope.cpSize + ')'
            },
            preview: {
                style: { 
                    'width': (scope.cpSize * 2 )+'px',
                    'height': (scope.cpSize * 2 )+'px'
                }
            },
            previewWrapper: {
                style: { 
                    'height': (scope.cpSize * 2 )+'px' ,
                    'min-width': (scope.cpSize * 2 )+'px',                    
                }
            },
            label:{
                style:{
                    'margin':'0px '+( ( scope.cpSize * 2 ) + 5 )+'px'
                }
            },
            viewBox: `0 0 ${scope.cpSize * 2} ${scope.cpSize * 2}`,
            opened: false,
            disabled: isAttributeSet('disabled'),
        }

        scope.prevent = () => {
            scope.clock.open();
        }

        $document.on('keypress, keydown', event => {
            if (event.which == 27) { // escape
                scope.$apply(scope.clock.close())
            }
            if (event.which == 13) {
                scope.$apply(scope.clock.done());
            }
        });

        $document.on('click',event=>{
            if(angular.element(event.target).hasClass('clockpicker')){
                scope.clock.activate(event.target);
            }else{
                scope.clock.deactivateAll();
            }
        });


        let destroy = () => {
            $document.off('keypress');
            $document.off('click');
        }

        scope.$on('$destroy', () => {
            destroy();
        });
    }

    let template = (element, attribute) =>
        `
    <div class="clockpicker-wrapper"
    ng-style="clock.previewWrapper.style"
    >
    <div class="clock-preview-wrapper" ng-style="clock.previewWrapper.style" ng-class="{'disabled':clock.disabled}">
    <div class="clock-preview"         
         ng-click="clock.toggle()"
         ng-style="clock.preview.style"
         title="{{cpModel}}">
        <svg ng-attr-viewBox="{{clock.viewBox}}">
            <g ng-attr-transform="{{clock.g.style}}" class="clock">
                <circle class="clock-frame" ng-style="clock.frame.style"></circle>
                <line y1="0" ng-attr-y2="{{clock.hourHand.y2}}" ng-style="clock.hourHand.style" class="hour-hand" title="{{clock.hourHand}}"></line>
                <line y1="0" ng-attr-y2="{{clock.minuteHand.y2}}" ng-style="clock.minuteHand.style" class="minute-hand" title="{{clock.minuteHand}}"></line>
            </g>
        </svg>
    </div>
    <label
        ng-if="cpLabel" 
        ng-attr-title="{{cpLabel}}" 
        ng-style="clock.label.style"  
        ng-click="clock.toggle()"
        class="clockpicker-label" 
        ng-bind="cpLabel"
    ></label>
    </div>
    <div class="clockpicker" 
         ng-form name="clockpicker" 
         ng-attr-placeholder="cpPlaceholder" 
         ng-show="clock.opened"
         ng-style="clock.style"         
         ng-attr-data-hour="time.hour"         
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
</div>
`;

    return {
        restrict: 'E',
        scope: {
            cpModel: '=?',
            cpPlaceholder: '@?',
            cpStringfyResult: '@?',
            cpLabel: '@?',
            cpSize: '@?'
        },
        template,
        link,
    };
}]);