/*
 * popcorn.js version 1.5.6
 * http://popcornjs.org
 *
 * Copyright 2011, Mozilla Foundation
 * Licensed under the MIT license
 */

(function(p, e) {
    function l(a) {
        C.put.call(this, a)
    }

    function d(a) {
        this.parent = a;
        this.byStart = [{
            start: -1,
            end: -1
        }];
        this.byEnd = [{
            start: -1,
            end: -1
        }];
        this.animating = [];
        this.endIndex = this.startIndex = 0;
        this.previousUpdateTime = -1;
        this.count = 1
    }

    function b(a, c) {
        return function() {
            if (f.plugin.debug) return a.apply(this, arguments);
            try {
                return a.apply(this, arguments)
            } catch (n) {
                f.plugin.errors.push({
                    plugin: c,
                    thrown: n,
                    source: a.toString()
                });
                this.emit("pluginerror", f.plugin.errors)
            }
        }
    }
    if (e.addEventListener) {
        var h = Array.prototype,
            i = Object.prototype,
            g = h.forEach,
            k = h.slice,
            r = i.hasOwnProperty,
            m = i.toString,
            t = p.Popcorn,
            q = [],
            o = false,
            u = {
                events: {
                    hash: {},
                    apis: {}
                }
            },
            E = function() {
                return p.requestAnimationFrame || p.webkitRequestAnimationFrame || p.mozRequestAnimationFrame || p.oRequestAnimationFrame || p.msRequestAnimationFrame || function(a) {
                    p.setTimeout(a, 16)
                }
            }(),
            C = {
                put: function(a) {
                    for (var c in a)
                        if (a.hasOwnProperty(c)) this[c] = a[c]
                }
            },
            f = function(a, c) {
                return new f.p.init(a, c || null)
            };
        f.version = "1.5.6";
        f.isSupported = true;
        f.instances = [];
        f.p = f.prototype = {
            init: function(a, c) {
                var n, j = this;
                if (typeof a === "function")
                    if (e.readyState === "complete") a(e, f);
                    else {
                        q.push(a);
                        if (!o) {
                            o = true;
                            var w = function() {
                                e.removeEventListener("DOMContentLoaded", w, false);
                                for (var F = 0, v = q.length; F < v; F++) q[F].call(e, f);
                                q = null
                            };
                            e.addEventListener("DOMContentLoaded", w, false)
                        }
                    } else {
                    if (typeof a === "string") try {
                        n = e.querySelector(a)
                    } catch (x) {
                        throw Error("Popcorn.js Error: Invalid media element selector: " + a);
                    }
                    this.media = n || a;
                    n = this.media.nodeName && this.media.nodeName.toLowerCase() || "video";
                    this[n] = this.media;
                    this.options = f.extend({}, c) || {};
                    this.id = this.options.id || f.guid(n);
                    if (f.byId(this.id)) throw Error("Popcorn.js Error: Cannot use duplicate ID (" + this.id + ")");
                    this.isDestroyed = false;
                    this.data = {
                        running: {
                            cue: []
                        },
                        timeUpdate: f.nop,
                        disabled: {},
                        events: {},
                        hooks: {},
                        history: [],
                        state: {
                            volume: this.media.volume
                        },
                        trackRefs: {},
                        trackEvents: new d(this)
                    };
                    f.instances.push(this);
                    var z = function() {
                        if (j.media.currentTime < 0) j.media.currentTime = 0;
                        j.media.removeEventListener("loadedmetadata", z, false);
                        var F,
                            v, L, y, s;
                        F = j.media.duration;
                        F = F != F ? Number.MAX_VALUE : F + 1;
                        f.addTrackEvent(j, {
                            start: F,
                            end: F
                        });
                        if (!j.isDestroyed) {
                            j.data.durationChange = function() {
                                var B = j.media.duration,
                                    Q = B + 1,
                                    K = j.data.trackEvents.byStart,
                                    M = j.data.trackEvents.byEnd;
                                K.pop();
                                M.pop();
                                for (var D = M.length - 1; D > 0; D--) M[D].end > B && j.removeTrackEvent(M[D]._id);
                                for (M = 0; M < K.length; M++) K[M].end > B && j.removeTrackEvent(K[M]._id);
                                j.data.trackEvents.byEnd.push({
                                    start: Q,
                                    end: Q
                                });
                                j.data.trackEvents.byStart.push({
                                    start: Q,
                                    end: Q
                                })
                            };
                            j.media.addEventListener("durationchange",
                                j.data.durationChange, false)
                        }
                        if (j.options.frameAnimation) {
                            j.data.timeUpdate = function() {
                                f.timeUpdate(j, {});
                                f.forEach(f.manifest, function(B, Q) {
                                    if (v = j.data.running[Q]) {
                                        y = v.length;
                                        for (var K = 0; K < y; K++) {
                                            L = v[K];
                                            (s = L._natives) && s.frame && s.frame.call(j, {}, L, j.currentTime())
                                        }
                                    }
                                });
                                j.emit("timeupdate");
                                !j.isDestroyed && E(j.data.timeUpdate)
                            };
                            !j.isDestroyed && E(j.data.timeUpdate)
                        } else {
                            j.data.timeUpdate = function(B) {
                                f.timeUpdate(j, B)
                            };
                            j.isDestroyed || j.media.addEventListener("timeupdate", j.data.timeUpdate, false)
                        }
                    };
                    j.media.addEventListener("error",
                        function() {
                            j.error = j.media.error
                        }, false);
                    j.media.readyState >= 1 ? z() : j.media.addEventListener("loadedmetadata", z, false);
                    return this
                }
            }
        };
        f.p.init.prototype = f.p;
        f.byId = function(a) {
            for (var c = f.instances, n = c.length, j = 0; j < n; j++)
                if (c[j].id === a) return c[j];
            return null
        };
        f.forEach = function(a, c, n) {
            if (!a || !c) return {};
            n = n || this;
            var j, w;
            if (g && a.forEach === g) return a.forEach(c, n);
            if (m.call(a) === "[object NodeList]") {
                j = 0;
                for (w = a.length; j < w; j++) c.call(n, a[j], j, a);
                return a
            }
            for (j in a) r.call(a, j) && c.call(n, a[j], j, a);
            return a
        };
        f.extend = function(a) {
            var c = k.call(arguments, 1);
            f.forEach(c, function(n) {
                for (var j in n) a[j] = n[j]
            });
            return a
        };
        f.extend(f, {
            noConflict: function(a) {
                if (a) p.Popcorn = t;
                return f
            },
            error: function(a) {
                throw Error(a);
            },
            guid: function(a) {
                f.guid.counter++;
                return (a ? a : "") + (+new Date + f.guid.counter)
            },
            sizeOf: function(a) {
                var c = 0,
                    n;
                for (n in a) c++;
                return c
            },
            isArray: Array.isArray || function(a) {
                return m.call(a) === "[object Array]"
            },
            nop: function() {},
            position: function(a) {
                if (!a.parentNode) return null;
                a = a.getBoundingClientRect();
                var c = {},
                    n = e.documentElement,
                    j = e.body,
                    w, x, z;
                w = n.clientTop || j.clientTop || 0;
                x = n.clientLeft || j.clientLeft || 0;
                z = p.pageYOffset && n.scrollTop || j.scrollTop;
                n = p.pageXOffset && n.scrollLeft || j.scrollLeft;
                w = Math.ceil(a.top + z - w);
                x = Math.ceil(a.left + n - x);
                for (var F in a) c[F] = Math.round(a[F]);
                return f.extend({}, c, {
                    top: w,
                    left: x
                })
            },
            disable: function(a, c) {
                if (!a.data.disabled[c]) {
                    a.data.disabled[c] = true;
                    if (c in f.registryByName && a.data.running[c])
                        for (var n = a.data.running[c].length - 1, j; n >= 0; n--) {
                            j = a.data.running[c][n];
                            j._natives.end.call(a,
                                null, j);
                            a.emit("trackend", f.extend({}, j, {
                                plugin: j.type,
                                type: "trackend"
                            }))
                        }
                    return a
                }
            },
            enable: function(a, c) {
                if (a.data.disabled[c]) {
                    a.data.disabled[c] = false;
                    if (c in f.registryByName && a.data.running[c])
                        for (var n = a.data.running[c].length - 1, j; n >= 0; n--) {
                            j = a.data.running[c][n];
                            j._natives.start.call(a, null, j);
                            a.emit("trackstart", f.extend({}, j, {
                                plugin: j.type,
                                type: "trackstart",
                                track: j
                            }))
                        }
                    return a
                }
            },
            destroy: function(a) {
                var c = a.data.events,
                    n = a.data.trackEvents,
                    j, w, x, z;
                for (w in c) {
                    j = c[w];
                    for (x in j) delete j[x];
                    c[w] = null
                }
                for (z in f.registryByName) f.removePlugin(a, z);
                n.byStart.length = 0;
                n.byEnd.length = 0;
                if (!a.isDestroyed) {
                    a.data.timeUpdate && a.media.removeEventListener("timeupdate", a.data.timeUpdate, false);
                    a.isDestroyed = true
                }
                f.instances.splice(f.instances.indexOf(a), 1)
            }
        });
        f.guid.counter = 1;
        f.extend(f.p, function() {
            var a = {};
            f.forEach("load play pause currentTime playbackRate volume duration preload playbackRate autoplay loop controls muted buffered readyState seeking paused played seekable ended".split(/\s+/g),
                function(c) {
                    a[c] = function(n) {
                        var j;
                        if (typeof this.media[c] === "function") {
                            if (n != null && /play|pause/.test(c)) this.media.currentTime = f.util.toSeconds(n);
                            this.media[c]();
                            return this
                        }
                        if (n != null) {
                            j = this.media[c];
                            this.media[c] = n;
                            j !== n && this.emit("attrchange", {
                                attribute: c,
                                previousValue: j,
                                currentValue: n
                            });
                            return this
                        }
                        return this.media[c]
                    }
                });
            return a
        }());
        f.forEach("enable disable".split(" "), function(a) {
            f.p[a] = function(c) {
                return f[a](this, c)
            }
        });
        f.extend(f.p, {
            roundTime: function() {
                return Math.round(this.media.currentTime)
            },
            exec: function(a, c, n) {
                var j = arguments.length,
                    w = "trackadded",
                    x, z;
                try {
                    z = f.util.toSeconds(a)
                } catch (F) {}
                if (typeof z === "number") a = z;
                if (typeof a === "number" && j === 2) {
                    n = c;
                    c = a;
                    a = f.guid("cue")
                } else if (j === 1) c = -1;
                else if (x = this.getTrackEvent(a)) {
                    this.data.trackEvents.remove(a);
                    l.end(this, x);
                    f.removeTrackEvent.ref(this, a);
                    w = "cuechange";
                    if (typeof a === "string" && j === 2) {
                        if (typeof c === "number") n = x._natives.start;
                        if (typeof c === "function") {
                            n = c;
                            c = x.start
                        }
                    }
                } else if (j >= 2) {
                    if (typeof c === "string") {
                        try {
                            z = f.util.toSeconds(c)
                        } catch (v) {}
                        c =
                            z
                    }
                    if (typeof c === "number") n = n || f.nop();
                    if (typeof c === "function") {
                        n = c;
                        c = -1
                    }
                }
                j = {
                    id: a,
                    start: c,
                    end: c + 1,
                    _running: false,
                    _natives: {
                        start: n || f.nop,
                        end: f.nop,
                        type: "cue"
                    }
                };
                if (x) j = f.extend(x, j);
                if (w === "cuechange") {
                    j._id = j.id || j._id || f.guid(j._natives.type);
                    this.data.trackEvents.add(j);
                    l.start(this, j);
                    this.timeUpdate(this, null, true);
                    f.addTrackEvent.ref(this, j);
                    this.emit(w, f.extend({}, j, {
                        id: a,
                        type: w,
                        previousValue: {
                            time: x.start,
                            fn: x._natives.start
                        },
                        currentValue: {
                            time: c,
                            fn: n || f.nop
                        },
                        track: x
                    }))
                } else f.addTrackEvent(this,
                    j);
                return this
            },
            mute: function(a) {
                a = a == null || a === true ? "muted" : "unmuted";
                if (a === "unmuted") {
                    this.media.muted = false;
                    this.media.volume = this.data.state.volume
                }
                if (a === "muted") {
                    this.data.state.volume = this.media.volume;
                    this.media.muted = true
                }
                this.emit(a);
                return this
            },
            unmute: function(a) {
                return this.mute(a == null ? false : !a)
            },
            position: function() {
                return f.position(this.media)
            },
            toggle: function(a) {
                return f[this.data.disabled[a] ? "enable" : "disable"](this, a)
            },
            defaults: function(a, c) {
                if (f.isArray(a)) {
                    f.forEach(a, function(n) {
                        for (var j in n) this.defaults(j,
                            n[j])
                    }, this);
                    return this
                }
                if (!this.options.defaults) this.options.defaults = {};
                this.options.defaults[a] || (this.options.defaults[a] = {});
                f.extend(this.options.defaults[a], c);
                return this
            }
        });
        f.Events = {
            UIEvents: "blur focus focusin focusout load resize scroll unload",
            MouseEvents: "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave click dblclick",
            Events: "loadstart progress suspend emptied stalled play pause error loadedmetadata loadeddata waiting playing canplay canplaythrough seeking seeked timeupdate ended ratechange durationchange volumechange"
        };
        f.Events.Natives = f.Events.UIEvents + " " + f.Events.MouseEvents + " " + f.Events.Events;
        u.events.apiTypes = ["UIEvents", "MouseEvents", "Events"];
        (function(a, c) {
            for (var n = u.events.apiTypes, j = a.Natives.split(/\s+/g), w = 0, x = j.length; w < x; w++) c.hash[j[w]] = true;
            n.forEach(function(z) {
                c.apis[z] = {};
                for (var F = a[z].split(/\s+/g), v = F.length, L = 0; L < v; L++) c.apis[z][F[L]] = true
            })
        })(f.Events, u.events);
        f.events = {
            isNative: function(a) {
                return !!u.events.hash[a]
            },
            getInterface: function(a) {
                if (!f.events.isNative(a)) return false;
                var c =
                    u.events,
                    n = c.apiTypes;
                c = c.apis;
                for (var j = 0, w = n.length, x, z; j < w; j++) {
                    z = n[j];
                    if (c[z][a]) {
                        x = z;
                        break
                    }
                }
                return x
            },
            all: f.Events.Natives.split(/\s+/g),
            fn: {
                trigger: function(a, c) {
                    var n, j = this.data.events[a];
                    if (j) {
                        if (n = f.events.getInterface(a)) {
                            n = e.createEvent(n);
                            n.initEvent(a, true, true, p, 1);
                            this.media.dispatchEvent(n);
                            return this
                        }
                        for (n = j.slice(); n.length;) n.shift().call(this, c)
                    }
                    return this
                },
                listen: function(a, c) {
                    var n = this,
                        j = true,
                        w = f.events.hooks[a],
                        x, z;
                    if (typeof c !== "function") throw Error("Popcorn.js Error: Listener is not a function");
                    if (!this.data.events[a]) {
                        this.data.events[a] = [];
                        j = false
                    }
                    if (w) {
                        w.add && w.add.call(this, {}, c);
                        if (w.bind) a = w.bind;
                        if (w.handler) {
                            z = c;
                            c = function(F) {
                                w.handler.call(n, F, z)
                            }
                        }
                        j = true;
                        if (!this.data.events[a]) {
                            this.data.events[a] = [];
                            j = false
                        }
                    }
                    this.data.events[a].push(c);
                    !j && f.events.all.indexOf(a) > -1 && this.media.addEventListener(a, function(F) {
                        if (n.data.events[a])
                            for (x = n.data.events[a].slice(); x.length;) x.shift().call(n, F)
                    }, false);
                    return this
                },
                unlisten: function(a, c) {
                    var n, j = this.data.events[a];
                    if (j) {
                        if (typeof c ===
                            "string") {
                            for (n = 0; n < j.length; n++) j[n].name === c && j.splice(n--, 1);
                            return this
                        } else if (typeof c === "function") {
                            for (; n !== -1;) {
                                n = j.indexOf(c);
                                n !== -1 && j.splice(n, 1)
                            }
                            return this
                        }
                        this.data.events[a] = null;
                        return this
                    }
                }
            },
            hooks: {
                canplayall: {
                    bind: "canplaythrough",
                    add: function(a, c) {
                        var n = false;
                        if (this.media.readyState) {
                            setTimeout(function() {
                                c.call(this, a)
                            }.bind(this), 0);
                            n = true
                        }
                        this.data.hooks.canplayall = {
                            fired: n
                        }
                    },
                    handler: function(a, c) {
                        if (!this.data.hooks.canplayall.fired) {
                            c.call(this, a);
                            this.data.hooks.canplayall.fired =
                                true
                        }
                    }
                }
            }
        };
        f.forEach([
            ["trigger", "emit"],
            ["listen", "on"],
            ["unlisten", "off"]
        ], function(a) {
            f.p[a[0]] = f.p[a[1]] = f.events.fn[a[0]]
        });
        l.start = function(a, c) {
            if (c.end > a.media.currentTime && c.start <= a.media.currentTime && !c._running) {
                c._running = true;
                a.data.running[c._natives.type].push(c);
                if (!a.data.disabled[c._natives.type]) {
                    c._natives.start.call(a, null, c);
                    a.emit("trackstart", f.extend({}, c, {
                        plugin: c._natives.type,
                        type: "trackstart",
                        track: c
                    }))
                }
            }
        };
        l.end = function(a, c) {
            var n;
            if ((c.end <= a.media.currentTime || c.start >
                a.media.currentTime) && c._running) {
                n = a.data.running[c._natives.type];
                c._running = false;
                n.splice(n.indexOf(c), 1);
                if (!a.data.disabled[c._natives.type]) {
                    c._natives.end.call(a, null, c);
                    a.emit("trackend", f.extend({}, c, {
                        plugin: c._natives.type,
                        type: "trackend",
                        track: c
                    }))
                }
            }
        };
        d.prototype.where = function(a) {
            return (this.parent.getTrackEvents() || []).filter(function(c) {
                var n, j;
                if (!a) return true;
                for (n in a) {
                    j = a[n];
                    if (c[n] && c[n] === j || c._natives[n] && c._natives[n] === j) return true
                }
                return false
            })
        };
        d.prototype.add = function(a) {
            var c =
                this.byStart,
                n = this.byEnd,
                j;
            a && a._id && this.parent.data.history.push(a._id);
            a.start = f.util.toSeconds(a.start, this.parent.options.framerate);
            a.end = f.util.toSeconds(a.end, this.parent.options.framerate);
            for (j = c.length - 1; j >= 0; j--)
                if (a.start >= c[j].start) {
                    c.splice(j + 1, 0, a);
                    break
                }
            for (c = n.length - 1; c >= 0; c--)
                if (a.end > n[c].end) {
                    n.splice(c + 1, 0, a);
                    break
                }
            j <= this.parent.data.trackEvents.startIndex && a.start <= this.parent.data.trackEvents.previousUpdateTime && this.parent.data.trackEvents.startIndex++;
            c <= this.parent.data.trackEvents.endIndex &&
                a.end < this.parent.data.trackEvents.previousUpdateTime && this.parent.data.trackEvents.endIndex++;
            this.count++
        };
        d.prototype.remove = function(a) {
            if (a instanceof l) a = a.id;
            if (typeof a === "object") {
                this.where(a).forEach(function(y) {
                    this.removeTrackEvent(y._id)
                }, this.parent);
                return this
            }
            var c, n, j;
            j = this.byStart.length;
            for (var w = 0, x = 0, z = [], F = [], v = [], L = []; --j > -1;) {
                c = this.byStart[w];
                n = this.byEnd[w];
                if (!c._id) {
                    z.push(c);
                    F.push(n)
                }
                if (c._id) {
                    c._id !== a && z.push(c);
                    n._id !== a && F.push(n);
                    if (c._id === a) x = w
                }
                w++
            }
            j = this.animating.length;
            w = 0;
            if (j)
                for (; --j > -1;) {
                    c = this.animating[w];
                    c._id || v.push(c);
                    c._id && c._id !== a && v.push(c);
                    w++
                }
            x <= this.startIndex && this.startIndex--;
            x <= this.endIndex && this.endIndex--;
            this.byStart = z;
            this.byEnd = F;
            this.animating = v;
            this.count--;
            j = this.parent.data.history.length;
            for (w = 0; w < j; w++) this.parent.data.history[w] !== a && L.push(this.parent.data.history[w]);
            this.parent.data.history = L
        };
        f.addTrackEvent = function(a, c) {
            var n;
            if (!(c instanceof l)) {
                if ((c = new l(c)) && c._natives && c._natives.type && a.options.defaults && a.options.defaults[c._natives.type]) {
                    n =
                        f.extend({}, c);
                    f.extend(c, a.options.defaults[c._natives.type], n)
                }
                if (c._natives) {
                    c._id = c.id || c._id || f.guid(c._natives.type);
                    if (c._natives._setup) {
                        c._natives._setup.call(a, c);
                        a.emit("tracksetup", f.extend({}, c, {
                            plugin: c._natives.type,
                            type: "tracksetup",
                            track: c
                        }))
                    }
                }
                a.data.trackEvents.add(c);
                l.start(a, c);
                this.timeUpdate(a, null, true);
                c._id && f.addTrackEvent.ref(a, c);
                a.emit("trackadded", f.extend({}, c, c._natives ? {
                    plugin: c._natives.type
                } : {}, {
                    type: "trackadded",
                    track: c
                }))
            }
        };
        f.addTrackEvent.ref = function(a, c) {
            a.data.trackRefs[c._id] =
                c;
            return a
        };
        f.removeTrackEvent = function(a, c) {
            var n = a.getTrackEvent(c);
            if (n) {
                n._natives._teardown && n._natives._teardown.call(a, n);
                a.data.trackEvents.remove(c);
                f.removeTrackEvent.ref(a, c);
                n._natives && a.emit("trackremoved", f.extend({}, n, {
                    plugin: n._natives.type,
                    type: "trackremoved",
                    track: n
                }))
            }
        };
        f.removeTrackEvent.ref = function(a, c) {
            delete a.data.trackRefs[c];
            return a
        };
        f.getTrackEvents = function(a) {
            var c = [];
            a = a.data.trackEvents.byStart;
            for (var n = a.length, j = 0, w; j < n; j++) {
                w = a[j];
                w._id && c.push(w)
            }
            return c
        };
        f.getTrackEvents.ref =
            function(a) {
                return a.data.trackRefs
        };
        f.getTrackEvent = function(a, c) {
            return a.data.trackRefs[c]
        };
        f.getTrackEvent.ref = function(a, c) {
            return a.data.trackRefs[c]
        };
        f.getLastTrackEventId = function(a) {
            return a.data.history[a.data.history.length - 1]
        };
        f.timeUpdate = function(a, c) {
            var n = a.media.currentTime,
                j = a.data.trackEvents.previousUpdateTime,
                w = a.data.trackEvents,
                x = w.endIndex,
                z = w.startIndex,
                F = w.byStart.length,
                v = w.byEnd.length,
                L = f.registryByName,
                y, s, B;
            if (j <= n) {
                for (; w.byEnd[x] && w.byEnd[x].end <= n;) {
                    y = w.byEnd[x];
                    s = (j = y._natives) && j.type;
                    if (!j || L[s] || a[s]) {
                        if (y._running === true) {
                            y._running = false;
                            B = a.data.running[s];
                            B.splice(B.indexOf(y), 1);
                            if (!a.data.disabled[s]) {
                                j.end.call(a, c, y);
                                a.emit("trackend", f.extend({}, y, {
                                    plugin: s,
                                    type: "trackend",
                                    track: y
                                }))
                            }
                        }
                        x++
                    } else {
                        f.removeTrackEvent(a, y._id);
                        return
                    }
                }
                for (; w.byStart[z] && w.byStart[z].start <= n;) {
                    y = w.byStart[z];
                    s = (j = y._natives) && j.type;
                    if (!j || L[s] || a[s]) {
                        if (y.end > n && y._running === false) {
                            y._running = true;
                            a.data.running[s].push(y);
                            if (!a.data.disabled[s]) {
                                j.start.call(a, c,
                                    y);
                                a.emit("trackstart", f.extend({}, y, {
                                    plugin: s,
                                    type: "trackstart",
                                    track: y
                                }))
                            }
                        }
                        z++
                    } else {
                        f.removeTrackEvent(a, y._id);
                        return
                    }
                }
            } else if (j > n) {
                for (; w.byStart[z] && w.byStart[z].start > n;) {
                    y = w.byStart[z];
                    s = (j = y._natives) && j.type;
                    if (!j || L[s] || a[s]) {
                        if (y._running === true) {
                            y._running = false;
                            B = a.data.running[s];
                            B.splice(B.indexOf(y), 1);
                            if (!a.data.disabled[s]) {
                                j.end.call(a, c, y);
                                a.emit("trackend", f.extend({}, y, {
                                    plugin: s,
                                    type: "trackend",
                                    track: y
                                }))
                            }
                        }
                        z--
                    } else {
                        f.removeTrackEvent(a, y._id);
                        return
                    }
                }
                for (; w.byEnd[x] && w.byEnd[x].end >
                    n;) {
                    y = w.byEnd[x];
                    s = (j = y._natives) && j.type;
                    if (!j || L[s] || a[s]) {
                        if (y.start <= n && y._running === false) {
                            y._running = true;
                            a.data.running[s].push(y);
                            if (!a.data.disabled[s]) {
                                j.start.call(a, c, y);
                                a.emit("trackstart", f.extend({}, y, {
                                    plugin: s,
                                    type: "trackstart",
                                    track: y
                                }))
                            }
                        }
                        x--
                    } else {
                        f.removeTrackEvent(a, y._id);
                        return
                    }
                }
            }
            w.endIndex = x;
            w.startIndex = z;
            w.previousUpdateTime = n;
            w.byStart.length < F && w.startIndex--;
            w.byEnd.length < v && w.endIndex--
        };
        f.extend(f.p, {
            getTrackEvents: function() {
                return f.getTrackEvents.call(null, this)
            },
            getTrackEvent: function(a) {
                return f.getTrackEvent.call(null, this, a)
            },
            getLastTrackEventId: function() {
                return f.getLastTrackEventId.call(null, this)
            },
            removeTrackEvent: function(a) {
                f.removeTrackEvent.call(null, this, a);
                return this
            },
            removePlugin: function(a) {
                f.removePlugin.call(null, this, a);
                return this
            },
            timeUpdate: function(a) {
                f.timeUpdate.call(null, this, a);
                return this
            },
            destroy: function() {
                f.destroy.call(null, this);
                return this
            }
        });
        f.manifest = {};
        f.registry = [];
        f.registryByName = {};
        f.plugin = function(a, c, n) {
            if (f.protect.natives.indexOf(a.toLowerCase()) >=
                0) f.error("'" + a + "' is a protected function name");
            else {
                var j = typeof c === "function",
                    w = ["start", "end", "type", "manifest"],
                    x = ["_setup", "_teardown", "start", "end", "frame"],
                    z = {},
                    F = function(y, s) {
                        y = y || f.nop;
                        s = s || f.nop;
                        return function() {
                            y.apply(this, arguments);
                            s.apply(this, arguments)
                        }
                    };
                f.manifest[a] = n = n || c.manifest || {};
                x.forEach(function(y) {
                    c[y] = b(c[y] || f.nop, a)
                });
                var v = function(y, s) {
                    if (!s) return this;
                    if (s.ranges && f.isArray(s.ranges)) {
                        f.forEach(s.ranges, function(M) {
                                M = f.extend({}, s, M);
                                delete M.ranges;
                                this[a](M)
                            },
                            this);
                        return this
                    }
                    var B = s._natives = {},
                        Q = "",
                        K;
                    f.extend(B, y);
                    s._natives.type = s._natives.plugin = a;
                    s._running = false;
                    B.start = B.start || B["in"];
                    B.end = B.end || B.out;
                    if (s.once) B.end = F(B.end, function() {
                        this.removeTrackEvent(s._id)
                    });
                    B._teardown = F(function() {
                            var M = k.call(arguments),
                                D = this.data.running[B.type];
                            M.unshift(null);
                            M[1]._running && D.splice(D.indexOf(s), 1) && B.end.apply(this, M);
                            M[1]._running = false;
                            this.emit("trackend", f.extend({}, s, {
                                plugin: B.type,
                                type: "trackend",
                                track: f.getTrackEvent(this, s.id || s._id)
                            }))
                        },
                        B._teardown);
                    B._teardown = F(B._teardown, function() {
                        this.emit("trackteardown", f.extend({}, s, {
                            plugin: a,
                            type: "trackteardown",
                            track: f.getTrackEvent(this, s.id || s._id)
                        }))
                    });
                    s.compose = s.compose || [];
                    if (typeof s.compose === "string") s.compose = s.compose.split(" ");
                    s.effect = s.effect || [];
                    if (typeof s.effect === "string") s.effect = s.effect.split(" ");
                    s.compose = s.compose.concat(s.effect);
                    s.compose.forEach(function(M) {
                        Q = f.compositions[M] || {};
                        x.forEach(function(D) {
                            B[D] = F(B[D], Q[D])
                        })
                    });
                    s._natives.manifest = n;
                    if (!("start" in
                        s)) s.start = s["in"] || 0;
                    if (!s.end && s.end !== 0) s.end = s.out || Number.MAX_VALUE;
                    if (!r.call(s, "toString")) s.toString = function() {
                        var M = ["start: " + s.start, "end: " + s.end, "id: " + (s.id || s._id)];
                        s.target != null && M.push("target: " + s.target);
                        return a + " ( " + M.join(", ") + " )"
                    };
                    if (!s.target) {
                        K = "options" in n && n.options;
                        s.target = K && "target" in K && K.target
                    }
                    if (!s._id && s._natives) s._id = f.guid(s._natives.type);
                    if (s instanceof l) {
                        if (s._natives) {
                            s._id = s.id || s._id || f.guid(s._natives.type);
                            if (s._natives._setup) {
                                s._natives._setup.call(this,
                                    s);
                                this.emit("tracksetup", f.extend({}, s, {
                                    plugin: s._natives.type,
                                    type: "tracksetup",
                                    track: s
                                }))
                            }
                        }
                        this.data.trackEvents.add(s);
                        l.start(this, s);
                        this.timeUpdate(this, null, true);
                        s._id && f.addTrackEvent.ref(this, s)
                    } else f.addTrackEvent(this, s);
                    f.forEach(y, function(M, D) {
                        w.indexOf(D) === -1 && this.on(D, M)
                    }, this);
                    return this
                };
                f.p[a] = z[a] = function(y, s) {
                    var B, Q;
                    if (y && !s) s = y;
                    else if (B = this.getTrackEvent(y)) {
                        Q = s;
                        var K = {},
                            M;
                        for (M in B)
                            if (r.call(Q, M) && r.call(B, M)) K[M] = B[M];
                        if (B._natives._update) {
                            this.data.trackEvents.remove(B);
                            if (r.call(s, "start")) B.start = s.start;
                            if (r.call(s, "end")) B.end = s.end;
                            l.end(this, B);
                            j && c.call(this, B);
                            B._natives._update.call(this, B, s);
                            this.data.trackEvents.add(B);
                            l.start(this, B)
                        } else {
                            f.extend(B, s);
                            this.data.trackEvents.remove(y);
                            B._natives._teardown && B._natives._teardown.call(this, B);
                            f.removeTrackEvent.ref(this, y);
                            if (j) v.call(this, c.call(this, B), B);
                            else {
                                B._id = B.id || B._id || f.guid(B._natives.type);
                                if (B._natives && B._natives._setup) {
                                    B._natives._setup.call(this, B);
                                    this.emit("tracksetup", f.extend({}, B, {
                                        plugin: B._natives.type,
                                        type: "tracksetup",
                                        track: B
                                    }))
                                }
                                this.data.trackEvents.add(B);
                                l.start(this, B);
                                this.timeUpdate(this, null, true);
                                f.addTrackEvent.ref(this, B)
                            }
                            this.emit("trackchange", {
                                id: B.id,
                                type: "trackchange",
                                previousValue: K,
                                currentValue: B,
                                track: B
                            });
                            return this
                        }
                        B._natives.type !== "cue" && this.emit("trackchange", {
                            id: B.id,
                            type: "trackchange",
                            previousValue: K,
                            currentValue: Q,
                            track: B
                        });
                        return this
                    } else s.id = y;
                    this.data.running[a] = this.data.running[a] || [];
                    B = f.extend({}, this.options.defaults && this.options.defaults[a] || {}, s);
                    v.call(this, j ? c.call(this, B) : c, B);
                    return this
                };
                n && f.extend(c, {
                    manifest: n
                });
                var L = {
                    fn: z[a],
                    definition: c,
                    base: c,
                    parents: [],
                    name: a
                };
                f.registry.push(f.extend(z, L, {
                    type: a
                }));
                f.registryByName[a] = L;
                return z
            }
        };
        f.plugin.errors = [];
        f.plugin.debug = f.version === "1.5.6";
        f.removePlugin = function(a, c) {
            if (!c) {
                c = a;
                a = f.p;
                if (f.protect.natives.indexOf(c.toLowerCase()) >= 0) {
                    f.error("'" + c + "' is a protected function name");
                    return
                }
                var n = f.registry.length,
                    j;
                for (j = 0; j < n; j++)
                    if (f.registry[j].name === c) {
                        f.registry.splice(j,
                            1);
                        delete f.registryByName[c];
                        delete f.manifest[c];
                        delete a[c];
                        return
                    }
            }
            n = a.data.trackEvents.byStart;
            j = a.data.trackEvents.byEnd;
            var w = a.data.trackEvents.animating,
                x, z;
            x = 0;
            for (z = n.length; x < z; x++) {
                if (n[x] && n[x]._natives && n[x]._natives.type === c) {
                    n[x]._natives._teardown && n[x]._natives._teardown.call(a, n[x]);
                    n.splice(x, 1);
                    x--;
                    z--;
                    if (a.data.trackEvents.startIndex <= x) {
                        a.data.trackEvents.startIndex--;
                        a.data.trackEvents.endIndex--
                    }
                }
                j[x] && j[x]._natives && j[x]._natives.type === c && j.splice(x, 1)
            }
            x = 0;
            for (z = w.length; x <
                z; x++)
                if (w[x] && w[x]._natives && w[x]._natives.type === c) {
                    w.splice(x, 1);
                    x--;
                    z--
                }
        };
        f.compositions = {};
        f.compose = function(a, c, n) {
            f.manifest[a] = n || c.manifest || {};
            f.compositions[a] = c
        };
        f.plugin.effect = f.effect = f.compose;
        var G = /^(?:\.|#|\[)/;
        f.dom = {
            debug: false,
            find: function(a, c) {
                var n = null;
                c = c || e;
                if (a) {
                    if (!G.test(a)) {
                        n = e.getElementById(a);
                        if (n !== null) return n
                    }
                    try {
                        n = c.querySelector(a)
                    } catch (j) {
                        if (f.dom.debug) throw Error(j);
                    }
                }
                return n
            }
        };
        var A = /\?/,
            O = {
                ajax: null,
                url: "",
                data: "",
                dataType: "",
                success: f.nop,
                type: "GET",
                async: true,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8"
            };
        f.xhr = function(a) {
            a.dataType = a.dataType && a.dataType.toLowerCase() || null;
            if (a.dataType && (a.dataType === "jsonp" || a.dataType === "script")) f.xhr.getJSONP(a.url, a.success, a.dataType === "script");
            else {
                a = f.extend({}, O, a);
                a.ajax = new XMLHttpRequest;
                if (a.ajax) {
                    if (a.type === "GET" && a.data) {
                        a.url += (A.test(a.url) ? "&" : "?") + a.data;
                        a.data = null
                    }
                    a.ajax.open(a.type, a.url, a.async);
                    a.type === "POST" && a.ajax.setRequestHeader("Content-Type", a.contentType);
                    a.ajax.send(a.data || null);
                    return f.xhr.httpData(a)
                }
            }
        };
        f.xhr.httpData = function(a) {
            var c, n = null,
                j, w = null;
            a.ajax.onreadystatechange = function() {
                if (a.ajax.readyState === 4) {
                    try {
                        n = JSON.parse(a.ajax.responseText)
                    } catch (x) {}
                    c = {
                        xml: a.ajax.responseXML,
                        text: a.ajax.responseText,
                        json: n
                    };
                    if (!c.xml || !c.xml.documentElement) {
                        c.xml = null;
                        try {
                            j = new DOMParser;
                            w = j.parseFromString(a.ajax.responseText, "text/xml");
                            if (!w.getElementsByTagName("parsererror").length) c.xml = w
                        } catch (z) {}
                    }
                    if (a.dataType) c = c[a.dataType];
                    a.success.call(a.ajax,
                        c)
                }
            };
            return c
        };
        f.xhr.getJSONP = function(a, c, n) {
            var j = e.head || e.getElementsByTagName("head")[0] || e.documentElement,
                w = e.createElement("script"),
                x = false,
                z = [];
            z = /(=)\?(?=&|$)|\?\?/;
            var F, v;
            if (!n) {
                v = a.match(/(callback=[^&]*)/);
                if (v !== null && v.length) {
                    z = v[1].split("=")[1];
                    if (z === "?") z = "jsonp";
                    F = f.guid(z);
                    a = a.replace(/(callback=[^&]*)/, "callback=" + F)
                } else {
                    F = f.guid("jsonp");
                    if (z.test(a)) a = a.replace(z, "$1" + F);
                    z = a.split(/\?(.+)?/);
                    a = z[0] + "?";
                    if (z[1]) a += z[1] + "&";
                    a += "callback=" + F
                }
                window[F] = function(L) {
                    c && c(L);
                    x = true
                }
            }
            w.addEventListener("load", function() {
                n && c && c();
                x && delete window[F];
                j.removeChild(w)
            }, false);
            w.addEventListener("error", function(L) {
                c && c({
                    error: L
                });
                n || delete window[F];
                j.removeChild(w)
            }, false);
            w.src = a;
            j.insertBefore(w, j.firstChild)
        };
        f.getJSONP = f.xhr.getJSONP;
        f.getScript = f.xhr.getScript = function(a, c) {
            return f.xhr.getJSONP(a, c, true)
        };
        f.util = {
            toSeconds: function(a, c) {
                var n = /^([0-9]+:){0,2}[0-9]+([.;][0-9]+)?$/,
                    j, w, x;
                if (typeof a === "number") return a;
                typeof a === "string" && !n.test(a) && f.error("Invalid time format");
                n = a.split(":");
                j = n.length - 1;
                w = n[j];
                if (w.indexOf(";") > -1) {
                    w = w.split(";");
                    x = 0;
                    if (c && typeof c === "number") x = parseFloat(w[1], 10) / c;
                    n[j] = parseInt(w[0], 10) + x
                }
                j = n[0];
                return {
                    1: parseFloat(j, 10),
                    2: parseInt(j, 10) * 60 + parseFloat(n[1], 10),
                    3: parseInt(j, 10) * 3600 + parseInt(n[1], 10) * 60 + parseFloat(n[2], 10)
                }[n.length || 1]
            }
        };
        f.p.cue = f.p.exec;
        f.protect = {
            natives: function(a) {
                return Object.keys ? Object.keys(a) : function(c) {
                    var n, j = [];
                    for (n in c) r.call(c, n) && j.push(n);
                    return j
                }(a)
            }(f.p).map(function(a) {
                return a.toLowerCase()
            })
        };
        f.forEach({
            listen: "on",
            unlisten: "off",
            trigger: "emit",
            exec: "cue"
        }, function(a, c) {
            var n = f.p[c];
            f.p[c] = function() {
                if (typeof console !== "undefined" && console.warn) {
                    console.warn("Deprecated method '" + c + "', " + (a == null ? "do not use." : "use '" + a + "' instead."));
                    f.p[c] = n
                }
                return f.p[a].apply(this, [].slice.call(arguments))
            }
        });
        p.Popcorn = f
    } else {
        p.Popcorn = {
            isSupported: false
        };
        for (h = "byId forEach extend effects error guid sizeOf isArray nop position disable enable destroyaddTrackEvent removeTrackEvent getTrackEvents getTrackEvent getLastTrackEventId timeUpdate plugin removePlugin compose effect xhr getJSONP getScript".split(/\s+/); h.length;) p.Popcorn[h.shift()] =
            function() {}
    }
})(window, window.document);
(function(p, e) {
    var l = p.document,
        d = p.location,
        b = /:\/\//,
        h = d.href.replace(d.href.split("/").slice(-1)[0], ""),
        i = function(k, r, m) {
            k = k || 0;
            r = (r || k || 0) + 1;
            m = m || 1;
            r = Math.ceil((r - k) / m) || 0;
            var t = 0,
                q = [];
            for (q.length = r; t < r;) {
                q[t++] = k;
                k += m
            }
            return q
        };
    e.sequence = function(k, r) {
        return new e.sequence.init(k, r)
    };
    e.sequence.init = function(k, r) {
        this.parent = l.getElementById(k);
        this.seqId = e.guid("__sequenced");
        this.queue = [];
        this.playlist = [];
        this.inOuts = {
            ofVideos: [],
            ofClips: []
        };
        this.dims = {
            width: 0,
            height: 0
        };
        this.active = 0;
        this.playing =
            this.cycling = false;
        this.times = {
            last: 0
        };
        this.events = {};
        var m = this,
            t = 0;
        e.forEach(r, function(q, o) {
            var u = l.createElement("video");
            u.preload = "auto";
            u.controls = true;
            u.style.display = o && "none" || "";
            u.id = m.seqId + "-" + o;
            m.queue.push(u);
            var E = q["in"],
                C = q.out;
            m.inOuts.ofVideos.push({
                "in": E !== undefined && E || 1,
                out: C !== undefined && C || 0
            });
            m.inOuts.ofVideos[o].out = m.inOuts.ofVideos[o].out || m.inOuts.ofVideos[o]["in"] + 2;
            u.src = !b.test(q.src) ? h + q.src : q.src;
            u.setAttribute("data-sequence-owner", k);
            u.setAttribute("data-sequence-guid",
                m.seqId);
            u.setAttribute("data-sequence-id", o);
            u.setAttribute("data-sequence-clip", [m.inOuts.ofVideos[o]["in"], m.inOuts.ofVideos[o].out].join(":"));
            m.parent.appendChild(u);
            m.playlist.push(e("#" + u.id))
        });
        m.inOuts.ofVideos.forEach(function(q) {
            q = {
                "in": t,
                out: t + (q.out - q["in"])
            };
            m.inOuts.ofClips.push(q);
            t = q.out + 1
        });
        e.forEach(this.queue, function(q, o) {
            function u() {
                if (!o) {
                    m.dims.width = q.videoWidth;
                    m.dims.height = q.videoHeight
                }
                q.currentTime = m.inOuts.ofVideos[o]["in"] - 0.5;
                q.removeEventListener("canplaythrough",
                    u, false);
                return true
            }
            q.addEventListener("canplaythrough", u, false);
            q.addEventListener("play", function() {
                m.playing = true
            }, false);
            q.addEventListener("pause", function() {
                m.playing = false
            }, false);
            q.addEventListener("timeupdate", function(E) {
                E = E.srcElement || E.target;
                E = +(E.dataset && E.dataset.sequenceId || E.getAttribute("data-sequence-id"));
                var C = Math.floor(q.currentTime);
                if (m.times.last !== C && E === m.active) {
                    m.times.last = C;
                    C === m.inOuts.ofVideos[E].out && e.sequence.cycle.call(m, E)
                }
            }, false)
        });
        return this
    };
    e.sequence.init.prototype =
        e.sequence.prototype;
    e.sequence.cycle = function(k) {
        this.queue || e.error("Popcorn.sequence.cycle is not a public method");
        var r = this.queue,
            m = this.inOuts.ofVideos,
            t = r[k],
            q = 0,
            o;
        if (r[k + 1]) q = k + 1;
        if (r[k + 1]) {
            r = r[q];
            m = m[q];
            e.extend(r, {
                width: this.dims.width,
                height: this.dims.height
            });
            o = this.playlist[q];
            t.pause();
            this.active = q;
            this.times.last = m["in"] - 1;
            o.currentTime(m["in"]);
            o[q ? "play" : "pause"]();
            this.trigger("cycle", {
                position: {
                    previous: k,
                    current: q
                }
            });
            if (q) {
                t.style.display = "none";
                r.style.display = ""
            }
            this.cycling =
                false
        } else this.playlist[k].pause();
        return this
    };
    var g = ["timeupdate", "play", "pause"];
    e.extend(e.sequence.prototype, {
        eq: function(k) {
            return this.playlist[k]
        },
        remove: function() {
            this.parent.innerHTML = null
        },
        clip: function(k) {
            return this.inOuts.ofVideos[k]
        },
        duration: function() {
            for (var k = 0, r = this.inOuts.ofClips, m = 0; m < r.length; m++) k += r[m].out - r[m]["in"] + 1;
            return k - 1
        },
        play: function() {
            this.playlist[this.active].play();
            return this
        },
        exec: function(k, r) {
            var m = this.active;
            this.inOuts.ofClips.forEach(function(t, q) {
                if (k >=
                    t["in"] && k <= t.out) m = q
            });
            k += this.inOuts.ofVideos[m]["in"] - this.inOuts.ofClips[m]["in"];
            e.addTrackEvent(this.playlist[m], {
                start: k - 1,
                end: k,
                _running: false,
                _natives: {
                    start: r || e.nop,
                    end: e.nop,
                    type: "exec"
                }
            });
            return this
        },
        listen: function(k, r) {
            var m = this,
                t = this.playlist,
                q = t.length,
                o = 0;
            if (!r) r = e.nop;
            if (e.Events.Natives.indexOf(k) > -1) e.forEach(t, function(u) {
                u.listen(k, function(E) {
                    E.active = m;
                    if (g.indexOf(k) > -1) r.call(u, E);
                    else ++o === q && r.call(u, E)
                })
            });
            else {
                this.events[k] || (this.events[k] = {});
                t = r.name || e.guid("__" +
                    k);
                this.events[k][t] = r
            }
            return this
        },
        unlisten: function() {},
        trigger: function(k, r) {
            var m = this;
            if (!(e.Events.Natives.indexOf(k) > -1)) {
                this.events[k] && e.forEach(this.events[k], function(t) {
                    t.call(m, {
                        type: k
                    }, r)
                });
                return this
            }
        }
    });
    e.forEach(e.manifest, function(k, r) {
        e.sequence.prototype[r] = function(m) {
            var t = {},
                q = [],
                o, u, E, C, f;
            for (o = 0; o < this.inOuts.ofClips.length; o++) {
                q = this.inOuts.ofClips[o];
                u = i(q["in"], q.out);
                E = u.indexOf(m.start);
                C = u.indexOf(m.end);
                if (E > -1) t[o] = e.extend({}, q, {
                    start: u[E],
                    clipIdx: E
                });
                if (C > -1) t[o] =
                    e.extend({}, q, {
                        end: u[C],
                        clipIdx: C
                    })
            }
            o = Object.keys(t).map(function(A) {
                return +A
            });
            q = i(o[0], o[1]);
            for (o = 0; o < q.length; o++) {
                E = {};
                C = q[o];
                var G = t[C];
                if (G) {
                    f = this.inOuts.ofVideos[C];
                    u = G.clipIdx;
                    f = i(f["in"], f.out);
                    if (G.start) {
                        E.start = f[u];
                        E.end = f[f.length - 1]
                    }
                    if (G.end) {
                        E.start = f[0];
                        E.end = f[u]
                    }
                } else {
                    E.start = this.inOuts.ofVideos[C]["in"];
                    E.end = this.inOuts.ofVideos[C].out
                }
                this.playlist[C][r](e.extend({}, m, E))
            }
            return this
        }
    })
})(this, Popcorn);
(function(p, e) {
    function l(h) {
        h = typeof h === "string" ? h : [h.language, h.region].join("-");
        var i = h.split("-");
        return {
            iso6391: h,
            language: i[0] || "",
            region: i[1] || ""
        }
    }
    var d = p.navigator,
        b = l(d.userLanguage || d.language);
    e.locale = {
        get: function() {
            return b
        },
        set: function(h) {
            b = l(h);
            e.locale.broadcast();
            return b
        },
        broadcast: function(h) {
            var i = e.instances,
                g = i.length,
                k = 0,
                r;
            for (h = h || "locale:changed"; k < g; k++) {
                r = i[k];
                h in r.data.events && r.trigger(h)
            }
        }
    }
})(this, this.Popcorn);
(function(p) {
    document.addEventListener("DOMContentLoaded", function() {
        var e = document.querySelectorAll("[data-timeline-sources]");
        p.forEach(e, function(l, d) {
            var b = e[d],
                h, i, g;
            if (!b.id) b.id = p.guid("__popcorn");
            if (b.nodeType && b.nodeType === 1) {
                g = p("#" + b.id);
                h = (b.getAttribute("data-timeline-sources") || "").split(",");
                h[0] && p.forEach(h, function(k) {
                    i = k.split("!");
                    if (i.length === 1) {
                        i = k.match(/(.*)[\/\\]([^\/\\]+\.\w+)$/)[2].split(".");
                        i[0] = "parse" + i[1].toUpperCase();
                        i[1] = k
                    }
                    h[0] && g[i[0]] && g[i[0]](i[1])
                });
                g.autoplay() &&
                    g.play()
            }
        })
    }, false)
})(Popcorn);
(function(p) {
    var e = function(l, d) {
        l = l || p.nop;
        d = d || p.nop;
        return function() {
            l.apply(this, arguments);
            d.apply(this, arguments)
        }
    };
    p.player = function(l, d) {
        if (!p[l]) {
            d = d || {};
            var b = function(h, i, g) {
                g = g || {};
                var k = new Date / 1E3,
                    r = k,
                    m = 0,
                    t = 0,
                    q = 1,
                    o = false,
                    u = {},
                    E = typeof h === "string" ? p.dom.find(h) : h,
                    C = {};
                Object.prototype.__defineGetter__ || (C = E || document.createElement("div"));
                for (var f in E)
                    if (!(f in C))
                        if (typeof E[f] === "object") C[f] = E[f];
                        else if (typeof E[f] === "function") C[f] = function(A) {
                    return "length" in E[A] && !E[A].call ?
                        E[A] : function() {
                            return E[A].apply(E, arguments)
                        }
                }(f);
                else p.player.defineProperty(C, f, {
                    get: function(A) {
                        return function() {
                            return E[A]
                        }
                    }(f),
                    set: p.nop,
                    configurable: true
                });
                var G = function() {
                    k = new Date / 1E3;
                    if (!C.paused) {
                        C.currentTime += k - r;
                        C.dispatchEvent("timeupdate");
                        setTimeout(G, 10)
                    }
                    r = k
                };
                C.play = function() {
                    this.paused = false;
                    if (C.readyState >= 4) {
                        r = new Date / 1E3;
                        C.dispatchEvent("play");
                        G()
                    }
                };
                C.pause = function() {
                    this.paused = true;
                    C.dispatchEvent("pause")
                };
                p.player.defineProperty(C, "currentTime", {
                    get: function() {
                        return m
                    },
                    set: function(A) {
                        m = +A;
                        C.dispatchEvent("timeupdate");
                        return m
                    },
                    configurable: true
                });
                p.player.defineProperty(C, "volume", {
                    get: function() {
                        return q
                    },
                    set: function(A) {
                        q = +A;
                        C.dispatchEvent("volumechange");
                        return q
                    },
                    configurable: true
                });
                p.player.defineProperty(C, "muted", {
                    get: function() {
                        return o
                    },
                    set: function(A) {
                        o = +A;
                        C.dispatchEvent("volumechange");
                        return o
                    },
                    configurable: true
                });
                p.player.defineProperty(C, "readyState", {
                    get: function() {
                        return t
                    },
                    set: function(A) {
                        return t = A
                    },
                    configurable: true
                });
                C.addEventListener = function(A,
                    O) {
                    u[A] || (u[A] = []);
                    u[A].push(O);
                    return O
                };
                C.removeEventListener = function(A, O) {
                    var a, c = u[A];
                    if (c) {
                        for (a = u[A].length - 1; a >= 0; a--) O === c[a] && c.splice(a, 1);
                        return O
                    }
                };
                C.dispatchEvent = function(A) {
                    var O, a = A.type;
                    if (!a) {
                        a = A;
                        if (A = p.events.getInterface(a)) {
                            O = document.createEvent(A);
                            O.initEvent(a, true, true, window, 1)
                        }
                    }
                    if (u[a])
                        for (A = u[a].length - 1; A >= 0; A--) u[a][A].call(this, O, this)
                };
                C.src = i || "";
                C.duration = 0;
                C.paused = true;
                C.ended = 0;
                g && g.events && p.forEach(g.events, function(A, O) {
                    C.addEventListener(O, A, false)
                });
                if (d._canPlayType(E.nodeName,
                    i) !== false)
                    if (d._setup) d._setup.call(C, g);
                    else {
                        C.readyState = 4;
                        C.dispatchEvent("loadedmetadata");
                        C.dispatchEvent("loadeddata");
                        C.dispatchEvent("canplaythrough")
                    } else setTimeout(function() {
                    C.dispatchEvent("error")
                }, 0);
                h = new p.p.init(C, g);
                if (d._teardown) h.destroy = e(h.destroy, function() {
                    d._teardown.call(C, g)
                });
                return h
            };
            b.canPlayType = d._canPlayType = d._canPlayType || p.nop;
            p[l] = p.player.registry[l] = b
        }
    };
    p.player.registry = {};
    p.player.defineProperty = Object.defineProperty || function(l, d, b) {
        l.__defineGetter__(d,
            b.get || p.nop);
        l.__defineSetter__(d, b.set || p.nop)
    };
    p.player.playerQueue = function() {
        var l = [],
            d = false;
        return {
            next: function() {
                d = false;
                l.shift();
                l[0] && l[0]()
            },
            add: function(b) {
                l.push(function() {
                    d = true;
                    b && b()
                });
                !d && l[0]()
            }
        }
    };
    p.smart = function(l, d, b) {
        var h = typeof l === "string" ? p.dom.find(l) : l,
            i, g, k, r, m, t = "HTMLYouTubeVideoElement HTMLVimeoVideoElement HTMLSoundCloudAudioElement HTMLNullVideoElement".split(" ");
        if (h) {
            d = typeof d === "string" ? [d] : d;
            l = 0;
            for (m = d.length; l < m; l++) {
                i = d[l];
                for (g = 0; g < t.length; g++)
                    if ((r =
                        p[t[g]]) && r._canPlaySrc(i) === "probably") {
                        k = r(h);
                        b = p(k, b);
                        setTimeout(function() {
                            k.src = i
                        }, 0);
                        return b
                    }
                for (var q in p.player.registry)
                    if (p.player.registry.hasOwnProperty(q))
                        if (p.player.registry[q].canPlayType(h.nodeName, i)) return p[q](h, i, b)
            }
            var o;
            q = p.guid("popcorn-video-");
            g = document.createElement("div");
            g.style.width = "100%";
            g.style.height = "100%";
            if (d.length === 1) {
                o = document.createElement("video");
                o.id = q;
                h.appendChild(o);
                setTimeout(function() {
                    var u = document.createElement("div");
                    u.innerHTML = d[0];
                    o.src =
                        u.firstChild.nodeValue
                }, 0);
                return p("#" + q, b)
            }
            h.appendChild(g);
            t = '<video id="' + q + '" preload=auto autobuffer>';
            l = 0;
            for (m = d.length; l < m; l++) t += '<source src="' + d[l] + '">';
            t += "</video>";
            g.innerHTML = t;
            b && b.events && b.events.error && h.addEventListener("error", b.events.error, false);
            return p("#" + q, b)
        } else p.error("Specified target `" + l + "` was not found.")
    }
})(Popcorn);
(function(p) {
    var e = Object.prototype.hasOwnProperty;
    p.parsers = {};
    p.parser = function(l, d, b) {
        if (p.protect.natives.indexOf(l.toLowerCase()) >= 0) p.error("'" + l + "' is a protected function name");
        else {
            if (typeof d === "function" && !b) {
                b = d;
                d = ""
            }
            if (!(typeof b !== "function" || typeof d !== "string")) {
                var h = {};
                h[l] = function(i, g, k) {
                    if (!i) return this;
                    if (typeof g !== "function" && !k) {
                        k = g;
                        g = null
                    }
                    var r = this;
                    p.xhr({
                        url: i,
                        dataType: d,
                        success: function(m) {
                            var t, q, o = 0;
                            m = b(m, k).data || [];
                            if (t = m.length) {
                                for (; o < t; o++) {
                                    q = m[o];
                                    for (var u in q) e.call(q,
                                        u) && r[u] && r[u](q[u])
                                }
                                g && g()
                            }
                        }
                    });
                    return this
                };
                p.extend(p.p, h);
                return h
            }
        }
    }
})(Popcorn);
(function(p, e) {
    function l(b) {
        var h = l.options;
        b = h.parser[h.strictMode ? "strict" : "loose"].exec(b);
        for (var i = {}, g = 14; g--;) i[h.key[g]] = b[g] || "";
        i[h.q.name] = {};
        i[h.key[12]].replace(h.q.parser, function(k, r, m) {
            if (r) i[h.q.name][r] = m
        });
        return i
    }
    l.options = {
        strictMode: false,
        key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
        q: {
            name: "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    };
    var d = {
        length: 0,
        start: p.nop,
        end: p.nop
    };
    window.MediaError = window.MediaError || function() {
        function b(h, i) {
            this.code = h || null;
            this.message = i || ""
        }
        b.MEDIA_ERR_NONE_ACTIVE = 0;
        b.MEDIA_ERR_ABORTED = 1;
        b.MEDIA_ERR_NETWORK = 2;
        b.MEDIA_ERR_DECODE = 3;
        b.MEDIA_ERR_NONE_SUPPORTED = 4;
        return b
    }();
    p._MediaElementProto = function() {
        var b = {},
            h;
        Object.prototype.__defineGetter__ || (b = e.createElement("div"));
        b._util = {
            type: "HTML5",
            TIMEUPDATE_MS: 250,
            MIN_WIDTH: 300,
            MIN_HEIGHT: 150,
            isAttributeSet: function(i) {
                return typeof i === "string" || i === true
            },
            parseUri: l
        };
        b.addEventListener = function(i, g, k) {
            e.addEventListener(this._eventNamespace + i, g, k)
        };
        b.removeEventListener = function(i, g, k) {
            e.removeEventListener(this._eventNamespace + i, g, k)
        };
        b.dispatchEvent = function(i) {
            var g = e.createEvent("CustomEvent");
            g.initCustomEvent(this._eventNamespace + i, false, false, {
                type: i,
                target: this.parentNode,
                data: null
            });
            e.dispatchEvent(g)
        };
        b.load = p.nop;
        b.canPlayType = function() {
            return ""
        };
        b.getBoundingClientRect = function() {
            return h.getBoundingClientRect()
        };
        b.NETWORK_EMPTY = 0;
        b.NETWORK_IDLE = 1;
        b.NETWORK_LOADING = 2;
        b.NETWORK_NO_SOURCE = 3;
        b.HAVE_NOTHING = 0;
        b.HAVE_METADATA = 1;
        b.HAVE_CURRENT_DATA = 2;
        b.HAVE_FUTURE_DATA = 3;
        b.HAVE_ENOUGH_DATA = 4;
        Object.defineProperties(b, {
            currentSrc: {
                get: function() {
                    return this.src !== undefined ? this.src : ""
                },
                configurable: true
            },
            parentNode: {
                get: function() {
                    return h
                },
                set: function(i) {
                    h = i
                },
                configurable: true
            },
            preload: {
                get: function() {
                    return "auto"
                },
                set: p.nop,
                configurable: true
            },
            controls: {
                get: function() {
                    return true
                },
                set: p.nop,
                configurable: true
            },
            poster: {
                get: function() {
                    return ""
                },
                set: p.nop,
                configurable: true
            },
            crossorigin: {
                get: function() {
                    return ""
                },
                configurable: true
            },
            played: {
                get: function() {
                    return d
                },
                configurable: true
            },
            seekable: {
                get: function() {
                    return d
                },
                configurable: true
            },
            buffered: {
                get: function() {
                    return d
                },
                configurable: true
            },
            defaultMuted: {
                get: function() {
                    return false
                },
                configurable: true
            },
            defaultPlaybackRate: {
                get: function() {
                    return 1
                },
                configurable: true
            },
            style: {
                get: function() {
                    return this.parentNode.style
                },
                configurable: true
            },
            id: {
                get: function() {
                    return this.parentNode.id
                },
                configurable: true
            }
        });
        return b
    }
})(Popcorn, window.document);
(function(p, e, l) {
    function d() {
        if (e.jwplayer) {
            k = true;
            for (var t = m.length; t--;) {
                m[t]();
                delete m[t]
            }
        } else setTimeout(d, 100)
    }

    function b() {
        if (!r) {
            if (!e.jwplayer) {
                var t = l.createElement("script");
                t.src = "https://jwpsrv.com/library/zaIF4JI9EeK2FSIACpYGxA.js";
                var q = l.getElementsByTagName("script")[0];
                q.parentNode.insertBefore(t, q)
            }
            r = true;
            d()
        }
        return k
    }

    function h(t) {
        m.unshift(t)
    }

    function i(t) {
        function q(P) {
            D.unshift(P)
        }

        function o() {
            setTimeout(function() {
                v.duration = K.getDuration();
                z.dispatchEvent("durationchange");
                v.readyState = z.HAVE_METADATA;
                z.dispatchEvent("loadedmetadata");
                z.dispatchEvent("loadeddata");
                v.readyState = z.HAVE_FUTURE_DATA;
                z.dispatchEvent("canplay");
                for (B = true; D.length;) {
                    D[0]();
                    D.shift()
                }
                v.readyState = z.HAVE_ENOUGH_DATA;
                z.dispatchEvent("canplaythrough")
            }, 0)
        }

        function u() {
            if (y) y = false;
            else if (I) {
                I = false;
                o()
            } else n()
        }

        function E() {
            if (v.seeking) {
                v.ended = false;
                v.seeking = false;
                z.dispatchEvent("timeupdate");
                z.dispatchEvent("seeked");
                z.dispatchEvent("canplay");
                z.dispatchEvent("canplaythrough")
            }
        }

        function C() {
            K.onPause(u);
            K.onTime(function() {
                if (!v.ended && !v.seeking) {
                    v.currentTime = K.getPosition();
                    z.dispatchEvent("timeupdate")
                }
            });
            K.onSeek(E);
            K.onPlay(function() {
                if (!v.ended)
                    if (T) {
                        T = false;
                        if (v.autoplay || !v.paused) {
                            v.paused = false;
                            q(a);
                            o()
                        } else {
                            s = I = true;
                            K.pause(true)
                        }
                    } else if (s) {
                    s = false;
                    y = true;
                    K.pause(true)
                } else a()
            });
            K.onBufferChange(c);
            K.onComplete(j);
            K.play(true)
        }

        function f(P) {
            var S = {
                name: "MediaError"
            };
            S.message = P.message;
            S.code = P.code || 5;
            v.error = S;
            z.dispatchEvent("error")
        }

        function G(P) {
            if (z._canPlaySrc(P)) {
                var S = z._util.parseUri(P).queryKey;
                v.controls = S.controls = S.controls || v.controls;
                v.src = P;
                if (b()) {
                    if (L) L && K && K.destroy();
                    jwplayer(F.id).setup({
                        file: P,
                        width: "100%",
                        height: "100%",
                        controls: v.controls
                    });
                    K = jwplayer(F.id);
                    K.onReady(C);
                    K.onError(f);
                    jwplayer.utils.log = function(H, V) {
                        if (typeof console !== "undefined" && typeof console.log !== "undefined") V ? console.log(H, V) : console.log(H);
                        H === "No suitable players found and fallback enabled" && f({
                            message: H,
                            code: 4
                        })
                    };
                    v.networkState = z.NETWORK_LOADING;
                    z.dispatchEvent("loadstart");
                    z.dispatchEvent("progress")
                } else h(function() {
                    G(P)
                })
            } else {
                v.error = {
                    name: "MediaError",
                    message: "Media Source Not Supported",
                    code: MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
                };
                z.dispatchEvent("error")
            }
        }

        function A(P) {
            v.currentTime = P;
            if (B) {
                O();
                K.seek(P)
            } else q(function() {
                O();
                K.seek(P)
            })
        }

        function O() {
            v.seeking = true;
            if (v.paused) s = true;
            z.dispatchEvent("seeking")
        }

        function a() {
            v.paused = false;
            if (M) {
                M = false;
                if (v.loop && !Q || !v.loop) {
                    Q = true;
                    z.dispatchEvent("play")
                }
                z.dispatchEvent("playing")
            }
        }

        function c() {
            z.dispatchEvent("progress")
        }

        function n() {
            v.paused = true;
            if (!M) {
                M = true;
                z.dispatchEvent("pause")
            }
        }

        function j() {
            if (v.loop) A(0);
            else {
                v.ended = true;
                n();
                z.dispatchEvent("timeupdate");
                z.dispatchEvent("ended")
            }
        }

        function w(P) {
            v.volume = P;
            if (B) {
                K.setVolume(v.volume * 100);
                z.dispatchEvent("volumechange")
            } else q(function() {
                w(v.volume)
            })
        }

        function x(P) {
            v.muted = P;
            if (B) {
                K.setMute(P);
                z.dispatchEvent("volumechange")
            } else q(function() {
                x(v.muted)
            })
        }
        if (!e.postMessage) throw "ERROR: HTMLJWPlayerVideoElement requires window.postMessage";
        var z = new p._MediaElementProto,
            F = typeof t === "string" ? l.querySelector(t) : t,
            v = {
                src: g,
                networkState: z.NETWORK_EMPTY,
                readyState: z.HAVE_NOTHING,
                seeking: false,
                autoplay: g,
                preload: g,
                controls: false,
                loop: false,
                poster: g,
                volume: 1,
                muted: false,
                currentTime: 0,
                duration: NaN,
                ended: false,
                paused: true,
                error: null
            },
            L = false,
            y = false,
            s = false,
            B = false,
            Q = false,
            K, M = true,
            D = [],
            T = true,
            I = false;
        z._eventNamespace = p.guid("HTMLJWPlayerVideoElement::");
        z.parentNode = F;
        z._util.type = "JWPlayer";
        z.play = function() {
            z.dispatchEvent("play");
            v.paused = false;
            if (B) {
                if (v.ended) {
                    A(0);
                    v.ended = false
                }
                K.play(true)
            } else q(function() {
                z.play()
            })
        };
        z.pause = function() {
            v.paused = true;
            B ? K.pause(true) : q(function() {
                z.pause()
            })
        };
        Object.defineProperties(z, {
            src: {
                get: function() {
                    return v.src
                },
                set: function(P) {
                    P && P !== v.src && G(P)
                }
            },
            autoplay: {
                get: function() {
                    return v.autoplay
                },
                set: function(P) {
                    v.autoplay = z._util.isAttributeSet(P)
                }
            },
            loop: {
                get: function() {
                    return v.loop
                },
                set: function(P) {
                    v.loop = z._util.isAttributeSet(P)
                }
            },
            width: {
                get: function() {
                    return z.parentNode.offsetWidth
                }
            },
            height: {
                get: function() {
                    return z.parentNode.offsetHeight
                }
            },
            currentTime: {
                get: function() {
                    return v.currentTime
                },
                set: function(P) {
                    A(P)
                }
            },
            duration: {
                get: function() {
                    return K.getDuration()
                }
            },
            ended: {
                get: function() {
                    return v.ended
                }
            },
            paused: {
                get: function() {
                    return v.paused
                }
            },
            seeking: {
                get: function() {
                    return v.seeking
                }
            },
            readyState: {
                get: function() {
                    return v.readyState
                }
            },
            networkState: {
                get: function() {
                    return v.networkState
                }
            },
            volume: {
                get: function() {
                    return v.volume
                },
                set: function(P) {
                    if (P < 0 || P > 1) throw "Volume value must be between 0.0 and 1.0";
                    w(P)
                }
            },
            muted: {
                get: function() {
                    return v.muted
                },
                set: function(P) {
                    x(z._util.isAttributeSet(P))
                }
            },
            error: {
                get: function() {
                    return v.error
                }
            },
            buffered: {
                get: function() {
                    var P = {
                        start: function(S) {
                            if (S === 0) return 0;
                            throw "INDEX_SIZE_ERR: DOM Exception 1";
                        },
                        end: function(S) {
                            if (S === 0) {
                                S = K.getDuration();
                                if (!S) return 0;
                                return S * (K.getBuffer() / 100)
                            }
                            throw "INDEX_SIZE_ERR: DOM Exception 1";
                        }
                    };
                    Object.defineProperties(P, {
                        length: {
                            get: function() {
                                return 1
                            }
                        }
                    });
                    return P
                }
            }
        });
        z._canPlaySrc = p.HTMLJWPlayerVideoElement._canPlaySrc;
        z.canPlayType = p.HTMLJWPlayerVideoElement.canPlayType;
        return z
    }
    var g = "",
        k = false,
        r = false,
        m = [];
    p.HTMLJWPlayerVideoElement =
        function(t) {
            return new i(t)
    };
    p.HTMLJWPlayerVideoElement._canPlaySrc = function() {
        return "probably"
    };
    p.HTMLJWPlayerVideoElement.canPlayType = function() {
        return "probably"
    }
})(Popcorn, window, document);
(function(p, e) {
    function l(i) {
        this.startTime = 0;
        this.currentTime = i.currentTime || 0;
        this.duration = i.duration || NaN;
        this.playInterval = null;
        this.paused = true;
        this.playbackRate = this.defaultPlaybackRate = 1;
        this.ended = i.endedCallback || p.nop
    }

    function d(i) {
        function g(a) {
            A.push(a)
        }

        function k() {
            if (!C) return 0;
            return f.currentTime
        }

        function r(a) {
            if (a !== k())
                if (C) {
                    G.seeking = true;
                    o.dispatchEvent("seeking");
                    f.seekTo(a);
                    G.ended = false;
                    G.seeking = false;
                    o.dispatchEvent("timeupdate");
                    o.dispatchEvent("seeked");
                    o.dispatchEvent("canplay");
                    o.dispatchEvent("canplaythrough")
                } else g(function() {
                    r(a)
                })
        }

        function m() {
            o.dispatchEvent("timeupdate")
        }

        function t() {
            G.paused = true;
            clearInterval(O);
            o.dispatchEvent("pause")
        }

        function q() {
            if (G.loop) {
                r(0);
                o.play()
            } else {
                G.ended = true;
                t();
                o.dispatchEvent("timeupdate");
                o.dispatchEvent("ended")
            }
        }
        var o = new p._MediaElementProto,
            u = typeof i === "string" ? e.querySelector(i) : i,
            E = e.createElement("div"),
            C = false,
            f, G = {
                src: b,
                networkState: o.NETWORK_EMPTY,
                readyState: o.HAVE_NOTHING,
                autoplay: b,
                preload: b,
                controls: b,
                loop: false,
                poster: b,
                volume: 1,
                muted: false,
                width: u.width | 0 ? u.width : o._util.MIN_WIDTH,
                height: u.height | 0 ? u.height : o._util.MIN_HEIGHT,
                seeking: false,
                ended: false,
                paused: 1,
                error: null
            },
            A = [],
            O;
        o._eventNamespace = p.guid("HTMLNullVideoElement::");
        o.parentNode = u;
        o._util.type = "NullVideo";
        o.play = function() {
            if (C) {
                f.play();
                if (G.paused) {
                    if (G.paused === 1) {
                        G.paused = false;
                        o.dispatchEvent("play");
                        o.dispatchEvent("playing")
                    } else {
                        if (G.ended) {
                            r(0);
                            G.ended = false
                        }
                        if (G.paused) {
                            G.paused = false;
                            G.loop || o.dispatchEvent("play");
                            o.dispatchEvent("playing")
                        }
                    }
                    O =
                        setInterval(m, o._util.TIMEUPDATE_MS)
                }
            } else g(function() {
                o.play()
            })
        };
        o.pause = function() {
            if (C) {
                f.pause();
                G.paused || t()
            } else g(function() {
                o.pause()
            })
        };
        Object.defineProperties(o, {
            src: {
                get: function() {
                    return G.src
                },
                set: function(a) {
                    if (a && a !== G.src)
                        if (o._canPlaySrc(a)) {
                            G.src = a;
                            if (C)
                                if (C && f) {
                                    f.pause();
                                    f = null;
                                    u.removeChild(E);
                                    E = e.createElement("div")
                                }
                            E.width = G.width;
                            E.height = G.height;
                            u.appendChild(E);
                            a = h.exec(a);
                            f = new l({
                                currentTime: +a[1],
                                duration: +a[2],
                                endedCallback: q
                            });
                            o.dispatchEvent("loadstart");
                            o.dispatchEvent("progress");
                            o.dispatchEvent("durationchange");
                            C = true;
                            G.networkState = o.NETWORK_IDLE;
                            G.readyState = o.HAVE_METADATA;
                            o.dispatchEvent("loadedmetadata");
                            o.dispatchEvent("loadeddata");
                            G.readyState = o.HAVE_FUTURE_DATA;
                            o.dispatchEvent("canplay");
                            G.readyState = o.HAVE_ENOUGH_DATA;
                            for (o.dispatchEvent("canplaythrough"); A.length;) {
                                a = A.shift();
                                a()
                            }
                            G.autoplay && o.play()
                        } else {
                            G.error = {
                                name: "MediaError",
                                message: "Media Source Not Supported",
                                code: MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
                            };
                            o.dispatchEvent("error")
                        }
                }
            },
            autoplay: {
                get: function() {
                    return G.autoplay
                },
                set: function(a) {
                    G.autoplay = o._util.isAttributeSet(a)
                }
            },
            loop: {
                get: function() {
                    return G.loop
                },
                set: function(a) {
                    G.loop = o._util.isAttributeSet(a)
                }
            },
            width: {
                get: function() {
                    return E.width
                },
                set: function(a) {
                    E.width = a;
                    G.width = E.width
                }
            },
            height: {
                get: function() {
                    return E.height
                },
                set: function(a) {
                    E.height = a;
                    G.height = E.height
                }
            },
            currentTime: {
                get: function() {
                    return k()
                },
                set: function(a) {
                    r(a)
                }
            },
            duration: {
                get: function() {
                    return f ? f.duration : NaN
                }
            },
            ended: {
                get: function() {
                    return G.ended
                }
            },
            paused: {
                get: function() {
                    return G.paused
                }
            },
            seeking: {
                get: function() {
                    return G.seeking
                }
            },
            readyState: {
                get: function() {
                    return G.readyState
                }
            },
            networkState: {
                get: function() {
                    return G.networkState
                }
            },
            volume: {
                get: function() {
                    return G.volume
                },
                set: function(a) {
                    if (a < 0 || a > 1) throw "Volume value must be between 0.0 and 1.0";
                    G.volume = a;
                    o.dispatchEvent("volumechange")
                }
            },
            muted: {
                get: function() {
                    return G.muted
                },
                set: function(a) {
                    a = o._util.isAttributeSet(a);
                    G.muted = a;
                    o.dispatchEvent("volumechange")
                }
            },
            playbackRate: {
                get: function() {
                    return f.playbackRate
                },
                set: function(a) {
                    f.playbackRate =
                        a;
                    o.dispatchEvent("ratechange")
                }
            },
            error: {
                get: function() {
                    return G.error
                }
            }
        });
        o._canPlaySrc = p.HTMLNullVideoElement._canPlaySrc;
        o.canPlayType = p.HTMLNullVideoElement.canPlayType;
        return o
    }
    var b = "",
        h = /#t=(\d+\.?\d*)?,?(\d+\.?\d*)/;
    l.prototype = {
        play: function() {
            var i = this;
            if (this.paused) {
                this.paused = false;
                this.startTime = Date.now();
                this.playInterval = setInterval(function() {
                    i.currentTime += (Date.now() - i.startTime) / (1E3 / i.playbackRate);
                    i.startTime = Date.now();
                    if (i.currentTime >= i.duration) {
                        i.pause(i.duration);
                        i.ended()
                    }
                    i.currentTime <
                        0 && i.pause(0)
                }, 16)
            }
        },
        pause: function() {
            if (!this.paused) {
                this.paused = true;
                clearInterval(this.playInterval)
            }
        },
        seekTo: function(i) {
            i = i < 0 ? 0 : i;
            this.currentTime = i = i > this.duration ? this.duration : i
        }
    };
    p.HTMLNullVideoElement = function(i) {
        return new d(i)
    };
    p.HTMLNullVideoElement._canPlaySrc = function(i) {
        return h.test(i) ? "probably" : b
    };
    p.HTMLNullVideoElement.canPlayType = function(i) {
        return i === "video/x-nullvideo" ? "probably" : b
    }
})(Popcorn, document);
(function(p, e, l) {
    function d(k) {
        var r = this,
            m = k.src.split("?")[0];
        if (m.substr(0, 2) === "//") m = e.location.protocol + m;
        "play pause paused seekTo unload getCurrentTime getDuration getVideoEmbedCode getVideoHeight getVideoWidth getVideoUrl getColor setColor setLoop getVolume setVolume addEventListener".split(" ").forEach(function(t) {
            r[t] = function(q) {
                q = JSON.stringify({
                    method: t,
                    value: q
                });
                k.contentWindow && k.contentWindow.postMessage(q, m)
            }
        })
    }

    function b(k) {
        function r(y) {
            z.unshift(y)
        }

        function m(y) {
            var s = c.duration;
            if (s !== y) {
                c.duration = y;
                A.dispatchEvent("durationchange");
                if (isNaN(s)) {
                    c.networkState = A.NETWORK_IDLE;
                    c.readyState = A.HAVE_METADATA;
                    A.dispatchEvent("loadedmetadata");
                    A.dispatchEvent("loadeddata");
                    c.readyState = A.HAVE_FUTURE_DATA;
                    A.dispatchEvent("canplay");
                    c.readyState = A.HAVE_ENOUGH_DATA;
                    A.dispatchEvent("canplaythrough");
                    c.autoplay && A.play();
                    for (y = z.length; y--;) {
                        z[y]();
                        delete z[y]
                    }
                }
            }
        }

        function t(y) {
            if (n) {
                c.seeking = true;
                A.dispatchEvent("seeking");
                w.seekTo(y)
            } else r(function() {
                t(y)
            })
        }

        function q() {
            A.dispatchEvent("timeupdate")
        }

        function o(y) {
            (c.currentTime = y) !== L && A.dispatchEvent("timeupdate");
            L = c.currentTime
        }

        function u(y) {
            if (y.origin === g) {
                var s;
                try {
                    s = JSON.parse(y.data)
                } catch (B) {
                    console.warn(B)
                }
                if (s.player_id == j) switch (s.event) {
                    case "ready":
                        w = new d(a);
                        w.addEventListener("loadProgress");
                        w.addEventListener("pause");
                        w.setVolume(0);
                        w.play();
                        break;
                    case "loadProgress":
                        if (parseFloat(s.data.duration) > 0 && !n) {
                            n = true;
                            w.pause()
                        }
                        break;
                    case "pause":
                        w.setVolume(1);
                        e.removeEventListener("message", u, false);
                        e.addEventListener("message", E,
                            false);
                        w.addEventListener("loadProgress");
                        w.addEventListener("playProgress");
                        w.addEventListener("play");
                        w.addEventListener("pause");
                        w.addEventListener("finish");
                        w.addEventListener("seek");
                        w.getDuration();
                        c.networkState = A.NETWORK_LOADING;
                        A.dispatchEvent("loadstart");
                        A.dispatchEvent("progress")
                }
            }
        }

        function E(y) {
            if (y.origin === g) {
                var s;
                try {
                    s = JSON.parse(y.data)
                } catch (B) {
                    console.warn(B)
                }
                if (s.player_id == j) {
                    switch (s.method) {
                        case "getCurrentTime":
                            o(parseFloat(s.value));
                            break;
                        case "getDuration":
                            m(parseFloat(s.value));
                            break;
                        case "getVolume":
                            y = parseFloat(s.value);
                            if (c.volume !== y) {
                                c.volume = y;
                                A.dispatchEvent("volumechange")
                            }
                    }
                    switch (s.event) {
                        case "loadProgress":
                            A.dispatchEvent("progress");
                            m(parseFloat(s.data.duration));
                            break;
                        case "playProgress":
                            o(parseFloat(s.data.seconds));
                            break;
                        case "play":
                            c.ended && t(0);
                            if (!v) {
                                v = setInterval(C, h);
                                c.loop && A.dispatchEvent("play")
                            }
                            F = setInterval(q, A._util.TIMEUPDATE_MS);
                            c.paused = false;
                            if (x) {
                                x = false;
                                c.loop || A.dispatchEvent("play");
                                A.dispatchEvent("playing")
                            }
                            break;
                        case "pause":
                            c.paused =
                                true;
                            if (!x) {
                                x = true;
                                clearInterval(F);
                                A.dispatchEvent("pause")
                            }
                            break;
                        case "finish":
                            if (c.loop) {
                                t(0);
                                A.play()
                            } else {
                                c.ended = true;
                                A.dispatchEvent("ended")
                            }
                            break;
                        case "seek":
                            o(parseFloat(s.data.seconds));
                            c.seeking = false;
                            A.dispatchEvent("timeupdate");
                            A.dispatchEvent("seeked");
                            A.dispatchEvent("canplay");
                            A.dispatchEvent("canplaythrough")
                    }
                }
            }
        }

        function C() {
            w.getCurrentTime()
        }

        function f(y) {
            c.volume = y;
            if (n) {
                w.setVolume(y);
                A.dispatchEvent("volumechange")
            } else r(function() {
                f(y)
            })
        }

        function G(y) {
            if (n)
                if (y) {
                    c.muted =
                        c.volume;
                    f(0)
                } else {
                    c.muted = 0;
                    f(c.muted)
                } else {
                c.muted = y ? 1 : 0;
                r(function() {
                    G(y)
                })
            }
        }
        if (!e.postMessage) throw "ERROR: HTMLVimeoVideoElement requires window.postMessage";
        var A = new p._MediaElementProto,
            O = typeof k === "string" ? p.dom.find(k) : k,
            a = l.createElement("iframe"),
            c = {
                src: i,
                networkState: A.NETWORK_EMPTY,
                readyState: A.HAVE_NOTHING,
                seeking: false,
                autoplay: i,
                preload: i,
                controls: false,
                loop: false,
                poster: i,
                volume: 1,
                muted: 0,
                currentTime: 0,
                duration: NaN,
                ended: false,
                paused: true,
                error: null
            },
            n = false,
            j = p.guid(),
            w, x = true,
            z = [],
            F, v, L = 0;
        A._eventNamespace = p.guid("HTMLVimeoVideoElement::");
        A.parentNode = O;
        A._util.type = "Vimeo";
        A.play = function() {
            c.paused = false;
            n ? w.play() : r(function() {
                A.play()
            })
        };
        A.pause = function() {
            c.paused = true;
            n ? w.pause() : r(function() {
                A.pause()
            })
        };
        Object.defineProperties(A, {
            src: {
                get: function() {
                    return c.src
                },
                set: function(y) {
                    if (y && y !== c.src)
                        if (A._canPlaySrc(y)) {
                            c.src = y;
                            if (n)
                                if (n && w) {
                                    clearInterval(v);
                                    w.pause();
                                    e.removeEventListener("message", E, false);
                                    O.removeChild(a);
                                    a = l.createElement("iframe")
                                }
                            n = false;
                            y = A._util.parseUri(y);
                            var s = y.queryKey,
                                B, Q = ["api=1", "player_id=" + j, "title=0", "byline=0", "portrait=0"];
                            c.loop = s.loop === "1" || c.loop;
                            delete s.loop;
                            c.autoplay = s.autoplay === "1" || c.autoplay;
                            delete s.autoplay;
                            y = g + "/video/" + /\d+$/.exec(y.path) + "?";
                            for (B in s) s.hasOwnProperty(B) && Q.push(encodeURIComponent(B) + "=" + encodeURIComponent(s[B]));
                            y += Q.join("&");
                            a.id = j;
                            a.style.width = "100%";
                            a.style.height = "100%";
                            a.frameBorder = 0;
                            a.webkitAllowFullScreen = true;
                            a.mozAllowFullScreen = true;
                            a.allowFullScreen = true;
                            O.appendChild(a);
                            a.src = y;
                            e.addEventListener("message",
                                u, false)
                        } else {
                            c.error = {
                                name: "MediaError",
                                message: "Media Source Not Supported",
                                code: MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
                            };
                            A.dispatchEvent("error")
                        }
                }
            },
            autoplay: {
                get: function() {
                    return c.autoplay
                },
                set: function(y) {
                    c.autoplay = A._util.isAttributeSet(y)
                }
            },
            loop: {
                get: function() {
                    return c.loop
                },
                set: function(y) {
                    c.loop = A._util.isAttributeSet(y)
                }
            },
            width: {
                get: function() {
                    return A.parentNode.offsetWidth
                }
            },
            height: {
                get: function() {
                    return A.parentNode.offsetHeight
                }
            },
            currentTime: {
                get: function() {
                    return c.currentTime
                },
                set: function(y) {
                    t(y)
                }
            },
            duration: {
                get: function() {
                    return c.duration
                }
            },
            ended: {
                get: function() {
                    return c.ended
                }
            },
            paused: {
                get: function() {
                    return c.paused
                }
            },
            seeking: {
                get: function() {
                    return c.seeking
                }
            },
            readyState: {
                get: function() {
                    return c.readyState
                }
            },
            networkState: {
                get: function() {
                    return c.networkState
                }
            },
            volume: {
                get: function() {
                    return c.muted > 0 ? c.muted : c.volume
                },
                set: function(y) {
                    if (y < 0 || y > 1) throw "Volume value must be between 0.0 and 1.0";
                    f(y)
                }
            },
            muted: {
                get: function() {
                    return c.muted > 0
                },
                set: function(y) {
                    G(A._util.isAttributeSet(y))
                }
            },
            error: {
                get: function() {
                    return c.error
                }
            }
        });
        A._canPlaySrc = p.HTMLVimeoVideoElement._canPlaySrc;
        A.canPlayType = p.HTMLVimeoVideoElement.canPlayType;
        return A
    }
    var h = 16,
        i = "",
        g = "https://player.vimeo.com";
    p.HTMLVimeoVideoElement = function(k) {
        return new b(k)
    };
    p.HTMLVimeoVideoElement._canPlaySrc = function(k) {
        return /player.vimeo.com\/video\/\d+/.test(k) || /vimeo.com\/\d+/.test(k) ? "probably" : i
    };
    p.HTMLVimeoVideoElement.canPlayType = function(k) {
        return k === "video/x-vimeo" ? "probably" : i
    }
})(Popcorn, window, document);
(function(p, e) {
    function l() {
        return "maybe"
    }

    function d(b, h) {
        var i = typeof b === "string" ? e.querySelector(b) : b,
            g = e.createElement(h);
        i.appendChild(g);
        g._canPlaySrc = l;
        return g
    }
    p.HTMLVideoElement = function(b) {
        return d(b, "video")
    };
    p.HTMLVideoElement._canPlaySrc = l;
    p.HTMLAudioElement = function(b) {
        return d(b, "audio")
    };
    p.HTMLAudioElement._canPlaySrc = l
})(Popcorn, window.document);
(function(p, e, l) {
    function d() {
        var u;
        if (YT.loaded)
            for (t = true; o.length;) {
                u = o.shift();
                u()
            } else setTimeout(d, 250)
    }

    function b() {
        var u;
        if (!q) {
            if (e.YT) d();
            else {
                u = l.createElement("script");
                u.addEventListener("load", d, false);
                u.src = "https://www.youtube.com/iframe_api";
                l.head.appendChild(u)
            }
            q = true
        }
        return t
    }

    function h(u) {
        o.push(u)
    }

    function i(u) {
        function E(J) {
            W.push(J)
        }

        function C() {
            R.pauseVideo();
            j("play", C);
            n("play", K)
        }

        function f() {
            n("pause", M);
            j("pause", f)
        }

        function G() {
            var J = function() {
                if (R.isMuted()) {
                    n("play",
                        c);
                    R.playVideo()
                } else setTimeout(J, 0)
            };
            V = true;
            R.mute();
            J()
        }

        function A(J) {
            var N = {
                name: "MediaError"
            };
            switch (J.data) {
                case 2:
                    N.message = "Invalid video parameter.";
                    N.code = MediaError.MEDIA_ERR_ABORTED;
                    break;
                case 5:
                    N.message = "The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.";
                    N.code = MediaError.MEDIA_ERR_DECODE;
                case 100:
                    N.message = "Video not found.";
                    N.code = MediaError.MEDIA_ERR_NETWORK;
                    break;
                case 101:
                case 150:
                    N.message = "Video not usable.";
                    N.code =
                        MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED;
                    break;
                default:
                    N.message = "Unknown error.";
                    N.code = 5
            }
            H.error = N;
            I.dispatchEvent("error")
        }

        function O() {
            n("play", K);
            n("pause", M);
            if (H.autoplay || !H.paused) {
                j("play", O);
                H.paused = false;
                E(function() {
                    H.paused || K()
                })
            }
            H.muted || R.unMute();
            H.readyState = I.HAVE_METADATA;
            I.dispatchEvent("loadedmetadata");
            aa = setInterval(v, g);
            I.dispatchEvent("loadeddata");
            H.readyState = I.HAVE_FUTURE_DATA;
            I.dispatchEvent("canplay");
            U = true;
            for (ba = setInterval(L, 50); W.length;) {
                W[0]();
                W.shift()
            }
            H.readyState =
                I.HAVE_ENOUGH_DATA;
            I.dispatchEvent("canplaythrough")
        }

        function a() {
            j("pause", a);
            if (R.getCurrentTime() > 0) setTimeout(a, 0);
            else if (H.autoplay || !H.paused) {
                n("play", O);
                R.playVideo()
            } else O()
        }

        function c() {
            j("play", c);
            if (R.getCurrentTime() === 0) setTimeout(c, 0);
            else {
                n("pause", a);
                R.seekTo(0);
                R.pauseVideo()
            }
        }

        function n(J, N) {
            I.addEventListener("youtube-" + J, N, false)
        }

        function j(J, N) {
            I.removeEventListener("youtube-" + J, N, false)
        }

        function w(J) {
            I.dispatchEvent("youtube-" + J)
        }

        function x() {
            H.networkState = I.NETWORK_LOADING;
            I.dispatchEvent("waiting")
        }

        function z(J) {
            switch (J.data) {
                case YT.PlayerState.ENDED:
                    w("ended");
                    break;
                case YT.PlayerState.PLAYING:
                    w("play");
                    break;
                case YT.PlayerState.PAUSED:
                    R.getDuration() !== R.getCurrentTime() && w("pause");
                    break;
                case YT.PlayerState.BUFFERING:
                    w("buffering")
            }
            J.data !== YT.PlayerState.BUFFERING && ca === YT.PlayerState.BUFFERING && I.dispatchEvent("progress");
            ca = J.data
        }

        function F(J) {
            if (I._canPlaySrc(J)) {
                H.src = J;
                if (b()) {
                    if (V)
                        if (U) {
                            if (V && R) {
                                j("buffering", x);
                                j("ended", D);
                                j("play", K);
                                j("pause", M);
                                M();
                                Z = U = false;
                                H.currentTime = 0;
                                W = [];
                                clearInterval(aa);
                                clearInterval(ba);
                                R.stopVideo();
                                R.clearVideo();
                                R.destroy();
                                S = l.createElement("div")
                            }
                        } else {
                            E(function() {
                                F(J)
                            });
                            return
                        }
                    P.appendChild(S);
                    var N = I._util.parseUri(J).queryKey;
                    delete N.v;
                    H.autoplay = N.autoplay === "1" || H.autoplay;
                    delete N.autoplay;
                    H.loop = N.loop === "1" || H.loop;
                    delete N.loop;
                    N.rel = N.rel || 0;
                    N.modestbranding = N.modestbranding || 1;
                    N.iv_load_policy = N.iv_load_policy || 3;
                    N.disablekb = N.disablekb || 1;
                    N.showinfo = N.showinfo || 0;
                    var ea = e.location.protocol === "file:" ?
                        "*" : e.location.protocol + "//" + e.location.host;
                    N.origin = N.origin || ea;
                    N.controls = N.controls || H.controls ? 2 : 0;
                    H.controls = N.controls;
                    N.wmode = N.wmode || "opaque";
                    J = r.exec(J)[1];
                    p.getJSONP("https://gdata.youtube.com/feeds/api/videos/" + J + "?v=2&alt=jsonc&callback=?", function(X) {
                        if (X.error) console.warn("failed to retreive duration data, reason: " + X.error.message);
                        else if (X.data) {
                            H.duration = X.data.duration;
                            I.dispatchEvent("durationchange");
                            R = new YT.Player(S, {
                                width: "100%",
                                height: "100%",
                                wmode: N.wmode,
                                videoId: J,
                                playerVars: N,
                                events: {
                                    onReady: G,
                                    onError: A,
                                    onStateChange: z
                                }
                            });
                            H.networkState = I.NETWORK_LOADING;
                            I.dispatchEvent("loadstart");
                            I.dispatchEvent("progress")
                        } else console.warn("failed to retreive duration data, reason: no response data")
                    })
                } else h(function() {
                    F(J)
                })
            } else {
                H.error = {
                    name: "MediaError",
                    message: "Media Source Not Supported",
                    code: MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
                };
                I.dispatchEvent("error")
            }
        }

        function v() {
            var J = R.getCurrentTime();
            if (H.seeking) m(J - H.currentTime) < 1 && Q();
            else {
                if (m(H.currentTime - J) > g) {
                    B();
                    Q()
                }
                H.currentTime =
                    J
            }
        }

        function L() {
            var J = R.getVideoLoadedFraction();
            if (J && $ !== J) {
                $ = J;
                I.dispatchEvent("progress")
            }
        }

        function y(J) {
            if (J !== H.currentTime) {
                H.currentTime = J;
                if (U) {
                    B();
                    R.seekTo(J)
                } else E(function() {
                    B();
                    R.seekTo(J)
                })
            }
        }

        function s() {
            I.dispatchEvent("timeupdate")
        }

        function B() {
            n("pause", f);
            j("pause", M);
            H.seeking = true;
            I.dispatchEvent("seeking")
        }

        function Q() {
            H.ended = false;
            H.seeking = false;
            I.dispatchEvent("timeupdate");
            I.dispatchEvent("seeked");
            I.dispatchEvent("canplay");
            I.dispatchEvent("canplaythrough")
        }

        function K() {
            if (H.ended) {
                y(0);
                H.ended = false
            }
            da = setInterval(s, I._util.TIMEUPDATE_MS);
            H.paused = false;
            if (Y) {
                Y = false;
                if (H.loop && !Z || !H.loop) {
                    Z = true;
                    I.dispatchEvent("play")
                }
                I.dispatchEvent("playing")
            }
        }

        function M() {
            H.paused = true;
            if (!Y) {
                Y = true;
                clearInterval(da);
                I.dispatchEvent("pause")
            }
        }

        function D() {
            if (H.loop) {
                y(0);
                I.play()
            } else {
                H.ended = true;
                M();
                n("play", C);
                j("play", K);
                I.dispatchEvent("timeupdate");
                I.dispatchEvent("ended")
            }
        }

        function T(J) {
            H.muted = J;
            if (U) {
                R[J ? "mute" : "unMute"]();
                I.dispatchEvent("volumechange")
            } else E(function() {
                T(H.muted)
            })
        }
        if (!e.postMessage) throw "ERROR: HTMLYouTubeVideoElement requires window.postMessage";
        var I = new p._MediaElementProto,
            P = typeof u === "string" ? l.querySelector(u) : u,
            S = l.createElement("div"),
            H = {
                src: k,
                networkState: I.NETWORK_EMPTY,
                readyState: I.HAVE_NOTHING,
                seeking: false,
                autoplay: k,
                preload: k,
                controls: false,
                loop: false,
                poster: k,
                volume: 1,
                muted: false,
                currentTime: 0,
                duration: NaN,
                ended: false,
                paused: true,
                error: null
            },
            V = false,
            U = false,
            Z = false,
            R, Y = true,
            W = [],
            ca = -1,
            ba, $ = 0,
            aa, da;
        I._eventNamespace = p.guid("HTMLYouTubeVideoElement::");
        I.parentNode = P;
        I._util.type = "YouTube";
        n("buffering", x);
        n("ended", D);
        I.play = function() {
            H.paused = false;
            U ? R.playVideo() : E(function() {
                I.play()
            })
        };
        I.pause = function() {
            H.paused = true;
            if (U) {
                f();
                R.pauseVideo()
            } else E(function() {
                I.pause()
            })
        };
        Object.defineProperties(I, {
            src: {
                get: function() {
                    return H.src
                },
                set: function(J) {
                    J && J !== H.src && F(J)
                }
            },
            autoplay: {
                get: function() {
                    return H.autoplay
                },
                set: function(J) {
                    H.autoplay = I._util.isAttributeSet(J)
                }
            },
            loop: {
                get: function() {
                    return H.loop
                },
                set: function(J) {
                    H.loop = I._util.isAttributeSet(J)
                }
            },
            width: {
                get: function() {
                    return I.parentNode.offsetWidth
                }
            },
            height: {
                get: function() {
                    return I.parentNode.offsetHeight
                }
            },
            currentTime: {
                get: function() {
                    return H.currentTime
                },
                set: function(J) {
                    y(J)
                }
            },
            duration: {
                get: function() {
                    return H.duration
                }
            },
            ended: {
                get: function() {
                    return H.ended
                }
            },
            paused: {
                get: function() {
                    return H.paused
                }
            },
            seeking: {
                get: function() {
                    return H.seeking
                }
            },
            readyState: {
                get: function() {
                    return H.readyState
                }
            },
            networkState: {
                get: function() {
                    return H.networkState
                }
            },
            volume: {
                get: function() {
                    return H.volume
                },
                set: function(J) {
                    if (J <
                        0 || J > 1) throw "Volume value must be between 0.0 and 1.0";
                    H.volume = J;
                    if (U) {
                        R.setVolume(H.volume * 100);
                        I.dispatchEvent("volumechange")
                    } else E(function() {
                        I.volume = J
                    })
                }
            },
            muted: {
                get: function() {
                    return H.muted
                },
                set: function(J) {
                    T(I._util.isAttributeSet(J))
                }
            },
            error: {
                get: function() {
                    return H.error
                }
            },
            buffered: {
                get: function() {
                    var J = {
                        start: function(N) {
                            if (N === 0) return 0;
                            throw "INDEX_SIZE_ERR: DOM Exception 1";
                        },
                        end: function(N) {
                            if (N === 0) {
                                if (!H.duration) return 0;
                                return H.duration * $
                            }
                            throw "INDEX_SIZE_ERR: DOM Exception 1";
                        }
                    };
                    Object.defineProperties(J, {
                        length: {
                            get: function() {
                                return 1
                            }
                        }
                    });
                    return J
                },
                configurable: true
            }
        });
        I._canPlaySrc = p.HTMLYouTubeVideoElement._canPlaySrc;
        I.canPlayType = p.HTMLYouTubeVideoElement.canPlayType;
        return I
    }
    var g = 10,
        k = "",
        r = /^.*(?:\/|v=)(.{11})/,
        m = Math.abs,
        t = false,
        q = false,
        o = [];
    p.HTMLYouTubeVideoElement = function(u) {
        return new i(u)
    };
    p.HTMLYouTubeVideoElement._canPlaySrc = function(u) {
        return /(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(youtu).*(?:\/|v=)(.{11})/.test(u) ? "probably" : k
    };
    p.HTMLYouTubeVideoElement.canPlayType =
        function(u) {
            return u === "video/x-youtube" ? "probably" : k
    }
})(Popcorn, window, document);
(function(p, e, l) {
    function d() {
        if (!r) {
            p.getScript("https://w.soundcloud.com/player/api.js", function() {
                p.getScript("https://connect.soundcloud.com/sdk.js", function() {
                    k = true;
                    SC.initialize({
                        client_id: "PRaNFlda6Bhf5utPjUsptg"
                    });
                    for (var t = m.length; t--;) {
                        m[t]();
                        delete m[t]
                    }
                })
            });
            r = true
        }
        return k
    }

    function b(t) {
        m.unshift(t)
    }

    function h(t) {
        function q(D) {
            B.unshift(D)
        }

        function o() {
            s.bind(SC.Widget.Events.LOAD_PROGRESS, function(D) {
                O({
                    type: "loadProgress",
                    data: D.currentPosition / 1E3
                })
            });
            s.bind(SC.Widget.Events.PLAY_PROGRESS,
                function(D) {
                    O({
                        type: "playProgress",
                        data: D.currentPosition / 1E3
                    })
                });
            s.bind(SC.Widget.Events.PLAY, function() {
                O({
                    type: "play"
                })
            });
            s.bind(SC.Widget.Events.PAUSE, function() {
                O({
                    type: "pause"
                })
            });
            s.bind(SC.Widget.Events.SEEK, function() {
                s.getPosition(function(D) {
                    D = D / 1E3;
                    if (v.seeking)
                        if (Math.floor(D) !== Math.floor(v.currentTime)) s.seekTo(v.currentTime * 1E3);
                        else {
                            v.ended = false;
                            v.seeking = false;
                            x.dispatchEvent("timeupdate");
                            x.dispatchEvent("seeked");
                            x.dispatchEvent("canplay");
                            x.dispatchEvent("canplaythrough")
                        } else O({
                        type: "seek",
                        data: D
                    })
                })
            });
            s.bind(SC.Widget.Events.FINISH, function() {
                O({
                    type: "finish"
                })
            });
            L = true;
            s.getDuration(E)
        }

        function u() {
            s.bind(SC.Widget.Events.PLAY_PROGRESS, function(D) {
                s.setVolume(0);
                if (D.currentPosition > 0) {
                    s.unbind(SC.Widget.Events.PLAY_PROGRESS);
                    s.bind(SC.Widget.Events.PAUSE, function() {
                        s.unbind(SC.Widget.Events.PAUSE);
                        s.setVolume(100);
                        s.bind(SC.Widget.Events.SEEK, function() {
                            s.unbind(SC.Widget.Events.SEEK);
                            o()
                        });
                        s.seekTo(0)
                    });
                    s.pause()
                }
            });
            s.play()
        }

        function E(D) {
            D /= 1E3;
            var T = v.duration;
            if (T !== D) {
                v.duration =
                    D;
                x.dispatchEvent("durationchange");
                if (isNaN(T)) {
                    v.networkState = x.NETWORK_IDLE;
                    v.readyState = x.HAVE_METADATA;
                    x.dispatchEvent("loadedmetadata");
                    x.dispatchEvent("loadeddata");
                    v.readyState = x.HAVE_FUTURE_DATA;
                    x.dispatchEvent("canplay");
                    v.readyState = x.HAVE_ENOUGH_DATA;
                    x.dispatchEvent("canplaythrough");
                    for (D = B.length; D--;) {
                        B[D]();
                        delete B[D]
                    }
                    v.paused && v.autoplay && x.play()
                }
            }
        }

        function C(D) {
            function T() {
                v.seeking = true;
                x.dispatchEvent("seeking");
                s.seekTo(D)
            }
            v.currentTime = D;
            D *= 1E3;
            L ? T() : addMediaReadyCallback(T)
        }

        function f() {
            v.paused = true;
            if (!y) {
                y = true;
                clearInterval(Q);
                x.dispatchEvent("pause")
            }
        }

        function G() {
            x.dispatchEvent("timeupdate")
        }

        function A(D) {
            v.currentTime = D;
            D !== M && x.dispatchEvent("timeupdate");
            M = D
        }

        function O(D) {
            switch (D.type) {
                case "loadProgress":
                    x.dispatchEvent("progress");
                    break;
                case "playProgress":
                    A(D.data);
                    break;
                case "play":
                    if (!K) {
                        K = setInterval(a, i);
                        v.loop && x.dispatchEvent("play")
                    }
                    Q = setInterval(G, x._util.TIMEUPDATE_MS);
                    v.paused = false;
                    if (y) {
                        y = false;
                        v.loop || x.dispatchEvent("play");
                        x.dispatchEvent("playing")
                    }
                    break;
                case "pause":
                    f();
                    break;
                case "finish":
                    if (v.loop) {
                        C(0);
                        x.play()
                    } else {
                        v.ended = true;
                        x.pause();
                        f();
                        x.dispatchEvent("timeupdate");
                        x.dispatchEvent("ended")
                    }
                    break;
                case "seek":
                    A(D.data)
            }
        }

        function a() {
            v.ended || s.getPosition(function(D) {
                A(D / 1E3)
            })
        }

        function c(D) {
            if (x._canPlaySrc(D)) {
                v.src = D;
                if (L)
                    if (L && s) {
                        clearInterval(K);
                        s.pause();
                        s.unbind(SC.Widget.Events.READY);
                        s.unbind(SC.Widget.Events.LOAD_PROGRESS);
                        s.unbind(SC.Widget.Events.PLAY_PROGRESS);
                        s.unbind(SC.Widget.Events.PLAY);
                        s.unbind(SC.Widget.Events.PAUSE);
                        s.unbind(SC.Widget.Events.SEEK);
                        s.unbind(SC.Widget.Events.FINISH);
                        z.removeChild(F);
                        F = l.createElement("iframe")
                    }
                if (d()) {
                    L = false;
                    SC.get("/resolve", {
                        url: D
                    }, function(T) {
                        var I;
                        if (T.errors) {
                            I = {
                                name: "MediaError"
                            };
                            if (T.errors[0])
                                if (T.errors[0].error_message === "404 - Not Found") {
                                    I.message = "Video not found.";
                                    I.code = MediaError.MEDIA_ERR_NETWORK
                                }
                            v.error = I;
                            x.dispatchEvent("error")
                        }
                        F.id = p.guid("soundcloud-");
                        F.width = v.width;
                        F.height = v.height;
                        F.frameBorder = 0;
                        F.webkitAllowFullScreen = true;
                        F.mozAllowFullScreen = true;
                        F.allowFullScreen = true;
                        w(v.controls);
                        z.appendChild(F);
                        F.onload = function() {
                            F.onload = null;
                            s = SC.Widget(F);
                            s.bind(SC.Widget.Events.READY, u);
                            v.networkState = x.NETWORK_LOADING;
                            x.dispatchEvent("loadstart");
                            x.dispatchEvent("progress")
                        };
                        F.src = "https://w.soundcloud.com/player/?url=" + T.uri + "&show_artwork=false&buying=false&liking=false&sharing=false&download=false&show_comments=false&show_user=false&single_active=false"
                    })
                } else b(function() {
                    c(D)
                })
            } else {
                v.error = {
                    name: "MediaError",
                    message: "Media Source Not Supported",
                    code: MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
                };
                x.dispatchEvent("error")
            }
        }

        function n(D) {
            v.volume = D;
            if (L) {
                s.setVolume(D);
                x.dispatchEvent("volumechange")
            } else q(function() {
                n(D)
            })
        }

        function j(D) {
            if (L)
                if (D) {
                    v.muted = v.volume;
                    n(0)
                } else {
                    v.muted = 0;
                    n(v.muted)
                } else {
                v.muted = D ? 1 : 0;
                q(function() {
                    j(D)
                })
            }
        }

        function w(D) {
            if (L) {
                F.style.position = "absolute";
                F.style.visibility = D ? "visible" : "hidden"
            } else {
                F.style.opacity = D ? "1" : "0";
                F.style.pointerEvents = D ? "auto" : "none"
            }
            v.controls = D
        }
        if (!e.postMessage) throw "ERROR: HTMLSoundCloudAudioElement requires window.postMessage";
        var x = new p._MediaElementProto,
            z = typeof t === "string" ? p.dom.find(t) : t,
            F = l.createElement("iframe"),
            v = {
                src: g,
                networkState: x.NETWORK_EMPTY,
                readyState: x.HAVE_NOTHING,
                seeking: false,
                autoplay: g,
                preload: g,
                controls: false,
                loop: false,
                poster: g,
                volume: 100,
                muted: 0,
                currentTime: 0,
                duration: NaN,
                ended: false,
                paused: true,
                width: z.width | 0 ? z.width : x._util.MIN_WIDTH,
                height: z.height | 0 ? z.height : x._util.MIN_HEIGHT,
                error: null
            },
            L = false,
            y = true,
            s, B = [],
            Q, K, M = 0;
        x._eventNamespace = p.guid("HTMLSoundCloudAudioElement::");
        x.parentNode =
            z;
        x._util.type = "SoundCloud";
        x.play = function() {
            v.paused = false;
            if (L) {
                v.ended && C(0);
                s.play()
            } else q(function() {
                x.play()
            })
        };
        x.pause = function() {
            v.paused = true;
            L ? s.pause() : q(function() {
                x.pause()
            })
        };
        Object.defineProperties(x, {
            src: {
                get: function() {
                    return v.src
                },
                set: function(D) {
                    D && D !== v.src && c(D)
                }
            },
            autoplay: {
                get: function() {
                    return v.autoplay
                },
                set: function(D) {
                    v.autoplay = x._util.isAttributeSet(D)
                }
            },
            loop: {
                get: function() {
                    return v.loop
                },
                set: function(D) {
                    v.loop = x._util.isAttributeSet(D)
                }
            },
            width: {
                get: function() {
                    return F.width
                },
                set: function(D) {
                    F.width = D;
                    v.width = F.width
                }
            },
            height: {
                get: function() {
                    return F.height
                },
                set: function(D) {
                    F.height = D;
                    v.height = F.height
                }
            },
            currentTime: {
                get: function() {
                    return v.currentTime
                },
                set: function(D) {
                    C(D)
                }
            },
            duration: {
                get: function() {
                    return v.duration
                }
            },
            ended: {
                get: function() {
                    return v.ended
                }
            },
            paused: {
                get: function() {
                    return v.paused
                }
            },
            seeking: {
                get: function() {
                    return v.seeking
                }
            },
            readyState: {
                get: function() {
                    return v.readyState
                }
            },
            networkState: {
                get: function() {
                    return v.networkState
                }
            },
            volume: {
                get: function() {
                    return (v.muted >
                        0 ? v.muted : v.volume) / 100
                },
                set: function(D) {
                    if (D < 0 || D > 1) throw "Volume value must be between 0.0 and 1.0";
                    D *= 100;
                    n(D)
                }
            },
            muted: {
                get: function() {
                    return v.muted > 0
                },
                set: function(D) {
                    j(x._util.isAttributeSet(D))
                }
            },
            error: {
                get: function() {
                    return v.error
                }
            },
            controls: {
                get: function() {
                    return v.controls
                },
                set: function(D) {
                    w(!!D)
                }
            }
        });
        x._canPlaySrc = p.HTMLSoundCloudAudioElement._canPlaySrc;
        x.canPlayType = p.HTMLSoundCloudAudioElement.canPlayType;
        return x
    }
    var i = 16,
        g = "",
        k = false,
        r = false,
        m = [];
    p.HTMLSoundCloudAudioElement = function(t) {
        return new h(t)
    };
    p.HTMLSoundCloudAudioElement._canPlaySrc = function(t) {
        return /(?:https?:\/\/www\.|https?:\/\/|www\.|\.|^)(soundcloud)/.test(t) ? "probably" : g
    };
    p.HTMLSoundCloudAudioElement.canPlayType = function(t) {
        return t === "audio/x-soundcloud" ? "probably" : g
    }
})(Popcorn, window, document);
(function(p) {
    var e = function(l, d) {
        var b = 0,
            h = 0,
            i;
        p.forEach(d.classes, function(g, k) {
            i = [];
            if (g === "parent") i[0] = document.querySelectorAll("#" + d.target)[0].parentNode;
            else i = document.querySelectorAll("#" + d.target + " " + g);
            b = 0;
            for (h = i.length; b < h; b++) i[b].classList.toggle(k)
        })
    };
    p.compose("applyclass", {
        manifest: {
            about: {
                name: "Popcorn applyclass Effect",
                version: "0.1",
                author: "@scottdowne",
                website: "scottdowne.wordpress.com"
            },
            options: {}
        },
        _setup: function(l) {
            l.classes = {};
            l.applyclass = l.applyclass || "";
            for (var d = l.applyclass.replace(/\s/g,
                "").split(","), b = [], h = 0, i = d.length; h < i; h++) {
                b = d[h].split(":");
                if (b[0]) l.classes[b[0]] = b[1] || ""
            }
        },
        start: e,
        end: e
    })
})(Popcorn);
(function(p) {
    function e(d, b) {
        if (d.map) d.map.div.style.display = b;
        else setTimeout(function() {
            e(d, b)
        }, 10)
    }
    var l = 1;
    p.plugin("openmap", function(d) {
        var b, h, i, g, k, r, m, t, q = document.getElementById(d.target);
        b = document.createElement("div");
        b.id = "openmapdiv" + l;
        b.style.width = "100%";
        b.style.height = "100%";
        l++;
        q && q.appendChild(b);
        t = function() {
            if (window.OpenLayers && window.OpenLayers.Layer.Stamen) {
                if (d.location) {
                    location = new OpenLayers.LonLat(0, 0);
                    p.getJSONP("//tinygeocoder.com/create-api.php?q=" + d.location + "&callback=jsonp",
                        function(u) {
                            h = new OpenLayers.LonLat(u[1], u[0])
                        })
                } else h = new OpenLayers.LonLat(d.lng, d.lat);
                d.type = d.type || "ROADMAP";
                switch (d.type) {
                    case "SATELLITE":
                        d.map = new OpenLayers.Map({
                            div: b,
                            maxResolution: 0.28125,
                            tileSize: new OpenLayers.Size(512, 512)
                        });
                        var o = new OpenLayers.Layer.WorldWind("LANDSAT", "//worldwind25.arc.nasa.gov/tile/tile.aspx", 2.25, 4, {
                            T: "105"
                        });
                        d.map.addLayer(o);
                        g = new OpenLayers.Projection("EPSG:4326");
                        i = new OpenLayers.Projection("EPSG:4326");
                        break;
                    case "TERRAIN":
                        g = new OpenLayers.Projection("EPSG:4326");
                        i = new OpenLayers.Projection("EPSG:4326");
                        d.map = new OpenLayers.Map({
                            div: b,
                            projection: i
                        });
                        o = new OpenLayers.Layer.WMS("USGS Terraserver", "//terraserver-usa.org/ogcmap.ashx?", {
                            layers: "DRG"
                        });
                        d.map.addLayer(o);
                        break;
                    case "STAMEN-TONER":
                    case "STAMEN-WATERCOLOR":
                    case "STAMEN-TERRAIN":
                        o = d.type.replace("STAMEN-", "").toLowerCase();
                        o = new OpenLayers.Layer.Stamen(o);
                        g = new OpenLayers.Projection("EPSG:4326");
                        i = new OpenLayers.Projection("EPSG:900913");
                        h = h.transform(g, i);
                        d.map = new OpenLayers.Map({
                            div: b,
                            projection: i,
                            displayProjection: g,
                            controls: [new OpenLayers.Control.Navigation, new OpenLayers.Control.PanPanel, new OpenLayers.Control.ZoomPanel]
                        });
                        d.map.addLayer(o);
                        break;
                    default:
                        i = new OpenLayers.Projection("EPSG:900913");
                        g = new OpenLayers.Projection("EPSG:4326");
                        h = h.transform(g, i);
                        d.map = new OpenLayers.Map({
                            div: b,
                            projection: i,
                            displayProjection: g
                        });
                        o = new OpenLayers.Layer.OSM;
                        d.map.addLayer(o)
                }
                if (d.map) {
                    d.map.setCenter(h, d.zoom || 10);
                    d.map.div.style.display = "none"
                }
            } else setTimeout(function() {
                t()
            }, 50)
        };
        t();
        return {
            _setup: function(o) {
                window.OpenLayers ||
                    p.getScript("//openlayers.org/api/OpenLayers.js", function() {
                        p.getScript("//maps.stamen.com/js/tile.stamen.js")
                    });
                var u = function() {
                    if (o.map) {
                        o.zoom = o.zoom || 2;
                        if (o.zoom && typeof o.zoom !== "number") o.zoom = +o.zoom;
                        o.map.setCenter(h, o.zoom);
                        if (o.markers) {
                            var E = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style["default"]),
                                C = function(j) {
                                    clickedFeature = j.feature;
                                    if (clickedFeature.attributes.text) {
                                        m = new OpenLayers.Popup.FramedCloud("featurePopup", clickedFeature.geometry.getBounds().getCenterLonLat(),
                                            new OpenLayers.Size(120, 250), clickedFeature.attributes.text, null, true, function() {
                                                r.unselect(this.feature)
                                            });
                                        clickedFeature.popup = m;
                                        m.feature = clickedFeature;
                                        o.map.addPopup(m)
                                    }
                                },
                                f = function(j) {
                                    feature = j.feature;
                                    if (feature.popup) {
                                        m.feature = null;
                                        o.map.removePopup(feature.popup);
                                        feature.popup.destroy();
                                        feature.popup = null
                                    }
                                },
                                G = function(j) {
                                    p.getJSONP("//tinygeocoder.com/create-api.php?q=" + j.location + "&callback=jsonp", function(w) {
                                        w = (new OpenLayers.Geometry.Point(w[1], w[0])).transform(g, i);
                                        var x = OpenLayers.Util.extend({},
                                            E);
                                        if (!j.size || isNaN(j.size)) j.size = 14;
                                        x.pointRadius = j.size;
                                        x.graphicOpacity = 1;
                                        x.externalGraphic = j.icon;
                                        w = new OpenLayers.Feature.Vector(w, null, x);
                                        if (j.text) w.attributes = {
                                            text: j.text
                                        };
                                        k.addFeatures([w])
                                    })
                                };
                            k = new OpenLayers.Layer.Vector("Point Layer", {
                                style: E
                            });
                            o.map.addLayer(k);
                            for (var A = 0, O = o.markers.length; A < O; A++) {
                                var a = o.markers[A];
                                if (a.text)
                                    if (!r) {
                                        r = new OpenLayers.Control.SelectFeature(k);
                                        o.map.addControl(r);
                                        r.activate();
                                        k.events.on({
                                            featureselected: C,
                                            featureunselected: f
                                        })
                                    }
                                if (a.location) G(a);
                                else {
                                    var c = (new OpenLayers.Geometry.Point(a.lng, a.lat)).transform(g, i),
                                        n = OpenLayers.Util.extend({}, E);
                                    if (!a.size || isNaN(a.size)) a.size = 14;
                                    n.pointRadius = a.size;
                                    n.graphicOpacity = 1;
                                    n.externalGraphic = a.icon;
                                    c = new OpenLayers.Feature.Vector(c, null, n);
                                    if (a.text) c.attributes = {
                                        text: a.text
                                    };
                                    k.addFeatures([c])
                                }
                            }
                        }
                    } else setTimeout(function() {
                        u()
                    }, 13)
                };
                u()
            },
            start: function(o, u) {
                e(u, "block")
            },
            end: function(o, u) {
                e(u, "none")
            },
            _teardown: function() {
                q && q.removeChild(b);
                b = map = h = i = g = k = r = m = null
            }
        }
    }, {
        about: {
            name: "Popcorn OpenMap Plugin",
            version: "0.3",
            author: "@mapmeld",
            website: "mapadelsur.blogspot.com"
        },
        options: {
            start: {
                elem: "input",
                type: "number",
                label: "Start"
            },
            end: {
                elem: "input",
                type: "number",
                label: "End"
            },
            target: "map-container",
            type: {
                elem: "select",
                options: ["ROADMAP", "SATELLITE", "TERRAIN"],
                label: "Map Type",
                optional: true
            },
            zoom: {
                elem: "input",
                type: "number",
                label: "Zoom",
                "default": 2
            },
            lat: {
                elem: "input",
                type: "text",
                label: "Lat",
                optional: true
            },
            lng: {
                elem: "input",
                type: "text",
                label: "Lng",
                optional: true
            },
            location: {
                elem: "input",
                type: "text",
                label: "Location",
                "default": "Toronto, Ontario, Canada"
            },
            markers: {
                elem: "input",
                type: "text",
                label: "List Markers",
                optional: true
            }
        }
    })
})(Popcorn);
var wikiCallback;
(function(p) {
    p.plugin("wikipedia", {
        manifest: {
            about: {
                name: "Popcorn Wikipedia Plugin",
                version: "0.1",
                author: "@annasob",
                website: "annasob.wordpress.com"
            },
            options: {
                start: {
                    elem: "input",
                    type: "number",
                    label: "Start"
                },
                end: {
                    elem: "input",
                    type: "number",
                    label: "End"
                },
                lang: {
                    elem: "input",
                    type: "text",
                    label: "Language",
                    "default": "english",
                    optional: true
                },
                src: {
                    elem: "input",
                    type: "url",
                    label: "Wikipedia URL",
                    "default": "http://en.wikipedia.org/wiki/Cat"
                },
                title: {
                    elem: "input",
                    type: "text",
                    label: "Title",
                    "default": "Cats",
                    optional: true
                },
                numberofwords: {
                    elem: "input",
                    type: "number",
                    label: "Number of Words",
                    "default": "200",
                    optional: true
                },
                target: "wikipedia-container"
            }
        },
        _setup: function(e) {
            var l, d = p.guid();
            if (!e.lang) e.lang = "en";
            e.numberofwords = e.numberofwords || 200;
            window["wikiCallback" + d] = function(b) {
                e._link = document.createElement("a");
                e._link.setAttribute("href", e.src);
                e._link.setAttribute("target", "_blank");
                e._link.innerHTML = e.title || b.parse.displaytitle;
                e._desc = document.createElement("p");
                l = b.parse.text["*"].substr(b.parse.text["*"].indexOf("<p>"));
                l = l.replace(/((<(.|\n)+?>)|(\((.*?)\) )|(\[(.*?)\]))/g, "");
                l = l.split(" ");
                e._desc.innerHTML = l.slice(0, l.length >= e.numberofwords ? e.numberofwords : l.length).join(" ") + " ...";
                e._fired = true
            };
            e.src && p.getScript("//" + e.lang + ".wikipedia.org/w/api.php?action=parse&props=text&redirects&page=" + e.src.slice(e.src.lastIndexOf("/") + 1) + "&format=json&callback=wikiCallback" + d);
            e.toString = function() {
                return e.src || e._natives.manifest.options.src["default"]
            }
        },
        start: function(e, l) {
            var d = function() {
                if (l._fired) {
                    if (l._link &&
                        l._desc)
                        if (document.getElementById(l.target)) {
                            document.getElementById(l.target).appendChild(l._link);
                            document.getElementById(l.target).appendChild(l._desc);
                            l._added = true
                        }
                } else setTimeout(function() {
                    d()
                }, 13)
            };
            d()
        },
        end: function(e, l) {
            if (l._added) {
                document.getElementById(l.target).removeChild(l._link);
                document.getElementById(l.target).removeChild(l._desc)
            }
        },
        _teardown: function(e) {
            if (e._added) {
                e._link.parentNode && document.getElementById(e.target).removeChild(e._link);
                e._desc.parentNode && document.getElementById(e.target).removeChild(e._desc);
                delete e.target
            }
        }
    })
})(Popcorn);
(function(p) {
    var e = 0,
        l = function(d, b) {
            var h = d.container = document.createElement("div"),
                i = h.style,
                g = d.media,
                k = function() {
                    var r = d.position();
                    i.fontSize = "18px";
                    i.width = g.offsetWidth + "px";
                    i.top = r.top + g.offsetHeight - h.offsetHeight - 40 + "px";
                    i.left = r.left + "px";
                    setTimeout(k, 10)
                };
            h.id = b || p.guid();
            i.position = "absolute";
            i.color = "white";
            i.textShadow = "black 2px 2px 6px";
            i.fontWeight = "bold";
            i.textAlign = "center";
            k();
            d.media.parentNode.appendChild(h);
            return h
        };
    p.plugin("subtitle", {
        manifest: {
            about: {
                name: "Popcorn Subtitle Plugin",
                version: "0.1",
                author: "Scott Downe",
                website: "http://scottdowne.wordpress.com/"
            },
            options: {
                start: {
                    elem: "input",
                    type: "text",
                    label: "Start"
                },
                end: {
                    elem: "input",
                    type: "text",
                    label: "End"
                },
                target: "subtitle-container",
                text: {
                    elem: "input",
                    type: "text",
                    label: "Text"
                }
            }
        },
        _setup: function(d) {
            var b = document.createElement("div");
            b.id = "subtitle-" + e++;
            b.style.display = "none";
            !this.container && (!d.target || d.target === "subtitle-container") && l(this);
            d.container = d.target && d.target !== "subtitle-container" ? document.getElementById(d.target) ||
                l(this, d.target) : this.container;
            document.getElementById(d.container.id) && document.getElementById(d.container.id).appendChild(b);
            d.innerContainer = b;
            d.showSubtitle = function() {
                d.innerContainer.innerHTML = d.text || ""
            }
        },
        start: function(d, b) {
            b.innerContainer.style.display = "inline";
            b.showSubtitle(b, b.text)
        },
        end: function(d, b) {
            b.innerContainer.style.display = "none";
            b.innerContainer.innerHTML = ""
        },
        _teardown: function(d) {
            d.container.removeChild(d.innerContainer)
        }
    })
})(Popcorn);
(function(p, e) {
    var l = {};
    p.plugin("documentcloud", {
        manifest: {
            about: {
                name: "Popcorn Document Cloud Plugin",
                version: "0.1",
                author: "@humphd, @ChrisDeCairos",
                website: "http://vocamus.net/dave"
            },
            options: {
                start: {
                    elem: "input",
                    type: "number",
                    label: "Start"
                },
                end: {
                    elem: "input",
                    type: "number",
                    label: "End"
                },
                target: "documentcloud-container",
                width: {
                    elem: "input",
                    type: "text",
                    label: "Width",
                    optional: true
                },
                height: {
                    elem: "input",
                    type: "text",
                    label: "Height",
                    optional: true
                },
                src: {
                    elem: "input",
                    type: "url",
                    label: "PDF URL",
                    "default": "http://www.documentcloud.org/documents/70050-urbina-day-1-in-progress.html"
                },
                preload: {
                    elem: "input",
                    type: "checkbox",
                    label: "Preload",
                    "default": true
                },
                page: {
                    elem: "input",
                    type: "number",
                    label: "Page Number",
                    optional: true
                },
                aid: {
                    elem: "input",
                    type: "number",
                    label: "Annotation Id",
                    optional: true
                }
            }
        },
        _setup: function(d) {
            function b() {
                function m(j) {
                    d._key = j.api.getId();
                    d._changeView = function(w) {
                        d.aid ? w.pageSet.showAnnotation(w.api.getAnnotation(d.aid)) : w.api.setCurrentPage(d.page)
                    }
                }

                function t() {
                    l[d._key] = {
                        num: 1,
                        id: d._containerId
                    };
                    i.loaded = true
                }
                i.loaded = false;
                var q = d.url.replace(/\.html$/, ".js"),
                    o = d.target,
                    u = e.getElementById(o),
                    E = e.createElement("div"),
                    C = p.position(u),
                    f = d.width || C.width;
                C = d.height || C.height;
                var G = d.sidebar || true,
                    A = d.text || true,
                    O = d.pdf || true,
                    a = d.showAnnotations || true,
                    c = d.zoom || 700,
                    n = d.search || true;
                if (! function(j) {
                    var w = false;
                    p.forEach(i.viewers, function(x) {
                        if (x.api.getSchema().canonicalURL === j) {
                            m(x);
                            x = l[d._key];
                            d._containerId = x.id;
                            x.num += 1;
                            w = true;
                            i.loaded = true
                        }
                    });
                    return w
                }(d.url)) {
                    E.id = d._containerId = p.guid(o);
                    o = "#" + E.id;
                    u.appendChild(E);
                    g.trigger("documentready");
                    i.load(q, {
                        width: f,
                        height: C,
                        sidebar: G,
                        text: A,
                        pdf: O,
                        showAnnotations: a,
                        zoom: c,
                        search: n,
                        container: o,
                        afterLoad: d.page || d.aid ? function(j) {
                            m(j);
                            d._changeView(j);
                            E.style.visibility = "hidden";
                            j.elements.pages.hide();
                            t()
                        } : function(j) {
                            m(j);
                            t();
                            E.style.visibility = "hidden";
                            j.elements.pages.hide()
                        }
                    })
                }
            }

            function h() {
                window.DV.loaded ? b() : setTimeout(h, 25)
            }
            var i = window.DV = window.DV || {},
                g = this;
            if (i.loading) h();
            else {
                i.loading = true;
                i.recordHit = "//www.documentcloud.org/pixel.gif";
                var k = e.createElement("link"),
                    r = e.getElementsByTagName("head")[0];
                k.rel = "stylesheet";
                k.type = "text/css";
                k.media = "screen";
                k.href = "//s3.documentcloud.org/viewer/viewer-datauri.css";
                r.appendChild(k);
                i.loaded = false;
                p.getScript("http://s3.documentcloud.org/viewer/viewer.js", function() {
                    i.loading = false;
                    b()
                })
            }
            d.toString = function() {
                return d.src || d._natives.manifest.options.src["default"]
            }
        },
        start: function(d, b) {
            var h = e.getElementById(b._containerId),
                i = DV.viewers[b._key];
            (b.page || b.aid) && i && b._changeView(i);
            if (h && i) {
                h.style.visibility = "visible";
                i.elements.pages.show()
            }
        },
        end: function(d,
            b) {
            var h = e.getElementById(b._containerId);
            if (h && DV.viewers[b._key]) {
                h.style.visibility = "hidden";
                DV.viewers[b._key].elements.pages.hide()
            }
        },
        _teardown: function(d) {
            var b = e.getElementById(d._containerId);
            if ((d = d._key) && DV.viewers[d] && --l[d].num === 0) {
                for (DV.viewers[d].api.unload(); b.hasChildNodes();) b.removeChild(b.lastChild);
                b.parentNode.removeChild(b)
            }
        }
    })
})(Popcorn, window.document);
(function(p) {
    var e = /(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(youtu|vimeo|soundcloud|baseplayer)/,
        l = {},
        d = {
            vimeo: false,
            youtube: false,
            soundcloud: false,
            module: false
        };
    Object.defineProperty(l, void 0, {
        get: function() {
            return d[void 0]
        },
        set: function(b) {
            d[void 0] = b
        }
    });
    p.plugin("mediaspawner", {
        manifest: {
            about: {
                name: "Popcorn Media Spawner Plugin",
                version: "0.1",
                author: "Matthew Schranz, @mjschranz",
                website: "mschranz.wordpress.com"
            },
            options: {
                source: {
                    elem: "input",
                    type: "text",
                    label: "Media Source",
                    "default": "http://www.youtube.com/watch?v=CXDstfD9eJ0"
                },
                caption: {
                    elem: "input",
                    type: "text",
                    label: "Media Caption",
                    "default": "Popcorn Popping",
                    optional: true
                },
                target: "mediaspawner-container",
                start: {
                    elem: "input",
                    type: "number",
                    label: "Start"
                },
                end: {
                    elem: "input",
                    type: "number",
                    label: "End"
                },
                autoplay: {
                    elem: "input",
                    type: "checkbox",
                    label: "Autoplay Video",
                    optional: true
                },
                width: {
                    elem: "input",
                    type: "number",
                    label: "Media Width",
                    "default": 400,
                    units: "px",
                    optional: true
                },
                height: {
                    elem: "input",
                    type: "number",
                    label: "Media Height",
                    "default": 200,
                    units: "px",
                    optional: true
                }
            }
        },
        _setup: function(b) {
            function h() {
                function t() {
                    if (k !==
                        "HTML5" && !window.Popcorn[k]) setTimeout(function() {
                        t()
                    }, 300);
                    else {
                        b.id = b._container.id;
                        b._container.style.width = b.width + "px";
                        b._container.style.height = b.height + "px";
                        b.popcorn = p.smart("#" + b.id, b.source);
                        k === "HTML5" && b.popcorn.controls(true);
                        b._container.style.width = "0px";
                        b._container.style.height = "0px";
                        b._container.style.visibility = "hidden";
                        b._container.style.overflow = "hidden"
                    }
                }
                if (k !== "HTML5" && !window.Popcorn[k] && !l[k]) {
                    l[k] = true;
                    p.getScript("http://popcornjs.org/code/players/" + k + "/popcorn." + k + ".js",
                        function() {
                            t()
                        })
                } else t()
            }

            function i() {
                window.Popcorn.player ? h() : setTimeout(function() {
                    i()
                }, 300)
            }
            var g = document.getElementById(b.target) || {},
                k, r, m;
            if (r = e.exec(b.source)) {
                k = r[1];
                if (k === "youtu") k = "youtube"
            } else k = "HTML5";
            b._type = k;
            b._container = document.createElement("div");
            r = b._container;
            r.id = "mediaSpawnerdiv-" + p.guid();
            b.width = b.width || 400;
            b.height = b.height || 200;
            if (b.caption) {
                m = document.createElement("div");
                m.innerHTML = b.caption;
                m.style.display = "none";
                b._capCont = m;
                r.appendChild(m)
            }
            g && g.appendChild(r);
            if (!window.Popcorn.player && !l.module) {
                l.module = true;
                p.getScript("http://popcornjs.org/code/modules/player/popcorn.player.js", i)
            } else i();
            b.toString = function() {
                return b.source || b._natives.manifest.options.source["default"]
            }
        },
        start: function(b, h) {
            if (h._capCont) h._capCont.style.display = "";
            h._container.style.width = h.width + "px";
            h._container.style.height = h.height + "px";
            h._container.style.visibility = "visible";
            h._container.style.overflow = "visible";
            h.autoplay && h.popcorn.play()
        },
        end: function(b, h) {
            if (h._capCont) h._capCont.style.display =
                "none";
            h._container.style.width = "0px";
            h._container.style.height = "0px";
            h._container.style.visibility = "hidden";
            h._container.style.overflow = "hidden";
            h.popcorn.pause()
        },
        _teardown: function(b) {
            b.popcorn && b.popcorn.destory && b.popcorn.destroy();
            document.getElementById(b.target) && document.getElementById(b.target).removeChild(b._container)
        }
    })
})(Popcorn, this);
(function(p) {
    var e = 1;
    p.plugin("timeline", function(l) {
        var d = document.getElementById(l.target),
            b = document.createElement("div"),
            h, i = true;
        if (d && !d.firstChild) {
            d.appendChild(h = document.createElement("div"));
            h.style.width = "inherit";
            h.style.height = "inherit";
            h.style.overflow = "auto"
        } else h = d.firstChild;
        b.style.display = "none";
        b.id = "timelineDiv" + e;
        l.direction = l.direction || "up";
        if (l.direction.toLowerCase() === "down") i = false;
        if (d && h) i ? h.insertBefore(b, h.firstChild) : h.appendChild(b);
        e++;
        b.innerHTML = "<p><span id='big' style='font-size:24px; line-height: 130%;' >" +
            l.title + "</span><br /><span id='mid' style='font-size: 16px;'>" + l.text + "</span><br />" + l.innerHTML;
        return {
            start: function(g, k) {
                b.style.display = "block";
                if (k.direction === "down") h.scrollTop = h.scrollHeight
            },
            end: function() {
                b.style.display = "none"
            },
            _teardown: function() {
                h && b && h.removeChild(b) && !h.firstChild && d.removeChild(h)
            }
        }
    }, {
        about: {
            name: "Popcorn Timeline Plugin",
            version: "0.1",
            author: "David Seifried @dcseifried",
            website: "dseifried.wordpress.com"
        },
        options: {
            start: {
                elem: "input",
                type: "number",
                label: "Start"
            },
            end: {
                elem: "input",
                type: "number",
                label: "End"
            },
            target: "feed-container",
            title: {
                elem: "input",
                type: "text",
                label: "Title"
            },
            text: {
                elem: "input",
                type: "text",
                label: "Text"
            },
            innerHTML: {
                elem: "input",
                type: "text",
                label: "HTML Code",
                optional: true
            },
            direction: {
                elem: "select",
                options: ["DOWN", "UP"],
                label: "Direction",
                optional: true
            }
        }
    })
})(Popcorn);
(function(p) {
    var e = 0;
    p.plugin("flickr", function(l) {
        var d, b = document.getElementById(l.target),
            h, i, g, k, r = l.numberofimages || 4,
            m = l.height || "50px",
            t = l.width || "50px",
            q = l.padding || "5px",
            o = l.border || "0px";
        d = document.createElement("div");
        d.id = "flickr" + e;
        d.style.width = "100%";
        d.style.height = "100%";
        d.style.display = "none";
        e++;
        b && b.appendChild(d);
        var u = function() {
                if (h) setTimeout(function() {
                    u()
                }, 5);
                else {
                    i = "http://api.flickr.com/services/rest/?method=flickr.people.findByUsername&";
                    i += "username=" + l.username + "&api_key=" +
                        l.apikey + "&format=json&jsoncallback=flickr";
                    p.getJSONP(i, function(C) {
                        h = C.user.nsid;
                        E()
                    })
                }
            },
            E = function() {
                i = "http://api.flickr.com/services/feeds/photos_public.gne?";
                if (h) i += "id=" + h + "&";
                if (l.tags) i += "tags=" + l.tags + "&";
                i += "lang=en-us&format=json&jsoncallback=flickr";
                p.xhr.getJSONP(i, function(C) {
                    var f = document.createElement("div");
                    f.innerHTML = "<p style='padding:" + q + ";'>" + C.title + "<p/>";
                    p.forEach(C.items, function(G, A) {
                        if (A < r) {
                            g = document.createElement("a");
                            g.setAttribute("href", G.link);
                            g.setAttribute("target",
                                "_blank");
                            k = document.createElement("img");
                            k.setAttribute("src", G.media.m);
                            k.setAttribute("height", m);
                            k.setAttribute("width", t);
                            k.setAttribute("style", "border:" + o + ";padding:" + q);
                            g.appendChild(k);
                            f.appendChild(g)
                        } else return false
                    });
                    d.appendChild(f)
                })
            };
        if (l.username && l.apikey) u();
        else {
            h = l.userid;
            E()
        }
        l.toString = function() {
            return l.tags || l.username || "Flickr"
        };
        return {
            start: function() {
                d.style.display = "inline"
            },
            end: function() {
                d.style.display = "none"
            },
            _teardown: function(C) {
                document.getElementById(C.target) &&
                    document.getElementById(C.target).removeChild(d)
            }
        }
    }, {
        about: {
            name: "Popcorn Flickr Plugin",
            version: "0.2",
            author: "Scott Downe, Steven Weerdenburg, Annasob",
            website: "http://scottdowne.wordpress.com/"
        },
        options: {
            start: {
                elem: "input",
                type: "number",
                label: "Start"
            },
            end: {
                elem: "input",
                type: "number",
                label: "End"
            },
            userid: {
                elem: "input",
                type: "text",
                label: "User ID",
                optional: true
            },
            tags: {
                elem: "input",
                type: "text",
                label: "Tags"
            },
            username: {
                elem: "input",
                type: "text",
                label: "Username",
                optional: true
            },
            apikey: {
                elem: "input",
                type: "text",
                label: "API Key",
                optional: true
            },
            target: "flickr-container",
            height: {
                elem: "input",
                type: "text",
                label: "Height",
                "default": "50px",
                optional: true
            },
            width: {
                elem: "input",
                type: "text",
                label: "Width",
                "default": "50px",
                optional: true
            },
            padding: {
                elem: "input",
                type: "text",
                label: "Padding",
                optional: true
            },
            border: {
                elem: "input",
                type: "text",
                label: "Border",
                "default": "5px",
                optional: true
            },
            numberofimages: {
                elem: "input",
                type: "number",
                "default": 4,
                label: "Number of Images"
            }
        }
    })
})(Popcorn);
(function(p) {
    p.plugin("webpage", {
        manifest: {
            about: {
                name: "Popcorn Webpage Plugin",
                version: "0.1",
                author: "@annasob",
                website: "annasob.wordpress.com"
            },
            options: {
                id: {
                    elem: "input",
                    type: "text",
                    label: "Id",
                    optional: true
                },
                start: {
                    elem: "input",
                    type: "number",
                    label: "Start"
                },
                end: {
                    elem: "input",
                    type: "number",
                    label: "End"
                },
                src: {
                    elem: "input",
                    type: "url",
                    label: "Webpage URL",
                    "default": "http://mozillapopcorn.org"
                },
                target: "iframe-container"
            }
        },
        _setup: function(e) {
            var l = document.getElementById(e.target);
            e.src = e.src.replace(/^(https?:)?(\/\/)?/,
                "//");
            e._iframe = document.createElement("iframe");
            e._iframe.setAttribute("width", "100%");
            e._iframe.setAttribute("height", "100%");
            e._iframe.id = e.id;
            e._iframe.src = e.src;
            e._iframe.style.display = "none";
            l && l.appendChild(e._iframe)
        },
        start: function(e, l) {
            l._iframe.src = l.src;
            l._iframe.style.display = "inline"
        },
        end: function(e, l) {
            l._iframe.style.display = "none"
        },
        _teardown: function(e) {
            document.getElementById(e.target) && document.getElementById(e.target).removeChild(e._iframe)
        }
    })
})(Popcorn);
(function(p) {
    var e = {},
        l = 0,
        d = document.createElement("span"),
        b = ["webkit", "Moz", "ms", "O", ""],
        h = ["Transform", "TransitionDuration", "TransitionTimingFunction"],
        i = {},
        g;
    document.getElementsByTagName("head")[0].appendChild(d);
    for (var k = 0, r = h.length; k < r; k++)
        for (var m = 0, t = b.length; m < t; m++) {
            g = b[m] + h[k];
            if (g in d.style) {
                i[h[k].toLowerCase()] = g;
                break
            }
        }
    document.getElementsByTagName("head")[0].appendChild(d);
    p.plugin("wordriver", {
        manifest: {
            about: {
                name: "Popcorn WordRiver Plugin"
            },
            options: {
                start: {
                    elem: "input",
                    type: "number",
                    label: "Start"
                },
                end: {
                    elem: "input",
                    type: "number",
                    label: "End"
                },
                target: "wordriver-container",
                text: {
                    elem: "input",
                    type: "text",
                    label: "Text",
                    "default": "Popcorn.js"
                },
                color: {
                    elem: "input",
                    type: "text",
                    label: "Color",
                    "default": "Green",
                    optional: true
                }
            }
        },
        _setup: function(q) {
            q._duration = q.end - q.start;
            var o;
            if (!(o = e[q.target])) {
                o = q.target;
                e[o] = document.createElement("div");
                var u = document.getElementById(o);
                u && u.appendChild(e[o]);
                e[o].style.height = "100%";
                e[o].style.position = "relative";
                o = e[o]
            }
            q._container = o;
            q.word = document.createElement("span");
            q.word.style.position = "absolute";
            q.word.style.whiteSpace = "nowrap";
            q.word.style.opacity = 0;
            q.word.style.MozTransitionProperty = "opacity, -moz-transform";
            q.word.style.webkitTransitionProperty = "opacity, -webkit-transform";
            q.word.style.OTransitionProperty = "opacity, -o-transform";
            q.word.style.transitionProperty = "opacity, transform";
            q.word.style[i.transitionduration] = "1s, " + q._duration + "s";
            q.word.style[i.transitiontimingfunction] = "linear";
            q.word.innerHTML = q.text;
            q.word.style.color = q.color || "black"
        },
        start: function(q,
            o) {
            o._container.appendChild(o.word);
            o.word.style[i.transform] = "";
            o.word.style.fontSize = ~~ (30 + 20 * Math.random()) + "px";
            l %= o._container.offsetWidth - o.word.offsetWidth;
            o.word.style.left = l + "px";
            l += o.word.offsetWidth + 10;
            o.word.style[i.transform] = "translateY(" + (o._container.offsetHeight - o.word.offsetHeight) + "px)";
            o.word.style.opacity = 1;
            setTimeout(function() {
                o.word.style.opacity = 0
            }, (o.end - o.start - 1 || 1) * 1E3)
        },
        end: function(q, o) {
            o.word.style.opacity = 0
        },
        _teardown: function(q) {
            var o = document.getElementById(q.target);
            q.word.parentNode && q._container.removeChild(q.word);
            e[q.target] && !e[q.target].childElementCount && o && o.removeChild(e[q.target]) && delete e[q.target]
        }
    })
})(Popcorn);
var googleCallback;
(function(p) {
    function e(g, k, r) {
        g = g.type ? g.type.toUpperCase() : "HYBRID";
        var m;
        if (g === "STAMEN-WATERCOLOR" || g === "STAMEN-TERRAIN" || g === "STAMEN-TONER") m = g.replace("STAMEN-", "").toLowerCase();
        r = new google.maps.Map(r, {
            mapTypeId: m ? m : google.maps.MapTypeId[g],
            mapTypeControlOptions: {
                mapTypeIds: []
            }
        });
        m && r.mapTypes.set(m, new google.maps.StamenMapType(m));
        r.getDiv().style.display = "none";
        return r
    }
    var l = 1,
        d = false,
        b = false,
        h, i;
    googleCallback = function(g) {
        if (typeof google !== "undefined" && google.maps && google.maps.Geocoder &&
            google.maps.LatLng) {
            h = new google.maps.Geocoder;
            p.getScript("//maps.stamen.com/js/tile.stamen.js", function() {
                b = true
            })
        } else setTimeout(function() {
            googleCallback(g)
        }, 1)
    };
    i = function() {
        if (document.body) {
            d = true;
            p.getScript("//maps.google.com/maps/api/js?sensor=false&callback=googleCallback")
        } else setTimeout(function() {
            i()
        }, 1)
    };
    p.plugin("googlemap", function(g) {
        var k, r, m, t = document.getElementById(g.target);
        g.type = g.type || "ROADMAP";
        g.zoom = g.zoom || 1;
        g.lat = g.lat || 0;
        g.lng = g.lng || 0;
        d || i();
        k = document.createElement("div");
        k.id = "actualmap" + l;
        k.style.width = g.width || "100%";
        k.style.height = g.height ? g.height : t && t.clientHeight ? t.clientHeight + "px" : "100%";
        l++;
        t && t.appendChild(k);
        var q = function() {
            if (b) {
                if (k)
                    if (g.location) h.geocode({
                        address: g.location
                    }, function(o, u) {
                        if (k && u === google.maps.GeocoderStatus.OK) {
                            g.lat = o[0].geometry.location.lat();
                            g.lng = o[0].geometry.location.lng();
                            m = new google.maps.LatLng(g.lat, g.lng);
                            r = e(g, m, k)
                        }
                    });
                    else {
                        m = new google.maps.LatLng(g.lat, g.lng);
                        r = e(g, m, k)
                    }
            } else setTimeout(function() {
                q()
            }, 5)
        };
        q();
        g.toString =
            function() {
                return g.location || (g.lat && g.lng ? g.lat + ", " + g.lng : g._natives.manifest.options.location["default"])
        };
        return {
            start: function(o, u) {
                var E = this,
                    C, f = function() {
                        if (r) {
                            u._map = r;
                            r.getDiv().style.display = "block";
                            google.maps.event.trigger(r, "resize");
                            r.setCenter(m);
                            if (u.zoom && typeof u.zoom !== "number") u.zoom = +u.zoom;
                            r.setZoom(u.zoom);
                            if (u.heading && typeof u.heading !== "number") u.heading = +u.heading;
                            if (u.pitch && typeof u.pitch !== "number") u.pitch = +u.pitch;
                            if (u.type === "STREETVIEW") {
                                r.setStreetView(C = new google.maps.StreetViewPanorama(k, {
                                    position: m,
                                    pov: {
                                        heading: u.heading = u.heading || 0,
                                        pitch: u.pitch = u.pitch || 0,
                                        zoom: u.zoom
                                    }
                                }));
                                var G = function(w, x) {
                                    var z = google.maps.geometry.spherical.computeHeading;
                                    setTimeout(function() {
                                        var F = E.media.currentTime;
                                        if (typeof u.tween === "object") {
                                            for (var v = 0, L = w.length; v < L; v++) {
                                                var y = w[v];
                                                if (F >= y.interval * (v + 1) / 1E3 && (F <= y.interval * (v + 2) / 1E3 || F >= y.interval * L / 1E3)) {
                                                    n.setPosition(new google.maps.LatLng(y.position.lat, y.position.lng));
                                                    n.setPov({
                                                        heading: y.pov.heading || z(y, w[v + 1]) || 0,
                                                        zoom: y.pov.zoom || 0,
                                                        pitch: y.pov.pitch ||
                                                            0
                                                    })
                                                }
                                            }
                                            G(w, w[0].interval)
                                        } else {
                                            v = 0;
                                            for (L = w.length; v < L; v++) {
                                                y = u.interval;
                                                if (F >= y * (v + 1) / 1E3 && (F <= y * (v + 2) / 1E3 || F >= y * L / 1E3)) {
                                                    A.setPov({
                                                        heading: z(w[v], w[v + 1]) || 0,
                                                        zoom: u.zoom,
                                                        pitch: u.pitch || 0
                                                    });
                                                    A.setPosition(O[v])
                                                }
                                            }
                                            G(O, u.interval)
                                        }
                                    }, x)
                                };
                                if (u.location && typeof u.tween === "string") {
                                    var A = C,
                                        O = [],
                                        a = new google.maps.DirectionsService,
                                        c = new google.maps.DirectionsRenderer(A);
                                    a.route({
                                        origin: u.location,
                                        destination: u.tween,
                                        travelMode: google.maps.TravelMode.DRIVING
                                    }, function(w, x) {
                                        if (x == google.maps.DirectionsStatus.OK) {
                                            c.setDirections(w);
                                            for (var z = w.routes[0].overview_path, F = 0, v = z.length; F < v; F++) O.push(new google.maps.LatLng(z[F].lat(), z[F].lng()));
                                            u.interval = u.interval || 1E3;
                                            G(O, 10)
                                        }
                                    })
                                } else if (typeof u.tween === "object") {
                                    var n = C;
                                    a = 0;
                                    for (var j = u.tween.length; a < j; a++) {
                                        u.tween[a].interval = u.tween[a].interval || 1E3;
                                        G(u.tween, 10)
                                    }
                                }
                            }
                            u.onmaploaded && u.onmaploaded(u, r)
                        } else setTimeout(function() {
                            f()
                        }, 13)
                    };
                f()
            },
            end: function() {
                if (r) r.getDiv().style.display = "none"
            },
            _teardown: function(o) {
                var u = document.getElementById(o.target);
                u && u.removeChild(k);
                k = r = m = null;
                o._map = null
            }
        }
    }, {
        about: {
            name: "Popcorn Google Map Plugin",
            version: "0.1",
            author: "@annasob",
            website: "annasob.wordpress.com"
        },
        options: {
            start: {
                elem: "input",
                type: "start",
                label: "Start"
            },
            end: {
                elem: "input",
                type: "start",
                label: "End"
            },
            target: "map-container",
            type: {
                elem: "select",
                options: ["ROADMAP", "SATELLITE", "STREETVIEW", "HYBRID", "TERRAIN", "STAMEN-WATERCOLOR", "STAMEN-TERRAIN", "STAMEN-TONER"],
                label: "Map Type",
                optional: true
            },
            zoom: {
                elem: "input",
                type: "text",
                label: "Zoom",
                "default": 0,
                optional: true
            },
            lat: {
                elem: "input",
                type: "text",
                label: "Lat",
                optional: true
            },
            lng: {
                elem: "input",
                type: "text",
                label: "Lng",
                optional: true
            },
            location: {
                elem: "input",
                type: "text",
                label: "Location",
                "default": "Toronto, Ontario, Canada"
            },
            heading: {
                elem: "input",
                type: "text",
                label: "Heading",
                "default": 0,
                optional: true
            },
            pitch: {
                elem: "input",
                type: "text",
                label: "Pitch",
                "default": 1,
                optional: true
            }
        }
    })
})(Popcorn);
(function(p) {
    p.plugin("mustache", function(e) {
        var l, d, b, h;
        p.getScript("http://mustache.github.com/extras/mustache.js");
        var i = !!e.dynamic,
            g = typeof e.template,
            k = typeof e.data,
            r = document.getElementById(e.target);
        e.container = r || document.createElement("div");
        if (g === "function")
            if (i) b = e.template;
            else h = e.template(e);
        else h = g === "string" ? e.template : ""; if (k === "function")
            if (i) l = e.data;
            else d = e.data(e);
        else d = k === "string" ? JSON.parse(e.data) : k === "object" ? e.data : "";
        return {
            start: function(m, t) {
                var q = function() {
                    if (window.Mustache) {
                        if (l) d =
                            l(t);
                        if (b) h = b(t);
                        var o = Mustache.to_html(h, d).replace(/^\s*/mg, "");
                        t.container.innerHTML = o
                    } else setTimeout(function() {
                        q()
                    }, 10)
                };
                q()
            },
            end: function(m, t) {
                t.container.innerHTML = ""
            },
            _teardown: function() {
                l = d = b = h = null
            }
        }
    }, {
        about: {
            name: "Popcorn Mustache Plugin",
            version: "0.1",
            author: "David Humphrey (@humphd)",
            website: "http://vocamus.net/dave"
        },
        options: {
            start: {
                elem: "input",
                type: "number",
                label: "Start"
            },
            end: {
                elem: "input",
                type: "number",
                label: "End"
            },
            target: "mustache-container",
            template: {
                elem: "input",
                type: "text",
                label: "Template"
            },
            data: {
                elem: "input",
                type: "text",
                label: "Data"
            },
            dynamic: {
                elem: "input",
                type: "checkbox",
                label: "Dynamic",
                "default": true
            }
        }
    })
})(Popcorn);
document.addEventListener("click", function(p) {
    p = p.target;
    if (p.nodeName === "A" || p.parentNode && p.parentNode.nodeName === "A") Popcorn.instances.forEach(function(e) {
        e.options.pauseOnLinkClicked && e.pause()
    })
}, false);
(function(p) {
    p.plugin("footnote", {
        manifest: {
            about: {
                name: "Popcorn Footnote Plugin",
                version: "0.2",
                author: "@annasob, @rwaldron",
                website: "annasob.wordpress.com"
            },
            options: {
                start: {
                    elem: "input",
                    type: "number",
                    label: "Start"
                },
                end: {
                    elem: "input",
                    type: "number",
                    label: "End"
                },
                text: {
                    elem: "input",
                    type: "text",
                    label: "Text"
                },
                target: "footnote-container"
            }
        },
        _setup: function(e) {
            var l = p.dom.find(e.target);
            e._container = document.createElement("div");
            e._container.style.display = "none";
            e._container.innerHTML = e.text;
            l.appendChild(e._container)
        },
        start: function(e, l) {
            l._container.style.display = "inline"
        },
        end: function(e, l) {
            l._container.style.display = "none"
        },
        _teardown: function(e) {
            var l = p.dom.find(e.target);
            l && l.removeChild(e._container)
        }
    })
})(Popcorn);
(function(p) {
    var e = 1,
        l = false;
    p.plugin("googlefeed", function(d) {
        var b = function() {
            var k = false,
                r = 0,
                m = document.getElementsByTagName("link"),
                t = m.length,
                q = document.head || document.getElementsByTagName("head")[0],
                o = document.createElement("link");
            if (window.GFdynamicFeedControl) l = true;
            else p.getScript("//www.google.com/uds/solutions/dynamicfeed/gfdynamicfeedcontrol.js", function() {
                l = true
            });
            for (; r < t; r++)
                if (m[r].href === "//www.google.com/uds/solutions/dynamicfeed/gfdynamicfeedcontrol.css") k = true;
            if (!k) {
                o.type =
                    "text/css";
                o.rel = "stylesheet";
                o.href = "//www.google.com/uds/solutions/dynamicfeed/gfdynamicfeedcontrol.css";
                q.insertBefore(o, q.firstChild)
            }
        };
        window.google ? b() : p.getScript("//www.google.com/jsapi", function() {
            google.load("feeds", "1", {
                callback: function() {
                    b()
                }
            })
        });
        var h = document.createElement("div"),
            i = document.getElementById(d.target),
            g = function() {
                if (l) d.feed = new GFdynamicFeedControl(d.url, h, {
                    vertical: d.orientation.toLowerCase() === "vertical" ? true : false,
                    horizontal: d.orientation.toLowerCase() === "horizontal" ?
                        true : false,
                    title: d.title = d.title || "Blog"
                });
                else setTimeout(function() {
                    g()
                }, 5)
            };
        if (!d.orientation || d.orientation.toLowerCase() !== "vertical" && d.orientation.toLowerCase() !== "horizontal") d.orientation = "vertical";
        h.style.display = "none";
        h.id = "_feed" + e;
        h.style.width = "100%";
        h.style.height = "100%";
        e++;
        i && i.appendChild(h);
        g();
        d.toString = function() {
            return d.url || d._natives.manifest.options.url["default"]
        };
        return {
            start: function() {
                h.setAttribute("style", "display:inline")
            },
            end: function() {
                h.setAttribute("style",
                    "display:none")
            },
            _teardown: function(k) {
                document.getElementById(k.target) && document.getElementById(k.target).removeChild(h);
                delete k.feed
            }
        }
    }, {
        about: {
            name: "Popcorn Google Feed Plugin",
            version: "0.1",
            author: "David Seifried",
            website: "dseifried.wordpress.com"
        },
        options: {
            start: {
                elem: "input",
                type: "number",
                label: "Start"
            },
            end: {
                elem: "input",
                type: "number",
                label: "End"
            },
            target: "feed-container",
            url: {
                elem: "input",
                type: "url",
                label: "Feed URL",
                "default": "http://planet.mozilla.org/rss20.xml"
            },
            title: {
                elem: "input",
                type: "text",
                label: "Title",
                "default": "Planet Mozilla",
                optional: true
            },
            orientation: {
                elem: "select",
                options: ["Vertical", "Horizontal"],
                label: "Orientation",
                "default": "Vertical",
                optional: true
            }
        }
    })
})(Popcorn);
(function(p) {
    function e(b) {
        return String(b).replace(/&(?!\w+;)|[<>"']/g, function(h) {
            return d[h] || h
        })
    }

    function l(b, h) {
        var i = b.container = document.createElement("div"),
            g = i.style,
            k = b.media,
            r = function() {
                var m = b.position();
                g.fontSize = "18px";
                g.width = k.offsetWidth + "px";
                g.top = m.top + k.offsetHeight - i.offsetHeight - 40 + "px";
                g.left = m.left + "px";
                setTimeout(r, 10)
            };
        i.id = h || "";
        g.position = "absolute";
        g.color = "white";
        g.textShadow = "black 2px 2px 6px";
        g.fontWeight = "bold";
        g.textAlign = "center";
        r();
        b.media.parentNode.appendChild(i);
        return i
    }
    var d = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };
    p.plugin("text", {
        manifest: {
            about: {
                name: "Popcorn Text Plugin",
                version: "0.1",
                author: "@humphd"
            },
            options: {
                start: {
                    elem: "input",
                    type: "number",
                    label: "Start"
                },
                end: {
                    elem: "input",
                    type: "number",
                    label: "End"
                },
                text: {
                    elem: "input",
                    type: "text",
                    label: "Text",
                    "default": "Popcorn.js"
                },
                escape: {
                    elem: "input",
                    type: "checkbox",
                    label: "Escape"
                },
                multiline: {
                    elem: "input",
                    type: "checkbox",
                    label: "Multiline"
                }
            }
        },
        _setup: function(b) {
            var h, i, g = b._container = document.createElement("div");
            g.style.display = "none";
            if (b.target)
                if (h = p.dom.find(b.target)) {
                    if (["VIDEO", "AUDIO"].indexOf(h.nodeName) > -1) h = l(this, b.target + "-overlay")
                } else h = l(this, b.target);
            else h = this.container ? this.container : l(this);
            b._target = h;
            i = b.escape ? e(b.text) : b.text;
            i = b.multiline ? i.replace(/\r?\n/gm, "<br>") : i;
            g.innerHTML = i || "";
            h.appendChild(g);
            b.toString = function() {
                return b.text || b._natives.manifest.options.text["default"]
            }
        },
        start: function(b, h) {
            h._container.style.display = "inline"
        },
        end: function(b, h) {
            h._container.style.display =
                "none"
        },
        _teardown: function(b) {
            var h = b._target;
            h && h.removeChild(b._container)
        }
    })
})(Popcorn);
(function(p) {
    p.plugin("code", function(e) {
        var l = false,
            d = this,
            b = function() {
                var h = function(i) {
                    return function(g, k) {
                        var r = function() {
                            l && g.call(d, k);
                            l && i(r)
                        };
                        r()
                    }
                };
                return window.webkitRequestAnimationFrame ? h(window.webkitRequestAnimationFrame) : window.mozRequestAnimationFrame ? h(window.mozRequestAnimationFrame) : h(function(i) {
                    window.setTimeout(i, 16)
                })
            }();
        if (!e.onStart || typeof e.onStart !== "function") e.onStart = p.nop;
        if (e.onEnd && typeof e.onEnd !== "function") e.onEnd = undefined;
        if (e.onFrame && typeof e.onFrame !==
            "function") e.onFrame = undefined;
        return {
            start: function(h, i) {
                i.onStart.call(d, i);
                if (i.onFrame) {
                    l = true;
                    b(i.onFrame, i)
                }
            },
            end: function(h, i) {
                if (i.onFrame) l = false;
                i.onEnd && i.onEnd.call(d, i)
            }
        }
    }, {
        about: {
            name: "Popcorn Code Plugin",
            version: "0.1",
            author: "David Humphrey (@humphd)",
            website: "http://vocamus.net/dave"
        },
        options: {
            start: {
                elem: "input",
                type: "number",
                label: "Start"
            },
            end: {
                elem: "input",
                type: "number",
                label: "End"
            },
            onStart: {
                elem: "input",
                type: "function",
                label: "onStart"
            },
            onFrame: {
                elem: "input",
                type: "function",
                label: "onFrame",
                optional: true
            },
            onEnd: {
                elem: "input",
                type: "function",
                label: "onEnd"
            }
        }
    })
})(Popcorn);
(function(p) {
    function e(b) {
        function h() {
            var r = b.getBoundingClientRect(),
                m = g.getBoundingClientRect();
            if (m.left !== r.left) g.style.left = r.left + "px";
            if (m.top !== r.top) g.style.top = r.top + "px"
        }
        var i = -1,
            g = document.createElement("div"),
            k = getComputedStyle(b).zIndex;
        g.setAttribute("data-popcorn-helper-container", true);
        g.style.position = "absolute";
        g.style.zIndex = isNaN(k) ? l : k + 1;
        document.body.appendChild(g);
        return {
            element: g,
            start: function() {
                i = setInterval(h, d)
            },
            stop: function() {
                clearInterval(i);
                i = -1
            },
            destroy: function() {
                document.body.removeChild(g);
                i !== -1 && clearInterval(i)
            }
        }
    }
    var l = 2E3,
        d = 10;
    p.plugin("image", {
        manifest: {
            about: {
                name: "Popcorn image Plugin",
                version: "0.1",
                author: "Scott Downe",
                website: "http://scottdowne.wordpress.com/"
            },
            options: {
                start: {
                    elem: "input",
                    type: "number",
                    label: "Start"
                },
                end: {
                    elem: "input",
                    type: "number",
                    label: "End"
                },
                src: {
                    elem: "input",
                    type: "url",
                    label: "Image URL",
                    "default": "http://mozillapopcorn.org/wp-content/themes/popcorn/images/for_developers.png"
                },
                href: {
                    elem: "input",
                    type: "url",
                    label: "Link",
                    "default": "http://mozillapopcorn.org/wp-content/themes/popcorn/images/for_developers.png",
                    optional: true
                },
                target: "image-container",
                text: {
                    elem: "input",
                    type: "text",
                    label: "Caption",
                    "default": "Popcorn.js",
                    optional: true
                }
            }
        },
        _setup: function(b) {
            var h = document.createElement("img"),
                i = document.getElementById(b.target);
            b.anchor = document.createElement("a");
            b.anchor.style.position = "relative";
            b.anchor.style.textDecoration = "none";
            b.anchor.style.display = "none";
            if (i)
                if (["VIDEO", "AUDIO"].indexOf(i.nodeName) > -1) {
                    b.trackedContainer = e(i);
                    b.trackedContainer.element.appendChild(b.anchor)
                } else i && i.appendChild(b.anchor);
            h.addEventListener("load", function() {
                h.style.borderStyle = "none";
                b.anchor.href = b.href || b.src || "#";
                b.anchor.target = "_blank";
                var g, k;
                h.style.height = i.style.height;
                h.style.width = i.style.width;
                b.anchor.appendChild(h);
                if (b.text) {
                    g = h.height / 12 + "px";
                    k = document.createElement("div");
                    p.extend(k.style, {
                        color: "black",
                        fontSize: g,
                        fontWeight: "bold",
                        position: "relative",
                        textAlign: "center",
                        width: h.style.width || h.width + "px",
                        zIndex: "10"
                    });
                    k.innerHTML = b.text || "";
                    k.style.top = (h.style.height.replace("px", "") || h.height) /
                        2 - k.offsetHeight / 2 + "px";
                    b.anchor.insertBefore(k, h)
                }
            }, false);
            h.src = b.src;
            b.toString = function() {
                var g = b.src || b._natives.manifest.options.src["default"],
                    k = g.replace(/.*\//g, "");
                return k.length ? k : g
            }
        },
        start: function(b, h) {
            h.anchor.style.display = "inline";
            h.trackedContainer && h.trackedContainer.start()
        },
        end: function(b, h) {
            h.anchor.style.display = "none";
            h.trackedContainer && h.trackedContainer.stop()
        },
        _teardown: function(b) {
            if (b.trackedContainer) b.trackedContainer.destroy();
            else b.anchor.parentNode && b.anchor.parentNode.removeChild(b.anchor)
        }
    })
})(Popcorn);
(function(p) {
    p.parser("parseXML", "XML", function(e) {
        var l = {
                title: "",
                remote: "",
                data: []
            },
            d = {},
            b = function(m) {
                m = m.split(":");
                if (m.length === 1) return parseFloat(m[0], 10);
                else if (m.length === 2) return parseFloat(m[0], 10) + parseFloat(m[1] / 12, 10);
                else if (m.length === 3) return parseInt(m[0] * 60, 10) + parseFloat(m[1], 10) + parseFloat(m[2] / 12, 10);
                else if (m.length === 4) return parseInt(m[0] * 3600, 10) + parseInt(m[1] * 60, 10) + parseFloat(m[2], 10) + parseFloat(m[3] / 12, 10)
            },
            h = function(m) {
                for (var t = {}, q = 0, o = m.length; q < o; q++) {
                    var u = m.item(q).nodeName,
                        E = m.item(q).nodeValue,
                        C = d[E];
                    if (u === "in") t.start = b(E);
                    else if (u === "out") t.end = b(E);
                    else if (u === "resourceid")
                        for (var f in C) {
                            if (C.hasOwnProperty(f))
                                if (!t[f] && f !== "id") t[f] = C[f]
                        } else t[u] = E
                }
                return t
            },
            i = function(m, t) {
                var q = {};
                q[m] = t;
                return q
            },
            g = function(m, t, q) {
                var o = {};
                p.extend(o, t, h(m.attributes), {
                    text: m.textContent || m.text
                });
                t = m.childNodes;
                if (t.length < 1 || t.length === 1 && t[0].nodeType === 3)
                    if (q) d[o.id] = o;
                    else l.data.push(i(m.nodeName, o));
                else
                    for (m = 0; m < t.length; m++) t[m].nodeType === 1 && g(t[m], o, q)
            };
        e = e.documentElement.childNodes;
        for (var k = 0, r = e.length; k < r; k++)
            if (e[k].nodeType === 1) e[k].nodeName === "manifest" ? g(e[k], {}, true) : g(e[k], {}, false);
        return l
    })
})(Popcorn);
(function(p) {
    p.parser("parseSBV", function(e) {
        var l = {
                title: "",
                remote: "",
                data: []
            },
            d = [],
            b = 0,
            h = 0,
            i = function(q) {
                q = q.split(":");
                var o = q.length - 1,
                    u;
                try {
                    u = parseInt(q[o - 1], 10) * 60 + parseFloat(q[o], 10);
                    if (o === 2) u += parseInt(q[0], 10) * 3600
                } catch (E) {
                    throw "Bad cue";
                }
                return u
            },
            g = function(q, o) {
                var u = {};
                u[q] = o;
                return u
            };
        e = e.text.split(/(?:\r\n|\r|\n)/gm);
        for (h = e.length; b < h;) {
            var k = {},
                r = [],
                m = e[b++].split(",");
            try {
                k.start = i(m[0]);
                for (k.end = i(m[1]); b < h && e[b];) r.push(e[b++]);
                k.text = r.join("<br />");
                d.push(g("subtitle", k))
            } catch (t) {
                for (; b <
                    h && e[b];) b++
            }
            for (; b < h && !e[b];) b++
        }
        l.data = d;
        return l
    })
})(Popcorn);
(function(p) {
    p.parser("parseJSON", "JSON", function(e) {
        var l = {
            title: "",
            remote: "",
            data: []
        };
        p.forEach(e.data, function(d) {
            l.data.push(d)
        });
        return l
    })
})(Popcorn);
(function(p) {
    p.parser("parseTTXT", function(e) {
        var l = {
                title: "",
                remote: "",
                data: []
            },
            d = function(k) {
                k = k.split(":");
                var r = 0;
                try {
                    return parseFloat(k[0], 10) * 60 * 60 + parseFloat(k[1], 10) * 60 + parseFloat(k[2], 10)
                } catch (m) {
                    r = 0
                }
                return r
            },
            b = function(k, r) {
                var m = {};
                m[k] = r;
                return m
            };
        e = e.xml.lastChild.lastChild;
        for (var h = Number.MAX_VALUE, i = []; e;) {
            if (e.nodeType === 1 && e.nodeName === "TextSample") {
                var g = {};
                g.start = d(e.getAttribute("sampleTime"));
                g.text = e.getAttribute("text");
                if (g.text) {
                    g.end = h - 0.0010;
                    i.push(b("subtitle", g))
                }
                h =
                    g.start
            }
            e = e.previousSibling
        }
        l.data = i.reverse();
        return l
    })
})(Popcorn);
(function(p) {
    function e(g, k, r) {
        var m = g.firstChild;
        g = l(g, r);
        r = [];
        for (var t; m;) {
            if (m.nodeType === 1)
                if (m.nodeName === "p") r.push(d(m, k, g));
                else if (m.nodeName === "div") {
                t = b(m.getAttribute("begin"));
                if (t < 0) t = k;
                r.push.apply(r, e(m, t, g))
            }
            m = m.nextSibling
        }
        return r
    }

    function l(g, k) {
        var r = g.getAttribute("region");
        return r !== null ? r : k || ""
    }

    function d(g, k, r) {
        var m = {};
        m.text = (g.textContent || g.text).replace(h, "").replace(i, "<br />");
        m.id = g.getAttribute("xml:id") || g.getAttribute("id");
        m.start = b(g.getAttribute("begin"), k);
        m.end = b(g.getAttribute("end"), k);
        m.target = l(g, r);
        if (m.end < 0) {
            m.end = b(g.getAttribute("duration"), 0);
            if (m.end >= 0) m.end += m.start;
            else m.end = Number.MAX_VALUE
        }
        return {
            subtitle: m
        }
    }

    function b(g, k) {
        var r;
        if (!g) return -1;
        try {
            return p.util.toSeconds(g)
        } catch (m) {
            for (var t = g.length - 1; t >= 0 && g[t] <= "9" && g[t] >= "0";) t--;
            r = t;
            t = parseFloat(g.substring(0, r));
            r = g.substring(r);
            return t * ({
                h: 3600,
                m: 60,
                s: 1,
                ms: 0.0010
            }[r] || -1) + (k || 0)
        }
    }
    var h = /^[\s]+|[\s]+$/gm,
        i = /(?:\r\n|\r|\n)/gm;
    p.parser("parseTTML", function(g) {
        var k = {
            title: "",
            remote: "",
            data: []
        };
        if (!g.xml || !g.xml.documentElement) return k;
        g = g.xml.documentElement.firstChild;
        if (!g) return k;
        for (; g.nodeName !== "body";) g = g.nextSibling;
        if (g) k.data = e(g, 0);
        return k
    })
})(Popcorn);
(function(p) {
    function e(d) {
        var b = d.split(":");
        d = d.length;
        var h;
        if (d !== 12 && d !== 9) throw "Bad cue";
        d = b.length - 1;
        try {
            h = parseInt(b[d - 1], 10) * 60 + parseFloat(b[d], 10);
            if (d === 2) h += parseInt(b[0], 10) * 3600
        } catch (i) {
            throw "Bad cue";
        }
        return h
    }

    function l(d, b) {
        var h = {};
        h[d] = b;
        return h
    }
    p.parser("parseVTT", function(d) {
        var b = {
                title: "",
                remote: "",
                data: []
            },
            h = [],
            i = 0,
            g = 0,
            k, r;
        d = d.text.split(/(?:\r\n|\r|\n)/gm);
        g = d.length;
        if (g === 0 || d[0] !== "WEBVTT") return b;
        for (i++; i < g;) {
            k = [];
            try {
                for (var m = i; m < g && !d[m];) m++;
                i = m;
                var t = d[i++];
                m =
                    void 0;
                var q = {};
                if (!t || t.indexOf("--\>") === -1) throw "Bad cue";
                m = t.replace(/--\>/, " --\> ").split(/[\t ]+/);
                if (m.length < 2) throw "Bad cue";
                q.id = t;
                q.start = e(m[0]);
                q.end = e(m[2]);
                for (r = q; i < g && d[i];) k.push(d[i++]);
                r.text = k.join("<br />");
                h.push(l("subtitle", r))
            } catch (o) {
                for (i = i; i < g && d[i];) i++;
                i = i
            }
        }
        b.data = h;
        return b
    })
})(Popcorn);
(function(p) {
    function e(b, h) {
        var i = b.substr(10).split(","),
            g;
        g = {
            start: l(i[h.start]),
            end: l(i[h.end])
        };
        if (g.start === -1 || g.end === -1) throw "Invalid time";
        var k = q.call(m, /\{(\\[\w]+\(?([\w\d]+,?)+\)?)+\}/gi, ""),
            r = k.replace,
            m;
        m = i.length;
        q = [];
        for (var t = h.text; t < m; t++) q.push(i[t]);
        m = q.join(",");
        var q = m.replace;
        g.text = r.call(k, /\\N/gi, "<br />");
        return g
    }

    function l(b) {
        var h = b.split(":");
        if (b.length !== 10 || h.length < 3) return -1;
        return parseInt(h[0], 10) * 3600 + parseInt(h[1], 10) * 60 + parseFloat(h[2], 10)
    }

    function d(b,
        h) {
        var i = {};
        i[b] = h;
        return i
    }
    p.parser("parseSSA", function(b) {
        var h = {
                title: "",
                remote: "",
                data: []
            },
            i = [],
            g = 0,
            k;
        b = b.text.split(/(?:\r\n|\r|\n)/gm);
        for (k = b.length; g < k && b[g] !== "[Events]";) g++;
        var r = b[++g].substr(8).split(", "),
            m = {},
            t, q;
        q = 0;
        for (t = r.length; q < t; q++)
            if (r[q] === "Start") m.start = q;
            else if (r[q] === "End") m.end = q;
        else if (r[q] === "Text") m.text = q;
        for (; ++g < k && b[g] && b[g][0] !== "[";) try {
            i.push(d("subtitle", e(b[g], m)))
        } catch (o) {}
        h.data = i;
        return h
    })
})(Popcorn);
(function(p) {
    function e(d, b) {
        var h = {};
        h[d] = b;
        return h
    }

    function l(d) {
        d = d.split(":");
        try {
            var b = d[2].split(",");
            if (b.length === 1) b = d[2].split(".");
            return parseFloat(d[0], 10) * 3600 + parseFloat(d[1], 10) * 60 + parseFloat(b[0], 10) + parseFloat(b[1], 10) / 1E3
        } catch (h) {
            return 0
        }
    }
    p.parser("parseSRT", function(d, b) {
        var h = {
                title: "",
                remote: "",
                data: []
            },
            i = [],
            g = 0,
            k = 0,
            r, m, t, q, o;
        r = d.text.split(/(?:\r\n|\r|\n)/gm);
        for (t = r.length - 1; t >= 0 && !r[t];) t--;
        q = t + 1;
        for (g = 0; g < q; g++) {
            o = {};
            t = [];
            for (g = g; !r[g];) g++;
            g = g;
            o.id = parseInt(r[g++], 10);
            m = r[g++].split(/[\t ]*--\>[\t ]*/);
            o.start = l(m[0]);
            k = m[1].indexOf(" ");
            if (k !== -1) m[1] = m[1].substr(0, k);
            for (o.end = l(m[1]); g < q && r[g];) t.push(r[g++]);
            o.text = t.join("\\N").replace(/\{(\\[\w]+\(?([\w\d]+,?)+\)?)+\}/gi, "");
            o.text = o.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            o.text = o.text.replace(/&lt;(\/?(font|b|u|i|s))((\s+(\w|\w[\w\-]*\w)(\s*=\s*(?:\".*?\"|'.*?'|[^'\">\s]+))?)+\s*|\s*)(\/?)&gt;/gi, "<$1$3$7>");
            o.text = o.text.replace(/\\N/gi, "<br />");
            if (b && b.target) o.target = b.target;
            i.push(e("subtitle",
                o))
        }
        h.data = i;
        return h
    })
})(Popcorn);
(function(p, e) {
    e.player("vimeo", {
        _canPlayType: function(l, d) {
            return typeof d === "string" && e.HTMLVimeoVideoElement._canPlaySrc(d)
        }
    });
    e.vimeo = function(l, d, b) {
        typeof console !== "undefined" && console.warn && console.warn("Deprecated player 'vimeo'. Please use Popcorn.HTMLVimeoVideoElement directly.");
        var h = e.HTMLVimeoVideoElement(l);
        l = e(h, b);
        setTimeout(function() {
            h.src = d
        }, 0);
        return l
    }
})(window, Popcorn);
(function(p, e) {
    var l = function(d, b) {
        return typeof b === "string" && e.HTMLYouTubeVideoElement._canPlaySrc(b)
    };
    e.player("youtube", {
        _canPlayType: l
    });
    e.youtube = function(d, b, h) {
        typeof console !== "undefined" && console.warn && console.warn("Deprecated player 'youtube'. Please use Popcorn.HTMLYouTubeVideoElement directly.");
        var i = e.HTMLYouTubeVideoElement(d);
        d = e(i, h);
        setTimeout(function() {
            i.src = b
        }, 0);
        return d
    };
    e.youtube.canPlayType = l
})(window, Popcorn);
(function(p, e) {
    e.player("soundcloud", {
        _canPlayType: function(l, d) {
            return typeof d === "string" && e.HTMLSoundCloudAudioElement._canPlaySrc(d) && l.toLowerCase() !== "audio"
        }
    });
    e.soundcloud = function(l, d, b) {
        typeof console !== "undefined" && console.warn && console.warn("Deprecated player 'soundcloud'. Please use Popcorn.HTMLSoundCloudAudioElement directly.");
        var h = e.HTMLSoundCloudAudioElement(l);
        l = e(h, b);
        setTimeout(function() {
            h.src = d
        }, 0);
        return l
    }
})(window, Popcorn);