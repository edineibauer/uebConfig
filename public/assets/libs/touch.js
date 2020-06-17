class TouchTrack {
    constructor($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements) {
        this.$el = $el;
        this.isTouchCapable = 'ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch || navigator.maxTouchPoints > 0 || window.navigator.msMaxTouchPoints > 0;
        this.directionTrack = "up";
        this.directionTrackVertical = !0;
        this.folga = isNumber(folga) ? folga : 10;
        this.startLeft = 0;
        this.startUp = 0;
        this.maxDown = 0;
        this.maxLeft = 0;
        this.minBound = 70;
        this.tracking = !1;
        this.ignoreQueryElements = ignoreQueryElements || [];
        this.translateY = $el.css("transform") === "none" ? 0 : parseInt($el.css("transform").replace("matrix(1, 0, 0, 1, 0, ", "").replace(")", ""));
        this.translateYStart = null;
        this.distancia = distancia;
        this.distanciaAlvo = distanciaAlvo;
        this.funcao = funcao;
        this.funcaob = null;

        this.$el.addClass("touchElement");

        this.events();
    }

    setDirection(type) {
        this.directionTrack = ["up", "down", "left", "right", "horizontal", "vertical"].indexOf(type) > -1 ? type : "up";
        this.directionTrackVertical = ["up", "down", "vertical"].indexOf(type) > -1;
    }

    setDistancia(d) {
        this.distancia = d;
        return this;
    }

    setDistanciaStart(d, index) {
        let $this = this;
        $this.translateYStart = d;

        if (typeof index === "undefined") {
            $this.$el.each(function (i, el) {
                if (!$(el).hasClass("touchOpen"))
                    $this.moveToStart(i);
            });
        } else if (!$this.$el.eq(index).hasClass("touchOpen")) {
            $this.moveToStart(index);
        }

        return this
    }

    setDistanciaTarget(d, index) {
        let $this = this;
        $this.distanciaAlvo = d;

        if (typeof index === "undefined") {
            $this.$el.each(function (i, el) {
                if ($this.$el.hasClass("touchOpen"))
                    $this.moveToStart(i);
            });
        } else if ($this.$el.eq(index).hasClass("touchOpen")) {
            $this.moveToTarget(index);
        }

        return this
    }

    stopMove(index) {
        this.tracking = !1;
        return this.$el.eq(index).removeClass('touching');
    }

    moveToStart(index) {
        if (this.translateYStart === null) {
            this.translateYStart = this.translateY;
            this.distanciaAlvo += this.translateYStart
        }

        let $this = this;
        if (typeof index === "undefined") {
            $this.$el.each(function (i, el) {
                $this.moveToStart(i);
            });
        } else {
            this.stopMove(index).removeClass("touchOpen").css({transform: "translate" + (this.directionTrackVertical ? "Y" : "X") + "(" + this.translateYStart + "px)"});
        }

        return this
    }

    moveToTarget(index) {
        if (this.translateYStart === null) {
            this.translateYStart = this.translateY;
            this.distanciaAlvo += this.translateYStart
        }

        let $this = this;
        if (typeof index === "undefined") {
            $this.$el.each(function (i, el) {
                $this.moveToTarget(i);
            });
        } else {
            this.stopMove(index).addClass("touchOpen").css({transform: "translate" + (this.directionTrackVertical ? "Y" : "X") + "(" + this.distanciaAlvo + "px)"});
        }

        return this
    }

    setFuncaoToStart(f) {
        this.funcaob = f;
        return this;
    }

    setFuncaoToTarget(f) {
        this.funcao = f;
        return this;
    }

    setFuncao(f) {
        return this.setFuncaoToTarget(f);
    }

    events() {
        let $this = this;
        $this.$el.addClass("no-select").each(function (index, el) {

            if ($this.isTouchCapable) {
                el.addEventListener("touchstart", evt => {
                    $this.eventTouchStart(evt);
                }, !1);

                el.addEventListener("touchmove", evt => {
                    $this.eventTouchMove(evt);
                }, !1);

                el.addEventListener("touchend", evt => {
                    $this.eventTouchEnd(evt, index);
                }, !1);

                el.addEventListener("touchcancel", () => {
                    $this.stopMove(index);
                }, !1);

                el.addEventListener("touchleave", () => {
                    $this.stopMove(index);
                }, !1);

            } else {
                el.addEventListener("mousedown", evt => {
                    $this.eventTouchStart(evt);
                }, !1);

                el.addEventListener("mousemove", evt => {
                    $this.eventTouchMove(evt);
                }, !1);

                el.addEventListener("mouseup", evt => {
                    $this.eventTouchEnd(evt, index);
                }, !1);

                el.addEventListener("mouseleave", () => {
                    $this.stopMove(index);
                }, !1);
            }
        });
    }

    eventTouchStart(evt) {
        let $this = this;
        let ignore = !1;
        let $target = $(evt.target);
        for (let i in $this.ignoreQueryElements) {
            if ($target.closest($this.ignoreQueryElements[i]).length) {
                ignore = !0;
                break;

            } else if (/^#/.test($this.ignoreQueryElements[i])) {
                if ($target.attr("id") === $this.ignoreQueryElements[i].replace("#", "")) {
                    ignore = !0;
                    break;
                }
            } else if (/^\./.test($this.ignoreQueryElements[i])) {
                if ($target.hasClass($this.ignoreQueryElements[i].replace(".", ""))) {
                    ignore = !0;
                    break;
                }
            }
        }

        if (ignore)
            return;

        $target = $(evt.target).hasClass("touchElement") ? $(evt.target) : $(evt.target).closest(".touchElement");
        let touches = $this.isTouchCapable ? evt.changedTouches[0] : evt;
        $this.tracking = !0;

        if ($this.directionTrackVertical) {
            $this.startUp = touches.pageY;
            $this.maxDown = window.innerHeight - $this.minBound - $this.startUp;
        } else {
            $this.startLeft = touches.pageX;
            $this.maxLeft = window.innerWidth - $this.minBound - $this.startLeft;
        }

        $this.translateY = $target.css("transform");
        $this.translateY = $this.translateY === "none" ? 0 : parseInt($this.directionTrackVertical ? $this.translateY.replace("matrix(1, 0, 0, 1, 0, ", "").replace(")", "") : $this.translateY.replace("matrix(1, 0, 0, 1, ", "").replace(", )", ""));
        if ($this.translateYStart === null) {
            $this.translateYStart = $this.translateY;
            $this.distanciaAlvo += $this.translateYStart;
        }

        $target.addClass('touching');
    }

    eventTouchMove(evt) {
        let $this = this;
        let $target = $(evt.target).hasClass("touchElement") ? $(evt.target) : $(evt.target).closest(".touchElement");
        if ($this.tracking) {

            //just prevent if is vertical
            if ($this.directionTrackVertical)
                evt.preventDefault();

            let touches = $this.isTouchCapable ? evt.changedTouches[0] : evt;

            if ($this.directionTrackVertical) {
                let up = touches.pageY - $this.startUp;

                /**
                 * Vertical
                 */
                if ($this.directionTrack === "vertical") {
                    if (up < 0 && up < (($this.startUp - $this.minBound) * -1))
                        up = ($this.startUp - $this.minBound) * -1;
                    else if (up > 0 && up > $this.maxDown)
                        up = $this.maxDown;

                    /**
                     * Down
                     */
                } else if ($this.directionTrack === "down") {
                    if (!$target.hasClass("touchOpen") && up < ($this.folga * -1))
                        up = $this.folga * -1;
                    else if ($target.hasClass("touchOpen") && up > $this.folga)
                        up = $this.folga;

                    if (up < 0 && up < (($this.startUp - $this.minBound) * -1))
                        up = ($this.startUp - $this.minBound) * -1;
                    else if (up > 0 && up > $this.maxDown)
                        up = $this.maxDown;

                    /**
                     * Up
                     */
                } else {
                    if (($target.hasClass("touchOpen") || $this.directionTrack === "right") && up < ($this.folga * -1))
                        up = $this.folga * -1;
                    else if (!$target.hasClass("touchOpen") && up > $this.folga)
                        up = $this.folga;

                    if (up < 0 && up < (($this.startUp - $this.minBound) * -1))
                        up = ($this.startUp - $this.minBound) * -1;
                    else if (up > 0 && up > $this.maxDown)
                        up = $this.maxDown;
                }

                $target.css("transform", "translateY(" + ($this.translateY + up) + "px)");

            } else {
                let left = touches.pageX - $this.startLeft;

                /**
                 * Horizontal
                 */
                if ($this.directionTrack === "horizontal") {
                    if (left < 0 && left < (($this.startLeft - $this.minBound) * -1))
                        left = ($this.startLeft - $this.minBound) * -1;
                    else if (left > 0 && left > $this.maxLeft)
                        left = $this.maxLeft;

                    /**
                     * Rigth
                     */
                } else if ($this.directionTrack === "right") {
                    if (!$target.hasClass("touchOpen") && left < ($this.folga * -1))
                        left = $this.folga * -1;
                    else if ($target.hasClass("touchOpen") && left > $this.folga)
                        left = $this.folga;

                    if (left < 0 && left < (($this.startLeft - $this.minBound) * -1))
                        left = ($this.startLeft - $this.minBound) * -1;
                    else if (left > 0 && left > $this.maxLeft)
                        left = $this.maxLeft;

                    /**
                     * Left
                     */
                } else {
                    if (($target.hasClass("touchOpen") || $this.directionTrack === "right") && left < ($this.folga * -1))
                        left = $this.folga * -1;
                    else if (!$target.hasClass("touchOpen") && left > $this.folga)
                        left = $this.folga;

                    if (left < 0 && left < (($this.startLeft - $this.minBound) * -1))
                        left = ($this.startLeft - $this.minBound) * -1;
                    else if (left > 0 && left > $this.maxLeft)
                        left = $this.maxLeft;
                }

                $target.css("transform", "translateX(" + ($this.translateY + left) + "px)");
            }
        }
    }

    eventTouchEnd(evt, index) {
        let $this = this;
        let $target = $(evt.target).hasClass("touchElement") ? $(evt.target) : $(evt.target).closest(".touchElement");
        if ($this.tracking) {
            let touches = $this.isTouchCapable ? evt.changedTouches[0] : evt;

            if ($this.directionTrackVertical) {

                /**
                 * Vertical (up and down)
                 */
                let up = $this.startUp - touches.pageY;

                if (!$target.hasClass("touchOpen")) {
                    let originalUp = up;
                    if (($this.directionTrack === "vertical" && up < 0) || $this.directionTrack === "down")
                        up *= -1;

                    if ($this.distancia < up) {

                        /**
                         * Permite fazer a ação para o target em ambos os lados
                         */
                        if ($this.directionTrack === "vertical" && ((originalUp > 0 && $this.distanciaAlvo > 0) || ($this.distanciaAlvo < 0 && originalUp < 0)))
                            $this.distanciaAlvo *= -1;

                        $this.moveToTarget(index);
                        if (typeof $this.funcao === "function")
                            $this.funcao($this, $target);
                    } else {
                        $this.stopMove(index).css({transform: "translateY(" + $this.translateY + "px)"});
                    }

                } else {
                    if (($this.directionTrack === "up" && $this.distancia * -1 > up) || ($this.directionTrack === "vertical" && (up > $this.distancia || up < $this.distancia)) || ($this.directionTrack === "down" && $this.distancia < up)) {
                        $this.moveToStart(index);

                        if (typeof $this.funcaob === "function")
                            $this.funcaob($this, $target);
                    } else {
                        $this.stopMove(index).css({transform: "translateY(" + $this.translateY + "px)"});
                    }
                }
            } else {

                /**
                 * Horizontal (left and right)
                 */
                let left = $this.startLeft - touches.pageX;

                if (!$target.hasClass("touchOpen")) {
                    let originalLeft = left;
                    if (($this.directionTrack === "horizontal" && left < 0) || $this.directionTrack === "right")
                        left *= -1;

                    if ($this.distancia < left) {

                        /**
                         * Permite fazer a ação para o target em ambos os lados
                         */
                        if ($this.directionTrack === "horizontal" && ((originalLeft > 0 && $this.distanciaAlvo > 0) || ($this.distanciaAlvo < 0 && originalLeft < 0)))
                            $this.distanciaAlvo *= -1;

                        $this.moveToTarget(index);
                        if (typeof $this.funcao === "function")
                            $this.funcao($this, $target);
                    } else {
                        $this.stopMove(index).css({transform: "translateX(" + $this.translateY + "px)"});
                    }

                } else {
                    if (($this.directionTrack === "left" && $this.distancia * -1 > left) || ($this.directionTrack === "horizontal" && (left > $this.distancia || left < $this.distancia)) || ($this.directionTrack === "right" && $this.distancia < left)) {
                        $this.moveToStart(index);

                        if (typeof $this.funcaob === "function")
                            $this.funcaob($this, $target);
                    } else {
                        $this.stopMove(index).css({transform: "translateX(" + $this.translateY + "px)"});
                    }
                }
            }
        }
    }
}

class TouchUp extends TouchTrack {
    constructor($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements) {
        super($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements);
        this.setDirection("up");
    }
}

class TouchDown extends TouchTrack {
    constructor($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements) {
        super($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements);
        this.setDirection("down");
    }
}

class TouchRight extends TouchTrack {
    constructor($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements) {
        super($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements);
        this.setDirection("right");
    }
}

class TouchLeft extends TouchTrack {
    constructor($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements) {
        super($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements);
        this.setDirection("left");
    }
}

class TouchHorizontal extends TouchTrack {
    constructor($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements) {
        super($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements);
        this.setDirection("horizontal");
    }
}

class TouchVertical extends TouchTrack {
    constructor($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements) {
        super($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements);
        this.setDirection("vertical");
    }
}