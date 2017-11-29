'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CLScroll = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _changlinObserver = require('changlin-observer');

var _changlinUtil = require('changlin-util');

var _changlinWdtools = require('changlin-wdtools');

var _changlinAnimate = require('changlin-animate');

var _throwerror = require('./throwerror');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//!!!wdtools 添加此变量
var hasTransform = true;

var touchEvents = ['touchstart', 'touchmove', 'touchend'];
var mouseEvents = ['mousedown', 'mousemove', 'mouseup'];

var isMobile = (0, _changlinWdtools.isIOS)() || (0, _changlinWdtools.isAndroid)();

//const isMobile=false;


var CLScroll = exports.CLScroll = function () {
    function CLScroll(config) {
        (0, _classCallCheck3.default)(this, CLScroll);

        _initialiseProps.call(this);

        if (!(0, _changlinUtil.isObject)(config)) (0, _throwerror.throwError)('config should be object but got ' + (0, _changlinUtil.whatIs)(config));
        (0, _changlinUtil.extend)(this.config, config);
        this.init();
        _changlinObserver.Observer.call(this);
    }

    (0, _createClass3.default)(CLScroll, [{
        key: 'computeTerminus',
        value: function computeTerminus(start, distance, t, time, deceleration, ending) {
            var destination = void 0,
                reachEndding = false,
                speed = distance / t;
            destination = start + speed * time / 2 * deceleration;
            if (speed > 0 && destination >= ending || speed < 0 && destination <= ending) {
                destination = ending;
                reachEndding = true;
            }

            console.log('------------------------start');
            console.log('distance', distance);
            console.log('t', t);
            console.log('speed', speed);
            console.log('------------------------end');

            return {
                destination: destination,
                currentSpeed: speed,
                reachEndding: reachEndding
            };
        }

        /**
         *
         * @param start
         * @param distance
         * @param time
         * @param animationTime
         * @param deceleration
         * @param direction
         * @returns {{x?: Object, y?: Object}}
         */


        /**
         *
         * @param x
         * @param y
         * @returns {{x?: Object, y?: Object}}
         */


        /**
         *
         * @param x
         * @param y
         * @returns {{x?:object,y?:object}}
         */

    }]);
    return CLScroll;
}();

