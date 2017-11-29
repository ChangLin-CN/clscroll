import {Observer} from 'changlin-observer'
import {isObject, isString, isUndefined, isNumber, isDOM, whatIs, extend} from 'changlin-util'
import {findEL, offset, css, isIOS, isAndroid, addEventListener, removeEventListener, cssPrefix,cancelAnimationFrame} from 'changlin-wdtools'
import {createAnimation, transitionTimingFunction} from 'changlin-animate'
import {throwError} from "./throwerror";

//!!!wdtools 添加此变量
const hasTransform = true;

const touchEvents = ['touchstart', 'touchmove', 'touchend'];
const mouseEvents = ['mousedown', 'mousemove', 'mouseup'];

const isMobile = (isIOS() || isAndroid());

//const isMobile=false;


export class CLScroll {
    config = {
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
        preventDefaultException: [{prop: 'tagName', reg: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/}]
    }
    wrapper = null
    containerOffset = null
    containerWidth = null
    containerHeight = null

    time = {
        startTime: null,
        penultimateTime: null
    }

    animation = null

    points = {
        startPoint: null,
        endPoint: null,
        penultimatePoint: null
    }

    x = 0

    y = 0

    timer = null

    fingerDown = false

    constructor(config) {
        if (!isObject(config)) throwError(`config should be object but got ${whatIs(config)}`);
        extend(this.config, config);
        this.init();
        Observer.call(this);
    }

    init = () => {
        let {config} = this;
        config.container = findEL(config.container);
        if (!config.container) throwError('no container');
        if (!config.container.children.length) throwError('no wrapper');
        this.wrapper = config.container.children[0];
        this.getAndSetContainer();
        this.setWrapper();
        this.eventListen();
        this.x = config.startX;
        this.y = config.startY;
        this.setPosition(config.startX, config.startY);
    }

    getAndSetContainer = () => {
        const {container, useTransform} = this.config;
        this.containerWidth = container.offsetWidth;
        this.containerHeight = container.offsetHeight;
        this.containerOffset = offset(container);
        if (!useTransform && container.style.position === '') {
            css(container, 'position', 'relative')
        }
        css(container, 'overflow', 'hidden')
    }

    setWrapper = () => {
        if (!this.config.useTransform) {
            css(this.wrapper, 'position', 'absolute')
        }
    }

    eventListen = (add = true) => {
        let method;
        if (add) {
            method = addEventListener
        } else {
            method = removeEventListener
        }
        if (isMobile) {
            touchEvents.forEach(eventName => method(this.wrapper, eventName, this.handleEvent))
        } else {
            method(this.wrapper, mouseEvents[0], this.handleEvent);
            method(document, mouseEvents[2], this.handleEvent);
            method(document, mouseEvents[1], this.handleEvent);
        }
    }

    destroy=()=>{
        this.eventListen(false);
        if(this.animation){
            this.animation.stop();
        }
        cancelAnimationFrame(this.timer);
        this.trigger('destroy');
    }

    handleEvent = (e) => {
        let events = isMobile ? touchEvents : mouseEvents;
        let eventPosition = isMobile ? e.touches[0] : e;
        let needPreventDefault = false;
        let p;
        if (eventPosition) {
            p = {clientX: eventPosition.clientX, clientY: eventPosition.clientY};
        }

        switch (e.type) {
            case events[0]:
                this.cleanPoints();
                let {x, y} = this.getComputedPosition();
                this.x = x;
                this.y = y;
                if (this.animation) {
                    this.animation.stop();
                    this.animation = null;
                }
                this.points.startPoint = p;
                this.fingerDown = true;
                this.time.startTime = new Date();
                this.trigger('scrollStart',{x,y});
                break;
            case events[1]:
                if (this.points.endPoint) {
                    this.points.penultimatePoint = this.points.endPoint
                } else if (this.points.startPoint) {
                    this.points.penultimatePoint = this.points.startPoint
                }
                this.points.endPoint = p;
                this.time.penultimateTime = new Date();
                if (this.fingerDown) {
                    this.move();
                    needPreventDefault = true;
                }
                break;
            case events[2]:
                this.fingerDown = false;
                this.move(true);
                this.cleanPoints();
                break;
            default:
                break;
        }


        for (let i = 0; i < this.config.preventDefaultException.length; i++) {
            if (this.config.preventDefaultException[i].reg.test(e.target[this.config.preventDefaultException[i].prop])) {
                //  console.log(needPreventDefault);
                needPreventDefault = false;
                break;
            }
        }

        if (needPreventDefault) {
            e.preventDefault();
        }

    }

