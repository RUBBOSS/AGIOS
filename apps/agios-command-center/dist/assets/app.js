// node_modules/d3-dispatch/src/dispatch.js
var noop = { value: () => {
} };
function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}
function Dispatch(_) {
  this._ = _;
}
function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return { type: t, name };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._, T = parseTypenames(typename + "", _), t, i = -1, n = T.length;
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
      return;
    }
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type2, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type2)) throw new Error("unknown type: " + type2);
    for (t = this._[type2], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type2, that, args) {
    if (!this._.hasOwnProperty(type2)) throw new Error("unknown type: " + type2);
    for (var t = this._[type2], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};
function get(type2, name) {
  for (var i = 0, n = type2.length, c2; i < n; ++i) {
    if ((c2 = type2[i]).name === name) {
      return c2.value;
    }
  }
}
function set(type2, name, callback) {
  for (var i = 0, n = type2.length; i < n; ++i) {
    if (type2[i].name === name) {
      type2[i] = noop, type2 = type2.slice(0, i).concat(type2.slice(i + 1));
      break;
    }
  }
  if (callback != null) type2.push({ name, value: callback });
  return type2;
}
var dispatch_default = dispatch;

// node_modules/d3-selection/src/namespaces.js
var xhtml = "http://www.w3.org/1999/xhtml";
var namespaces_default = {
  svg: "http://www.w3.org/2000/svg",
  xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

// node_modules/d3-selection/src/namespace.js
function namespace_default(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces_default.hasOwnProperty(prefix) ? { space: namespaces_default[prefix], local: name } : name;
}

// node_modules/d3-selection/src/creator.js
function creatorInherit(name) {
  return function() {
    var document2 = this.ownerDocument, uri = this.namespaceURI;
    return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator_default(name) {
  var fullname = namespace_default(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}

// node_modules/d3-selection/src/selector.js
function none() {
}
function selector_default(selector) {
  return selector == null ? none : function() {
    return this.querySelector(selector);
  };
}

// node_modules/d3-selection/src/selection/select.js
function select_default(select) {
  if (typeof select !== "function") select = selector_default(select);
  for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection(subgroups, this._parents);
}

// node_modules/d3-selection/src/array.js
function array(x3) {
  return x3 == null ? [] : Array.isArray(x3) ? x3 : Array.from(x3);
}

// node_modules/d3-selection/src/selectorAll.js
function empty() {
  return [];
}
function selectorAll_default(selector) {
  return selector == null ? empty : function() {
    return this.querySelectorAll(selector);
  };
}

// node_modules/d3-selection/src/selection/selectAll.js
function arrayAll(select) {
  return function() {
    return array(select.apply(this, arguments));
  };
}
function selectAll_default(select) {
  if (typeof select === "function") select = arrayAll(select);
  else select = selectorAll_default(select);
  for (var groups = this._groups, m2 = groups.length, subgroups = [], parents = [], j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new Selection(subgroups, parents);
}

// node_modules/d3-selection/src/matcher.js
function matcher_default(selector) {
  return function() {
    return this.matches(selector);
  };
}
function childMatcher(selector) {
  return function(node) {
    return node.matches(selector);
  };
}

// node_modules/d3-selection/src/selection/selectChild.js
var find = Array.prototype.find;
function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selectChild_default(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}

// node_modules/d3-selection/src/selection/selectChildren.js
var filter = Array.prototype.filter;
function children() {
  return Array.from(this.children);
}
function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}
function selectChildren_default(match) {
  return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}

// node_modules/d3-selection/src/selection/filter.js
function filter_default(match) {
  if (typeof match !== "function") match = matcher_default(match);
  for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection(subgroups, this._parents);
}

// node_modules/d3-selection/src/selection/sparse.js
function sparse_default(update) {
  return new Array(update.length);
}

// node_modules/d3-selection/src/selection/enter.js
function enter_default() {
  return new Selection(this._enter || this._groups.map(sparse_default), this._parents);
}
function EnterNode(parent, datum2) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum2;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function(child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function(selector) {
    return this._parent.querySelector(selector);
  },
  querySelectorAll: function(selector) {
    return this._parent.querySelectorAll(selector);
  }
};

// node_modules/d3-selection/src/constant.js
function constant_default(x3) {
  return function() {
    return x3;
  };
}

// node_modules/d3-selection/src/selection/data.js
function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0, node, groupLength = group.length, dataLength = data.length;
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function data_default(value, key) {
  if (!arguments.length) return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
  if (typeof value !== "function") value = constant_default(value);
  for (var m2 = groups.length, update = new Array(m2), enter = new Array(m2), exit = new Array(m2), j = 0; j < m2; ++j) {
    var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength) ;
        previous._next = next || null;
      }
    }
  }
  update = new Selection(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}
function arraylike(data) {
  return typeof data === "object" && "length" in data ? data : Array.from(data);
}

// node_modules/d3-selection/src/selection/exit.js
function exit_default() {
  return new Selection(this._exit || this._groups.map(sparse_default), this._parents);
}

// node_modules/d3-selection/src/selection/join.js
function join_default(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter) enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update) update = update.selection();
  }
  if (onexit == null) exit.remove();
  else onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}

// node_modules/d3-selection/src/selection/merge.js
function merge_default(context) {
  var selection2 = context.selection ? context.selection() : context;
  for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m2 = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m2; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Selection(merges, this._parents);
}

// node_modules/d3-selection/src/selection/order.js
function order_default() {
  for (var groups = this._groups, j = -1, m2 = groups.length; ++j < m2; ) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}

// node_modules/d3-selection/src/selection/sort.js
function sort_default(compare) {
  if (!compare) compare = ascending;
  function compareNode(a2, b) {
    return a2 && b ? compare(a2.__data__, b.__data__) : !a2 - !b;
  }
  for (var groups = this._groups, m2 = groups.length, sortgroups = new Array(m2), j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection(sortgroups, this._parents).order();
}
function ascending(a2, b) {
  return a2 < b ? -1 : a2 > b ? 1 : a2 >= b ? 0 : NaN;
}

// node_modules/d3-selection/src/selection/call.js
function call_default() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}

// node_modules/d3-selection/src/selection/nodes.js
function nodes_default() {
  return Array.from(this);
}

// node_modules/d3-selection/src/selection/node.js
function node_default() {
  for (var groups = this._groups, j = 0, m2 = groups.length; j < m2; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }
  return null;
}

// node_modules/d3-selection/src/selection/size.js
function size_default() {
  let size = 0;
  for (const node of this) ++size;
  return size;
}

// node_modules/d3-selection/src/selection/empty.js
function empty_default() {
  return !this.node();
}

// node_modules/d3-selection/src/selection/each.js
function each_default(callback) {
  for (var groups = this._groups, j = 0, m2 = groups.length; j < m2; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}

// node_modules/d3-selection/src/selection/attr.js
function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}
function attrConstantNS(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);
    else this.setAttribute(name, v);
  };
}
function attrFunctionNS(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function attr_default(name, value) {
  var fullname = namespace_default(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
}

// node_modules/d3-selection/src/window.js
function window_default(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}

// node_modules/d3-selection/src/selection/style.js
function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);
    else this.style.setProperty(name, v, priority);
  };
}
function style_default(name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || window_default(node).getComputedStyle(node, null).getPropertyValue(name);
}

// node_modules/d3-selection/src/selection/property.js
function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];
    else this[name] = v;
  };
}
function property_default(name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}

// node_modules/d3-selection/src/selection/classed.js
function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.remove(names[i]);
}
function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function classed_default(name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}

// node_modules/d3-selection/src/selection/text.js
function textRemove() {
  this.textContent = "";
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function text_default(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
}

// node_modules/d3-selection/src/selection/html.js
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function html_default(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}

// node_modules/d3-selection/src/selection/raise.js
function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}
function raise_default() {
  return this.each(raise);
}

// node_modules/d3-selection/src/selection/lower.js
function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function lower_default() {
  return this.each(lower);
}

// node_modules/d3-selection/src/selection/append.js
function append_default(name) {
  var create2 = typeof name === "function" ? name : creator_default(name);
  return this.select(function() {
    return this.appendChild(create2.apply(this, arguments));
  });
}

// node_modules/d3-selection/src/selection/insert.js
function constantNull() {
  return null;
}
function insert_default(name, before) {
  var create2 = typeof name === "function" ? name : creator_default(name), select = before == null ? constantNull : typeof before === "function" ? before : selector_default(before);
  return this.select(function() {
    return this.insertBefore(create2.apply(this, arguments), select.apply(this, arguments) || null);
  });
}

// node_modules/d3-selection/src/selection/remove.js
function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}
function remove_default() {
  return this.each(remove);
}

// node_modules/d3-selection/src/selection/clone.js
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function clone_default(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}

// node_modules/d3-selection/src/selection/datum.js
function datum_default(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}

// node_modules/d3-selection/src/selection/on.js
function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}
function parseTypenames2(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return { type: t, name };
  });
}
function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m2 = on.length, o; j < m2; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;
    else delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on) for (var j = 0, m2 = on.length; j < m2; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
        this.addEventListener(o.type, o.listener = listener, o.options = options);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, options);
    o = { type: typename.type, name: typename.name, value, listener, options };
    if (!on) this.__on = [o];
    else on.push(o);
  };
}
function on_default(typename, value, options) {
  var typenames = parseTypenames2(typename + ""), i, n = typenames.length, t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m2 = on.length, o; j < m2; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }
  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
  return this;
}

// node_modules/d3-selection/src/selection/dispatch.js
function dispatchEvent(node, type2, params) {
  var window2 = window_default(node), event = window2.CustomEvent;
  if (typeof event === "function") {
    event = new event(type2, params);
  } else {
    event = window2.document.createEvent("Event");
    if (params) event.initEvent(type2, params.bubbles, params.cancelable), event.detail = params.detail;
    else event.initEvent(type2, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type2, params) {
  return function() {
    return dispatchEvent(this, type2, params);
  };
}
function dispatchFunction(type2, params) {
  return function() {
    return dispatchEvent(this, type2, params.apply(this, arguments));
  };
}
function dispatch_default2(type2, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type2, params));
}

// node_modules/d3-selection/src/selection/iterator.js
function* iterator_default() {
  for (var groups = this._groups, j = 0, m2 = groups.length; j < m2; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) yield node;
    }
  }
}

// node_modules/d3-selection/src/selection/index.js
var root = [null];
function Selection(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection() {
  return new Selection([[document.documentElement]], root);
}
function selection_selection() {
  return this;
}
Selection.prototype = selection.prototype = {
  constructor: Selection,
  select: select_default,
  selectAll: selectAll_default,
  selectChild: selectChild_default,
  selectChildren: selectChildren_default,
  filter: filter_default,
  data: data_default,
  enter: enter_default,
  exit: exit_default,
  join: join_default,
  merge: merge_default,
  selection: selection_selection,
  order: order_default,
  sort: sort_default,
  call: call_default,
  nodes: nodes_default,
  node: node_default,
  size: size_default,
  empty: empty_default,
  each: each_default,
  attr: attr_default,
  style: style_default,
  property: property_default,
  classed: classed_default,
  text: text_default,
  html: html_default,
  raise: raise_default,
  lower: lower_default,
  append: append_default,
  insert: insert_default,
  remove: remove_default,
  clone: clone_default,
  datum: datum_default,
  on: on_default,
  dispatch: dispatch_default2,
  [Symbol.iterator]: iterator_default
};
var selection_default = selection;

// node_modules/d3-selection/src/select.js
function select_default2(selector) {
  return typeof selector === "string" ? new Selection([[document.querySelector(selector)]], [document.documentElement]) : new Selection([[selector]], root);
}

// node_modules/d3-selection/src/sourceEvent.js
function sourceEvent_default(event) {
  let sourceEvent;
  while (sourceEvent = event.sourceEvent) event = sourceEvent;
  return event;
}

// node_modules/d3-selection/src/pointer.js
function pointer_default(event, node) {
  event = sourceEvent_default(event);
  if (node === void 0) node = event.currentTarget;
  if (node) {
    var svg = node.ownerSVGElement || node;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }
    if (node.getBoundingClientRect) {
      var rect = node.getBoundingClientRect();
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    }
  }
  return [event.pageX, event.pageY];
}

// node_modules/d3-drag/src/noevent.js
var nonpassive = { passive: false };
var nonpassivecapture = { capture: true, passive: false };
function nopropagation(event) {
  event.stopImmediatePropagation();
}
function noevent_default(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

// node_modules/d3-drag/src/nodrag.js
function nodrag_default(view) {
  var root2 = view.document.documentElement, selection2 = select_default2(view).on("dragstart.drag", noevent_default, nonpassivecapture);
  if ("onselectstart" in root2) {
    selection2.on("selectstart.drag", noevent_default, nonpassivecapture);
  } else {
    root2.__noselect = root2.style.MozUserSelect;
    root2.style.MozUserSelect = "none";
  }
}
function yesdrag(view, noclick) {
  var root2 = view.document.documentElement, selection2 = select_default2(view).on("dragstart.drag", null);
  if (noclick) {
    selection2.on("click.drag", noevent_default, nonpassivecapture);
    setTimeout(function() {
      selection2.on("click.drag", null);
    }, 0);
  }
  if ("onselectstart" in root2) {
    selection2.on("selectstart.drag", null);
  } else {
    root2.style.MozUserSelect = root2.__noselect;
    delete root2.__noselect;
  }
}

// node_modules/d3-drag/src/constant.js
var constant_default2 = (x3) => () => x3;

// node_modules/d3-drag/src/event.js
function DragEvent(type2, {
  sourceEvent,
  subject,
  target,
  identifier,
  active,
  x: x3,
  y: y3,
  dx,
  dy,
  dispatch: dispatch2
}) {
  Object.defineProperties(this, {
    type: { value: type2, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent, enumerable: true, configurable: true },
    subject: { value: subject, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    identifier: { value: identifier, enumerable: true, configurable: true },
    active: { value: active, enumerable: true, configurable: true },
    x: { value: x3, enumerable: true, configurable: true },
    y: { value: y3, enumerable: true, configurable: true },
    dx: { value: dx, enumerable: true, configurable: true },
    dy: { value: dy, enumerable: true, configurable: true },
    _: { value: dispatch2 }
  });
}
DragEvent.prototype.on = function() {
  var value = this._.on.apply(this._, arguments);
  return value === this._ ? this : value;
};

// node_modules/d3-drag/src/drag.js
function defaultFilter(event) {
  return !event.ctrlKey && !event.button;
}
function defaultContainer() {
  return this.parentNode;
}
function defaultSubject(event, d) {
  return d == null ? { x: event.x, y: event.y } : d;
}
function defaultTouchable() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function drag_default() {
  var filter2 = defaultFilter, container = defaultContainer, subject = defaultSubject, touchable = defaultTouchable, gestures = {}, listeners = dispatch_default("start", "drag", "end"), active = 0, mousedownx, mousedowny, mousemoving, touchending, clickDistance2 = 0;
  function drag(selection2) {
    selection2.on("mousedown.drag", mousedowned).filter(touchable).on("touchstart.drag", touchstarted).on("touchmove.drag", touchmoved, nonpassive).on("touchend.drag touchcancel.drag", touchended).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function mousedowned(event, d) {
    if (touchending || !filter2.call(this, event, d)) return;
    var gesture = beforestart(this, container.call(this, event, d), event, d, "mouse");
    if (!gesture) return;
    select_default2(event.view).on("mousemove.drag", mousemoved, nonpassivecapture).on("mouseup.drag", mouseupped, nonpassivecapture);
    nodrag_default(event.view);
    nopropagation(event);
    mousemoving = false;
    mousedownx = event.clientX;
    mousedowny = event.clientY;
    gesture("start", event);
  }
  function mousemoved(event) {
    noevent_default(event);
    if (!mousemoving) {
      var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
      mousemoving = dx * dx + dy * dy > clickDistance2;
    }
    gestures.mouse("drag", event);
  }
  function mouseupped(event) {
    select_default2(event.view).on("mousemove.drag mouseup.drag", null);
    yesdrag(event.view, mousemoving);
    noevent_default(event);
    gestures.mouse("end", event);
  }
  function touchstarted(event, d) {
    if (!filter2.call(this, event, d)) return;
    var touches = event.changedTouches, c2 = container.call(this, event, d), n = touches.length, i, gesture;
    for (i = 0; i < n; ++i) {
      if (gesture = beforestart(this, c2, event, d, touches[i].identifier, touches[i])) {
        nopropagation(event);
        gesture("start", event, touches[i]);
      }
    }
  }
  function touchmoved(event) {
    var touches = event.changedTouches, n = touches.length, i, gesture;
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        noevent_default(event);
        gesture("drag", event, touches[i]);
      }
    }
  }
  function touchended(event) {
    var touches = event.changedTouches, n = touches.length, i, gesture;
    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() {
      touchending = null;
    }, 500);
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        nopropagation(event);
        gesture("end", event, touches[i]);
      }
    }
  }
  function beforestart(that, container2, event, d, identifier, touch) {
    var dispatch2 = listeners.copy(), p = pointer_default(touch || event, container2), dx, dy, s;
    if ((s = subject.call(that, new DragEvent("beforestart", {
      sourceEvent: event,
      target: drag,
      identifier,
      active,
      x: p[0],
      y: p[1],
      dx: 0,
      dy: 0,
      dispatch: dispatch2
    }), d)) == null) return;
    dx = s.x - p[0] || 0;
    dy = s.y - p[1] || 0;
    return function gesture(type2, event2, touch2) {
      var p0 = p, n;
      switch (type2) {
        case "start":
          gestures[identifier] = gesture, n = active++;
          break;
        case "end":
          delete gestures[identifier], --active;
        case "drag":
          p = pointer_default(touch2 || event2, container2), n = active;
          break;
      }
      dispatch2.call(
        type2,
        that,
        new DragEvent(type2, {
          sourceEvent: event2,
          subject: s,
          target: drag,
          identifier,
          active: n,
          x: p[0] + dx,
          y: p[1] + dy,
          dx: p[0] - p0[0],
          dy: p[1] - p0[1],
          dispatch: dispatch2
        }),
        d
      );
    };
  }
  drag.filter = function(_) {
    return arguments.length ? (filter2 = typeof _ === "function" ? _ : constant_default2(!!_), drag) : filter2;
  };
  drag.container = function(_) {
    return arguments.length ? (container = typeof _ === "function" ? _ : constant_default2(_), drag) : container;
  };
  drag.subject = function(_) {
    return arguments.length ? (subject = typeof _ === "function" ? _ : constant_default2(_), drag) : subject;
  };
  drag.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant_default2(!!_), drag) : touchable;
  };
  drag.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? drag : value;
  };
  drag.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, drag) : Math.sqrt(clickDistance2);
  };
  return drag;
}

// node_modules/d3-color/src/define.js
function define_default(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

// node_modules/d3-color/src/color.js
function Color() {
}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*";
var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
var reHex = /^#([0-9a-f]{3,8})$/;
var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
define_default(Color, color, {
  copy(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHex8() {
  return this.rgb().formatHex8();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format) {
  var m2, l;
  format = (format + "").trim().toLowerCase();
  return (m2 = reHex.exec(format)) ? (l = m2[1].length, m2 = parseInt(m2[1], 16), l === 6 ? rgbn(m2) : l === 3 ? new Rgb(m2 >> 8 & 15 | m2 >> 4 & 240, m2 >> 4 & 15 | m2 & 240, (m2 & 15) << 4 | m2 & 15, 1) : l === 8 ? rgba(m2 >> 24 & 255, m2 >> 16 & 255, m2 >> 8 & 255, (m2 & 255) / 255) : l === 4 ? rgba(m2 >> 12 & 15 | m2 >> 8 & 240, m2 >> 8 & 15 | m2 >> 4 & 240, m2 >> 4 & 15 | m2 & 240, ((m2 & 15) << 4 | m2 & 15) / 255) : null) : (m2 = reRgbInteger.exec(format)) ? new Rgb(m2[1], m2[2], m2[3], 1) : (m2 = reRgbPercent.exec(format)) ? new Rgb(m2[1] * 255 / 100, m2[2] * 255 / 100, m2[3] * 255 / 100, 1) : (m2 = reRgbaInteger.exec(format)) ? rgba(m2[1], m2[2], m2[3], m2[4]) : (m2 = reRgbaPercent.exec(format)) ? rgba(m2[1] * 255 / 100, m2[2] * 255 / 100, m2[3] * 255 / 100, m2[4]) : (m2 = reHslPercent.exec(format)) ? hsla(m2[1], m2[2] / 100, m2[3] / 100, 1) : (m2 = reHslaPercent.exec(format)) ? hsla(m2[1], m2[2] / 100, m2[3] / 100, m2[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a2) {
  if (a2 <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a2);
}
function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}
define_default(Rgb, rgb, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
  const a2 = clampa(this.opacity);
  return `${a2 === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a2 === 1 ? ")" : `, ${a2})`}`;
}
function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s, l, a2) {
  if (a2 <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a2);
}
function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl();
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, min2 = Math.min(r, g, b), max2 = Math.max(r, g, b), h = NaN, s = max2 - min2, l = (max2 + min2) / 2;
  if (s) {
    if (r === max2) h = (g - b) / s + (g < b) * 6;
    else if (g === max2) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max2 + min2 : 2 - max2 - min2;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}
function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}
define_default(Hsl, hsl, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl() {
    const a2 = clampa(this.opacity);
    return `${a2 === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a2 === 1 ? ")" : `, ${a2})`}`;
  }
}));
function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}
function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}

// node_modules/d3-interpolate/src/basis.js
function basis(t1, v0, v1, v2, v3) {
  var t2 = t1 * t1, t3 = t2 * t1;
  return ((1 - 3 * t1 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
}
function basis_default(values) {
  var n = values.length - 1;
  return function(t) {
    var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

// node_modules/d3-interpolate/src/basisClosed.js
function basisClosed_default(values) {
  var n = values.length;
  return function(t) {
    var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

// node_modules/d3-interpolate/src/constant.js
var constant_default3 = (x3) => () => x3;

// node_modules/d3-interpolate/src/color.js
function linear(a2, d) {
  return function(t) {
    return a2 + t * d;
  };
}
function exponential(a2, b, y3) {
  return a2 = Math.pow(a2, y3), b = Math.pow(b, y3) - a2, y3 = 1 / y3, function(t) {
    return Math.pow(a2 + t * b, y3);
  };
}
function gamma(y3) {
  return (y3 = +y3) === 1 ? nogamma : function(a2, b) {
    return b - a2 ? exponential(a2, b, y3) : constant_default3(isNaN(a2) ? b : a2);
  };
}
function nogamma(a2, b) {
  var d = b - a2;
  return d ? linear(a2, d) : constant_default3(isNaN(a2) ? b : a2);
}

// node_modules/d3-interpolate/src/rgb.js
var rgb_default = function rgbGamma(y3) {
  var color2 = gamma(y3);
  function rgb2(start2, end) {
    var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
    return function(t) {
      start2.r = r(t);
      start2.g = g(t);
      start2.b = b(t);
      start2.opacity = opacity(t);
      return start2 + "";
    };
  }
  rgb2.gamma = rgbGamma;
  return rgb2;
}(1);
function rgbSpline(spline) {
  return function(colors) {
    var n = colors.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color2;
    for (i = 0; i < n; ++i) {
      color2 = rgb(colors[i]);
      r[i] = color2.r || 0;
      g[i] = color2.g || 0;
      b[i] = color2.b || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    color2.opacity = 1;
    return function(t) {
      color2.r = r(t);
      color2.g = g(t);
      color2.b = b(t);
      return color2 + "";
    };
  };
}
var rgbBasis = rgbSpline(basis_default);
var rgbBasisClosed = rgbSpline(basisClosed_default);

// node_modules/d3-interpolate/src/number.js
function number_default(a2, b) {
  return a2 = +a2, b = +b, function(t) {
    return a2 * (1 - t) + b * t;
  };
}

// node_modules/d3-interpolate/src/string.js
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
var reB = new RegExp(reA.source, "g");
function zero(b) {
  return function() {
    return b;
  };
}
function one(b) {
  return function(t) {
    return b(t) + "";
  };
}
function string_default(a2, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
  a2 = a2 + "", b = b + "";
  while ((am = reA.exec(a2)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs;
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      if (s[i]) s[i] += bm;
      else s[++i] = bm;
    } else {
      s[++i] = null;
      q.push({ i, x: number_default(am, bm) });
    }
    bi = reB.lastIndex;
  }
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs;
    else s[++i] = bs;
  }
  return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
    for (var i2 = 0, o; i2 < b; ++i2) s[(o = q[i2]).i] = o.x(t);
    return s.join("");
  });
}

// node_modules/d3-interpolate/src/transform/decompose.js
var degrees = 180 / Math.PI;
var identity = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function decompose_default(a2, b, c2, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a2 * a2 + b * b)) a2 /= scaleX, b /= scaleX;
  if (skewX = a2 * c2 + b * d) c2 -= a2 * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c2 * c2 + d * d)) c2 /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a2 * d < b * c2) a2 = -a2, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a2) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX,
    scaleY
  };
}

// node_modules/d3-interpolate/src/transform/parse.js
var svgNode;
function parseCss(value) {
  const m2 = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m2.isIdentity ? identity : decompose_default(m2.a, m2.b, m2.c, m2.d, m2.e, m2.f);
}
function parseSvg(value) {
  if (value == null) return identity;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
  value = value.matrix;
  return decompose_default(value.a, value.b, value.c, value.d, value.e, value.f);
}

// node_modules/d3-interpolate/src/transform/index.js
function interpolateTransform(parse, pxComma, pxParen, degParen) {
  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a2, b, s, q) {
    if (a2 !== b) {
      if (a2 - b > 180) b += 360;
      else if (b - a2 > 180) a2 += 360;
      q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number_default(a2, b) });
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }
  function skewX(a2, b, s, q) {
    if (a2 !== b) {
      q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number_default(a2, b) });
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function(a2, b) {
    var s = [], q = [];
    a2 = parse(a2), b = parse(b);
    translate(a2.translateX, a2.translateY, b.translateX, b.translateY, s, q);
    rotate(a2.rotate, b.rotate, s, q);
    skewX(a2.skewX, b.skewX, s, q);
    scale(a2.scaleX, a2.scaleY, b.scaleX, b.scaleY, s, q);
    a2 = b = null;
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

// node_modules/d3-interpolate/src/zoom.js
var epsilon2 = 1e-12;
function cosh(x3) {
  return ((x3 = Math.exp(x3)) + 1 / x3) / 2;
}
function sinh(x3) {
  return ((x3 = Math.exp(x3)) - 1 / x3) / 2;
}
function tanh(x3) {
  return ((x3 = Math.exp(2 * x3)) - 1) / (x3 + 1);
}
var zoom_default = function zoomRho(rho, rho2, rho4) {
  function zoom(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(rho * t * S)
        ];
      };
    } else {
      var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1), b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s = t * S, coshr0 = cosh(r0), u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0)
        ];
      };
    }
    i.duration = S * 1e3 * rho / Math.SQRT2;
    return i;
  }
  zoom.rho = function(_) {
    var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
    return zoomRho(_1, _2, _4);
  };
  return zoom;
}(Math.SQRT2, 2, 4);

// node_modules/d3-timer/src/timer.js
var frame = 0;
var timeout = 0;
var interval = 0;
var pokeDelay = 1e3;
var taskHead;
var taskTail;
var clockLast = 0;
var clockNow = 0;
var clockSkew = 0;
var clock = typeof performance === "object" && performance.now ? performance : Date;
var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
  setTimeout(f, 17);
};
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;
      else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time) {
  var t = new Timer();
  t.restart(callback, delay, time);
  return t;
}
function timerFlush() {
  now();
  ++frame;
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call.call(void 0, e);
    t = t._next;
  }
  --frame;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now2 = clock.now(), delay = now2 - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now2;
}
function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}
function sleep(time) {
  if (frame) return;
  if (timeout) timeout = clearTimeout(timeout);
  var delay = time - clockNow;
  if (delay > 24) {
    if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}

// node_modules/d3-timer/src/timeout.js
function timeout_default(callback, delay, time) {
  var t = new Timer();
  delay = delay == null ? 0 : +delay;
  t.restart((elapsed) => {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
}

// node_modules/d3-transition/src/transition/schedule.js
var emptyOn = dispatch_default("start", "end", "cancel", "interrupt");
var emptyTween = [];
var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;
function schedule_default(node, name, id2, index2, group, timing) {
  var schedules = node.__transition;
  if (!schedules) node.__transition = {};
  else if (id2 in schedules) return;
  create(node, id2, {
    name,
    index: index2,
    // For context during callback.
    group,
    // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}
function init(node, id2) {
  var schedule = get2(node, id2);
  if (schedule.state > CREATED) throw new Error("too late; already scheduled");
  return schedule;
}
function set2(node, id2) {
  var schedule = get2(node, id2);
  if (schedule.state > STARTED) throw new Error("too late; already running");
  return schedule;
}
function get2(node, id2) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id2])) throw new Error("transition not found");
  return schedule;
}
function create(node, id2, self) {
  var schedules = node.__transition, tween;
  schedules[id2] = self;
  self.timer = timer(schedule, 0, self.time);
  function schedule(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start2, self.delay, self.time);
    if (self.delay <= elapsed) start2(elapsed - self.delay);
  }
  function start2(elapsed) {
    var i, j, n, o;
    if (self.state !== SCHEDULED) return stop();
    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name) continue;
      if (o.state === STARTED) return timeout_default(start2);
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      } else if (+i < id2) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }
    timeout_default(function() {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick2, self.delay, self.time);
        tick2(elapsed);
      }
    });
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING) return;
    self.state = STARTED;
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }
  function tick2(elapsed) {
    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1), i = -1, n = tween.length;
    while (++i < n) {
      tween[i].call(node, t);
    }
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }
  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id2];
    for (var i in schedules) return;
    delete node.__transition;
  }
}

// node_modules/d3-transition/src/interrupt.js
function interrupt_default(node, name) {
  var schedules = node.__transition, schedule, active, empty2 = true, i;
  if (!schedules) return;
  name = name == null ? null : name + "";
  for (i in schedules) {
    if ((schedule = schedules[i]).name !== name) {
      empty2 = false;
      continue;
    }
    active = schedule.state > STARTING && schedule.state < ENDING;
    schedule.state = ENDED;
    schedule.timer.stop();
    schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
    delete schedules[i];
  }
  if (empty2) delete node.__transition;
}

// node_modules/d3-transition/src/selection/interrupt.js
function interrupt_default2(name) {
  return this.each(function() {
    interrupt_default(this, name);
  });
}

