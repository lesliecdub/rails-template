// Local dependency functions and constants
// ________________________________________________________
const CONSTANTS = {
  ADD: 'add',
  REMOVE: 'remove',
  ADD_EVENT_LISTENER: 'addEventListener',
  REMOVE_EVENT_LISTENER: 'removeEventListener'
};

// Accepts a string and returns it with the first letter capitalized
const capitalizeFirstLetter = (string) => {
  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
}

// Gets the current timestamp
const _now = Date.now || function() {
  return new Date().getTime();
}

// Consolidates looping over set of element to add or remove and event listener
const addRemoveEvent = function(action, els, eventName, callback, options) {
  for (let i = els.length - 1; i >= 0; i--) {
    els[i][action](eventName, callback, options);
  }
  return els;
}

// Consolidates looping over set of element to add or remove a class
const addRemoveClass = (action, els, className) => {
  for (let i = els.length - 1; i >= 0; i--) {
    els[i].classList[action](className);
  }
  return els;
}

// Toggles the class or an element
const toggleSingleClass = (el, className) => {
  let { ADD, REMOVE } = CONSTANTS;
  let action = el.classList.contains(className) ? REMOVE : ADD;
  el.classList[action](className);
  return el;
}


// Core Build of exports
// ________________________________________________________


/**
 * Adds an event listener to a selection of elements
 *
 * @param  {DOM Elements} Collection of elements
 * @param  {String} Event type to bind to
 * @param  {Function} Callback to execute when event occurs
 * @param  {Boolean} bindIndex Passes the index to the callback
 * @param  {Object} Options to pass to addEventListener
 * @return {DOM Elements}
 */
const addEvent = (els, eventName, callback, options = {}) => {
  return addRemoveEvent(CONSTANTS.ADD_EVENT_LISTENER, els, eventName, callback, options);
}

/**
 * Removes an event listener to a selection of elements
 *
 * @param  {DOM Elements} Collection of elements
 * @param  {String} Event type to unbind to
 * @param  {Function} Callback to unbind
 * @param  {Boolean} bindIndex Passes the index to the callback
 * @param  {Object} Options to pass to removeEventListener
 * @return {DOM Elements}
 */
const removeEvent = (els, eventName, callback, options = {}) => {
  return addRemoveEvent(CONSTANTS.REMOVE_EVENT_LISTENER, els, eventName, callback, options);
}

/**
 * Adds a class to a set of elements
 *
 * @param  {DOM Elements} Element collection to add a class to
 * @param  {String} Class desired to add
 * @return {DOM Elements}
 */
const addClass = (els, className) => {
  return addRemoveClass(CONSTANTS.ADD, els, className);
}

/**
 * Removes a class from a set of elements
 *
 * @param  {DOM Elements} Element collection to remove class from
 * @param  {String} Class desired to remove
 * @return {DOM Elements}
 */
const removeClass = (els, className) => {
  return addRemoveClass(CONSTANTS.REMOVE, els, className);
}

/**
 * Toggles the class of an element or a collection of DOM elements
 *
 * @param  {DOM Element(s)} Element or collection of elements to toggleClass
 * @param  {String} Class to toggle on each element
 * @return {DOM Elements}
 */
const toggleClass = (els, className) => {
  if (!els.length) {
    toggleSingleClass(els, className);
  } else {
    for (let i = els.length - 1; i >= 0; i--) {
      toggleSingleClass(els[i], className);
    }
  }

  return els;
}

/**
 * Checks if at least one element in a group has a particular class.
 *
 * @param  {DOM Element} els Element or elements to test for class
 * @param  {String} targetClass Class name to check on
 * @return {Boolean} returns true or false
 */
const checkForClass = (els, targetClass) => {
  for (let i = els.length - 1; i >= 0; i--) {
    if (els[i].classList.contains(targetClass)) return true;
  }

  return false;
}

/**
 * Finds the index of an element in a collection of elements.
 * Returns -1 in the event the element is not found.
 *
 * @param  {DOM Elements} Collection of elements to search through
 * @param  {DOM Element} Element to find the index of
 * @return {Integer}
 */
