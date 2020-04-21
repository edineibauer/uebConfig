class TouchTrack {
    constructor($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements) {
        this.$el = $el;
        this.directionTrackVertical = !0;
        this.folga = isNumber(folga) ? folga : 10;
        this.startLeft = 0;
        this.startUp = 0;
        this.maxDown = 0;
        this.maxLeft = 0;
        this.minBound = 70;
        this.moviment = -1;
        this.tracking = !1;
        this.ignoreQueryElements = ignoreQueryElements || [];
        this.translateY = $el.css("transform") === "none" ? 0 : parseInt($el.css("transform").replace("matrix(1, 0, 0, 1, 0, ", "").replace(")", ""));
        this.translateYStart = null;
        this.distancia = distancia;
        this.distanciaAlvo = distanciaAlvo;
        this.funcao = funcao;
        this.lastMoviment = {
            up: -1,
            left: -1
        };

        this.events();
    }

    setDirectionHorizontal() {
        this.directionTrackVertical = !1;
    }

    setDistancia(d) {
        this.distancia = d;
        return this;
    }

    setDistanciaStart(d) {
        this.translateYStart = d;
        if (!this.$el.hasClass("touchOpen"))
            touchElements.menu.moveToStart();
        return this;
    }

    setDistanciaTarget(d) {
        this.distanciaAlvo = d;
        if (this.$el.hasClass("touchOpen"))
            touchElements.menu.moveToTarget();
        return this;
    }

    stopMove(index) {
        this.tracking = !1;
        return this.$el.eq(index).removeClass('touching');
    }

    moveToStart(index) {
        this.moviment = -1;
        if (this.translateYStart === null) {
            this.translateYStart = this.translateY;
            this.distanciaAlvo += this.translateYStart;
        }
        this.stopMove(index).removeClass("touchOpen").css({transform: "translate" + (this.directionTrackVertical ? "Y" : "X") + "(" + this.translateYStart + "px)"});
        return this;
    }

    moveToTarget(index) {
        this.moviment = -1;
        if (this.translateYStart === null) {
            this.translateYStart = this.translateY;
            this.distanciaAlvo += this.translateYStart;
        }
        this.stopMove(index).addClass("touchOpen").css({transform: "translate" + (this.directionTrackVertical ? "Y" : "X") + "(" + this.distanciaAlvo + "px)"});
        return this;
    }

    setFuncao(f) {
        this.funcao = f;
        return this;
    }

    events() {
        let $this = this;
        this.$el.addClass("no-select");
        this.$el.each(function (index, el) {

            el.addEventListener("touchstart", (evt) => {

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

                let touches = evt.changedTouches[0];
                $this.tracking = !0;
                $this.moviment = -1;

                if ($this.directionTrackVertical) {
                    $this.startUp = touches.pageY;
                    $this.maxDown = window.innerHeight - $this.minBound - $this.startUp;
                } else {
                    $this.startLeft = touches.pageX;
                    $this.maxLeft = window.innerWidth - $this.minBound - $this.startLeft;
                }

                $this.translateY = $(el).css("transform");
                $this.translateY = $this.translateY === "none" ? 0 : parseInt($this.directionTrackVertical ? $this.translateY.replace("matrix(1, 0, 0, 1, 0, ", "").replace(")", "") : $this.translateY.replace("matrix(1, 0, 0, 1, ", "").replace(", )", ""));
                if ($this.translateYStart === null) {
                    $this.translateYStart = $this.translateY;
                    $this.distanciaAlvo += $this.translateYStart;
                }

                $this.lastMoviment = {
                    up: -1,
                    left: -1
                };

                $(el).addClass('touching');
            }, false);

            el.addEventListener("touchmove", evt => {
                if ($this.tracking) {
                    evt.preventDefault();

                    let touches = evt.changedTouches[0];

                    if ($this.directionTrackVertical) {
                        let up = touches.pageY - $this.startUp;

                        if ($(el).hasClass("touchOpen") && up < ($this.folga * -1))
                            up = $this.folga * -1;
                        else if (!$(el).hasClass("touchOpen") && up > $this.folga)
                            up = $this.folga;

                        if (up < 0 && up < (($this.startUp - $this.minBound) * -1))
                            up = ($this.startUp - $this.minBound) * -1;
                        else if (up > 0 && up > $this.maxDown)
                            up = $this.maxDown;

                        $(el).css("transform", "translateY(" + ($this.translateY + up) + "px)");
                    } else {
                        let left = touches.pageX - $this.startLeft;

                        if ($(el).hasClass("touchOpen") && left < ($this.folga * -1))
                            left = $this.folga * -1;
                        else if (!$(el).hasClass("touchOpen") && left > $this.folga)
                            left = $this.folga;

                        if (left < 0 && left < (($this.startLeft - $this.minBound) * -1))
                            left = ($this.startLeft - $this.minBound) * -1;
                        else if (left > 0 && left > $this.maxLeft)
                            left = $this.maxLeft;

                        $(el).css("transform", "translateX(" + ($this.translateY + left) + "px)");
                    }
                }
            }, false);

            el.addEventListener("touchend", evt => {
                if ($this.tracking) {
                    let touches = evt.changedTouches[0];

                    if ($this.directionTrackVertical) {
                        let up = $this.startUp - touches.pageY;

                        if (!$(el).hasClass("touchOpen")) {
                            if ($this.distancia < up) {
                                $this.moveToTarget(index);
                                if (typeof $this.funcao === "function")
                                    $this.funcao($this, $(el));
                            } else {
                                $this.stopMove(index).css({transform: "translateY(" + $this.translateY + "px)"});
                            }

                        } else {
                            if (($this.distancia * -1) > up)
                                $this.moveToStart(index);
                            else
                                $this.stopMove(index).css({transform: "translateY(" + $this.translateY + "px)"});
                        }
                    } else {
                        let left = $this.startLeft - touches.pageX;

                        if (!$(el).hasClass("touchOpen")) {
                            if ($this.distancia < left) {
                                $this.moveToTarget(index);
                                if (typeof $this.funcao === "function")
                                    $this.funcao($this, $(el));
                            } else {
                                $this.stopMove(index).css({transform: "translateX(" + $this.translateY + "px)"});
                            }

                        } else {
                            if (($this.distancia * -1) > left)
                                $this.moveToStart(index);
                            else
                                $this.stopMove(index).css({transform: "translateX(" + $this.translateY + "px)"});
                        }
                    }
                }
            }, false);

            el.addEventListener("touchcancel", () => {
                $this.stopMove(index);
            }, false);

            el.addEventListener("touchleave", () => {
                $this.stopMove(index);
            }, false);
        });
    }
}

class TouchUp extends TouchTrack {
    constructor($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements) {
        super($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements);
    }
}

/*class TouchDown extends TouchTrack {
    constructor($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements) {
        super($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements);
    }
}

class TouchRigth extends TouchTrack {
    constructor($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements) {
        super($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements);
        this.setDirectionHorizontal();
    }
}*/

class TouchLeft extends TouchTrack {
    constructor($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements) {
        super($el, distanciaAlvo, distancia, folga, funcao, ignoreQueryElements);
        this.setDirectionHorizontal();
    }
}