    cleanPoints = () => {
        this.points.endPoint = null;
        this.points.startPoint = null;
        this.points.penultimatePoint = null;
    }

    /**
     *
     * @param isEnd
     */
    move = (isEnd = false) => {

        let distanceX, distanceY, newX, newY;
        if (!this.points.startPoint || !this.points.endPoint) return;
        distanceX = this.points.endPoint.clientX - this.points.startPoint.clientX;
        distanceY = this.points.endPoint.clientY - this.points.startPoint.clientY;

        if (this.config.scrollX) {
            newX = this.x + distanceX;
        } else {
            newX = this.x;
        }

        if (this.config.scrollY) {
            newY = this.y + distanceY;
        } else {
            newY = this.y;
        }

        let temp = this.moveCompute({x: newX, y: newY});
        this.setPosition(temp.x.resultValue, temp.y.resultValue);
        this.trigger('scroll',{x:temp.x.resultValue,y:temp.y.resultValue});
        if (isEnd) {
            this.x = temp.x.resultValue;
            this.y = temp.y.resultValue;

            //console.log('temp.x.compareResult&&temp.y.compareResult', temp.x.compareResult, temp.y.compareResult);

            if (temp.x.compareResult !== 0 || temp.y.compareResult !== 0) {
                this.scrollTo(
                    temp.x.compareResult !== 0 ? (temp.x.compareResult > 0 ? temp.x.max : temp.x.min) : temp.x.resultValue,
                    temp.y.compareResult !== 0 ? (temp.y.compareResult > 0 ? temp.y.max : temp.y.min) : temp.y.resultValue,
                    {
                        time: this.config.bounceTime,
                        easing: transitionTimingFunction.easeIn
                    }
                )
            } else {
                this.addSlowDownAnimation();
            }

        }
    }


    addBounceAnimation = () => {

    }

    addSlowDownAnimation = () => {
        if (!(this.points.endPoint && this.points.penultimatePoint)) return;
        const distanceX = this.points.endPoint.clientX - this.points.penultimatePoint.clientX,
            distanceY = this.points.endPoint.clientY - this.points.penultimatePoint.clientY;

        const now = new Date();
        let time = now - this.time.penultimateTime;
        if (time === 0) {
            time = (now.getMilliseconds() - this.time.penultimateTime.getMilliseconds()) / 1000
        }

        const nextX = this.slowDownAnimationCompute({
            direction: 'x',
            start: this.x,
            distance: distanceX,
            time,
            animationTime: this.config.momentumTime,
            deceleration: this.config.deceleration
        });

        const nextY = this.slowDownAnimationCompute({
            direction: 'y',
            start: this.y,
            distance: distanceY,
            time,
            animationTime: this.config.momentumTime,
            deceleration: this.config.deceleration
        });


        const destX = nextX.x.destination,
            destY = nextY.y.destination;

        let callback = () => {
            if (nextX.x.compareResult !== 0 || nextY.y.compareResult !== 0) {
                this.scrollTo(
                    nextX.x.compareResult !== 0 ? (nextX.x.compareResult > 0 ? nextX.x.max : nextX.x.min) : nextX.x.destination,
                    nextY.y.compareResult !== 0 ? (nextY.y.compareResult > 0 ? nextY.y.max : nextY.y.min) : nextY.y.destination,
                    {
                        time: this.config.bounceTime,
                        easing: transitionTimingFunction.easeIn
                    }
                )
            }
        }

        this.scrollTo(destX, destY, {time: this.config.momentumTime, callback});

    }

