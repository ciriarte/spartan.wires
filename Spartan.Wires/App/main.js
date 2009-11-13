﻿
(function () {
    var Framework = window.Framework = {
        Application: function Application() {
            this.name = "Application";
            Application.prototype.run = undefined;
        },

        Controller: function Controller() {
            // Undefined event handlers to be replaced by user when needed
            this.init = undefined;
            this.name = undefined;
        },

        View: function View() {

        }
    }
})();




/*
* QUnit - A JavaScript Unit Testing Framework
* 
* http://docs.jquery.com/QUnit
*
* Copyright (c) 2009 John Resig, Jörn Zaefferer
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*/

(function (window) {

    var QUnit = {

        // Initialize the configuration options
        init: function init() {
            config = {
                stats: { all: 0, bad: 0 },
                moduleStats: { all: 0, bad: 0 },
                started: +new Date,
                blocking: false,
                autorun: false,
                assertions: [],
                filters: [],
                queue: []
            };

            var tests = id("qunit-tests"),
			banner = id("qunit-banner"),
			result = id("qunit-testresult");

            if (tests) {
                tests.innerHTML = "";
            }

            if (banner) {
                banner.className = "";
            }

            if (result) {
                result.parentNode.removeChild(result);
            }
        },

        // call on start of module test to prepend name to all tests
        module: function module(name, testEnvironment) {
            config.currentModule = name;

            synchronize(function () {
                if (config.currentModule) {
                    QUnit.moduleDone(config.currentModule, config.moduleStats.bad, config.moduleStats.all);
                }

                config.currentModule = name;
                config.moduleTestEnvironment = testEnvironment;
                config.moduleStats = { all: 0, bad: 0 };

                QUnit.moduleStart(name, testEnvironment);
            });
        },

        asyncTest: function asyncTest(testName, expected, callback) {
            if (arguments.length === 2) {
                callback = expected;
                expected = 0;
            }

            QUnit.test(testName, expected, callback, true);
        },

        test: function test(testName, expected, callback, async) {
            var name = testName, testEnvironment = {};

            if (arguments.length === 2) {
                callback = expected;
                expected = null;
            }

            if (config.currentModule) {
                name = config.currentModule + " module: " + name;
            }

            if (!validTest(name)) {
                return;
            }

            synchronize(function () {
                QUnit.testStart(testName);

                testEnvironment = extend({
                    setup: function () { },
                    teardown: function () { }
                }, config.moduleTestEnvironment);

                config.assertions = [];
                config.expected = null;

                if (arguments.length >= 3) {
                    config.expected = callback;
                    callback = arguments[2];
                }

                try {
                    if (!config.pollution) {
                        saveGlobal();
                    }

                    testEnvironment.setup.call(testEnvironment);
                } catch (e) {
                    QUnit.ok(false, "Setup failed on " + name + ": " + e.message);
                }

                if (async) {
                    QUnit.stop();
                }

                try {
                    callback.call(testEnvironment);
                } catch (e) {
                    fail("Test " + name + " died, exception and test follows", e, callback);
                    QUnit.ok(false, "Died on test #" + (config.assertions.length + 1) + ": " + e.message);
                    // else next test will carry the responsibility
                    saveGlobal();

                    // Restart the tests if they're blocking
                    if (config.blocking) {
                        start();
                    }
                }
            });

            synchronize(function () {
                try {
                    checkPollution();
                    testEnvironment.teardown.call(testEnvironment);
                } catch (e) {
                    QUnit.ok(false, "Teardown failed on " + name + ": " + e.message);
                }

                try {
                    QUnit.reset();
                } catch (e) {
                    fail("reset() failed, following Test " + name + ", exception and reset fn follows", e, reset);
                }

                if (config.expected && config.expected != config.assertions.length) {
                    QUnit.ok(false, "Expected " + config.expected + " assertions, but " + config.assertions.length + " were run");
                }

                var good = 0, bad = 0,
				tests = id("qunit-tests");

                config.stats.all += config.assertions.length;
                config.moduleStats.all += config.assertions.length;

                if (tests) {
                    var ol = document.createElement("ol");
                    ol.style.display = "none";

                    for (var i = 0; i < config.assertions.length; i++) {
                        var assertion = config.assertions[i];

                        var li = document.createElement("li");
                        li.className = assertion.result ? "pass" : "fail";
                        li.innerHTML = assertion.message || "(no message)";
                        ol.appendChild(li);

                        if (assertion.result) {
                            good++;
                        } else {
                            bad++;
                            config.stats.bad++;
                            config.moduleStats.bad++;
                        }
                    }

                    var b = document.createElement("strong");
                    b.innerHTML = name + " <b style='color:black;'>(<b class='fail'>" + bad + "</b>, <b class='pass'>" + good + "</b>, " + config.assertions.length + ")</b>";

                    addEvent(b, "click", function () {
                        var next = b.nextSibling, display = next.style.display;
                        next.style.display = display === "none" ? "block" : "none";
                    });

                    addEvent(b, "dblclick", function (e) {
                        var target = (e || window.event).target;
                        if (target.nodeName.toLowerCase() === "strong") {
                            var text = "", node = target.firstChild;

                            while (node.nodeType === 3) {
                                text += node.nodeValue;
                                node = node.nextSibling;
                            }

                            text = text.replace(/(^\s*|\s*$)/g, "");

                            if (window.location) {
                                window.location.href = window.location.href.match(/^(.+?)(\?.*)?$/)[1] + "?" + encodeURIComponent(text);
                            }
                        }
                    });

                    var li = document.createElement("li");
                    li.className = bad ? "fail" : "pass";
                    li.appendChild(b);
                    li.appendChild(ol);
                    tests.appendChild(li);

                    if (bad) {
                        var toolbar = id("qunit-testrunner-toolbar");
                        if (toolbar) {
                            toolbar.style.display = "block";
                            id("qunit-filter-pass").disabled = null;
                            id("qunit-filter-missing").disabled = null;
                        }
                    }

                } else {
                    for (var i = 0; i < config.assertions.length; i++) {
                        if (!config.assertions[i].result) {
                            bad++;
                            config.stats.bad++;
                            config.moduleStats.bad++;
                        }
                    }
                }

                QUnit.testDone(testName, bad, config.assertions.length);

                if (!window.setTimeout && !config.queue.length) {
                    done();
                }
            });

            if (window.setTimeout && !config.doneTimer) {
                config.doneTimer = window.setTimeout(function () {
                    if (!config.queue.length) {
                        done();
                    } else {
                        synchronize(done);
                    }
                }, 13);
            }
        },

        /**
        * Specify the number of expected assertions to gurantee that failed test (no assertions are run at all) don't slip through.
        */
        expect: function expect(asserts) {
            config.expected = asserts;
        },

        /**
        * Asserts true.
        * @example ok( "asdfasdf".length > 5, "There must be at least 5 chars" );
        */
        ok: function ok(a, msg) {
            QUnit.log(a, msg);

            config.assertions.push({
                result: !!a,
                message: msg
            });
        },

        /**
        * Checks that the first two arguments are equal, with an optional message.
        * Prints out both actual and expected values.
        *
        * Prefered to ok( actual == expected, message )
        *
        * @example equals( format("Received {0} bytes.", 2), "Received 2 bytes." );
        *
        * @param Object actual
        * @param Object expected
        * @param String message (optional)
        */
        equals: function equals(actual, expected, message) {
            push(expected == actual, actual, expected, message);
        },

        same: function (a, b, message) {
            push(QUnit.equiv(a, b), a, b, message);
        },

        start: function start() {
            // A slight delay, to avoid any current callbacks
            if (window.setTimeout) {
                window.setTimeout(function () {
                    if (config.timeout) {
                        clearTimeout(config.timeout);
                    }

                    config.blocking = false;
                    process();
                }, 13);
            } else {
                config.blocking = false;
                process();
            }
        },

        stop: function stop(timeout) {
            config.blocking = true;

            if (timeout && window.setTimeout) {
                config.timeout = window.setTimeout(function () {
                    QUnit.ok(false, "Test timed out");
                    QUnit.start();
                }, timeout);
            }
        },

        /**
        * Resets the test setup. Useful for tests that modify the DOM.
        */
        reset: function reset() {
            if (window.jQuery) {
                jQuery("#main").html(config.fixture);
                jQuery.event.global = {};
                jQuery.ajaxSettings = extend({}, config.ajaxSettings);
            }
        },

        /**
        * Trigger an event on an element.
        *
        * @example triggerEvent( document.body, "click" );
        *
        * @param DOMElement elem
        * @param String type
        */
        triggerEvent: function triggerEvent(elem, type, event) {
            if (document.createEvent) {
                event = document.createEvent("MouseEvents");
                event.initMouseEvent(type, true, true, elem.ownerDocument.defaultView,
				0, 0, 0, 0, 0, false, false, false, false, 0, null);
                elem.dispatchEvent(event);

            } else if (elem.fireEvent) {
                elem.fireEvent("on" + type);
            }
        },

        // Logging callbacks
        done: function done(failures, total) { },
        log: function log(result, message) { },
        testStart: function testStart(name) { },
        testDone: function testDone(name, failures, total) { },
        moduleStart: function moduleStart(name, testEnvironment) { },
        moduleDone: function moduleDone(name, failures, total) { }
    };

    // Maintain internal state
    var config = {
        // The queue of tests to run
        queue: [],

        // block until document ready
        blocking: true
    };

    // Load paramaters
    (function () {
        var location = window.location || { search: "", protocol: "file:" },
		GETParams = location.search.slice(1).split('&');

        for (var i = 0; i < GETParams.length; i++) {
            GETParams[i] = decodeURIComponent(GETParams[i]);
            if (GETParams[i] === "noglobals") {
                GETParams.splice(i, 1);
                i--;
                config.noglobals = true;
            } else if (GETParams[i].search('=') > -1) {
                GETParams.splice(i, 1);
                i--;
            }
        }

        // restrict modules/tests by get parameters
        config.filters = GETParams;

        // Figure out if we're running the tests from a server or not
        QUnit.isLocal = !!(location.protocol === 'file:');
    })();

    // Expose the API as global variables, unless an 'exports'
    // object exists, in that case we assume we're in CommonJS
    if (typeof exports === "undefined" || typeof require === "undefined") {
        extend(window, QUnit);
        window.QUnit = QUnit;
    } else {
        extend(exports, QUnit);
        exports.QUnit = QUnit;
    }

    if (typeof document === "undefined" || document.readyState === "complete") {
        config.autorun = true;
    }

    addEvent(window, "load", function () {
        // Initialize the config, saving the execution queue
        var oldconfig = extend({}, config);
        QUnit.init();
        extend(config, oldconfig);

        config.blocking = false;

        var userAgent = id("qunit-userAgent");
        if (userAgent) {
            userAgent.innerHTML = navigator.userAgent;
        }

        var toolbar = id("qunit-testrunner-toolbar");
        if (toolbar) {
            toolbar.style.display = "none";

            var filter = document.createElement("input");
            filter.type = "checkbox";
            filter.id = "qunit-filter-pass";
            filter.disabled = true;
            addEvent(filter, "click", function () {
                var li = document.getElementsByTagName("li");
                for (var i = 0; i < li.length; i++) {
                    if (li[i].className.indexOf("pass") > -1) {
                        li[i].style.display = filter.checked ? "none" : "block";
                    }
                }
            });
            toolbar.appendChild(filter);

            var label = document.createElement("label");
            label.setAttribute("for", "filter-pass");
            label.innerHTML = "Hide passed tests";
            toolbar.appendChild(label);

            var missing = document.createElement("input");
            missing.type = "checkbox";
            missing.id = "qunit-filter-missing";
            missing.disabled = true;
            addEvent(missing, "click", function () {
                var li = document.getElementsByTagName("li");
                for (var i = 0; i < li.length; i++) {
                    if (li[i].className.indexOf("fail") > -1 && li[i].innerHTML.indexOf('missing test - untested code is broken code') > -1) {
                        li[i].parentNode.parentNode.style.display = missing.checked ? "none" : "block";
                    }
                }
            });
            toolbar.appendChild(missing);

            label = document.createElement("label");
            label.setAttribute("for", "filter-missing");
            label.innerHTML = "Hide missing tests (untested code is broken code)";
            toolbar.appendChild(label);
        }

        var main = id('main');
        if (main) {
            config.fixture = main.innerHTML;
        }

        if (window.jQuery) {
            config.ajaxSettings = window.jQuery.ajaxSettings;
        }

        QUnit.start();
    });

    function done() {
        if (config.doneTimer && window.clearTimeout) {
            window.clearTimeout(config.doneTimer);
            config.doneTimer = null;
        }

        if (config.queue.length) {
            config.doneTimer = window.setTimeout(function () {
                if (!config.queue.length) {
                    done();
                } else {
                    synchronize(done);
                }
            }, 13);

            return;
        }

        config.autorun = true;

        // Log the last module results
        if (config.currentModule) {
            QUnit.moduleDone(config.currentModule, config.moduleStats.bad, config.moduleStats.all);
        }

        var banner = id("qunit-banner"),
		tests = id("qunit-tests"),
		html = ['Tests completed in ',
		+new Date - config.started, ' milliseconds.<br/>',
		'<span class="bad">', config.stats.all - config.stats.bad, '</span> tests of <span class="all">', config.stats.all, '</span> passed, ', config.stats.bad, ' failed.'].join('');

        if (banner) {
            banner.className += " " + (config.stats.bad ? "fail" : "pass");
        }

        if (tests) {
            var result = id("qunit-testresult");

            if (!result) {
                result = document.createElement("p");
                result.id = "qunit-testresult";
                result.className = "result";
                tests.parentNode.insertBefore(result, tests.nextSibling);
            }

            result.innerHTML = html;
        }

        QUnit.done(config.stats.bad, config.stats.all);
    }

    function validTest(name) {
        var i = config.filters.length,
		run = false;

        if (!i) {
            return true;
        }

        while (i--) {
            var filter = config.filters[i],
			not = filter.charAt(0) == '!';

            if (not) {
                filter = filter.slice(1);
            }

            if (name.indexOf(filter) !== -1) {
                return !not;
            }

            if (not) {
                run = true;
            }
        }

        return run;
    }

    function push(result, actual, expected, message) {
        message = message || (result ? "okay" : "failed");
        QUnit.ok(result, result ? message + ": " + expected : message + ", expected: " + QUnit.jsDump.parse(expected) + " result: " + QUnit.jsDump.parse(actual));
    }

    function synchronize(callback) {
        config.queue.push(callback);

        if (config.autorun && !config.blocking) {
            process();
        }
    }

    function process() {
        while (config.queue.length && !config.blocking) {
            config.queue.shift()();
        }
    }

    function saveGlobal() {
        config.pollution = [];

        if (config.noglobals) {
            for (var key in window) {
                config.pollution.push(key);
            }
        }
    }

    function checkPollution(name) {
        var old = config.pollution;
        saveGlobal();

        var newGlobals = diff(old, config.pollution);
        if (newGlobals.length > 0) {
            ok(false, "Introduced global variable(s): " + newGlobals.join(", "));
            config.expected++;
        }

        var deletedGlobals = diff(config.pollution, old);
        if (deletedGlobals.length > 0) {
            ok(false, "Deleted global variable(s): " + deletedGlobals.join(", "));
            config.expected++;
        }
    }

    // returns a new Array with the elements that are in a but not in b
    function diff(a, b) {
        var result = a.slice();
        for (var i = 0; i < result.length; i++) {
            for (var j = 0; j < b.length; j++) {
                if (result[i] === b[j]) {
                    result.splice(i, 1);
                    i--;
                    break;
                }
            }
        }
        return result;
    }

    function fail(message, exception, callback) {
        if (typeof console !== "undefined" && console.error && console.warn) {
            console.error(message);
            console.error(exception);
            console.warn(callback.toString());

        } else if (window.opera && opera.postError) {
            opera.postError(message, exception, callback.toString);
        }
    }

    function extend(a, b) {
        for (var prop in b) {
            a[prop] = b[prop];
        }

        return a;
    }

    function addEvent(elem, type, fn) {
        if (elem.addEventListener) {
            elem.addEventListener(type, fn, false);
        } else if (elem.attachEvent) {
            elem.attachEvent("on" + type, fn);
        } else {
            fn();
        }
    }

    function id(name) {
        return !!(typeof document !== "undefined" && document && document.getElementById) &&
		document.getElementById(name);
    }

    // Test for equality any JavaScript type.
    // Discussions and reference: http://philrathe.com/articles/equiv
    // Test suites: http://philrathe.com/tests/equiv
    // Author: Philippe Rathé <prathe@gmail.com>
    QUnit.equiv = function () {

        var innerEquiv; // the real equiv function
        var callers = []; // stack to decide between skip/abort functions


        // Determine what is o.
        function hoozit(o) {
            if (o.constructor === String) {
                return "string";

            } else if (o.constructor === Boolean) {
                return "boolean";

            } else if (o.constructor === Number) {

                if (isNaN(o)) {
                    return "nan";
                } else {
                    return "number";
                }

            } else if (typeof o === "undefined") {
                return "undefined";

                // consider: typeof null === object
            } else if (o === null) {
                return "null";

                // consider: typeof [] === object
            } else if (o instanceof Array) {
                return "array";

                // consider: typeof new Date() === object
            } else if (o instanceof Date) {
                return "date";

                // consider: /./ instanceof Object;
                //           /./ instanceof RegExp;
                //          typeof /./ === "function"; // => false in IE and Opera,
                //                                          true in FF and Safari
            } else if (o instanceof RegExp) {
                return "regexp";

            } else if (typeof o === "object") {
                return "object";

            } else if (o instanceof Function) {
                return "function";
            } else {
                return undefined;
            }
        }

        // Call the o related callback with the given arguments.
        function bindCallbacks(o, callbacks, args) {
            var prop = hoozit(o);
            if (prop) {
                if (hoozit(callbacks[prop]) === "function") {
                    return callbacks[prop].apply(callbacks, args);
                } else {
                    return callbacks[prop]; // or undefined
                }
            }
        }

        var callbacks = function () {

            // for string, boolean, number and null
            function useStrictEquality(b, a) {
                if (b instanceof a.constructor || a instanceof b.constructor) {
                    // to catch short annotaion VS 'new' annotation of a declaration
                    // e.g. var i = 1;
                    //      var j = new Number(1);
                    return a == b;
                } else {
                    return a === b;
                }
            }

            return {
                "string": useStrictEquality,
                "boolean": useStrictEquality,
                "number": useStrictEquality,
                "null": useStrictEquality,
                "undefined": useStrictEquality,

                "nan": function (b) {
                    return isNaN(b);
                },

                "date": function (b, a) {
                    return hoozit(b) === "date" && a.valueOf() === b.valueOf();
                },

                "regexp": function (b, a) {
                    return hoozit(b) === "regexp" &&
                    a.source === b.source && // the regex itself
                    a.global === b.global && // and its modifers (gmi) ...
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline;
                },

                // - skip when the property is a method of an instance (OOP)
                // - abort otherwise,
                //   initial === would have catch identical references anyway
                "function": function () {
                    var caller = callers[callers.length - 1];
                    return caller !== Object &&
                        typeof caller !== "undefined";
                },

                "array": function (b, a) {
                    var i;
                    var len;

                    // b could be an object literal here
                    if (!(hoozit(b) === "array")) {
                        return false;
                    }

                    len = a.length;
                    if (len !== b.length) { // safe and faster
                        return false;
                    }
                    for (i = 0; i < len; i++) {
                        if (!innerEquiv(a[i], b[i])) {
                            return false;
                        }
                    }
                    return true;
                },

                "object": function (b, a) {
                    var i;
                    var eq = true; // unless we can proove it
                    var aProperties = [], bProperties = []; // collection of strings

                    // comparing constructors is more strict than using instanceof
                    if (a.constructor !== b.constructor) {
                        return false;
                    }

                    // stack constructor before traversing properties
                    callers.push(a.constructor);

                    for (i in a) { // be strict: don't ensures hasOwnProperty and go deep

                        aProperties.push(i); // collect a's properties

                        if (!innerEquiv(a[i], b[i])) {
                            eq = false;
                        }
                    }

                    callers.pop(); // unstack, we are done

                    for (i in b) {
                        bProperties.push(i); // collect b's properties
                    }

                    // Ensures identical properties name
                    return eq && innerEquiv(aProperties.sort(), bProperties.sort());
                }
            };
        } ();

        innerEquiv = function () { // can take multiple arguments
            var args = Array.prototype.slice.apply(arguments);
            if (args.length < 2) {
                return true; // end transition
            }

            return (function (a, b) {
                if (a === b) {
                    return true; // catch the most you can
                } else if (a === null || b === null || typeof a === "undefined" || typeof b === "undefined" || hoozit(a) !== hoozit(b)) {
                    return false; // don't lose time with error prone cases
                } else {
                    return bindCallbacks(a, callbacks, [b, a]);
                }

                // apply transition with (1..n) arguments
            })(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length - 1));
        };

        return innerEquiv;

    } ();

    /**
    * jsDump
    * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
    * Licensed under BSD (http://www.opensource.org/licenses/bsd-license.php)
    * Date: 5/15/2008
    * @projectDescription Advanced and extensible data dumping for Javascript.
    * @version 1.0.0
    * @author Ariel Flesler
    * @link {http://flesler.blogspot.com/2008/05/jsdump-pretty-dump-of-any-javascript.html}
    */
    QUnit.jsDump = (function () {
        function quote(str) {
            return '"' + str.toString().replace(/"/g, '\\"') + '"';
        };
        function literal(o) {
            return o + '';
        };
        function join(pre, arr, post) {
            var s = jsDump.separator(),
			base = jsDump.indent(),
			inner = jsDump.indent(1);
            if (arr.join)
                arr = arr.join(',' + s + inner);
            if (!arr)
                return pre + post;
            return [pre, inner + arr, base + post].join(s);
        };
        function array(arr) {
            var i = arr.length, ret = Array(i);
            this.up();
            while (i--)
                ret[i] = this.parse(arr[i]);
            this.down();
            return join('[', ret, ']');
        };

        var reName = /^function (\w+)/;

        var jsDump = {
            parse: function (obj, type) { //type is used mostly internally, you can fix a (custom)type in advance
                var parser = this.parsers[type || this.typeOf(obj)];
                type = typeof parser;

                return type == 'function' ? parser.call(this, obj) :
				   type == 'string' ? parser :
				   this.parsers.error;
            },
            typeOf: function (obj) {
                var type = typeof obj,
				f = 'function'; //we'll use it 3 times, save it
                return type != 'object' && type != f ? type :
				!obj ? 'null' :
				obj.exec ? 'regexp' : // some browsers (FF) consider regexps functions
				obj.getHours ? 'date' :
				obj.scrollBy ? 'window' :
				obj.nodeName == '#document' ? 'document' :
				obj.nodeName ? 'node' :
				obj.item ? 'nodelist' : // Safari reports nodelists as functions
				obj.callee ? 'arguments' :
				obj.call || obj.constructor != Array && //an array would also fall on this hack
					(obj + '').indexOf(f) != -1 ? f : //IE reports functions like alert, as objects
				'length' in obj ? 'array' :
				type;
            },
            separator: function () {
                return this.multiline ? this.HTML ? '<br />' : '\n' : this.HTML ? '&nbsp;' : ' ';
            },
            indent: function (extra) {// extra can be a number, shortcut for increasing-calling-decreasing
                if (!this.multiline)
                    return '';
                var chr = this.indentChar;
                if (this.HTML)
                    chr = chr.replace(/\t/g, '   ').replace(/ /g, '&nbsp;');
                return Array(this._depth_ + (extra || 0)).join(chr);
            },
            up: function (a) {
                this._depth_ += a || 1;
            },
            down: function (a) {
                this._depth_ -= a || 1;
            },
            setParser: function (name, parser) {
                this.parsers[name] = parser;
            },
            // The next 3 are exposed so you can use them
            quote: quote,
            literal: literal,
            join: join,
            //
            _depth_: 1,
            // This is the list of parsers, to modify them, use jsDump.setParser
            parsers: {
                window: '[Window]',
                document: '[Document]',
                error: '[ERROR]', //when no parser is found, shouldn't happen
                unknown: '[Unknown]',
                'null': 'null',
                undefined: 'undefined',
                'function': function (fn) {
                    var ret = 'function',
					name = 'name' in fn ? fn.name : (reName.exec(fn) || [])[1]; //functions never have name in IE
                    if (name)
                        ret += ' ' + name;
                    ret += '(';

                    ret = [ret, this.parse(fn, 'functionArgs'), '){'].join('');
                    return join(ret, this.parse(fn, 'functionCode'), '}');
                },
                array: array,
                nodelist: array,
                arguments: array,
                object: function (map) {
                    var ret = [];
                    this.up();
                    for (var key in map)
                        ret.push(this.parse(key, 'key') + ': ' + this.parse(map[key]));
                    this.down();
                    return join('{', ret, '}');
                },
                node: function (node) {
                    var open = this.HTML ? '&lt;' : '<',
					close = this.HTML ? '&gt;' : '>';

                    var tag = node.nodeName.toLowerCase(),
					ret = open + tag;

                    for (var a in this.DOMAttrs) {
                        var val = node[this.DOMAttrs[a]];
                        if (val)
                            ret += ' ' + a + '=' + this.parse(val, 'attribute');
                    }
                    return ret + close + open + '/' + tag + close;
                },
                functionArgs: function (fn) {//function calls it internally, it's the arguments part of the function
                    var l = fn.length;
                    if (!l) return '';

                    var args = Array(l);
                    while (l--)
                        args[l] = String.fromCharCode(97 + l); //97 is 'a'
                    return ' ' + args.join(', ') + ' ';
                },
                key: quote, //object calls it internally, the key part of an item in a map
                functionCode: '[code]', //function calls it internally, it's the content of the function
                attribute: quote, //node calls it internally, it's an html attribute value
                string: quote,
                date: quote,
                regexp: literal, //regex
                number: literal,
                'boolean': literal
            },
            DOMAttrs: {//attributes to dump from nodes, name=>realName
                id: 'id',
                name: 'name',
                'class': 'className'
            },
            HTML: true, //if true, entities are escaped ( <, >, \t, space and \n )
            indentChar: '   ', //indentation unit
            multiline: true //if true, items in a collection, are separated by a \n, else just a space.
        };

        return jsDump;
    })();

})(this);