// node_modules/d3-transition/src/transition/tween.js
function tweenRemove(id2, name) {
  var tween0, tween1;
  return function() {
    var schedule = set2(this, id2), tween = schedule.tween;
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }
    schedule.tween = tween1;
  };
}
function tweenFunction(id2, name, value) {
  var tween0, tween1;
  if (typeof value !== "function") throw new Error();
  return function() {
    var schedule = set2(this, id2), tween = schedule.tween;
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n) tween1.push(t);
    }
    schedule.tween = tween1;
  };
}
function tween_default(name, value) {
  var id2 = this._id;
  name += "";
  if (arguments.length < 2) {
    var tween = get2(this.node(), id2).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }
  return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
}
function tweenValue(transition2, name, value) {
  var id2 = transition2._id;
  transition2.each(function() {
    var schedule = set2(this, id2);
    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
  });
  return function(node) {
    return get2(node, id2).value[name];
  };
}

// node_modules/d3-transition/src/transition/interpolate.js
function interpolate_default(a2, b) {
  var c2;
  return (typeof b === "number" ? number_default : b instanceof color ? rgb_default : (c2 = color(b)) ? (b = c2, rgb_default) : string_default)(a2, b);
}

// node_modules/d3-transition/src/transition/attr.js
function attrRemove2(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS2(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant2(name, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function attrConstantNS2(fullname, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function attrFunction2(name, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function attrFunctionNS2(fullname, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function attr_default2(name, value) {
  var fullname = namespace_default(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate_default;
  return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS2 : attrFunction2)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS2 : attrRemove2)(fullname) : (fullname.local ? attrConstantNS2 : attrConstant2)(fullname, i, value));
}

// node_modules/d3-transition/src/transition/attrTween.js
function attrInterpolate(name, i) {
  return function(t) {
    this.setAttribute(name, i.call(this, t));
  };
}
function attrInterpolateNS(fullname, i) {
  return function(t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}
function attrTweenNS(fullname, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function attrTween(name, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function attrTween_default(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  var fullname = namespace_default(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}

// node_modules/d3-transition/src/transition/delay.js
function delayFunction(id2, value) {
  return function() {
    init(this, id2).delay = +value.apply(this, arguments);
  };
}
function delayConstant(id2, value) {
  return value = +value, function() {
    init(this, id2).delay = value;
  };
}
function delay_default(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get2(this.node(), id2).delay;
}

// node_modules/d3-transition/src/transition/duration.js
function durationFunction(id2, value) {
  return function() {
    set2(this, id2).duration = +value.apply(this, arguments);
  };
}
function durationConstant(id2, value) {
  return value = +value, function() {
    set2(this, id2).duration = value;
  };
}
function duration_default(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get2(this.node(), id2).duration;
}

// node_modules/d3-transition/src/transition/ease.js
function easeConstant(id2, value) {
  if (typeof value !== "function") throw new Error();
  return function() {
    set2(this, id2).ease = value;
  };
}
function ease_default(value) {
  var id2 = this._id;
  return arguments.length ? this.each(easeConstant(id2, value)) : get2(this.node(), id2).ease;
}

// node_modules/d3-transition/src/transition/easeVarying.js
function easeVarying(id2, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (typeof v !== "function") throw new Error();
    set2(this, id2).ease = v;
  };
}
function easeVarying_default(value) {
  if (typeof value !== "function") throw new Error();
  return this.each(easeVarying(this._id, value));
}

// node_modules/d3-transition/src/transition/filter.js
function filter_default2(match) {
  if (typeof match !== "function") match = matcher_default(match);
  for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Transition(subgroups, this._parents, this._name, this._id);
}

// node_modules/d3-transition/src/transition/merge.js
function merge_default2(transition2) {
  if (transition2._id !== this._id) throw new Error();
  for (var groups0 = this._groups, groups1 = transition2._groups, m0 = groups0.length, m1 = groups1.length, m2 = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m2; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Transition(merges, this._parents, this._name, this._id);
}

// node_modules/d3-transition/src/transition/on.js
function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0) t = t.slice(0, i);
    return !t || t === "start";
  });
}
function onFunction(id2, name, listener) {
  var on0, on1, sit = start(name) ? init : set2;
  return function() {
    var schedule = sit(this, id2), on = schedule.on;
    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
    schedule.on = on1;
  };
}
function on_default2(name, listener) {
  var id2 = this._id;
  return arguments.length < 2 ? get2(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
}

// node_modules/d3-transition/src/transition/remove.js
function removeFunction(id2) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition) if (+i !== id2) return;
    if (parent) parent.removeChild(this);
  };
}
function remove_default2() {
  return this.on("end.remove", removeFunction(this._id));
}

// node_modules/d3-transition/src/transition/select.js
function select_default3(select) {
  var name = this._name, id2 = this._id;
  if (typeof select !== "function") select = selector_default(select);
  for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule_default(subgroup[i], name, id2, i, subgroup, get2(node, id2));
      }
    }
  }
  return new Transition(subgroups, this._parents, name, id2);
}

// node_modules/d3-transition/src/transition/selectAll.js
function selectAll_default2(select) {
  var name = this._name, id2 = this._id;
  if (typeof select !== "function") select = selectorAll_default(select);
  for (var groups = this._groups, m2 = groups.length, subgroups = [], parents = [], j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children2 = select.call(node, node.__data__, i, group), child, inherit2 = get2(node, id2), k = 0, l = children2.length; k < l; ++k) {
          if (child = children2[k]) {
            schedule_default(child, name, id2, k, children2, inherit2);
          }
        }
        subgroups.push(children2);
        parents.push(node);
      }
    }
  }
  return new Transition(subgroups, parents, name, id2);
}

// node_modules/d3-transition/src/transition/selection.js
var Selection2 = selection_default.prototype.constructor;
function selection_default2() {
  return new Selection2(this._groups, this._parents);
}

// node_modules/d3-transition/src/transition/style.js
function styleNull(name, interpolate) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
  };
}
function styleRemove2(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant2(name, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function styleFunction2(name, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
    if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function styleMaybeRemove(id2, name) {
  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
  return function() {
    var schedule = set2(this, id2), on = schedule.on, listener = schedule.value[key] == null ? remove2 || (remove2 = styleRemove2(name)) : void 0;
    if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
    schedule.on = on1;
  };
}
function style_default2(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate_default;
  return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove2(name)) : typeof value === "function" ? this.styleTween(name, styleFunction2(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant2(name, i, value), priority).on("end.style." + name, null);
}

// node_modules/d3-transition/src/transition/styleTween.js
function styleInterpolate(name, i, priority) {
  return function(t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}
function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}
function styleTween_default(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}

// node_modules/d3-transition/src/transition/text.js
function textConstant2(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction2(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}
function text_default2(value) {
  return this.tween("text", typeof value === "function" ? textFunction2(tweenValue(this, "text", value)) : textConstant2(value == null ? "" : value + ""));
}

// node_modules/d3-transition/src/transition/textTween.js
function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}
function textTween(value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function textTween_default(value) {
  var key = "text";
  if (arguments.length < 1) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, textTween(value));
}

// node_modules/d3-transition/src/transition/transition.js
function transition_default() {
  var name = this._name, id0 = this._id, id1 = newId();
  for (var groups = this._groups, m2 = groups.length, j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit2 = get2(node, id0);
        schedule_default(node, name, id1, i, group, {
          time: inherit2.time + inherit2.delay + inherit2.duration,
          delay: 0,
          duration: inherit2.duration,
          ease: inherit2.ease
        });
      }
    }
  }
  return new Transition(groups, this._parents, name, id1);
}

// node_modules/d3-transition/src/transition/end.js
function end_default() {
  var on0, on1, that = this, id2 = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = { value: reject }, end = { value: function() {
      if (--size === 0) resolve();
    } };
    that.each(function() {
      var schedule = set2(this, id2), on = schedule.on;
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }
      schedule.on = on1;
    });
    if (size === 0) resolve();
  });
}

// node_modules/d3-transition/src/transition/index.js
var id = 0;
function Transition(groups, parents, name, id2) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id2;
}
function transition(name) {
  return selection_default().transition(name);
}
function newId() {
  return ++id;
}
var selection_prototype = selection_default.prototype;
Transition.prototype = transition.prototype = {
  constructor: Transition,
  select: select_default3,
  selectAll: selectAll_default2,
  selectChild: selection_prototype.selectChild,
  selectChildren: selection_prototype.selectChildren,
  filter: filter_default2,
  merge: merge_default2,
  selection: selection_default2,
  transition: transition_default,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: on_default2,
  attr: attr_default2,
  attrTween: attrTween_default,
  style: style_default2,
  styleTween: styleTween_default,
  text: text_default2,
  textTween: textTween_default,
  remove: remove_default2,
  tween: tween_default,
  delay: delay_default,
  duration: duration_default,
  ease: ease_default,
  easeVarying: easeVarying_default,
  end: end_default,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};

// node_modules/d3-ease/src/cubic.js
function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}