var _initialiseProps = function _initialiseProps() {
    var _this = this;

    this.config = {
        container: null,
        startX: 0,
        startY: 0,
        scrollX: false,
        scrollY: true,
        freeScroll: false,
        bounce: true,
        bounceTime: 300,
        momentum: true,
        momentumLimitTime: 300,
        momentumTime: 700,
        momentumLimitDistance: 15,
        deceleration: 0.5,
        useTransform: hasTransform,
        allowableDistanceLeft: 0,
        allowableDistanceTop: 0,
        allowableDistanceRight: 0,
        allowableDistanceBottom: 0,
        bounceDistanceLeft: 60,
        bounceDistanceTop: 60,
        bounceDistanceRight: 60,
        bounceDistanceBottom: 60,
        preventDefaultException: [{ prop: 'tagName', reg: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ }]
    };
    this.wrapper = null;
    this.containerOffset = null;
    this.containerWidth = null;
    this.containerHeight = null;
    this.time = {
        startTime: null,
        penultimateTime: null
    };
    this.animation = null;
    this.points = {
        startPoint: null,
        endPoint: null,
        penultimatePoint: null
    };
    this.x = 0;
    this.y = 0;
    this.timer = null;
    this.fingerDown = false;

    this.init = function () {
        var config = _this.config;

        config.container = (0, _changlinWdtools.findEL)(config.container);
        if (!config.container) (0, _throwerror.throwError)('no container');
        if (!config.container.children.length) (0, _throwerror.throwError)('no wrapper');
        _this.wrapper = config.container.children[0];
        _this.getAndSetContainer();
        _this.setWrapper();
        _this.eventListen();
        _this.x = config.startX;
        _this.y = config.startY;
        _this.setPosition(config.startX, config.startY);
    };

    this.getAndSetContainer = function () {
        var _config = _this.config,
            container = _config.container,
            useTransform = _config.useTransform;

        _this.containerWidth = container.offsetWidth;
        _this.containerHeight = container.offsetHeight;
        _this.containerOffset = (0, _changlinWdtools.offset)(container);
        if (!useTransform && container.style.position === '') {
            (0, _changlinWdtools.css)(container, 'position', 'relative');
        }
        (0, _changlinWdtools.css)(container, 'overflow', 'hidden');
    };

    this.setWrapper = function () {
        if (!_this.config.useTransform) {
            (0, _changlinWdtools.css)(_this.wrapper, 'position', 'absolute');
        }
    };

    this.eventListen = function () {
        var add = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        var method = void 0;
        if (add) {
            method = _changlinWdtools.addEventListener;
        } else {
            method = _changlinWdtools.removeEventListener;
        }
        if (isMobile) {
            touchEvents.forEach(function (eventName) {
                return method(_this.wrapper, eventName, _this.handleEvent);
            });
        } else {
            method(_this.wrapper, mouseEvents[0], _this.handleEvent);
            method(document, mouseEvents[2], _this.handleEvent);
            method(document, mouseEvents[1], _this.handleEvent);
        }
    };

    this.handleEvent = function (e) {
        var events = isMobile ? touchEvents : mouseEvents;
        var eventPosition = isMobile ? e.touches[0] : e;
        var needPreventDefault = false;
        var p = void 0;
        if (eventPosition) {
            p = { clientX: eventPosition.clientX, clientY: eventPosition.clientY };
        }

        switch (e.type) {
            case events[0]:
                _this.cleanPoints();

                var _getComputedPosition = _this.getComputedPosition(),
                    x = _getComputedPosition.x,
                    y = _getComputedPosition.y;

                _this.x = x;
                _this.y = y;
                if (_this.animation) {
                    _this.animation.stop();
                    _this.animation = null;
                }
                _this.points.startPoint = p;
                _this.fingerDown = true;
                _this.time.startTime = new Date();
                break;
            case events[1]:
                if (_this.points.endPoint) {
                    _this.points.penultimatePoint = _this.points.endPoint;
                } else if (_this.points.startPoint) {
                    _this.points.penultimatePoint = _this.points.startPoint;
                }
                _this.points.endPoint = p;
                _this.time.penultimateTime = new Date();
                if (_this.fingerDown) {
                    _this.move();
                    needPreventDefault = true;
                }
                break;
            case events[2]:
                _this.fingerDown = false;
                _this.move(true);
                _this.cleanPoints();
                break;
            default:
                break;
        }

        for (var i = 0; i < _this.config.preventDefaultException.length; i++) {
            if (_this.config.preventDefaultException[i].reg.test(e.target[_this.config.preventDefaultException[i].prop])) {
                //  console.log(needPreventDefault);
                needPreventDefault = false;
                break;
            }
        }

        if (needPreventDefault) {
            e.preventDefault();
        }
    };

    this.cleanPoints = function () {
        _this.points.endPoint = null;
        _this.points.startPoint = null;
        _this.points.penultimatePoint = null;
    };

    this.move = function () {
        var isEnd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;


        var distanceX = void 0,
            distanceY = void 0,
            newX = void 0,
            newY = void 0;
        if (!_this.points.startPoint || !_this.points.endPoint) return;
        distanceX = _this.points.endPoint.clientX - _this.points.startPoint.clientX;
        distanceY = _this.points.endPoint.clientY - _this.points.startPoint.clientY;

        if (_this.config.scrollX) {
            newX = _this.x + distanceX;
        } else {
            newX = _this.x;
        }

        if (_this.config.scrollY) {
            newY = _this.y + distanceY;
        } else {
            newY = _this.y;
        }

        var temp = _this.moveCompute({ x: newX, y: newY });
        _this.setPosition(temp.x.resultValue, temp.y.resultValue);
        if (isEnd) {
            _this.x = temp.x.resultValue;
            _this.y = temp.y.resultValue;

            console.log('temp.x.compareResult&&temp.y.compareResult', temp.x.compareResult, temp.y.compareResult);

            if (temp.x.compareResult !== 0 || temp.y.compareResult !== 0) {} else {
                _this.addSlowDownAnimation();
            }
        }
    };

    this.addBounceAnimation = function () {};

    this.addSlowDownAnimation = function () {
        if (!(_this.points.endPoint && _this.points.penultimatePoint)) return;
        var distanceX = _this.points.endPoint.clientX - _this.points.penultimatePoint.clientX,
            distanceY = _this.points.endPoint.clientY - _this.points.penultimatePoint.clientY;

        var now = new Date();
        var time = now - _this.time.penultimateTime;
        if (time === 0) {
            time = (now.getMilliseconds() - _this.time.penultimateTime.getMilliseconds()) / 1000;
        }

        var nextX = _this.slowDownAnimationCompute({
            direction: 'x',
            start: _this.x,
            distance: distanceX,
            time: time,
            animationTime: _this.config.momentumTime,
            deceleration: _this.config.deceleration
        });

        var nextY = _this.slowDownAnimationCompute({
            direction: 'y',
            start: _this.y,
            distance: distanceY,
            time: time,
            animationTime: _this.config.momentumTime,
            deceleration: _this.config.deceleration
        });

        var destX = nextX.x.destination,
            destY = nextY.y.destination;

        var callback = function callback() {
            if (nextX.x.compareResult !== 0 || nextY.y.compareResult !== 0) {
                _this.scrollTo(nextX.x.compareResult !== 0 ? nextX.x.compareResult > 0 ? nextX.x.max : nextX.x.min : nextX.x.destination, nextY.reachEndding ? distanceY > 0 ? _this.config.allowableDistanceTop : -_this.wrapper.offsetHeight + _this.containerHeight - _this.config.allowableDistanceBottom : _this.y, {
                    time: _this.config.bounceTime,
                    easing: _changlinAnimate.transitionTimingFunction.easeIn
                });
            }
        };

        _this.scrollTo(destX, destY, { time: _this.config.momentumTime, callback: callback });
    };

    this.scrollTo = function (x, y, _ref) {
        var _ref$animation = _ref.animation,
            animation = _ref$animation === undefined ? true : _ref$animation,
            _ref$time = _ref.time,
            time = _ref$time === undefined ? 700 : _ref$time,
            _ref$callback = _ref.callback,
            callback = _ref$callback === undefined ? function () {} : _ref$callback,
            _ref$easing = _ref.easing,
            easing = _ref$easing === undefined ? _changlinAnimate.transitionTimingFunction.easeOut : _ref$easing;

        x = _this.config.scrollX ? x : _this.x;
        y = _this.config.scrollY ? y : _this.y;

        if (!animation) {
            _this.setPosition(x, y);
        }

        if (_this.config.useTransform) {
            _this.animation = (0, _changlinAnimate.createAnimation)({
                target: _this.wrapper,
                keyFrame: { 'transform': 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(0)' },
                duration: time,
                easing: easing,
                onComplete: function onComplete() {
                    _this.x = x;
                    _this.y = y;
                    callback();
                }
            });
        }
    };

    this.stop = function () {};

    this.setPosition = function (x, y) {
        //debugger
        if (_this.config.useTransform) {
            (0, _changlinWdtools.css)(_this.wrapper, 'transform', 'translateX(' + (x + 'px') + ') translateY(' + (y + 'px') + ') translateZ(0)');
        } else {
            _this.wrapper.style.left = x + 'px';
            _this.wrapper.style.top = y + 'px';
        }
    };

    this.slowDownAnimationCompute = function (_ref2) {
        var start = _ref2.start,
            distance = _ref2.distance,
            time = _ref2.time,
            animationTime = _ref2.animationTime,
            deceleration = _ref2.deceleration,
            direction = _ref2.direction;

        var destination = void 0,
            speed = distance / time;
        destination = start + speed * animationTime / 2 * deceleration;
        var temp = _this.rangeChecking({ direction: destination });
        switch (temp[direction].compareResult) {
            case 2:
                destination = temp[direction].allowMax;
                break;
            case -2:
                destination = temp[direction].allowMin;
                break;
        }
        temp[direction].destination = destination;
        return temp;
    };

    this.moveCompute = function (_ref3) {
        var x = _ref3.x,
            y = _ref3.y;

        var temp = _this.rangeChecking({ x: x, y: y });

        [temp.x, temp.y].forEach(function (n) {
            if (n) {
                switch (n.compareResult) {
                    case 0:
                        n.resultValue = n.value;
                        break;
                    case 1:
                    case 2:
                        n.resultValue = (n.value - n.max) / 3 + n.max;
                        break;
                    case -1:
                    case -2:
                        n.resultValue = n.min - (n.min - n.value) / 3;
                        break;
                    default:
                        break;
                }
            }
        });

        return temp;
    };

    this.rangeChecking = function (_ref4) {
        var _ref4$x = _ref4.x,
            x = _ref4$x === undefined ? null : _ref4$x,
            _ref4$y = _ref4.y,
            y = _ref4$y === undefined ? null : _ref4$y;

        var result = {};
        if (x !== null) {
            result.x = {
                value: x,
                compareResult: 0,
                max: _this.config.allowableDistanceLeft,
                min: -_this.wrapper.offsetWidth + _this.containerWidth,
                allowMax: _this.config.allowableDistanceLeft + _this.config.bounceDistanceLeft,
                allowMin: -_this.wrapper.offsetWidth + _this.containerWidth - _this.config.allowableDistanceRight
            };
        }
        if (y !== null) {
            result.y = {
                value: y,
                max: _this.config.allowableDistanceTop,
                min: -_this.wrapper.offsetHeight + _this.containerHeight,
                compareResult: 0,
                allowMax: _this.config.allowableDistanceTop + _this.config.bounceDistanceTop,
                allowMin: -_this.wrapper.offsetHeight + _this.containerHeight - _this.config.allowableDistanceBottom
            };
        }

        [result.x, result.y].forEach(function (n) {
            if (n) {
                if (n.value <= n.max && n.value >= n.min) {
                    n.compareResult = 0;
                } else if (n.value > n.max && n.value <= n.allowMax) {
                    n.compareResult = 1;
                } else if (n.value > n.allowMax) {
                    n.compareResult = 2;
                } else if (n.value < n.min && n.value >= n.allowMin) {
                    n.compareResult = -1;
                } else if (n.value < n.allowMin) {
                    n.compareResult = -2;
                }
            }
        });

        return result;
    };

    this.getComputedPosition = function () {
        var currentStyle = window.getComputedStyle(_this.wrapper, null),
            x = void 0,
            y = void 0,
            matrix = void 0;

        if (_this.config.useTransform) {
            matrix = currentStyle[(0, _changlinWdtools.cssPrefix)('transform')].split(')')[0].split(', ');
            x = +(matrix[12] || matrix[4]);
            y = +(matrix[13] || matrix[5]);
        } else {
            x = parseInt(currentStyle.left);
            y = parseInt(currentStyle.top);
        }

        return {
            x: x,
            y: y
        };
    };
};