/// <reference path="../framework/core.js" />

(function () {
    var application = window.application = new Framework.Application();
    application.name = "Wires - Logic Gates";

    application.run = function () {
    application.controllers =
        {
            canvas: new application.CanvasController(document.getElementById("com-spartanprogramming-wires"))
        };

    application.repositories = {
        grid: {
            color: "#888888",
            width: 20,
            heigth: 20
        },
        wire: {
            jack: [
                { x: 100, y: 100, angle: Math.PI / 2 },
                { x: 300, y: 300, angle: 3 * Math.PI / 2 }
            ]
        }
    };
}
})();


(function (app) {
    app.CanvasController = function CanvasController(elem) {
        var view = new app.CanvasView(elem),
            grid = new app.GridController(view)
            wire = new app.WireController(view);
    }
})(application);


(function (app) {
    app.GridController = function GridController(view) {
        function Cell(width, height) {
            this.width = width;
            this.height = height;
        }

        var _cell = new Cell(20, 20);
        var _view = view;

        _view.fill("#CCCCCC");
        _view.rect(0, 0, _view.width, _view.height);
        _view.stroke("#666666");
        _view.lineWidth(0.1);
        for (var i = _cell.height; i < _view.height; i = i + _cell.height) {
            _view.line(0, i, _view.width, i);
        }
        for (var j = _cell.width; j < _view.width; j = j + _cell.width) {
            _view.line(j, 0, j, _view.height);
        }
    }
})(application);