// node_modules/d3-transition/src/selection/transition.js
var defaultTiming = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};
function inherit(node, id2) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id2])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id2} not found`);
    }
  }
  return timing;
}
function transition_default2(name) {
  var id2, timing;
  if (name instanceof Transition) {
    id2 = name._id, name = name._name;
  } else {
    id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }
  for (var groups = this._groups, m2 = groups.length, j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule_default(node, name, id2, i, group, timing || inherit(node, id2));
      }
    }
  }
  return new Transition(groups, this._parents, name, id2);
}

// node_modules/d3-transition/src/selection/index.js
selection_default.prototype.interrupt = interrupt_default2;
selection_default.prototype.transition = transition_default2;

// node_modules/d3-brush/src/brush.js
var { abs, max, min } = Math;
function number1(e) {
  return [+e[0], +e[1]];
}
function number2(e) {
  return [number1(e[0]), number1(e[1])];
}
var X = {
  name: "x",
  handles: ["w", "e"].map(type),
  input: function(x3, e) {
    return x3 == null ? null : [[+x3[0], e[0][1]], [+x3[1], e[1][1]]];
  },
  output: function(xy) {
    return xy && [xy[0][0], xy[1][0]];
  }
};
var Y = {
  name: "y",
  handles: ["n", "s"].map(type),
  input: function(y3, e) {
    return y3 == null ? null : [[e[0][0], +y3[0]], [e[1][0], +y3[1]]];
  },
  output: function(xy) {
    return xy && [xy[0][1], xy[1][1]];
  }
};
var XY = {
  name: "xy",
  handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
  input: function(xy) {
    return xy == null ? null : number2(xy);
  },
  output: function(xy) {
    return xy;
  }
};
function type(t) {
  return { type: t };
}

// node_modules/d3-force/src/center.js
function center_default(x3, y3) {
  var nodes, strength = 1;
  if (x3 == null) x3 = 0;
  if (y3 == null) y3 = 0;
  function force() {
    var i, n = nodes.length, node, sx = 0, sy = 0;
    for (i = 0; i < n; ++i) {
      node = nodes[i], sx += node.x, sy += node.y;
    }
    for (sx = (sx / n - x3) * strength, sy = (sy / n - y3) * strength, i = 0; i < n; ++i) {
      node = nodes[i], node.x -= sx, node.y -= sy;
    }
  }
  force.initialize = function(_) {
    nodes = _;
  };
  force.x = function(_) {
    return arguments.length ? (x3 = +_, force) : x3;
  };
  force.y = function(_) {
    return arguments.length ? (y3 = +_, force) : y3;
  };
  force.strength = function(_) {
    return arguments.length ? (strength = +_, force) : strength;
  };
  return force;
}

// node_modules/d3-quadtree/src/add.js
function add_default(d) {
  const x3 = +this._x.call(null, d), y3 = +this._y.call(null, d);
  return add(this.cover(x3, y3), x3, y3, d);
}
function add(tree, x3, y3, d) {
  if (isNaN(x3) || isNaN(y3)) return tree;
  var parent, node = tree._root, leaf = { data: d }, x0 = tree._x0, y0 = tree._y0, x1 = tree._x1, y1 = tree._y1, xm, ym, xp, yp, right, bottom, i, j;
  if (!node) return tree._root = leaf, tree;
  while (node.length) {
    if (right = x3 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y3 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
    if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
  }
  xp = +tree._x.call(null, node.data);
  yp = +tree._y.call(null, node.data);
  if (x3 === xp && y3 === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;
  do {
    parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
    if (right = x3 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y3 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
  } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | xp >= xm));
  return parent[j] = node, parent[i] = leaf, tree;
}
function addAll(data) {
  var d, i, n = data.length, x3, y3, xz = new Array(n), yz = new Array(n), x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (i = 0; i < n; ++i) {
    if (isNaN(x3 = +this._x.call(null, d = data[i])) || isNaN(y3 = +this._y.call(null, d))) continue;
    xz[i] = x3;
    yz[i] = y3;
    if (x3 < x0) x0 = x3;
    if (x3 > x1) x1 = x3;
    if (y3 < y0) y0 = y3;
    if (y3 > y1) y1 = y3;
  }
  if (x0 > x1 || y0 > y1) return this;
  this.cover(x0, y0).cover(x1, y1);
  for (i = 0; i < n; ++i) {
    add(this, xz[i], yz[i], data[i]);
  }
  return this;
}

// node_modules/d3-quadtree/src/cover.js
function cover_default(x3, y3) {
  if (isNaN(x3 = +x3) || isNaN(y3 = +y3)) return this;
  var x0 = this._x0, y0 = this._y0, x1 = this._x1, y1 = this._y1;
  if (isNaN(x0)) {
    x1 = (x0 = Math.floor(x3)) + 1;
    y1 = (y0 = Math.floor(y3)) + 1;
  } else {
    var z = x1 - x0 || 1, node = this._root, parent, i;
    while (x0 > x3 || x3 >= x1 || y0 > y3 || y3 >= y1) {
      i = (y3 < y0) << 1 | x3 < x0;
      parent = new Array(4), parent[i] = node, node = parent, z *= 2;
      switch (i) {
        case 0:
          x1 = x0 + z, y1 = y0 + z;
          break;
        case 1:
          x0 = x1 - z, y1 = y0 + z;
          break;
        case 2:
          x1 = x0 + z, y0 = y1 - z;
          break;
        case 3:
          x0 = x1 - z, y0 = y1 - z;
          break;
      }
    }
    if (this._root && this._root.length) this._root = node;
  }
  this._x0 = x0;
  this._y0 = y0;
  this._x1 = x1;
  this._y1 = y1;
  return this;
}

// node_modules/d3-quadtree/src/data.js
function data_default2() {
  var data = [];
  this.visit(function(node) {
    if (!node.length) do
      data.push(node.data);
    while (node = node.next);
  });
  return data;
}

// node_modules/d3-quadtree/src/extent.js
function extent_default(_) {
  return arguments.length ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0], [this._x1, this._y1]];
}

// node_modules/d3-quadtree/src/quad.js
function quad_default(node, x0, y0, x1, y1) {
  this.node = node;
  this.x0 = x0;
  this.y0 = y0;
  this.x1 = x1;
  this.y1 = y1;
}

// node_modules/d3-quadtree/src/find.js
function find_default(x3, y3, radius) {
  var data, x0 = this._x0, y0 = this._y0, x1, y1, x22, y22, x32 = this._x1, y32 = this._y1, quads = [], node = this._root, q, i;
  if (node) quads.push(new quad_default(node, x0, y0, x32, y32));
  if (radius == null) radius = Infinity;
  else {
    x0 = x3 - radius, y0 = y3 - radius;
    x32 = x3 + radius, y32 = y3 + radius;
    radius *= radius;
  }
  while (q = quads.pop()) {
    if (!(node = q.node) || (x1 = q.x0) > x32 || (y1 = q.y0) > y32 || (x22 = q.x1) < x0 || (y22 = q.y1) < y0) continue;
    if (node.length) {
      var xm = (x1 + x22) / 2, ym = (y1 + y22) / 2;
      quads.push(
        new quad_default(node[3], xm, ym, x22, y22),
        new quad_default(node[2], x1, ym, xm, y22),
        new quad_default(node[1], xm, y1, x22, ym),
        new quad_default(node[0], x1, y1, xm, ym)
      );
      if (i = (y3 >= ym) << 1 | x3 >= xm) {
        q = quads[quads.length - 1];
        quads[quads.length - 1] = quads[quads.length - 1 - i];
        quads[quads.length - 1 - i] = q;
      }
    } else {
      var dx = x3 - +this._x.call(null, node.data), dy = y3 - +this._y.call(null, node.data), d2 = dx * dx + dy * dy;
      if (d2 < radius) {
        var d = Math.sqrt(radius = d2);
        x0 = x3 - d, y0 = y3 - d;
        x32 = x3 + d, y32 = y3 + d;
        data = node.data;
      }
    }
  }
  return data;
}

// node_modules/d3-quadtree/src/remove.js
function remove_default3(d) {
  if (isNaN(x3 = +this._x.call(null, d)) || isNaN(y3 = +this._y.call(null, d))) return this;
  var parent, node = this._root, retainer, previous, next, x0 = this._x0, y0 = this._y0, x1 = this._x1, y1 = this._y1, x3, y3, xm, ym, right, bottom, i, j;
  if (!node) return this;
  if (node.length) while (true) {
    if (right = x3 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y3 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
    if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
    if (!node.length) break;
    if (parent[i + 1 & 3] || parent[i + 2 & 3] || parent[i + 3 & 3]) retainer = parent, j = i;
  }
  while (node.data !== d) if (!(previous = node, node = node.next)) return this;
  if (next = node.next) delete node.next;
  if (previous) return next ? previous.next = next : delete previous.next, this;
  if (!parent) return this._root = next, this;
  next ? parent[i] = next : delete parent[i];
  if ((node = parent[0] || parent[1] || parent[2] || parent[3]) && node === (parent[3] || parent[2] || parent[1] || parent[0]) && !node.length) {
    if (retainer) retainer[j] = node;
    else this._root = node;
  }
  return this;
}
function removeAll(data) {
  for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
  return this;
}

// node_modules/d3-quadtree/src/root.js
function root_default() {
  return this._root;
}

// node_modules/d3-quadtree/src/size.js
function size_default2() {
  var size = 0;
  this.visit(function(node) {
    if (!node.length) do
      ++size;
    while (node = node.next);
  });
  return size;
}

// node_modules/d3-quadtree/src/visit.js
function visit_default(callback) {
  var quads = [], q, node = this._root, child, x0, y0, x1, y1;
  if (node) quads.push(new quad_default(node, this._x0, this._y0, this._x1, this._y1));
  while (q = quads.pop()) {
    if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
      var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
      if (child = node[3]) quads.push(new quad_default(child, xm, ym, x1, y1));
      if (child = node[2]) quads.push(new quad_default(child, x0, ym, xm, y1));
      if (child = node[1]) quads.push(new quad_default(child, xm, y0, x1, ym));
      if (child = node[0]) quads.push(new quad_default(child, x0, y0, xm, ym));
    }
  }
  return this;
}

// node_modules/d3-quadtree/src/visitAfter.js
function visitAfter_default(callback) {
  var quads = [], next = [], q;
  if (this._root) quads.push(new quad_default(this._root, this._x0, this._y0, this._x1, this._y1));
  while (q = quads.pop()) {
    var node = q.node;
    if (node.length) {
      var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
      if (child = node[0]) quads.push(new quad_default(child, x0, y0, xm, ym));
      if (child = node[1]) quads.push(new quad_default(child, xm, y0, x1, ym));
      if (child = node[2]) quads.push(new quad_default(child, x0, ym, xm, y1));
      if (child = node[3]) quads.push(new quad_default(child, xm, ym, x1, y1));
    }
    next.push(q);
  }
  while (q = next.pop()) {
    callback(q.node, q.x0, q.y0, q.x1, q.y1);
  }
  return this;
}

// node_modules/d3-quadtree/src/x.js
function defaultX(d) {
  return d[0];
}
function x_default(_) {
  return arguments.length ? (this._x = _, this) : this._x;
}

// node_modules/d3-quadtree/src/y.js
function defaultY(d) {
  return d[1];
}
function y_default(_) {
  return arguments.length ? (this._y = _, this) : this._y;
}

// node_modules/d3-quadtree/src/quadtree.js
function quadtree(nodes, x3, y3) {
  var tree = new Quadtree(x3 == null ? defaultX : x3, y3 == null ? defaultY : y3, NaN, NaN, NaN, NaN);
  return nodes == null ? tree : tree.addAll(nodes);
}
function Quadtree(x3, y3, x0, y0, x1, y1) {
  this._x = x3;
  this._y = y3;
  this._x0 = x0;
  this._y0 = y0;
  this._x1 = x1;
  this._y1 = y1;
  this._root = void 0;
}
function leaf_copy(leaf) {
  var copy = { data: leaf.data }, next = copy;
  while (leaf = leaf.next) next = next.next = { data: leaf.data };
  return copy;
}
var treeProto = quadtree.prototype = Quadtree.prototype;
treeProto.copy = function() {
  var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1), node = this._root, nodes, child;
  if (!node) return copy;
  if (!node.length) return copy._root = leaf_copy(node), copy;
  nodes = [{ source: node, target: copy._root = new Array(4) }];
  while (node = nodes.pop()) {
    for (var i = 0; i < 4; ++i) {
      if (child = node.source[i]) {
        if (child.length) nodes.push({ source: child, target: node.target[i] = new Array(4) });
        else node.target[i] = leaf_copy(child);
      }
    }
  }
  return copy;
};
treeProto.add = add_default;
treeProto.addAll = addAll;
treeProto.cover = cover_default;
treeProto.data = data_default2;
treeProto.extent = extent_default;
treeProto.find = find_default;
treeProto.remove = remove_default3;
treeProto.removeAll = removeAll;
treeProto.root = root_default;
treeProto.size = size_default2;
treeProto.visit = visit_default;
treeProto.visitAfter = visitAfter_default;
treeProto.x = x_default;
treeProto.y = y_default;

// node_modules/d3-force/src/constant.js
function constant_default5(x3) {
  return function() {
    return x3;
  };
}

// node_modules/d3-force/src/jiggle.js
function jiggle_default(random) {
  return (random() - 0.5) * 1e-6;
}

// node_modules/d3-force/src/collide.js
function x(d) {
  return d.x + d.vx;
}
function y(d) {
  return d.y + d.vy;
}
function collide_default(radius) {
  var nodes, radii, random, strength = 1, iterations = 1;
  if (typeof radius !== "function") radius = constant_default5(radius == null ? 1 : +radius);
  function force() {
    var i, n = nodes.length, tree, node, xi, yi, ri, ri2;
    for (var k = 0; k < iterations; ++k) {
      tree = quadtree(nodes, x, y).visitAfter(prepare);
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        ri = radii[node.index], ri2 = ri * ri;
        xi = node.x + node.vx;
        yi = node.y + node.vy;
        tree.visit(apply);
      }
    }
    function apply(quad, x0, y0, x1, y1) {
      var data = quad.data, rj = quad.r, r = ri + rj;
      if (data) {
        if (data.index > node.index) {
          var x3 = xi - data.x - data.vx, y3 = yi - data.y - data.vy, l = x3 * x3 + y3 * y3;
          if (l < r * r) {
            if (x3 === 0) x3 = jiggle_default(random), l += x3 * x3;
            if (y3 === 0) y3 = jiggle_default(random), l += y3 * y3;
            l = (r - (l = Math.sqrt(l))) / l * strength;
            node.vx += (x3 *= l) * (r = (rj *= rj) / (ri2 + rj));
            node.vy += (y3 *= l) * r;
            data.vx -= x3 * (r = 1 - r);
            data.vy -= y3 * r;
          }
        }
        return;
      }
      return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
    }
  }
  function prepare(quad) {
    if (quad.data) return quad.r = radii[quad.data.index];
    for (var i = quad.r = 0; i < 4; ++i) {
      if (quad[i] && quad[i].r > quad.r) {
        quad.r = quad[i].r;
      }
    }
  }
  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length, node;
    radii = new Array(n);
    for (i = 0; i < n; ++i) node = nodes[i], radii[node.index] = +radius(node, i, nodes);
  }
  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };
  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };
  force.strength = function(_) {
    return arguments.length ? (strength = +_, force) : strength;
  };
  force.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant_default5(+_), initialize(), force) : radius;
  };
  return force;
}

// node_modules/d3-force/src/link.js
function index(d) {
  return d.index;
}
function find2(nodeById, nodeId) {
  var node = nodeById.get(nodeId);
  if (!node) throw new Error("node not found: " + nodeId);
  return node;
}
function link_default(links) {
  var id2 = index, strength = defaultStrength, strengths, distance = constant_default5(30), distances, nodes, count, bias, random, iterations = 1;
  if (links == null) links = [];
  function defaultStrength(link) {
    return 1 / Math.min(count[link.source.index], count[link.target.index]);
  }
  function force(alpha) {
    for (var k = 0, n = links.length; k < iterations; ++k) {
      for (var i = 0, link, source, target, x3, y3, l, b; i < n; ++i) {
        link = links[i], source = link.source, target = link.target;
        x3 = target.x + target.vx - source.x - source.vx || jiggle_default(random);
        y3 = target.y + target.vy - source.y - source.vy || jiggle_default(random);
        l = Math.sqrt(x3 * x3 + y3 * y3);
        l = (l - distances[i]) / l * alpha * strengths[i];
        x3 *= l, y3 *= l;
        target.vx -= x3 * (b = bias[i]);
        target.vy -= y3 * b;
        source.vx += x3 * (b = 1 - b);
        source.vy += y3 * b;
      }
    }
  }
  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length, m2 = links.length, nodeById = new Map(nodes.map((d, i2) => [id2(d, i2, nodes), d])), link;
    for (i = 0, count = new Array(n); i < m2; ++i) {
      link = links[i], link.index = i;
      if (typeof link.source !== "object") link.source = find2(nodeById, link.source);
      if (typeof link.target !== "object") link.target = find2(nodeById, link.target);
      count[link.source.index] = (count[link.source.index] || 0) + 1;
      count[link.target.index] = (count[link.target.index] || 0) + 1;
    }
    for (i = 0, bias = new Array(m2); i < m2; ++i) {
      link = links[i], bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
    }
    strengths = new Array(m2), initializeStrength();
    distances = new Array(m2), initializeDistance();
  }
  function initializeStrength() {
    if (!nodes) return;
    for (var i = 0, n = links.length; i < n; ++i) {
      strengths[i] = +strength(links[i], i, links);
    }
  }
  function initializeDistance() {
    if (!nodes) return;
    for (var i = 0, n = links.length; i < n; ++i) {
      distances[i] = +distance(links[i], i, links);
    }
  }
  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };
  force.links = function(_) {
    return arguments.length ? (links = _, initialize(), force) : links;
  };
  force.id = function(_) {
    return arguments.length ? (id2 = _, force) : id2;
  };
  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };
  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant_default5(+_), initializeStrength(), force) : strength;
  };
  force.distance = function(_) {
    return arguments.length ? (distance = typeof _ === "function" ? _ : constant_default5(+_), initializeDistance(), force) : distance;
  };
  return force;
}

// node_modules/d3-force/src/lcg.js
var a = 1664525;
var c = 1013904223;
var m = 4294967296;
function lcg_default() {
  let s = 1;
  return () => (s = (a * s + c) % m) / m;
}

// node_modules/d3-force/src/simulation.js
function x2(d) {
  return d.x;
}
function y2(d) {
  return d.y;
}
var initialRadius = 10;
var initialAngle = Math.PI * (3 - Math.sqrt(5));
function simulation_default(nodes) {
  var simulation, alpha = 1, alphaMin = 1e-3, alphaDecay = 1 - Math.pow(alphaMin, 1 / 300), alphaTarget = 0, velocityDecay = 0.6, forces = /* @__PURE__ */ new Map(), stepper = timer(step), event = dispatch_default("tick", "end"), random = lcg_default();
  if (nodes == null) nodes = [];
  function step() {
    tick2();
    event.call("tick", simulation);
    if (alpha < alphaMin) {
      stepper.stop();
      event.call("end", simulation);
    }
  }
  function tick2(iterations) {
    var i, n = nodes.length, node;
    if (iterations === void 0) iterations = 1;
    for (var k = 0; k < iterations; ++k) {
      alpha += (alphaTarget - alpha) * alphaDecay;
      forces.forEach(function(force) {
        force(alpha);
      });
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        if (node.fx == null) node.x += node.vx *= velocityDecay;
        else node.x = node.fx, node.vx = 0;
        if (node.fy == null) node.y += node.vy *= velocityDecay;
        else node.y = node.fy, node.vy = 0;
      }
    }
    return simulation;
  }
  function initializeNodes() {
    for (var i = 0, n = nodes.length, node; i < n; ++i) {
      node = nodes[i], node.index = i;
      if (node.fx != null) node.x = node.fx;
      if (node.fy != null) node.y = node.fy;
      if (isNaN(node.x) || isNaN(node.y)) {
        var radius = initialRadius * Math.sqrt(0.5 + i), angle = i * initialAngle;
        node.x = radius * Math.cos(angle);
        node.y = radius * Math.sin(angle);
      }
      if (isNaN(node.vx) || isNaN(node.vy)) {
        node.vx = node.vy = 0;
      }
    }
  }
  function initializeForce(force) {
    if (force.initialize) force.initialize(nodes, random);
    return force;
  }
  initializeNodes();
  return simulation = {
    tick: tick2,
    restart: function() {
      return stepper.restart(step), simulation;
    },
    stop: function() {
      return stepper.stop(), simulation;
    },
    nodes: function(_) {
      return arguments.length ? (nodes = _, initializeNodes(), forces.forEach(initializeForce), simulation) : nodes;
    },
    alpha: function(_) {
      return arguments.length ? (alpha = +_, simulation) : alpha;
    },
    alphaMin: function(_) {
      return arguments.length ? (alphaMin = +_, simulation) : alphaMin;
    },
    alphaDecay: function(_) {
      return arguments.length ? (alphaDecay = +_, simulation) : +alphaDecay;
    },
    alphaTarget: function(_) {
      return arguments.length ? (alphaTarget = +_, simulation) : alphaTarget;
    },
    velocityDecay: function(_) {
      return arguments.length ? (velocityDecay = 1 - _, simulation) : 1 - velocityDecay;
    },
    randomSource: function(_) {
      return arguments.length ? (random = _, forces.forEach(initializeForce), simulation) : random;
    },
    force: function(name, _) {
      return arguments.length > 1 ? (_ == null ? forces.delete(name) : forces.set(name, initializeForce(_)), simulation) : forces.get(name);
    },
    find: function(x3, y3, radius) {
      var i = 0, n = nodes.length, dx, dy, d2, node, closest;
      if (radius == null) radius = Infinity;
      else radius *= radius;
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        dx = x3 - node.x;
        dy = y3 - node.y;
        d2 = dx * dx + dy * dy;
        if (d2 < radius) closest = node, radius = d2;
      }
      return closest;
    },
    on: function(name, _) {
      return arguments.length > 1 ? (event.on(name, _), simulation) : event.on(name);
    }
  };
}

// node_modules/d3-force/src/manyBody.js
function manyBody_default() {
  var nodes, node, random, alpha, strength = constant_default5(-30), strengths, distanceMin2 = 1, distanceMax2 = Infinity, theta2 = 0.81;
  function force(_) {
    var i, n = nodes.length, tree = quadtree(nodes, x2, y2).visitAfter(accumulate);
    for (alpha = _, i = 0; i < n; ++i) node = nodes[i], tree.visit(apply);
  }
  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length, node2;
    strengths = new Array(n);
    for (i = 0; i < n; ++i) node2 = nodes[i], strengths[node2.index] = +strength(node2, i, nodes);
  }
  function accumulate(quad) {
    var strength2 = 0, q, c2, weight = 0, x3, y3, i;
    if (quad.length) {
      for (x3 = y3 = i = 0; i < 4; ++i) {
        if ((q = quad[i]) && (c2 = Math.abs(q.value))) {
          strength2 += q.value, weight += c2, x3 += c2 * q.x, y3 += c2 * q.y;
        }
      }
      quad.x = x3 / weight;
      quad.y = y3 / weight;
    } else {
      q = quad;
      q.x = q.data.x;
      q.y = q.data.y;
      do
        strength2 += strengths[q.data.index];
      while (q = q.next);
    }
    quad.value = strength2;
  }
  function apply(quad, x1, _, x22) {
    if (!quad.value) return true;
    var x3 = quad.x - node.x, y3 = quad.y - node.y, w = x22 - x1, l = x3 * x3 + y3 * y3;
    if (w * w / theta2 < l) {
      if (l < distanceMax2) {
        if (x3 === 0) x3 = jiggle_default(random), l += x3 * x3;
        if (y3 === 0) y3 = jiggle_default(random), l += y3 * y3;
        if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
        node.vx += x3 * quad.value * alpha / l;
        node.vy += y3 * quad.value * alpha / l;
      }
      return true;
    } else if (quad.length || l >= distanceMax2) return;
    if (quad.data !== node || quad.next) {
      if (x3 === 0) x3 = jiggle_default(random), l += x3 * x3;
      if (y3 === 0) y3 = jiggle_default(random), l += y3 * y3;
      if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
    }
    do
      if (quad.data !== node) {
        w = strengths[quad.data.index] * alpha / l;
        node.vx += x3 * w;
        node.vy += y3 * w;
      }
    while (quad = quad.next);
  }
  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };
  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant_default5(+_), initialize(), force) : strength;
  };
  force.distanceMin = function(_) {
    return arguments.length ? (distanceMin2 = _ * _, force) : Math.sqrt(distanceMin2);
  };
  force.distanceMax = function(_) {
    return arguments.length ? (distanceMax2 = _ * _, force) : Math.sqrt(distanceMax2);
  };
  force.theta = function(_) {
    return arguments.length ? (theta2 = _ * _, force) : Math.sqrt(theta2);
  };
  return force;
}

// node_modules/d3-zoom/src/constant.js
var constant_default6 = (x3) => () => x3;

// node_modules/d3-zoom/src/event.js
function ZoomEvent(type2, {
  sourceEvent,
  target,
  transform: transform2,
  dispatch: dispatch2
}) {
  Object.defineProperties(this, {
    type: { value: type2, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    transform: { value: transform2, enumerable: true, configurable: true },
    _: { value: dispatch2 }
  });
}

// node_modules/d3-zoom/src/transform.js
function Transform(k, x3, y3) {
  this.k = k;
  this.x = x3;
  this.y = y3;
}
Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x3, y3) {
    return x3 === 0 & y3 === 0 ? this : new Transform(this.k, this.x + this.k * x3, this.y + this.k * y3);
  },
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function(x3) {
    return x3 * this.k + this.x;
  },
  applyY: function(y3) {
    return y3 * this.k + this.y;
  },
  invert: function(location2) {
    return [(location2[0] - this.x) / this.k, (location2[1] - this.y) / this.k];
  },
  invertX: function(x3) {
    return (x3 - this.x) / this.k;
  },
  invertY: function(y3) {
    return (y3 - this.y) / this.k;
  },
  rescaleX: function(x3) {
    return x3.copy().domain(x3.range().map(this.invertX, this).map(x3.invert, x3));
  },
  rescaleY: function(y3) {
    return y3.copy().domain(y3.range().map(this.invertY, this).map(y3.invert, y3));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var identity2 = new Transform(1, 0, 0);
transform.prototype = Transform.prototype;
function transform(node) {
  while (!node.__zoom) if (!(node = node.parentNode)) return identity2;
  return node.__zoom;
}

// node_modules/d3-zoom/src/noevent.js
function nopropagation3(event) {
  event.stopImmediatePropagation();
}
function noevent_default3(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

// node_modules/d3-zoom/src/zoom.js
function defaultFilter2(event) {
  return (!event.ctrlKey || event.type === "wheel") && !event.button;
}
function defaultExtent() {
  var e = this;
  if (e instanceof SVGElement) {
    e = e.ownerSVGElement || e;
    if (e.hasAttribute("viewBox")) {
      e = e.viewBox.baseVal;
      return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
    }
    return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
  }
  return [[0, 0], [e.clientWidth, e.clientHeight]];
}
function defaultTransform() {
  return this.__zoom || identity2;
}
function defaultWheelDelta(event) {
  return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 2e-3) * (event.ctrlKey ? 10 : 1);
}
function defaultTouchable2() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function defaultConstrain(transform2, extent, translateExtent) {
  var dx0 = transform2.invertX(extent[0][0]) - translateExtent[0][0], dx1 = transform2.invertX(extent[1][0]) - translateExtent[1][0], dy0 = transform2.invertY(extent[0][1]) - translateExtent[0][1], dy1 = transform2.invertY(extent[1][1]) - translateExtent[1][1];
  return transform2.translate(
    dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
    dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
  );
}
function zoom_default2() {
  var filter2 = defaultFilter2, extent = defaultExtent, constrain = defaultConstrain, wheelDelta = defaultWheelDelta, touchable = defaultTouchable2, scaleExtent = [0, Infinity], translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]], duration = 250, interpolate = zoom_default, listeners = dispatch_default("start", "zoom", "end"), touchstarting, touchfirst, touchending, touchDelay = 500, wheelDelay = 150, clickDistance2 = 0, tapDistance = 10;
  function zoom(selection2) {
    selection2.property("__zoom", defaultTransform).on("wheel.zoom", wheeled, { passive: false }).on("mousedown.zoom", mousedowned).on("dblclick.zoom", dblclicked).filter(touchable).on("touchstart.zoom", touchstarted).on("touchmove.zoom", touchmoved).on("touchend.zoom touchcancel.zoom", touchended).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  zoom.transform = function(collection, transform2, point, event) {
    var selection2 = collection.selection ? collection.selection() : collection;
    selection2.property("__zoom", defaultTransform);
    if (collection !== selection2) {
      schedule(collection, transform2, point, event);
    } else {
      selection2.interrupt().each(function() {
        gesture(this, arguments).event(event).start().zoom(null, typeof transform2 === "function" ? transform2.apply(this, arguments) : transform2).end();
      });
    }
  };
  zoom.scaleBy = function(selection2, k, p, event) {
    zoom.scaleTo(selection2, function() {
      var k0 = this.__zoom.k, k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return k0 * k1;
    }, p, event);
  };
  zoom.scaleTo = function(selection2, k, p, event) {
    zoom.transform(selection2, function() {
      var e = extent.apply(this, arguments), t0 = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p, p1 = t0.invert(p0), k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
    }, p, event);
  };
  zoom.translateBy = function(selection2, x3, y3, event) {
    zoom.transform(selection2, function() {
      return constrain(this.__zoom.translate(
        typeof x3 === "function" ? x3.apply(this, arguments) : x3,
        typeof y3 === "function" ? y3.apply(this, arguments) : y3
      ), extent.apply(this, arguments), translateExtent);
    }, null, event);
  };
  zoom.translateTo = function(selection2, x3, y3, p, event) {
    zoom.transform(selection2, function() {
      var e = extent.apply(this, arguments), t = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
      return constrain(identity2.translate(p0[0], p0[1]).scale(t.k).translate(
        typeof x3 === "function" ? -x3.apply(this, arguments) : -x3,
        typeof y3 === "function" ? -y3.apply(this, arguments) : -y3
      ), e, translateExtent);
    }, p, event);
  };
  function scale(transform2, k) {
    k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
    return k === transform2.k ? transform2 : new Transform(k, transform2.x, transform2.y);
  }
  function translate(transform2, p0, p1) {
    var x3 = p0[0] - p1[0] * transform2.k, y3 = p0[1] - p1[1] * transform2.k;
    return x3 === transform2.x && y3 === transform2.y ? transform2 : new Transform(transform2.k, x3, y3);
  }
  function centroid(extent2) {
    return [(+extent2[0][0] + +extent2[1][0]) / 2, (+extent2[0][1] + +extent2[1][1]) / 2];
  }
  function schedule(transition2, transform2, point, event) {
    transition2.on("start.zoom", function() {
      gesture(this, arguments).event(event).start();
    }).on("interrupt.zoom end.zoom", function() {
      gesture(this, arguments).event(event).end();
    }).tween("zoom", function() {
      var that = this, args = arguments, g = gesture(that, args).event(event), e = extent.apply(that, args), p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point, w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]), a2 = that.__zoom, b = typeof transform2 === "function" ? transform2.apply(that, args) : transform2, i = interpolate(a2.invert(p).concat(w / a2.k), b.invert(p).concat(w / b.k));
      return function(t) {
        if (t === 1) t = b;
        else {
          var l = i(t), k = w / l[2];
          t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k);
        }
        g.zoom(null, t);
      };
    });
  }
  function gesture(that, args, clean) {
    return !clean && that.__zooming || new Gesture(that, args);
  }
  function Gesture(that, args) {
    this.that = that;
    this.args = args;
    this.active = 0;
    this.sourceEvent = null;
    this.extent = extent.apply(that, args);
    this.taps = 0;
  }
  Gesture.prototype = {
    event: function(event) {
      if (event) this.sourceEvent = event;
      return this;
    },
    start: function() {
      if (++this.active === 1) {
        this.that.__zooming = this;
        this.emit("start");
      }
      return this;
    },
    zoom: function(key, transform2) {
      if (this.mouse && key !== "mouse") this.mouse[1] = transform2.invert(this.mouse[0]);
      if (this.touch0 && key !== "touch") this.touch0[1] = transform2.invert(this.touch0[0]);
      if (this.touch1 && key !== "touch") this.touch1[1] = transform2.invert(this.touch1[0]);
      this.that.__zoom = transform2;
      this.emit("zoom");
      return this;
    },
    end: function() {
      if (--this.active === 0) {
        delete this.that.__zooming;
        this.emit("end");
      }
      return this;
    },
    emit: function(type2) {
      var d = select_default2(this.that).datum();
      listeners.call(
        type2,
        this.that,
        new ZoomEvent(type2, {
          sourceEvent: this.sourceEvent,
          target: zoom,
          type: type2,
          transform: this.that.__zoom,
          dispatch: listeners
        }),
        d
      );
    }
  };
  function wheeled(event, ...args) {
    if (!filter2.apply(this, arguments)) return;
    var g = gesture(this, args).event(event), t = this.__zoom, k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))), p = pointer_default(event);
    if (g.wheel) {
      if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
        g.mouse[1] = t.invert(g.mouse[0] = p);
      }
      clearTimeout(g.wheel);
    } else if (t.k === k) return;
    else {
      g.mouse = [p, t.invert(p)];
      interrupt_default(this);
      g.start();
    }
    noevent_default3(event);
    g.wheel = setTimeout(wheelidled, wheelDelay);
    g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));
    function wheelidled() {
      g.wheel = null;
      g.end();
    }
  }
  function mousedowned(event, ...args) {
    if (touchending || !filter2.apply(this, arguments)) return;
    var currentTarget = event.currentTarget, g = gesture(this, args, true).event(event), v = select_default2(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true), p = pointer_default(event, currentTarget), x0 = event.clientX, y0 = event.clientY;
    nodrag_default(event.view);
    nopropagation3(event);
    g.mouse = [p, this.__zoom.invert(p)];
    interrupt_default(this);
    g.start();
    function mousemoved(event2) {
      noevent_default3(event2);
      if (!g.moved) {
        var dx = event2.clientX - x0, dy = event2.clientY - y0;
        g.moved = dx * dx + dy * dy > clickDistance2;
      }
      g.event(event2).zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = pointer_default(event2, currentTarget), g.mouse[1]), g.extent, translateExtent));
    }
    function mouseupped(event2) {
      v.on("mousemove.zoom mouseup.zoom", null);
      yesdrag(event2.view, g.moved);
      noevent_default3(event2);
      g.event(event2).end();
    }
  }
  function dblclicked(event, ...args) {
    if (!filter2.apply(this, arguments)) return;
    var t0 = this.__zoom, p0 = pointer_default(event.changedTouches ? event.changedTouches[0] : event, this), p1 = t0.invert(p0), k1 = t0.k * (event.shiftKey ? 0.5 : 2), t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, args), translateExtent);
    noevent_default3(event);
    if (duration > 0) select_default2(this).transition().duration(duration).call(schedule, t1, p0, event);
    else select_default2(this).call(zoom.transform, t1, p0, event);
  }
  function touchstarted(event, ...args) {
    if (!filter2.apply(this, arguments)) return;
    var touches = event.touches, n = touches.length, g = gesture(this, args, event.changedTouches.length === n).event(event), started, i, t, p;
    nopropagation3(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer_default(t, this);
      p = [p, this.__zoom.invert(p), t.identifier];
      if (!g.touch0) g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
      else if (!g.touch1 && g.touch0[2] !== p[2]) g.touch1 = p, g.taps = 0;
    }
    if (touchstarting) touchstarting = clearTimeout(touchstarting);
    if (started) {
      if (g.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() {
        touchstarting = null;
      }, touchDelay);
      interrupt_default(this);
      g.start();
    }
  }
  function touchmoved(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t, p, l;
    noevent_default3(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer_default(t, this);
      if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
      else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
    }
    t = g.that.__zoom;
    if (g.touch1) {
      var p0 = g.touch0[0], l0 = g.touch0[1], p1 = g.touch1[0], l1 = g.touch1[1], dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp, dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
      t = scale(t, Math.sqrt(dp / dl));
      p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
    } else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
    else return;
    g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
  }
  function touchended(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t;
    nopropagation3(event);
    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() {
      touchending = null;
    }, touchDelay);
    for (i = 0; i < n; ++i) {
      t = touches[i];
      if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
      else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
    }
    if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
    if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
    else {
      g.end();
      if (g.taps === 2) {
        t = pointer_default(t, this);
        if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
          var p = select_default2(this).on("dblclick.zoom");
          if (p) p.apply(this, arguments);
        }
      }
    }
  }
  zoom.wheelDelta = function(_) {
    return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant_default6(+_), zoom) : wheelDelta;
  };
  zoom.filter = function(_) {
    return arguments.length ? (filter2 = typeof _ === "function" ? _ : constant_default6(!!_), zoom) : filter2;
  };
  zoom.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant_default6(!!_), zoom) : touchable;
  };
  zoom.extent = function(_) {
    return arguments.length ? (extent = typeof _ === "function" ? _ : constant_default6([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent;
  };
  zoom.scaleExtent = function(_) {
    return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom) : [scaleExtent[0], scaleExtent[1]];
  };
  zoom.translateExtent = function(_) {
    return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
  };
  zoom.constrain = function(_) {
    return arguments.length ? (constrain = _, zoom) : constrain;
  };
  zoom.duration = function(_) {
    return arguments.length ? (duration = +_, zoom) : duration;
  };
  zoom.interpolate = function(_) {
    return arguments.length ? (interpolate = _, zoom) : interpolate;
  };
  zoom.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom : value;
  };
  zoom.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom) : Math.sqrt(clickDistance2);
  };
  zoom.tapDistance = function(_) {
    return arguments.length ? (tapDistance = +_, zoom) : tapDistance;
  };
  return zoom;
}

// apps/agios-command-center/src/app.js
var page = document.querySelector("#page");
var viewName = document.querySelector("#view-name");
var modal = document.querySelector("#directive-modal");
var palette = document.querySelector("#command-palette");
var paletteInput = document.querySelector("#palette-input");
var paletteResults = document.querySelector("#palette-results");
var sidebar = document.querySelector("#sidebar");
var toast = document.querySelector("#toast");
var viewLabels = {
  command: "Command Center",
  portfolio: "Portfolio",
  departments: "Departments",
  agents: "Agent Fleet",
  mesh: "Agent Mesh",
  work: "Goals & Work",
  artifacts: "Artifact Library",
  paperclip: "Paperclip",
  approvals: "Approvals",
  systems: "All Systems",
  system: "AI System",
  memory: "Shared Memory",
  skills: "Shared Skills",
  repositories: "Repositories",
  automations: "Automations",
  integrations: "Models & Tools",
  network: "Agent Network",
  performance: "Performance",
  settings: "Settings",
  agent: "Agent Workspace"
};
var state = {
  data: null,
  view: "command",
  selectedAgent: "default",
  agentMode: "overview",
  selectedSystem: "hermes",
  systemMode: "chat",
  skillQuery: "",
  skillCategory: "all",
  sessionQuery: "",
  period: "28d",
  directiveDrafts: loadDrafts(),
  modelPreferences: loadLocalObject("agios.modelPreferences"),
  dataClassPreferences: {},
  runtimePreferences: {},
  hiddenStudios: loadLocalObject("agios.hiddenStudios"),
  runs: [],
  memories: [],
  retrievalHits: [],
  a2aTasks: [],
  skillProposals: [],
  workspaces: [],
  visionAssets: [],
  runtimeAdapters: [],
  orchestrationPlans: [],
  voice: null,
  recorder: null,
  voiceTimer: null,
  wakeRecognition: null,
  wakeArmed: false,
  memorySimulation: null,
  osMapSimulation: null,
  osMapLayer: "all",
  operationalLoading: false
};
function esc(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character]);
}
function loadDrafts() {
  try {
    return JSON.parse(localStorage.getItem("agios.directiveDrafts") || "[]");
  } catch {
    return [];
  }
}
function loadLocalObject(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}
function saveLocalObject(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function cookie(name) {
  return document.cookie.split("; ").find((item) => item.startsWith(`${name}=`))?.split("=").slice(1).join("=") || "";
}
async function api(path, options = {}) {
  const headers = { Accept: "application/json", ...options.headers || {} };
  if (options.body) headers["Content-Type"] = "application/json";
  if (!/^(GET|HEAD)$/i.test(options.method || "GET")) headers["X-AGIOS-CSRF"] = decodeURIComponent(cookie("agios_csrf"));
  const response = await fetch(path, { ...options, headers, credentials: "same-origin" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || "AGIOS operation failed");
  return payload;
}
function titleCase(value) {
  return String(value || "").replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function status(value) {
  const selected = String(value || "unavailable");
  return `<span class="status-pill"><i class="status-dot status-${esc(selected)}"></i>${esc(titleCase(selected))}</span>`;
}
function initials(value) {
  return String(value || "AG").split(/\s|-/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
function relativeTime(value) {
  if (!value) return "Not scheduled";
  const target = new Date(value);
  if (Number.isNaN(target.valueOf())) return "Scheduled";
  const minutes = Math.round((target.valueOf() - Date.now()) / 6e4);
  if (minutes < -1) return `${Math.abs(minutes)}m ago`;
  if (minutes <= 1) return "Now";
  if (minutes < 60) return `in ${minutes}m`;
  if (minutes < 1440) return `in ${Math.round(minutes / 60)}h`;
  return `in ${Math.round(minutes / 1440)}d`;
}
function runsForPeriod(period = state.period) {
  if (period === "live") {
    const cutoff2 = Date.now() - 24 * 60 * 60 * 1e3;
    return state.runs.filter((run) => ["queued", "running", "awaiting_approval"].includes(run.status) || new Date(run.created_at).valueOf() >= cutoff2);
  }
  const days = period === "7d" ? 7 : 28;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1e3;
  return state.runs.filter((run) => new Date(run.created_at).valueOf() >= cutoff);
}
function heading(eyebrow, title, description, meta = "") {
  return `<div class="page-heading"><div><p class="eyebrow">${esc(eyebrow)}</p><h1>${title}</h1><p>${esc(description)}</p></div>${meta ? `<div class="heading-meta">${meta}</div>` : ""}</div>`;
}
function periodControl() {
  return `<div class="period-control" aria-label="Reporting period">${[["live", "Live"], ["7d", "7d"], ["28d", "28d"]].map(([id2, label]) => `<button class="${state.period === id2 ? "is-active" : ""}" data-period="${id2}">${label}</button>`).join("")}</div>`;
}
function signalCard(label, value, note, tone, bars) {
  return `<article class="signal-card tone-${tone}"><div class="signal-card-top"><span>${esc(label)}</span><small>LIVE VIEW</small></div><strong>${value}</strong><p>${esc(note)}</p><div class="micro-bars" aria-hidden="true">${bars.map((height) => `<i style="height:${height}%"></i>`).join("")}</div></article>`;
}
function operatingBrief() {
  const active = state.runs.filter((run) => ["queued", "running"].includes(run.status));
  const approvals = state.runs.filter((run) => run.status === "awaiting_approval");
  const periodRuns = runsForPeriod();
  const completed = periodRuns.filter((run) => run.status === "completed");
  const failed = periodRuns.filter((run) => ["failed", "interrupted"].includes(run.status));
  const next = state.data.schedules.find((job) => job.next_run_at) || state.data.schedules[0];
  const latest = completed[0];
  return `<section class="operating-brief"><header><div><p class="eyebrow">NOW BRIEF</p><h2>The studio knows what needs attention.</h2></div><span>REAL LOCAL STATE</span></header><div class="brief-grid">
    <article><small>WORKING NOW</small><strong>${active.length}</strong><p>${active.length ? esc(active[0].objective) : "No worker is consuming tokens."}</p></article>
    <article class="brief-judgment"><small>NEEDS JUDGMENT</small><strong>${approvals.length}</strong><p>${approvals.length ? "Exact run approval is waiting." : "No runtime decision is waiting."}</p></article>
    <article><small>NEXT WAKE</small><strong>${next ? esc(relativeTime(next.next_run_at)) : "Not set"}</strong><p>${next ? esc(next.name) : "No schedule is registered."}</p></article>
    <article><small>LATEST VERIFIED RESULT</small><strong>${latest ? esc(titleCase(latest.agent_id)) : "None yet"}</strong><p>${latest ? esc(latest.objective) : failed.length ? `${failed.length} run needs review.` : "Completed work will appear here."}</p></article>
  </div><footer><span>${state.data.operational?.shared_memory?.fact_count ?? 0} durable memories</span><span>${state.data.summary.shared_skills} shared skills</span><button data-view-link="artifacts">Open evidence and artifacts \u2192</button></footer></section>`;
}
function renderAgentNavigation() {
  const target = document.querySelector("#agent-nav");
  if (!target || !state.data) return;
  target.innerHTML = state.data.agents.map((agent, index2) => `<button class="agent-nav-item ${state.view === "agent" && state.selectedAgent === agent.id ? "is-active" : ""}" data-agent="${esc(agent.id)}"><span class="agent-orb agent-${index2 % 5}">${initials(agent.name || agent.id)}</span><span><strong>${esc(agent.name || titleCase(agent.id))}</strong><small>${esc(agent.profession || titleCase(agent.role))}</small></span><i class="status-dot status-${esc(agent.state)}"></i></button>`).join("");
}
function renderSystemNavigation() {
  const target = document.querySelector("#system-nav");
  if (!target || !state.data) return;
  target.innerHTML = state.data.systems.map((system, index2) => {
    const runtime = runtimeForSystem(system.id);
    const indicator = runtime.status === "live" ? "online" : runtime.execution_enabled ? "ready" : runtime.detected ? "attention" : "planned";
    return `<button class="system-nav-item ${state.view === "system" && state.selectedSystem === system.id ? "is-active" : ""}" data-system="${esc(system.id)}"><span class="system-glyph system-${index2 % 6}">${initials(system.name)}</span><span><strong>${esc(system.name)}</strong><small>${runtime.execution_enabled ? `${runtime.actions.length} live actions` : esc(titleCase(runtime.status))}</small></span><i class="status-dot status-${esc(indicator)}"></i></button>`;
  }).join("");
}
function chiefVoiceControl() {
  const enabled = Boolean(state.voice?.input?.enabled && navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  return `<button class="chief-voice" type="button" data-voice-record ${enabled ? "" : "disabled"} title="${enabled ? "Speak, then review the transcript" : "Voice transcription is unavailable"}"><span>\u25CF</span><b>${enabled ? "Speak" : "Voice off"}</b></button>`;
}
function renderChiefOfStaffBoard() {
  const d = state.data;
  const plan = state.orchestrationPlans[0] || null;
  const ari = d.agents.find((item) => item.id === "default");
  const department = plan ? d.departments.find((item) => item.id === plan.department_id) : null;
  const lead = plan ? d.agents.find((item) => item.id === plan.lead_agent_id) : null;
  const business = plan ? d.businesses.find((item) => item.id === plan.business_id) : null;
  const model = plan ? d.models.find((item) => item.id === plan.model_id) : null;
  const linkedRun = plan?.run_id ? state.runs.find((item) => item.run_id === plan.run_id) : null;
  const routeState = linkedRun?.status || plan?.status || "listening";
  const businessOptions = d.businesses.map((item) => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join("");
  const critics = (plan?.critics || [
    { id: "brief", name: "Brief critic", question: "Checks the requested outcome", status: "waiting" },
    { id: "system", name: "System critic", question: "Checks policy and consistency", status: "waiting" },
    { id: "craft", name: "Craft critic", question: "Checks the rendered result", status: "waiting" }
  ]).map((critic, index2) => `<article style="--critic-index:${index2}"><i></i><div><small>${esc(titleCase(critic.status))} review</small><strong>${esc(critic.name)}</strong><p>${esc(critic.question)}</p></div></article>`).join("");
  const rationale = (plan?.rationale || []).map((item) => `<li>${esc(item)}</li>`).join("");
  const destination = routeState === "awaiting_approval" ? ["approvals", "Route prepared", "Open exact approval \u2192"] : ["work", routeState === "completed" ? "Route completed" : "Work in motion", "Open live work \u2192"];
  const dataRanks = { public: 0, internal: 1, private_business: 2, customer_restricted: 3 };
  const eligibleWorkspaces = state.workspaces.filter((workspace) => {
    const classAllowed = (dataRanks[workspace.data_class] ?? 99) <= (dataRanks[plan?.data_class] ?? -1);
    const accessAllowed = plan?.workspace_access !== "write" || workspace.write_allowed;
    return classAllowed && accessAllowed;
  });
  const workspaceOptions = eligibleWorkspaces.map((workspace) => `<option value="${esc(workspace.workspace_id)}">${esc(workspace.label)} \xB7 ${esc(titleCase(workspace.data_class))}</option>`).join("");
  const requiredCapabilities = plan?.required_capabilities || [];
  const runtimeOptions = state.runtimeAdapters.filter((runtime) => ["hermes", "codex"].includes(runtime.id) && runtime.execution_enabled && (!requiredCapabilities.includes("research_web") || runtime.id === "hermes")).map((runtime) => `<option value="${esc(runtime.id)}">${esc(runtime.name)} \xB7 ${esc(titleCase(runtime.status))}</option>`).join("");
  const workspaceRoute = plan?.execution_mode === "workspace";
  const dispatch2 = !plan ? "" : plan.status === "planned" ? `<form class="chief-dispatch-form" data-dispatch-form data-plan-id="${esc(plan.plan_id)}" data-plan-digest="${esc(plan.plan_digest)}">${workspaceRoute ? `<label>REGISTERED WORKSPACE<select name="workspaceId" required><option value="">Choose workspace</option>${workspaceOptions}</select></label><label>WORKER RUNTIME<select name="runtimeId" required>${runtimeOptions}</select></label>` : ""}<button class="chief-dispatch" type="submit" ${workspaceRoute && !eligibleWorkspaces.length ? "disabled" : ""}><span>${workspaceRoute ? "Bind the approved workspace" : "Prepare supervised run"}</span><b>Approval next \u2192</b></button>${workspaceRoute && !eligibleWorkspaces.length ? `<small>No compatible write-approved workspace is registered. Open Repositories to add a clean worktree first.</small>` : ""}</form>` : `<button class="chief-dispatch is-ready" type="button" data-view-link="${destination[0]}"><span>${destination[1]}</span><b>${destination[2]}</b></button>`;
  return `<section class="chief-desk route-${esc(routeState)}" aria-label="Ari Vale Chief of Staff connector board">
    <div class="chief-aurora" aria-hidden="true"><i></i><i></i><i></i></div>
    <header class="chief-header">
      <div class="chief-identity"><div class="ari-orb" aria-hidden="true"><span>AV</span><i></i><i></i></div><div><p class="eyebrow">MAIN SUPER AGENT \xB7 CHIEF OF STAFF</p><h1>Ask Ari. <em>AGIOS routes the work.</em></h1><p>One command enters here. Ari chooses the business, department, professional agents and approved model\u2014then shows you the complete route before anything runs.</p></div></div>
      <div class="chief-presence"><i></i><span><strong>${esc(ari?.name || "Ari Vale")}</strong><small>${plan ? esc(titleCase(plan.status)) : "Listening for your outcome"}</small></span></div>
    </header>
    <form class="chief-command" data-chief-form>
      <label class="chief-input"><span>TELL ARI THE OUTCOME</span><textarea name="objective" required maxlength="7200" placeholder="Example: Improve the customer dashboard, research the best motion system, build it safely and have an independent critic review the result."></textarea></label>
      <div class="chief-command-actions">${chiefVoiceControl()}<label><span>Business</span><select name="businessId"><option value="">Ari decides</option>${businessOptions}</select></label><label><span>Data</span><select name="dataClass"><option value="internal">Internal</option><option value="public">Public</option><option value="private_business">Private business</option><option value="customer_restricted">Customer restricted</option></select></label><button class="chief-plan" type="submit"><span>Route with Ari</span><b>\u2301</b></button></div>
      <p class="chief-command-note">Planning is local and starts no model. Voice always becomes editable text first.</p>
    </form>
    <div class="connector-stage ${plan ? "has-plan" : "is-awaiting"}">
      <div class="connector-flow" aria-label="Chief of Staff route">
        <article class="connector-node owner-node"><small>01 \xB7 YOU</small><strong>Outcome</strong><span>${plan ? "Received" : "Waiting"}</span></article>
        <i class="route-beam beam-one" aria-hidden="true"><b></b></i>
        <article class="connector-node ari-node"><div class="mini-orbit"><span>AV</span></div><small>02 \xB7 ORCHESTRATOR</small><strong>${esc(ari?.name || "Ari Vale")}</strong><span>Policy \xB7 delegation \xB7 memory</span></article>
        <i class="route-beam beam-two" aria-hidden="true"><b></b></i>
        <div class="route-destinations">
          <article class="connector-node"><small>03 \xB7 BUSINESS</small><strong>${esc(business?.name || "Ari decides")}</strong><span>${plan ? "Selected" : "Portfolio context"}</span></article>
          <article class="connector-node"><small>04 \xB7 DEPARTMENT</small><strong>${esc(department?.name || "Best department")}</strong><span>${plan ? esc(plan.workload.replace(/_/g, " ")) : "Capability match"}</span></article>
          <article class="connector-node"><small>05 \xB7 PROFESSIONAL LEAD</small><strong>${esc(lead?.name || "Best specialist")}</strong><span>${esc(lead?.profession || "Experience matched")}</span></article>
          <article class="connector-node"><small>06 \xB7 EXECUTION LANE</small><strong>${plan ? esc(titleCase(plan.execution_mode || "goal")) : "Capability-matched lane"}</strong><span>${plan ? `${esc((plan.required_capabilities || []).map(titleCase).join(" \xB7 ") || "Model only")} \xB7 ${esc(model?.id || plan.model_id)}` : "Research, workspace and model policy checked"}</span></article>
        </div>
      </div>
      <aside class="critic-rail"><header><div><small>GAUNTLET REVIEW</small><strong>Independent quality gates</strong></div><span>${plan ? "PLANNED" : "STANDBY"}</span></header>${critics}<p class="critic-truth">These critics are planned gates. They are not shown as running until a real review run exists.</p></aside>
    </div>
    ${plan ? `<div class="route-review"><div><small>ARI'S ROUTING DECISION</small><h2>${esc(department?.name || plan.department_id)} \u2192 ${esc(lead?.name || plan.lead_agent_id)} \u2192 ${esc(plan.model_id)}</h2><ul>${rationale}</ul></div>${dispatch2}</div>` : `<footer class="chief-empty-route"><i></i><span><strong>The connector board is ready.</strong><small>Your first route will light up from Ari to the chosen team.</small></span></footer>`}
  </section>`;
}
function osMapRegistry() {
  const d = state.data;
  const nodes = [
    { id: "owner", label: d.portfolio.owner || "Owner", detail: "Human authority", kind: "owner", radius: 23 },
    { id: "agent:default", label: d.agents.find((item) => item.id === "default")?.name || "Ari Vale", detail: "Chief of Staff", kind: "core", radius: 30, agentId: "default" }
  ];
  const links = [{ source: "owner", target: "agent:default", kind: "authority" }];
  const addNode = (node) => {
    if (!nodes.some((item) => item.id === node.id)) nodes.push(node);
  };
  const addLink = (source, target, kind = "registry") => {
    if (nodes.some((item) => item.id === source) && nodes.some((item) => item.id === target)) links.push({ source, target, kind });
  };
  for (const business of d.businesses) {
    addNode({ id: `business:${business.id}`, label: business.name, detail: titleCase(business.status), kind: "business", radius: 15, businessId: business.id, status: business.status });
    addLink("agent:default", `business:${business.id}`, "portfolio");
  }
  for (const department of d.departments) {
    addNode({ id: `department:${department.id}`, label: department.name, detail: `${department.ready_agents}/${department.agent_count} ready`, kind: "department", radius: 13, departmentId: department.id });
    for (const business of d.businesses.filter((item) => item.department_ids.includes(department.id))) addLink(`business:${business.id}`, `department:${department.id}`, "organization");
  }
  for (const agent of d.agents.filter((item) => item.id !== "default")) {
    addNode({ id: `agent:${agent.id}`, label: agent.name || titleCase(agent.id), detail: agent.profession || titleCase(agent.role), kind: "agent", radius: 12, agentId: agent.id, status: agent.state });
    for (const department of d.departments.filter((item) => item.agent_ids.includes(agent.id))) addLink(`department:${department.id}`, `agent:${agent.id}`, "workforce");
  }
  addNode({ id: "fabric:memory", label: "Shared memory", detail: `${d.operational?.shared_memory?.fact_count ?? 0} durable facts`, kind: "fabric", radius: 17, view: "memory" });
  addNode({ id: "fabric:skills", label: "Shared skills", detail: `${d.summary.shared_skills} available`, kind: "fabric", radius: 17, view: "skills" });
  addLink("agent:default", "fabric:memory", "intelligence");
  addLink("agent:default", "fabric:skills", "intelligence");
  for (const system of d.systems) {
    const runtime = runtimeForSystem(system.id);
    const live = runtime.execution_enabled || ["live", "routed", "detected"].includes(runtime.status);
    addNode({ id: `system:${system.id}`, label: system.name, detail: live ? titleCase(runtime.status) : "Planned adapter", kind: live ? "system" : "planned", radius: live ? 13 : 10, systemId: system.id, status: runtime.status });
    addLink("agent:default", `system:${system.id}`, live ? "runtime" : "future");
    if (system.shared_memory) addLink(`system:${system.id}`, "fabric:memory", "fabric");
    if (system.shared_skills) addLink(`system:${system.id}`, "fabric:skills", "fabric");
  }
  for (const plan of state.orchestrationPlans.slice(0, 4)) {
    addNode({ id: `plan:${plan.plan_id}`, label: plan.objective, detail: titleCase(plan.status), kind: "work", radius: 11, view: plan.run_id ? "work" : "command", status: plan.status });
    addLink("agent:default", `plan:${plan.plan_id}`, "live-work");
    addLink(`plan:${plan.plan_id}`, `agent:${plan.lead_agent_id}`, "assignment");
  }
  for (const run of state.runs.filter((item) => ["queued", "running", "awaiting_approval"].includes(item.status)).slice(0, 6)) {
    addNode({ id: `run:${run.run_id}`, label: run.objective, detail: titleCase(run.status), kind: "work", radius: 11, view: run.status === "awaiting_approval" ? "approvals" : "work", status: run.status });
    addLink(`agent:${run.agent_id}`, `run:${run.run_id}`, "live-work");
  }
  return { nodes, links };
}
function livingOSMapSurface() {
  const layers = [["all", "Whole OS"], ["organization", "Studios & team"], ["intelligence", "Memory & skills"], ["systems", "Models & systems"], ["work", "Live work"]];
  const runtimeCount = state.data.systems.filter((item) => ["live", "routed", "detected"].includes(runtimeForSystem(item.id).status)).length;
  return `<section class="living-os-map">
    <header><div><p class="eyebrow">ONE SHARED BRAIN \xB7 LIVE REGISTRY</p><h2>Your operating system, as one explorable map.</h2><p>Ari, studios, departments, professional agents, shared intelligence and runtimes are connected here. Select any node to inspect it or open its real AGIOS surface.</p></div><div class="map-truth"><i></i><span><strong>Registry live</strong><small>Private contents remain server-side</small></span></div></header>
    <div class="os-map-layers" aria-label="Map layers">${layers.map(([id2, label]) => `<button class="${state.osMapLayer === id2 ? "is-active" : ""}" data-os-map-layer="${id2}">${label}</button>`).join("")}</div>
    <div class="living-os-map-grid"><div id="living-os-map-canvas" class="living-os-map-canvas" role="img" aria-label="Interactive map of the AGIOS operating registry"></div><aside id="living-os-map-inspector" class="living-os-map-inspector"><small>ARI'S SHARED MAP</small><h3>Everything has one address.</h3><p>Drag to reorganize, scroll to zoom and select a node. Motion means topology\u2014not fabricated work. Only real queued or running work receives an activity pulse.</p><div class="map-inspector-stats"><span><strong>${state.data.businesses.length}</strong> studios</span><span><strong>${state.data.agents.length}</strong> agents</span><span><strong>${runtimeCount}</strong> routed systems</span></div><div class="future-adapter-note"><i>+</i><span><strong>Adapter-ready</strong><small>Claude and future runtimes join this same registry when installed, authenticated and audited.</small></span></div></aside></div>
  </section>`;
}
function renderLivingOSMap() {
  const host = document.querySelector("#living-os-map-canvas");
  if (!host) return;
  if (state.osMapSimulation) state.osMapSimulation.stop();
  host.replaceChildren();
  const registry = osMapRegistry();
  const allowKinds = {
    organization: /* @__PURE__ */ new Set(["owner", "core", "business", "department", "agent"]),
    intelligence: /* @__PURE__ */ new Set(["owner", "core", "agent", "fabric"]),
    systems: /* @__PURE__ */ new Set(["owner", "core", "system", "planned", "fabric"]),
    work: /* @__PURE__ */ new Set(["owner", "core", "agent", "work"])
  };
  const allowed = allowKinds[state.osMapLayer];
  const nodes = registry.nodes.filter((item) => !allowed || allowed.has(item.kind));
  const nodeIds = new Set(nodes.map((item) => item.id));
  const links = registry.links.filter((item) => nodeIds.has(String(item.source)) && nodeIds.has(String(item.target)));
  const width = Math.max(640, host.clientWidth || 920);
  const height = Math.max(510, host.clientHeight || 560);
  const svg = select_default2(host).append("svg").attr("viewBox", [0, 0, width, height]).attr("aria-hidden", "true");
  const defs = svg.append("defs");
  defs.append("radialGradient").attr("id", "os-core-glow").selectAll("stop").data([["0%", "#f8dfab"], ["35%", "#bc77f0"], ["100%", "#30234c"]]).join("stop").attr("offset", (item) => item[0]).attr("stop-color", (item) => item[1]);
  const stage = svg.append("g");
  svg.call(zoom_default2().scaleExtent([0.55, 2.7]).on("zoom", (event) => stage.attr("transform", event.transform)));
  const line = stage.append("g").attr("class", "os-map-links").selectAll("line").data(links).join("line").attr("class", (item) => `link-${item.kind}`);
  const node = stage.append("g").selectAll("g").data(nodes).join("g").attr("class", (item) => `os-map-node node-${item.kind} ${["queued", "running"].includes(item.status) ? "is-active-work" : ""}`).attr("tabindex", 0);
  node.append("circle").attr("r", (item) => item.radius);
  node.append("text").attr("text-anchor", "middle").attr("dy", (item) => item.radius + 14).text((item) => item.label.length > 24 ? `${item.label.slice(0, 22)}\u2026` : item.label);
  node.append("title").text((item) => `${item.label} \xB7 ${item.detail}`);
  const inspect = (_event, item) => {
    const panel = document.querySelector("#living-os-map-inspector");
    if (!panel) return;
    const action = item.agentId ? `<button data-agent="${esc(item.agentId)}">Open agent workspace \u2192</button>` : item.systemId ? `<button data-system="${esc(item.systemId)}">Open system \u2192</button>` : item.view ? `<button data-view-link="${esc(item.view)}">Open ${esc(titleCase(item.view))} \u2192</button>` : item.businessId ? `<button data-view-link="portfolio">Open portfolio \u2192</button>` : "";
    panel.innerHTML = `<small>${esc(titleCase(item.kind))} \xB7 SHARED REGISTRY</small><h3>${esc(item.label)}</h3><p>${esc(item.detail)}</p><div class="map-node-policy"><span><strong>Truthful state</strong><small>${esc(item.status ? titleCase(item.status) : "Registered")}</small></span><span><strong>Access</strong><small>AGIOS policy scoped</small></span></div>${action}<p class="map-inspector-foot">Selecting a node does not start work or spend tokens.</p>`;
  };
  node.on("click", inspect).on("keydown", (event, item) => {
    if (["Enter", " "].includes(event.key)) inspect(event, item);
  });
  node.call(drag_default().on("start", (event, item) => {
    if (!event.active) state.osMapSimulation.alphaTarget(0.18).restart();
    item.fx = item.x;
    item.fy = item.y;
  }).on("drag", (event, item) => {
    item.fx = event.x;
    item.fy = event.y;
  }).on("end", (event, item) => {
    if (!event.active) state.osMapSimulation.alphaTarget(0);
    item.fx = null;
    item.fy = null;
  }));
  state.osMapSimulation = simulation_default(nodes).force("link", link_default(links).id((item) => item.id).distance((item) => ["fabric", "future"].includes(item.kind) ? 82 : item.kind === "live-work" ? 72 : 108).strength(0.42)).force("charge", manyBody_default().strength((item) => item.kind === "core" ? -720 : item.kind === "business" ? -260 : -105)).force("collide", collide_default().radius((item) => item.radius + 19)).force("center", center_default(width * 0.48, height * 0.49)).on("tick", () => {
    line.attr("x1", (item) => item.source.x).attr("y1", (item) => item.source.y).attr("x2", (item) => item.target.x).attr("y2", (item) => item.target.y);
    node.attr("transform", (item) => `translate(${item.x},${item.y})`);
  });
}
function improvementIntelligenceSurface() {
  const proposals = state.skillProposals;
  const statusCount = (statuses) => proposals.filter((item) => statuses.includes(item.status)).length;
  const activeRuns = state.runs.filter((item) => ["queued", "running"].includes(item.status)).length;
  const failedRuns = state.runs.filter((item) => ["failed", "interrupted"].includes(item.status)).length;
  const completedRuns = state.runs.filter((item) => item.status === "completed").length;
  const loop = [
    ["01", "Observe", state.runs.length, "Sessions and outcomes"],
    ["02", "Find pattern", statusCount(["needs_evidence", "awaiting_owner_review"]), "Evidence-linked proposals"],
    ["03", "Owner review", statusCount(["awaiting_owner_review"]), "Your judgment gate"],
    ["04", "Author", statusCount(["approved_for_authoring", "draft_ready"]), "Bounded skill draft"],
    ["05", "Validate", statusCount(["validated"]), "Safety and quality checks"],
    ["06", "Install & measure", statusCount(["installed"]), "Shared, versioned capability"]
  ];
  const dimensions = [
    ["Conversation analysis", state.runs.length ? `${state.runs.length} sessions` : "Standby", "Turns repeated requests into evidence, never automatic changes."],
    ["Cost & limits", state.data.usage?.cost == null ? "Unavailable" : String(state.data.usage.cost), "Provider-reported only; missing usage never appears as zero."],
    ["Skill performance", proposals.length ? `${proposals.length} proposals` : "No proposals", "Every improvement remains attached to source runs."],
    ["Memory health", titleCase(state.data.operational?.shared_memory?.status || "unavailable"), `${state.data.operational?.shared_memory?.fact_count ?? 0} durable scoped facts.`],
    ["Session hygiene", failedRuns ? `${failedRuns} need review` : "Clear", `${completedRuns} completed \xB7 ${activeRuns} active.`],
    ["Workflow patterns", state.orchestrationPlans.length ? `${state.orchestrationPlans.length} Ari routes` : "Listening", "Routing decisions remain inspectable before execution."],
    ["External opportunity", "Not connected", "No monitoring claim until a permitted source adapter exists."],
    ["Business outcomes", "Needs metrics", "Revenue and outcome signals will appear only from verified sources."]
  ];
  return `<section class="improvement-intelligence"><header><div><p class="eyebrow">SELF-IMPROVEMENT \xB7 EVIDENCE BEFORE CHANGE</p><h2>AGIOS can grow without rewriting itself in the dark.</h2><p>Professional agents learn from verified work, propose skills in their specialty and share approved capabilities across the studio. Nothing installs itself.</p></div><button data-view-link="skills">Open Skill Lab \u2192</button></header><div class="improvement-loop">${loop.map(([index2, label, count, note], position) => `<article style="--loop-index:${position}"><small>${index2}</small><i></i><strong>${count}</strong><h3>${label}</h3><p>${note}</p></article>`).join("")}</div><div class="intelligence-radar"><div><p class="eyebrow">INTELLIGENCE RADAR</p><h3>What is worth your attention?</h3><p>Each dimension is honest about what AGIOS can currently measure.</p></div><div class="radar-grid">${dimensions.map(([name, value, note], index2) => `<article class="radar-${index2 % 4}"><span>${String(index2 + 1).padStart(2, "0")}</span><div><strong>${esc(name)}</strong><small>${esc(note)}</small></div><em>${esc(value)}</em></article>`).join("")}</div></div></section>`;
}
function renderCommand() {
  const d = state.data;
  const nextSchedules = d.schedules.slice(0, 4);
  const pendingRuns = state.runs.filter((run) => run.status === "awaiting_approval");
  const businessNodes = d.businesses.map((business) => `
    <button class="business-node" data-business="${esc(business.id)}">
      <b>${esc(business.name.replace(/&.*|Business|Studio/g, "").trim() || business.name)}</b>
      <small class="status-line"><i class="status-dot status-${esc(business.status)}"></i>${esc(business.status)}</small>
    </button>`).join("");
  const agentChips = d.agents.map((agent, index2) => `
    <button class="agent-chip" data-agent="${esc(agent.id)}"><div class="agent-glyph agent-${index2 % 5}">${initials(agent.id)}</div><div><strong>${esc(agent.id)}</strong><small>${esc(agent.model || "Runtime unavailable")}</small></div><i class="status-dot status-${esc(agent.state)}" title="${esc(agent.state)}"></i></button>`).join("");
  const scheduleRows = nextSchedules.length ? nextSchedules.map((job) => `
    <div class="schedule-row"><div class="schedule-icon">\u21BB</div><div><strong>${esc(job.name)}</strong><small>${esc(job.schedule || "Scheduled automation")}</small></div><time>${esc(relativeTime(job.next_run_at))}<small>${esc(job.state)}</small></time></div>`).join("") : `<div class="decision-empty"><strong>Schedule feed unavailable</strong><p>AGIOS could not read local Hermes schedules.</p></div>`;
  page.innerHTML = `
    <div class="operator-line"><span><i></i> AGIOS / LOCAL OPERATOR</span><span>${d.runtime.gateway_running ? "HERMES GATEWAY ONLINE" : "HERMES STANDING BY"}</span></div>
    ${renderChiefOfStaffBoard()}
    ${livingOSMapSurface()}
    ${improvementIntelligenceSurface()}
    ${heading("Portfolio now", `Your operating system. <em>Today at a glance.</em>`, "Live work, approvals, memory and the portfolio remain visible below Ari's routing desk.", `<strong>\u25CF Supervised mode</strong><span>Updated ${new Date(d.generated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>`)}
    <div class="command-toolbar"><div class="context-line"><span class="status-dot status-online"></span><strong>${d.summary.active_businesses} active businesses</strong><span>\xB7</span><span>${d.summary.live_or_detected_systems} systems live, detected or routed</span><span>\xB7</span><span>${runsForPeriod().length} runs in period</span></div>${periodControl()}</div>
    ${operatingBrief()}
    <section class="signal-grid" aria-label="Operating signals">
      ${signalCard("Fleet readiness", `${d.summary.available_agents}<small> / ${d.summary.agents}</small>`, "registered workers ready to wake", "coral", [18, 28, 22, 45, 38, 57, 48, 72, 62, 88, 78, 94])}
      ${signalCard("Shared skills live", d.summary.shared_skills, `available to ${d.shared_fabric.skills.attached_agents} agents by policy`, "mint", [22, 35, 30, 42, 47, 44, 58, 61, 57, 70, 81, 90])}
      ${signalCard("AGIOS shared memory", d.operational?.shared_memory?.fact_count ?? 0, `live scoped facts \xB7 ${d.shared_fabric.memory.fact_count} profile facts indexed`, "violet", [72, 64, 58, 52, 46, 38, 31, 26, 20, 16, 10, 8])}
    </section>
    <section class="panel usage-panel">
      <header class="panel-header"><div><h2>AI usage & operating limits</h2><p>Subscriptions, tokens and cost remain honest when providers do not report them</p></div><button data-view-link="performance">Usage details \u2197</button></header>
      <div class="usage-summary"><div><small>AI SYSTEMS</small><strong>${d.summary.systems}</strong><span>${d.summary.live_or_detected_systems} usable or detected</span></div><div><small>OPERATIONAL LANE</small><strong>${esc(d.operational?.status || "unavailable")}</strong><span>Hermes chat, goals and shared memory</span></div><div><small>MODEL ROUTES</small><strong>${d.summary.model_routes}</strong><span>${d.models.filter((model) => model.location === "local").length} local routes</span></div><div><small>INTEGRATIONS</small><strong>${d.summary.connected_integrations}</strong><span>registered in the governed catalog</span></div></div>
    </section>
    <div class="command-grid">
      <div>
        <section class="panel">
          <header class="panel-header"><div><h2>Operating portfolio</h2><p>Every studio and venture under the AGIOS control plane</p></div><button data-view-link="portfolio">Open portfolio \u2197</button></header>
          <div class="organization-map"><div class="org-core"><small>OWNER CONTROL</small><strong>AGIOS</strong><span>${d.summary.departments} departments \xB7 ${d.summary.agents} agents</span></div><div class="business-rail">${businessNodes}</div></div>
        </section>
        <section class="panel">
          <header class="panel-header"><div><h2>Next scheduled work</h2><p>Hermes wakes workers only when work is due</p></div><button data-view-link="automations">All automations \u2197</button></header>
          <div>${scheduleRows}</div>
        </section>
      </div>
      <div>
        <section class="panel">
          <header class="panel-header"><div><h2>Agent workspaces</h2><p>Open an operator cockpit for any registered worker</p></div><button data-view-link="agents">Fleet table \u2197</button></header>
          <div class="agent-compact">${agentChips}</div>
        </section>
        <section class="panel decision-panel"><header class="panel-header"><div><h2>Judgment queue</h2><p>Consequential actions stop here</p></div><button data-view-link="approvals">Review \u2197</button></header>${pendingRuns.length ? `<div class="decision-pending"><strong>${pendingRuns.length} exact run approval${pendingRuns.length === 1 ? "" : "s"} waiting</strong><p>${esc(pendingRuns[0].objective)}</p><button data-view-link="approvals">Open approval queue \u2192</button></div>` : `<div class="decision-empty"><div class="seal">\u2713</div><strong>Your queue is clear</strong><p>Nothing is waiting for runtime or external-action approval.</p></div>`}</section>
      </div>
    </div>`;
  window.requestAnimationFrame(renderLivingOSMap);
}
function renderPortfolio() {
  const cards = state.data.businesses.map((business, index2) => `<article class="entity-card">
    <div class="entity-top"><span class="entity-index">B-${String(index2 + 1).padStart(2, "0")}</span>${status(business.status)}</div>
    <h2>${esc(business.name)}</h2><p>${esc(business.mission)}</p>
    <footer class="entity-footer"><span>${business.department_count} departments</span><span>Owner \xB7 ${esc(titleCase(business.owner_agent_id))}</span></footer>
  </article>`).join("");
  page.innerHTML = `${heading("Portfolio", "Every business, one operating system.", "Studios and ventures share governance, agents, knowledge and tools while keeping their missions and data boundaries clear.")}<div class="view-grid">${cards}</div>`;
}
function renderDepartments() {
  const rows = state.data.departments.map((department) => `<div class="data-row columns-departments">
    <div><strong>${esc(department.name)}</strong><p>${esc(department.id)}</p></div>
    <span>${esc(department.mission)}</span>
    <span>${department.ready_agents} / ${department.agent_count} ready</span>
    <span>${department.skill_bundles.map(titleCase).join(" \xB7 ")}</span>
  </div>`).join("");
  page.innerHTML = `${heading("Organization", "Departments that can assemble around any business.", "Research, building, design, growth and review are reusable operating capabilities\u2014not isolated chat threads.")}
    <div class="data-panel"><div class="data-head columns-departments"><span>Department</span><span>Mission</span><span>Fleet</span><span>Skill bundles</span></div>${rows}</div>`;
}
function renderAgents() {
  const rows = state.data.agents.map((agent) => `<div class="data-row columns-agents clickable-row" data-agent="${esc(agent.id)}">
    <div><strong>${esc(agent.name || titleCase(agent.id))}</strong><p>${esc(agent.profession || titleCase(agent.role))} \xB7 ${esc(agent.seniority || "Specialist")}</p></div>
    <span>${status(agent.state)}</span>
    <span class="mono">${esc(agent.model || "Unavailable")}</span>
    <span>${agent.skill_count ?? "\u2014"} skills</span>
    <span>${agent.gateway_running ? "Gateway online" : "Standing by"}</span>
  </div>`).join("");
  page.innerHTML = `${heading("Agent fleet", "Persistent workers, activated with purpose.", "An agent can be ready all day without using model tokens. AGIOS wakes the right worker for a due schedule, approved event or explicit assignment.")}
    <div class="state-callout"><span>\u25C9</span><div><strong>Ready is not running</strong><p>Only the gateway remains available. Model work starts when AGIOS dispatches a governed job.</p></div></div>
    <div class="data-panel"><div class="data-head columns-agents"><span>Agent</span><span>State</span><span>Model route</span><span>Capability</span><span>Wake mode</span></div>${rows}</div>`;
}
var runErrorMessages = {
  adapter_unavailable: "This runtime has no executable AGIOS adapter.",
  authentication_failed: "The selected provider rejected its local credentials.",
  fallback_blocked: "AGIOS rejected an unapproved provider fallback. Authenticate the selected route or choose another model.",
  model_unavailable: "The selected model is not available from this provider.",
  provider_unavailable: "The selected provider route is not configured or reachable.",
  rate_limited: "The provider limit is currently exhausted. Retry later or choose another model.",
  runtime_unavailable: "The local runtime command could not be started.",
  sandbox_denied: "The runtime could not enter the approved workspace sandbox.",
  timeout: "The runtime exceeded the supervised execution time limit.",
  tool_approval_required: "The runtime requested authority that this run does not grant.",
  internal_error: "AGIOS stopped the run after an internal execution error.",
  runtime_failed: "The runtime exited without a usable response."
};
function runError(run) {
  const code = run.error_code || "runtime_failed";
  return `<div class="run-error"><strong>${esc(titleCase(code))}</strong><span>${esc(runErrorMessages[code] || runErrorMessages.runtime_failed)}</span></div>`;
}
function runCard(run, { transcript = false } = {}) {
  const active = ["queued", "running"].includes(run.status);
  const approval = run.status === "awaiting_approval" ? `<div class="approval-gate"><div><strong>Exact run approval required</strong><small>${esc(titleCase(run.data_class))} \xB7 ${esc(run.provider || "local runtime")} \xB7 ${esc(run.model || "profile model")}</small></div><div class="approval-actions"><button data-cancel-run="${esc(run.run_id)}">Cancel</button><button data-approve-run="${esc(run.run_id)}" data-approval-digest="${esc(run.approval_digest)}">Approve & run</button></div></div>` : "";
  const response = run.response ? `<div class="run-response"><div class="response-heading"><span>${esc(titleCase(run.agent_id))}</span><button type="button" data-speak-run="${esc(run.run_id)}" title="Speak this reply">Listen</button></div><pre>${esc(run.response)}</pre></div>` : run.status === "failed" ? runError(run) : active ? `<div class="run-progress"><i></i><span>${run.status === "queued" ? "Waiting for the supervised worker" : "The worker is thinking; this view refreshes automatically"}</span></div>` : "";
  return `<article class="run-card ${transcript ? "is-transcript" : ""}"><header><div><span>${esc(titleCase(run.mode))} \xB7 ${new Date(run.created_at).toLocaleString()}</span><strong>${esc(titleCase(run.agent_id))}</strong></div>${status(run.status)}</header><div class="run-request"><span>OWNER</span><p>${esc(run.objective)}</p></div>${approval}${response}<footer><span>${run.skill_ids.length} skills \xB7 ${run.memory_ids.length} memories \xB7 ${(run.vision_asset_ids || []).length} images</span><span>${esc(titleCase(run.runtime_id || "hermes"))}${run.workspace_id ? ` \xB7 ${esc(titleCase(run.workspace_access))} workspace` : ""} \xB7 ${active ? "working" : esc(run.hermes_session_id || "audited locally")}</span></footer></article>`;
}
function skillPicker() {
  const items = state.data.shared_fabric.skills.items.slice(0, 18);
  return `<fieldset class="run-skill-picker"><legend>Shared skills \xB7 choose up to 3</legend>${items.map((skill) => `<label><input type="checkbox" name="skill" value="${esc(skill.id)}"/><span>${esc(titleCase(skill.name))}</span></label>`).join("")}</fieldset>`;
}
function modelsForAgent(agent) {
  const ids = new Set((agent.workloads || []).flatMap((workload) => state.data.routes?.[workload] || []));
  return state.data.models.filter((model) => ids.has(model.id));
}
function voiceControls() {
  const input = state.voice?.input;
  const browserReady = Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  const enabled = browserReady && input?.enabled;
  const detail = !browserReady ? "Browser microphone unavailable" : !state.voice ? "Checking Hermes voice" : enabled ? input.local ? `Local transcription \xB7 ${input.provider}` : `Configured transcription \xB7 ${input.provider}` : "Hermes transcription is not configured";
  return `<div class="voice-controls"><button type="button" data-voice-record ${enabled ? "" : "disabled"}><span>\u25CF</span> Push to talk</button><label class="vision-upload">\u25C9 Add image<input type="file" data-vision-input accept="image/png,image/jpeg,image/webp"/></label><select name="visionRetention" title="Image retention"><option value="session">Delete after run</option><option value="24_hours">Keep 24 hours</option><option value="manual">Keep until removed</option></select><small data-vision-state>${esc(detail)} \xB7 voice and images never auto-send</small></div>`;
}
function runComposer(agent, mode) {
  const isGoal = mode === "goal";
  const isWorkspace = mode === "workspace";
  const isAriRouter = agent.id === "default" && mode === "chat";
  const preferredModel = state.modelPreferences[agent.id] || "";
  const preferredDataClass = state.dataClassPreferences[agent.id] || "internal";
  const preferredRuntime = state.runtimePreferences[agent.id] || "hermes";
  let models = modelsForAgent(agent);
  if (isWorkspace) models = models.filter((model) => ["openai-codex", "deepseek"].includes(model.provider));
  const runtimes = state.runtimeAdapters.filter((runtime) => ["hermes", "codex"].includes(runtime.id) && runtime.execution_enabled && runtime.actions?.some((action) => action.startsWith("workspace")));
  const workspaceOptions = state.workspaces.map((workspace) => `<option value="${esc(workspace.workspace_id)}">${esc(workspace.label)} \xB7 ${esc(titleCase(workspace.data_class))}${workspace.write_allowed ? " \xB7 read/write" : " \xB7 read-only"}</option>`).join("");
  const description = isWorkspace ? "A supervised agent can inspect or change only an owner-registered Git workspace. Every run requires exact approval; external actions remain locked." : isGoal ? "Goals can research public information and maintain a plan after exact approval. Workspace tools remain available only in the dedicated Workspace lane." : isAriRouter ? "Ari is the front door, not a model-only chat box. Simple questions stay conversational; research, links, files, builds and multi-step requests become a visible supervised route." : "Chat is model-only: shared memory, selected skills, voice and image understanding are available, but no workspace tools can run.";
  const ariContract = isAriRouter ? `<div class="ari-route-contract"><span><b>QUESTION</b> Direct answer</span><i>or</i><span><b>WORK</b> Research / workspace plan</span><i>then</i><span><b>YOU</b> Review & approve</span></div>` : "";
  const ariPreference = isAriRouter ? `<label>How Ari decides<select name="ariIntent"><option value="auto">Automatic \xB7 recommended</option><option value="conversation">Direct answer only</option><option value="work">Always route work</option></select></label>` : "";
  return `<form class="operational-compose workspace-card ${isAriRouter ? "ari-front-door" : ""}" data-run-form ${isAriRouter ? "data-ari-router" : ""} data-agent-id="${esc(agent.id)}" data-run-mode="${mode}"><div class="compose-title"><div><p class="eyebrow">${isWorkspace ? "Supervised workspace" : isGoal ? "Supervised goal" : isAriRouter ? "Ari intent router" : "Live AGIOS chat"}</p><h3>${isWorkspace ? `Work with ${esc(agent.name || titleCase(agent.id))}` : isGoal ? `Give ${esc(agent.name || titleCase(agent.id))} an outcome` : isAriRouter ? "Ask Ari anything. Route work safely." : `Message ${esc(agent.name || titleCase(agent.id))}`}</h3></div>${status(state.data.operational?.status || "unavailable")}</div><p>${description}</p>${ariContract}<textarea name="objective" required maxlength="8000" placeholder="${isWorkspace ? "Describe the exact work, files in scope, acceptance criteria, and verification required." : isGoal ? "Describe the result, acceptance criteria, limits, and what evidence should be returned." : isAriRouter ? "Ask a question, paste a link, or describe the result you want. Ari will choose the correct lane." : "Ask a question or continue the work. Relevant authorized memory is retrieved automatically."}"></textarea>${voiceControls()}<div class="operational-options ${isWorkspace || isAriRouter ? "four" : "three"}"><label>Data class / Vault Mode<select name="dataClass"><option value="internal" ${preferredDataClass === "internal" ? "selected" : ""}>Internal</option><option value="public" ${preferredDataClass === "public" ? "selected" : ""}>Public</option><option value="private_business" ${preferredDataClass === "private_business" ? "selected" : ""}>Vault \xB7 Private business</option><option value="customer_restricted" ${preferredDataClass === "customer_restricted" ? "selected" : ""}>Vault \xB7 Customer restricted</option></select></label>${ariPreference}${isWorkspace ? `<label>Runtime<select name="runtimeId" required>${runtimes.map((runtime) => `<option value="${esc(runtime.id)}" ${preferredRuntime === runtime.id ? "selected" : ""}>${esc(runtime.name)} \xB7 ${esc(titleCase(runtime.status))}</option>`).join("")}</select></label><label>Registered workspace<select name="workspaceId" required><option value="">Choose workspace</option>${workspaceOptions}</select></label><label>Access<select name="workspaceAccess"><option value="read">Read only</option>${agent.capabilities.includes("write_workspace") ? `<option value="write">Read and write</option>` : ""}</select></label>` : `<label>${isAriRouter ? "Direct-answer model" : "Model Once \xB7 this run"}<select name="modelId"><option value="" ${preferredModel ? "" : "selected"}>Worker default \xB7 ${esc(agent.model || "runtime")}</option>${models.map((model) => `<option value="${esc(model.id)}" ${preferredModel === model.id ? "selected" : ""}>${esc(model.id)} \xB7 ${esc(model.location)}</option>`).join("")}</select></label><label>Project memory scope<input name="projectId" maxlength="128" placeholder="Optional project ID"/></label>`}</div>${isWorkspace ? `<label class="workspace-model">Model Once \xB7 this run<select name="modelId"><option value="" ${preferredModel ? "" : "selected"}>Best approved worker default</option>${models.map((model) => `<option value="${esc(model.id)}" ${preferredModel === model.id ? "selected" : ""}>${esc(model.id)} \xB7 ${esc(model.provider)}</option>`).join("")}</select></label>` : ""}${skillPicker()}<div class="compose-submit"><span>${isWorkspace || isGoal ? "Approval binds agent, objective, data class, memory, skills, model, runtime, images and workspace boundary." : isAriRouter ? "Automatic routing is local and deterministic. Work never falls back to powerless chat." : "Model Once changes only this run. AGIOS still checks the route against data and agent policy."}</span><button type="submit">${isWorkspace ? "Review workspace run" : isGoal ? "Review goal" : isAriRouter ? "Ask Ari" : "Send through AGIOS"} \u2197</button></div></form>`;
}
function workspaceRegistryCard() {
  const entries = state.workspaces.map((workspace) => `<div class="workspace-registry-row"><div><strong>${esc(workspace.label)}</strong><small>${esc(titleCase(workspace.data_class))} \xB7 ${workspace.write_allowed ? "read/write approved" : "read-only"}</small></div>${status("registered")}</div>`).join("");
  return `<section class="workspace-card workspace-registry"><div class="compose-title"><div><p class="eyebrow">Private workspace registry</p><h3>Owner-approved Git boundaries</h3></div><span>${state.workspaces.length} registered</span></div><p>Paths stay on the private server and are never returned to this browser after registration.</p><form data-workspace-form><label>Label<input name="label" required maxlength="100" placeholder="Studio website"/></label><label>Local Git folder<input name="rootPath" required maxlength="1000" placeholder="C:\\Projects\\studio-site"/></label><div class="operational-options"><label>Data class<select name="dataClass"><option value="internal">Internal</option><option value="private_business">Private business</option><option value="customer_restricted">Customer restricted</option><option value="public">Public</option></select></label><label class="check-label"><input type="checkbox" name="writeAllowed"/> Allow exact-approved edits</label></div><button type="submit">Register workspace</button></form><div class="workspace-registry-list">${entries || `<div class="workspace-empty"><strong>No workspace registered yet</strong><span>Register a clean Git worktree before dispatching repo work.</span></div>`}</div></section>`;
}
function operationalWorkspace(agent, mode) {
  const runs = state.runs.filter((run) => run.agent_id === agent.id && (mode === "sessions" || run.mode === mode));
  if (mode === "sessions") return `<div class="runtime-session-list">${runs.length ? runs.map((run) => runCard(run)).join("") : `<div class="workspace-empty workspace-card large"><b>\u25F7</b><strong>No AGIOS sessions yet</strong><span>Chats and approved goals will appear here with their real status and response.</span></div>`}</div>`;
  return `${mode === "workspace" ? workspaceRegistryCard() : ""}<div class="operational-grid">${runComposer(agent, mode)}<section class="run-feed"><div class="run-feed-heading"><div><p class="eyebrow">${mode === "goal" ? "Goal watch" : mode === "workspace" ? "Workspace watch" : "Conversation"}</p><h3>${runs.length} real ${runs.length === 1 ? "run" : "runs"}</h3></div><span>${runs.some((run) => ["queued", "running"].includes(run.status)) ? "LIVE" : "LOCAL"}</span></div>${runs.length ? runs.map((run) => runCard(run, { transcript: mode === "chat" })).join("") : `<div class="workspace-empty workspace-card"><b>${mode === "chat" ? "\u25A1" : mode === "workspace" ? "\u25B1" : "\u25CE"}</b><strong>${mode === "chat" ? "Start the first conversation" : mode === "workspace" ? "No workspace work dispatched" : "No goals have been dispatched"}</strong><span>Only verified runtime activity is displayed.</span></div>`}</section></div>`;
}
function skillDraftCard(proposal) {
  if (!["draft_ready", "validated", "installed"].includes(proposal.status)) return `<div class="growth-proposal"><div><strong>${esc(proposal.skill_name)}</strong><small>${esc(titleCase(proposal.change_kind))} \xB7 ${esc(titleCase(proposal.status))}</small></div>${status(proposal.status)}</div>`;
  const validation = proposal.validation;
  const checks = validation ? `<div class="skill-validation ${validation.passed ? "is-valid" : "is-invalid"}"><strong>${validation.passed ? "Validation passed" : "Needs revision"}</strong>${(validation.errors || []).map((item) => `<small>${esc(item)}</small>`).join("")}</div>` : "";
  return `<article class="skill-draft"><header><div><strong>${esc(proposal.skill_name)}</strong><small>${esc(titleCase(proposal.change_kind))} \xB7 ${esc(titleCase(proposal.status))}</small></div>${status(proposal.status)}</header>${proposal.status === "installed" ? `<p>Installed in the live AGIOS shared skill registry. Authorized agents can now load it.</p>` : `<form data-skill-draft-form data-proposal-id="${esc(proposal.proposal_id)}"><textarea name="body" required maxlength="20000">${esc(proposal.draft_body || "")}</textarea><div class="skill-draft-actions"><button type="submit">Save draft</button><button type="button" data-validate-skill="${esc(proposal.proposal_id)}">Validate</button>${validation?.passed ? `<button type="button" data-install-skill="${esc(proposal.proposal_id)}" data-draft-digest="${esc(proposal.draft_digest)}">Install shared skill</button>` : ""}</div></form>${checks}`}</article>`;
}
function agentModeContent(agent) {
  if (["chat", "goal", "workspace", "sessions"].includes(state.agentMode)) return operationalWorkspace(agent, state.agentMode);
  const departments = state.data.departments.filter((department) => department.agent_ids.includes(agent.id));
  if (state.agentMode === "skills") {
    const bundles = [...new Set(departments.flatMap((department) => department.skill_bundles))];
    return `<div class="workspace-split"><section class="workspace-card skill-inventory"><p class="eyebrow">Hermes inventory</p><strong class="inventory-number">${agent.skill_count ?? "\u2014"}</strong><h3>skills available to this profile</h3><p>Count comes from the live Hermes profile. Skill bodies and private configuration stay runtime-side.</p><div class="skill-cloud">${agent.capabilities.map((item) => `<span>${esc(titleCase(item))}</span>`).join("")}</div></section><section class="workspace-card"><p class="eyebrow">Department bundles</p><h3>Operational playbooks</h3>${bundles.map((bundle) => `<div class="assignment-row"><span>\u25C7</span><div><strong>${esc(titleCase(bundle))}</strong><small>Available through assigned department policy</small></div></div>`).join("")}</section></div>`;
  }
  if (state.agentMode === "growth") {
    const completed = state.runs.filter((run) => run.agent_id === agent.id && run.status === "completed");
    const proposals = state.skillProposals.filter((item) => item.agent_id === agent.id);
    const specialties = (agent.specialties || []).map((item) => `<span>${esc(item)}</span>`).join("");
    return `<div class="growth-grid"><section class="workspace-card career-card"><p class="eyebrow">Professional development</p><h3>${esc(agent.profession || titleCase(agent.role))}</h3><p>${esc(agent.experience || "Experience brief not set")}. Growth is earned from reviewed work; AGIOS never invents a score.</p><div class="career-stats"><span><small>VERIFIED COMPLETIONS</small><strong>${completed.length}</strong></span><span><small>LEARNING MODE</small><strong>${esc(titleCase(agent.growth_policy?.mode || "evidence led"))}</strong></span><span><small>SKILL PROPOSALS</small><strong>${proposals.length}</strong></span></div><div class="specialty-cloud">${specialties}</div>${proposals.map(skillDraftCard).join("")}</section><form class="workspace-card skill-proposal" data-skill-proposal-form data-agent-id="${esc(agent.id)}"><p class="eyebrow">Governed skill evolution</p><h3>Propose a professional skill change</h3><p>The agent may identify a recurring gap and draft an improvement. It cannot install or overwrite a shared skill without owner review and independent validation.</p><label>Skill name<input name="skillName" required maxlength="100" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="source-quality-audit"/></label><label>Change<select name="changeKind"><option value="create">Create new skill</option><option value="update">Update existing skill</option></select></label><label>Evidence and reason<textarea name="rationale" required maxlength="1200" placeholder="What repeated evidence shows this skill is needed, and how will it be tested?"></textarea></label><div class="compose-submit"><span>${completed.length ? `${completed.length} completed runs will be attached as evidence.` : "Without completed work, the proposal remains in Needs Evidence."}</span><button type="submit">Submit for owner review</button></div></form></div>`;
  }
  if (state.agentMode === "control") {
    return `<div class="control-grid"><section class="workspace-card control-primary"><p class="eyebrow">Runtime control</p><h3>${esc(titleCase(agent.id))} is ${esc(agent.state)}</h3><div class="control-readout"><span><small>RUNTIME</small><strong>${esc(titleCase(agent.runtime))}</strong></span><span><small>PROVIDER</small><strong>${esc(agent.provider || "Unavailable")}</strong></span><span><small>MODEL</small><strong>${esc(agent.model || "Unavailable")}</strong></span><span><small>WAKE POLICY</small><strong>Event or schedule</strong></span></div></section><section class="workspace-card"><p class="eyebrow">Operational controls</p><h3>Supervised multi-runtime lane</h3><div class="policy-row"><span>Chat, voice and vision</span><em>Live</em></div><div class="policy-row"><span>Exact-approved research goals</span><em>Live</em></div><div class="policy-row"><span>Scoped shared memory and skills</span><em>Live</em></div><div class="policy-row"><span>Registered Git workspace work</span><em>Exact approval</em></div><div class="policy-row"><span>Publishing, messages, purchases and deployment</span><em>Locked</em></div><div class="boundary-note">Every run is authenticated and journaled. Hermes and Codex receive only the approved workspace, access level, images, memory, skills and model route.</div></section></div>`;
  }
  return `<div class="workspace-split"><section class="workspace-card profile-brief"><p class="eyebrow">Professional identity</p><h3>${esc(agent.profession || titleCase(agent.role))}</h3><p>${esc(agent.biography || agent.description || `A persistent ${titleCase(agent.role)} registered inside the Hermes runtime.`)}</p><div class="identity-line"><span>${esc(agent.seniority || "Specialist")}</span><span>${esc(agent.experience || "Experience brief pending")}</span></div><div class="specialty-cloud">${(agent.specialties || []).map((item) => `<span>${esc(item)}</span>`).join("")}</div><div class="control-readout"><span><small>STATE</small><strong>${esc(titleCase(agent.state))}</strong></span><span><small>SKILLS</small><strong>${agent.skill_count ?? "\u2014"}</strong></span><span><small>WORKLOADS</small><strong>${agent.workloads.length}</strong></span><span><small>DEPARTMENTS</small><strong>${departments.length}</strong></span></div></section><section class="workspace-card"><p class="eyebrow">Operating role</p><h3>Assigned workloads</h3>${agent.workloads.map((workload) => `<div class="assignment-row"><span>\u2197</span><div><strong>${esc(titleCase(workload))}</strong><small>Routed through AGIOS model and data policy</small></div></div>`).join("")}<div class="boundary-note">Ready means available to wake\u2014not continuously consuming tokens. Skill growth is evidence-led and owner governed.</div></section></div>`;
}
function renderAgent() {
  const agent = state.data.agents.find((item) => item.id === state.selectedAgent) || state.data.agents[0];
  state.selectedAgent = agent.id;
  const modes = [["overview", "Overview"], ["chat", agent.id === "default" ? "Ask Ari + Voice" : "Chat + Voice"], ["goal", "Goal Mode"], ["workspace", "Workspace"], ["skills", "Skills"], ["growth", "Growth"], ["sessions", "Sessions"], ["control", "Control Room"]];
  const modelChips = modelsForAgent(agent).map((model) => `<span class="model-chip ${model.id === agent.model ? "is-selected" : ""}"><i class="status-dot status-${model.location === "local" ? "ready" : "planned"}"></i>${esc(model.id)}</span>`).join("");
  page.innerHTML = `<div class="agent-hero"><div><p class="eyebrow">AGENT \xB7 ${esc(agent.runtime.toUpperCase())} \xB7 ${esc(agent.id)}</p><h1>${esc(agent.name || titleCase(agent.id))}</h1><p>${esc(agent.profession || titleCase(agent.role))} \xB7 ${esc(agent.seniority || "Specialist")} \xB7 ${esc(agent.provider || "Provider unavailable")}</p></div><div class="agent-hero-status">${status(agent.state)}<small>${agent.gateway_running ? "Gateway online" : "Registered \xB7 standing by"}</small></div></div>
    <div class="mode-strip">${modes.map(([id2, label]) => `<button class="${state.agentMode === id2 ? "is-active" : ""}" data-agent-mode="${id2}"><span>${id2 === "goal" ? "\u25CE" : id2 === "control" ? ">_" : id2 === "workspace" ? "\u25B1" : id2 === "sessions" ? "\u25F7" : id2 === "skills" ? "\u25C7" : id2 === "chat" ? "\u25A1" : "\u25C9"}</span>${label}</button>`).join("")}</div>
    <div class="model-strip" aria-label="Governed model routes">${modelChips}</div>
    <div class="agent-mode-content">${agentModeContent(agent)}</div>`;
  renderAgentNavigation();
}
function scheduleTable() {
  return state.data.schedules.map((job) => `<div class="data-row columns-integrations">
    <div><strong>${esc(job.name)}</strong><p class="mono">${esc(job.id)}</p></div><span>${status(job.state)}</span><span>${esc(job.schedule || "\u2014")}</span><span>${esc(relativeTime(job.next_run_at))}</span>
  </div>`).join("") || `<div class="decision-empty"><strong>No schedule metadata available</strong><p>Hermes may be offline or no automations are registered.</p></div>`;
}
function osReadinessSurface(compact = false) {
  const memoryCount = state.data.operational?.shared_memory?.fact_count ?? 0;
  const parts = [
    ["HOME", "Command center", "ready", `${state.data.summary.active_businesses} businesses visible`],
    ["BRAIN", "Model routes", state.data.models.length ? "ready" : "attention", `${state.data.models.length} governed routes`],
    ["MEMORY", "Shared fabric", state.data.operational?.status === "ready" ? "ready" : "attention", `${memoryCount} durable facts`],
    ["SKILLS", "Professional recipes", state.data.summary.shared_skills ? "ready" : "attention", `${state.data.summary.shared_skills} discoverable skills`],
    ["CLOCK", "Schedules and events", state.data.schedules.length ? "ready" : "attention", `${state.data.schedules.length} registered wakes`],
    ["TEAM", "Specialist workforce", state.data.summary.available_agents ? "ready" : "attention", `${state.data.summary.available_agents}/${state.data.summary.agents} ready`]
  ];
  return `<section class="os-readiness ${compact ? "is-compact" : ""}"><header><div><p class="eyebrow">COMPOUND OS</p><h2>Home. Brain. Memory. Skills. Clock. Team.</h2></div><span>LIVE READINESS</span></header><div>${parts.map(([label, name, readiness, note], index2) => `<article class="readiness-${readiness}"><b>${index2 + 1}</b><div><small>${label}</small><strong>${name}</strong><span>${note}</span></div><em>${readiness === "ready" ? "Ready" : "Needs setup"}</em></article>`).join("")}</div><footer>Use the fewest capable workers for the job. Add a specialist only when a distinct recurring responsibility justifies one.</footer></section>`;
}
function renderPaperclip() {
  const liveRuns = state.runs.filter((run) => ["queued", "running", "awaiting_approval"].includes(run.status));
  const readyAgents = state.data.agents.filter((agent) => ["ready", "online"].includes(agent.state));
  const departmentRows = state.data.departments.map((department) => {
    const members = state.data.agents.filter((agent) => department.agent_ids.includes(agent.id));
    return `<button class="paperclip-team" data-view="departments">
      <span class="paperclip-team-mark">${esc(department.name.slice(0, 2).toUpperCase())}</span>
      <span><strong>${esc(department.name)}</strong><small>${members.length} worker${members.length === 1 ? "" : "s"} \xB7 ${esc(department.status || "registered")}</small></span>
      <em>Open \u2192</em>
    </button>`;
  }).join("");
  const workerRows = readyAgents.slice(0, 5).map((agent) => `<button class="paperclip-worker" data-agent="${esc(agent.id)}">
    <span class="agent-avatar">${esc(initials(agent.name || agent.id))}</span>
    <span><strong>${esc(agent.name || titleCase(agent.id))}</strong><small>${esc(agent.profession || titleCase(agent.role))}</small></span>
    ${status(agent.state)}
  </button>`).join("");
  const activity = liveRuns.length ? liveRuns.slice(0, 5).map((run) => `<button class="paperclip-dispatch" data-agent="${esc(run.agent_id)}"><span>\u2197</span><div><strong>${esc(run.objective)}</strong><small>${esc(titleCase(run.agent_id))} \xB7 ${esc(titleCase(run.mode))}</small></div>${status(run.status)}</button>`).join("") : `<div class="paperclip-empty"><span>\u2713</span><div><strong>No workers are consuming tokens</strong><small>Registered agents remain ready until a ticket, schedule or event wakes them.</small></div></div>`;
  page.innerHTML = `${heading("Paperclip", "Build the team. Hand off the outcome.", "Paperclip is the supervised orchestration desk: it turns a business outcome into a governed AGIOS ticket, assigns the right professional workers and follows the handoff into the live board.", `<button class="launch-goal compact" data-open-directive>New ticket \uFF0B</button>`)}
    <section class="paperclip-command">
      <div class="paperclip-pulse"><p class="eyebrow">ORCHESTRATION STATUS</p><h2>${liveRuns.length ? `${liveRuns.length} handoff${liveRuns.length === 1 ? "" : "s"} in motion` : "The studio is ready"}</h2><p>Every dispatch keeps the selected business, data class, model route, memory scope and approval boundary attached.</p><div class="paperclip-statline"><span><strong>${readyAgents.length}</strong> workers ready</span><span><strong>${state.data.departments.length}</strong> departments</span><span><strong>${state.data.schedules.length}</strong> scheduled wakes</span><span><strong>${state.directiveDrafts.length}</strong> local drafts</span></div></div>
      <div class="paperclip-route"><span>OUTCOME</span><i>\u2192</i><span>TEAM</span><i>\u2192</i><span>APPROVAL</span><i>\u2192</i><span>DELIVERY</span></div>
    </section>
    <div class="paperclip-grid">
      <section class="workspace-card paperclip-section"><div class="paperclip-section-head"><div><p class="eyebrow">TEAMS</p><h3>Department routing</h3></div><button data-view="departments">Manage</button></div><div class="paperclip-team-list">${departmentRows || `<p class="kanban-empty">No departments registered.</p>`}</div></section>
      <section class="workspace-card paperclip-section"><div class="paperclip-section-head"><div><p class="eyebrow">WORKERS</p><h3>Available specialists</h3></div><button data-view="agents">All agents</button></div><div class="paperclip-worker-list">${workerRows || `<p class="kanban-empty">No workers ready.</p>`}</div></section>
      <section class="workspace-card paperclip-section paperclip-activity"><div class="paperclip-section-head"><div><p class="eyebrow">LIVE HANDOFFS</p><h3>Current orchestration</h3></div><button data-view="work">Open board</button></div><div>${activity}</div></section>
    </div>`;
}
function renderWork() {
  const boardDrafts = state.directiveDrafts;
  const approvalRuns = state.runs.filter((run) => run.status === "awaiting_approval");
  const activeRuns = state.runs.filter((run) => ["queued", "running"].includes(run.status));
  const reviewRuns = state.runs.filter((run) => ["completed", "failed", "interrupted", "canceled"].includes(run.status));
  const runTask = (run) => `<article class="kanban-task"><header><span>${esc(titleCase(run.mode))}</span>${status(run.status)}</header><h3>${esc(run.objective)}</h3><footer><button data-agent="${esc(run.agent_id)}">${esc(titleCase(run.agent_id))}</button><time>${new Date(run.created_at).toLocaleString()}</time></footer></article>`;
  const draftTask = (draft) => `<article class="kanban-task is-draft"><header><span>LOCAL DRAFT</span>${status("planned")}</header><h3>${esc(draft.outcome)}</h3><footer><span>${esc(titleCase(draft.business))}</span><time>${new Date(draft.createdAt).toLocaleString()}</time></footer></article>`;
  const lane = (id2, title, items, empty2) => `<section class="kanban-lane lane-${id2}"><header><div><span></span><h2>${esc(title)}</h2></div><strong>${items.length}</strong></header><div>${items.join("") || `<p class="kanban-empty">${esc(empty2)}</p>`}</div></section>`;
  page.innerHTML = `${heading("Agent Kanban", "File a ticket. Watch the workers move it forward.", "Every card is a real AGIOS draft or runtime session. Goals continue in the local worker while this board updates their verified state.", `<button class="launch-goal compact" data-open-directive>New ticket \uFF0B</button>`)}<div class="kanban-summary"><span><strong>${boardDrafts.length}</strong> inbox</span><span><strong>${approvalRuns.length}</strong> awaiting approval</span><span><strong>${activeRuns.length}</strong> active</span><span><strong>${reviewRuns.length}</strong> review & done</span></div><div class="agent-kanban">${lane("inbox", "Inbox", boardDrafts.map(draftTask), "Create a governed ticket.")}${lane("approval", "Approval", approvalRuns.map(runTask), "No decisions waiting.")}${lane("active", "Building", activeRuns.map(runTask), "No workers running.")}${lane("review", "Review & done", reviewRuns.map(runTask), "Completed work appears here.")}</div>`;
  return;
  const drafts = state.directiveDrafts.map((draft) => `<article class="entity-card"><div class="entity-top"><span class="entity-index">LOCAL DRAFT</span>${status("planned")}</div><h2>${esc(draft.outcome)}</h2><p>${esc(titleCase(draft.business))} \xB7 ${esc(draft.dataClass)}</p><footer class="entity-footer"><span>Not dispatched</span><span>${new Date(draft.createdAt).toLocaleString()}</span></footer></article>`).join("");
  const runs = state.runs.filter((run) => run.mode === "goal");
  page.innerHTML = `${heading("Goals & work", "Direct outcomes, not disconnected prompts.", "Approved goals now run through Hermes for supervised research and planning. Every start, approval and result is journaled without storing raw customer content in the audit log.")}${runs.length ? `<div class="runtime-session-list">${runs.map((run) => runCard(run)).join("")}</div>` : `<div class="view-grid">${drafts || `<article class="entity-card"><div class="entity-top"><span class="entity-index">PHASE 2</span>${status("ready")}</div><h2>No operational goals yet</h2><p>Open an agent, choose Goal Mode, describe the exact outcome and approve the bound run.</p><footer class="entity-footer"><span>Supervised execution</span><span>Workspace and external actions locked</span></footer></article>`}</div>`}`;
}
function renderArtifacts() {
  const resultRuns = state.runs.filter((run) => run.response || ["completed", "failed", "interrupted"].includes(run.status));
  const completed = resultRuns.filter((run) => run.status === "completed");
  const evidenceCards = resultRuns.map((run) => `<article class="artifact-card"><header><span>${esc(titleCase(run.mode))} \xB7 ${esc(titleCase(run.agent_id))}</span>${status(run.status)}</header><h3>${esc(run.objective)}</h3>${run.response ? `<p>${esc(run.response.slice(0, 360))}${run.response.length > 360 ? "\u2026" : ""}</p>` : `<p>No response artifact was produced. Open Sessions to inspect the verified stop reason.</p>`}<footer><span>${run.skill_ids.length} skills \xB7 ${run.memory_ids.length} memories</span><time>${new Date(run.created_at).toLocaleString()}</time></footer></article>`).join("");
  const imageCards = state.visionAssets.map((asset) => `<article class="artifact-card image-artifact"><header><span>PRIVATE IMAGE INPUT</span>${status(asset.status)}</header><h3>${esc(asset.label || "Image")}</h3><p>${esc(titleCase(asset.mime_type))} \xB7 ${Math.max(1, Math.round(Number(asset.byte_count || 0) / 1024))} KB \xB7 ${esc(titleCase(asset.data_class))}</p><footer><span>${esc(titleCase(asset.retention))} retention</span><time>${new Date(asset.created_at).toLocaleString()}</time></footer></article>`).join("");
  page.innerHTML = `${heading("Artifact Library", "Every result has a place, a source, and a status.", "Browse real AGIOS run outputs and private vision metadata without exposing workspace paths, credentials, or raw customer files.")}<div class="artifact-summary"><span><small>VERIFIED RESULTS</small><strong>${completed.length}</strong></span><span><small>REVIEWABLE RUNS</small><strong>${resultRuns.length}</strong></span><span><small>PRIVATE IMAGE INPUTS</small><strong>${state.visionAssets.length}</strong></span><span><small>ACTIVE WORK</small><strong>${state.runs.filter((run) => ["queued", "running"].includes(run.status)).length}</strong></span></div><section class="artifact-section"><header><div><p class="eyebrow">RUN OUTPUTS</p><h2>Evidence returned by the workforce</h2></div><button data-system="hermes">Open Hermes Sessions \u2192</button></header><div class="artifact-grid">${evidenceCards || `<div class="workspace-empty workspace-card large"><b>\u25A3</b><strong>No result artifacts yet</strong><span>Completed and stopped runs will appear here from the private AGIOS session store.</span></div>`}</div></section><section class="artifact-section"><header><div><p class="eyebrow">PRIVATE INPUTS</p><h2>Vision assets under retention policy</h2></div><span>METADATA ONLY</span></header><div class="artifact-grid">${imageCards || `<div class="workspace-empty workspace-card"><b>\u25C9</b><strong>No retained image inputs</strong><span>Images are listed only when their real private metadata exists.</span></div>`}</div></section>`;
}
function renderApprovals() {
  const pending = state.runs.filter((run) => run.status === "awaiting_approval");
  const proposals = state.skillProposals.filter((item) => item.status === "awaiting_owner_review");
  const proposalCards = proposals.map((item) => `<article class="skill-approval-card"><header><div><small>${esc(item.agent_id)} \xB7 ${esc(titleCase(item.change_kind))}</small><h3>${esc(item.skill_name)}</h3></div>${status(item.status)}</header><p>${esc(item.rationale)}</p><footer><span>${item.evidence_run_ids.length} verified run${item.evidence_run_ids.length === 1 ? "" : "s"}</span><button data-approve-skill="${esc(item.proposal_id)}">Approve authoring</button></footer></article>`).join("");
  page.innerHTML = `${heading("Approval center", "Your judgment is a system boundary.", "Goals, sensitive model routes and agent-authored skill improvements stop here until their exact evidence and scope are approved.")}${pending.length || proposals.length ? `<div class="approval-sections">${pending.length ? `<section><p class="eyebrow">Runtime decisions</p><div class="runtime-session-list">${pending.map((run) => runCard(run)).join("")}</div></section>` : ""}${proposals.length ? `<section><p class="eyebrow">Skill evolution</p><div class="runtime-session-list">${proposalCards}</div></section>` : ""}</div>` : `<div class="empty-stage"><div class="seal">\u2713</div><h2>No decisions waiting</h2><p>The queue is clear. External messages, publishing, deployment, purchases, customer delivery and account changes remain prohibited even after a goal starts.</p><div class="foundation-roadmap"><span>Exact scope</span><span>Context bound</span><span>CSRF protected</span><span>Journaled</span></div></div>`}`;
}
function renderAutomations() {
  page.innerHTML = `${heading("Automations", "Work wakes when it is needed.", "Schedules and events activate specialized agents, collect evidence and return them to ready state. This is persistent operation without continuous token use.")}
    <section class="automation-contract"><article><small>NOTIFY</small><strong>Change only</strong><p>Prefer a meaningful delta over a repeated \u201Cnothing changed\u201D message.</p></article><article><small>FAILURES</small><strong>Visible and reviewable</strong><p>Failed jobs belong in Sessions and Artifacts; they never count as completed work.</p></article><article><small>AUTHORITY</small><strong>Never inherited</strong><p>A schedule can wake a worker, but publishing, messaging, deployment, and spending stay approval-gated.</p></article></section>
    <div class="data-panel"><div class="data-head columns-integrations"><span>Automation</span><span>State</span><span>Cadence</span><span>Next wake</span></div>${scheduleTable()}</div>`;
}
function renderIntegrations() {
  const rows = state.data.integrations.map((integration) => `<div class="data-row columns-integrations"><div><strong>${esc(integration.name)}</strong><p>${esc(integration.id)}</p></div><span>${esc(titleCase(integration.kind))}</span><span>${status(integration.status === "connected" ? "registered" : integration.status)}</span><span>${integration.status === "connected" ? "Cataloged \xB7 direct AGIOS action locked" : "Adapter required"}</span></div>`).join("");
  const seen = /* @__PURE__ */ new Set();
  const routes = [...state.data.integrations, ...state.data.apps].filter((item) => {
    const key = String(item.id || item.name).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const routeCards = routes.map((route) => {
    const routeStatus = route.status || "planned";
    const runtime = runtimeForSystem(route.id);
    const executable = runtime.execution_enabled === true;
    return `<article class="route-card"><header><span>${esc(titleCase(route.kind || "tool"))}</span>${status(executable ? runtime.status : routeStatus === "connected" ? "registered" : routeStatus)}</header><h3>${esc(route.name)}</h3><div class="route-contract"><span><small>PREFERRED ROUTE</small><strong>${executable ? esc(titleCase(runtime.adapter)) : "Registry only"}</strong></span><span><small>FALLBACK</small><strong>No implicit downgrade</strong></span><span><small>PERMISSION</small><strong>${executable ? "Policy checked per request" : "Direct execution locked"}</strong></span><span><small>HEALTH</small><strong>${executable ? esc(titleCase(runtime.status)) : "Not runtime-verified"}</strong></span></div></article>`;
  }).join("");
  const retrieval = state.data.operational?.retrieval || {};
  const a2a = state.data.operational?.a2a || {};
  page.innerHTML = `${heading("Models & tools", "One control plane, many replaceable capabilities.", "Registry entries describe intended connections; only runtime-verified adapters receive executable controls. Hermes remains the primary supervised execution runtime.")}
    <div class="protocol-strip"><article><small>KNOWLEDGE</small><strong>${esc(retrieval.mode || "Unavailable")}</strong><span>Citation-ready scoped retrieval</span></article><article><small>AGENT INTEROP</small><strong>${esc(a2a.protocol || "A2A")} ${esc(a2a.protocol_version || "")}</strong><span>Authenticated local ${esc(a2a.binding || "gateway")}</span></article><article><small>OUTBOUND PEERS</small><strong>${esc(titleCase(a2a.outbound_peers || "locked"))}</strong><span>Explicit trust and credentials required</span></article></div>
    <section class="tool-router"><header><div><p class="eyebrow">CAPABILITY ROUTER</p><h2>Preferred route, health, fallback, and permission.</h2></div><span>${routes.length} REGISTERED ROUTES</span></header><div class="route-card-grid">${routeCards}</div></section>
    <div class="data-panel"><div class="data-head columns-integrations"><span>Integration</span><span>Kind</span><span>Registry</span><span>Execution boundary</span></div>${rows}</div>`;
}
function a2aTaskCard(task) {
  const taskState = (task.status?.state || "TASK_STATE_UNKNOWN").replace("TASK_STATE_", "").toLowerCase().replaceAll("_", "-");
  const canCancel = task.status?.state === "TASK_STATE_AUTH_REQUIRED";
  return `<article class="a2a-task"><header><div><span>${esc(task.metadata?.skillId || "A2A task")}</span><strong>${esc(titleCase(task.metadata?.agentId || "default"))}</strong></div>${status(taskState)}</header><div class="a2a-task-body"><code>${esc(task.id)}</code><p>${task.metadata?.localRunId ? `Linked supervised run ${esc(task.metadata.localRunId)}` : "Local citation task completed without model execution."}</p></div><footer><span>${esc(titleCase(task.metadata?.dataClass || "internal"))}</span>${canCancel ? `<button data-a2a-cancel="${esc(task.id)}">Cancel before approval</button>` : `<time>${task.status?.timestamp ? new Date(task.status.timestamp).toLocaleString() : "Local"}</time>`}</footer></article>`;
}
function renderAgentNetwork() {
  const a2a = state.data.operational?.a2a || {};
  const agents = state.data.agents.map((agent) => `<option value="${esc(agent.id)}">${esc(titleCase(agent.id))} - ${esc(titleCase(agent.role))}</option>`).join("");
  page.innerHTML = `${heading("Agent network", "Agents can collaborate without sharing their internals.", "AGIOS exposes a local authenticated A2A 1.0 JSON-RPC gateway. Retrieval completes inside authorized memory scopes; research planning becomes an exact-approval goal.")}
    <div class="protocol-strip"><article><small>DISCOVERY</small><strong>Agent Card live</strong><span>/.well-known/agent-card.json</span></article><article><small>TRANSPORT</small><strong>${esc(titleCase(a2a.transport || "loopback authenticated"))}</strong><span>Session + CSRF protected</span></article><article><small>REMOTE DISPATCH</small><strong>Locked</strong><span>No peer receives data until explicitly trusted</span></article></div>
    <div class="network-grid"><form class="workspace-card a2a-compose" data-a2a-form><p class="eyebrow">Local A2A client</p><h3>Send a governed agent task</h3><p>Knowledge queries return citations. Planning tasks stop in Approvals before Hermes can run.</p><label>Task type<select name="skillId"><option value="scoped-knowledge-retrieval">Scoped knowledge retrieval</option><option value="supervised-research-planning">Supervised research planning</option></select></label><label>Agent<select name="agentId">${agents}</select></label><label>Request<textarea name="objective" required maxlength="8000" placeholder="Ask for evidence or describe a research outcome."></textarea></label><div class="operational-options"><label>Data class<select name="dataClass"><option value="internal">Internal</option><option value="public">Public</option><option value="private_business">Private business</option><option value="customer_restricted">Customer restricted</option></select></label><label>Project scope<input name="projectId" maxlength="128" placeholder="Optional project ID"/></label></div><div class="compose-submit"><span>A2A never grants authority. AGIOS policy and approvals still control execution.</span><button type="submit">Send local task</button></div></form><section class="a2a-feed"><div class="run-feed-heading"><div><p class="eyebrow">Inter-agent tasks</p><h3>${state.a2aTasks.length} local tasks</h3></div><span>A2A 1.0</span></div>${state.a2aTasks.length ? state.a2aTasks.map(a2aTaskCard).join("") : `<div class="workspace-empty workspace-card"><b>A2A</b><strong>No inter-agent tasks yet</strong><span>The gateway is ready; outbound peers remain locked.</span></div>`}</section></div>`;
}
function modelsForSystem(system) {
  if (system.id === "hermes") {
    const routedModelIds = new Set(Object.values(state.data.routes || {}).flat());
    return state.data.models.filter((model) => routedModelIds.has(model.id));
  }
  if (system.id === "codex") return state.data.models.filter((model) => model.provider === "openai-codex");
  if (system.id === "deepseek") return state.data.models.filter((model) => model.provider === "deepseek");
  if (system.id === "ollama") return state.data.models.filter((model) => model.location === "local");
  if (system.id === "opencode") return state.data.models.filter((model) => model.provider === "opencode");
  return state.data.models.filter((model) => model.provider === system.id);
}
function runtimeForSystem(systemId) {
  return state.runtimeAdapters.find((runtime) => runtime.id === systemId) || {
    id: systemId,
    status: "unavailable",
    adapter: "not-installed",
    execution_enabled: false,
    actions: [],
    approval: "not-executable",
    sandbox: "none"
  };
}
function routedModelForSystem(system) {
  const models = modelsForSystem(system).filter((model) => !model.id.includes("embedding"));
  if (system.id === "deepseek") return models.find((model) => model.provider === "deepseek") || null;
  if (system.id === "ollama") return models.find((model) => model.id === "qwen3.5-hermes") || models[0] || null;
  if (system.id === "opencode") return models.find((model) => model.provider === "opencode") || null;
  if (system.id === "codex") return models.find((model) => model.id === "gpt-5.6-sol") || models[0] || null;
  return models[0] || null;
}
function systemRunMatches(run, system) {
  const modelIds = new Set(modelsForSystem(system).map((model) => model.id));
  if (system.id === "codex" && run.runtime_id === "codex") return true;
  if (system.id === "hermes" && run.runtime_id === "hermes") return true;
  return modelIds.has(run.model) || run.provider === system.id;
}
function routedSystemLauncher(system, action) {
  const runtime = runtimeForSystem(system.id);
  const model = routedModelForSystem(system);
  const executable = runtime.execution_enabled && (runtime.actions || []).some((item) => action === "workspace" ? item.startsWith("workspace") : item === action || action === "chat" && item === "local-inference");
  const destination = action === "workspace" ? "the Codex workspace lane" : action === "goal" ? "Hermes Goal Mode" : "Hermes Chat";
  return `<section class="workspace-card routed-launcher"><p class="eyebrow">GOVERNED ROUTE</p><h2>${esc(system.name)} \u2192 ${destination}</h2><p>${executable ? `AGIOS will open the live supervised composer with ${model ? esc(model.id) : "the approved profile route"} selected. Memory, skills, data classification and approval policy remain attached.` : `${esc(system.name)} is visible in the registry, but no executable ${action} adapter is installed and authenticated on this machine.`}</p><div class="control-readout"><span><small>READINESS</small><strong>${runtime.configured ? "Configured" : runtime.detected ? "Installed \xB7 auth unverified" : "Not found"}</strong></span><span><small>ADAPTER</small><strong>${esc(titleCase(runtime.adapter))}</strong></span><span><small>MODEL</small><strong>${esc(model?.id || "Unavailable")}</strong></span><span><small>AUTHORITY</small><strong>${esc(titleCase(runtime.approval))}</strong></span></div>${executable ? `<button class="primary-action routed-action" data-route-system-action="${esc(action)}" data-route-system-id="${esc(system.id)}">Open live ${esc(action)} \u2192</button>` : `<div class="boundary-note">Install and authenticate an audited adapter before this action can appear. AGIOS blocks silent provider fallback.</div>`}</section>`;
}
function renderModelCards(models) {
  return models.length ? `<div class="model-card-grid">${models.map((model) => `<article class="model-card"><header><span>${esc(model.provider)}</span>${status(model.location === "local" ? "ready" : "routed")}</header><h3>${esc(model.id)}</h3><p>${esc(titleCase(model.trust))} trust \xB7 ${esc(titleCase(model.cost_status))}</p><div class="data-class-row">${model.allowed_data_classes.map((item) => `<span>${esc(titleCase(item))}</span>`).join("")}</div></article>`).join("")}</div>` : `<div class="workspace-empty workspace-card large"><b>\u25C7</b><strong>No governed model routes connected</strong><span>The system exists in the AGIOS registry, but its model adapter is not installed.</span></div>`;
}
function memoryStudioSurface() {
  const summary = state.data.operational?.shared_memory || { fact_count: 0, scopes: {} };
  return `<section class="memory-studio"><header><div><p class="eyebrow">Memory Studio</p><h2>Living knowledge map</h2><p>Explore how durable decisions, facts and preferences connect to their authorization scopes. This is the single visualization surface for every agent and runtime.</p></div><div class="memory-studio-legend"><span><i class="portfolio"></i>Portfolio</span><span><i class="scope"></i>Scope</span><span><i class="fact"></i>Memory</span></div></header><div class="memory-studio-grid"><div id="memory-studio-graph" class="memory-studio-graph" role="img" aria-label="Interactive graph of authorized AGIOS memories"></div><aside id="memory-inspector" class="memory-inspector"><small>SELECT A NODE</small><h3>${summary.fact_count} durable memories</h3><p>Drag nodes to reorganize the map, pan the canvas and scroll to zoom. Select a memory to inspect its authorized content and provenance.</p><div class="memory-inspector-stats"><span><strong>${state.data.agents.length}</strong> agents</span><span><strong>${Object.keys(summary.scopes || {}).length}</strong> active scopes</span></div></aside></div></section>`;
}
function renderMemoryStudioGraph() {
  const host = document.querySelector("#memory-studio-graph");
  if (!host) return;
  if (state.memorySimulation) state.memorySimulation.stop();
  const width = Math.max(620, host.clientWidth || 900);
  const height = Math.max(460, host.clientHeight || 520);
  const scopeKinds = ["portfolio", "business", "department", "project", "private"];
  const nodes = [{ id: "agios-memory", label: "AGIOS MEMORY", kind: "core", radius: 32 }];
  const links = [];
  for (const kind of scopeKinds) {
    nodes.push({ id: `scope:${kind}`, label: titleCase(kind), kind: "scope", radius: 18 });
    links.push({ source: "agios-memory", target: `scope:${kind}` });
  }
  for (const memory of state.memories) {
    nodes.push({ id: `memory:${memory.memory_id}`, label: memory.title, kind: "memory", radius: 9, memory });
    links.push({ source: `scope:${scopeKinds.includes(memory.scope_kind) ? memory.scope_kind : "portfolio"}`, target: `memory:${memory.memory_id}` });
  }
  const svg = select_default2(host).append("svg").attr("viewBox", [0, 0, width, height]).attr("aria-hidden", "true");
  const stage = svg.append("g");
  svg.call(zoom_default2().scaleExtent([0.55, 2.8]).on("zoom", (event) => stage.attr("transform", event.transform)));
  const line = stage.append("g").attr("class", "memory-links").selectAll("line").data(links).join("line");
  const node = stage.append("g").selectAll("g").data(nodes).join("g").attr("class", (item) => `memory-graph-node is-${item.kind}`).attr("tabindex", 0);
  node.append("circle").attr("r", (item) => item.radius);
  node.filter((item) => item.kind !== "memory").append("text").attr("text-anchor", "middle").attr("dy", (item) => item.kind === "core" ? 50 : 34).text((item) => item.label);
  node.filter((item) => item.kind === "memory").append("title").text((item) => item.label);
  const inspect = (_event, item) => {
    const panel = document.querySelector("#memory-inspector");
    if (!panel) return;
    if (item.memory) {
      panel.innerHTML = `<small>${esc(titleCase(item.memory.scope_kind))} \xB7 ${esc(item.memory.scope_id)}</small><h3>${esc(item.memory.title)}</h3><p>${esc(item.memory.body)}</p><div class="memory-inspector-stats"><span><strong>${esc(titleCase(item.memory.trust))}</strong> trust</span><span><strong>${esc(titleCase(item.memory.created_by))}</strong> author</span></div>`;
    } else {
      const count = item.kind === "core" ? state.memories.length : state.memories.filter((memory) => `scope:${memory.scope_kind}` === item.id).length;
      panel.innerHTML = `<small>${esc(item.kind === "core" ? "SHARED FABRIC" : "AUTHORIZATION SCOPE")}</small><h3>${esc(item.label)}</h3><p>${count} readable ${count === 1 ? "memory is" : "memories are"} connected here. Scope policy determines which agents may retrieve the content.</p>`;
    }
  };
  node.on("click", inspect).on("keydown", (event, item) => {
    if (event.key === "Enter" || event.key === " ") inspect(event, item);
  });
  node.call(drag_default().on("start", (event, item) => {
    if (!event.active) state.memorySimulation.alphaTarget(0.2).restart();
    item.fx = item.x;
    item.fy = item.y;
  }).on("drag", (event, item) => {
    item.fx = event.x;
    item.fy = event.y;
  }).on("end", (event, item) => {
    if (!event.active) state.memorySimulation.alphaTarget(0);
    item.fx = null;
    item.fy = null;
  }));
  state.memorySimulation = simulation_default(nodes).force("link", link_default(links).id((item) => item.id).distance((linkItem) => linkItem.target.kind === "memory" ? 68 : 125).strength(0.72)).force("charge", manyBody_default().strength((item) => item.kind === "core" ? -650 : item.kind === "scope" ? -220 : -45)).force("collide", collide_default().radius((item) => item.radius + 10)).force("center", center_default(width / 2, height / 2)).on("tick", () => {
    line.attr("x1", (item) => item.source.x).attr("y1", (item) => item.source.y).attr("x2", (item) => item.target.x).attr("y2", (item) => item.target.y);
    node.attr("transform", (item) => `translate(${item.x},${item.y})`);
  });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.each(function animateNode(_item, index2) {
    this.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: reducedMotion ? 1 : 360, delay: reducedMotion ? 0 : index2 * 14, easing: "ease-out", fill: "both" }
    );
  });
}
function renderSystems() {
  const cards = state.data.systems.map((system, index2) => {
    const runtime = runtimeForSystem(system.id);
    return `<button class="system-card" data-system="${esc(system.id)}"><div class="system-card-top"><span class="system-glyph system-${index2 % 6}">${initials(system.name)}</span>${status(runtime.status)}</div><h2>${esc(system.name)}</h2><p>${esc(system.description)}</p><div class="system-fabric"><span class="${system.shared_memory ? "is-on" : ""}">\u2726 Memory</span><span class="${system.shared_skills ? "is-on" : ""}">\u25C7 Skills</span></div><footer><span>${runtime.actions?.length || 0} executable actions</span><span>${esc(titleCase(runtime.adapter))} \u2197</span></footer></button>`;
  }).join("");
  page.innerHTML = `${heading("Unified runtime layer", "Every AI system, one AGIOS contract.", "Hermes, Codex, Gemini, Antigravity, DeepSeek, Ollama, OpenCode and future runtimes share skills, scoped memory, governance and business context without pretending planned adapters are connected.")}<div class="system-summary"><span><strong>${state.data.summary.systems}</strong> registered systems</span><span><strong>${state.data.summary.live_or_detected_systems}</strong> live, detected or routed</span><span><strong>${state.data.summary.shared_skills}</strong> shared skills</span><span><strong>${state.data.operational?.shared_memory?.fact_count ?? 0}</strong> AGIOS shared memories</span></div><div class="system-grid">${cards}</div>`;
}
var hermesModes = [
  ["chat", "Chat", "\u25A1"],
  ["apollo", "Apollo", "\u25D6"],
  ["oracle", "Hermes Oracle", "\u25CE"],
  ["astros", "Hermes Astros", "\u2726"],
  ["studio", "Studio", "\u2727"],
  ["sessions", "Sessions", "\u25F7"],
  ["outreach", "Outreach", "\u2709"],
  ["mixture", "Mixture", "\u25C8"],
  ["workspace", "Workspace", "\u25B1"],
  ["mcps", "MCPs", "\u2318"],
  ["manage", "Manage", "\u25A6"],
  ["control", "Control Room", ">_"],
  ["goal", "Goal Mode", "\u25CE"]
];
var studioModules = [
  { id: "loops", name: "Loop Engineering", note: "Build repeatable, reviewable workflows", mode: "goal", status: "live" },
  { id: "music", name: "Music Studio", note: "Plan and route approved audio production", mode: "goal", status: "guided" },
  { id: "video", name: "Video Agent", note: "Coordinate scripts, scenes, assets and review", mode: "goal", status: "guided" },
  { id: "seo", name: "SEO Content System", note: "Research, briefs, content and independent review", mode: "astros", status: "live" },
  { id: "code", name: "JCode Workspace", note: "Open exact-approved repository work", mode: "workspace", status: "live" },
  { id: "research", name: "Competitor Oracle", note: "Scheduled evidence-backed competitor intelligence", mode: "oracle", status: "live" }
];
function hermesAgent(id2, fallback = "default") {
  return state.data.agents.find((agent) => agent.id === id2) || state.data.agents.find((agent) => agent.id === fallback) || state.data.agents[0];
}
function wakeWordPanel() {
  const supported = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  return `<section class="wake-word-panel ${state.wakeArmed ? "is-armed" : ""}"><div class="wake-orb">${state.wakeArmed ? "\u25C9" : "\u25CC"}</div><div><small>VOICE INTERFACE</small><h3>\u201Chey hermes\u201D</h3><p>${supported ? "Arm once to bring the active Hermes composer into focus when the wake phrase is heard." : "Wake-word recognition is unavailable in this browser; push-to-talk remains available."}</p></div><button type="button" data-wake-toggle ${supported ? "" : "disabled"}>${state.wakeArmed ? "Listening" : "Arm voice"}</button></section>`;
}
function specialistIntro(name, subtitle, description, agent, metrics = []) {
  return `<section class="specialist-intro"><div class="specialist-orb">${initials(name)}</div><div><small>HERMES SPECIALIST \xB7 ${esc(agent.profession || titleCase(agent.role))}</small><h2>${esc(name)}</h2><p>${esc(description)}</p></div><div class="specialist-metrics">${metrics.map(([label, value]) => `<span><small>${esc(label)}</small><strong>${esc(value)}</strong></span>`).join("")}</div><div class="specialist-status">${status(agent.state)}<small>${esc(subtitle)}</small></div></section>`;
}
function oracleRadar() {
  const oracleSchedules = state.data.schedules.filter((job) => /oracle|competitor|trend|research|watch/i.test(`${job.name} ${job.id}`));
  const recentRuns = state.runs.filter((run) => run.agent_id === "researcher").slice(0, 6);
  const items = [
    ...oracleSchedules.map((job) => ({ kind: "SCHEDULED WATCH", title: job.name, note: `${job.schedule || "Registered cadence"} \xB7 ${relativeTime(job.next_run_at)}`, state: job.state })),
    ...recentRuns.map((run) => ({ kind: "EVIDENCE RUN", title: run.objective, note: `${titleCase(run.mode)} \xB7 ${new Date(run.created_at).toLocaleString()}`, state: run.status }))
  ];
  return `<section class="oracle-radar"><header><div><p class="eyebrow">INTELLIGENCE RADAR</p><h2>Rank signals. Preserve sources. Show the delta.</h2><p>Oracle scores permitted evidence by recency, relevance, authority, and change magnitude. Draft actions return for review; publishing and outreach remain locked.</p></div><span>${items.length} REAL WATCHES / RUNS</span></header><div class="radar-contract"><span>1 \xB7 COLLECT</span><i>\u2192</i><span>2 \xB7 CITE</span><i>\u2192</i><span>3 \xB7 RANK</span><i>\u2192</i><span>4 \xB7 COMPARE</span><i>\u2192</i><span>5 \xB7 PROPOSE</span></div><div class="radar-grid">${items.length ? items.map((item, index2) => `<article><b>${String(index2 + 1).padStart(2, "0")}</b><div><small>${item.kind}</small><h3>${esc(item.title)}</h3><p>${esc(item.note)}</p></div>${status(item.state)}</article>`).join("") : `<div class="workspace-empty workspace-card"><b>\u25CE</b><strong>No Oracle watch has produced evidence yet</strong><span>Create an exact-approved research goal or register a Hermes schedule; AGIOS will not invent trend signals.</span></div>`}</div></section>`;
}
function sessionArchive() {
  const query = state.sessionQuery.trim().toLowerCase();
  const runs = state.runs.filter((run) => !query || `${run.objective} ${run.response || ""} ${run.agent_id} ${run.mode} ${run.status}`.toLowerCase().includes(query));
  return `<section class="session-archive"><header><div><p class="eyebrow">Private local archive</p><h2>Every AGIOS session, searchable</h2><p>Transcripts stay in the private runtime store; the audit journal receives digests and status only.</p></div><label class="session-search">\u2315<input id="session-search" aria-label="Search sessions" value="${esc(state.sessionQuery)}" placeholder="Search sessions, agents and results"/></label></header><div class="session-summary"><span><strong>${state.runs.length}</strong> saved</span><span><strong>${state.runs.filter((run) => run.status === "completed").length}</strong> completed</span><span><strong>${state.runs.filter((run) => ["queued", "running"].includes(run.status)).length}</strong> active</span></div><div class="runtime-session-list">${runs.length ? runs.map((run) => runCard(run, { transcript: true })).join("") : `<div class="workspace-empty workspace-card large"><b>\u25F7</b><strong>No matching sessions</strong><span>Change the search or start a real Hermes run.</span></div>`}</div></section>`;
}
function studioDesk() {
  const modules = studioModules.filter((module) => !state.hiddenStudios[module.id]);
  return `<section class="studio-desk"><header><div><p class="eyebrow">Modular operating desk</p><h2>Keep the tools that move the business forward.</h2><p>Each visible module opens a real AGIOS workflow. Hide modules you do not need from Manage.</p></div><span>${modules.length} visible modules</span></header><div class="studio-module-grid">${modules.map((module, index2) => `<article class="studio-module module-${index2 % 4}"><div class="studio-module-icon">${initials(module.name)}</div><small>${esc(titleCase(module.status))}</small><h3>${esc(module.name)}</h3><p>${esc(module.note)}</p><footer>${status(module.status === "live" ? "ready" : "planned")}<button data-studio-mode="${esc(module.mode)}" data-studio-name="${esc(module.name)}">Open workflow \u2192</button></footer></article>`).join("") || `<div class="workspace-empty workspace-card large"><b>\u2727</b><strong>Every studio module is hidden</strong><span>Open Manage to restore the modules you need.</span></div>`}</div></section>`;
}
function modelManager() {
  const agentRows = state.data.agents.map((agent) => {
    const models = modelsForAgent(agent);
    const selected = state.modelPreferences[agent.id] || "";
    return `<form class="model-assignment" data-model-preference-form data-agent-id="${esc(agent.id)}"><div class="agent-orb">${initials(agent.name || agent.id)}</div><div><strong>${esc(agent.name || titleCase(agent.id))}</strong><small>${esc(agent.profession || titleCase(agent.role))}</small></div><label>Default model<select name="modelId"><option value="">Hermes profile default</option>${models.map((model) => `<option value="${esc(model.id)}" ${selected === model.id ? "selected" : ""}>${esc(model.id)} \xB7 ${esc(model.provider)}</option>`).join("")}</select></label><button type="submit">Save</button></form>`;
  }).join("");
  const moduleRows = studioModules.map((module) => `<button class="module-toggle ${state.hiddenStudios[module.id] ? "is-off" : ""}" data-toggle-studio="${esc(module.id)}"><span>${esc(module.name)}</span><em>${state.hiddenStudios[module.id] ? "Hidden" : "Visible"}</em></button>`).join("");
  return `${osReadinessSurface(true)}<div class="manage-grid"><section class="workspace-card model-manager"><p class="eyebrow">Two-click model manager</p><h2>Set each worker's normal brain.</h2><p>This is the persistent default. Use Model Once in Chat, Goal Mode, or Workspace when a single task needs a different approved model.</p><div class="model-assignment-list">${agentRows}</div></section><section class="workspace-card module-manager"><p class="eyebrow">Desk visibility</p><h2>Choose what appears in Studio.</h2><p>Hidden modules remain registered and can be restored at any time.</p><div>${moduleRows}</div></section><section class="workspace-card vault-guide"><p class="eyebrow">Vault Mode</p><h2>Private work is a route policy.</h2><p>Select Private business or Customer restricted in any composer. AGIOS will prefer an eligible local route and will never weaken the data class to reach a model.</p><div class="policy-row"><span>Local eligible model</span><em>Preferred</em></div><div class="policy-row"><span>Trusted external route</span><em>Exact approval</em></div><div class="policy-row"><span>Free or untrusted fallback</span><em>Blocked</em></div></section></div>`;
}
function hermesControlRoom(system) {
  const models = modelsForSystem(system);
  return `<div class="control-grid"><section class="workspace-card control-primary"><p class="eyebrow">Hermes control room</p><h3>One supervised runtime, many workers</h3><div class="control-readout"><span><small>GATEWAY</small><strong>${state.data.runtime.gateway_running ? "Online" : "Standing by"}</strong></span><span><small>MODELS</small><strong>${models.length}</strong></span><span><small>MEMORY</small><strong>Shared</strong></span><span><small>SESSIONS</small><strong>${state.runs.length}</strong></span></div></section><section class="workspace-card"><p class="eyebrow">Guardrails</p><h3>Hermes knows when to knock.</h3><div class="policy-row"><span>Chat, voice, vision and private sessions</span><em>Live</em></div><div class="policy-row"><span>Goals and workspace work</span><em>Exact approval</em></div><div class="policy-row"><span>Shared memory and skills</span><em>Scoped</em></div><div class="policy-row"><span>Messages, publishing, purchases and deployment</span><em>Locked</em></div></section></div>`;
}
function hermesModeContent(system) {
  const chief = hermesAgent("default");
  const researcher = hermesAgent("researcher");
  const manager = hermesAgent("manager");
  const builder = hermesAgent("builder");
  if (state.systemMode === "chat") return `${wakeWordPanel()}${operationalWorkspace(chief, "chat")}`;
  if (state.systemMode === "apollo") return `${specialistIntro("Hermes Apollo", "Voice operations", "Speak naturally, review the transcript, choose the model route and send through the same shared-memory contract.", chief, [["INPUT", state.voice?.input?.enabled ? "Ready" : "Unavailable"], ["OUTPUT", state.voice?.output?.enabled ? "Ready" : "Unavailable"]])}${wakeWordPanel()}${operationalWorkspace(chief, "chat")}`;
  if (state.systemMode === "oracle") return `${specialistIntro("Hermes Oracle", "Competitor intelligence", "Research competitors with citations, keep the evidence in shared memory and use Hermes schedules for recurring watches.", researcher, [["SCHEDULES", String(state.data.schedules.length)], ["MEMORY", String(state.data.operational?.shared_memory?.fact_count ?? 0)]])}${oracleRadar()}${operationalWorkspace(researcher, "goal")}`;
  if (state.systemMode === "astros") return `${specialistIntro("Hermes Astros", "SEO and content intelligence", "Track topics, keywords and content opportunities, then hand reviewed briefs to the Growth department.", researcher, [["SKILLS", String(researcher.skill_count ?? "\u2014")], ["ROUTES", String(modelsForAgent(researcher).length)]])}${operationalWorkspace(researcher, "goal")}`;
  if (state.systemMode === "studio") return studioDesk();
  if (state.systemMode === "sessions") return sessionArchive();
  if (state.systemMode === "outreach") return `${specialistIntro("Outreach Desk", "Draft-only external work", "Research and prepare outreach while every final recipient, message and send action remains owner approved.", manager, [["APPROVALS", String(state.runs.filter((run) => run.status === "awaiting_approval").length)]])}${operationalWorkspace(manager, "goal")}`;
  if (state.systemMode === "mixture") return `<section class="mixture-desk"><header><p class="eyebrow">Multi-agent team</p><h2>Assemble the right workers around one outcome.</h2><p>Every professional identity shares AGIOS memory and skills inside its authorized scope.</p></header><div class="mixture-agent-grid">${state.data.agents.map((agent) => `<button data-agent="${esc(agent.id)}"><span class="agent-orb">${initials(agent.name || agent.id)}</span><strong>${esc(agent.name || titleCase(agent.id))}</strong><small>${esc(agent.profession || titleCase(agent.role))}</small>${status(agent.state)}</button>`).join("")}</div></section>`;
  if (state.systemMode === "workspace") return operationalWorkspace(builder, "workspace");
  if (state.systemMode === "mcps") return `<section class="tool-catalog">${state.data.apps.filter((app) => app.kind === "mcp").map((app) => `<article><header><span>\u2318</span>${status(app.status === "connected" ? "registered" : app.status)}</header><h3>${esc(app.name)}</h3><p>Shared MCP \xB7 ${esc(titleCase(app.status === "connected" ? "registered" : app.status))}</p><small>${app.status === "connected" ? "Cataloged in Hermes; direct AGIOS execution remains locked until an audited action adapter is enabled" : "Configuration or adapter required"}</small></article>`).join("")}</section>`;
  if (state.systemMode === "manage") return modelManager();
  if (state.systemMode === "control") return hermesControlRoom(system);
  if (state.systemMode === "goal") return `${specialistIntro("Goal Mode", "Set the target. Walk away.", "Hermes works in the background, preserves the real session and returns the result for review. Exact approval remains bound to the complete context.", chief, [["ACTIVE", String(state.runs.filter((run) => ["queued", "running"].includes(run.status)).length)], ["TOTAL", String(state.runs.filter((run) => run.mode === "goal").length)]])}${operationalWorkspace(chief, "goal")}`;
  return studioDesk();
}
function renderHermesSystem(system) {
  const modelChips = modelsForSystem(system).map((model) => `<span class="model-chip"><i class="status-dot status-${model.location === "local" ? "ready" : "routed"}"></i>${esc(model.id)}</span>`).join("");
  page.innerHTML = `<div class="system-hero hermes-hero"><div class="system-identity"><p class="eyebrow">IV. \u2014 AGENT \xB7 HERMES</p><h1>Hermes</h1><p>Primary AGIOS worker. Chat, voice, research, goals, sessions, skills, workspaces and tools at one desk.</p><small>${new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Yerevan" }).format(/* @__PURE__ */ new Date())} \xB7 LOCAL \xB7 STUDIO</small></div><div class="system-hero-status">${status(system.status)}<small>${state.data.runtime.gateway_running ? "Hermes online" : "Hermes standing by"}</small></div></div><div class="mode-strip system-modes hermes-modes">${hermesModes.map(([id2, label, icon]) => `<button class="${state.systemMode === id2 ? "is-active" : ""}" data-system-mode="${id2}"><span>${icon}</span>${label}</button>`).join("")}</div><div class="model-strip hermes-model-strip" aria-label="Hermes model routes">${modelChips}</div><div class="agent-mode-content hermes-mode-content">${hermesModeContent(system)}</div>`;
  renderSystemNavigation();
}
function systemModeContent(system) {
  const models = modelsForSystem(system);
  const runtime = runtimeForSystem(system.id);
  if (state.systemMode === "chat") return routedSystemLauncher(system, "chat");
  if (state.systemMode === "goals") return routedSystemLauncher(system, "goal");
  if (state.systemMode === "workspace") return routedSystemLauncher(system, "workspace");
  if (state.systemMode === "sessions") {
    const runs = state.runs.filter((run) => systemRunMatches(run, system));
    return `<section class="session-archive"><header><div><p class="eyebrow">REAL ROUTED ACTIVITY</p><h2>${esc(system.name)} sessions</h2><p>Only AGIOS runs that used this runtime or one of its governed model routes appear here.</p></div><span>${runs.length} verified records</span></header><div class="runtime-session-list">${runs.length ? runs.map((run) => runCard(run, { transcript: run.mode === "chat" })).join("") : `<div class="workspace-empty workspace-card large"><b>\u25F7</b><strong>No ${esc(system.name)} runs yet</strong><span>Open an available action to create the first real session.</span></div>`}</div></section>`;
  }
  if (state.systemMode === "models") return renderModelCards(models);
  if (state.systemMode === "memory") return `<div class="fabric-banner memory-route"><span>\u2726</span><div><small>AGIOS MEMORY CONTRACT</small><h2>${esc(system.name)} is attached to the shared fabric</h2><p>Memory is managed once in Memory Studio, then retrieved here through the system's authorized scope. No duplicate provider galaxy or competing store is shown.</p></div><button data-view-link="memory">Open Memory Studio \u2197</button></div>`;
  if (state.systemMode === "skills") {
    const skills = state.data.shared_fabric.skills.items.slice(0, 24);
    return `<div class="fabric-banner"><span>\u25C7</span><div><small>GLOBAL SKILL REGISTRY</small><h2>${state.data.shared_fabric.skills.inventory} live skills available</h2><p>${esc(system.name)} uses the shared catalog through its AGIOS capability policy. Install once; eligible systems discover the update.</p></div><button data-view-link="skills">Open full registry \u2197</button></div><div class="skill-preview-grid">${skills.map((skill) => `<article><span>${esc(skill.category)}</span><strong>${esc(titleCase(skill.name))}</strong><p>${esc(skill.description)}</p></article>`).join("")}</div>`;
  }
  if (state.systemMode === "agents") {
    return system.id === "hermes" ? `<div class="data-panel"><div class="data-head columns-agents"><span>Profile</span><span>State</span><span>Model</span><span>Skills</span><span>Wake</span></div>${state.data.agents.map((agent) => `<div class="data-row columns-agents clickable-row" data-agent="${esc(agent.id)}"><div><strong>${esc(agent.id)}</strong><p>${esc(titleCase(agent.role))}</p></div><span>${status(agent.state)}</span><span>${esc(agent.model || "Unavailable")}</span><span>${agent.skill_count ?? "\u2014"}</span><span>Event or schedule</span></div>`).join("")}</div>` : `<div class="workspace-empty workspace-card large"><b>\u25C9</b><strong>Agent adapter not connected</strong><span>${esc(system.name)} is registered, but AGIOS cannot yet inspect or dispatch its workers.</span></div>`;
  }
  if (state.systemMode === "repositories") return repositorySurface();
  if (state.systemMode === "control") {
    return `<div class="control-grid"><section class="workspace-card control-primary"><p class="eyebrow">Executable adapter status</p><h3>${esc(system.name)} \xB7 ${esc(titleCase(runtime.status))}</h3><div class="control-readout"><span><small>DETECTED</small><strong>${runtime.detected ? "Yes" : "No"}</strong></span><span><small>ADAPTER</small><strong>${esc(titleCase(runtime.adapter))}</strong></span><span><small>APPROVAL</small><strong>${esc(titleCase(runtime.approval))}</strong></span><span><small>SANDBOX</small><strong>${esc(titleCase(runtime.sandbox))}</strong></span></div></section><section class="workspace-card"><p class="eyebrow">Live action contract</p><h3>${runtime.actions?.length || 0} executable functions</h3>${runtime.actions?.length ? runtime.actions.map((action) => `<div class="policy-row"><span>${esc(titleCase(action))}</span><em>Executable</em></div>`).join("") : `<div class="boundary-note">No execution buttons are exposed because this adapter is absent or unaudited. AGIOS will not pretend that a registry entry is a working integration.</div>`}</section></div>`;
  }
  const boundary = runtime.execution_enabled ? "The displayed actions use shared AGIOS governance, memory and skill contracts." : runtime.detected ? "The software is installed, but authentication and an audited action adapter are not verified. No execution controls are exposed." : "This system is represented in AGIOS, but its executable adapter is not connected yet.";
  return `<div class="system-overview"><section class="workspace-card system-brief"><p class="eyebrow">${esc(titleCase(system.kind))}</p><h3>${esc(system.description)}</h3><div class="fabric-readout"><span><small>STATUS</small><strong>${esc(titleCase(runtime.status))}</strong></span><span><small>MODELS</small><strong>${models.length}</strong></span><span><small>MEMORY</small><strong>${system.shared_memory ? "Shared" : "No"}</strong></span><span><small>SKILLS</small><strong>${system.shared_skills ? state.data.summary.shared_skills : "No"}</strong></span></div></section><section class="workspace-card"><p class="eyebrow">Registered capabilities</p><h3>System capability catalog</h3><div class="skill-cloud">${system.capabilities.map((capability) => `<span>${esc(titleCase(capability))}</span>`).join("")}</div><div class="boundary-note">${esc(boundary)}</div></section></div>`;
}
function renderSystem() {
  const system = state.data.systems.find((item) => item.id === state.selectedSystem) || state.data.systems[0];
  state.selectedSystem = system.id;
  if (system.id === "hermes") {
    renderHermesSystem(system);
    return;
  }
  const runtime = runtimeForSystem(system.id);
  const actions = runtime.actions || [];
  const modes = [["overview", "Overview"]];
  if (actions.includes("chat") || actions.includes("local-inference")) modes.push(["chat", "Chat"]);
  if (actions.includes("goal")) modes.push(["goals", "Goals"]);
  if (actions.some((action) => action.startsWith("workspace"))) modes.push(["workspace", "Workspace"]);
  if (runtime.execution_enabled) modes.push(["sessions", "Sessions"]);
  modes.push(["models", "Models"], ["skills", "Skills"], ["memory", "Memory"], ["control", "Control Room"]);
  if (!modes.some(([id2]) => id2 === state.systemMode)) state.systemMode = "overview";
  page.innerHTML = `<div class="system-hero"><div class="system-identity"><p class="eyebrow">AI SYSTEM \xB7 ${esc(titleCase(system.kind))}</p><h1>${esc(system.name)}</h1><p>${esc(system.description)}</p></div><div class="system-hero-status">${status(runtime.status)}<small>${esc(titleCase(runtime.adapter))}</small></div></div><div class="mode-strip system-modes">${modes.map(([id2, label]) => `<button class="${state.systemMode === id2 ? "is-active" : ""}" data-system-mode="${id2}"><span>${id2 === "memory" ? "\u2726" : id2 === "skills" ? "\u25C7" : id2 === "models" ? "\u25CC" : id2 === "control" ? ">_" : id2 === "workspace" ? "\u25B1" : "\u25A1"}</span>${label}</button>`).join("")}</div><div class="agent-mode-content">${systemModeContent(system)}</div>`;
  renderSystemNavigation();
}
function skillHygieneSurface() {
  const pending = state.skillProposals.filter((item) => item.status !== "installed");
  const installed = state.skillProposals.filter((item) => item.status === "installed");
  return `<section class="skill-hygiene"><header><div><p class="eyebrow">SKILL LAB</p><h2>Learn, test, approve, then share.</h2></div><button data-view-link="agents">Open professional growth \u2192</button></header><div><article><small>CANDIDATE INTAKE</small><strong>${pending.length}</strong><p>URLs, repeated corrections, and completed work enter as proposals\u2014not trusted instructions.</p></article><article><small>VALIDATION</small><strong>Required</strong><p>Source, license, malicious content, alternatives, duplicates, and a test result are checked before install.</p></article><article><small>LIVE EVOLUTION</small><strong>${installed.length}</strong><p>Installed AGIOS-authored skills remain versioned, reviewable, and owner governed.</p></article><article><small>HYGIENE</small><strong>Ongoing</strong><p>Stale, unused, verbose, or superseded skills should be pruned instead of accumulating forever.</p></article></div></section>`;
}
function renderSharedSkills() {
  const registry = state.data.shared_fabric.skills;
  const categories = Object.keys(registry.categories);
  const filtered = registry.items.filter((skill) => (state.skillCategory === "all" || skill.category === state.skillCategory) && (!state.skillQuery || `${skill.name} ${skill.description}`.toLowerCase().includes(state.skillQuery.toLowerCase())));
  page.innerHTML = `${heading("Shared capability fabric", "Install once. Use everywhere\u2014with policy.", "Hermes, Codex, Gemini, Antigravity, DeepSeek and future workers discover skills through one live AGIOS registry. Skill bodies remain runtime-side.")}${skillHygieneSurface()}<div class="fabric-summary"><div><small>LIVE SKILLS</small><strong>${registry.inventory}</strong></div><div><small>CATEGORIES</small><strong>${categories.length}</strong></div><div><small>AGENTS ATTACHED</small><strong>${registry.attached_agents}</strong></div><div><small>ELIGIBLE SYSTEMS</small><strong>${registry.eligible_systems}</strong></div></div><div class="catalog-toolbar"><label>\u2315<input id="skill-search" value="${esc(state.skillQuery)}" placeholder="Search skills and techniques" /></label><div class="category-strip"><button class="${state.skillCategory === "all" ? "is-active" : ""}" data-skill-category="all">All</button>${categories.slice(0, 8).map((category) => `<button class="${state.skillCategory === category ? "is-active" : ""}" data-skill-category="${esc(category)}">${esc(titleCase(category))} \xB7 ${registry.categories[category]}</button>`).join("")}</div></div><div class="skill-catalog">${filtered.slice(0, 60).map((skill) => `<article><header><span>${esc(skill.category)}</span><em>SHARED</em></header><h3>${esc(titleCase(skill.name))}</h3><p>${esc(skill.description || "No description provided")}</p><footer><span>All authorized agents</span><span>Available</span></footer></article>`).join("")}</div>${filtered.length > 60 ? `<p class="catalog-note">Showing 60 of ${filtered.length} matches. Refine the search to narrow the live registry.</p>` : ""}`;
}
function operationalMemorySurface() {
  const summary = state.data.operational?.shared_memory || { fact_count: 0, scopes: {} };
  const entries = state.memories.map((memory) => `<article class="shared-memory-card"><header><span>${esc(titleCase(memory.scope_kind))} \xB7 ${esc(memory.scope_id)}</span><em>${esc(titleCase(memory.trust))} trust</em></header><h3>${esc(memory.title)}</h3><p>${esc(memory.body)}</p><footer><span>${esc(titleCase(memory.created_by))}</span><time>${new Date(memory.updated_at).toLocaleString()}</time></footer></article>`).join("");
  return `<div class="operational-memory-grid"><form class="memory-compose workspace-card" data-memory-form><div class="compose-title"><div><p class="eyebrow">AGIOS shared store</p><h3>Add durable knowledge</h3></div>${status(state.data.operational?.status || "unavailable")}</div><p>This is the real cross-agent memory layer. Saved facts become retrievable by every agent authorized for the selected scope.</p><label>Title<input name="title" required maxlength="160" placeholder="A concise, stable fact"/></label><label>Memory<textarea name="body" required maxlength="4000" placeholder="Record the verified knowledge, decision, or operating preference. Never include credentials."></textarea></label><div class="operational-options"><label>Scope<select name="scopeKind"><option value="portfolio">Portfolio \xB7 all agents</option><option value="business">Business</option><option value="department">Department</option><option value="project">Project</option><option value="private">Private agent</option></select></label><label>Scope ID<input name="scopeId" required maxlength="128" value="portfolio"/></label></div><div class="compose-submit"><span>${summary.fact_count} shared memories currently stored</span><button type="submit">Save to shared memory</button></div></form><section class="shared-memory-feed"><div class="run-feed-heading"><div><p class="eyebrow">Authorized view \xB7 Default agent</p><h3>${state.memories.length} readable memories</h3></div><span>LIVE</span></div>${entries || `<div class="workspace-empty workspace-card"><b>\u2726</b><strong>The shared store is ready</strong><span>Add the first portfolio memory to make it available to all seven agents.</span></div>`}</section></div>`;
}
function retrievalWorkbench() {
  const mode = state.data.operational?.retrieval?.mode || "scoped-lexical-v1";
  const hits = state.retrievalHits.map((hit) => `<article class="evidence-card"><header><code>${esc(hit.citation_id)}</code><span>${Math.round(Number(hit.score || 0) * 100)}% match</span></header><h3>${esc(hit.title)}</h3><p>${esc(hit.body)}</p><footer><span>${esc(titleCase(hit.scope_kind))} / ${esc(hit.scope_id)}</span><span>${esc(titleCase(hit.trust))} trust</span></footer></article>`).join("");
  const agents = state.data.agents.map((agent) => `<option value="${esc(agent.id)}">${esc(titleCase(agent.id))}</option>`).join("");
  return `<section class="retrieval-workbench"><form class="workspace-card retrieval-compose" data-retrieval-form><div><p class="eyebrow">RAG evidence console</p><h3>Search what an agent is allowed to know</h3><p>Mode: ${esc(mode)}. Results include provenance and citation IDs; no-match queries return no evidence.</p></div><div class="retrieval-fields"><label>Agent<select name="agentId">${agents}</select></label><label>Project scope<input name="projectId" maxlength="128" placeholder="Optional project ID"/></label><label>Evidence query<input name="query" required maxlength="8000" placeholder="What verified knowledge do we have about..."/></label><button type="submit">Retrieve evidence</button></div></form><div class="evidence-feed">${hits || `<div class="workspace-empty workspace-card"><b>RAG</b><strong>Evidence appears here</strong><span>Searches are local and restricted to the selected agent's authorized scopes.</span></div>`}</div></section>`;
}
function memoryLayerSurface() {
  const layers = [
    ["IDENTITY", "Standing context", state.data.shared_fabric.memory.fact_count, "Small, stable profile facts"],
    ["EPISODIC", "Sessions", state.runs.length, "Searchable work history"],
    ["KNOWLEDGE", "Durable facts", state.memories.length, "Verified scoped records"],
    ["PROJECT", "Repositories", state.data.repositories.length, "Code and workspace boundaries"],
    ["WORKING", "Temporary assets", state.visionAssets.length, "Retention-controlled task context"]
  ];
  return `<section class="memory-layers"><header><div><p class="eyebrow">MEMORY ARCHITECTURE</p><h2>One studio, five distinct memory layers.</h2><p>Agents see one authorized experience; AGIOS keeps identity, history, knowledge, projects, and temporary context separate underneath.</p></div><span>SCOPED BY POLICY</span></header><div>${layers.map(([kind, name, count, note]) => `<article><small>${kind}</small><strong>${count}</strong><h3>${name}</h3><p>${note}</p></article>`).join("")}</div><footer><strong>Promotion gate:</strong> imported text and completed work become durable knowledge only with a source, scope, trust level, and explicit save. Contradictions remain visible for review.</footer></section>`;
}
function renderSharedMemory() {
  page.innerHTML = `${heading("Memory Studio", "One live memory, safely shared across every agent.", "Explore, search and curate durable knowledge in one place. Every runtime reads through AGIOS scope policy; credentials never enter model context.")}${memoryLayerSurface()}<div class="scope-strip">${state.data.shared_fabric.memory.scopes.map((scope) => `<span><i></i><strong>${esc(scope.label)}</strong><small>${esc(titleCase(scope.policy))}</small></span>`).join("")}</div>${memoryStudioSurface()}${retrievalWorkbench()}${operationalMemorySurface()}`;
  window.requestAnimationFrame(renderMemoryStudioGraph);
}
function repositorySurface() {
  return `<div class="repository-grid">${state.data.repositories.map((repo) => `<article><header><span>\u25B1</span>${status(repo.status)}</header><h3>${esc(repo.name)}</h3><p>${esc(titleCase(repo.visibility))} \xB7 owner ${esc(titleCase(repo.owner_agent_id))}</p><div class="boundary-note">Repository paths and customer contents stay server-side. External actions require explicit approval.</div></article>`).join("")}</div>`;
}
function renderRepositories() {
  page.innerHTML = `${heading("Repository fabric", "Every workspace can be operated without losing its boundary.", "AGIOS registers repositories and project workspaces for agents and systems, while customer paths and contents remain hidden from the browser.")}<div class="system-summary"><span><strong>${state.data.summary.repositories}</strong> registered repositories</span><span><strong>${state.workspaces.length}</strong> approved workspaces</span><span><strong>${state.data.summary.shared_skills}</strong> reusable skills</span></div>${workspaceRegistryCard()}${repositorySurface()}`;
}
function renderPerformance() {
  const runs = runsForPeriod();
  const completed = runs.filter((run) => run.status === "completed");
  const failed = runs.filter((run) => ["failed", "interrupted"].includes(run.status));
  const active = runs.filter((run) => ["queued", "running"].includes(run.status));
  const decided = completed.length + failed.length;
  const successRate = decided ? Math.round(completed.length / decided * 100) : null;
  const durations = completed.map((run) => {
    const start2 = new Date(run.started_at || run.created_at).valueOf();
    const end = new Date(run.completed_at).valueOf();
    return Number.isFinite(start2) && Number.isFinite(end) ? Math.max(0, end - start2) : null;
  }).filter((value) => value !== null);
  const averageSeconds = durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length / 1e3) : null;
  const byRoute = /* @__PURE__ */ new Map();
  for (const run of runs) {
    const route = run.model || run.provider || run.runtime_id || "profile default";
    const current = byRoute.get(route) || { total: 0, completed: 0, failed: 0 };
    current.total += 1;
    if (run.status === "completed") current.completed += 1;
    if (["failed", "interrupted"].includes(run.status)) current.failed += 1;
    byRoute.set(route, current);
  }
  const routeRows = [...byRoute.entries()].sort((a2, b) => b[1].total - a2[1].total).map(([route, counts]) => `<div class="data-row columns-integrations"><div><strong>${esc(route)}</strong><p>Observed AGIOS runs</p></div><span>${counts.total}</span><span>${counts.completed} completed</span><span>${counts.failed} failed</span></div>`).join("");
  const recent = runs.slice(0, 12).map((run) => `<div class="data-row columns-integrations"><div><strong>${esc(run.objective.slice(0, 72))}</strong><p>${new Date(run.created_at).toLocaleString()}</p></div><span>${esc(titleCase(run.agent_id))}</span><span>${status(run.status)}</span><span>${esc(run.model || run.provider || run.runtime_id)}</span></div>`).join("");
  page.innerHTML = `${heading("Performance", "Measured work, not agent theatre.", "This view uses real AGIOS run records. Provider spend and token totals remain unavailable until a trusted usage adapter reports them.", periodControl())}
    <section class="signal-grid" aria-label="Runtime performance signals">
      ${signalCard("Runs", runs.length, `${active.length} active \xB7 ${runs.filter((run) => run.status === "awaiting_approval").length} awaiting approval`, "coral", [20, 28, 35, 32, 46, 51, 48, 63, 68, 74, 82, 90])}
      ${signalCard("Verified completion", successRate === null ? "Unavailable" : `${successRate}%`, `${completed.length} completed \xB7 ${failed.length} failed`, "mint", [22, 29, 38, 45, 52, 58, 66, 70, 76, 81, 86, 92])}
      ${signalCard("Average completion", averageSeconds === null ? "Unavailable" : `${averageSeconds}s`, "completed AGIOS runtime sessions", "violet", [75, 70, 66, 61, 57, 51, 45, 39, 34, 28, 22, 18])}
    </section>
    <section class="panel"><header class="panel-header"><div><h2>Route evidence</h2><p>Real outcomes grouped by the selected model or runtime route</p></div><span>${byRoute.size} observed</span></header><div class="data-panel"><div class="data-head columns-integrations"><span>Route</span><span>Runs</span><span>Completed</span><span>Failed</span></div>${routeRows || `<div class="workspace-empty"><strong>No route evidence in this period</strong><span>Complete a chat or approved goal to establish the first measurement.</span></div>`}</div></section>
    <section class="panel"><header class="panel-header"><div><h2>Recent runtime evidence</h2><p>Requests, status and selected route from the private AGIOS session store</p></div><button data-view-link="artifacts">Open artifacts \u2192</button></header><div class="data-panel"><div class="data-head columns-integrations"><span>Run</span><span>Agent</span><span>Status</span><span>Route</span></div>${recent || `<div class="workspace-empty"><strong>No runs in this period</strong></div>`}</div></section>`;
}
function renderSettings() {
  page.innerHTML = `${heading("System settings", "Policies before power.", "See whether the complete Agent OS foundation is present and which boundaries remain non-negotiable.")}${osReadinessSurface()}<div class="settings-grid"><section class="workspace-card"><p class="eyebrow">OPERATING PRINCIPLE</p><h2>One studio, not one unrestricted super-agent.</h2><p>AGIOS connects every approved model, CLI, MCP, application, repository, skill, memory, schedule, and artifact while retaining the authority boundary of each route.</p><div class="policy-row"><span>Agents improve from verified work</span><em>Proposal only</em></div><div class="policy-row"><span>New specialist roles</span><em>Distinct recurring job</em></div><div class="policy-row"><span>Unused workers</span><em>Ready, no token use</em></div></section><section class="workspace-card"><p class="eyebrow">NON-NEGOTIABLE</p><h2>Human judgment remains part of the OS.</h2><div class="policy-row"><span>Publishing, outreach, delivery, and deployment</span><em>Exact approval</em></div><div class="policy-row"><span>Purchases and financial actions</span><em>Transaction approval</em></div><div class="policy-row"><span>Skill or code self-modification</span><em>Review and validation</em></div><div class="policy-row"><span>Customer/private data fallback</span><em>No downgrade</em></div></section></div>`;
}
function renderMesh() {
  const nodes = state.data.mesh || [];
  const agents = nodes.filter((node) => node.kind === "agent");
  const systems = nodes.filter((node) => node.kind === "system");
  const cards = nodes.map((node, index2) => {
    const collaboration = node.collaboration || {};
    const badges = [
      collaboration.a2a ? "A2A" : null,
      collaboration.shared_memory ? "Memory" : null,
      collaboration.shared_skills ? "Skills" : null
    ].filter(Boolean);
    const stateLabel = esc(String(node.state || "planned"));
    return `<article class="mesh-card mesh-${index2 % 6}"><header><span class="mesh-glyph">${esc(initials(node.name || node.id))}</span>${status(node.state)}</header><h3>${esc(node.name || titleCase(node.id))}</h3><small>${esc(node.kind)} \xB7 ${esc(node.id)}${node.provider ? ` \xB7 ${esc(node.provider)}` : ""}</small><p>${esc(node.description || node.biography || "")}</p><div class="mesh-capabilities">${(node.capabilities || []).slice(0, 5).map((cap) => `<span>${esc(cap)}</span>`).join("")}</div><footer><div class="mesh-badges">${badges.map((badge) => `<span class="is-on">${badge}</span>`).join("") || `<span>isolated</span>`}</div><em>${esc(stateLabel)}</em></footer></article>`;
  }).join("");
  page.innerHTML = `${heading("Agent Mesh", "Every AI in your operating system, one registry.", "Hermes specialists, Codex, OpenClaw, Gemini, Claude and future runtimes share one governance contract. Each node shows what it can do, what it shares, and whether it can collaborate through the local A2A gateway.")}<div class="mesh-summary"><span><strong>${agents.length}</strong> specialist agents</span><span><strong>${systems.length}</strong> AI systems</span><span><strong>${nodes.filter((node) => node.collaboration?.a2a).length}</strong> A2A-ready</span><span><strong>${nodes.filter((node) => node.collaboration?.shared_memory).length}</strong> shared memory</span></div><div class="mesh-grid">${cards}</div><section class="mesh-note"><p class="eyebrow">COLLABORATION CONTRACT</p><h3>Agents work together when needed \u2014 never silently.</h3><p>The local A2A gateway lets agents exchange governed tasks. Shared memory and skills are scoped by business and data class. No agent can wake another, spend tokens, or reach an external system without an exact owner-approved route.</p></section>`;
}
function renderFuture(view) {
  const copy = {
    knowledge: ["Knowledge fabric", "Evidence, memory and context\u2014available where useful, contained where sensitive.", "AGIOS now provides live, business-scoped shared memory for authorized agents. Provenance, retention controls and richer retrieval remain planned without exposing raw private content to the browser."],
    performance: ["Performance", "Measure outcomes, cost and revenue\u2014not agent theatre.", "The evidence layer will connect model spend, work completion, quality gates, pipeline and business results. Missing cost data will remain unavailable, never shown as zero."]
  }[view];
  page.innerHTML = `${heading(copy[0], copy[1], copy[2])}<div class="empty-stage"><div class="seal">\u25C7</div><h2>Operational boundary established</h2><p>The supervised Hermes adapter and shared memory are live. This surface remains staged until its controls can preserve the same local authentication, exact approval and audit guarantees.</p><div class="foundation-roadmap"><span>Foundation</span><span>Memory & events</span><span>Business control</span><span>Bounded autonomy</span></div></div>`;
}
var renderers = { command: renderCommand, portfolio: renderPortfolio, departments: renderDepartments, agents: renderAgents, agent: renderAgent, mesh: renderMesh, systems: renderSystems, system: renderSystem, memory: renderSharedMemory, skills: renderSharedSkills, repositories: renderRepositories, work: renderWork, artifacts: renderArtifacts, paperclip: renderPaperclip, approvals: renderApprovals, automations: renderAutomations, integrations: renderIntegrations, network: renderAgentNetwork, performance: renderPerformance, settings: renderSettings };
function setView(view) {
  if (!state.data || !viewLabels[view]) return;
  state.view = view;
  viewName.textContent = viewLabels[view];
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("is-active", item.dataset.view === view));
  (renderers[view] || (() => renderFuture(view)))();
  renderAgentNavigation();
  renderSystemNavigation();
  history.replaceState(null, "", view === "command" ? "/" : `/${view}`);
  sidebar.classList.remove("is-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
  window.setTimeout(() => void loadOperationalSurface(), 0);
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}
function openModal() {
  const businessSelect = document.querySelector("#directive-business");
  const agentSelect = document.querySelector("#directive-agent");
  businessSelect.innerHTML = state.data.businesses.map((item) => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join("");
  agentSelect.innerHTML = state.data.agents.map((item) => `<option value="${esc(item.id)}">${esc(item.name || titleCase(item.id))} \xB7 ${esc(item.profession || titleCase(item.role))}</option>`).join("");
  agentSelect.innerHTML = `<option value="default">Ari Vale \xB7 Chief of Staff decides</option>`;
  modal.hidden = false;
  modal.querySelector("textarea").focus();
}
function closeModal() {
  modal.hidden = true;
}
function routeSystemAction(button) {
  const system = state.data.systems.find((item) => item.id === button.dataset.routeSystemId);
  if (!system) return;
  const action = button.dataset.routeSystemAction;
  const model = routedModelForSystem(system);
  const preferredDataClass = model?.allowed_data_classes?.includes("internal") ? "internal" : "public";
  if (action === "workspace") {
    state.selectedAgent = "builder";
    state.agentMode = "workspace";
    state.runtimePreferences.builder = ["codex", "deepseek"].includes(system.id) ? "codex" : "hermes";
    if (model) state.modelPreferences.builder = model.id;
    state.dataClassPreferences.builder = preferredDataClass;
    setView("agent");
    return;
  }
  state.selectedSystem = "hermes";
  state.systemMode = action === "goal" ? "goal" : "chat";
  if (model) state.modelPreferences.default = model.id;
  state.dataClassPreferences.default = preferredDataClass;
  setView("system");
}
function paletteItems(query = "") {
  const views = Object.entries(viewLabels).map(([id2, name]) => ({ id: id2, name, type: "View" }));
  const businesses = (state.data?.businesses || []).map((item) => ({ id: "portfolio", name: item.name, type: "Business" }));
  return [...views, ...businesses].filter((item) => item.name.toLowerCase().includes(query.toLowerCase())).slice(0, 9);
}
function renderPalette() {
  paletteResults.innerHTML = `<div class="palette-results">${paletteItems(paletteInput.value).map((item) => `<button class="palette-item" data-palette-view="${esc(item.id)}"><span>${esc(item.name)}</span><small>${item.type}</small></button>`).join("")}</div>`;
}
function openPalette() {
  palette.hidden = false;
  paletteInput.value = "";
  renderPalette();
  paletteInput.focus();
}
function closePalette() {
  palette.hidden = true;
}
function operationalAgentId() {
  if (state.view === "agent") return state.selectedAgent;
  if (state.view === "system" && state.selectedSystem === "hermes") {
    if (["oracle", "astros"].includes(state.systemMode)) return "researcher";
    if (state.systemMode === "outreach") return "manager";
    if (state.systemMode === "workspace") return "builder";
    return "default";
  }
  return null;
}
function rerenderOperationalView() {
  document.querySelector("#approval-count").textContent = state.runs.filter((run) => run.status === "awaiting_approval").length + state.skillProposals.filter((item) => item.status === "awaiting_owner_review").length;
  if (state.view === "agent") renderAgent();
  else if (state.view === "system") renderSystem();
  else if (state.view === "memory") renderSharedMemory();
  else if (state.view === "approvals") renderApprovals();
  else if (state.view === "work") renderWork();
  else if (state.view === "artifacts") renderArtifacts();
  else if (state.view === "skills") renderSharedSkills();
  else if (state.view === "repositories") renderRepositories();
  else if (state.view === "command") renderCommand();
  else if (state.view === "network") renderAgentNetwork();
}
async function loadOperationalSurface() {
  if (!state.data?.operational || state.operationalLoading) return;
  const needsRuns = ["command", "approvals", "work", "artifacts", "memory", "performance"].includes(state.view) || state.view === "agent" && ["chat", "goal", "workspace", "growth", "sessions"].includes(state.agentMode) || state.view === "system" && (["sessions"].includes(state.systemMode) || state.selectedSystem === "hermes" && ["chat", "apollo", "oracle", "astros", "outreach", "mixture", "workspace", "control", "goal"].includes(state.systemMode));
  const needsMemory = state.view === "memory";
  const needsVision = ["artifacts", "memory"].includes(state.view);
  const needsA2A = state.view === "network";
  const needsGrowth = ["command", "approvals", "skills"].includes(state.view) || state.view === "agent" && state.agentMode === "growth";
  const needsWorkspaces = ["command", "repositories"].includes(state.view) || state.view === "agent" && state.agentMode === "workspace";
  const needsRuntimes = ["command", "systems", "system"].includes(state.view) || state.view === "agent" && state.agentMode === "workspace";
  const needsPlans = state.view === "command";
  if (!needsRuns && !needsMemory && !needsVision && !needsA2A && !needsGrowth && !needsWorkspaces && !needsRuntimes && !needsPlans) return;
  state.operationalLoading = true;
  try {
    if (needsRuns) {
      const agentId = operationalAgentId();
      const payload = await api(`/api/v1/hermes/runs${agentId ? `?agent_id=${encodeURIComponent(agentId)}` : ""}`);
      state.runs = payload.items || [];
    }
    if (needsPlans) {
      const payload = await api("/api/v1/orchestrator/plans");
      state.orchestrationPlans = payload.items || [];
    }
    if (needsMemory) {
      const payload = await api("/api/v1/memory?agent_id=default");
      state.memories = payload.items || [];
      if (payload.summary && state.data.operational) state.data.operational.shared_memory = payload.summary;
    }
    if (needsVision) {
      const payload = await api("/api/v1/vision/assets");
      state.visionAssets = payload.items || [];
    }
    if (needsA2A) {
      const payload = await api("/api/v1/a2a/tasks");
      state.a2aTasks = payload.items || [];
      if (payload.summary && state.data.operational) state.data.operational.a2a = payload.summary;
    }
    if (needsGrowth) {
      const payload = await api("/api/v1/agents/growth/proposals");
      state.skillProposals = payload.items || [];
    }
    if (needsWorkspaces) {
      const payload = await api("/api/v1/workspaces");
      state.workspaces = payload.items || [];
    }
    if (needsRuntimes) {
      const payload = await api("/api/v1/runtimes");
      state.runtimeAdapters = payload.items || [];
    }
    const bannerDetail = document.querySelector("#ops-banner-detail");
    if (bannerDetail) bannerDetail.textContent = `${state.data.summary.agents} workers \xB7 ${state.data.operational?.shared_memory?.fact_count ?? 0} shared memories \xB7 ${state.data.summary.systems} AI systems`;
    rerenderOperationalView();
  } catch (error) {
    showToast(error.message);
  } finally {
    state.operationalLoading = false;
  }
}
async function approveRun(button) {
  button.disabled = true;
  try {
    await api(`/api/v1/hermes/runs/${encodeURIComponent(button.dataset.approveRun)}/approve`, {
      method: "POST",
      body: JSON.stringify({ approval_digest: button.dataset.approvalDigest })
    });
    showToast("Exact goal approved \xB7 Hermes is starting");
    await loadOperationalSurface();
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}
async function cancelRun(button) {
  button.disabled = true;
  try {
    await api(`/api/v1/hermes/runs/${encodeURIComponent(button.dataset.cancelRun)}/cancel`, {
      method: "POST"
    });
    showToast("Prepared run canceled");
    await loadOperationalSurface();
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}
async function cancelA2ATask(button) {
  button.disabled = true;
  try {
    const payload = await api("/a2a/v1", {
      method: "POST",
      headers: { "A2A-Version": "1.0" },
      body: JSON.stringify({ jsonrpc: "2.0", id: crypto.randomUUID(), method: "CancelTask", params: { id: button.dataset.a2aCancel } })
    });
    if (payload.error) throw new Error(payload.error.message || "A2A cancellation failed");
    showToast("A2A task canceled before approval");
    await loadOperationalSurface();
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}
async function approveSkillProposal(button) {
  button.disabled = true;
  try {
    await api(`/api/v1/agents/growth/proposals/${encodeURIComponent(button.dataset.approveSkill)}/approve`, { method: "POST", body: "{}" });
    showToast("Skill authoring approved \xB7 installation still requires validation");
    await loadOperationalSurface();
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}
async function validateSkillProposal(button) {
  button.disabled = true;
  try {
    const payload = await api(`/api/v1/agents/growth/proposals/${encodeURIComponent(button.dataset.validateSkill)}/validate`, { method: "POST", body: "{}" });
    showToast(payload.proposal.validation?.passed ? "Skill validation passed \xB7 owner may install" : "Skill needs revision before installation");
    await loadOperationalSurface();
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}
async function installSkillProposal(button) {
  button.disabled = true;
  try {
    await api(`/api/v1/agents/growth/proposals/${encodeURIComponent(button.dataset.installSkill)}/install`, { method: "POST", body: JSON.stringify({ draft_digest: button.dataset.draftDigest }) });
    showToast("Shared skill installed \xB7 available to authorized agents");
    await loadOperationalSurface();
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}
async function dispatchOrchestrationPlan(form) {
  const button = form.querySelector("button[type=submit]");
  const values = new FormData(form);
  if (button) button.disabled = true;
  try {
    const payload = await api(`/api/v1/orchestrator/plans/${encodeURIComponent(form.dataset.planId)}/dispatch`, {
      method: "POST",
      body: JSON.stringify({
        plan_digest: form.dataset.planDigest,
        workspace_id: values.get("workspaceId") || null,
        runtime_id: values.get("runtimeId") || "hermes"
      })
    });
    state.orchestrationPlans = [payload.plan, ...state.orchestrationPlans.filter((item) => item.plan_id !== payload.plan.plan_id)];
    state.runs = [payload.run, ...state.runs.filter((item) => item.run_id !== payload.run.run_id)];
    renderCommand();
    showToast("Ari's route is bound \xB7 exact approval is waiting");
  } catch (error) {
    showToast(error.message);
    if (button) button.disabled = false;
  }
}
function blobDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
async function toggleVoiceCapture(button) {
  if (state.recorder?.state === "recording") {
    state.recorder.stop();
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
    const mimeType = candidates.find((item) => MediaRecorder.isTypeSupported(item)) || "";
    const chunks = [];
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : void 0);
    state.recorder = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onstop = async () => {
      window.clearTimeout(state.voiceTimer);
      stream.getTracks().forEach((track) => track.stop());
      button.classList.remove("is-recording");
      button.innerHTML = "<span>\u25CF</span> Push to talk";
      try {
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const payload = await api("/api/v1/voice/transcribe", { method: "POST", body: JSON.stringify({ data_url: await blobDataUrl(blob), mime_type: blob.type || "audio/webm" }) });
        const textarea = button.closest("form")?.querySelector("textarea[name=objective]");
        if (textarea && payload.transcript) textarea.value = [textarea.value.trim(), payload.transcript].filter(Boolean).join(" ");
        showToast(payload.transcript ? "Voice transcribed \xB7 review before sending" : "No speech detected");
      } catch (error) {
        showToast(error.message);
      }
      state.recorder = null;
    };
    recorder.start();
    button.classList.add("is-recording");
    button.innerHTML = "<span>\u25A0</span> Stop recording";
    state.voiceTimer = window.setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, 6e4);
  } catch (error) {
    showToast(error.name === "NotAllowedError" ? "Microphone permission was not granted" : "Microphone could not start");
  }
}
function toggleWakeWord() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    showToast("Wake-word recognition is unavailable in this browser");
    return;
  }
  if (state.wakeRecognition && state.wakeArmed) {
    state.wakeArmed = false;
    state.wakeRecognition.stop();
    state.wakeRecognition = null;
    renderSystem();
    showToast("Hey Hermes is off");
    return;
  }
  const recognition = new Recognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = "en-US";
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results).slice(event.resultIndex).map((result) => result[0]?.transcript || "").join(" ").trim();
    const match = transcript.match(/hey\s+hermes[,.]?\s*(.*)/i);
    if (!match) return;
    const textarea = document.querySelector("[data-chief-form] textarea[name=objective], [data-run-form] textarea[name=objective]");
    if (textarea) {
      textarea.focus();
      if (match[1]) textarea.value = [textarea.value.trim(), match[1]].filter(Boolean).join(" ");
    }
    showToast(match[1] ? "Hermes heard you \xB7 review before sending" : "Hermes is listening");
  };
  recognition.onerror = (event) => {
    if (event.error !== "no-speech") showToast(`Voice wake stopped \xB7 ${event.error}`);
  };
  recognition.onend = () => {
    if (!state.wakeArmed) return;
    state.wakeArmed = false;
    state.wakeRecognition = null;
    if (state.view === "system" && state.selectedSystem === "hermes") renderSystem();
  };
  try {
    state.wakeRecognition = recognition;
    state.wakeArmed = true;
    recognition.start();
    renderSystem();
    showToast("Hey Hermes is armed");
  } catch {
    state.wakeRecognition = null;
    state.wakeArmed = false;
    showToast("Wake-word microphone could not start");
  }
}
async function speakRun(button) {
  const run = state.runs.find((item) => item.run_id === button.dataset.speakRun);
  if (!run?.response) return;
  button.disabled = true;
  try {
    const payload = await api("/api/v1/voice/synthesize", { method: "POST", body: JSON.stringify({ text: run.response.slice(0, 4e3) }) });
    await new Audio(payload.audio_data_url).play();
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
  }
}
document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-view]");
  const link = event.target.closest("[data-view-link]");
  const business = event.target.closest("[data-business]");
  const result = event.target.closest("[data-palette-view]");
  const agent = event.target.closest("[data-agent]");
  const agentMode = event.target.closest("[data-agent-mode]");
  const period = event.target.closest("[data-period]");
  const directive = event.target.closest("[data-open-directive]");
  const system = event.target.closest("[data-system]");
  const systemMode = event.target.closest("[data-system-mode]");
  const skillCategory = event.target.closest("[data-skill-category]");
  const runApproval = event.target.closest("[data-approve-run]");
  const runCancel = event.target.closest("[data-cancel-run]");
  const a2aCancel = event.target.closest("[data-a2a-cancel]");
  const skillApproval = event.target.closest("[data-approve-skill]");
  const skillValidation = event.target.closest("[data-validate-skill]");
  const skillInstall = event.target.closest("[data-install-skill]");
  const voiceRecord = event.target.closest("[data-voice-record]");
  const wakeToggle = event.target.closest("[data-wake-toggle]");
  const studioMode = event.target.closest("[data-studio-mode]");
  const studioToggle = event.target.closest("[data-toggle-studio]");
  const speak = event.target.closest("[data-speak-run]");
  const routedAction = event.target.closest("[data-route-system-action]");
  const osMapLayer = event.target.closest("[data-os-map-layer]");
  if (nav) setView(nav.dataset.view);
  if (link) setView(link.dataset.viewLink);
  if (business) setView("portfolio");
  if (result) {
    setView(result.dataset.paletteView);
    closePalette();
  }
  if (agent) {
    state.selectedAgent = agent.dataset.agent;
    state.agentMode = "overview";
    setView("agent");
  }
  if (agentMode) {
    state.agentMode = agentMode.dataset.agentMode;
    renderAgent();
    window.setTimeout(() => void loadOperationalSurface(), 0);
  }
  if (period) {
    state.period = period.dataset.period;
    state.view === "performance" ? renderPerformance() : renderCommand();
  }
  if (directive) openModal();
  if (system) {
    state.selectedSystem = system.dataset.system;
    state.systemMode = system.dataset.system === "hermes" ? "chat" : "overview";
    setView("system");
  }
  if (systemMode) {
    state.systemMode = systemMode.dataset.systemMode;
    renderSystem();
    window.setTimeout(() => void loadOperationalSurface(), 0);
  }
  if (studioMode) {
    state.systemMode = studioMode.dataset.studioMode;
    renderSystem();
    window.setTimeout(() => void loadOperationalSurface(), 0);
  }
  if (studioToggle) {
    const id2 = studioToggle.dataset.toggleStudio;
    state.hiddenStudios[id2] = !state.hiddenStudios[id2];
    saveLocalObject("agios.hiddenStudios", state.hiddenStudios);
    renderSystem();
  }
  if (skillCategory) {
    state.skillCategory = skillCategory.dataset.skillCategory;
    renderSharedSkills();
  }
  if (runApproval) void approveRun(runApproval);
  if (runCancel) void cancelRun(runCancel);
  if (a2aCancel) void cancelA2ATask(a2aCancel);
  if (skillApproval) void approveSkillProposal(skillApproval);
  if (skillValidation) void validateSkillProposal(skillValidation);
  if (skillInstall) void installSkillProposal(skillInstall);
  if (voiceRecord) void toggleVoiceCapture(voiceRecord);
  if (wakeToggle) void toggleWakeWord();
  if (speak) void speakRun(speak);
  if (routedAction) routeSystemAction(routedAction);
  if (osMapLayer) {
    state.osMapLayer = osMapLayer.dataset.osMapLayer;
    renderCommand();
  }
  if (event.target.matches("[data-close-modal]") || event.target === modal) closeModal();
  if (event.target === palette) closePalette();
});
document.addEventListener("submit", async (event) => {
  const chiefForm = event.target.closest("[data-chief-form]");
  const runForm = event.target.closest("[data-run-form]");
  const dispatchForm = event.target.closest("[data-dispatch-form]");
  const memoryForm = event.target.closest("[data-memory-form]");
  const retrievalForm = event.target.closest("[data-retrieval-form]");
  const a2aForm = event.target.closest("[data-a2a-form]");
  const skillProposalForm = event.target.closest("[data-skill-proposal-form]");
  const workspaceForm = event.target.closest("[data-workspace-form]");
  const skillDraftForm = event.target.closest("[data-skill-draft-form]");
  const modelPreferenceForm = event.target.closest("[data-model-preference-form]");
  if (!chiefForm && !runForm && !dispatchForm && !memoryForm && !retrievalForm && !a2aForm && !skillProposalForm && !workspaceForm && !skillDraftForm && !modelPreferenceForm) return;
  event.preventDefault();
  const submit = event.target.querySelector("button[type=submit]");
  if (submit) submit.disabled = true;
  try {
    const values = new FormData(event.target);
    if (dispatchForm) {
      await dispatchOrchestrationPlan(dispatchForm);
    } else if (chiefForm) {
      const payload = await api("/api/v1/orchestrator/plans", {
        method: "POST",
        body: JSON.stringify({
          objective: values.get("objective"),
          data_class: values.get("dataClass") || "internal",
          business_id: values.get("businessId") || null
        })
      });
      state.orchestrationPlans = [payload.plan, ...state.orchestrationPlans.filter((item) => item.plan_id !== payload.plan.plan_id)];
      event.target.reset();
      renderCommand();
      showToast("Ari mapped the route \xB7 review it before dispatch");
    } else if (runForm?.hasAttribute("data-ari-router")) {
      const objective = values.get("objective");
      const payload = await api("/api/v1/orchestrator/route", {
        method: "POST",
        body: JSON.stringify({
          objective,
          data_class: values.get("dataClass") || "internal",
          business_id: null,
          intent: values.get("ariIntent") || "auto"
        })
      });
      if (payload.decision.kind === "work") {
        state.orchestrationPlans = [payload.plan, ...state.orchestrationPlans.filter((item) => item.plan_id !== payload.plan.plan_id)];
        event.target.reset();
        setView("command");
        showToast(`Ari routed this to ${titleCase(payload.decision.execution_mode)} \xB7 review the plan`);
      } else {
        const skills = values.getAll("skill");
        if (skills.length > 3) throw new Error("Choose no more than 3 shared skills");
        const chatPayload = await api("/api/v1/hermes/runs", {
          method: "POST",
          body: JSON.stringify({
            mode: "chat",
            agent_id: "default",
            objective,
            data_class: values.get("dataClass") || "internal",
            project_id: values.get("projectId") || null,
            skill_ids: skills,
            memory_ids: [],
            model_id: values.get("modelId") || state.modelPreferences.default || null,
            runtime_id: "hermes",
            workspace_id: null,
            workspace_access: "none",
            vision_asset_ids: runForm.dataset.visionAssetId ? [runForm.dataset.visionAssetId] : []
          })
        });
        event.target.reset();
        delete runForm.dataset.visionAssetId;
        showToast(chatPayload.run.status === "awaiting_approval" ? "Direct answer prepared \xB7 exact approval required" : "Ari is answering directly");
      }
    } else if (runForm) {
      const skills = values.getAll("skill");
      if (skills.length > 3) throw new Error("Choose no more than 3 shared skills");
      const payload = await api("/api/v1/hermes/runs", {
        method: "POST",
        body: JSON.stringify({
          mode: runForm.dataset.runMode,
          agent_id: runForm.dataset.agentId,
          objective: values.get("objective"),
          data_class: values.get("dataClass"),
          project_id: values.get("projectId") || null,
          skill_ids: skills,
          memory_ids: [],
          model_id: values.get("modelId") || state.modelPreferences[runForm.dataset.agentId] || null,
          runtime_id: values.get("runtimeId") || "hermes",
          workspace_id: values.get("workspaceId") || null,
          workspace_access: values.get("workspaceAccess") || "none",
          vision_asset_ids: runForm.dataset.visionAssetId ? [runForm.dataset.visionAssetId] : []
        })
      });
      event.target.reset();
      delete runForm.dataset.visionAssetId;
      showToast(payload.run.status === "awaiting_approval" ? "Run prepared \xB7 exact approval required" : "AGIOS session started");
    } else if (modelPreferenceForm) {
      const agentId = modelPreferenceForm.dataset.agentId;
      const modelId = String(values.get("modelId") || "");
      if (modelId) state.modelPreferences[agentId] = modelId;
      else delete state.modelPreferences[agentId];
      saveLocalObject("agios.modelPreferences", state.modelPreferences);
      showToast(modelId ? `${titleCase(agentId)} now defaults to ${modelId}` : `${titleCase(agentId)} uses the Hermes profile default`);
    } else if (workspaceForm) {
      const payload = await api("/api/v1/workspaces", { method: "POST", body: JSON.stringify({ label: values.get("label"), root_path: values.get("rootPath"), data_class: values.get("dataClass"), write_allowed: values.get("writeAllowed") === "on" }) });
      state.workspaces = [payload.workspace, ...state.workspaces.filter((item) => item.workspace_id !== payload.workspace.workspace_id)];
      event.target.reset();
      if (state.view === "repositories") renderRepositories();
      showToast("Workspace boundary registered \xB7 path remains private");
    } else if (skillDraftForm) {
      await api(`/api/v1/agents/growth/proposals/${encodeURIComponent(skillDraftForm.dataset.proposalId)}/draft`, { method: "POST", body: JSON.stringify({ body: values.get("body") }) });
      showToast("Skill draft saved \xB7 validation required");
    } else if (memoryForm) {
      await api("/api/v1/memory", {
        method: "POST",
        body: JSON.stringify({
          scope_kind: values.get("scopeKind"),
          scope_id: values.get("scopeId"),
          title: values.get("title"),
          body: values.get("body"),
          created_by: "owner",
          trust: "medium"
        })
      });
      event.target.reset();
      showToast("Shared memory saved \xB7 authorized agents can retrieve it now");
    } else if (retrievalForm) {
      const payload = await api("/api/v1/retrieval/query", {
        method: "POST",
        body: JSON.stringify({ agent_id: values.get("agentId"), project_id: values.get("projectId") || null, query: values.get("query"), limit: 8 })
      });
      state.retrievalHits = payload.items || [];
      showToast(`${state.retrievalHits.length} authorized evidence records found`);
    } else if (skillProposalForm) {
      const completed = state.runs.filter((run) => run.agent_id === skillProposalForm.dataset.agentId && run.status === "completed").slice(0, 12).map((run) => run.run_id);
      const payload = await api(`/api/v1/agents/${encodeURIComponent(skillProposalForm.dataset.agentId)}/skill-proposals`, {
        method: "POST",
        body: JSON.stringify({ skill_name: values.get("skillName"), change_kind: values.get("changeKind"), rationale: values.get("rationale"), evidence_run_ids: completed })
      });
      event.target.reset();
      showToast(payload.proposal.status === "awaiting_owner_review" ? "Skill proposal sent to owner review" : "Skill proposal saved \xB7 completed evidence is required");
    } else if (a2aForm) {
      const payload = await api("/a2a/v1", {
        method: "POST",
        headers: { "A2A-Version": "1.0" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: crypto.randomUUID(),
          method: "SendMessage",
          params: { message: {
            role: "ROLE_USER",
            messageId: crypto.randomUUID(),
            parts: [{ text: values.get("objective") }],
            metadata: { skillId: values.get("skillId"), agentId: values.get("agentId"), dataClass: values.get("dataClass"), projectId: values.get("projectId") || null }
          } }
        })
      });
      if (payload.error) throw new Error(payload.error.message || "A2A task failed");
      event.target.reset();
      showToast(payload.result.task.status.state === "TASK_STATE_AUTH_REQUIRED" ? "A2A plan created - exact approval required" : "A2A evidence task completed");
    }
    await loadOperationalSurface();
  } catch (error) {
    showToast(error.message);
  } finally {
    if (submit) submit.disabled = false;
  }
});
document.querySelector("#new-directive").addEventListener("click", openModal);
document.querySelector("#all-systems").addEventListener("click", () => setView("systems"));
document.querySelector("#search-trigger").addEventListener("click", openPalette);
document.querySelector("#menu-button").addEventListener("click", () => sidebar.classList.add("is-open"));
document.querySelector("#sidebar-close").addEventListener("click", () => sidebar.classList.remove("is-open"));
paletteInput.addEventListener("input", renderPalette);
document.addEventListener("change", async (event) => {
  if (!event.target.matches("[data-vision-input]")) return;
  const input = event.target;
  const file = input.files?.[0];
  const form = input.closest("[data-run-form]");
  const note = form?.querySelector("[data-vision-state]");
  if (!file || !form) return;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) {
    showToast("Choose a PNG, JPEG or WebP image under 8 MB");
    input.value = "";
    return;
  }
  input.disabled = true;
  if (note) note.textContent = "Securing image locally\u2026";
  try {
    const payload = await api("/api/v1/vision/assets", { method: "POST", body: JSON.stringify({ data_url: await blobDataUrl(file), mime_type: file.type, data_class: new FormData(form).get("dataClass") || "internal", retention: new FormData(form).get("visionRetention") || "session" }) });
    form.dataset.visionAssetId = payload.asset.asset_id;
    if (note) note.textContent = `${file.name} attached \xB7 review before sending`;
    showToast("Image secured locally \xB7 exact approval will be required");
  } catch (error) {
    showToast(error.message);
    if (note) note.textContent = "Image was not attached";
  } finally {
    input.disabled = false;
  }
});
document.addEventListener("input", (event) => {
  if (event.target.matches("#skill-search")) {
    state.skillQuery = event.target.value;
    renderSharedSkills();
    const search = document.querySelector("#skill-search");
    if (search) {
      search.focus();
      search.setSelectionRange(search.value.length, search.value.length);
    }
  } else if (event.target.matches("#session-search")) {
    state.sessionQuery = event.target.value;
    renderSystem();
    const search = document.querySelector("#session-search");
    if (search) {
      search.focus();
      search.setSelectionRange(search.value.length, search.value.length);
    }
  }
});
document.querySelector("#directive-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = new FormData(form);
  const submit = form.querySelector("button[type=submit]");
  submit.disabled = true;
  try {
    const outcome = String(values.get("outcome") || "").trim();
    const objective = outcome;
    const payload = await api("/api/v1/orchestrator/plans", {
      method: "POST",
      body: JSON.stringify({
        objective,
        data_class: values.get("dataClass") || "internal",
        business_id: values.get("business") || null
      })
    });
    form.reset();
    closeModal();
    state.orchestrationPlans = [payload.plan, ...state.orchestrationPlans.filter((item) => item.plan_id !== payload.plan.plan_id)];
    setView("command");
    showToast("Ari mapped the route \xB7 review it before dispatch");
    await loadOperationalSurface();
  } catch (error) {
    showToast(error.message);
  } finally {
    submit.disabled = false;
  }
});
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    palette.hidden ? openPalette() : closePalette();
  }
  if (event.key === "Escape") {
    closeModal();
    closePalette();
  }
  if (!event.ctrlKey && !event.metaKey && !event.altKey && /^[1-4]$/.test(event.key) && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) setView(["command", "portfolio", "departments", "agents"][Number(event.key) - 1]);
});
function tick() {
  document.querySelector("#clock-time").textContent = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Yerevan" }).format(/* @__PURE__ */ new Date());
}
tick();
window.setInterval(tick, 3e4);
window.setInterval(() => {
  if (!document.activeElement?.closest?.("[data-chief-form], [data-run-form], [data-workspace-form], [data-skill-draft-form], [data-memory-form], [data-retrieval-form], [data-a2a-form]") && state.runs.some((run) => ["queued", "running"].includes(run.status))) void loadOperationalSurface();
}, 1600);
async function boot() {
  try {
    const response = await fetch("/api/v1/command-center", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("unavailable");
    state.data = await response.json();
    state.runtimeAdapters = state.data.operational?.runtime_adapters || [];
    try {
      state.voice = await api("/api/v1/voice/capabilities");
    } catch {
      state.voice = { status: "unavailable", input: { enabled: false }, output: { enabled: false } };
    }
    document.querySelector("#approval-count").textContent = state.data.summary.pending_approvals;
    const runtime = state.data.runtime;
    document.querySelector("#runtime-caption").textContent = runtime.gateway_running ? `${state.data.summary.available_agents} agents registered \xB7 gateway online` : `${state.data.summary.available_agents} agents registered \xB7 gateway standing by`;
    document.querySelector("#runtime-meter").style.width = `${Math.max(12, state.data.summary.available_agents / state.data.summary.agents * 100)}%`;
    document.querySelector("#ops-banner-detail").textContent = `${state.data.summary.agents} workers \xB7 ${state.data.operational?.shared_memory?.fact_count ?? 0} shared memories \xB7 ${state.data.summary.systems} AI systems`;
    const route = location.pathname.slice(1);
    setView(viewLabels[route] ? route : "command");
  } catch {
    page.innerHTML = `<div class="error-state"><p class="eyebrow">Local control plane</p><h1>AGIOS could not connect</h1><p>The interface is intact, but the local command service is unavailable. Restart AGIOS and this screen will reconnect without exposing runtime details.</p></div>`;
    document.querySelector("#runtime-caption").textContent = "Control plane unavailable";
  }
}
boot();