const elementIndex = (els, element) => {
  for (let i = els.length - 1; i >= 0; i--) {
    if (els[i] === element) return i;
  }

  return -1;
  // return [...els].indexOf(element);
  // causes error in IE11: Object doesn't support property or method 'from'
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered.
 * Source: https://davidwalsh.name/javascript-debounce-function (also Underscore.js)
 *
 * @param  {Function} func Function to execute once from a repeated event
 * @param  {Number} wait Triggers the function after N milliseconds
 * @param  {Boolean} immmediate If true, triggers the function on the leading edge instead of the trailing
 * @return {Function}
 */
const debounce = (func, wait, immediate) => {
  let timeout;
  return function() {
    let context = this, args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  }
}

/**
 * Limits the rate of executions for a recurring event.
 * Returns a function, that, when invoked, will only be
 * triggered at most once during a given window of time.
 * Normally, the throttled function will run as much as
 * it can, without ever going more than once per wait
 * duration; but if you’d like to disable the execution
 * on the leading edge, pass {leading: false}. To disable
 * execution on the trailing edge, ditto.
 * Source: http://underscorejs.org/docs/underscore.html
 *
 * @param  {Function} func  Function to execute
 * @param  {Number} wait    Time between executions
 * @param  {Object} options Options to pass to the throttle function
 * @return {Function}       Throttled function
 */
const throttle = (func, wait, options) => {
  let context, args, result;
  let timeout = null;
  let previous = 0;
  if (!options) options = {};
  const later = function() {
    previous = options.leading === false ? 0 : _now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  }
  return function() {
    let now = _now();
    if (!previous && options.leading === false) previous = now;
    let remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  }
}

/**
 * Determines the correct event that corresponds with CSS transitionend or animationend.
 * The argument can only be 'transition' or 'animation'. Returns false if none found.
 *
 * @param  {String} property CSS property to get browser-specific event
 * @return {String}
 */
const getCssEndEvent = (property) => {
  if (property !== 'transition' && property !== 'animation')
    throw 'Property needs to be either transtion or animation';

  let o;
  let el = document.createElement('fakeelement');
  let options = {};
  let capitalizedProperty = capitalizeFirstLetter(property);
  options[`${property}`] = `${property}end`;
  options[`O${capitalizedProperty}`] = `o${capitalizedProperty}End`;
  options[`${capitalizedProperty}`] = `${property}end`;
  options[`${capitalizedProperty}`] = `webkit${capitalizedProperty}End`;

  for (o in options) {
    if (options.hasOwnProperty(o) && el.style[o] !== undefined) {
      return options[o];
    }
  }
  return false;
}

/**
 * Determines the correct CSS prefix for the browser for use such as checking
 * against the windows computed stylesheet. Has only been tested to work
 * with transform but wont abort with others.
 *
 * @param  {String} property Base CSS property
 * @return {String}
 */
const getCssPrefix = (property) => {
  if (property !== 'transform')
    console.warn(`${property} has not been thoroughly tested. If correct, add to the list of verifieds.`)

  let o;
  let el = document.createElement('fakeelement');
  let options = {};
  let capitalizedProperty = capitalizeFirstLetter(property);
  options[`${property}`] = `${property}`;
  options[`O${capitalizedProperty}`] = `o${capitalizedProperty}`;
  options[`${capitalizedProperty}`] = `${property}`;
  options[`${capitalizedProperty}`] = `webkit${capitalizedProperty}`;

  for (o in options) {
    if (options.hasOwnProperty(o) && el.style[o] !== undefined) {
      return options[o];
    }
  }
  return false;
}

/**
 * Traverses up the DOM tree to find a parent element by checking the
 * id/classList of the parentElement against the targetSelector. Returns -1
 * if none found.
 *
 * @param  {DOM Element} startElement Starting element to start the search from
 * @param  {String} targetSelector Id/Class name to find the parentElement by.
 *                  Be sure to use '#' or '.' at the beginning.
 * @return {DOM Element} Found parent element
 */
const findParentElement = (startElement, targetSelector) => {
  let parentElement = startElement.parentElement;
  let type = targetSelector.charAt(0);
  let name = targetSelector.slice(1);

  if (type !== '#' && type !== '.') {
    throw 'targetSelector needs to start with a "#" or "."'
  }

  if (!parentElement) {
    return -1;
  } else {
    if (type === '#' && parentElement.id === name ||
        type === '.' && parentElement.classList.contains(name)) {
      return parentElement;
    }
  }

  return findParentElement(parentElement, targetSelector);
}

/**
 * Checks browser and returns true is IE 11
 *
 * @return {Boolean}
 */
const isIE11 = () => {
  return !(window.ActiveXObject) && "ActiveXObject" in window ? true : false;
}

/**
 * Checks if the device is an android device
 *
 * @return {Boolean}
 */
const isAndroid = () => {
  return navigator.userAgent.match(/Android/i) ? true : false;
}

/**
 * Creates a JS controller with our typical rails pattern. All arguments are optional
 * but it would be useless if there weren't any. Options will eventually
 * include potential callbacks to execute at different points of the
 * controller lifecycle
 *
 * @param  {Object} modules           Collection of modules (optional)
 * @param  {Object} windowLoadModules Collection of modules to execute on windowLoad (optional)
 * @param  {Object} options           Various callbacks to execute throughout lifecycle
 * @return {Object}                   Publicly exposed functions
 */
const controller = (
  modules = {}
  // windowLoadModules = {},
  // options = {}
) => {
  let props = {
    isEnabled: false,
    // isWindowLoadEnabled: false,
    modules: modules,
    // windowLoadModules: windowLoadModules
  };

  // Verify options are passed correctly and combine with default options
  // options = Object.assign({}, {
  //   onCreation: () => {},
  //   onInit: () => {},
  //   onWindowLoadInit: () => {},
  //   onEnable: () => {},
  //   onDisable: () => {}
  // }, options);

  // options.onCreation();

  // const mergeModules = () => { return Object.assign({}, props.modules, props.windowLoadModules); }

  const initModuleSet = (moduleGroup) => {
    for (let module in props[moduleGroup]) {
      if (props[moduleGroup].hasOwnProperty(module)) {
        // check if module is a function which means it hasn't been created
        // since modules return an object, they become objects with methods
        if (!props[moduleGroup][module].init) props[moduleGroup][module] = props[moduleGroup][module]();
        props[moduleGroup][module].init();
      }
    }

    return;
  }

  const init = () => {
    // options.onInit();
    enable();
    return;
  }

  // const initWindowLoad = () => {
  //   initModuleSet('windowLoadModules');
  //   options.onWindowLoadInit();
  //   props.isWindowLoadEnabled = true;
  //   return;
  // }

  const enable = () => {
    if (props.isEnabled) return;

    initModuleSet('modules');

    // options.onEnable();

    props.isEnabled = true;

    return;
  }

  const disable = () => {
    if (!props.isEnabled) return;

    for (let module in props.modules) {
      if (props.modules.hasOwnProperty(module)) {
        props.modules[module].disable();
      }
    }

    // if (props.isWindowLoadEnabled) {
    //   for (let module in props.windowLoadModules) {
    //     if (props.windowLoadModules.hasOwnProperty(module)) {
    //       props.windowLoadModules[module].disable();
    //     }
    //   }
    // }

    // options.onDisable();

    props.isEnabled = false;
    // props.isWindowLoadEnabled = false;

    return;
  }

  return {
    init,
    // initWindowLoad,
    enable,
    disable,
    modules: props.modules
    // modules: mergeModules
  };
}

/**
 * Checks if the browser event listener supports the passive option, a newer feature
 *
 * @return {Boolean}
 */
const supportsPassive = () => {
  let supportPassive = false;
  // create options object with a getter to see if its passive property is accessed
  let opts = Object.defineProperty && Object.defineProperty({}, 'passive', { get: function(){ supportPassive = true }});
  // create a throwaway element & event and (synchronously) test out our options
  document.addEventListener('test', function() {}, opts);
  return supportPassive;
}

export {
  addEvent,
  removeEvent,
  addClass,
  removeClass,
  toggleClass,
  toggleSingleClass,
  checkForClass,
  elementIndex,
  debounce,
  throttle,
  getCssEndEvent,
  getCssPrefix,
  findParentElement,
  capitalizeFirstLetter,
  controller,
  isIE11,
  isAndroid,
  supportsPassive,
  _now
};