(function (app) {
    app.WireController = function WireController(view) {
        var _view = view;

        function Jack(x, y) {
            var _x      = x,
                _y      = y,
                _self   = this,
                _radius = 5;

            this.mouseIn = false;
            this.x       = _x;
            this.y       = _y;

            this.draw = function draw() {
                _view.lineWidth = 1;
                if (!this.mouseIn) {
                    _view.fill("#ffffff");
                }
                else {
                    _view.fill("#0066BB");
                }
                _view.stroke("#000000");
                _view.arc(_x, _y, _radius, 0, 2 * Math.PI);
            }

            _view.mouseMoved = function () {
                if (Math.sqrt(Math.pow((this.mouseX - _x), 2) + Math.pow((this.mouseY - _y), 2)) < _radius) {
                    if (!_self.mouseIn) {
                        _self.mouseIn = true;
                        _self.draw();
                    }
                } else {
                    if (_self.mouseIn) {
                        _self.mouseIn = false;
                        _self.draw();
                    }
                }
            }
        }

        var _jack1 = new Jack(100, 100);
        var _jack2 = new Jack(300, 300);

        _view.fill("#ffffff");
        _view.stroke("#000000");
        _view.ctx.lineWidth = 8;
        _view.bezier(_jack1.x, _jack1.y,
                     _jack1.x + (_jack2.x - _jack1.x) / 2, _jack1.y,
                     _jack2.x, _jack2.y,
                     _jack2.x - (_jack2.x - _jack1.x) / 2, _jack2.y);
        _view.stroke("#ffffff");
        _view.ctx.lineWidth = 6;
        _view.bezier(_jack1.x, _jack1.y,
                     _jack1.x + (_jack2.x - _jack1.x) / 2, _jack1.y,
                     _jack2.x, _jack2.y,
                     _jack2.x - (_jack2.x - _jack1.x) / 2, _jack2.y);
        _view.stroke("#000000");
        _view.ctx.lineWidth = 1;

        _jack1.draw();
        _jack2.draw();
    }
})(application);


