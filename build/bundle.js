
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                else
                    this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.52.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src\ContextMenu.svelte generated by Svelte v3.52.0 */

    const { window: window_1 } = globals;
    const file$4 = "src\\ContextMenu.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (153:0) {#if showMenu}
    function create_if_block$2(ctx) {
    	let nav;
    	let div;
    	let ul;
    	let mounted;
    	let dispose;
    	let each_value = /*menuItems*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-qhdec8");
    			add_location(ul, file$4, 155, 8, 4535);
    			attr_dev(div, "class", "navbar svelte-qhdec8");
    			attr_dev(div, "id", "navbar");
    			add_location(div, file$4, 154, 4, 4493);
    			attr_dev(nav, "id", "menu");
    			set_style(nav, "position", "absolute");
    			set_style(nav, "top", /*pos*/ ctx[0].y + "px");
    			set_style(nav, "left", /*pos*/ ctx[0].x + "px");
    			attr_dev(nav, "class", "svelte-qhdec8");
    			add_location(nav, file$4, 153, 0, 4386);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			if (!mounted) {
    				dispose = action_destroyer(/*getContextMenuDimension*/ ctx[4].call(null, nav));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuItems*/ 32) {
    				each_value = /*menuItems*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*pos*/ 1) {
    				set_style(nav, "top", /*pos*/ ctx[0].y + "px");
    			}

    			if (dirty & /*pos*/ 1) {
    				set_style(nav, "left", /*pos*/ ctx[0].x + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(153:0) {#if showMenu}",
    		ctx
    	});

    	return block;
    }

    // (160:16) {:else}
    function create_else_block$2(ctx) {
    	let li;
    	let button;
    	let i;
    	let t_value = /*item*/ ctx[12].displayText + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			i = element("i");
    			t = text(t_value);
    			attr_dev(i, "class", "" + (null_to_empty(/*item*/ ctx[12].class) + " svelte-qhdec8"));
    			add_location(i, file$4, 160, 56, 4728);
    			attr_dev(button, "class", "svelte-qhdec8");
    			add_location(button, file$4, 160, 24, 4696);
    			attr_dev(li, "class", "svelte-qhdec8");
    			add_location(li, file$4, 160, 20, 4692);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, i);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*item*/ ctx[12].onClick, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(160:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (158:16) {#if item.name == "hr"}
    function create_if_block_1$2(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			attr_dev(hr, "class", "svelte-qhdec8");
    			add_location(hr, file$4, 158, 20, 4641);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(158:16) {#if item.name == \\\"hr\\\"}",
    		ctx
    	});

    	return block;
    }

    // (157:12) {#each menuItems as item}
    function create_each_block$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[12].name == "hr") return create_if_block_1$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(157:12) {#each menuItems as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let link;
    	let t;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*showMenu*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css");
    			attr_dev(link, "integrity", "sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g==");
    			attr_dev(link, "crossorigin", "anonymous");
    			attr_dev(link, "referrerpolicy", "no-referrer");
    			attr_dev(link, "class", "svelte-qhdec8");
    			add_location(link, file$4, 86, 4, 2718);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "contextmenu", prevent_default(/*rightClickContextMenu*/ ctx[2]), false, true, false),
    					listen_dev(window_1, "click", /*onPageClick*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showMenu*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ContextMenu', slots, []);
    	let pos = { x: 0, y: 0 };

    	// menu is dimension (height and width) of context menu
    	let menu = { h: 0, y: 0 };

    	// browser/window dimension (height and width)
    	let browser = { h: 0, y: 0 };

    	// showMenu is state of context-menu visibility
    	let showMenu = false;

    	// to display some text
    	let content;

    	let { status = false } = $$props;

    	function rightClickContextMenu(e) {
    		$$invalidate(1, showMenu = true);

    		browser = {
    			w: window.innerWidth,
    			h: window.innerHeight
    		};

    		$$invalidate(0, pos = { x: e.clientX, y: e.clientY });

    		// If bottom part of context menu will be displayed
    		// after right-click, then change the position of the
    		// context menu. This position is controlled by `top` and `left`
    		// at inline style. 
    		// Instead of context menu is displayed from top left of cursor position
    		// when right-click occur, it will be displayed from bottom left.
    		if (browser.h - pos.y < menu.h) $$invalidate(0, pos.y = pos.y - menu.h, pos);

    		if (browser.w - pos.x < menu.w) $$invalidate(0, pos.x = pos.x - menu.w, pos);
    	}

    	function onPageClick(e) {
    		// To make context menu disappear when
    		// mouse is clicked outside context menu
    		$$invalidate(1, showMenu = false);
    	}

    	function getContextMenuDimension(node) {
    		// This function will get context menu dimension
    		// when navigation is shown => showMenu = true
    		let height = node.offsetHeight;

    		let width = node.offsetWidth;
    		menu = { h: height, w: width };
    	}

    	function addItem() {
    		$$invalidate(6, status = "TextBox");
    		return status;
    	}

    	// function print(){
    	//     content.textContent = "Printed..."
    	// }
    	// function zoom(){
    	//     content.textContent = "Zooom..."
    	// }
    	function remove() {
    		$$invalidate(6, status = false);
    	}

    	let menuItems = [
    		{
    			'name': 'addItem',
    			'onClick': addItem,
    			'displayText': "Add Text Item",
    			'class': 'fa-solid fa-plus'
    		},
    		{ 'name': 'hr' },
    		{
    			'name': 'close',
    			'onClick': remove,
    			'displayText': "close",
    			'class': 'fa-solid fa-trash-can'
    		}
    	];

    	const writable_props = ['status'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ContextMenu> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('status' in $$props) $$invalidate(6, status = $$props.status);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		pos,
    		menu,
    		browser,
    		showMenu,
    		content,
    		status,
    		rightClickContextMenu,
    		onPageClick,
    		getContextMenuDimension,
    		addItem,
    		remove,
    		menuItems
    	});

    	$$self.$inject_state = $$props => {
    		if ('pos' in $$props) $$invalidate(0, pos = $$props.pos);
    		if ('menu' in $$props) menu = $$props.menu;
    		if ('browser' in $$props) browser = $$props.browser;
    		if ('showMenu' in $$props) $$invalidate(1, showMenu = $$props.showMenu);
    		if ('content' in $$props) content = $$props.content;
    		if ('status' in $$props) $$invalidate(6, status = $$props.status);
    		if ('menuItems' in $$props) $$invalidate(5, menuItems = $$props.menuItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pos,
    		showMenu,
    		rightClickContextMenu,
    		onPageClick,
    		getContextMenuDimension,
    		menuItems,
    		status
    	];
    }

    class ContextMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { status: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContextMenu",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get status() {
    		throw new Error("<ContextMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set status(value) {
    		throw new Error("<ContextMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Draggable.svelte generated by Svelte v3.52.0 */

    const file$3 = "src\\Draggable.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (default_slot) default_slot.c();
    			set_style(section, "left", /*left*/ ctx[0] + "px");
    			set_style(section, "top", /*top*/ ctx[1] + "px");
    			attr_dev(section, "class", "draggable svelte-16c865w");
    			add_location(section, file$3, 34, 0, 535);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "mouseup", /*onMouseUp*/ ctx[4], false, false, false),
    					listen_dev(window, "mousemove", /*onMouseMove*/ ctx[3], false, false, false),
    					listen_dev(section, "mousedown", /*onMouseDown*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*left*/ 1) {
    				set_style(section, "left", /*left*/ ctx[0] + "px");
    			}

    			if (!current || dirty & /*top*/ 2) {
    				set_style(section, "top", /*top*/ ctx[1] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Draggable', slots, ['default']);
    	let { left = 100 } = $$props;
    	let { top = 100 } = $$props;
    	let moving = false;
    	var originalX, originalY;
    	var item;

    	function onMouseDown() {
    		moving = true;
    		originalX = left;
    		originalY = top;
    	}

    	function onMouseMove(e) {
    		if (moving) {
    			$$invalidate(0, left += e.movementX);
    			$$invalidate(1, top += e.movementY);
    		}
    	}

    	function onMouseUp(e) {
    		moving = false;
    	}

    	const writable_props = ['left', 'top'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Draggable> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('left' in $$props) $$invalidate(0, left = $$props.left);
    		if ('top' in $$props) $$invalidate(1, top = $$props.top);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		left,
    		top,
    		moving,
    		originalX,
    		originalY,
    		item,
    		onMouseDown,
    		onMouseMove,
    		onMouseUp
    	});

    	$$self.$inject_state = $$props => {
    		if ('left' in $$props) $$invalidate(0, left = $$props.left);
    		if ('top' in $$props) $$invalidate(1, top = $$props.top);
    		if ('moving' in $$props) moving = $$props.moving;
    		if ('originalX' in $$props) originalX = $$props.originalX;
    		if ('originalY' in $$props) originalY = $$props.originalY;
    		if ('item' in $$props) item = $$props.item;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [left, top, onMouseDown, onMouseMove, onMouseUp, $$scope, slots];
    }

    class Draggable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { left: 0, top: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Draggable",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get left() {
    		throw new Error("<Draggable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set left(value) {
    		throw new Error("<Draggable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get top() {
    		throw new Error("<Draggable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Draggable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const defaults = {
      duration: 4000,
      initial: 1,
      next: 0,
      pausable: false,
      dismissable: true,
      reversed: false,
      intro: { x: 256 }
    };

    const createToast = () => {
      const { subscribe, update } = writable([]);
      let count = 0;
      const options = {};
      const _obj = (obj) => obj instanceof Object;
      const push = (msg, opts = {}) => {
        const param = { target: 'default', ...(_obj(msg) ? msg : { ...opts, msg }) };
        const conf = options[param.target] || {};
        const entry = {
          ...defaults,
          ...conf,
          ...param,
          theme: { ...conf.theme, ...param.theme },
          classes: [...(conf.classes || []), ...(param.classes || [])],
          id: ++count
        };
        update((n) => (entry.reversed ? [...n, entry] : [entry, ...n]));
        return count
      };
      const pop = (id) => {
        update((n) => {
          if (!n.length || id === 0) return []
          if (_obj(id)) return n.filter((i) => id(i))
          const target = id || Math.max(...n.map((i) => i.id));
          return n.filter((i) => i.id !== target)
        });
      };
      const set = (id, opts = {}) => {
        const param = _obj(id) ? { ...id } : { ...opts, id };
        update((n) => {
          const idx = n.findIndex((i) => i.id === param.id);
          if (idx > -1) {
            n[idx] = { ...n[idx], ...param };
          }
          return n
        });
      };
      const _init = (target = 'default', opts = {}) => {
        options[target] = opts;
        return options
      };
      return { subscribe, push, pop, set, _init }
    };

    const toast = createToast();

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* node_modules\@zerodevx\svelte-toast\src\ToastItem.svelte generated by Svelte v3.52.0 */
    const file$2 = "node_modules\\@zerodevx\\svelte-toast\\src\\ToastItem.svelte";

    // (85:4) {:else}
    function create_else_block$1(ctx) {
    	let html_tag;
    	let raw_value = /*item*/ ctx[0].msg + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && raw_value !== (raw_value = /*item*/ ctx[0].msg + "")) html_tag.p(raw_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(85:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (83:4) {#if item.component}
    function create_if_block_1$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*componentProps*/ ctx[2]];
    	var switch_value = /*item*/ ctx[0].component.src;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentProps*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*componentProps*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*item*/ ctx[0].component.src)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(83:4) {#if item.component}",
    		ctx
    	});

    	return block;
    }

    // (89:2) {#if item.dismissable}
    function create_if_block$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "_toastBtn pe svelte-l65oht");
    			attr_dev(div, "role", "button");
    			attr_dev(div, "tabindex", "0");
    			add_location(div, file$2, 89, 4, 2139);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*close*/ ctx[4], false, false, false),
    					listen_dev(div, "keydown", /*keydown_handler*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(89:2) {#if item.dismissable}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let t1;
    	let progress_1;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[0].component) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*item*/ ctx[0].dismissable && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			progress_1 = element("progress");
    			attr_dev(div0, "role", "status");
    			attr_dev(div0, "class", "_toastMsg svelte-l65oht");
    			toggle_class(div0, "pe", /*item*/ ctx[0].component);
    			add_location(div0, file$2, 81, 2, 1894);
    			attr_dev(progress_1, "class", "_toastBar svelte-l65oht");
    			progress_1.value = /*$progress*/ ctx[1];
    			add_location(progress_1, file$2, 99, 2, 2368);
    			attr_dev(div1, "class", "_toastItem svelte-l65oht");
    			toggle_class(div1, "pe", /*item*/ ctx[0].pausable);
    			add_location(div1, file$2, 73, 0, 1751);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div1, t0);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, progress_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "mouseenter", /*mouseenter_handler*/ ctx[9], false, false, false),
    					listen_dev(div1, "mouseleave", /*resume*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div0, null);
    			}

    			if (!current || dirty & /*item*/ 1) {
    				toggle_class(div0, "pe", /*item*/ ctx[0].component);
    			}

    			if (/*item*/ ctx[0].dismissable) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div1, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*$progress*/ 2) {
    				prop_dev(progress_1, "value", /*$progress*/ ctx[1]);
    			}

    			if (!current || dirty & /*item*/ 1) {
    				toggle_class(div1, "pe", /*item*/ ctx[0].pausable);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $progress;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ToastItem', slots, []);
    	let { item } = $$props;
    	const progress = tweened(item.initial, { duration: item.duration, easing: identity });
    	validate_store(progress, 'progress');
    	component_subscribe($$self, progress, value => $$invalidate(1, $progress = value));
    	const close = () => toast.pop(item.id);

    	const autoclose = () => {
    		if ($progress === 1 || $progress === 0) {
    			close();
    		}
    	};

    	let next = item.initial;
    	let prev = next;
    	let paused = false;

    	const pause = () => {
    		if (!paused && $progress !== next) {
    			progress.set($progress, { duration: 0 });
    			paused = true;
    		}
    	};

    	const resume = () => {
    		if (paused) {
    			const d = item.duration;
    			const duration = d - d * (($progress - prev) / (next - prev));
    			progress.set(next, { duration }).then(autoclose);
    			paused = false;
    		}
    	};

    	let componentProps = {};
    	const check = (prop, kind = 'undefined') => typeof prop === kind;
    	let unlisten;

    	const listen = (d = document) => {
    		if (check(d.hidden)) return;
    		const handler = () => d.hidden ? pause() : resume();
    		const name = 'visibilitychange';
    		d.addEventListener(name, handler);
    		unlisten = () => d.removeEventListener(name, handler);
    		handler();
    	};

    	onMount(listen);

    	onDestroy(() => {
    		if (check(item.onpop, 'function')) {
    			item.onpop(item.id);
    		}

    		unlisten && unlisten();
    	});

    	$$self.$$.on_mount.push(function () {
    		if (item === undefined && !('item' in $$props || $$self.$$.bound[$$self.$$.props['item']])) {
    			console.warn("<ToastItem> was created without expected prop 'item'");
    		}
    	});

    	const writable_props = ['item'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ToastItem> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = e => {
    		if (e instanceof KeyboardEvent && ['Enter', ' '].includes(e.key)) close();
    	};

    	const mouseenter_handler = () => {
    		if (item.pausable) pause();
    	};

    	$$self.$$set = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		tweened,
    		linear: identity,
    		toast,
    		item,
    		progress,
    		close,
    		autoclose,
    		next,
    		prev,
    		paused,
    		pause,
    		resume,
    		componentProps,
    		check,
    		unlisten,
    		listen,
    		$progress
    	});

    	$$self.$inject_state = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    		if ('next' in $$props) $$invalidate(7, next = $$props.next);
    		if ('prev' in $$props) prev = $$props.prev;
    		if ('paused' in $$props) paused = $$props.paused;
    		if ('componentProps' in $$props) $$invalidate(2, componentProps = $$props.componentProps);
    		if ('unlisten' in $$props) unlisten = $$props.unlisten;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*item*/ 1) {
    			// `progress` has been renamed to `next`; shim included for backward compatibility, to remove in next major
    			if (!check(item.progress)) {
    				$$invalidate(0, item.next = item.progress, item);
    			}
    		}

    		if ($$self.$$.dirty & /*next, item, $progress*/ 131) {
    			if (next !== item.next) {
    				$$invalidate(7, next = item.next);
    				prev = $progress;
    				paused = false;
    				progress.set(next).then(autoclose);
    			}
    		}

    		if ($$self.$$.dirty & /*item*/ 1) {
    			if (item.component) {
    				const { props = {}, sendIdTo } = item.component;

    				$$invalidate(2, componentProps = {
    					...props,
    					...sendIdTo && { [sendIdTo]: item.id }
    				});
    			}
    		}
    	};

    	return [
    		item,
    		$progress,
    		componentProps,
    		progress,
    		close,
    		pause,
    		resume,
    		next,
    		keydown_handler,
    		mouseenter_handler
    	];
    }

    class ToastItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { item: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToastItem",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get item() {
    		throw new Error("<ToastItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<ToastItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@zerodevx\svelte-toast\src\SvelteToast.svelte generated by Svelte v3.52.0 */

    const { Object: Object_1 } = globals;
    const file$1 = "node_modules\\@zerodevx\\svelte-toast\\src\\SvelteToast.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (19:2) {#each items as item (item.id)}
    function create_each_block$1(key_1, ctx) {
    	let li;
    	let toastitem;
    	let t;
    	let li_class_value;
    	let li_style_value;
    	let li_intro;
    	let li_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	toastitem = new ToastItem({
    			props: { item: /*item*/ ctx[5] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			create_component(toastitem.$$.fragment);
    			t = space();
    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*item*/ ctx[5].classes.join(' ')) + " svelte-yh90az"));
    			attr_dev(li, "style", li_style_value = /*getCss*/ ctx[1](/*item*/ ctx[5].theme));
    			add_location(li, file$1, 19, 4, 494);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(toastitem, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const toastitem_changes = {};
    			if (dirty & /*items*/ 1) toastitem_changes.item = /*item*/ ctx[5];
    			toastitem.$set(toastitem_changes);

    			if (!current || dirty & /*items*/ 1 && li_class_value !== (li_class_value = "" + (null_to_empty(/*item*/ ctx[5].classes.join(' ')) + " svelte-yh90az"))) {
    				attr_dev(li, "class", li_class_value);
    			}

    			if (!current || dirty & /*items*/ 1 && li_style_value !== (li_style_value = /*getCss*/ ctx[1](/*item*/ ctx[5].theme))) {
    				attr_dev(li, "style", li_style_value);
    			}
    		},
    		r: function measure() {
    			rect = li.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(li);
    			stop_animation();
    			add_transform(li, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(li, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toastitem.$$.fragment, local);

    			add_render_callback(() => {
    				if (li_outro) li_outro.end(1);
    				li_intro = create_in_transition(li, fly, /*item*/ ctx[5].intro);
    				li_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toastitem.$$.fragment, local);
    			if (li_intro) li_intro.invalidate();
    			li_outro = create_out_transition(li, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(toastitem);
    			if (detaching && li_outro) li_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(19:2) {#each items as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[5].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "_toastContainer svelte-yh90az");
    			add_location(ul, file$1, 17, 0, 427);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items, getCss*/ 3) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, fix_and_outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $toast;
    	validate_store(toast, 'toast');
    	component_subscribe($$self, toast, $$value => $$invalidate(4, $toast = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvelteToast', slots, []);
    	let { options = {} } = $$props;
    	let { target = 'default' } = $$props;
    	let items;
    	const getCss = theme => Object.keys(theme).reduce((a, c) => `${a}${c}:${theme[c]};`, '');
    	const writable_props = ['options', 'target'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvelteToast> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('options' in $$props) $$invalidate(2, options = $$props.options);
    		if ('target' in $$props) $$invalidate(3, target = $$props.target);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		fly,
    		flip,
    		toast,
    		ToastItem,
    		options,
    		target,
    		items,
    		getCss,
    		$toast
    	});

    	$$self.$inject_state = $$props => {
    		if ('options' in $$props) $$invalidate(2, options = $$props.options);
    		if ('target' in $$props) $$invalidate(3, target = $$props.target);
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*target, options*/ 12) {
    			toast._init(target, options);
    		}

    		if ($$self.$$.dirty & /*$toast, target*/ 24) {
    			$$invalidate(0, items = $toast.filter(i => i.target === target));
    		}
    	};

    	return [items, getCss, options, target, $toast];
    }

    class SvelteToast extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { options: 2, target: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvelteToast",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get options() {
    		throw new Error("<SvelteToast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<SvelteToast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get target() {
    		throw new Error("<SvelteToast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set target(value) {
    		throw new Error("<SvelteToast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.52.0 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[84] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[87] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[90] = list[i];
    	child_ctx[91] = list;
    	child_ctx[92] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[93] = list[i];
    	return child_ctx;
    }

    // (421:6) {:else}
    function create_else_block_2(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let circle_r_value;
    	let circle_fill_value;
    	let mounted;
    	let dispose;

    	function click_handler_6(...args) {
    		return /*click_handler_6*/ ctx[39](/*circle*/ ctx[93], ...args);
    	}

    	function contextmenu_handler_1() {
    		return /*contextmenu_handler_1*/ ctx[40](/*circle*/ ctx[93]);
    	}

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", circle_cx_value = /*circle*/ ctx[93].cx);
    			attr_dev(circle, "cy", circle_cy_value = /*circle*/ ctx[93].cy);
    			attr_dev(circle, "r", circle_r_value = /*circle*/ ctx[93].r);

    			attr_dev(circle, "fill", circle_fill_value = /*circle*/ ctx[93] === /*selected*/ ctx[4]
    			? "#ccc"
    			: "white");

    			attr_dev(circle, "fill-opacity", "0.6");
    			attr_dev(circle, "class", "svelte-em4l87");
    			add_location(circle, file, 422, 8, 10888);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle, "click", click_handler_6, false, false, false),
    					listen_dev(circle, "contextmenu", stop_propagation(prevent_default(contextmenu_handler_1)), false, true, true)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*circles*/ 4 && circle_cx_value !== (circle_cx_value = /*circle*/ ctx[93].cx)) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty[0] & /*circles*/ 4 && circle_cy_value !== (circle_cy_value = /*circle*/ ctx[93].cy)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty[0] & /*circles*/ 4 && circle_r_value !== (circle_r_value = /*circle*/ ctx[93].r)) {
    				attr_dev(circle, "r", circle_r_value);
    			}

    			if (dirty[0] & /*circles, selected*/ 20 && circle_fill_value !== (circle_fill_value = /*circle*/ ctx[93] === /*selected*/ ctx[4]
    			? "#ccc"
    			: "white")) {
    				attr_dev(circle, "fill", circle_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(421:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (406:6) {#if _export}
    function create_if_block_8(ctx) {
    	let a;
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let circle_r_value;
    	let mounted;
    	let dispose;

    	function click_handler_5(...args) {
    		return /*click_handler_5*/ ctx[37](/*circle*/ ctx[93], ...args);
    	}

    	function contextmenu_handler() {
    		return /*contextmenu_handler*/ ctx[38](/*circle*/ ctx[93]);
    	}

    	const block = {
    		c: function create() {
    			a = svg_element("a");
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", circle_cx_value = /*circle*/ ctx[93].cx);
    			attr_dev(circle, "cy", circle_cy_value = /*circle*/ ctx[93].cy);
    			attr_dev(circle, "r", circle_r_value = /*circle*/ ctx[93].r);
    			attr_dev(circle, "fill", "white");
    			attr_dev(circle, "fill-opacity", "0.1");
    			attr_dev(circle, "class", "svelte-em4l87");
    			add_location(circle, file, 407, 10, 10408);
    			xlink_attr(a, "xlink:href", " ");
    			attr_dev(a, "class", "svg");
    			add_location(a, file, 406, 8, 10367);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, circle);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle, "click", click_handler_5, false, false, false),
    					listen_dev(circle, "contextmenu", stop_propagation(prevent_default(contextmenu_handler)), false, true, true)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*circles*/ 4 && circle_cx_value !== (circle_cx_value = /*circle*/ ctx[93].cx)) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty[0] & /*circles*/ 4 && circle_cy_value !== (circle_cy_value = /*circle*/ ctx[93].cy)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty[0] & /*circles*/ 4 && circle_r_value !== (circle_r_value = /*circle*/ ctx[93].r)) {
    				attr_dev(circle, "r", circle_r_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(406:6) {#if _export}",
    		ctx
    	});

    	return block;
    }

    // (405:4) {#each circles as circle}
    function create_each_block_3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*_export*/ ctx[7]) return create_if_block_8;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(405:4) {#each circles as circle}",
    		ctx
    	});

    	return block;
    }

    // (456:2) {:else}
    function create_else_block_1(ctx) {
    	let section;
    	let div;
    	let input;
    	let input_id_value;
    	let t;
    	let mounted;
    	let dispose;

    	function input_input_handler_1() {
    		/*input_input_handler_1*/ ctx[42].call(input, /*each_value_2*/ ctx[91], /*drop_index*/ ctx[92]);
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			input = element("input");
    			t = space();
    			attr_dev(input, "id", input_id_value = /*drop*/ ctx[90].id);
    			attr_dev(input, "type", "text");
    			set_style(input, "width", /*drop*/ ctx[90].width + "px");
    			set_style(input, "height", /*drop*/ ctx[90].height + "px");
    			attr_dev(input, "class", "svelte-em4l87");
    			add_location(input, file, 463, 8, 12050);
    			attr_dev(div, "class", "objects svelte-em4l87");
    			set_style(div, "cursor", "auto");
    			set_style(div, "value", /*drop*/ ctx[90].value);
    			set_style(div, "width", /*drop*/ ctx[90].width + "px");
    			set_style(div, "height", /*drop*/ ctx[90].height + "px");
    			add_location(div, file, 459, 6, 11911);
    			set_style(section, "cursor", "auto");
    			set_style(section, "top", /*drop*/ ctx[90].top + "px");
    			set_style(section, "left", /*drop*/ ctx[90].left + "px");
    			set_style(section, "position", "absolute");
    			add_location(section, file, 456, 4, 11805);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(div, input);
    			set_input_value(input, /*drop*/ ctx[90].value);
    			append_dev(section, t);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_1);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*dropped*/ 8192 && input_id_value !== (input_id_value = /*drop*/ ctx[90].id)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty[0] & /*dropped*/ 8192) {
    				set_style(input, "width", /*drop*/ ctx[90].width + "px");
    			}

    			if (dirty[0] & /*dropped*/ 8192) {
    				set_style(input, "height", /*drop*/ ctx[90].height + "px");
    			}

    			if (dirty[0] & /*dropped*/ 8192 && input.value !== /*drop*/ ctx[90].value) {
    				set_input_value(input, /*drop*/ ctx[90].value);
    			}

    			if (dirty[0] & /*dropped*/ 8192) {
    				set_style(div, "value", /*drop*/ ctx[90].value);
    			}

    			if (dirty[0] & /*dropped*/ 8192) {
    				set_style(div, "width", /*drop*/ ctx[90].width + "px");
    			}

    			if (dirty[0] & /*dropped*/ 8192) {
    				set_style(div, "height", /*drop*/ ctx[90].height + "px");
    			}

    			if (dirty[0] & /*dropped*/ 8192) {
    				set_style(section, "top", /*drop*/ ctx[90].top + "px");
    			}

    			if (dirty[0] & /*dropped*/ 8192) {
    				set_style(section, "left", /*drop*/ ctx[90].left + "px");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(456:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (441:2) {#if drop.stabled == false}
    function create_if_block_7(ctx) {
    	let draggable;
    	let current;

    	draggable = new Draggable({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(draggable.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(draggable, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const draggable_changes = {};

    			if (dirty[0] & /*dropped*/ 8192 | dirty[3] & /*$$scope*/ 8) {
    				draggable_changes.$$scope = { dirty, ctx };
    			}

    			draggable.$set(draggable_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(draggable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(draggable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(draggable, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(441:2) {#if drop.stabled == false}",
    		ctx
    	});

    	return block;
    }

    // (442:4) <Draggable>
    function create_default_slot(ctx) {
    	let div;
    	let input;
    	let input_id_value;
    	let t;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[41].call(input, /*each_value_2*/ ctx[91], /*drop_index*/ ctx[92]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			attr_dev(input, "id", input_id_value = /*drop*/ ctx[90].id);
    			attr_dev(input, "type", "text");
    			set_style(input, "width", /*drop*/ ctx[90].width + "px");
    			set_style(input, "height", /*drop*/ ctx[90].height + "px");
    			attr_dev(input, "class", "svelte-em4l87");
    			add_location(input, file, 447, 8, 11599);
    			attr_dev(div, "class", "objects svelte-em4l87");
    			set_style(div, "cursor", "auto");
    			set_style(div, "value", /*drop*/ ctx[90].value);
    			set_style(div, "width", /*drop*/ ctx[90].width + "px");
    			set_style(div, "height", /*drop*/ ctx[90].height + "px");
    			add_location(div, file, 442, 6, 11425);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*drop*/ ctx[90].value);
    			insert_dev(target, t, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", input_input_handler),
    					listen_dev(div, "mousedown", /*onMouseDown*/ ctx[25], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*dropped*/ 8192 && input_id_value !== (input_id_value = /*drop*/ ctx[90].id)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty[0] & /*dropped*/ 8192) {
    				set_style(input, "width", /*drop*/ ctx[90].width + "px");
    			}

    			if (dirty[0] & /*dropped*/ 8192) {
    				set_style(input, "height", /*drop*/ ctx[90].height + "px");
    			}

    			if (dirty[0] & /*dropped*/ 8192 && input.value !== /*drop*/ ctx[90].value) {
    				set_input_value(input, /*drop*/ ctx[90].value);
    			}

    			if (dirty[0] & /*dropped*/ 8192) {
    				set_style(div, "value", /*drop*/ ctx[90].value);
    			}

    			if (dirty[0] & /*dropped*/ 8192) {
    				set_style(div, "width", /*drop*/ ctx[90].width + "px");
    			}

    			if (dirty[0] & /*dropped*/ 8192) {
    				set_style(div, "height", /*drop*/ ctx[90].height + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(442:4) <Draggable>",
    		ctx
    	});

    	return block;
    }

    // (440:0) {#each dropped as drop}
    function create_each_block_2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_7, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*drop*/ ctx[90].stabled == false) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(440:0) {#each dropped as drop}",
    		ctx
    	});

    	return block;
    }

    // (480:0) {#if adjusting || _export}
    function create_if_block_4(ctx) {
    	let nav;
    	let br0;
    	let t0;
    	let br1;
    	let br2;
    	let t1;
    	let div;
    	let nav_transition;
    	let current;

    	function select_block_type_2(ctx, dirty) {
    		if (/*_export*/ ctx[7]) return create_if_block_5;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			br0 = element("br");
    			t0 = space();
    			br1 = element("br");
    			br2 = element("br");
    			t1 = space();
    			div = element("div");
    			if_block.c();
    			add_location(br0, file, 481, 4, 12614);
    			add_location(br1, file, 482, 4, 12625);
    			add_location(br2, file, 482, 10, 12631);
    			attr_dev(div, "class", "adjuster svelte-em4l87");
    			add_location(div, file, 483, 4, 12642);
    			attr_dev(nav, "class", "sidebar svelte-em4l87");
    			add_location(nav, file, 480, 2, 12548);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, br0);
    			append_dev(nav, t0);
    			append_dev(nav, br1);
    			append_dev(nav, br2);
    			append_dev(nav, t1);
    			append_dev(nav, div);
    			if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!nav_transition) nav_transition = create_bidirectional_transition(nav, fly, { x: 250, opacity: 1 }, true);
    				nav_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!nav_transition) nav_transition = create_bidirectional_transition(nav, fly, { x: 250, opacity: 1 }, false);
    			nav_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if_block.d();
    			if (detaching && nav_transition) nav_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(480:0) {#if adjusting || _export}",
    		ctx
    	});

    	return block;
    }

    // (493:6) {:else}
    function create_else_block(ctx) {
    	let p0;
    	let t0;
    	let t1_value = /*selected*/ ctx[4].cx + "";
    	let t1;
    	let t2;
    	let t3_value = /*selected*/ ctx[4].cy + "";
    	let t3;
    	let t4;
    	let input0;
    	let input0_value_value;
    	let t5;
    	let p1;
    	let t7;
    	let textarea;
    	let t8;
    	let p2;
    	let label0;
    	let input1;
    	let t9;
    	let t10;
    	let label1;
    	let input2;
    	let t11;
    	let t12;
    	let label2;
    	let input3;
    	let t13;
    	let t14;
    	let t15;
    	let label3;
    	let input4;
    	let t16;
    	let mounted;
    	let dispose;
    	let if_block = /*assign*/ ctx[9] && create_if_block_6(ctx);

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("adjust diameter of circle at ");
    			t1 = text(t1_value);
    			t2 = text(", ");
    			t3 = text(t3_value);
    			t4 = space();
    			input0 = element("input");
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Hint Text";
    			t7 = space();
    			textarea = element("textarea");
    			t8 = space();
    			p2 = element("p");
    			label0 = element("label");
    			input1 = element("input");
    			t9 = text("跳轉上一個場景");
    			t10 = space();
    			label1 = element("label");
    			input2 = element("input");
    			t11 = text("跳轉下一個場景");
    			t12 = space();
    			label2 = element("label");
    			input3 = element("input");
    			t13 = text("指定跳轉場景");
    			t14 = space();
    			if (if_block) if_block.c();
    			t15 = space();
    			label3 = element("label");
    			input4 = element("input");
    			t16 = text("設為多重選項");
    			add_location(p0, file, 493, 8, 13016);
    			attr_dev(input0, "type", "range");
    			input0.value = input0_value_value = /*selected*/ ctx[4].r;
    			attr_dev(input0, "class", "svelte-em4l87");
    			add_location(input0, file, 494, 8, 13089);
    			add_location(p1, file, 495, 8, 13157);
    			set_style(textarea, "width", "290px");
    			set_style(textarea, "height", "100px");
    			add_location(textarea, file, 496, 8, 13182);
    			attr_dev(input1, "type", "checkbox");
    			set_style(input1, "width", "20%");
    			attr_dev(input1, "class", "svelte-em4l87");
    			add_location(input1, file, 502, 13, 13330);
    			add_location(label0, file, 501, 10, 13310);
    			attr_dev(input2, "type", "checkbox");
    			set_style(input2, "width", "20%");
    			attr_dev(input2, "class", "svelte-em4l87");
    			add_location(input2, file, 509, 13, 13521);
    			add_location(label1, file, 508, 10, 13501);
    			attr_dev(input3, "type", "checkbox");
    			set_style(input3, "width", "20%");
    			attr_dev(input3, "class", "svelte-em4l87");
    			add_location(input3, file, 516, 13, 13708);
    			add_location(label2, file, 515, 10, 13688);
    			attr_dev(input4, "type", "checkbox");
    			set_style(input4, "width", "20%");
    			attr_dev(input4, "class", "svelte-em4l87");
    			add_location(input4, file, 532, 13, 14152);
    			add_location(label3, file, 531, 10, 14132);
    			add_location(p2, file, 500, 8, 13296);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, input0, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*selected*/ ctx[4].value);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, label0);
    			append_dev(label0, input1);
    			input1.checked = /*selected*/ ctx[4].ToPrevious;
    			append_dev(label0, t9);
    			append_dev(p2, t10);
    			append_dev(p2, label1);
    			append_dev(label1, input2);
    			input2.checked = /*selected*/ ctx[4].ToNext;
    			append_dev(label1, t11);
    			append_dev(p2, t12);
    			append_dev(p2, label2);
    			append_dev(label2, input3);
    			input3.checked = /*assign*/ ctx[9];
    			append_dev(label2, t13);
    			append_dev(p2, t14);
    			if (if_block) if_block.m(p2, null);
    			append_dev(p2, t15);
    			append_dev(p2, label3);
    			append_dev(label3, input4);
    			input4.checked = /*selected*/ ctx[4].Muti;
    			append_dev(label3, t16);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*adjust*/ ctx[17], false, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[43]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[44]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[45]),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[46]),
    					listen_dev(input4, "change", /*input4_change_handler*/ ctx[48])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected*/ 16 && t1_value !== (t1_value = /*selected*/ ctx[4].cx + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*selected*/ 16 && t3_value !== (t3_value = /*selected*/ ctx[4].cy + "")) set_data_dev(t3, t3_value);

    			if (dirty[0] & /*selected*/ 16 && input0_value_value !== (input0_value_value = /*selected*/ ctx[4].r)) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if (dirty[0] & /*selected*/ 16) {
    				set_input_value(textarea, /*selected*/ ctx[4].value);
    			}

    			if (dirty[0] & /*selected*/ 16) {
    				input1.checked = /*selected*/ ctx[4].ToPrevious;
    			}

    			if (dirty[0] & /*selected*/ 16) {
    				input2.checked = /*selected*/ ctx[4].ToNext;
    			}

    			if (dirty[0] & /*assign*/ 512) {
    				input3.checked = /*assign*/ ctx[9];
    			}

    			if (/*assign*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_6(ctx);
    					if_block.c();
    					if_block.m(p2, t15);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*selected*/ 16) {
    				input4.checked = /*selected*/ ctx[4].Muti;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(textarea);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(p2);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(493:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (485:6) {#if _export}
    function create_if_block_5(ctx) {
    	let p;
    	let t1;
    	let table;
    	let tr0;
    	let td0;
    	let td1;
    	let t3_value = /*data*/ ctx[11].test_ID + "";
    	let t3;
    	let t4;
    	let tr1;
    	let td2;
    	let td3;
    	let t6_value = /*data*/ ctx[11].dept_code + "";
    	let t6;
    	let t7;
    	let tr2;
    	let td4;
    	let td5;
    	let t9_value = /*data*/ ctx[11].test_code + "";
    	let t9;
    	let t10;
    	let tr3;
    	let td6;
    	let td7;
    	let t12_value = /*data*/ ctx[11].steps + "";
    	let t12;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "輸出完成資訊如下，請重整後再繼續";
    			t1 = space();
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "test_ID:";
    			td1 = element("td");
    			t3 = text(t3_value);
    			t4 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			td2.textContent = "dept_code:";
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			tr2 = element("tr");
    			td4 = element("td");
    			td4.textContent = "test_code:";
    			td5 = element("td");
    			t9 = text(t9_value);
    			t10 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			td6.textContent = "steps:";
    			td7 = element("td");
    			t12 = text(t12_value);
    			add_location(p, file, 485, 8, 12693);
    			add_location(td0, file, 487, 14, 12747);
    			add_location(td1, file, 487, 31, 12764);
    			add_location(tr0, file, 487, 10, 12743);
    			add_location(td2, file, 488, 14, 12807);
    			add_location(td3, file, 488, 33, 12826);
    			add_location(tr1, file, 488, 10, 12803);
    			add_location(td4, file, 489, 14, 12871);
    			add_location(td5, file, 489, 33, 12890);
    			add_location(tr2, file, 489, 10, 12867);
    			add_location(td6, file, 490, 14, 12935);
    			add_location(td7, file, 490, 29, 12950);
    			add_location(tr3, file, 490, 10, 12931);
    			add_location(table, file, 486, 8, 12725);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, td0);
    			append_dev(tr0, td1);
    			append_dev(td1, t3);
    			append_dev(table, t4);
    			append_dev(table, tr1);
    			append_dev(tr1, td2);
    			append_dev(tr1, td3);
    			append_dev(td3, t6);
    			append_dev(table, t7);
    			append_dev(table, tr2);
    			append_dev(tr2, td4);
    			append_dev(tr2, td5);
    			append_dev(td5, t9);
    			append_dev(table, t10);
    			append_dev(table, tr3);
    			append_dev(tr3, td6);
    			append_dev(tr3, td7);
    			append_dev(td7, t12);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*data*/ 2048 && t3_value !== (t3_value = /*data*/ ctx[11].test_ID + "")) set_data_dev(t3, t3_value);
    			if (dirty[0] & /*data*/ 2048 && t6_value !== (t6_value = /*data*/ ctx[11].dept_code + "")) set_data_dev(t6, t6_value);
    			if (dirty[0] & /*data*/ 2048 && t9_value !== (t9_value = /*data*/ ctx[11].test_code + "")) set_data_dev(t9, t9_value);
    			if (dirty[0] & /*data*/ 2048 && t12_value !== (t12_value = /*data*/ ctx[11].steps + "")) set_data_dev(t12, t12_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(485:6) {#if _export}",
    		ctx
    	});

    	return block;
    }

    // (523:10) {#if assign}
    function create_if_block_6(ctx) {
    	let label;
    	let t;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text("步驟:");
    			input = element("input");
    			attr_dev(input, "type", "number");
    			set_style(input, "width", "20%");
    			attr_dev(input, "class", "svelte-em4l87");
    			add_location(input, file, 524, 18, 13952);
    			set_style(label, "left", "20%");
    			set_style(label, "position", "relative");
    			add_location(label, file, 523, 12, 13890);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t);
    			append_dev(label, input);
    			set_input_value(input, /*selected*/ ctx[4].step);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_2*/ ctx[47]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected*/ 16 && to_number(input.value) !== /*selected*/ ctx[4].step) {
    				set_input_value(input, /*selected*/ ctx[4].step);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(523:10) {#if assign}",
    		ctx
    	});

    	return block;
    }

    // (544:0) {#if mode == false}
    function create_if_block_3(ctx) {
    	let nav;
    	let br0;
    	let t0;
    	let br1;
    	let br2;
    	let t1;
    	let div;
    	let p0;
    	let t3;
    	let input0;
    	let t4;
    	let p1;
    	let t6;
    	let table;
    	let tr0;
    	let td0;
    	let t8;
    	let td1;
    	let input1;
    	let t9;
    	let tr1;
    	let td2;
    	let t11;
    	let td3;
    	let input2;
    	let t12;
    	let tr2;
    	let td4;
    	let t14;
    	let td5;
    	let input3;
    	let t15;
    	let tr3;
    	let td6;
    	let t17;
    	let td7;
    	let input4;
    	let t18;
    	let button0;
    	let t20;
    	let button1;
    	let nav_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			br0 = element("br");
    			t0 = space();
    			br1 = element("br");
    			br2 = element("br");
    			t1 = space();
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "import IMG";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "basic setting";
    			t6 = space();
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "test_ID";
    			t8 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t9 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			td2.textContent = "dept_code";
    			t11 = space();
    			td3 = element("td");
    			input2 = element("input");
    			t12 = space();
    			tr2 = element("tr");
    			td4 = element("td");
    			td4.textContent = "test_code";
    			t14 = space();
    			td5 = element("td");
    			input3 = element("input");
    			t15 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			td6.textContent = "steps";
    			t17 = space();
    			td7 = element("td");
    			input4 = element("input");
    			t18 = space();
    			button0 = element("button");
    			button0.textContent = "取消";
    			t20 = space();
    			button1 = element("button");
    			button1.textContent = "確認";
    			add_location(br0, file, 545, 4, 14445);
    			add_location(br1, file, 546, 4, 14456);
    			add_location(br2, file, 546, 10, 14462);
    			set_style(p0, "text-align", "left");
    			add_location(p0, file, 548, 6, 14527);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "width", "300");
    			attr_dev(input0, "class", "svelte-em4l87");
    			add_location(input0, file, 549, 6, 14577);
    			set_style(p1, "text-align", "left");
    			add_location(p1, file, 555, 6, 14700);
    			add_location(td0, file, 558, 10, 14784);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "svelte-em4l87");
    			add_location(input1, file, 559, 14, 14815);
    			add_location(td1, file, 559, 10, 14811);
    			add_location(tr0, file, 557, 8, 14769);
    			add_location(td2, file, 562, 10, 14905);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "svelte-em4l87");
    			add_location(input2, file, 563, 14, 14938);
    			add_location(td3, file, 563, 10, 14934);
    			add_location(tr1, file, 561, 8, 14890);
    			add_location(td4, file, 566, 10, 15030);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "class", "svelte-em4l87");
    			add_location(input3, file, 567, 14, 15063);
    			add_location(td5, file, 567, 10, 15059);
    			add_location(tr2, file, 565, 8, 15015);
    			add_location(td6, file, 570, 10, 15155);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", "svelte-em4l87");
    			add_location(input4, file, 571, 14, 15184);
    			add_location(td7, file, 571, 10, 15180);
    			add_location(tr3, file, 569, 8, 15140);
    			add_location(table, file, 556, 6, 14753);
    			attr_dev(button0, "class", "svelte-em4l87");
    			add_location(button0, file, 574, 6, 15270);
    			attr_dev(button1, "class", "svelte-em4l87");
    			add_location(button1, file, 575, 6, 15326);
    			attr_dev(div, "class", "import svelte-em4l87");
    			set_style(div, "text-align", "center");
    			add_location(div, file, 547, 4, 14473);
    			attr_dev(nav, "class", "sidebar svelte-em4l87");
    			add_location(nav, file, 544, 2, 14379);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, br0);
    			append_dev(nav, t0);
    			append_dev(nav, br1);
    			append_dev(nav, br2);
    			append_dev(nav, t1);
    			append_dev(nav, div);
    			append_dev(div, p0);
    			append_dev(div, t3);
    			append_dev(div, input0);
    			set_input_value(input0, /*imgUrl*/ ctx[10]);
    			append_dev(div, t4);
    			append_dev(div, p1);
    			append_dev(div, t6);
    			append_dev(div, table);
    			append_dev(table, tr0);
    			append_dev(tr0, td0);
    			append_dev(tr0, t8);
    			append_dev(tr0, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*data*/ ctx[11].test_ID);
    			append_dev(table, t9);
    			append_dev(table, tr1);
    			append_dev(tr1, td2);
    			append_dev(tr1, t11);
    			append_dev(tr1, td3);
    			append_dev(td3, input2);
    			set_input_value(input2, /*data*/ ctx[11].dept_code);
    			append_dev(table, t12);
    			append_dev(table, tr2);
    			append_dev(tr2, td4);
    			append_dev(tr2, t14);
    			append_dev(tr2, td5);
    			append_dev(td5, input3);
    			set_input_value(input3, /*data*/ ctx[11].test_code);
    			append_dev(table, t15);
    			append_dev(table, tr3);
    			append_dev(tr3, td6);
    			append_dev(tr3, t17);
    			append_dev(tr3, td7);
    			append_dev(td7, input4);
    			set_input_value(input4, /*data*/ ctx[11].steps);
    			append_dev(div, t18);
    			append_dev(div, button0);
    			append_dev(div, t20);
    			append_dev(div, button1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[49]),
    					listen_dev(input0, "keypress", /*onKeyPress*/ ctx[15], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[50]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[51]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[52]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[53]),
    					listen_dev(button0, "click", /*click_handler_7*/ ctx[54], false, false, false),
    					listen_dev(button1, "click", /*click_handler_8*/ ctx[55], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*imgUrl*/ 1024 && input0.value !== /*imgUrl*/ ctx[10]) {
    				set_input_value(input0, /*imgUrl*/ ctx[10]);
    			}

    			if (dirty[0] & /*data*/ 2048 && input1.value !== /*data*/ ctx[11].test_ID) {
    				set_input_value(input1, /*data*/ ctx[11].test_ID);
    			}

    			if (dirty[0] & /*data*/ 2048 && input2.value !== /*data*/ ctx[11].dept_code) {
    				set_input_value(input2, /*data*/ ctx[11].dept_code);
    			}

    			if (dirty[0] & /*data*/ 2048 && input3.value !== /*data*/ ctx[11].test_code) {
    				set_input_value(input3, /*data*/ ctx[11].test_code);
    			}

    			if (dirty[0] & /*data*/ 2048 && input4.value !== /*data*/ ctx[11].steps) {
    				set_input_value(input4, /*data*/ ctx[11].steps);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!nav_transition) nav_transition = create_bidirectional_transition(nav, fly, { x: 500, opacity: 1 }, true);
    				nav_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!nav_transition) nav_transition = create_bidirectional_transition(nav, fly, { x: 500, opacity: 1 }, false);
    			nav_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching && nav_transition) nav_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(544:0) {#if mode == false}",
    		ctx
    	});

    	return block;
    }

    // (580:0) {#if mode == "edit"}
    function create_if_block_1(ctx) {
    	let nav;
    	let br0;
    	let t0;
    	let br1;
    	let br2;
    	let t1;
    	let div;
    	let p;
    	let t3;
    	let table;
    	let tr0;
    	let td0;
    	let t5;
    	let td1;
    	let input0;
    	let t6;
    	let tr1;
    	let td2;
    	let t8;
    	let td3;
    	let input1;
    	let t9;
    	let tr2;
    	let td4;
    	let t11;
    	let td5;
    	let input2;
    	let t12;
    	let tr3;
    	let td6;
    	let t14;
    	let td7;
    	let input3;
    	let t15;
    	let tr4;
    	let td8;
    	let t17;
    	let td9;
    	let input4;
    	let t18;
    	let button0;
    	let t20;
    	let button1;
    	let t22;
    	let nav_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*buttons*/ ctx[3].length > 1 && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			br0 = element("br");
    			t0 = space();
    			br1 = element("br");
    			br2 = element("br");
    			t1 = space();
    			div = element("div");
    			p = element("p");
    			p.textContent = "輸入條件";
    			t3 = space();
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "img_url";
    			t5 = space();
    			td1 = element("td");
    			input0 = element("input");
    			t6 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			td2.textContent = "test_ID";
    			t8 = space();
    			td3 = element("td");
    			input1 = element("input");
    			t9 = space();
    			tr2 = element("tr");
    			td4 = element("td");
    			td4.textContent = "dept_code";
    			t11 = space();
    			td5 = element("td");
    			input2 = element("input");
    			t12 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			td6.textContent = "test_code";
    			t14 = space();
    			td7 = element("td");
    			input3 = element("input");
    			t15 = space();
    			tr4 = element("tr");
    			td8 = element("td");
    			td8.textContent = "steps";
    			t17 = space();
    			td9 = element("td");
    			input4 = element("input");
    			t18 = space();
    			button0 = element("button");
    			button0.textContent = "取消";
    			t20 = space();
    			button1 = element("button");
    			button1.textContent = "確定";
    			t22 = space();
    			if (if_block) if_block.c();
    			add_location(br0, file, 581, 4, 15491);
    			add_location(br1, file, 582, 4, 15502);
    			add_location(br2, file, 582, 10, 15508);
    			add_location(p, file, 584, 6, 15571);
    			add_location(td0, file, 587, 10, 15620);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-em4l87");
    			add_location(input0, file, 588, 14, 15651);
    			add_location(td1, file, 588, 10, 15647);
    			add_location(tr0, file, 586, 8, 15605);
    			add_location(td2, file, 591, 10, 15735);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "svelte-em4l87");
    			add_location(input1, file, 592, 14, 15766);
    			add_location(td3, file, 592, 10, 15762);
    			add_location(tr1, file, 590, 8, 15720);
    			add_location(td4, file, 595, 10, 15856);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "svelte-em4l87");
    			add_location(input2, file, 596, 14, 15889);
    			add_location(td5, file, 596, 10, 15885);
    			add_location(tr2, file, 594, 8, 15841);
    			add_location(td6, file, 599, 10, 15981);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "class", "svelte-em4l87");
    			add_location(input3, file, 600, 14, 16014);
    			add_location(td7, file, 600, 10, 16010);
    			add_location(tr3, file, 598, 8, 15966);
    			add_location(td8, file, 603, 10, 16106);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", "svelte-em4l87");
    			add_location(input4, file, 604, 14, 16135);
    			add_location(td9, file, 604, 10, 16131);
    			add_location(tr4, file, 602, 8, 16091);
    			add_location(table, file, 585, 6, 15589);
    			attr_dev(button0, "class", "svelte-em4l87");
    			add_location(button0, file, 607, 6, 16221);
    			attr_dev(button1, "class", "svelte-em4l87");
    			add_location(button1, file, 608, 6, 16282);
    			attr_dev(div, "class", "edit svelte-em4l87");
    			set_style(div, "text-align", "center");
    			add_location(div, file, 583, 4, 15519);
    			attr_dev(nav, "class", "sidebar svelte-em4l87");
    			add_location(nav, file, 580, 2, 15425);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, br0);
    			append_dev(nav, t0);
    			append_dev(nav, br1);
    			append_dev(nav, br2);
    			append_dev(nav, t1);
    			append_dev(nav, div);
    			append_dev(div, p);
    			append_dev(div, t3);
    			append_dev(div, table);
    			append_dev(table, tr0);
    			append_dev(tr0, td0);
    			append_dev(tr0, t5);
    			append_dev(tr0, td1);
    			append_dev(td1, input0);
    			set_input_value(input0, /*imgUrl*/ ctx[10]);
    			append_dev(table, t6);
    			append_dev(table, tr1);
    			append_dev(tr1, td2);
    			append_dev(tr1, t8);
    			append_dev(tr1, td3);
    			append_dev(td3, input1);
    			set_input_value(input1, /*data*/ ctx[11].test_ID);
    			append_dev(table, t9);
    			append_dev(table, tr2);
    			append_dev(tr2, td4);
    			append_dev(tr2, t11);
    			append_dev(tr2, td5);
    			append_dev(td5, input2);
    			set_input_value(input2, /*data*/ ctx[11].dept_code);
    			append_dev(table, t12);
    			append_dev(table, tr3);
    			append_dev(tr3, td6);
    			append_dev(tr3, t14);
    			append_dev(tr3, td7);
    			append_dev(td7, input3);
    			set_input_value(input3, /*data*/ ctx[11].test_code);
    			append_dev(table, t15);
    			append_dev(table, tr4);
    			append_dev(tr4, td8);
    			append_dev(tr4, t17);
    			append_dev(tr4, td9);
    			append_dev(td9, input4);
    			set_input_value(input4, /*data*/ ctx[11].steps);
    			append_dev(div, t18);
    			append_dev(div, button0);
    			append_dev(div, t20);
    			append_dev(div, button1);
    			append_dev(nav, t22);
    			if (if_block) if_block.m(nav, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[56]),
    					listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[57]),
    					listen_dev(input2, "input", /*input2_input_handler_1*/ ctx[58]),
    					listen_dev(input3, "input", /*input3_input_handler_1*/ ctx[59]),
    					listen_dev(input4, "input", /*input4_input_handler_1*/ ctx[60]),
    					listen_dev(button0, "click", /*click_handler_9*/ ctx[61], false, false, false),
    					listen_dev(button1, "click", /*click_handler_10*/ ctx[62], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*imgUrl*/ 1024 && input0.value !== /*imgUrl*/ ctx[10]) {
    				set_input_value(input0, /*imgUrl*/ ctx[10]);
    			}

    			if (dirty[0] & /*data*/ 2048 && input1.value !== /*data*/ ctx[11].test_ID) {
    				set_input_value(input1, /*data*/ ctx[11].test_ID);
    			}

    			if (dirty[0] & /*data*/ 2048 && input2.value !== /*data*/ ctx[11].dept_code) {
    				set_input_value(input2, /*data*/ ctx[11].dept_code);
    			}

    			if (dirty[0] & /*data*/ 2048 && input3.value !== /*data*/ ctx[11].test_code) {
    				set_input_value(input3, /*data*/ ctx[11].test_code);
    			}

    			if (dirty[0] & /*data*/ 2048 && input4.value !== /*data*/ ctx[11].steps) {
    				set_input_value(input4, /*data*/ ctx[11].steps);
    			}

    			if (/*buttons*/ ctx[3].length > 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(nav, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!nav_transition) nav_transition = create_bidirectional_transition(nav, fly, { x: 500, opacity: 1 }, true);
    				nav_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!nav_transition) nav_transition = create_bidirectional_transition(nav, fly, { x: 500, opacity: 1 }, false);
    			nav_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (if_block) if_block.d();
    			if (detaching && nav_transition) nav_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(580:0) {#if mode == \\\"edit\\\"}",
    		ctx
    	});

    	return block;
    }

    // (611:4) {#if buttons.length > 1}
    function create_if_block_2(ctx) {
    	let div1;
    	let div0;
    	let each_value_1 = /*buttons*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "scrollbox-inner");
    			add_location(div0, file, 612, 8, 16457);
    			attr_dev(div1, "class", "scrollbox svelte-em4l87");
    			set_style(div1, "overflow", "auto");
    			set_style(div1, "height", "200px");
    			set_style(div1, "width", "80%");
    			add_location(div1, file, 611, 6, 16379);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*buttons*/ 8 | dirty[1] & /*SearchFetch*/ 1) {
    				each_value_1 = /*buttons*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(611:4) {#if buttons.length > 1}",
    		ctx
    	});

    	return block;
    }

    // (614:10) {#each buttons as button}
    function create_each_block_1(ctx) {
    	let button;
    	let t0;
    	let t1_value = /*button*/ ctx[87].test_ID + "";
    	let t1;
    	let t2;
    	let t3_value = /*button*/ ctx[87].test_code + "";
    	let t3;
    	let t4;
    	let t5_value = /*button*/ ctx[87].steps + "";
    	let t5;
    	let mounted;
    	let dispose;

    	function click_handler_11() {
    		return /*click_handler_11*/ ctx[63](/*button*/ ctx[87]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text("ID:");
    			t1 = text(t1_value);
    			t2 = text("_CODE:");
    			t3 = text(t3_value);
    			t4 = text("_步驟:");
    			t5 = text(t5_value);
    			attr_dev(button, "class", "svelte-em4l87");
    			add_location(button, file, 614, 12, 16535);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);
    			append_dev(button, t2);
    			append_dev(button, t3);
    			append_dev(button, t4);
    			append_dev(button, t5);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_11, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*buttons*/ 8 && t1_value !== (t1_value = /*button*/ ctx[87].test_ID + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*buttons*/ 8 && t3_value !== (t3_value = /*button*/ ctx[87].test_code + "")) set_data_dev(t3, t3_value);
    			if (dirty[0] & /*buttons*/ 8 && t5_value !== (t5_value = /*button*/ ctx[87].steps + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(614:10) {#each buttons as button}",
    		ctx
    	});

    	return block;
    }

    // (626:0) {#if status == "TextBox"}
    function create_if_block(ctx) {
    	let nav;
    	let h2;
    	let t0;
    	let t1;
    	let t2;
    	let h1;
    	let t4;
    	let p0;
    	let t5;
    	let div;
    	let p1;
    	let t6;
    	let t7_value = /*box_selected*/ ctx[14].width + "";
    	let t7;
    	let t8;
    	let t9;
    	let input0;
    	let input0_value_value;
    	let t10;
    	let br;
    	let t11;
    	let p2;
    	let t12;
    	let t13_value = /*box_selected*/ ctx[14].height + "";
    	let t13;
    	let t14;
    	let t15;
    	let input1;
    	let input1_value_value;
    	let t16;
    	let table;
    	let tr;
    	let td0;
    	let h3;
    	let t18;
    	let td1;
    	let input2;
    	let t19;
    	let button0;
    	let t21;
    	let button1;
    	let nav_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*objects*/ ctx[23];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			h2 = element("h2");
    			t0 = text("Drag status: ");
    			t1 = text(/*statustext*/ ctx[12]);
    			t2 = space();
    			h1 = element("h1");
    			h1.textContent = "Drop Zone";
    			t4 = space();
    			p0 = element("p");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			div = element("div");
    			p1 = element("p");
    			t6 = text("width:");
    			t7 = text(t7_value);
    			t8 = text("px");
    			t9 = space();
    			input0 = element("input");
    			t10 = space();
    			br = element("br");
    			t11 = space();
    			p2 = element("p");
    			t12 = text("height:");
    			t13 = text(t13_value);
    			t14 = text("px");
    			t15 = space();
    			input1 = element("input");
    			t16 = space();
    			table = element("table");
    			tr = element("tr");
    			td0 = element("td");
    			h3 = element("h3");
    			h3.textContent = "是否於此驗證";
    			t18 = space();
    			td1 = element("td");
    			input2 = element("input");
    			t19 = space();
    			button0 = element("button");
    			button0.textContent = "新增一個文字方塊";
    			t21 = space();
    			button1 = element("button");
    			button1.textContent = "移除最近一個文字方塊";
    			attr_dev(h2, "id", "app_status");
    			add_location(h2, file, 627, 4, 16937);
    			add_location(h1, file, 628, 4, 16992);
    			add_location(p0, file, 629, 4, 17015);
    			add_location(p1, file, 641, 6, 17336);
    			attr_dev(input0, "type", "range");
    			input0.value = input0_value_value = /*box_selected*/ ctx[14].width;
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "300");
    			attr_dev(input0, "class", "svelte-em4l87");
    			add_location(input0, file, 642, 6, 17378);
    			add_location(br, file, 649, 6, 17522);
    			add_location(p2, file, 650, 6, 17535);
    			attr_dev(input1, "type", "range");
    			input1.value = input1_value_value = /*box_selected*/ ctx[14].height;
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "100");
    			attr_dev(input1, "class", "svelte-em4l87");
    			add_location(input1, file, 651, 6, 17579);
    			add_location(h3, file, 661, 12, 17773);
    			add_location(td0, file, 660, 10, 17756);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "class", "svelte-em4l87");
    			add_location(input2, file, 664, 12, 17832);
    			add_location(td1, file, 663, 10, 17815);
    			add_location(tr, file, 659, 8, 17741);
    			add_location(table, file, 658, 6, 17725);
    			attr_dev(button0, "class", "svelte-em4l87");
    			add_location(button0, file, 668, 6, 17945);
    			attr_dev(button1, "class", "svelte-em4l87");
    			add_location(button1, file, 669, 6, 18004);
    			attr_dev(div, "class", "Btn svelte-em4l87");
    			add_location(div, file, 640, 4, 17312);
    			attr_dev(nav, "class", "text-sidebar svelte-em4l87");
    			add_location(nav, file, 626, 2, 16866);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(nav, t2);
    			append_dev(nav, h1);
    			append_dev(nav, t4);
    			append_dev(nav, p0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(p0, null);
    			}

    			append_dev(nav, t5);
    			append_dev(nav, div);
    			append_dev(div, p1);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    			append_dev(div, t9);
    			append_dev(div, input0);
    			append_dev(div, t10);
    			append_dev(div, br);
    			append_dev(div, t11);
    			append_dev(div, p2);
    			append_dev(p2, t12);
    			append_dev(p2, t13);
    			append_dev(p2, t14);
    			append_dev(div, t15);
    			append_dev(div, input1);
    			append_dev(div, t16);
    			append_dev(div, table);
    			append_dev(table, tr);
    			append_dev(tr, td0);
    			append_dev(td0, h3);
    			append_dev(tr, t18);
    			append_dev(tr, td1);
    			append_dev(td1, input2);
    			input2.checked = /*box_selected*/ ctx[14].checked;
    			append_dev(div, t19);
    			append_dev(div, button0);
    			append_dev(div, t21);
    			append_dev(div, button1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*adjust_width*/ ctx[29], false, false, false),
    					listen_dev(input1, "input", /*adjust_height*/ ctx[30], false, false, false),
    					listen_dev(input2, "change", /*input2_change_handler_1*/ ctx[64]),
    					listen_dev(button0, "click", /*click_handler_12*/ ctx[65], false, false, false),
    					listen_dev(button1, "click", /*click_handler_13*/ ctx[66], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*statustext*/ 4096) set_data_dev(t1, /*statustext*/ ctx[12]);

    			if (dirty[0] & /*objects, box_selected*/ 8404992) {
    				each_value = /*objects*/ ctx[23];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(p0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if ((!current || dirty[0] & /*box_selected*/ 16384) && t7_value !== (t7_value = /*box_selected*/ ctx[14].width + "")) set_data_dev(t7, t7_value);

    			if (!current || dirty[0] & /*box_selected*/ 16384 && input0_value_value !== (input0_value_value = /*box_selected*/ ctx[14].width)) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if ((!current || dirty[0] & /*box_selected*/ 16384) && t13_value !== (t13_value = /*box_selected*/ ctx[14].height + "")) set_data_dev(t13, t13_value);

    			if (!current || dirty[0] & /*box_selected*/ 16384 && input1_value_value !== (input1_value_value = /*box_selected*/ ctx[14].height)) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (dirty[0] & /*box_selected*/ 16384) {
    				input2.checked = /*box_selected*/ ctx[14].checked;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!nav_transition) nav_transition = create_bidirectional_transition(nav, fly, { x: 500, opacity: 1 }, true);
    				nav_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!nav_transition) nav_transition = create_bidirectional_transition(nav, fly, { x: 500, opacity: 1 }, false);
    			nav_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			if (detaching && nav_transition) nav_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(626:0) {#if status == \\\"TextBox\\\"}",
    		ctx
    	});

    	return block;
    }

    // (631:6) {#each objects as obj}
    function create_each_block(ctx) {
    	let div;
    	let input;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			attr_dev(input, "type", "text");
    			input.disabled = "true";
    			set_style(input, "width", /*box_selected*/ ctx[14].width + "px");
    			set_style(input, "height", /*box_selected*/ ctx[14].height + "px");
    			attr_dev(input, "class", "svelte-em4l87");
    			add_location(input, file, 632, 10, 17117);
    			attr_dev(div, "id", /*obj*/ ctx[84].id);
    			attr_dev(div, "class", "objects svelte-em4l87");
    			attr_dev(div, "draggable", "true");
    			add_location(div, file, 631, 8, 17056);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*box_selected*/ 16384) {
    				set_style(input, "width", /*box_selected*/ ctx[14].width + "px");
    			}

    			if (dirty[0] & /*box_selected*/ 16384) {
    				set_style(input, "height", /*box_selected*/ ctx[14].height + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(631:6) {#each objects as obj}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t4;
    	let button2_disabled_value;
    	let t5;
    	let button3;
    	let t6;
    	let button3_disabled_value;
    	let t7;
    	let button4;
    	let t9;
    	let span;
    	let svg;
    	let image;
    	let t10;
    	let t11;
    	let sveltetoast;
    	let t12;
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let contextmenu;
    	let updating_status;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*circles*/ ctx[2];
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*dropped*/ ctx[13];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	sveltetoast = new SvelteToast({
    			props: {
    				options: { reversed: true, intro: { y: 192 } }
    			},
    			$$inline: true
    		});

    	let if_block0 = (/*adjusting*/ ctx[6] || /*_export*/ ctx[7]) && create_if_block_4(ctx);
    	let if_block1 = /*mode*/ ctx[5] == false && create_if_block_3(ctx);
    	let if_block2 = /*mode*/ ctx[5] == "edit" && create_if_block_1(ctx);
    	let if_block3 = /*status*/ ctx[8] == "TextBox" && create_if_block(ctx);

    	function contextmenu_status_binding(value) {
    		/*contextmenu_status_binding*/ ctx[67](value);
    	}

    	let contextmenu_props = {};

    	if (/*status*/ ctx[8] !== void 0) {
    		contextmenu_props.status = /*status*/ ctx[8];
    	}

    	contextmenu = new ContextMenu({ props: contextmenu_props, $$inline: true });
    	binding_callbacks.push(() => bind(contextmenu, 'status', contextmenu_status_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "import";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "edit";
    			t3 = space();
    			button2 = element("button");
    			t4 = text("undo");
    			t5 = space();
    			button3 = element("button");
    			t6 = text("redo");
    			t7 = space();
    			button4 = element("button");
    			button4.textContent = "publish";
    			t9 = space();
    			span = element("span");
    			svg = svg_element("svg");
    			image = svg_element("image");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t10 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t11 = space();
    			create_component(sveltetoast.$$.fragment);
    			t12 = space();
    			if (if_block0) if_block0.c();
    			t13 = space();
    			if (if_block1) if_block1.c();
    			t14 = space();
    			if (if_block2) if_block2.c();
    			t15 = space();
    			if (if_block3) if_block3.c();
    			t16 = space();
    			create_component(contextmenu.$$.fragment);
    			attr_dev(button0, "class", "svelte-em4l87");
    			add_location(button0, file, 388, 2, 9597);
    			attr_dev(button1, "class", "svelte-em4l87");
    			add_location(button1, file, 389, 2, 9652);
    			button2.disabled = button2_disabled_value = /*i*/ ctx[0] === 0;
    			attr_dev(button2, "class", "svelte-em4l87");
    			add_location(button2, file, 390, 2, 9703);
    			button3.disabled = button3_disabled_value = /*i*/ ctx[0] === /*undoStack*/ ctx[1].length - 1 || /*i*/ ctx[0] < 0;
    			attr_dev(button3, "class", "svelte-em4l87");
    			add_location(button3, file, 391, 2, 9774);
    			attr_dev(button4, "class", "svelte-em4l87");
    			add_location(button4, file, 395, 2, 9884);
    			attr_dev(div, "class", "controls svelte-em4l87");
    			add_location(div, file, 387, 0, 9572);
    			attr_dev(image, "id", "image");
    			attr_dev(image, "href", /*imgUrl*/ ctx[10]);
    			attr_dev(image, "width", "1800");
    			add_location(image, file, 403, 4, 10261);
    			attr_dev(svg, "id", "wip");
    			attr_dev(svg, "class", "svelte-em4l87");
    			add_location(svg, file, 402, 2, 10219);
    			set_style(span, "position", "relative");
    			set_style(span, "top", "40px");
    			add_location(span, file, 400, 0, 10085);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			append_dev(div, t3);
    			append_dev(div, button2);
    			append_dev(button2, t4);
    			append_dev(div, t5);
    			append_dev(div, button3);
    			append_dev(button3, t6);
    			append_dev(div, t7);
    			append_dev(div, button4);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, svg);
    			append_dev(svg, image);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(svg, null);
    			}

    			insert_dev(target, t10, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t11, anchor);
    			mount_component(sveltetoast, target, anchor);
    			insert_dev(target, t12, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t13, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t14, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t15, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t16, anchor);
    			mount_component(contextmenu, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "mouseup", /*onMouseUp*/ ctx[26], false, false, false),
    					listen_dev(window, "mousemove", /*onMouseMove*/ ctx[24], false, false, false),
    					listen_dev(button0, "click", /*click_handler*/ ctx[32], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[33], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[34], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[35], false, false, false),
    					listen_dev(button4, "click", /*click_handler_4*/ ctx[36], false, false, false),
    					listen_dev(svg, "click", /*handleClick*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*i*/ 1 && button2_disabled_value !== (button2_disabled_value = /*i*/ ctx[0] === 0)) {
    				prop_dev(button2, "disabled", button2_disabled_value);
    			}

    			if (!current || dirty[0] & /*i, undoStack*/ 3 && button3_disabled_value !== (button3_disabled_value = /*i*/ ctx[0] === /*undoStack*/ ctx[1].length - 1 || /*i*/ ctx[0] < 0)) {
    				prop_dev(button3, "disabled", button3_disabled_value);
    			}

    			if (!current || dirty[0] & /*imgUrl*/ 1024) {
    				attr_dev(image, "href", /*imgUrl*/ ctx[10]);
    			}

    			if (dirty[0] & /*circles, select, adjusting, selected, _export*/ 262356) {
    				each_value_3 = /*circles*/ ctx[2];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(svg, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_3.length;
    			}

    			if (dirty[0] & /*dropped, onMouseDown*/ 33562624) {
    				each_value_2 = /*dropped*/ ctx[13];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t11.parentNode, t11);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*adjusting*/ ctx[6] || /*_export*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*adjusting, _export*/ 192) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t13.parentNode, t13);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*mode*/ ctx[5] == false) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*mode*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t14.parentNode, t14);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*mode*/ ctx[5] == "edit") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*mode*/ 32) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t15.parentNode, t15);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*status*/ ctx[8] == "TextBox") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*status*/ 256) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t16.parentNode, t16);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			const contextmenu_changes = {};

    			if (!updating_status && dirty[0] & /*status*/ 256) {
    				updating_status = true;
    				contextmenu_changes.status = /*status*/ ctx[8];
    				add_flush_callback(() => updating_status = false);
    			}

    			contextmenu.$set(contextmenu_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(sveltetoast.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(contextmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(sveltetoast.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(contextmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(span);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t10);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t11);
    			destroy_component(sveltetoast, detaching);
    			if (detaching) detach_dev(t12);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t13);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t14);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t15);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t16);
    			destroy_component(contextmenu, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function clone(circles) {
    	return circles.map(({ cx, cy, r, ToNext, ToPrevious, Muti, Check, value, step }) => ({
    		cx,
    		cy,
    		r,
    		ToNext,
    		ToPrevious,
    		Muti,
    		Check,
    		value,
    		step
    	}));
    }

    function setEvent() {
    	
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let i = 0;
    	let undoStack = [[]];
    	let circles = [], buttons = [];
    	let selected;
    	let mode = "create";

    	let adjusting = false,
    		adjusted = false,
    		_export = false,
    		status = false,
    		assign = false;

    	let _svgcode = "",
    		_circlescode = "",
    		_circlesstr = "",
    		_boxesstr = "",
    		steps = "",
    		_imgcode = "";

    	let imgUrl = "http://T01014110/EB/CPC/WKF_OptionalFields/ALL/OTS/DEMO/default.png";

    	let data = {
    		mode,
    		test_ID: "",
    		dept_code: "",
    		test_code: "",
    		svg_string: _circlescode,
    		img_string: _imgcode,
    		svg_tag: _svgcode,
    		steps,
    		circles: {},
    		boxes: {}
    	};

    	//#endregion
    	//#region Event function
    	const onKeyPress = e => {
    		if (e.charCode === 13) importIMG(1);
    	};

    	//點擊後設置物件
    	function handleClick(event) {
    		if (adjusting) {
    			$$invalidate(6, adjusting = false);

    			// if circle was adjusted,
    			// push to the stack
    			if (adjusted) push();

    			return;
    		}

    		if (mode == "edit") {
    			$$invalidate(5, mode = "update");
    			return;
    		}

    		if (status != false) {
    			$$invalidate(8, status = false);
    			return;
    		}

    		const circle = {
    			cx: event.offsetX,
    			cy: event.offsetY,
    			r: 50,
    			value: "",
    			ToNext: false,
    			ToPrevious: false,
    			Muti: false,
    			Check: false,
    			step: 0
    		};

    		$$invalidate(2, circles = circles.concat(circle));
    		$$invalidate(4, selected = circle);
    		push();
    	}

    	//調整物件大小
    	function adjust(event) {
    		$$invalidate(4, selected.r = +event.target.value, selected);
    		$$invalidate(2, circles);
    		adjusted = true;
    	}

    	//物件選定
    	function select(circle, event) {
    		if (!adjusting) {
    			$$invalidate(9, assign = false);
    			event.stopPropagation();
    			$$invalidate(4, selected = circle);
    		}
    	}

    	function push() {
    		const newUndoStack = undoStack.slice(0, $$invalidate(0, ++i));
    		newUndoStack.push(clone(circles));
    		$$invalidate(1, undoStack = newUndoStack);
    	}

    	function travel(d) {
    		$$invalidate(2, circles = clone(undoStack[$$invalidate(0, i += d)]));
    		$$invalidate(6, adjusting = false);
    	}

    	function writeSvg() {
    		$$invalidate(7, _export = 1);
    		$$invalidate(8, status = false);

    		setTimeout(
    			() => {
    				let img_content = document.getElementById("image");
    				_imgcode = img_content.outerHTML;
    				let svg_content = document.getElementById("wip");
    				let circlesTag = document.getElementsByTagName("a");

    				// let circlesTag = document.getElementsByTagName("circle");
    				//SVG字串串接
    				for (var n = 0; n < circlesTag.length; n++) {
    					_circlescode += circlesTag[n].outerHTML;
    				}

    				_circlesstr = JSON.stringify(circles);

    				//TextBox物件字串
    				_boxesstr = JSON.stringify(dropped);

    				localStorage.setItem("temp", svg_content.innerHTML);
    				svg_content.innerHTML = "";
    				_svgcode = svg_content.outerHTML;
    				CreateFetch(_svgcode, _circlescode, _circlesstr, _boxesstr);
    				svg_content.innerHTML = localStorage.getItem("temp");
    				localStorage.removeItem("temp");
    			},
    			100
    		);
    	}

    	function importIMG(val) {
    		if (val == 1) $$invalidate(5, mode = "create"); else if (val == 0) $$invalidate(5, mode = "create"); else $$invalidate(5, mode = false);
    	}

    	function editsvg() {
    		$$invalidate(5, mode = "edit");
    		$$invalidate(7, _export = false);
    	}

    	//#endregion
    	//#region TextBox class settings
    	let statustext = "waiting drop...";

    	let obj_id = 0;

    	const object = {
    		id: 0,
    		top: 100,
    		left: 100,
    		width: 100,
    		height: 2,
    		value: "",
    		stabled: false,
    		checked: false
    	};

    	let objects = [object];
    	let dropped = [];
    	let box_selected;
    	let dropped_in = "";
    	box_selected = object;
    	let moving = false;
    	let left = 100, top = 100;

    	//#endregion
    	//#region TextBox Event functions
    	function onMouseMove(e) {
    		if (moving) {
    			var id = e.target.id;

    			if (id != "image") {
    				var temp = JSON.parse(JSON.stringify(dropped[id - 1]));
    				left = temp.left;
    				top = temp.top;
    				left += e.movementX;
    				top += e.movementY;
    				temp.left = left;
    				temp.top = top;
    				$$invalidate(13, dropped[id - 1] = temp, dropped);
    				console.log(dropped);
    			}
    		}
    	}

    	function onMouseDown() {
    		if (e.target.id != "image") moving = true;
    	}

    	function onMouseUp() {
    		moving = false;
    	}

    	function Remove() {
    		console.log(dropped[0].id);

    		if (obj_id != 0) {
    			$$invalidate(13, dropped = dropped.slice(0, dropped.length - 1));
    			obj_id = obj_id - 1;
    			$$invalidate(12, statustext = "You have " + obj_id + " in area");
    		}
    	}

    	function AddItem() {
    		left = 100;
    		top = 100;
    		var temp = JSON.parse(JSON.stringify(object));
    		temp.left = left;
    		temp.top = top;
    		obj_id = obj_id + 1;
    		$$invalidate(12, statustext = "You add " + obj_id + " into area");
    		temp.id = obj_id;
    		$$invalidate(13, dropped = dropped.concat(temp));
    		console.log(dropped);
    	}

    	function adjust_width(event) {
    		$$invalidate(14, box_selected.width = +event.target.value, box_selected);
    	} // selected.height = +event.target.value;
    	// objects = objects;

    	function adjust_height(event) {
    		$$invalidate(14, box_selected.height = +event.target.value, box_selected);
    	} // selected.height = +event.target.value;
    	// objects = objects;

    	//#endregion
    	//#region Fetch data
    	//輸出資料
    	function CreateFetch(_svgcode, _circlescode, _circlesstr, _boxesstr) {
    		$$invalidate(11, data = {
    			mode,
    			test_ID: data.test_ID,
    			test_code: data.test_code,
    			dept_code: data.dept_code,
    			svg_string: _circlescode,
    			img_string: imgUrl,
    			svg_tag: _svgcode,
    			steps: data.steps,
    			circles: _circlesstr,
    			boxes: _boxesstr
    		});

    		if (data.img_string != "") {
    			fetch("http://172.16.13.174:18472/OTS", {
    				method: "POST",
    				body: JSON.stringify(data),
    				headers: {
    					"Content-Type": "application/json",
    					Authorization: ""
    				},
    				mode: "cors",
    				cache: "default"
    			}).then(response => {
    				
    			}).catch(error => {
    				console.log(`Error: ${error}`); //console.log(response);
    			});
    		}
    	}

    	//請求資料
    	function SearchFetch(info) {
    		if (info) $$invalidate(11, data = info);
    		$$invalidate(11, data.mode = "search", data);

    		if (data.mode == "search") {
    			fetch("http://172.16.13.174:18472/OTS-json", {
    				method: "POST",
    				body: JSON.stringify(data),
    				headers: {
    					"Content-Type": "application/json",
    					Authorization: ""
    				},
    				mode: "cors",
    				cache: "default"
    			}).then(response => response.json()).then(data => {
    				if (data.length != 1) {
    					for (var k = 0; k < data.length; k++) {
    						$$invalidate(3, buttons[k] = data[k], buttons); //console.log(response.json())
    					}

    					buttons.sort(function (a, b) {
    						return a.steps - b.steps;
    					});

    					$$invalidate(5, mode = "edit");
    				} else {
    					const newdata = data[0];

    					data = {
    						test_ID: newdata.test_ID,
    						dept_code: newdata.dept_code,
    						test_code: newdata.test_code,
    						svg_string: newdata.svg_string,
    						img_string: newdata.img_string,
    						svg_tag: newdata.svg_tag,
    						steps: newdata.steps,
    						circles: newdata.circles,
    						boxes: newdata.boxes
    					};

    					Restruct(data);
    				}
    			}).catch(error => {
    				console.log(`Error: ${error}`);
    			});
    		}
    	}

    	//導入已設計完成場景
    	function Restruct(data) {
    		toast.push("Loading...", {
    			theme: {
    				'--toastBackyround': 'rgba(0, 201, 87, 0.95)'
    			}
    		});

    		//各項參數歸零
    		$$invalidate(2, circles = []);

    		$$invalidate(13, dropped = []);
    		$$invalidate(0, i = 0);
    		obj_id = 0;

    		//圓形物件設定
    		var temp = JSON.parse(data.circles);

    		if (undoStack.length <= 0) {
    			for (var n = undoStack.length - 1; n >= 1; n--) {
    				undostack = undoStack.slice(0, n);
    			}
    		}

    		for (var k = 0; k <= temp.length - 1; k++) {
    			var obj = temp[k];

    			const circle = {
    				cx: obj["cx"],
    				cy: obj["cy"],
    				r: obj["r"],
    				value: obj["value"],
    				ToNext: obj["ToNext"],
    				ToPrevious: obj["ToPrevious"],
    				Muti: obj["Muti"],
    				Check: obj["Check"],
    				step: obj["step"]
    			};

    			var copy = JSON.parse(JSON.stringify(circle));
    			$$invalidate(2, circles = circles.concat(copy));
    			$$invalidate(4, selected = circle);
    			push();
    		}

    		//TextBox物件設定
    		if (data.boxes != null) {
    			var temp = JSON.parse(data.boxes);

    			for (var k = 0; k <= temp.length - 1; k++) {
    				var obj = temp[k];

    				const newbox = {
    					id: obj["id"],
    					top: obj["top"],
    					left: obj["left"],
    					width: obj["width"],
    					height: obj["height"],
    					value: obj["value"],
    					stabled: true,
    					checked: obj["checked"]
    				};

    				var copy = JSON.parse(JSON.stringify(newbox));
    				$$invalidate(13, dropped = dropped.concat(copy));
    				obj_id = obj_id + 1;
    				$$invalidate(12, statustext = "You dropped " + obj_id + " into area");
    			}
    		}

    		//底圖設定
    		let image = document.querySelector("#image");

    		image.setAttribute("href", data.img_string);
    		$$invalidate(10, imgUrl = data.img_string);
    		let svg = document.querySelector("svg");

    		//調整圖層排序
    		for (var k = 0; k < svg.childNodes.length - 1; k++) {
    			svg.appendChild(svg.firstChild);
    		}
    	} //#endregion

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => importIMG();
    	const click_handler_1 = () => editsvg();
    	const click_handler_2 = () => travel(-1);
    	const click_handler_3 = () => travel(+1);
    	const click_handler_4 = () => writeSvg();
    	const click_handler_5 = (circle, event) => select(circle, event);

    	const contextmenu_handler = circle => {
    		$$invalidate(6, adjusting = !adjusting);
    		if (adjusting) $$invalidate(4, selected = circle);
    	};

    	const click_handler_6 = (circle, event) => select(circle, event);

    	const contextmenu_handler_1 = circle => {
    		$$invalidate(6, adjusting = !adjusting);
    		if (adjusting) $$invalidate(4, selected = circle);
    	};

    	function input_input_handler(each_value_2, drop_index) {
    		each_value_2[drop_index].value = this.value;
    		$$invalidate(13, dropped);
    	}

    	function input_input_handler_1(each_value_2, drop_index) {
    		each_value_2[drop_index].value = this.value;
    		$$invalidate(13, dropped);
    	}

    	function textarea_input_handler() {
    		selected.value = this.value;
    		$$invalidate(4, selected);
    	}

    	function input1_change_handler() {
    		selected.ToPrevious = this.checked;
    		$$invalidate(4, selected);
    	}

    	function input2_change_handler() {
    		selected.ToNext = this.checked;
    		$$invalidate(4, selected);
    	}

    	function input3_change_handler() {
    		assign = this.checked;
    		$$invalidate(9, assign);
    	}

    	function input_input_handler_2() {
    		selected.step = to_number(this.value);
    		$$invalidate(4, selected);
    	}

    	function input4_change_handler() {
    		selected.Muti = this.checked;
    		$$invalidate(4, selected);
    	}

    	function input0_input_handler() {
    		imgUrl = this.value;
    		$$invalidate(10, imgUrl);
    	}

    	function input1_input_handler() {
    		data.test_ID = this.value;
    		$$invalidate(11, data);
    	}

    	function input2_input_handler() {
    		data.dept_code = this.value;
    		$$invalidate(11, data);
    	}

    	function input3_input_handler() {
    		data.test_code = this.value;
    		$$invalidate(11, data);
    	}

    	function input4_input_handler() {
    		data.steps = this.value;
    		$$invalidate(11, data);
    	}

    	const click_handler_7 = () => importIMG(0);
    	const click_handler_8 = () => importIMG(1);

    	function input0_input_handler_1() {
    		imgUrl = this.value;
    		$$invalidate(10, imgUrl);
    	}

    	function input1_input_handler_1() {
    		data.test_ID = this.value;
    		$$invalidate(11, data);
    	}

    	function input2_input_handler_1() {
    		data.dept_code = this.value;
    		$$invalidate(11, data);
    	}

    	function input3_input_handler_1() {
    		data.test_code = this.value;
    		$$invalidate(11, data);
    	}

    	function input4_input_handler_1() {
    		data.steps = this.value;
    		$$invalidate(11, data);
    	}

    	const click_handler_9 = () => $$invalidate(5, mode = "create");
    	const click_handler_10 = () => SearchFetch();
    	const click_handler_11 = button => SearchFetch(button);

    	function input2_change_handler_1() {
    		box_selected.checked = this.checked;
    		$$invalidate(14, box_selected);
    	}

    	const click_handler_12 = () => AddItem();
    	const click_handler_13 = () => Remove();

    	function contextmenu_status_binding(value) {
    		status = value;
    		$$invalidate(8, status);
    	}

    	$$self.$capture_state = () => ({
    		fly,
    		ContextMenu,
    		Draggable,
    		SvelteToast,
    		toast,
    		i,
    		undoStack,
    		circles,
    		buttons,
    		selected,
    		mode,
    		adjusting,
    		adjusted,
    		_export,
    		status,
    		assign,
    		_svgcode,
    		_circlescode,
    		_circlesstr,
    		_boxesstr,
    		steps,
    		_imgcode,
    		imgUrl,
    		data,
    		onKeyPress,
    		handleClick,
    		adjust,
    		select,
    		push,
    		travel,
    		clone,
    		writeSvg,
    		importIMG,
    		editsvg,
    		statustext,
    		obj_id,
    		object,
    		objects,
    		dropped,
    		box_selected,
    		dropped_in,
    		moving,
    		left,
    		top,
    		onMouseMove,
    		onMouseDown,
    		onMouseUp,
    		Remove,
    		AddItem,
    		adjust_width,
    		adjust_height,
    		CreateFetch,
    		SearchFetch,
    		Restruct,
    		setEvent
    	});

    	$$self.$inject_state = $$props => {
    		if ('i' in $$props) $$invalidate(0, i = $$props.i);
    		if ('undoStack' in $$props) $$invalidate(1, undoStack = $$props.undoStack);
    		if ('circles' in $$props) $$invalidate(2, circles = $$props.circles);
    		if ('buttons' in $$props) $$invalidate(3, buttons = $$props.buttons);
    		if ('selected' in $$props) $$invalidate(4, selected = $$props.selected);
    		if ('mode' in $$props) $$invalidate(5, mode = $$props.mode);
    		if ('adjusting' in $$props) $$invalidate(6, adjusting = $$props.adjusting);
    		if ('adjusted' in $$props) adjusted = $$props.adjusted;
    		if ('_export' in $$props) $$invalidate(7, _export = $$props._export);
    		if ('status' in $$props) $$invalidate(8, status = $$props.status);
    		if ('assign' in $$props) $$invalidate(9, assign = $$props.assign);
    		if ('_svgcode' in $$props) _svgcode = $$props._svgcode;
    		if ('_circlescode' in $$props) _circlescode = $$props._circlescode;
    		if ('_circlesstr' in $$props) _circlesstr = $$props._circlesstr;
    		if ('_boxesstr' in $$props) _boxesstr = $$props._boxesstr;
    		if ('steps' in $$props) steps = $$props.steps;
    		if ('_imgcode' in $$props) _imgcode = $$props._imgcode;
    		if ('imgUrl' in $$props) $$invalidate(10, imgUrl = $$props.imgUrl);
    		if ('data' in $$props) $$invalidate(11, data = $$props.data);
    		if ('statustext' in $$props) $$invalidate(12, statustext = $$props.statustext);
    		if ('obj_id' in $$props) obj_id = $$props.obj_id;
    		if ('objects' in $$props) $$invalidate(23, objects = $$props.objects);
    		if ('dropped' in $$props) $$invalidate(13, dropped = $$props.dropped);
    		if ('box_selected' in $$props) $$invalidate(14, box_selected = $$props.box_selected);
    		if ('dropped_in' in $$props) dropped_in = $$props.dropped_in;
    		if ('moving' in $$props) moving = $$props.moving;
    		if ('left' in $$props) left = $$props.left;
    		if ('top' in $$props) top = $$props.top;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		i,
    		undoStack,
    		circles,
    		buttons,
    		selected,
    		mode,
    		adjusting,
    		_export,
    		status,
    		assign,
    		imgUrl,
    		data,
    		statustext,
    		dropped,
    		box_selected,
    		onKeyPress,
    		handleClick,
    		adjust,
    		select,
    		travel,
    		writeSvg,
    		importIMG,
    		editsvg,
    		objects,
    		onMouseMove,
    		onMouseDown,
    		onMouseUp,
    		Remove,
    		AddItem,
    		adjust_width,
    		adjust_height,
    		SearchFetch,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		contextmenu_handler,
    		click_handler_6,
    		contextmenu_handler_1,
    		input_input_handler,
    		input_input_handler_1,
    		textarea_input_handler,
    		input1_change_handler,
    		input2_change_handler,
    		input3_change_handler,
    		input_input_handler_2,
    		input4_change_handler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		click_handler_7,
    		click_handler_8,
    		input0_input_handler_1,
    		input1_input_handler_1,
    		input2_input_handler_1,
    		input3_input_handler_1,
    		input4_input_handler_1,
    		click_handler_9,
    		click_handler_10,
    		click_handler_11,
    		input2_change_handler_1,
    		click_handler_12,
    		click_handler_13,
    		contextmenu_status_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