    scrollTo = (x, y, {
        animation = true, time = 700, callback = () => {
        }, easing = transitionTimingFunction.easeOut
    }) => {
        x = this.config.scrollX ? x : this.x;
        y = this.config.scrollY ? y : this.y;

        if (!animation) {
            this.setPosition(x, y)
        }

        if (this.config.useTransform) {
            this.animation = createAnimation({
                target: this.wrapper,
                keyFrame: {'transform': `translateX(${x}px) translateY(${y}px) translateZ(0)`},
                duration: time,
                easing: easing,
                onComplete: () => {
                    this.x = x;
                    this.y = y;
                    callback()
                }
            });
        }
    }

    stop = () => {

    }

    setPosition = (x, y) => {
        //debugger
        if (this.config.useTransform) {
            css(this.wrapper, 'transform', `translateX(${x + 'px'}) translateY(${y + 'px'}) translateZ(0)`)
        } else {
            this.wrapper.style.left = x + 'px';
            this.wrapper.style.top = y + 'px';
        }
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
    slowDownAnimationCompute = ({start, distance, time, animationTime, deceleration, direction}) => {
        let destination, speed = distance / time;
        destination = start + speed * animationTime / 2 * deceleration;
        const temp = this.rangeChecking({[direction]: destination});
        //debugger
        switch (temp[direction].compareResult) {
            case 2:
                destination = temp[direction].allowMax;
                break;
            case -2:
                destination = temp[direction].allowMin;
                break;
        }
        temp[direction].destination = destination;
        return temp
    }


    /**
     *
     * @param x
     * @param y
     * @returns {{x?: Object, y?: Object}}
     */
    moveCompute = ({x, y}) => {
        let temp = this.rangeChecking({x, y});

        [temp.x, temp.y].forEach(n => {
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

        return temp
    }


    /**
     *
     * @param x
     * @param y
     * @returns {{x?:object,y?:object}}
     */
    rangeChecking = ({x = null, y = null}) => {
        let result = {};
        if (x !== null) {
            result.x = {
                value: x,
                compareResult: 0,
                max: this.config.allowableDistanceLeft,
                min: -this.wrapper.offsetWidth + this.containerWidth - this.config.allowableDistanceRight,
                allowMax: this.config.allowableDistanceLeft + this.config.bounceDistanceLeft,
                allowMin: -this.wrapper.offsetWidth + this.containerWidth - this.config.allowableDistanceRight - this.config.bounceDistanceRight,
            }
        }
        if (y !== null) {
            result.y = {
                value: y,
                max: this.config.allowableDistanceTop,
                min: -this.wrapper.offsetHeight + this.containerHeight - this.config.allowableDistanceBottom,
                compareResult: 0,
                allowMax: this.config.allowableDistanceTop + this.config.bounceDistanceTop,
                allowMin: -this.wrapper.offsetHeight + this.containerHeight - this.config.allowableDistanceBottom - this.config.bounceDistanceBottom,
            }
        }

        [result.x, result.y].forEach(n => {
            if (n) {
                if (n.value <= n.max && n.value >= n.min) {
                    n.compareResult = 0;
                } else if (n.value > n.max && n.value <= n.allowMax) {
                    n.compareResult = 1;
                } else if (n.value > n.allowMax) {
                    n.compareResult = 2
                } else if (n.value < n.min && n.value >= n.allowMin) {
                    n.compareResult = -1;
                } else if (n.value < n.allowMin) {
                    n.compareResult = -2;
                }
            }
        });

        return result

    }

    getComputedPosition = () => {
        let currentStyle = window.getComputedStyle(this.wrapper, null), x, y, matrix;

        if (this.config.useTransform) {
            matrix = currentStyle[cssPrefix('transform')].split(')')[0].split(', ')
            x = +(matrix[12] || matrix[4]);
            y = +(matrix[13] || matrix[5]);
        } else {
            x = parseInt(currentStyle.left);
            y = parseInt(currentStyle.top);
        }

        return {
            x,
            y
        }
    }
}
