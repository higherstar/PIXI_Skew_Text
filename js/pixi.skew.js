Kinetic = {};

Kinetic.Transform = function (m) {
    this.m = (m && m.slice()) || [1, 0, 0, 1, 0, 0];
};

Kinetic.Transform.prototype = {
    copy: function () {
        return new Kinetic.Transform(this.m);
    },
    point: function (p) {
        var m = this.m;
        return {
            x: m[0] * p.x + m[2] * p.y + m[4],
            y: m[1] * p.x + m[3] * p.y + m[5]
        };
    },
    translate: function (x, y) {
        this.m[4] += this.m[0] * x + this.m[2] * y;
        this.m[5] += this.m[1] * x + this.m[3] * y;
        return this;
    },
    scale: function (sx, sy) {
        this.m[0] *= sx;
        this.m[1] *= sx;
        this.m[2] *= sy;
        this.m[3] *= sy;
        return this;
    },
    rotate: function (rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var m11 = this.m[0] * c + this.m[2] * s;
        var m12 = this.m[1] * c + this.m[3] * s;
        var m21 = this.m[0] * -s + this.m[2] * c;
        var m22 = this.m[1] * -s + this.m[3] * c;
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        return this;
    },
    getTranslation: function () {
        return {
            x: this.m[4],
            y: this.m[5]
        };
    },
    skew: function (sx, sy) {
        var m11 = this.m[0] + this.m[2] * sy;
        var m12 = this.m[1] + this.m[3] * sy;
        var m21 = this.m[2] + this.m[0] * sx;
        var m22 = this.m[3] + this.m[1] * sx;
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        return this;
    },
    multiply: function (matrix) {
        var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
        var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];

        var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
        var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];

        var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
        var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];

        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        this.m[4] = dx;
        this.m[5] = dy;
        return this;
    },
    invert: function () {
        var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
        var m0 = this.m[3] * d;
        var m1 = -this.m[1] * d;
        var m2 = -this.m[2] * d;
        var m3 = this.m[0] * d;
        var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
        var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
        this.m[0] = m0;
        this.m[1] = m1;
        this.m[2] = m2;
        this.m[3] = m3;
        this.m[4] = m4;
        this.m[5] = m5;
        return this;
    },
    getMatrix: function () {
        return this.m;
    },
    setAbsolutePosition: function (x, y) {
        var m0 = this.m[0],
            m1 = this.m[1],
            m2 = this.m[2],
            m3 = this.m[3],
            m4 = this.m[4],
            m5 = this.m[5],
            yt = ((m0 * (y - m5)) - (m1 * (x - m4))) / ((m0 * m3) - (m1 * m2)),
            xt = (x - m4 - (m2 * yt)) / m0;

        return this.translate(xt, yt);
    }
};

(function () {
    PIXI.SkewableGraphics = function () {
        PIXI.Graphics.call(this);

        this.skew = new PIXI.Point(0, 0);
    };

})();
PIXI.SkewableGraphics.prototype = Object.create(PIXI.Graphics.prototype);
PIXI.SkewableGraphics.prototype.constructor = PIXI.SkewableGraphics;

(function () {
    PIXI.SkewableContainer = function () {
        PIXI.DisplayObjectContainer.call(this);

        this.skew = new PIXI.Point(0, 0);
    };

})();
PIXI.SkewableContainer.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
PIXI.SkewableContainer.prototype.constructor = PIXI.SkewableContainer;

PIXI.DisplayObject.prototype.updateTransform = function () {
    // create some matrix refs for easy access
    var pt = this.parent.worldTransform;
    var wt = this.worldTransform;

    var m = new Kinetic.Transform(),
        x = this.position.x,
        y = this.position.y,
        rotation = this.rotation,
        scaleX = this.scale.x,
        scaleY = this.scale.y,
        skewX = this.skew.x,
        skewY = this.skew.y,
        offsetX = this.pivot.x,
        offsetY = this.pivot.y;

    if (x !== 0 || y !== 0) {
        m.translate(x, y);
    }
    if (rotation !== 0) {
        m.rotate(rotation);
    }
    if (skewX !== 0 || skewY !== 0) {
        m.skew(skewX, skewY);
    }
    if (scaleX !== 1 || scaleY !== 1) {
        m.scale(scaleX, scaleY);
    }
    if (offsetX !== 0 || offsetY !== 0) {
        m.translate(-1 * offsetX, -1 * offsetY);
    }

    var lt = m.getMatrix();

    // concat the parent matrix with the objects transform.
    wt.a = lt[0] * pt.a + lt[1] * pt.c;
    wt.b = lt[0] * pt.b + lt[1] * pt.d;
    wt.c = lt[2] * pt.a + lt[3] * pt.c;
    wt.d = lt[2] * pt.b + lt[3] * pt.d;
    wt.tx = lt[4] * pt.a + lt[5] * pt.c + pt.tx;
    wt.ty = lt[4] * pt.b + lt[5] * pt.d + pt.ty;

    // multiply the alphas..
    this.worldAlpha = this.alpha * this.parent.worldAlpha;
};

PIXI.DisplayObject.prototype.displayObjectUpdateTransform = PIXI.DisplayObject.prototype.updateTransform;
