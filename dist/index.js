(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('stream')) :
    typeof define === 'function' && define.amd ? define(['exports', 'stream'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Csv = {}, global.require$$0));
})(this, (function (exports, require$$0) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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
    function append(target, node) {
        target.appendChild(node);
    }
    function append_styles(target, style_sheet_id, styles) {
        const append_styles_to = get_root_for_style(target);
        if (!append_styles_to.getElementById(style_sheet_id)) {
            const style = element('style');
            style.id = style_sheet_id;
            style.textContent = styles;
            append_stylesheet(append_styles_to, style);
        }
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
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
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
            ctx: null,
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

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /* @license
    Papa Parse
    v5.3.1
    https://github.com/mholt/PapaParse
    License: MIT
    */

    var papaparse = createCommonjsModule(function (module, exports) {
    (function(root, factory)
    {
    	/* globals define */
    	{
    		// Node. Does not work with strict CommonJS, but
    		// only CommonJS-like environments that support module.exports,
    		// like Node.
    		module.exports = factory();
    	}
    	// in strict mode we cannot access arguments.callee, so we need a named reference to
    	// stringify the factory method for the blob worker
    	// eslint-disable-next-line func-name
    }(commonjsGlobal, function moduleFactory()
    {

    	var global = (function() {
    		// alternative method, similar to `Function('return this')()`
    		// but without using `eval` (which is disabled when
    		// using Content Security Policy).

    		if (typeof self !== 'undefined') { return self; }
    		if (typeof window !== 'undefined') { return window; }
    		if (typeof global !== 'undefined') { return global; }

    		// When running tests none of the above have been defined
    		return {};
    	})();


    	function getWorkerBlob() {
    		var URL = global.URL || global.webkitURL || null;
    		var code = moduleFactory.toString();
    		return Papa.BLOB_URL || (Papa.BLOB_URL = URL.createObjectURL(new Blob(['(', code, ')();'], {type: 'text/javascript'})));
    	}

    	var IS_WORKER = !global.document && !!global.postMessage,
    		IS_PAPA_WORKER = IS_WORKER && /blob:/i.test((global.location || {}).protocol);
    	var workers = {}, workerIdCounter = 0;

    	var Papa = {};

    	Papa.parse = CsvToJson;
    	Papa.unparse = JsonToCsv;

    	Papa.RECORD_SEP = String.fromCharCode(30);
    	Papa.UNIT_SEP = String.fromCharCode(31);
    	Papa.BYTE_ORDER_MARK = '\ufeff';
    	Papa.BAD_DELIMITERS = ['\r', '\n', '"', Papa.BYTE_ORDER_MARK];
    	Papa.WORKERS_SUPPORTED = !IS_WORKER && !!global.Worker;
    	Papa.NODE_STREAM_INPUT = 1;

    	// Configurable chunk sizes for local and remote files, respectively
    	Papa.LocalChunkSize = 1024 * 1024 * 10;	// 10 MB
    	Papa.RemoteChunkSize = 1024 * 1024 * 5;	// 5 MB
    	Papa.DefaultDelimiter = ',';			// Used if not specified and detection fails

    	// Exposed for testing and development only
    	Papa.Parser = Parser;
    	Papa.ParserHandle = ParserHandle;
    	Papa.NetworkStreamer = NetworkStreamer;
    	Papa.FileStreamer = FileStreamer;
    	Papa.StringStreamer = StringStreamer;
    	Papa.ReadableStreamStreamer = ReadableStreamStreamer;
    	if (typeof PAPA_BROWSER_CONTEXT === 'undefined') {
    		Papa.DuplexStreamStreamer = DuplexStreamStreamer;
    	}

    	if (global.jQuery)
    	{
    		var $ = global.jQuery;
    		$.fn.parse = function(options)
    		{
    			var config = options.config || {};
    			var queue = [];

    			this.each(function(idx)
    			{
    				var supported = $(this).prop('tagName').toUpperCase() === 'INPUT'
    								&& $(this).attr('type').toLowerCase() === 'file'
    								&& global.FileReader;

    				if (!supported || !this.files || this.files.length === 0)
    					return true;	// continue to next input element

    				for (var i = 0; i < this.files.length; i++)
    				{
    					queue.push({
    						file: this.files[i],
    						inputElem: this,
    						instanceConfig: $.extend({}, config)
    					});
    				}
    			});

    			parseNextFile();	// begin parsing
    			return this;		// maintains chainability


    			function parseNextFile()
    			{
    				if (queue.length === 0)
    				{
    					if (isFunction(options.complete))
    						options.complete();
    					return;
    				}

    				var f = queue[0];

    				if (isFunction(options.before))
    				{
    					var returned = options.before(f.file, f.inputElem);

    					if (typeof returned === 'object')
    					{
    						if (returned.action === 'abort')
    						{
    							error('AbortError', f.file, f.inputElem, returned.reason);
    							return;	// Aborts all queued files immediately
    						}
    						else if (returned.action === 'skip')
    						{
    							fileComplete();	// parse the next file in the queue, if any
    							return;
    						}
    						else if (typeof returned.config === 'object')
    							f.instanceConfig = $.extend(f.instanceConfig, returned.config);
    					}
    					else if (returned === 'skip')
    					{
    						fileComplete();	// parse the next file in the queue, if any
    						return;
    					}
    				}

    				// Wrap up the user's complete callback, if any, so that ours also gets executed
    				var userCompleteFunc = f.instanceConfig.complete;
    				f.instanceConfig.complete = function(results)
    				{
    					if (isFunction(userCompleteFunc))
    						userCompleteFunc(results, f.file, f.inputElem);
    					fileComplete();
    				};

    				Papa.parse(f.file, f.instanceConfig);
    			}

    			function error(name, file, elem, reason)
    			{
    				if (isFunction(options.error))
    					options.error({name: name}, file, elem, reason);
    			}

    			function fileComplete()
    			{
    				queue.splice(0, 1);
    				parseNextFile();
    			}
    		};
    	}


    	if (IS_PAPA_WORKER)
    	{
    		global.onmessage = workerThreadReceivedMessage;
    	}




    	function CsvToJson(_input, _config)
    	{
    		_config = _config || {};
    		var dynamicTyping = _config.dynamicTyping || false;
    		if (isFunction(dynamicTyping)) {
    			_config.dynamicTypingFunction = dynamicTyping;
    			// Will be filled on first row call
    			dynamicTyping = {};
    		}
    		_config.dynamicTyping = dynamicTyping;

    		_config.transform = isFunction(_config.transform) ? _config.transform : false;

    		if (_config.worker && Papa.WORKERS_SUPPORTED)
    		{
    			var w = newWorker();

    			w.userStep = _config.step;
    			w.userChunk = _config.chunk;
    			w.userComplete = _config.complete;
    			w.userError = _config.error;

    			_config.step = isFunction(_config.step);
    			_config.chunk = isFunction(_config.chunk);
    			_config.complete = isFunction(_config.complete);
    			_config.error = isFunction(_config.error);
    			delete _config.worker;	// prevent infinite loop

    			w.postMessage({
    				input: _input,
    				config: _config,
    				workerId: w.id
    			});

    			return;
    		}

    		var streamer = null;
    		if (_input === Papa.NODE_STREAM_INPUT && typeof PAPA_BROWSER_CONTEXT === 'undefined')
    		{
    			// create a node Duplex stream for use
    			// with .pipe
    			streamer = new DuplexStreamStreamer(_config);
    			return streamer.getStream();
    		}
    		else if (typeof _input === 'string')
    		{
    			if (_config.download)
    				streamer = new NetworkStreamer(_config);
    			else
    				streamer = new StringStreamer(_config);
    		}
    		else if (_input.readable === true && isFunction(_input.read) && isFunction(_input.on))
    		{
    			streamer = new ReadableStreamStreamer(_config);
    		}
    		else if ((global.File && _input instanceof File) || _input instanceof Object)	// ...Safari. (see issue #106)
    			streamer = new FileStreamer(_config);

    		return streamer.stream(_input);
    	}






    	function JsonToCsv(_input, _config)
    	{
    		// Default configuration

    		/** whether to surround every datum with quotes */
    		var _quotes = false;

    		/** whether to write headers */
    		var _writeHeader = true;

    		/** delimiting character(s) */
    		var _delimiter = ',';

    		/** newline character(s) */
    		var _newline = '\r\n';

    		/** quote character */
    		var _quoteChar = '"';

    		/** escaped quote character, either "" or <config.escapeChar>" */
    		var _escapedQuote = _quoteChar + _quoteChar;

    		/** whether to skip empty lines */
    		var _skipEmptyLines = false;

    		/** the columns (keys) we expect when we unparse objects */
    		var _columns = null;

    		/** whether to prevent outputting cells that can be parsed as formulae by spreadsheet software (Excel and LibreOffice) */
    		var _escapeFormulae = false;

    		unpackConfig();

    		var quoteCharRegex = new RegExp(escapeRegExp(_quoteChar), 'g');

    		if (typeof _input === 'string')
    			_input = JSON.parse(_input);

    		if (Array.isArray(_input))
    		{
    			if (!_input.length || Array.isArray(_input[0]))
    				return serialize(null, _input, _skipEmptyLines);
    			else if (typeof _input[0] === 'object')
    				return serialize(_columns || Object.keys(_input[0]), _input, _skipEmptyLines);
    		}
    		else if (typeof _input === 'object')
    		{
    			if (typeof _input.data === 'string')
    				_input.data = JSON.parse(_input.data);

    			if (Array.isArray(_input.data))
    			{
    				if (!_input.fields)
    					_input.fields =  _input.meta && _input.meta.fields;

    				if (!_input.fields)
    					_input.fields =  Array.isArray(_input.data[0])
    						? _input.fields
    						: typeof _input.data[0] === 'object'
    							? Object.keys(_input.data[0])
    							: [];

    				if (!(Array.isArray(_input.data[0])) && typeof _input.data[0] !== 'object')
    					_input.data = [_input.data];	// handles input like [1,2,3] or ['asdf']
    			}

    			return serialize(_input.fields || [], _input.data || [], _skipEmptyLines);
    		}

    		// Default (any valid paths should return before this)
    		throw new Error('Unable to serialize unrecognized input');


    		function unpackConfig()
    		{
    			if (typeof _config !== 'object')
    				return;

    			if (typeof _config.delimiter === 'string'
                    && !Papa.BAD_DELIMITERS.filter(function(value) { return _config.delimiter.indexOf(value) !== -1; }).length)
    			{
    				_delimiter = _config.delimiter;
    			}

    			if (typeof _config.quotes === 'boolean'
    				|| typeof _config.quotes === 'function'
    				|| Array.isArray(_config.quotes))
    				_quotes = _config.quotes;

    			if (typeof _config.skipEmptyLines === 'boolean'
    				|| typeof _config.skipEmptyLines === 'string')
    				_skipEmptyLines = _config.skipEmptyLines;

    			if (typeof _config.newline === 'string')
    				_newline = _config.newline;

    			if (typeof _config.quoteChar === 'string')
    				_quoteChar = _config.quoteChar;

    			if (typeof _config.header === 'boolean')
    				_writeHeader = _config.header;

    			if (Array.isArray(_config.columns)) {

    				if (_config.columns.length === 0) throw new Error('Option columns is empty');

    				_columns = _config.columns;
    			}

    			if (_config.escapeChar !== undefined) {
    				_escapedQuote = _config.escapeChar + _quoteChar;
    			}

    			if (typeof _config.escapeFormulae === 'boolean')
    				_escapeFormulae = _config.escapeFormulae;
    		}


    		/** The double for loop that iterates the data and writes out a CSV string including header row */
    		function serialize(fields, data, skipEmptyLines)
    		{
    			var csv = '';

    			if (typeof fields === 'string')
    				fields = JSON.parse(fields);
    			if (typeof data === 'string')
    				data = JSON.parse(data);

    			var hasHeader = Array.isArray(fields) && fields.length > 0;
    			var dataKeyedByField = !(Array.isArray(data[0]));

    			// If there a header row, write it first
    			if (hasHeader && _writeHeader)
    			{
    				for (var i = 0; i < fields.length; i++)
    				{
    					if (i > 0)
    						csv += _delimiter;
    					csv += safe(fields[i], i);
    				}
    				if (data.length > 0)
    					csv += _newline;
    			}

    			// Then write out the data
    			for (var row = 0; row < data.length; row++)
    			{
    				var maxCol = hasHeader ? fields.length : data[row].length;

    				var emptyLine = false;
    				var nullLine = hasHeader ? Object.keys(data[row]).length === 0 : data[row].length === 0;
    				if (skipEmptyLines && !hasHeader)
    				{
    					emptyLine = skipEmptyLines === 'greedy' ? data[row].join('').trim() === '' : data[row].length === 1 && data[row][0].length === 0;
    				}
    				if (skipEmptyLines === 'greedy' && hasHeader) {
    					var line = [];
    					for (var c = 0; c < maxCol; c++) {
    						var cx = dataKeyedByField ? fields[c] : c;
    						line.push(data[row][cx]);
    					}
    					emptyLine = line.join('').trim() === '';
    				}
    				if (!emptyLine)
    				{
    					for (var col = 0; col < maxCol; col++)
    					{
    						if (col > 0 && !nullLine)
    							csv += _delimiter;
    						var colIdx = hasHeader && dataKeyedByField ? fields[col] : col;
    						csv += safe(data[row][colIdx], col);
    					}
    					if (row < data.length - 1 && (!skipEmptyLines || (maxCol > 0 && !nullLine)))
    					{
    						csv += _newline;
    					}
    				}
    			}
    			return csv;
    		}

    		/** Encloses a value around quotes if needed (makes a value safe for CSV insertion) */
    		function safe(str, col)
    		{
    			if (typeof str === 'undefined' || str === null)
    				return '';

    			if (str.constructor === Date)
    				return JSON.stringify(str).slice(1, 25);

    			if (_escapeFormulae === true && typeof str === "string" && (str.match(/^[=+\-@].*$/) !== null)) {
    				str = "'" + str;
    			}

    			var escapedQuoteStr = str.toString().replace(quoteCharRegex, _escapedQuote);

    			var needsQuotes = (typeof _quotes === 'boolean' && _quotes)
    							|| (typeof _quotes === 'function' && _quotes(str, col))
    							|| (Array.isArray(_quotes) && _quotes[col])
    							|| hasAny(escapedQuoteStr, Papa.BAD_DELIMITERS)
    							|| escapedQuoteStr.indexOf(_delimiter) > -1
    							|| escapedQuoteStr.charAt(0) === ' '
    							|| escapedQuoteStr.charAt(escapedQuoteStr.length - 1) === ' ';

    			return needsQuotes ? _quoteChar + escapedQuoteStr + _quoteChar : escapedQuoteStr;
    		}

    		function hasAny(str, substrings)
    		{
    			for (var i = 0; i < substrings.length; i++)
    				if (str.indexOf(substrings[i]) > -1)
    					return true;
    			return false;
    		}
    	}

    	/** ChunkStreamer is the base prototype for various streamer implementations. */
    	function ChunkStreamer(config)
    	{
    		this._handle = null;
    		this._finished = false;
    		this._completed = false;
    		this._halted = false;
    		this._input = null;
    		this._baseIndex = 0;
    		this._partialLine = '';
    		this._rowCount = 0;
    		this._start = 0;
    		this._nextChunk = null;
    		this.isFirstChunk = true;
    		this._completeResults = {
    			data: [],
    			errors: [],
    			meta: {}
    		};
    		replaceConfig.call(this, config);

    		this.parseChunk = function(chunk, isFakeChunk)
    		{
    			// First chunk pre-processing
    			if (this.isFirstChunk && isFunction(this._config.beforeFirstChunk))
    			{
    				var modifiedChunk = this._config.beforeFirstChunk(chunk);
    				if (modifiedChunk !== undefined)
    					chunk = modifiedChunk;
    			}
    			this.isFirstChunk = false;
    			this._halted = false;

    			// Rejoin the line we likely just split in two by chunking the file
    			var aggregate = this._partialLine + chunk;
    			this._partialLine = '';

    			var results = this._handle.parse(aggregate, this._baseIndex, !this._finished);

    			if (this._handle.paused() || this._handle.aborted()) {
    				this._halted = true;
    				return;
    			}

    			var lastIndex = results.meta.cursor;

    			if (!this._finished)
    			{
    				this._partialLine = aggregate.substring(lastIndex - this._baseIndex);
    				this._baseIndex = lastIndex;
    			}

    			if (results && results.data)
    				this._rowCount += results.data.length;

    			var finishedIncludingPreview = this._finished || (this._config.preview && this._rowCount >= this._config.preview);

    			if (IS_PAPA_WORKER)
    			{
    				global.postMessage({
    					results: results,
    					workerId: Papa.WORKER_ID,
    					finished: finishedIncludingPreview
    				});
    			}
    			else if (isFunction(this._config.chunk) && !isFakeChunk)
    			{
    				this._config.chunk(results, this._handle);
    				if (this._handle.paused() || this._handle.aborted()) {
    					this._halted = true;
    					return;
    				}
    				results = undefined;
    				this._completeResults = undefined;
    			}

    			if (!this._config.step && !this._config.chunk) {
    				this._completeResults.data = this._completeResults.data.concat(results.data);
    				this._completeResults.errors = this._completeResults.errors.concat(results.errors);
    				this._completeResults.meta = results.meta;
    			}

    			if (!this._completed && finishedIncludingPreview && isFunction(this._config.complete) && (!results || !results.meta.aborted)) {
    				this._config.complete(this._completeResults, this._input);
    				this._completed = true;
    			}

    			if (!finishedIncludingPreview && (!results || !results.meta.paused))
    				this._nextChunk();

    			return results;
    		};

    		this._sendError = function(error)
    		{
    			if (isFunction(this._config.error))
    				this._config.error(error);
    			else if (IS_PAPA_WORKER && this._config.error)
    			{
    				global.postMessage({
    					workerId: Papa.WORKER_ID,
    					error: error,
    					finished: false
    				});
    			}
    		};

    		function replaceConfig(config)
    		{
    			// Deep-copy the config so we can edit it
    			var configCopy = copy(config);
    			configCopy.chunkSize = parseInt(configCopy.chunkSize);	// parseInt VERY important so we don't concatenate strings!
    			if (!config.step && !config.chunk)
    				configCopy.chunkSize = null;  // disable Range header if not streaming; bad values break IIS - see issue #196
    			this._handle = new ParserHandle(configCopy);
    			this._handle.streamer = this;
    			this._config = configCopy;	// persist the copy to the caller
    		}
    	}


    	function NetworkStreamer(config)
    	{
    		config = config || {};
    		if (!config.chunkSize)
    			config.chunkSize = Papa.RemoteChunkSize;
    		ChunkStreamer.call(this, config);

    		var xhr;

    		if (IS_WORKER)
    		{
    			this._nextChunk = function()
    			{
    				this._readChunk();
    				this._chunkLoaded();
    			};
    		}
    		else
    		{
    			this._nextChunk = function()
    			{
    				this._readChunk();
    			};
    		}

    		this.stream = function(url)
    		{
    			this._input = url;
    			this._nextChunk();	// Starts streaming
    		};

    		this._readChunk = function()
    		{
    			if (this._finished)
    			{
    				this._chunkLoaded();
    				return;
    			}

    			xhr = new XMLHttpRequest();

    			if (this._config.withCredentials)
    			{
    				xhr.withCredentials = this._config.withCredentials;
    			}

    			if (!IS_WORKER)
    			{
    				xhr.onload = bindFunction(this._chunkLoaded, this);
    				xhr.onerror = bindFunction(this._chunkError, this);
    			}

    			xhr.open(this._config.downloadRequestBody ? 'POST' : 'GET', this._input, !IS_WORKER);
    			// Headers can only be set when once the request state is OPENED
    			if (this._config.downloadRequestHeaders)
    			{
    				var headers = this._config.downloadRequestHeaders;

    				for (var headerName in headers)
    				{
    					xhr.setRequestHeader(headerName, headers[headerName]);
    				}
    			}

    			if (this._config.chunkSize)
    			{
    				var end = this._start + this._config.chunkSize - 1;	// minus one because byte range is inclusive
    				xhr.setRequestHeader('Range', 'bytes=' + this._start + '-' + end);
    			}

    			try {
    				xhr.send(this._config.downloadRequestBody);
    			}
    			catch (err) {
    				this._chunkError(err.message);
    			}

    			if (IS_WORKER && xhr.status === 0)
    				this._chunkError();
    		};

    		this._chunkLoaded = function()
    		{
    			if (xhr.readyState !== 4)
    				return;

    			if (xhr.status < 200 || xhr.status >= 400)
    			{
    				this._chunkError();
    				return;
    			}

    			// Use chunckSize as it may be a diference on reponse lentgh due to characters with more than 1 byte
    			this._start += this._config.chunkSize ? this._config.chunkSize : xhr.responseText.length;
    			this._finished = !this._config.chunkSize || this._start >= getFileSize(xhr);
    			this.parseChunk(xhr.responseText);
    		};

    		this._chunkError = function(errorMessage)
    		{
    			var errorText = xhr.statusText || errorMessage;
    			this._sendError(new Error(errorText));
    		};

    		function getFileSize(xhr)
    		{
    			var contentRange = xhr.getResponseHeader('Content-Range');
    			if (contentRange === null) { // no content range, then finish!
    				return -1;
    			}
    			return parseInt(contentRange.substring(contentRange.lastIndexOf('/') + 1));
    		}
    	}
    	NetworkStreamer.prototype = Object.create(ChunkStreamer.prototype);
    	NetworkStreamer.prototype.constructor = NetworkStreamer;


    	function FileStreamer(config)
    	{
    		config = config || {};
    		if (!config.chunkSize)
    			config.chunkSize = Papa.LocalChunkSize;
    		ChunkStreamer.call(this, config);

    		var reader, slice;

    		// FileReader is better than FileReaderSync (even in worker) - see http://stackoverflow.com/q/24708649/1048862
    		// But Firefox is a pill, too - see issue #76: https://github.com/mholt/PapaParse/issues/76
    		var usingAsyncReader = typeof FileReader !== 'undefined';	// Safari doesn't consider it a function - see issue #105

    		this.stream = function(file)
    		{
    			this._input = file;
    			slice = file.slice || file.webkitSlice || file.mozSlice;

    			if (usingAsyncReader)
    			{
    				reader = new FileReader();		// Preferred method of reading files, even in workers
    				reader.onload = bindFunction(this._chunkLoaded, this);
    				reader.onerror = bindFunction(this._chunkError, this);
    			}
    			else
    				reader = new FileReaderSync();	// Hack for running in a web worker in Firefox

    			this._nextChunk();	// Starts streaming
    		};

    		this._nextChunk = function()
    		{
    			if (!this._finished && (!this._config.preview || this._rowCount < this._config.preview))
    				this._readChunk();
    		};

    		this._readChunk = function()
    		{
    			var input = this._input;
    			if (this._config.chunkSize)
    			{
    				var end = Math.min(this._start + this._config.chunkSize, this._input.size);
    				input = slice.call(input, this._start, end);
    			}
    			var txt = reader.readAsText(input, this._config.encoding);
    			if (!usingAsyncReader)
    				this._chunkLoaded({ target: { result: txt } });	// mimic the async signature
    		};

    		this._chunkLoaded = function(event)
    		{
    			// Very important to increment start each time before handling results
    			this._start += this._config.chunkSize;
    			this._finished = !this._config.chunkSize || this._start >= this._input.size;
    			this.parseChunk(event.target.result);
    		};

    		this._chunkError = function()
    		{
    			this._sendError(reader.error);
    		};

    	}
    	FileStreamer.prototype = Object.create(ChunkStreamer.prototype);
    	FileStreamer.prototype.constructor = FileStreamer;


    	function StringStreamer(config)
    	{
    		config = config || {};
    		ChunkStreamer.call(this, config);

    		var remaining;
    		this.stream = function(s)
    		{
    			remaining = s;
    			return this._nextChunk();
    		};
    		this._nextChunk = function()
    		{
    			if (this._finished) return;
    			var size = this._config.chunkSize;
    			var chunk;
    			if(size) {
    				chunk = remaining.substring(0, size);
    				remaining = remaining.substring(size);
    			} else {
    				chunk = remaining;
    				remaining = '';
    			}
    			this._finished = !remaining;
    			return this.parseChunk(chunk);
    		};
    	}
    	StringStreamer.prototype = Object.create(StringStreamer.prototype);
    	StringStreamer.prototype.constructor = StringStreamer;


    	function ReadableStreamStreamer(config)
    	{
    		config = config || {};

    		ChunkStreamer.call(this, config);

    		var queue = [];
    		var parseOnData = true;
    		var streamHasEnded = false;

    		this.pause = function()
    		{
    			ChunkStreamer.prototype.pause.apply(this, arguments);
    			this._input.pause();
    		};

    		this.resume = function()
    		{
    			ChunkStreamer.prototype.resume.apply(this, arguments);
    			this._input.resume();
    		};

    		this.stream = function(stream)
    		{
    			this._input = stream;

    			this._input.on('data', this._streamData);
    			this._input.on('end', this._streamEnd);
    			this._input.on('error', this._streamError);
    		};

    		this._checkIsFinished = function()
    		{
    			if (streamHasEnded && queue.length === 1) {
    				this._finished = true;
    			}
    		};

    		this._nextChunk = function()
    		{
    			this._checkIsFinished();
    			if (queue.length)
    			{
    				this.parseChunk(queue.shift());
    			}
    			else
    			{
    				parseOnData = true;
    			}
    		};

    		this._streamData = bindFunction(function(chunk)
    		{
    			try
    			{
    				queue.push(typeof chunk === 'string' ? chunk : chunk.toString(this._config.encoding));

    				if (parseOnData)
    				{
    					parseOnData = false;
    					this._checkIsFinished();
    					this.parseChunk(queue.shift());
    				}
    			}
    			catch (error)
    			{
    				this._streamError(error);
    			}
    		}, this);

    		this._streamError = bindFunction(function(error)
    		{
    			this._streamCleanUp();
    			this._sendError(error);
    		}, this);

    		this._streamEnd = bindFunction(function()
    		{
    			this._streamCleanUp();
    			streamHasEnded = true;
    			this._streamData('');
    		}, this);

    		this._streamCleanUp = bindFunction(function()
    		{
    			this._input.removeListener('data', this._streamData);
    			this._input.removeListener('end', this._streamEnd);
    			this._input.removeListener('error', this._streamError);
    		}, this);
    	}
    	ReadableStreamStreamer.prototype = Object.create(ChunkStreamer.prototype);
    	ReadableStreamStreamer.prototype.constructor = ReadableStreamStreamer;


    	function DuplexStreamStreamer(_config) {
    		var Duplex = require$$0__default["default"].Duplex;
    		var config = copy(_config);
    		var parseOnWrite = true;
    		var writeStreamHasFinished = false;
    		var parseCallbackQueue = [];
    		var stream = null;

    		this._onCsvData = function(results)
    		{
    			var data = results.data;
    			if (!stream.push(data) && !this._handle.paused()) {
    				// the writeable consumer buffer has filled up
    				// so we need to pause until more items
    				// can be processed
    				this._handle.pause();
    			}
    		};

    		this._onCsvComplete = function()
    		{
    			// node will finish the read stream when
    			// null is pushed
    			stream.push(null);
    		};

    		config.step = bindFunction(this._onCsvData, this);
    		config.complete = bindFunction(this._onCsvComplete, this);
    		ChunkStreamer.call(this, config);

    		this._nextChunk = function()
    		{
    			if (writeStreamHasFinished && parseCallbackQueue.length === 1) {
    				this._finished = true;
    			}
    			if (parseCallbackQueue.length) {
    				parseCallbackQueue.shift()();
    			} else {
    				parseOnWrite = true;
    			}
    		};

    		this._addToParseQueue = function(chunk, callback)
    		{
    			// add to queue so that we can indicate
    			// completion via callback
    			// node will automatically pause the incoming stream
    			// when too many items have been added without their
    			// callback being invoked
    			parseCallbackQueue.push(bindFunction(function() {
    				this.parseChunk(typeof chunk === 'string' ? chunk : chunk.toString(config.encoding));
    				if (isFunction(callback)) {
    					return callback();
    				}
    			}, this));
    			if (parseOnWrite) {
    				parseOnWrite = false;
    				this._nextChunk();
    			}
    		};

    		this._onRead = function()
    		{
    			if (this._handle.paused()) {
    				// the writeable consumer can handle more data
    				// so resume the chunk parsing
    				this._handle.resume();
    			}
    		};

    		this._onWrite = function(chunk, encoding, callback)
    		{
    			this._addToParseQueue(chunk, callback);
    		};

    		this._onWriteComplete = function()
    		{
    			writeStreamHasFinished = true;
    			// have to write empty string
    			// so parser knows its done
    			this._addToParseQueue('');
    		};

    		this.getStream = function()
    		{
    			return stream;
    		};
    		stream = new Duplex({
    			readableObjectMode: true,
    			decodeStrings: false,
    			read: bindFunction(this._onRead, this),
    			write: bindFunction(this._onWrite, this)
    		});
    		stream.once('finish', bindFunction(this._onWriteComplete, this));
    	}
    	if (typeof PAPA_BROWSER_CONTEXT === 'undefined') {
    		DuplexStreamStreamer.prototype = Object.create(ChunkStreamer.prototype);
    		DuplexStreamStreamer.prototype.constructor = DuplexStreamStreamer;
    	}


    	// Use one ParserHandle per entire CSV file or string
    	function ParserHandle(_config)
    	{
    		// One goal is to minimize the use of regular expressions...
    		var MAX_FLOAT = Math.pow(2, 53);
    		var MIN_FLOAT = -MAX_FLOAT;
    		var FLOAT = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/;
    		var ISO_DATE = /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/;
    		var self = this;
    		var _stepCounter = 0;	// Number of times step was called (number of rows parsed)
    		var _rowCounter = 0;	// Number of rows that have been parsed so far
    		var _input;				// The input being parsed
    		var _parser;			// The core parser being used
    		var _paused = false;	// Whether we are paused or not
    		var _aborted = false;	// Whether the parser has aborted or not
    		var _delimiterError;	// Temporary state between delimiter detection and processing results
    		var _fields = [];		// Fields are from the header row of the input, if there is one
    		var _results = {		// The last results returned from the parser
    			data: [],
    			errors: [],
    			meta: {}
    		};

    		if (isFunction(_config.step))
    		{
    			var userStep = _config.step;
    			_config.step = function(results)
    			{
    				_results = results;

    				if (needsHeaderRow())
    					processResults();
    				else	// only call user's step function after header row
    				{
    					processResults();

    					// It's possbile that this line was empty and there's no row here after all
    					if (_results.data.length === 0)
    						return;

    					_stepCounter += results.data.length;
    					if (_config.preview && _stepCounter > _config.preview)
    						_parser.abort();
    					else {
    						_results.data = _results.data[0];
    						userStep(_results, self);
    					}
    				}
    			};
    		}

    		/**
    		 * Parses input. Most users won't need, and shouldn't mess with, the baseIndex
    		 * and ignoreLastRow parameters. They are used by streamers (wrapper functions)
    		 * when an input comes in multiple chunks, like from a file.
    		 */
    		this.parse = function(input, baseIndex, ignoreLastRow)
    		{
    			var quoteChar = _config.quoteChar || '"';
    			if (!_config.newline)
    				_config.newline = guessLineEndings(input, quoteChar);

    			_delimiterError = false;
    			if (!_config.delimiter)
    			{
    				var delimGuess = guessDelimiter(input, _config.newline, _config.skipEmptyLines, _config.comments, _config.delimitersToGuess);
    				if (delimGuess.successful)
    					_config.delimiter = delimGuess.bestDelimiter;
    				else
    				{
    					_delimiterError = true;	// add error after parsing (otherwise it would be overwritten)
    					_config.delimiter = Papa.DefaultDelimiter;
    				}
    				_results.meta.delimiter = _config.delimiter;
    			}
    			else if(isFunction(_config.delimiter))
    			{
    				_config.delimiter = _config.delimiter(input);
    				_results.meta.delimiter = _config.delimiter;
    			}

    			var parserConfig = copy(_config);
    			if (_config.preview && _config.header)
    				parserConfig.preview++;	// to compensate for header row

    			_input = input;
    			_parser = new Parser(parserConfig);
    			_results = _parser.parse(_input, baseIndex, ignoreLastRow);
    			processResults();
    			return _paused ? { meta: { paused: true } } : (_results || { meta: { paused: false } });
    		};

    		this.paused = function()
    		{
    			return _paused;
    		};

    		this.pause = function()
    		{
    			_paused = true;
    			_parser.abort();

    			// If it is streaming via "chunking", the reader will start appending correctly already so no need to substring,
    			// otherwise we can get duplicate content within a row
    			_input = isFunction(_config.chunk) ? "" : _input.substring(_parser.getCharIndex());
    		};

    		this.resume = function()
    		{
    			if(self.streamer._halted) {
    				_paused = false;
    				self.streamer.parseChunk(_input, true);
    			} else {
    				// Bugfix: #636 In case the processing hasn't halted yet
    				// wait for it to halt in order to resume
    				setTimeout(self.resume, 3);
    			}
    		};

    		this.aborted = function()
    		{
    			return _aborted;
    		};

    		this.abort = function()
    		{
    			_aborted = true;
    			_parser.abort();
    			_results.meta.aborted = true;
    			if (isFunction(_config.complete))
    				_config.complete(_results);
    			_input = '';
    		};

    		function testEmptyLine(s) {
    			return _config.skipEmptyLines === 'greedy' ? s.join('').trim() === '' : s.length === 1 && s[0].length === 0;
    		}

    		function testFloat(s) {
    			if (FLOAT.test(s)) {
    				var floatValue = parseFloat(s);
    				if (floatValue > MIN_FLOAT && floatValue < MAX_FLOAT) {
    					return true;
    				}
    			}
    			return false;
    		}

    		function processResults()
    		{
    			if (_results && _delimiterError)
    			{
    				addError('Delimiter', 'UndetectableDelimiter', 'Unable to auto-detect delimiting character; defaulted to \'' + Papa.DefaultDelimiter + '\'');
    				_delimiterError = false;
    			}

    			if (_config.skipEmptyLines)
    			{
    				for (var i = 0; i < _results.data.length; i++)
    					if (testEmptyLine(_results.data[i]))
    						_results.data.splice(i--, 1);
    			}

    			if (needsHeaderRow())
    				fillHeaderFields();

    			return applyHeaderAndDynamicTypingAndTransformation();
    		}

    		function needsHeaderRow()
    		{
    			return _config.header && _fields.length === 0;
    		}

    		function fillHeaderFields()
    		{
    			if (!_results)
    				return;

    			function addHeader(header, i)
    			{
    				if (isFunction(_config.transformHeader))
    					header = _config.transformHeader(header, i);

    				_fields.push(header);
    			}

    			if (Array.isArray(_results.data[0]))
    			{
    				for (var i = 0; needsHeaderRow() && i < _results.data.length; i++)
    					_results.data[i].forEach(addHeader);

    				_results.data.splice(0, 1);
    			}
    			// if _results.data[0] is not an array, we are in a step where _results.data is the row.
    			else
    				_results.data.forEach(addHeader);
    		}

    		function shouldApplyDynamicTyping(field) {
    			// Cache function values to avoid calling it for each row
    			if (_config.dynamicTypingFunction && _config.dynamicTyping[field] === undefined) {
    				_config.dynamicTyping[field] = _config.dynamicTypingFunction(field);
    			}
    			return (_config.dynamicTyping[field] || _config.dynamicTyping) === true;
    		}

    		function parseDynamic(field, value)
    		{
    			if (shouldApplyDynamicTyping(field))
    			{
    				if (value === 'true' || value === 'TRUE')
    					return true;
    				else if (value === 'false' || value === 'FALSE')
    					return false;
    				else if (testFloat(value))
    					return parseFloat(value);
    				else if (ISO_DATE.test(value))
    					return new Date(value);
    				else
    					return (value === '' ? null : value);
    			}
    			return value;
    		}

    		function applyHeaderAndDynamicTypingAndTransformation()
    		{
    			if (!_results || (!_config.header && !_config.dynamicTyping && !_config.transform))
    				return _results;

    			function processRow(rowSource, i)
    			{
    				var row = _config.header ? {} : [];

    				var j;
    				for (j = 0; j < rowSource.length; j++)
    				{
    					var field = j;
    					var value = rowSource[j];

    					if (_config.header)
    						field = j >= _fields.length ? '__parsed_extra' : _fields[j];

    					if (_config.transform)
    						value = _config.transform(value,field);

    					value = parseDynamic(field, value);

    					if (field === '__parsed_extra')
    					{
    						row[field] = row[field] || [];
    						row[field].push(value);
    					}
    					else
    						row[field] = value;
    				}


    				if (_config.header)
    				{
    					if (j > _fields.length)
    						addError('FieldMismatch', 'TooManyFields', 'Too many fields: expected ' + _fields.length + ' fields but parsed ' + j, _rowCounter + i);
    					else if (j < _fields.length)
    						addError('FieldMismatch', 'TooFewFields', 'Too few fields: expected ' + _fields.length + ' fields but parsed ' + j, _rowCounter + i);
    				}

    				return row;
    			}

    			var incrementBy = 1;
    			if (!_results.data.length || Array.isArray(_results.data[0]))
    			{
    				_results.data = _results.data.map(processRow);
    				incrementBy = _results.data.length;
    			}
    			else
    				_results.data = processRow(_results.data, 0);


    			if (_config.header && _results.meta)
    				_results.meta.fields = _fields;

    			_rowCounter += incrementBy;
    			return _results;
    		}

    		function guessDelimiter(input, newline, skipEmptyLines, comments, delimitersToGuess) {
    			var bestDelim, bestDelta, fieldCountPrevRow, maxFieldCount;

    			delimitersToGuess = delimitersToGuess || [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP];

    			for (var i = 0; i < delimitersToGuess.length; i++) {
    				var delim = delimitersToGuess[i];
    				var delta = 0, avgFieldCount = 0, emptyLinesCount = 0;
    				fieldCountPrevRow = undefined;

    				var preview = new Parser({
    					comments: comments,
    					delimiter: delim,
    					newline: newline,
    					preview: 10
    				}).parse(input);

    				for (var j = 0; j < preview.data.length; j++) {
    					if (skipEmptyLines && testEmptyLine(preview.data[j])) {
    						emptyLinesCount++;
    						continue;
    					}
    					var fieldCount = preview.data[j].length;
    					avgFieldCount += fieldCount;

    					if (typeof fieldCountPrevRow === 'undefined') {
    						fieldCountPrevRow = fieldCount;
    						continue;
    					}
    					else if (fieldCount > 0) {
    						delta += Math.abs(fieldCount - fieldCountPrevRow);
    						fieldCountPrevRow = fieldCount;
    					}
    				}

    				if (preview.data.length > 0)
    					avgFieldCount /= (preview.data.length - emptyLinesCount);

    				if ((typeof bestDelta === 'undefined' || delta <= bestDelta)
    					&& (typeof maxFieldCount === 'undefined' || avgFieldCount > maxFieldCount) && avgFieldCount > 1.99) {
    					bestDelta = delta;
    					bestDelim = delim;
    					maxFieldCount = avgFieldCount;
    				}
    			}

    			_config.delimiter = bestDelim;

    			return {
    				successful: !!bestDelim,
    				bestDelimiter: bestDelim
    			};
    		}

    		function guessLineEndings(input, quoteChar)
    		{
    			input = input.substring(0, 1024 * 1024);	// max length 1 MB
    			// Replace all the text inside quotes
    			var re = new RegExp(escapeRegExp(quoteChar) + '([^]*?)' + escapeRegExp(quoteChar), 'gm');
    			input = input.replace(re, '');

    			var r = input.split('\r');

    			var n = input.split('\n');

    			var nAppearsFirst = (n.length > 1 && n[0].length < r[0].length);

    			if (r.length === 1 || nAppearsFirst)
    				return '\n';

    			var numWithN = 0;
    			for (var i = 0; i < r.length; i++)
    			{
    				if (r[i][0] === '\n')
    					numWithN++;
    			}

    			return numWithN >= r.length / 2 ? '\r\n' : '\r';
    		}

    		function addError(type, code, msg, row)
    		{
    			var error = {
    				type: type,
    				code: code,
    				message: msg
    			};
    			if(row !== undefined) {
    				error.row = row;
    			}
    			_results.errors.push(error);
    		}
    	}

    	/** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions */
    	function escapeRegExp(string)
    	{
    		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    	}

    	/** The core parser implements speedy and correct CSV parsing */
    	function Parser(config)
    	{
    		// Unpack the config object
    		config = config || {};
    		var delim = config.delimiter;
    		var newline = config.newline;
    		var comments = config.comments;
    		var step = config.step;
    		var preview = config.preview;
    		var fastMode = config.fastMode;
    		var quoteChar;
    		/** Allows for no quoteChar by setting quoteChar to undefined in config */
    		if (config.quoteChar === undefined) {
    			quoteChar = '"';
    		} else {
    			quoteChar = config.quoteChar;
    		}
    		var escapeChar = quoteChar;
    		if (config.escapeChar !== undefined) {
    			escapeChar = config.escapeChar;
    		}

    		// Delimiter must be valid
    		if (typeof delim !== 'string'
    			|| Papa.BAD_DELIMITERS.indexOf(delim) > -1)
    			delim = ',';

    		// Comment character must be valid
    		if (comments === delim)
    			throw new Error('Comment character same as delimiter');
    		else if (comments === true)
    			comments = '#';
    		else if (typeof comments !== 'string'
    			|| Papa.BAD_DELIMITERS.indexOf(comments) > -1)
    			comments = false;

    		// Newline must be valid: \r, \n, or \r\n
    		if (newline !== '\n' && newline !== '\r' && newline !== '\r\n')
    			newline = '\n';

    		// We're gonna need these at the Parser scope
    		var cursor = 0;
    		var aborted = false;

    		this.parse = function(input, baseIndex, ignoreLastRow)
    		{
    			// For some reason, in Chrome, this speeds things up (!?)
    			if (typeof input !== 'string')
    				throw new Error('Input must be a string');

    			// We don't need to compute some of these every time parse() is called,
    			// but having them in a more local scope seems to perform better
    			var inputLen = input.length,
    				delimLen = delim.length,
    				newlineLen = newline.length,
    				commentsLen = comments.length;
    			var stepIsFunction = isFunction(step);

    			// Establish starting state
    			cursor = 0;
    			var data = [], errors = [], row = [], lastCursor = 0;

    			if (!input)
    				return returnable();

    			if (fastMode || (fastMode !== false && input.indexOf(quoteChar) === -1))
    			{
    				var rows = input.split(newline);
    				for (var i = 0; i < rows.length; i++)
    				{
    					row = rows[i];
    					cursor += row.length;
    					if (i !== rows.length - 1)
    						cursor += newline.length;
    					else if (ignoreLastRow)
    						return returnable();
    					if (comments && row.substring(0, commentsLen) === comments)
    						continue;
    					if (stepIsFunction)
    					{
    						data = [];
    						pushRow(row.split(delim));
    						doStep();
    						if (aborted)
    							return returnable();
    					}
    					else
    						pushRow(row.split(delim));
    					if (preview && i >= preview)
    					{
    						data = data.slice(0, preview);
    						return returnable(true);
    					}
    				}
    				return returnable();
    			}

    			var nextDelim = input.indexOf(delim, cursor);
    			var nextNewline = input.indexOf(newline, cursor);
    			var quoteCharRegex = new RegExp(escapeRegExp(escapeChar) + escapeRegExp(quoteChar), 'g');
    			var quoteSearch = input.indexOf(quoteChar, cursor);

    			// Parser loop
    			for (;;)
    			{
    				// Field has opening quote
    				if (input[cursor] === quoteChar)
    				{
    					// Start our search for the closing quote where the cursor is
    					quoteSearch = cursor;

    					// Skip the opening quote
    					cursor++;

    					for (;;)
    					{
    						// Find closing quote
    						quoteSearch = input.indexOf(quoteChar, quoteSearch + 1);

    						//No other quotes are found - no other delimiters
    						if (quoteSearch === -1)
    						{
    							if (!ignoreLastRow) {
    								// No closing quote... what a pity
    								errors.push({
    									type: 'Quotes',
    									code: 'MissingQuotes',
    									message: 'Quoted field unterminated',
    									row: data.length,	// row has yet to be inserted
    									index: cursor
    								});
    							}
    							return finish();
    						}

    						// Closing quote at EOF
    						if (quoteSearch === inputLen - 1)
    						{
    							var value = input.substring(cursor, quoteSearch).replace(quoteCharRegex, quoteChar);
    							return finish(value);
    						}

    						// If this quote is escaped, it's part of the data; skip it
    						// If the quote character is the escape character, then check if the next character is the escape character
    						if (quoteChar === escapeChar &&  input[quoteSearch + 1] === escapeChar)
    						{
    							quoteSearch++;
    							continue;
    						}

    						// If the quote character is not the escape character, then check if the previous character was the escape character
    						if (quoteChar !== escapeChar && quoteSearch !== 0 && input[quoteSearch - 1] === escapeChar)
    						{
    							continue;
    						}

    						if(nextDelim !== -1 && nextDelim < (quoteSearch + 1)) {
    							nextDelim = input.indexOf(delim, (quoteSearch + 1));
    						}
    						if(nextNewline !== -1 && nextNewline < (quoteSearch + 1)) {
    							nextNewline = input.indexOf(newline, (quoteSearch + 1));
    						}
    						// Check up to nextDelim or nextNewline, whichever is closest
    						var checkUpTo = nextNewline === -1 ? nextDelim : Math.min(nextDelim, nextNewline);
    						var spacesBetweenQuoteAndDelimiter = extraSpaces(checkUpTo);

    						// Closing quote followed by delimiter or 'unnecessary spaces + delimiter'
    						if (input[quoteSearch + 1 + spacesBetweenQuoteAndDelimiter] === delim)
    						{
    							row.push(input.substring(cursor, quoteSearch).replace(quoteCharRegex, quoteChar));
    							cursor = quoteSearch + 1 + spacesBetweenQuoteAndDelimiter + delimLen;

    							// If char after following delimiter is not quoteChar, we find next quote char position
    							if (input[quoteSearch + 1 + spacesBetweenQuoteAndDelimiter + delimLen] !== quoteChar)
    							{
    								quoteSearch = input.indexOf(quoteChar, cursor);
    							}
    							nextDelim = input.indexOf(delim, cursor);
    							nextNewline = input.indexOf(newline, cursor);
    							break;
    						}

    						var spacesBetweenQuoteAndNewLine = extraSpaces(nextNewline);

    						// Closing quote followed by newline or 'unnecessary spaces + newLine'
    						if (input.substring(quoteSearch + 1 + spacesBetweenQuoteAndNewLine, quoteSearch + 1 + spacesBetweenQuoteAndNewLine + newlineLen) === newline)
    						{
    							row.push(input.substring(cursor, quoteSearch).replace(quoteCharRegex, quoteChar));
    							saveRow(quoteSearch + 1 + spacesBetweenQuoteAndNewLine + newlineLen);
    							nextDelim = input.indexOf(delim, cursor);	// because we may have skipped the nextDelim in the quoted field
    							quoteSearch = input.indexOf(quoteChar, cursor);	// we search for first quote in next line

    							if (stepIsFunction)
    							{
    								doStep();
    								if (aborted)
    									return returnable();
    							}

    							if (preview && data.length >= preview)
    								return returnable(true);

    							break;
    						}


    						// Checks for valid closing quotes are complete (escaped quotes or quote followed by EOF/delimiter/newline) -- assume these quotes are part of an invalid text string
    						errors.push({
    							type: 'Quotes',
    							code: 'InvalidQuotes',
    							message: 'Trailing quote on quoted field is malformed',
    							row: data.length,	// row has yet to be inserted
    							index: cursor
    						});

    						quoteSearch++;
    						continue;

    					}

    					continue;
    				}

    				// Comment found at start of new line
    				if (comments && row.length === 0 && input.substring(cursor, cursor + commentsLen) === comments)
    				{
    					if (nextNewline === -1)	// Comment ends at EOF
    						return returnable();
    					cursor = nextNewline + newlineLen;
    					nextNewline = input.indexOf(newline, cursor);
    					nextDelim = input.indexOf(delim, cursor);
    					continue;
    				}

    				// Next delimiter comes before next newline, so we've reached end of field
    				if (nextDelim !== -1 && (nextDelim < nextNewline || nextNewline === -1))
    				{
    					row.push(input.substring(cursor, nextDelim));
    					cursor = nextDelim + delimLen;
    					// we look for next delimiter char
    					nextDelim = input.indexOf(delim, cursor);
    					continue;
    				}

    				// End of row
    				if (nextNewline !== -1)
    				{
    					row.push(input.substring(cursor, nextNewline));
    					saveRow(nextNewline + newlineLen);

    					if (stepIsFunction)
    					{
    						doStep();
    						if (aborted)
    							return returnable();
    					}

    					if (preview && data.length >= preview)
    						return returnable(true);

    					continue;
    				}

    				break;
    			}


    			return finish();


    			function pushRow(row)
    			{
    				data.push(row);
    				lastCursor = cursor;
    			}

    			/**
                 * checks if there are extra spaces after closing quote and given index without any text
                 * if Yes, returns the number of spaces
                 */
    			function extraSpaces(index) {
    				var spaceLength = 0;
    				if (index !== -1) {
    					var textBetweenClosingQuoteAndIndex = input.substring(quoteSearch + 1, index);
    					if (textBetweenClosingQuoteAndIndex && textBetweenClosingQuoteAndIndex.trim() === '') {
    						spaceLength = textBetweenClosingQuoteAndIndex.length;
    					}
    				}
    				return spaceLength;
    			}

    			/**
    			 * Appends the remaining input from cursor to the end into
    			 * row, saves the row, calls step, and returns the results.
    			 */
    			function finish(value)
    			{
    				if (ignoreLastRow)
    					return returnable();
    				if (typeof value === 'undefined')
    					value = input.substring(cursor);
    				row.push(value);
    				cursor = inputLen;	// important in case parsing is paused
    				pushRow(row);
    				if (stepIsFunction)
    					doStep();
    				return returnable();
    			}

    			/**
    			 * Appends the current row to the results. It sets the cursor
    			 * to newCursor and finds the nextNewline. The caller should
    			 * take care to execute user's step function and check for
    			 * preview and end parsing if necessary.
    			 */
    			function saveRow(newCursor)
    			{
    				cursor = newCursor;
    				pushRow(row);
    				row = [];
    				nextNewline = input.indexOf(newline, cursor);
    			}

    			/** Returns an object with the results, errors, and meta. */
    			function returnable(stopped)
    			{
    				return {
    					data: data,
    					errors: errors,
    					meta: {
    						delimiter: delim,
    						linebreak: newline,
    						aborted: aborted,
    						truncated: !!stopped,
    						cursor: lastCursor + (baseIndex || 0)
    					}
    				};
    			}

    			/** Executes the user's step function and resets data & errors. */
    			function doStep()
    			{
    				step(returnable());
    				data = [];
    				errors = [];
    			}
    		};

    		/** Sets the abort flag */
    		this.abort = function()
    		{
    			aborted = true;
    		};

    		/** Gets the cursor position */
    		this.getCharIndex = function()
    		{
    			return cursor;
    		};
    	}


    	function newWorker()
    	{
    		if (!Papa.WORKERS_SUPPORTED)
    			return false;

    		var workerUrl = getWorkerBlob();
    		var w = new global.Worker(workerUrl);
    		w.onmessage = mainThreadReceivedMessage;
    		w.id = workerIdCounter++;
    		workers[w.id] = w;
    		return w;
    	}

    	/** Callback when main thread receives a message */
    	function mainThreadReceivedMessage(e)
    	{
    		var msg = e.data;
    		var worker = workers[msg.workerId];
    		var aborted = false;

    		if (msg.error)
    			worker.userError(msg.error, msg.file);
    		else if (msg.results && msg.results.data)
    		{
    			var abort = function() {
    				aborted = true;
    				completeWorker(msg.workerId, { data: [], errors: [], meta: { aborted: true } });
    			};

    			var handle = {
    				abort: abort,
    				pause: notImplemented,
    				resume: notImplemented
    			};

    			if (isFunction(worker.userStep))
    			{
    				for (var i = 0; i < msg.results.data.length; i++)
    				{
    					worker.userStep({
    						data: msg.results.data[i],
    						errors: msg.results.errors,
    						meta: msg.results.meta
    					}, handle);
    					if (aborted)
    						break;
    				}
    				delete msg.results;	// free memory ASAP
    			}
    			else if (isFunction(worker.userChunk))
    			{
    				worker.userChunk(msg.results, handle, msg.file);
    				delete msg.results;
    			}
    		}

    		if (msg.finished && !aborted)
    			completeWorker(msg.workerId, msg.results);
    	}

    	function completeWorker(workerId, results) {
    		var worker = workers[workerId];
    		if (isFunction(worker.userComplete))
    			worker.userComplete(results);
    		worker.terminate();
    		delete workers[workerId];
    	}

    	function notImplemented() {
    		throw new Error('Not implemented.');
    	}

    	/** Callback when worker thread receives a message */
    	function workerThreadReceivedMessage(e)
    	{
    		var msg = e.data;

    		if (typeof Papa.WORKER_ID === 'undefined' && msg)
    			Papa.WORKER_ID = msg.workerId;

    		if (typeof msg.input === 'string')
    		{
    			global.postMessage({
    				workerId: Papa.WORKER_ID,
    				results: Papa.parse(msg.input, msg.config),
    				finished: true
    			});
    		}
    		else if ((global.File && msg.input instanceof File) || msg.input instanceof Object)	// thank you, Safari (see issue #106)
    		{
    			var results = Papa.parse(msg.input, msg.config);
    			if (results)
    				global.postMessage({
    					workerId: Papa.WORKER_ID,
    					results: results,
    					finished: true
    				});
    		}
    	}

    	/** Makes a deep copy of an array or object (mostly) */
    	function copy(obj)
    	{
    		if (typeof obj !== 'object' || obj === null)
    			return obj;
    		var cpy = Array.isArray(obj) ? [] : {};
    		for (var key in obj)
    			cpy[key] = copy(obj[key]);
    		return cpy;
    	}

    	function bindFunction(f, self)
    	{
    		return function() { f.apply(self, arguments); };
    	}

    	function isFunction(func)
    	{
    		return typeof func === 'function';
    	}

    	return Papa;
    }));
    });

    /* src/readString.svelte generated by Svelte v3.46.4 */

    function readString(str, options) {
    	return papaparse.parse(str, options);
    }

    /* src/jsonToCSV.svelte generated by Svelte v3.46.4 */

    function jsonToCSV(json, options) {
    	return papaparse.unparse(json, options);
    }

    /* src/readRemoteFile.svelte generated by Svelte v3.46.4 */

    function readRemoteFile(url, options) {
    	papaparse.parse(url, Object.assign({}, { download: true }, options));
    }

    /* src/CSVDownloader.svelte generated by Svelte v3.46.4 */

    function add_css(target) {
    	append_styles(target, "svelte-gokig2", ".link.svelte-gokig2{color:blue;text-decoration:underline;cursor:pointer}");
    }

    // (40:0) {:else}
    function create_else_block(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	return {
    		c() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen(button, "click", function () {
    					if (is_function(/*download*/ ctx[4](/*data*/ ctx[0], /*filename*/ ctx[1], /*bom*/ ctx[3]))) /*download*/ ctx[4](/*data*/ ctx[0], /*filename*/ ctx[1], /*bom*/ ctx[3]).apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

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
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (33:0) {#if type === 'link'}
    function create_if_block(ctx) {
    	let span;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	return {
    		c() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr(span, "class", "link svelte-gokig2");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen(span, "click", function () {
    					if (is_function(/*download*/ ctx[4](/*data*/ ctx[0], /*filename*/ ctx[1], /*bom*/ ctx[3]))) /*download*/ ctx[4](/*data*/ ctx[0], /*filename*/ ctx[1], /*bom*/ ctx[3]).apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

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
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[2] === 'link') return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
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
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { data } = $$props;
    	let { filename = 'filename' } = $$props;
    	let { type = 'link' } = $$props;
    	let { bom = 2 } = $$props;

    	function download(data, filename, bom) {
    		const bomCode = bom ? '\ufeff' : '';
    		let csvContent = null;

    		if (typeof data === 'object') {
    			csvContent = papaparse.unparse(data);
    		} else {
    			csvContent = data;
    		}

    		const csvData = new Blob([`${bomCode}${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    		let csvURL = null;

    		if (navigator.msSaveBlob) {
    			csvURL = navigator.msSaveBlob(csvData, `${filename}.csv`);
    		} else {
    			csvURL = window.URL.createObjectURL(csvData);
    		}

    		const link = document.createElement('a');
    		link.href = csvURL;
    		link.setAttribute('download', `${filename}.csv`);
    		link.click();
    		link.remove();
    	}

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('filename' in $$props) $$invalidate(1, filename = $$props.filename);
    		if ('type' in $$props) $$invalidate(2, type = $$props.type);
    		if ('bom' in $$props) $$invalidate(3, bom = $$props.bom);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	return [data, filename, type, bom, download, $$scope, slots];
    }

    class CSVDownloader extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, { data: 0, filename: 1, type: 2, bom: 3 }, add_css);
    	}
    }

    exports.CSVDownloader = CSVDownloader;
    exports.jsonToCSV = jsonToCSV;
    exports.readRemoteFile = readRemoteFile;
    exports.readString = readString;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