/// <reference path="../controllers/application.js" />

(function (app) {
    app.CanvasView = function CanvasView(elem) {

        var view = {};

        view.ctx = elem.getContext("2d");
        view.width = elem.width - 0;
        view.height = elem.height - 0;
        view.stroke = function strokeStyle(style) {
            view.ctx.strokeStyle = style;
        };
        view.fill = function fillStyle(style) {
            view.ctx.fillStyle = style;
        };
        view.lineWidth = function lineWidth(size) {
            view.ctx.lineWidth = size;
        };
        view.line = function line(x1, y1, x2, y2) {
            view.ctx.beginPath();
            view.ctx.moveTo(x1 || 0, y1 || 0);
            view.ctx.lineTo(x2 || 0, y2 || 0);
            view.ctx.stroke();
        };
        view.rect = function rect(x, y, width, height) {
            view.ctx.beginPath();
            view.ctx.fillRect(x, y, width, height);
        }
        view.arc = function arc(x, y, radius, startAngle, endAngle) {
            view.ctx.beginPath();
            view.ctx.arc(x, y, radius, startAngle, endAngle, false);
            view.ctx.fill();
            view.ctx.stroke();
        }
        view.bezier = function bezier(x1, y1, cp1x, cp1y, x2, y2, cp2x, cp2y) {
            view.ctx.beginPath();
            view.ctx.moveTo(x1, y1);
            view.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
            view.ctx.stroke();
        }

        view.cursor = function (mode) { document.body.style.cursor = mode; }

        // KeyCode table  
        view.CENTER = 88888880;
        view.CODED = 88888888;
        view.UP = 88888870;
        view.RIGHT = 88888871;
        view.DOWN = 88888872;
        view.LEFT = 88888869;

        //! // Description required...
        view.codedKeys = [69, 70, 71, 72];

        // Global vars for tracking mouse position
        view.pmouseX = 0;
        view.pmouseY = 0;
        view.mouseX = 0;
        view.mouseY = 0;
        view.mouseButton = 0;
        view.mouseDown = false;

        // Undefined event handlers to be replaced by user when needed
        view.mouseClicked = undefined;
        view.mouseDragged = undefined;
        view.mouseMoved = undefined;
        view.mousePressed = undefined;
        view.mouseReleased = undefined;
        view.keyPressed = undefined;
        view.keyReleased = undefined;

        //////////////////////////////////////////////////////////////////////////
        // Event handling
        //////////////////////////////////////////////////////////////////////////

        attach(elem, "mousemove", function (e) {

            var scrollX = window.scrollX != null ? window.scrollX : window.pageXOffset;
            var scrollY = window.scrollY != null ? window.scrollY : window.pageYOffset;

            view.pmouseX = view.mouseX;
            view.pmouseY = view.mouseY;
            view.mouseX = e.clientX - elem.offsetLeft + scrollX;
            view.mouseY = e.clientY - elem.offsetTop + scrollY;

            if (view.mouseMoved) { view.mouseMoved(); }
            if (view.mousePressed && view.mouseDragged) { view.mouseDragged(); }

        });

        attach(elem, "mouseout", function (e) { view.cursor("auto"); });

        attach(elem, "mousedown", function (e) {
            mousePressed = true;
            switch (e.which) {
                case 1: view.mouseButton = view.LEFT; break;
                case 2: view.mouseButton = view.CENTER; break;
                case 3: view.mouseButton = view.RIGHT; break;
            }
            view.mouseDown = true;
            if (typeof view.mousePressed == "function") { view.mousePressed(); }
            else { view.mousePressed = true; }
        });

        attach(elem, "contextmenu", function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        attach(elem, "mouseup", function (e) {
            mousePressed = false;
            if (view.mouseClicked) { view.mouseClicked(); }
            if (typeof view.mousePressed != "function") { view.mousePressed = false; }
            if (view.mouseReleased) { view.mouseReleased(); }
        });

        attach(document, "keydown", function (e) {
            keyPressed = true;
            view.key = e.keyCode + 32;
            var i, len = view.codedKeys.length;
            for (i = 0; i < len; i++) {
                if (view.key == view.codedKeys[i]) {
                    switch (view.key) {
                        case 70: view.keyCode = view.UP; break;
                        case 71: view.keyCode = view.RIGHT; break;
                        case 72: view.keyCode = view.DOWN; break;
                        case 69: view.keyCode = view.LEFT; break;
                    }
                    view.key = view.CODED;
                }
            }
            if (e.shiftKey) { view.key = String.fromCharCode(view.key).toUpperCase().charCodeAt(0); }
            if (typeof view.keyPressed == "function") { view.keyPressed(); }
            else { view.keyPressed = true; }
        });

        attach(document, "keyup", function (e) {
            keyPressed = false;
            if (typeof view.keyPressed != "function") { view.keyPressed = false; }
            if (view.keyReleased) { view.keyReleased(); }
        });

        function attach(elem, type, fn) {
            if (elem.addEventListener) { elem.addEventListener(type, fn, false); }
            else { elem.attachEvent("on" + type, fn); }
        }

        return view;
    }
})(application);


/// <reference path="../framework/qunit.js" />
/// <reference path="../controllers/application.js" />
/// <reference path="../controllers/canvas.js" />

(function (app) {
    module("application");
    test("Application name has been set", function () {
        equals(app.name, "Wires - Logic Gates", "Application name is");
    });
})(application);
