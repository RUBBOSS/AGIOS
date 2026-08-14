var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/xterm/lib/xterm.js
var require_xterm = __commonJS({
  "node_modules/xterm/lib/xterm.js"(exports, module) {
    !function(e, t) {
      if ("object" == typeof exports && "object" == typeof module) module.exports = t();
      else if ("function" == typeof define && define.amd) define([], t);
      else {
        var i = t();
        for (var s in i) ("object" == typeof exports ? exports : e)[s] = i[s];
      }
    }(self, () => (() => {
      "use strict";
      var e = { 4567: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.AccessibilityManager = void 0;
        const n = i2(9042), o2 = i2(6114), a2 = i2(9924), h2 = i2(844), c2 = i2(5596), l2 = i2(4725), d = i2(3656);
        let _3 = t2.AccessibilityManager = class extends h2.Disposable {
          constructor(e3, t3) {
            super(), this._terminal = e3, this._renderService = t3, this._liveRegionLineCount = 0, this._charsToConsume = [], this._charsToAnnounce = "", this._accessibilityContainer = document.createElement("div"), this._accessibilityContainer.classList.add("xterm-accessibility"), this._rowContainer = document.createElement("div"), this._rowContainer.setAttribute("role", "list"), this._rowContainer.classList.add("xterm-accessibility-tree"), this._rowElements = [];
            for (let e4 = 0; e4 < this._terminal.rows; e4++) this._rowElements[e4] = this._createAccessibilityTreeNode(), this._rowContainer.appendChild(this._rowElements[e4]);
            if (this._topBoundaryFocusListener = (e4) => this._handleBoundaryFocus(e4, 0), this._bottomBoundaryFocusListener = (e4) => this._handleBoundaryFocus(e4, 1), this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener), this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._refreshRowsDimensions(), this._accessibilityContainer.appendChild(this._rowContainer), this._liveRegion = document.createElement("div"), this._liveRegion.classList.add("live-region"), this._liveRegion.setAttribute("aria-live", "assertive"), this._accessibilityContainer.appendChild(this._liveRegion), this._liveRegionDebouncer = this.register(new a2.TimeBasedDebouncer(this._renderRows.bind(this))), !this._terminal.element) throw new Error("Cannot enable accessibility before Terminal.open");
            this._terminal.element.insertAdjacentElement("afterbegin", this._accessibilityContainer), this.register(this._terminal.onResize((e4) => this._handleResize(e4.rows))), this.register(this._terminal.onRender((e4) => this._refreshRows(e4.start, e4.end))), this.register(this._terminal.onScroll(() => this._refreshRows())), this.register(this._terminal.onA11yChar((e4) => this._handleChar(e4))), this.register(this._terminal.onLineFeed(() => this._handleChar("\n"))), this.register(this._terminal.onA11yTab((e4) => this._handleTab(e4))), this.register(this._terminal.onKey((e4) => this._handleKey(e4.key))), this.register(this._terminal.onBlur(() => this._clearLiveRegion())), this.register(this._renderService.onDimensionsChange(() => this._refreshRowsDimensions())), this._screenDprMonitor = new c2.ScreenDprMonitor(window), this.register(this._screenDprMonitor), this._screenDprMonitor.setListener(() => this._refreshRowsDimensions()), this.register((0, d.addDisposableDomListener)(window, "resize", () => this._refreshRowsDimensions())), this._refreshRows(), this.register((0, h2.toDisposable)(() => {
              this._accessibilityContainer.remove(), this._rowElements.length = 0;
            }));
          }
          _handleTab(e3) {
            for (let t3 = 0; t3 < e3; t3++) this._handleChar(" ");
          }
          _handleChar(e3) {
            this._liveRegionLineCount < 21 && (this._charsToConsume.length > 0 ? this._charsToConsume.shift() !== e3 && (this._charsToAnnounce += e3) : this._charsToAnnounce += e3, "\n" === e3 && (this._liveRegionLineCount++, 21 === this._liveRegionLineCount && (this._liveRegion.textContent += n.tooMuchOutput)), o2.isMac && this._liveRegion.textContent && this._liveRegion.textContent.length > 0 && !this._liveRegion.parentNode && setTimeout(() => {
              this._accessibilityContainer.appendChild(this._liveRegion);
            }, 0));
          }
          _clearLiveRegion() {
            this._liveRegion.textContent = "", this._liveRegionLineCount = 0, o2.isMac && this._liveRegion.remove();
          }
          _handleKey(e3) {
            this._clearLiveRegion(), /\p{Control}/u.test(e3) || this._charsToConsume.push(e3);
          }
          _refreshRows(e3, t3) {
            this._liveRegionDebouncer.refresh(e3, t3, this._terminal.rows);
          }
          _renderRows(e3, t3) {
            const i3 = this._terminal.buffer, s3 = i3.lines.length.toString();
            for (let r2 = e3; r2 <= t3; r2++) {
              const e4 = i3.translateBufferLineToString(i3.ydisp + r2, true), t4 = (i3.ydisp + r2 + 1).toString(), n2 = this._rowElements[r2];
              n2 && (0 === e4.length ? n2.innerText = "\xA0" : n2.textContent = e4, n2.setAttribute("aria-posinset", t4), n2.setAttribute("aria-setsize", s3));
            }
            this._announceCharacters();
          }
          _announceCharacters() {
            0 !== this._charsToAnnounce.length && (this._liveRegion.textContent += this._charsToAnnounce, this._charsToAnnounce = "");
          }
          _handleBoundaryFocus(e3, t3) {
            const i3 = e3.target, s3 = this._rowElements[0 === t3 ? 1 : this._rowElements.length - 2];
            if (i3.getAttribute("aria-posinset") === (0 === t3 ? "1" : `${this._terminal.buffer.lines.length}`)) return;
            if (e3.relatedTarget !== s3) return;
            let r2, n2;
            if (0 === t3 ? (r2 = i3, n2 = this._rowElements.pop(), this._rowContainer.removeChild(n2)) : (r2 = this._rowElements.shift(), n2 = i3, this._rowContainer.removeChild(r2)), r2.removeEventListener("focus", this._topBoundaryFocusListener), n2.removeEventListener("focus", this._bottomBoundaryFocusListener), 0 === t3) {
              const e4 = this._createAccessibilityTreeNode();
              this._rowElements.unshift(e4), this._rowContainer.insertAdjacentElement("afterbegin", e4);
            } else {
              const e4 = this._createAccessibilityTreeNode();
              this._rowElements.push(e4), this._rowContainer.appendChild(e4);
            }
            this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener), this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._terminal.scrollLines(0 === t3 ? -1 : 1), this._rowElements[0 === t3 ? 1 : this._rowElements.length - 2].focus(), e3.preventDefault(), e3.stopImmediatePropagation();
          }
          _handleResize(e3) {
            this._rowElements[this._rowElements.length - 1].removeEventListener("focus", this._bottomBoundaryFocusListener);
            for (let e4 = this._rowContainer.children.length; e4 < this._terminal.rows; e4++) this._rowElements[e4] = this._createAccessibilityTreeNode(), this._rowContainer.appendChild(this._rowElements[e4]);
            for (; this._rowElements.length > e3; ) this._rowContainer.removeChild(this._rowElements.pop());
            this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._refreshRowsDimensions();
          }
          _createAccessibilityTreeNode() {
            const e3 = document.createElement("div");
            return e3.setAttribute("role", "listitem"), e3.tabIndex = -1, this._refreshRowDimensions(e3), e3;
          }
          _refreshRowsDimensions() {
            if (this._renderService.dimensions.css.cell.height) {
              this._accessibilityContainer.style.width = `${this._renderService.dimensions.css.canvas.width}px`, this._rowElements.length !== this._terminal.rows && this._handleResize(this._terminal.rows);
              for (let e3 = 0; e3 < this._terminal.rows; e3++) this._refreshRowDimensions(this._rowElements[e3]);
            }
          }
          _refreshRowDimensions(e3) {
            e3.style.height = `${this._renderService.dimensions.css.cell.height}px`;
          }
        };
        t2.AccessibilityManager = _3 = s2([r(1, l2.IRenderService)], _3);
      }, 3614: (e2, t2) => {
        function i2(e3) {
          return e3.replace(/\r?\n/g, "\r");
        }
        function s2(e3, t3) {
          return t3 ? "\x1B[200~" + e3 + "\x1B[201~" : e3;
        }
        function r(e3, t3, r2, n2) {
          e3 = s2(e3 = i2(e3), r2.decPrivateModes.bracketedPasteMode && true !== n2.rawOptions.ignoreBracketedPasteMode), r2.triggerDataEvent(e3, true), t3.value = "";
        }
        function n(e3, t3, i3) {
          const s3 = i3.getBoundingClientRect(), r2 = e3.clientX - s3.left - 10, n2 = e3.clientY - s3.top - 10;
          t3.style.width = "20px", t3.style.height = "20px", t3.style.left = `${r2}px`, t3.style.top = `${n2}px`, t3.style.zIndex = "1000", t3.focus();
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.rightClickHandler = t2.moveTextAreaUnderMouseCursor = t2.paste = t2.handlePasteEvent = t2.copyHandler = t2.bracketTextForPaste = t2.prepareTextForTerminal = void 0, t2.prepareTextForTerminal = i2, t2.bracketTextForPaste = s2, t2.copyHandler = function(e3, t3) {
          e3.clipboardData && e3.clipboardData.setData("text/plain", t3.selectionText), e3.preventDefault();
        }, t2.handlePasteEvent = function(e3, t3, i3, s3) {
          e3.stopPropagation(), e3.clipboardData && r(e3.clipboardData.getData("text/plain"), t3, i3, s3);
        }, t2.paste = r, t2.moveTextAreaUnderMouseCursor = n, t2.rightClickHandler = function(e3, t3, i3, s3, r2) {
          n(e3, t3, i3), r2 && s3.rightClickSelect(e3), t3.value = s3.selectionText, t3.select();
        };
      }, 7239: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ColorContrastCache = void 0;
        const s2 = i2(1505);
        t2.ColorContrastCache = class {
          constructor() {
            this._color = new s2.TwoKeyMap(), this._css = new s2.TwoKeyMap();
          }
          setCss(e3, t3, i3) {
            this._css.set(e3, t3, i3);
          }
          getCss(e3, t3) {
            return this._css.get(e3, t3);
          }
          setColor(e3, t3, i3) {
            this._color.set(e3, t3, i3);
          }
          getColor(e3, t3) {
            return this._color.get(e3, t3);
          }
          clear() {
            this._color.clear(), this._css.clear();
          }
        };
      }, 3656: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.addDisposableDomListener = void 0, t2.addDisposableDomListener = function(e3, t3, i2, s2) {
          e3.addEventListener(t3, i2, s2);
          let r = false;
          return { dispose: () => {
            r || (r = true, e3.removeEventListener(t3, i2, s2));
          } };
        };
      }, 6465: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Linkifier2 = void 0;
        const n = i2(3656), o2 = i2(8460), a2 = i2(844), h2 = i2(2585);
        let c2 = t2.Linkifier2 = class extends a2.Disposable {
          get currentLink() {
            return this._currentLink;
          }
          constructor(e3) {
            super(), this._bufferService = e3, this._linkProviders = [], this._linkCacheDisposables = [], this._isMouseOut = true, this._wasResized = false, this._activeLine = -1, this._onShowLinkUnderline = this.register(new o2.EventEmitter()), this.onShowLinkUnderline = this._onShowLinkUnderline.event, this._onHideLinkUnderline = this.register(new o2.EventEmitter()), this.onHideLinkUnderline = this._onHideLinkUnderline.event, this.register((0, a2.getDisposeArrayDisposable)(this._linkCacheDisposables)), this.register((0, a2.toDisposable)(() => {
              this._lastMouseEvent = void 0;
            })), this.register(this._bufferService.onResize(() => {
              this._clearCurrentLink(), this._wasResized = true;
            }));
          }
          registerLinkProvider(e3) {
            return this._linkProviders.push(e3), { dispose: () => {
              const t3 = this._linkProviders.indexOf(e3);
              -1 !== t3 && this._linkProviders.splice(t3, 1);
            } };
          }
          attachToDom(e3, t3, i3) {
            this._element = e3, this._mouseService = t3, this._renderService = i3, this.register((0, n.addDisposableDomListener)(this._element, "mouseleave", () => {
              this._isMouseOut = true, this._clearCurrentLink();
            })), this.register((0, n.addDisposableDomListener)(this._element, "mousemove", this._handleMouseMove.bind(this))), this.register((0, n.addDisposableDomListener)(this._element, "mousedown", this._handleMouseDown.bind(this))), this.register((0, n.addDisposableDomListener)(this._element, "mouseup", this._handleMouseUp.bind(this)));
          }
          _handleMouseMove(e3) {
            if (this._lastMouseEvent = e3, !this._element || !this._mouseService) return;
            const t3 = this._positionFromMouseEvent(e3, this._element, this._mouseService);
            if (!t3) return;
            this._isMouseOut = false;
            const i3 = e3.composedPath();
            for (let e4 = 0; e4 < i3.length; e4++) {
              const t4 = i3[e4];
              if (t4.classList.contains("xterm")) break;
              if (t4.classList.contains("xterm-hover")) return;
            }
            this._lastBufferCell && t3.x === this._lastBufferCell.x && t3.y === this._lastBufferCell.y || (this._handleHover(t3), this._lastBufferCell = t3);
          }
          _handleHover(e3) {
            if (this._activeLine !== e3.y || this._wasResized) return this._clearCurrentLink(), this._askForLink(e3, false), void (this._wasResized = false);
            this._currentLink && this._linkAtPosition(this._currentLink.link, e3) || (this._clearCurrentLink(), this._askForLink(e3, true));
          }
          _askForLink(e3, t3) {
            var i3, s3;
            this._activeProviderReplies && t3 || (null === (i3 = this._activeProviderReplies) || void 0 === i3 || i3.forEach((e4) => {
              null == e4 || e4.forEach((e5) => {
                e5.link.dispose && e5.link.dispose();
              });
            }), this._activeProviderReplies = /* @__PURE__ */ new Map(), this._activeLine = e3.y);
            let r2 = false;
            for (const [i4, n2] of this._linkProviders.entries()) t3 ? (null === (s3 = this._activeProviderReplies) || void 0 === s3 ? void 0 : s3.get(i4)) && (r2 = this._checkLinkProviderResult(i4, e3, r2)) : n2.provideLinks(e3.y, (t4) => {
              var s4, n3;
              if (this._isMouseOut) return;
              const o3 = null == t4 ? void 0 : t4.map((e4) => ({ link: e4 }));
              null === (s4 = this._activeProviderReplies) || void 0 === s4 || s4.set(i4, o3), r2 = this._checkLinkProviderResult(i4, e3, r2), (null === (n3 = this._activeProviderReplies) || void 0 === n3 ? void 0 : n3.size) === this._linkProviders.length && this._removeIntersectingLinks(e3.y, this._activeProviderReplies);
            });
          }
          _removeIntersectingLinks(e3, t3) {
            const i3 = /* @__PURE__ */ new Set();
            for (let s3 = 0; s3 < t3.size; s3++) {
              const r2 = t3.get(s3);
              if (r2) for (let t4 = 0; t4 < r2.length; t4++) {
                const s4 = r2[t4], n2 = s4.link.range.start.y < e3 ? 0 : s4.link.range.start.x, o3 = s4.link.range.end.y > e3 ? this._bufferService.cols : s4.link.range.end.x;
                for (let e4 = n2; e4 <= o3; e4++) {
                  if (i3.has(e4)) {
                    r2.splice(t4--, 1);
                    break;
                  }
                  i3.add(e4);
                }
              }
            }
          }
          _checkLinkProviderResult(e3, t3, i3) {
            var s3;
            if (!this._activeProviderReplies) return i3;
            const r2 = this._activeProviderReplies.get(e3);
            let n2 = false;
            for (let t4 = 0; t4 < e3; t4++) this._activeProviderReplies.has(t4) && !this._activeProviderReplies.get(t4) || (n2 = true);
            if (!n2 && r2) {
              const e4 = r2.find((e5) => this._linkAtPosition(e5.link, t3));
              e4 && (i3 = true, this._handleNewLink(e4));
            }
            if (this._activeProviderReplies.size === this._linkProviders.length && !i3) for (let e4 = 0; e4 < this._activeProviderReplies.size; e4++) {
              const r3 = null === (s3 = this._activeProviderReplies.get(e4)) || void 0 === s3 ? void 0 : s3.find((e5) => this._linkAtPosition(e5.link, t3));
              if (r3) {
                i3 = true, this._handleNewLink(r3);
                break;
              }
            }
            return i3;
          }
          _handleMouseDown() {
            this._mouseDownLink = this._currentLink;
          }
          _handleMouseUp(e3) {
            if (!this._element || !this._mouseService || !this._currentLink) return;
            const t3 = this._positionFromMouseEvent(e3, this._element, this._mouseService);
            t3 && this._mouseDownLink === this._currentLink && this._linkAtPosition(this._currentLink.link, t3) && this._currentLink.link.activate(e3, this._currentLink.link.text);
          }
          _clearCurrentLink(e3, t3) {
            this._element && this._currentLink && this._lastMouseEvent && (!e3 || !t3 || this._currentLink.link.range.start.y >= e3 && this._currentLink.link.range.end.y <= t3) && (this._linkLeave(this._element, this._currentLink.link, this._lastMouseEvent), this._currentLink = void 0, (0, a2.disposeArray)(this._linkCacheDisposables));
          }
          _handleNewLink(e3) {
            if (!this._element || !this._lastMouseEvent || !this._mouseService) return;
            const t3 = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
            t3 && this._linkAtPosition(e3.link, t3) && (this._currentLink = e3, this._currentLink.state = { decorations: { underline: void 0 === e3.link.decorations || e3.link.decorations.underline, pointerCursor: void 0 === e3.link.decorations || e3.link.decorations.pointerCursor }, isHovered: true }, this._linkHover(this._element, e3.link, this._lastMouseEvent), e3.link.decorations = {}, Object.defineProperties(e3.link.decorations, { pointerCursor: { get: () => {
              var e4, t4;
              return null === (t4 = null === (e4 = this._currentLink) || void 0 === e4 ? void 0 : e4.state) || void 0 === t4 ? void 0 : t4.decorations.pointerCursor;
            }, set: (e4) => {
              var t4, i3;
              (null === (t4 = this._currentLink) || void 0 === t4 ? void 0 : t4.state) && this._currentLink.state.decorations.pointerCursor !== e4 && (this._currentLink.state.decorations.pointerCursor = e4, this._currentLink.state.isHovered && (null === (i3 = this._element) || void 0 === i3 || i3.classList.toggle("xterm-cursor-pointer", e4)));
            } }, underline: { get: () => {
              var e4, t4;
              return null === (t4 = null === (e4 = this._currentLink) || void 0 === e4 ? void 0 : e4.state) || void 0 === t4 ? void 0 : t4.decorations.underline;
            }, set: (t4) => {
              var i3, s3, r2;
              (null === (i3 = this._currentLink) || void 0 === i3 ? void 0 : i3.state) && (null === (r2 = null === (s3 = this._currentLink) || void 0 === s3 ? void 0 : s3.state) || void 0 === r2 ? void 0 : r2.decorations.underline) !== t4 && (this._currentLink.state.decorations.underline = t4, this._currentLink.state.isHovered && this._fireUnderlineEvent(e3.link, t4));
            } } }), this._renderService && this._linkCacheDisposables.push(this._renderService.onRenderedViewportChange((e4) => {
              if (!this._currentLink) return;
              const t4 = 0 === e4.start ? 0 : e4.start + 1 + this._bufferService.buffer.ydisp, i3 = this._bufferService.buffer.ydisp + 1 + e4.end;
              if (this._currentLink.link.range.start.y >= t4 && this._currentLink.link.range.end.y <= i3 && (this._clearCurrentLink(t4, i3), this._lastMouseEvent && this._element)) {
                const e5 = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
                e5 && this._askForLink(e5, false);
              }
            })));
          }
          _linkHover(e3, t3, i3) {
            var s3;
            (null === (s3 = this._currentLink) || void 0 === s3 ? void 0 : s3.state) && (this._currentLink.state.isHovered = true, this._currentLink.state.decorations.underline && this._fireUnderlineEvent(t3, true), this._currentLink.state.decorations.pointerCursor && e3.classList.add("xterm-cursor-pointer")), t3.hover && t3.hover(i3, t3.text);
          }
          _fireUnderlineEvent(e3, t3) {
            const i3 = e3.range, s3 = this._bufferService.buffer.ydisp, r2 = this._createLinkUnderlineEvent(i3.start.x - 1, i3.start.y - s3 - 1, i3.end.x, i3.end.y - s3 - 1, void 0);
            (t3 ? this._onShowLinkUnderline : this._onHideLinkUnderline).fire(r2);
          }
          _linkLeave(e3, t3, i3) {
            var s3;
            (null === (s3 = this._currentLink) || void 0 === s3 ? void 0 : s3.state) && (this._currentLink.state.isHovered = false, this._currentLink.state.decorations.underline && this._fireUnderlineEvent(t3, false), this._currentLink.state.decorations.pointerCursor && e3.classList.remove("xterm-cursor-pointer")), t3.leave && t3.leave(i3, t3.text);
          }
          _linkAtPosition(e3, t3) {
            const i3 = e3.range.start.y * this._bufferService.cols + e3.range.start.x, s3 = e3.range.end.y * this._bufferService.cols + e3.range.end.x, r2 = t3.y * this._bufferService.cols + t3.x;
            return i3 <= r2 && r2 <= s3;
          }
          _positionFromMouseEvent(e3, t3, i3) {
            const s3 = i3.getCoords(e3, t3, this._bufferService.cols, this._bufferService.rows);
            if (s3) return { x: s3[0], y: s3[1] + this._bufferService.buffer.ydisp };
          }
          _createLinkUnderlineEvent(e3, t3, i3, s3, r2) {
            return { x1: e3, y1: t3, x2: i3, y2: s3, cols: this._bufferService.cols, fg: r2 };
          }
        };
        t2.Linkifier2 = c2 = s2([r(0, h2.IBufferService)], c2);
      }, 9042: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.tooMuchOutput = t2.promptLabel = void 0, t2.promptLabel = "Terminal input", t2.tooMuchOutput = "Too much output to announce, navigate to rows manually to read";
      }, 3730: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.OscLinkProvider = void 0;
        const n = i2(511), o2 = i2(2585);
        let a2 = t2.OscLinkProvider = class {
          constructor(e3, t3, i3) {
            this._bufferService = e3, this._optionsService = t3, this._oscLinkService = i3;
          }
          provideLinks(e3, t3) {
            var i3;
            const s3 = this._bufferService.buffer.lines.get(e3 - 1);
            if (!s3) return void t3(void 0);
            const r2 = [], o3 = this._optionsService.rawOptions.linkHandler, a3 = new n.CellData(), c2 = s3.getTrimmedLength();
            let l2 = -1, d = -1, _3 = false;
            for (let t4 = 0; t4 < c2; t4++) if (-1 !== d || s3.hasContent(t4)) {
              if (s3.loadCell(t4, a3), a3.hasExtendedAttrs() && a3.extended.urlId) {
                if (-1 === d) {
                  d = t4, l2 = a3.extended.urlId;
                  continue;
                }
                _3 = a3.extended.urlId !== l2;
              } else -1 !== d && (_3 = true);
              if (_3 || -1 !== d && t4 === c2 - 1) {
                const s4 = null === (i3 = this._oscLinkService.getLinkData(l2)) || void 0 === i3 ? void 0 : i3.uri;
                if (s4) {
                  const i4 = { start: { x: d + 1, y: e3 }, end: { x: t4 + (_3 || t4 !== c2 - 1 ? 0 : 1), y: e3 } };
                  let n2 = false;
                  if (!(null == o3 ? void 0 : o3.allowNonHttpProtocols)) try {
                    const e4 = new URL(s4);
                    ["http:", "https:"].includes(e4.protocol) || (n2 = true);
                  } catch (e4) {
                    n2 = true;
                  }
                  n2 || r2.push({ text: s4, range: i4, activate: (e4, t5) => o3 ? o3.activate(e4, t5, i4) : h2(0, t5), hover: (e4, t5) => {
                    var s5;
                    return null === (s5 = null == o3 ? void 0 : o3.hover) || void 0 === s5 ? void 0 : s5.call(o3, e4, t5, i4);
                  }, leave: (e4, t5) => {
                    var s5;
                    return null === (s5 = null == o3 ? void 0 : o3.leave) || void 0 === s5 ? void 0 : s5.call(o3, e4, t5, i4);
                  } });
                }
                _3 = false, a3.hasExtendedAttrs() && a3.extended.urlId ? (d = t4, l2 = a3.extended.urlId) : (d = -1, l2 = -1);
              }
            }
            t3(r2);
          }
        };
        function h2(e3, t3) {
          if (confirm(`Do you want to navigate to ${t3}?

WARNING: This link could potentially be dangerous`)) {
            const e4 = window.open();
            if (e4) {
              try {
                e4.opener = null;
              } catch (e5) {
              }
              e4.location.href = t3;
            } else console.warn("Opening link blocked as opener could not be cleared");
          }
        }
        t2.OscLinkProvider = a2 = s2([r(0, o2.IBufferService), r(1, o2.IOptionsService), r(2, o2.IOscLinkService)], a2);
      }, 6193: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.RenderDebouncer = void 0, t2.RenderDebouncer = class {
          constructor(e3, t3) {
            this._parentWindow = e3, this._renderCallback = t3, this._refreshCallbacks = [];
          }
          dispose() {
            this._animationFrame && (this._parentWindow.cancelAnimationFrame(this._animationFrame), this._animationFrame = void 0);
          }
          addRefreshCallback(e3) {
            return this._refreshCallbacks.push(e3), this._animationFrame || (this._animationFrame = this._parentWindow.requestAnimationFrame(() => this._innerRefresh())), this._animationFrame;
          }
          refresh(e3, t3, i2) {
            this._rowCount = i2, e3 = void 0 !== e3 ? e3 : 0, t3 = void 0 !== t3 ? t3 : this._rowCount - 1, this._rowStart = void 0 !== this._rowStart ? Math.min(this._rowStart, e3) : e3, this._rowEnd = void 0 !== this._rowEnd ? Math.max(this._rowEnd, t3) : t3, this._animationFrame || (this._animationFrame = this._parentWindow.requestAnimationFrame(() => this._innerRefresh()));
          }
          _innerRefresh() {
            if (this._animationFrame = void 0, void 0 === this._rowStart || void 0 === this._rowEnd || void 0 === this._rowCount) return void this._runRefreshCallbacks();
            const e3 = Math.max(this._rowStart, 0), t3 = Math.min(this._rowEnd, this._rowCount - 1);
            this._rowStart = void 0, this._rowEnd = void 0, this._renderCallback(e3, t3), this._runRefreshCallbacks();
          }
          _runRefreshCallbacks() {
            for (const e3 of this._refreshCallbacks) e3(0);
            this._refreshCallbacks = [];
          }
        };
      }, 5596: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ScreenDprMonitor = void 0;
        const s2 = i2(844);
        class r extends s2.Disposable {
          constructor(e3) {
            super(), this._parentWindow = e3, this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio, this.register((0, s2.toDisposable)(() => {
              this.clearListener();
            }));
          }
          setListener(e3) {
            this._listener && this.clearListener(), this._listener = e3, this._outerListener = () => {
              this._listener && (this._listener(this._parentWindow.devicePixelRatio, this._currentDevicePixelRatio), this._updateDpr());
            }, this._updateDpr();
          }
          _updateDpr() {
            var e3;
            this._outerListener && (null === (e3 = this._resolutionMediaMatchList) || void 0 === e3 || e3.removeListener(this._outerListener), this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio, this._resolutionMediaMatchList = this._parentWindow.matchMedia(`screen and (resolution: ${this._parentWindow.devicePixelRatio}dppx)`), this._resolutionMediaMatchList.addListener(this._outerListener));
          }
          clearListener() {
            this._resolutionMediaMatchList && this._listener && this._outerListener && (this._resolutionMediaMatchList.removeListener(this._outerListener), this._resolutionMediaMatchList = void 0, this._listener = void 0, this._outerListener = void 0);
          }
        }
        t2.ScreenDprMonitor = r;
      }, 3236: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Terminal = void 0;
        const s2 = i2(3614), r = i2(3656), n = i2(6465), o2 = i2(9042), a2 = i2(3730), h2 = i2(1680), c2 = i2(3107), l2 = i2(5744), d = i2(2950), _3 = i2(1296), u = i2(428), f = i2(4269), v2 = i2(5114), p = i2(8934), g2 = i2(3230), m2 = i2(9312), S = i2(4725), C = i2(6731), b = i2(8055), y3 = i2(8969), w2 = i2(8460), E = i2(844), k2 = i2(6114), L2 = i2(8437), D = i2(2584), R = i2(7399), x3 = i2(5941), A = i2(9074), B = i2(2585), T = i2(5435), M = i2(4567), O = "undefined" != typeof window ? window.document : null;
        class P extends y3.CoreTerminal {
          get onFocus() {
            return this._onFocus.event;
          }
          get onBlur() {
            return this._onBlur.event;
          }
          get onA11yChar() {
            return this._onA11yCharEmitter.event;
          }
          get onA11yTab() {
            return this._onA11yTabEmitter.event;
          }
          get onWillOpen() {
            return this._onWillOpen.event;
          }
          constructor(e3 = {}) {
            super(e3), this.browser = k2, this._keyDownHandled = false, this._keyDownSeen = false, this._keyPressHandled = false, this._unprocessedDeadKey = false, this._accessibilityManager = this.register(new E.MutableDisposable()), this._onCursorMove = this.register(new w2.EventEmitter()), this.onCursorMove = this._onCursorMove.event, this._onKey = this.register(new w2.EventEmitter()), this.onKey = this._onKey.event, this._onRender = this.register(new w2.EventEmitter()), this.onRender = this._onRender.event, this._onSelectionChange = this.register(new w2.EventEmitter()), this.onSelectionChange = this._onSelectionChange.event, this._onTitleChange = this.register(new w2.EventEmitter()), this.onTitleChange = this._onTitleChange.event, this._onBell = this.register(new w2.EventEmitter()), this.onBell = this._onBell.event, this._onFocus = this.register(new w2.EventEmitter()), this._onBlur = this.register(new w2.EventEmitter()), this._onA11yCharEmitter = this.register(new w2.EventEmitter()), this._onA11yTabEmitter = this.register(new w2.EventEmitter()), this._onWillOpen = this.register(new w2.EventEmitter()), this._setup(), this.linkifier2 = this.register(this._instantiationService.createInstance(n.Linkifier2)), this.linkifier2.registerLinkProvider(this._instantiationService.createInstance(a2.OscLinkProvider)), this._decorationService = this._instantiationService.createInstance(A.DecorationService), this._instantiationService.setService(B.IDecorationService, this._decorationService), this.register(this._inputHandler.onRequestBell(() => this._onBell.fire())), this.register(this._inputHandler.onRequestRefreshRows((e4, t3) => this.refresh(e4, t3))), this.register(this._inputHandler.onRequestSendFocus(() => this._reportFocus())), this.register(this._inputHandler.onRequestReset(() => this.reset())), this.register(this._inputHandler.onRequestWindowsOptionsReport((e4) => this._reportWindowsOptions(e4))), this.register(this._inputHandler.onColor((e4) => this._handleColorEvent(e4))), this.register((0, w2.forwardEvent)(this._inputHandler.onCursorMove, this._onCursorMove)), this.register((0, w2.forwardEvent)(this._inputHandler.onTitleChange, this._onTitleChange)), this.register((0, w2.forwardEvent)(this._inputHandler.onA11yChar, this._onA11yCharEmitter)), this.register((0, w2.forwardEvent)(this._inputHandler.onA11yTab, this._onA11yTabEmitter)), this.register(this._bufferService.onResize((e4) => this._afterResize(e4.cols, e4.rows))), this.register((0, E.toDisposable)(() => {
              var e4, t3;
              this._customKeyEventHandler = void 0, null === (t3 = null === (e4 = this.element) || void 0 === e4 ? void 0 : e4.parentNode) || void 0 === t3 || t3.removeChild(this.element);
            }));
          }
          _handleColorEvent(e3) {
            if (this._themeService) for (const t3 of e3) {
              let e4, i3 = "";
              switch (t3.index) {
                case 256:
                  e4 = "foreground", i3 = "10";
                  break;
                case 257:
                  e4 = "background", i3 = "11";
                  break;
                case 258:
                  e4 = "cursor", i3 = "12";
                  break;
                default:
                  e4 = "ansi", i3 = "4;" + t3.index;
              }
              switch (t3.type) {
                case 0:
                  const s3 = b.color.toColorRGB("ansi" === e4 ? this._themeService.colors.ansi[t3.index] : this._themeService.colors[e4]);
                  this.coreService.triggerDataEvent(`${D.C0.ESC}]${i3};${(0, x3.toRgbString)(s3)}${D.C1_ESCAPED.ST}`);
                  break;
                case 1:
                  if ("ansi" === e4) this._themeService.modifyColors((e5) => e5.ansi[t3.index] = b.rgba.toColor(...t3.color));
                  else {
                    const i4 = e4;
                    this._themeService.modifyColors((e5) => e5[i4] = b.rgba.toColor(...t3.color));
                  }
                  break;
                case 2:
                  this._themeService.restoreColor(t3.index);
              }
            }
          }
          _setup() {
            super._setup(), this._customKeyEventHandler = void 0;
          }
          get buffer() {
            return this.buffers.active;
          }
          focus() {
            this.textarea && this.textarea.focus({ preventScroll: true });
          }
          _handleScreenReaderModeOptionChange(e3) {
            e3 ? !this._accessibilityManager.value && this._renderService && (this._accessibilityManager.value = this._instantiationService.createInstance(M.AccessibilityManager, this)) : this._accessibilityManager.clear();
          }
          _handleTextAreaFocus(e3) {
            this.coreService.decPrivateModes.sendFocus && this.coreService.triggerDataEvent(D.C0.ESC + "[I"), this.updateCursorStyle(e3), this.element.classList.add("focus"), this._showCursor(), this._onFocus.fire();
          }
          blur() {
            var e3;
            return null === (e3 = this.textarea) || void 0 === e3 ? void 0 : e3.blur();
          }
          _handleTextAreaBlur() {
            this.textarea.value = "", this.refresh(this.buffer.y, this.buffer.y), this.coreService.decPrivateModes.sendFocus && this.coreService.triggerDataEvent(D.C0.ESC + "[O"), this.element.classList.remove("focus"), this._onBlur.fire();
          }
          _syncTextArea() {
            if (!this.textarea || !this.buffer.isCursorInViewport || this._compositionHelper.isComposing || !this._renderService) return;
            const e3 = this.buffer.ybase + this.buffer.y, t3 = this.buffer.lines.get(e3);
            if (!t3) return;
            const i3 = Math.min(this.buffer.x, this.cols - 1), s3 = this._renderService.dimensions.css.cell.height, r2 = t3.getWidth(i3), n2 = this._renderService.dimensions.css.cell.width * r2, o3 = this.buffer.y * this._renderService.dimensions.css.cell.height, a3 = i3 * this._renderService.dimensions.css.cell.width;
            this.textarea.style.left = a3 + "px", this.textarea.style.top = o3 + "px", this.textarea.style.width = n2 + "px", this.textarea.style.height = s3 + "px", this.textarea.style.lineHeight = s3 + "px", this.textarea.style.zIndex = "-5";
          }
          _initGlobal() {
            this._bindKeys(), this.register((0, r.addDisposableDomListener)(this.element, "copy", (e4) => {
              this.hasSelection() && (0, s2.copyHandler)(e4, this._selectionService);
            }));
            const e3 = (e4) => (0, s2.handlePasteEvent)(e4, this.textarea, this.coreService, this.optionsService);
            this.register((0, r.addDisposableDomListener)(this.textarea, "paste", e3)), this.register((0, r.addDisposableDomListener)(this.element, "paste", e3)), k2.isFirefox ? this.register((0, r.addDisposableDomListener)(this.element, "mousedown", (e4) => {
              2 === e4.button && (0, s2.rightClickHandler)(e4, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
            })) : this.register((0, r.addDisposableDomListener)(this.element, "contextmenu", (e4) => {
              (0, s2.rightClickHandler)(e4, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
            })), k2.isLinux && this.register((0, r.addDisposableDomListener)(this.element, "auxclick", (e4) => {
              1 === e4.button && (0, s2.moveTextAreaUnderMouseCursor)(e4, this.textarea, this.screenElement);
            }));
          }
          _bindKeys() {
            this.register((0, r.addDisposableDomListener)(this.textarea, "keyup", (e3) => this._keyUp(e3), true)), this.register((0, r.addDisposableDomListener)(this.textarea, "keydown", (e3) => this._keyDown(e3), true)), this.register((0, r.addDisposableDomListener)(this.textarea, "keypress", (e3) => this._keyPress(e3), true)), this.register((0, r.addDisposableDomListener)(this.textarea, "compositionstart", () => this._compositionHelper.compositionstart())), this.register((0, r.addDisposableDomListener)(this.textarea, "compositionupdate", (e3) => this._compositionHelper.compositionupdate(e3))), this.register((0, r.addDisposableDomListener)(this.textarea, "compositionend", () => this._compositionHelper.compositionend())), this.register((0, r.addDisposableDomListener)(this.textarea, "input", (e3) => this._inputEvent(e3), true)), this.register(this.onRender(() => this._compositionHelper.updateCompositionElements()));
          }
          open(e3) {
            var t3;
            if (!e3) throw new Error("Terminal requires a parent element.");
            e3.isConnected || this._logService.debug("Terminal.open was called on an element that was not attached to the DOM"), this._document = e3.ownerDocument, this.element = this._document.createElement("div"), this.element.dir = "ltr", this.element.classList.add("terminal"), this.element.classList.add("xterm"), e3.appendChild(this.element);
            const i3 = O.createDocumentFragment();
            this._viewportElement = O.createElement("div"), this._viewportElement.classList.add("xterm-viewport"), i3.appendChild(this._viewportElement), this._viewportScrollArea = O.createElement("div"), this._viewportScrollArea.classList.add("xterm-scroll-area"), this._viewportElement.appendChild(this._viewportScrollArea), this.screenElement = O.createElement("div"), this.screenElement.classList.add("xterm-screen"), this._helperContainer = O.createElement("div"), this._helperContainer.classList.add("xterm-helpers"), this.screenElement.appendChild(this._helperContainer), i3.appendChild(this.screenElement), this.textarea = O.createElement("textarea"), this.textarea.classList.add("xterm-helper-textarea"), this.textarea.setAttribute("aria-label", o2.promptLabel), k2.isChromeOS || this.textarea.setAttribute("aria-multiline", "false"), this.textarea.setAttribute("autocorrect", "off"), this.textarea.setAttribute("autocapitalize", "off"), this.textarea.setAttribute("spellcheck", "false"), this.textarea.tabIndex = 0, this._coreBrowserService = this._instantiationService.createInstance(v2.CoreBrowserService, this.textarea, null !== (t3 = this._document.defaultView) && void 0 !== t3 ? t3 : window), this._instantiationService.setService(S.ICoreBrowserService, this._coreBrowserService), this.register((0, r.addDisposableDomListener)(this.textarea, "focus", (e4) => this._handleTextAreaFocus(e4))), this.register((0, r.addDisposableDomListener)(this.textarea, "blur", () => this._handleTextAreaBlur())), this._helperContainer.appendChild(this.textarea), this._charSizeService = this._instantiationService.createInstance(u.CharSizeService, this._document, this._helperContainer), this._instantiationService.setService(S.ICharSizeService, this._charSizeService), this._themeService = this._instantiationService.createInstance(C.ThemeService), this._instantiationService.setService(S.IThemeService, this._themeService), this._characterJoinerService = this._instantiationService.createInstance(f.CharacterJoinerService), this._instantiationService.setService(S.ICharacterJoinerService, this._characterJoinerService), this._renderService = this.register(this._instantiationService.createInstance(g2.RenderService, this.rows, this.screenElement)), this._instantiationService.setService(S.IRenderService, this._renderService), this.register(this._renderService.onRenderedViewportChange((e4) => this._onRender.fire(e4))), this.onResize((e4) => this._renderService.resize(e4.cols, e4.rows)), this._compositionView = O.createElement("div"), this._compositionView.classList.add("composition-view"), this._compositionHelper = this._instantiationService.createInstance(d.CompositionHelper, this.textarea, this._compositionView), this._helperContainer.appendChild(this._compositionView), this.element.appendChild(i3);
            try {
              this._onWillOpen.fire(this.element);
            } catch (e4) {
            }
            this._renderService.hasRenderer() || this._renderService.setRenderer(this._createRenderer()), this._mouseService = this._instantiationService.createInstance(p.MouseService), this._instantiationService.setService(S.IMouseService, this._mouseService), this.viewport = this._instantiationService.createInstance(h2.Viewport, this._viewportElement, this._viewportScrollArea), this.viewport.onRequestScrollLines((e4) => this.scrollLines(e4.amount, e4.suppressScrollEvent, 1)), this.register(this._inputHandler.onRequestSyncScrollBar(() => this.viewport.syncScrollArea())), this.register(this.viewport), this.register(this.onCursorMove(() => {
              this._renderService.handleCursorMove(), this._syncTextArea();
            })), this.register(this.onResize(() => this._renderService.handleResize(this.cols, this.rows))), this.register(this.onBlur(() => this._renderService.handleBlur())), this.register(this.onFocus(() => this._renderService.handleFocus())), this.register(this._renderService.onDimensionsChange(() => this.viewport.syncScrollArea())), this._selectionService = this.register(this._instantiationService.createInstance(m2.SelectionService, this.element, this.screenElement, this.linkifier2)), this._instantiationService.setService(S.ISelectionService, this._selectionService), this.register(this._selectionService.onRequestScrollLines((e4) => this.scrollLines(e4.amount, e4.suppressScrollEvent))), this.register(this._selectionService.onSelectionChange(() => this._onSelectionChange.fire())), this.register(this._selectionService.onRequestRedraw((e4) => this._renderService.handleSelectionChanged(e4.start, e4.end, e4.columnSelectMode))), this.register(this._selectionService.onLinuxMouseSelection((e4) => {
              this.textarea.value = e4, this.textarea.focus(), this.textarea.select();
            })), this.register(this._onScroll.event((e4) => {
              this.viewport.syncScrollArea(), this._selectionService.refresh();
            })), this.register((0, r.addDisposableDomListener)(this._viewportElement, "scroll", () => this._selectionService.refresh())), this.linkifier2.attachToDom(this.screenElement, this._mouseService, this._renderService), this.register(this._instantiationService.createInstance(c2.BufferDecorationRenderer, this.screenElement)), this.register((0, r.addDisposableDomListener)(this.element, "mousedown", (e4) => this._selectionService.handleMouseDown(e4))), this.coreMouseService.areMouseEventsActive ? (this._selectionService.disable(), this.element.classList.add("enable-mouse-events")) : this._selectionService.enable(), this.options.screenReaderMode && (this._accessibilityManager.value = this._instantiationService.createInstance(M.AccessibilityManager, this)), this.register(this.optionsService.onSpecificOptionChange("screenReaderMode", (e4) => this._handleScreenReaderModeOptionChange(e4))), this.options.overviewRulerWidth && (this._overviewRulerRenderer = this.register(this._instantiationService.createInstance(l2.OverviewRulerRenderer, this._viewportElement, this.screenElement))), this.optionsService.onSpecificOptionChange("overviewRulerWidth", (e4) => {
              !this._overviewRulerRenderer && e4 && this._viewportElement && this.screenElement && (this._overviewRulerRenderer = this.register(this._instantiationService.createInstance(l2.OverviewRulerRenderer, this._viewportElement, this.screenElement)));
            }), this._charSizeService.measure(), this.refresh(0, this.rows - 1), this._initGlobal(), this.bindMouse();
          }
          _createRenderer() {
            return this._instantiationService.createInstance(_3.DomRenderer, this.element, this.screenElement, this._viewportElement, this.linkifier2);
          }
          bindMouse() {
            const e3 = this, t3 = this.element;
            function i3(t4) {
              const i4 = e3._mouseService.getMouseReportCoords(t4, e3.screenElement);
              if (!i4) return false;
              let s4, r2;
              switch (t4.overrideType || t4.type) {
                case "mousemove":
                  r2 = 32, void 0 === t4.buttons ? (s4 = 3, void 0 !== t4.button && (s4 = t4.button < 3 ? t4.button : 3)) : s4 = 1 & t4.buttons ? 0 : 4 & t4.buttons ? 1 : 2 & t4.buttons ? 2 : 3;
                  break;
                case "mouseup":
                  r2 = 0, s4 = t4.button < 3 ? t4.button : 3;
                  break;
                case "mousedown":
                  r2 = 1, s4 = t4.button < 3 ? t4.button : 3;
                  break;
                case "wheel":
                  if (0 === e3.viewport.getLinesScrolled(t4)) return false;
                  r2 = t4.deltaY < 0 ? 0 : 1, s4 = 4;
                  break;
                default:
                  return false;
              }
              return !(void 0 === r2 || void 0 === s4 || s4 > 4) && e3.coreMouseService.triggerMouseEvent({ col: i4.col, row: i4.row, x: i4.x, y: i4.y, button: s4, action: r2, ctrl: t4.ctrlKey, alt: t4.altKey, shift: t4.shiftKey });
            }
            const s3 = { mouseup: null, wheel: null, mousedrag: null, mousemove: null }, n2 = { mouseup: (e4) => (i3(e4), e4.buttons || (this._document.removeEventListener("mouseup", s3.mouseup), s3.mousedrag && this._document.removeEventListener("mousemove", s3.mousedrag)), this.cancel(e4)), wheel: (e4) => (i3(e4), this.cancel(e4, true)), mousedrag: (e4) => {
              e4.buttons && i3(e4);
            }, mousemove: (e4) => {
              e4.buttons || i3(e4);
            } };
            this.register(this.coreMouseService.onProtocolChange((e4) => {
              e4 ? ("debug" === this.optionsService.rawOptions.logLevel && this._logService.debug("Binding to mouse events:", this.coreMouseService.explainEvents(e4)), this.element.classList.add("enable-mouse-events"), this._selectionService.disable()) : (this._logService.debug("Unbinding from mouse events."), this.element.classList.remove("enable-mouse-events"), this._selectionService.enable()), 8 & e4 ? s3.mousemove || (t3.addEventListener("mousemove", n2.mousemove), s3.mousemove = n2.mousemove) : (t3.removeEventListener("mousemove", s3.mousemove), s3.mousemove = null), 16 & e4 ? s3.wheel || (t3.addEventListener("wheel", n2.wheel, { passive: false }), s3.wheel = n2.wheel) : (t3.removeEventListener("wheel", s3.wheel), s3.wheel = null), 2 & e4 ? s3.mouseup || (t3.addEventListener("mouseup", n2.mouseup), s3.mouseup = n2.mouseup) : (this._document.removeEventListener("mouseup", s3.mouseup), t3.removeEventListener("mouseup", s3.mouseup), s3.mouseup = null), 4 & e4 ? s3.mousedrag || (s3.mousedrag = n2.mousedrag) : (this._document.removeEventListener("mousemove", s3.mousedrag), s3.mousedrag = null);
            })), this.coreMouseService.activeProtocol = this.coreMouseService.activeProtocol, this.register((0, r.addDisposableDomListener)(t3, "mousedown", (e4) => {
              if (e4.preventDefault(), this.focus(), this.coreMouseService.areMouseEventsActive && !this._selectionService.shouldForceSelection(e4)) return i3(e4), s3.mouseup && this._document.addEventListener("mouseup", s3.mouseup), s3.mousedrag && this._document.addEventListener("mousemove", s3.mousedrag), this.cancel(e4);
            })), this.register((0, r.addDisposableDomListener)(t3, "wheel", (e4) => {
              if (!s3.wheel) {
                if (!this.buffer.hasScrollback) {
                  const t4 = this.viewport.getLinesScrolled(e4);
                  if (0 === t4) return;
                  const i4 = D.C0.ESC + (this.coreService.decPrivateModes.applicationCursorKeys ? "O" : "[") + (e4.deltaY < 0 ? "A" : "B");
                  let s4 = "";
                  for (let e5 = 0; e5 < Math.abs(t4); e5++) s4 += i4;
                  return this.coreService.triggerDataEvent(s4, true), this.cancel(e4, true);
                }
                return this.viewport.handleWheel(e4) ? this.cancel(e4) : void 0;
              }
            }, { passive: false })), this.register((0, r.addDisposableDomListener)(t3, "touchstart", (e4) => {
              if (!this.coreMouseService.areMouseEventsActive) return this.viewport.handleTouchStart(e4), this.cancel(e4);
            }, { passive: true })), this.register((0, r.addDisposableDomListener)(t3, "touchmove", (e4) => {
              if (!this.coreMouseService.areMouseEventsActive) return this.viewport.handleTouchMove(e4) ? void 0 : this.cancel(e4);
            }, { passive: false }));
          }
          refresh(e3, t3) {
            var i3;
            null === (i3 = this._renderService) || void 0 === i3 || i3.refreshRows(e3, t3);
          }
          updateCursorStyle(e3) {
            var t3;
            (null === (t3 = this._selectionService) || void 0 === t3 ? void 0 : t3.shouldColumnSelect(e3)) ? this.element.classList.add("column-select") : this.element.classList.remove("column-select");
          }
          _showCursor() {
            this.coreService.isCursorInitialized || (this.coreService.isCursorInitialized = true, this.refresh(this.buffer.y, this.buffer.y));
          }
          scrollLines(e3, t3, i3 = 0) {
            var s3;
            1 === i3 ? (super.scrollLines(e3, t3, i3), this.refresh(0, this.rows - 1)) : null === (s3 = this.viewport) || void 0 === s3 || s3.scrollLines(e3);
          }
          paste(e3) {
            (0, s2.paste)(e3, this.textarea, this.coreService, this.optionsService);
          }
          attachCustomKeyEventHandler(e3) {
            this._customKeyEventHandler = e3;
          }
          registerLinkProvider(e3) {
            return this.linkifier2.registerLinkProvider(e3);
          }
          registerCharacterJoiner(e3) {
            if (!this._characterJoinerService) throw new Error("Terminal must be opened first");
            const t3 = this._characterJoinerService.register(e3);
            return this.refresh(0, this.rows - 1), t3;
          }
          deregisterCharacterJoiner(e3) {
            if (!this._characterJoinerService) throw new Error("Terminal must be opened first");
            this._characterJoinerService.deregister(e3) && this.refresh(0, this.rows - 1);
          }
          get markers() {
            return this.buffer.markers;
          }
          registerMarker(e3) {
            return this.buffer.addMarker(this.buffer.ybase + this.buffer.y + e3);
          }
          registerDecoration(e3) {
            return this._decorationService.registerDecoration(e3);
          }
          hasSelection() {
            return !!this._selectionService && this._selectionService.hasSelection;
          }
          select(e3, t3, i3) {
            this._selectionService.setSelection(e3, t3, i3);
          }
          getSelection() {
            return this._selectionService ? this._selectionService.selectionText : "";
          }
          getSelectionPosition() {
            if (this._selectionService && this._selectionService.hasSelection) return { start: { x: this._selectionService.selectionStart[0], y: this._selectionService.selectionStart[1] }, end: { x: this._selectionService.selectionEnd[0], y: this._selectionService.selectionEnd[1] } };
          }
          clearSelection() {
            var e3;
            null === (e3 = this._selectionService) || void 0 === e3 || e3.clearSelection();
          }
          selectAll() {
            var e3;
            null === (e3 = this._selectionService) || void 0 === e3 || e3.selectAll();
          }
          selectLines(e3, t3) {
            var i3;
            null === (i3 = this._selectionService) || void 0 === i3 || i3.selectLines(e3, t3);
          }
          _keyDown(e3) {
            if (this._keyDownHandled = false, this._keyDownSeen = true, this._customKeyEventHandler && false === this._customKeyEventHandler(e3)) return false;
            const t3 = this.browser.isMac && this.options.macOptionIsMeta && e3.altKey;
            if (!t3 && !this._compositionHelper.keydown(e3)) return this.options.scrollOnUserInput && this.buffer.ybase !== this.buffer.ydisp && this.scrollToBottom(), false;
            t3 || "Dead" !== e3.key && "AltGraph" !== e3.key || (this._unprocessedDeadKey = true);
            const i3 = (0, R.evaluateKeyboardEvent)(e3, this.coreService.decPrivateModes.applicationCursorKeys, this.browser.isMac, this.options.macOptionIsMeta);
            if (this.updateCursorStyle(e3), 3 === i3.type || 2 === i3.type) {
              const t4 = this.rows - 1;
              return this.scrollLines(2 === i3.type ? -t4 : t4), this.cancel(e3, true);
            }
            return 1 === i3.type && this.selectAll(), !!this._isThirdLevelShift(this.browser, e3) || (i3.cancel && this.cancel(e3, true), !i3.key || !!(e3.key && !e3.ctrlKey && !e3.altKey && !e3.metaKey && 1 === e3.key.length && e3.key.charCodeAt(0) >= 65 && e3.key.charCodeAt(0) <= 90) || (this._unprocessedDeadKey ? (this._unprocessedDeadKey = false, true) : (i3.key !== D.C0.ETX && i3.key !== D.C0.CR || (this.textarea.value = ""), this._onKey.fire({ key: i3.key, domEvent: e3 }), this._showCursor(), this.coreService.triggerDataEvent(i3.key, true), !this.optionsService.rawOptions.screenReaderMode || e3.altKey || e3.ctrlKey ? this.cancel(e3, true) : void (this._keyDownHandled = true))));
          }
          _isThirdLevelShift(e3, t3) {
            const i3 = e3.isMac && !this.options.macOptionIsMeta && t3.altKey && !t3.ctrlKey && !t3.metaKey || e3.isWindows && t3.altKey && t3.ctrlKey && !t3.metaKey || e3.isWindows && t3.getModifierState("AltGraph");
            return "keypress" === t3.type ? i3 : i3 && (!t3.keyCode || t3.keyCode > 47);
          }
          _keyUp(e3) {
            this._keyDownSeen = false, this._customKeyEventHandler && false === this._customKeyEventHandler(e3) || (function(e4) {
              return 16 === e4.keyCode || 17 === e4.keyCode || 18 === e4.keyCode;
            }(e3) || this.focus(), this.updateCursorStyle(e3), this._keyPressHandled = false);
          }
          _keyPress(e3) {
            let t3;
            if (this._keyPressHandled = false, this._keyDownHandled) return false;
            if (this._customKeyEventHandler && false === this._customKeyEventHandler(e3)) return false;
            if (this.cancel(e3), e3.charCode) t3 = e3.charCode;
            else if (null === e3.which || void 0 === e3.which) t3 = e3.keyCode;
            else {
              if (0 === e3.which || 0 === e3.charCode) return false;
              t3 = e3.which;
            }
            return !(!t3 || (e3.altKey || e3.ctrlKey || e3.metaKey) && !this._isThirdLevelShift(this.browser, e3) || (t3 = String.fromCharCode(t3), this._onKey.fire({ key: t3, domEvent: e3 }), this._showCursor(), this.coreService.triggerDataEvent(t3, true), this._keyPressHandled = true, this._unprocessedDeadKey = false, 0));
          }
          _inputEvent(e3) {
            if (e3.data && "insertText" === e3.inputType && (!e3.composed || !this._keyDownSeen) && !this.optionsService.rawOptions.screenReaderMode) {
              if (this._keyPressHandled) return false;
              this._unprocessedDeadKey = false;
              const t3 = e3.data;
              return this.coreService.triggerDataEvent(t3, true), this.cancel(e3), true;
            }
            return false;
          }
          resize(e3, t3) {
            e3 !== this.cols || t3 !== this.rows ? super.resize(e3, t3) : this._charSizeService && !this._charSizeService.hasValidSize && this._charSizeService.measure();
          }
          _afterResize(e3, t3) {
            var i3, s3;
            null === (i3 = this._charSizeService) || void 0 === i3 || i3.measure(), null === (s3 = this.viewport) || void 0 === s3 || s3.syncScrollArea(true);
          }
          clear() {
            var e3;
            if (0 !== this.buffer.ybase || 0 !== this.buffer.y) {
              this.buffer.clearAllMarkers(), this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y)), this.buffer.lines.length = 1, this.buffer.ydisp = 0, this.buffer.ybase = 0, this.buffer.y = 0;
              for (let e4 = 1; e4 < this.rows; e4++) this.buffer.lines.push(this.buffer.getBlankLine(L2.DEFAULT_ATTR_DATA));
              this._onScroll.fire({ position: this.buffer.ydisp, source: 0 }), null === (e3 = this.viewport) || void 0 === e3 || e3.reset(), this.refresh(0, this.rows - 1);
            }
          }
          reset() {
            var e3, t3;
            this.options.rows = this.rows, this.options.cols = this.cols;
            const i3 = this._customKeyEventHandler;
            this._setup(), super.reset(), null === (e3 = this._selectionService) || void 0 === e3 || e3.reset(), this._decorationService.reset(), null === (t3 = this.viewport) || void 0 === t3 || t3.reset(), this._customKeyEventHandler = i3, this.refresh(0, this.rows - 1);
          }
          clearTextureAtlas() {
            var e3;
            null === (e3 = this._renderService) || void 0 === e3 || e3.clearTextureAtlas();
          }
          _reportFocus() {
            var e3;
            (null === (e3 = this.element) || void 0 === e3 ? void 0 : e3.classList.contains("focus")) ? this.coreService.triggerDataEvent(D.C0.ESC + "[I") : this.coreService.triggerDataEvent(D.C0.ESC + "[O");
          }
          _reportWindowsOptions(e3) {
            if (this._renderService) switch (e3) {
              case T.WindowsOptionsReportType.GET_WIN_SIZE_PIXELS:
                const e4 = this._renderService.dimensions.css.canvas.width.toFixed(0), t3 = this._renderService.dimensions.css.canvas.height.toFixed(0);
                this.coreService.triggerDataEvent(`${D.C0.ESC}[4;${t3};${e4}t`);
                break;
              case T.WindowsOptionsReportType.GET_CELL_SIZE_PIXELS:
                const i3 = this._renderService.dimensions.css.cell.width.toFixed(0), s3 = this._renderService.dimensions.css.cell.height.toFixed(0);
                this.coreService.triggerDataEvent(`${D.C0.ESC}[6;${s3};${i3}t`);
            }
          }
          cancel(e3, t3) {
            if (this.options.cancelEvents || t3) return e3.preventDefault(), e3.stopPropagation(), false;
          }
        }
        t2.Terminal = P;
      }, 9924: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.TimeBasedDebouncer = void 0, t2.TimeBasedDebouncer = class {
          constructor(e3, t3 = 1e3) {
            this._renderCallback = e3, this._debounceThresholdMS = t3, this._lastRefreshMs = 0, this._additionalRefreshRequested = false;
          }
          dispose() {
            this._refreshTimeoutID && clearTimeout(this._refreshTimeoutID);
          }
          refresh(e3, t3, i2) {
            this._rowCount = i2, e3 = void 0 !== e3 ? e3 : 0, t3 = void 0 !== t3 ? t3 : this._rowCount - 1, this._rowStart = void 0 !== this._rowStart ? Math.min(this._rowStart, e3) : e3, this._rowEnd = void 0 !== this._rowEnd ? Math.max(this._rowEnd, t3) : t3;
            const s2 = Date.now();
            if (s2 - this._lastRefreshMs >= this._debounceThresholdMS) this._lastRefreshMs = s2, this._innerRefresh();
            else if (!this._additionalRefreshRequested) {
              const e4 = s2 - this._lastRefreshMs, t4 = this._debounceThresholdMS - e4;
              this._additionalRefreshRequested = true, this._refreshTimeoutID = window.setTimeout(() => {
                this._lastRefreshMs = Date.now(), this._innerRefresh(), this._additionalRefreshRequested = false, this._refreshTimeoutID = void 0;
              }, t4);
            }
          }
          _innerRefresh() {
            if (void 0 === this._rowStart || void 0 === this._rowEnd || void 0 === this._rowCount) return;
            const e3 = Math.max(this._rowStart, 0), t3 = Math.min(this._rowEnd, this._rowCount - 1);
            this._rowStart = void 0, this._rowEnd = void 0, this._renderCallback(e3, t3);
          }
        };
      }, 1680: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Viewport = void 0;
        const n = i2(3656), o2 = i2(4725), a2 = i2(8460), h2 = i2(844), c2 = i2(2585);
        let l2 = t2.Viewport = class extends h2.Disposable {
          constructor(e3, t3, i3, s3, r2, o3, h3, c3) {
            super(), this._viewportElement = e3, this._scrollArea = t3, this._bufferService = i3, this._optionsService = s3, this._charSizeService = r2, this._renderService = o3, this._coreBrowserService = h3, this.scrollBarWidth = 0, this._currentRowHeight = 0, this._currentDeviceCellHeight = 0, this._lastRecordedBufferLength = 0, this._lastRecordedViewportHeight = 0, this._lastRecordedBufferHeight = 0, this._lastTouchY = 0, this._lastScrollTop = 0, this._wheelPartialScroll = 0, this._refreshAnimationFrame = null, this._ignoreNextScrollEvent = false, this._smoothScrollState = { startTime: 0, origin: -1, target: -1 }, this._onRequestScrollLines = this.register(new a2.EventEmitter()), this.onRequestScrollLines = this._onRequestScrollLines.event, this.scrollBarWidth = this._viewportElement.offsetWidth - this._scrollArea.offsetWidth || 15, this.register((0, n.addDisposableDomListener)(this._viewportElement, "scroll", this._handleScroll.bind(this))), this._activeBuffer = this._bufferService.buffer, this.register(this._bufferService.buffers.onBufferActivate((e4) => this._activeBuffer = e4.activeBuffer)), this._renderDimensions = this._renderService.dimensions, this.register(this._renderService.onDimensionsChange((e4) => this._renderDimensions = e4)), this._handleThemeChange(c3.colors), this.register(c3.onChangeColors((e4) => this._handleThemeChange(e4))), this.register(this._optionsService.onSpecificOptionChange("scrollback", () => this.syncScrollArea())), setTimeout(() => this.syncScrollArea());
          }
          _handleThemeChange(e3) {
            this._viewportElement.style.backgroundColor = e3.background.css;
          }
          reset() {
            this._currentRowHeight = 0, this._currentDeviceCellHeight = 0, this._lastRecordedBufferLength = 0, this._lastRecordedViewportHeight = 0, this._lastRecordedBufferHeight = 0, this._lastTouchY = 0, this._lastScrollTop = 0, this._coreBrowserService.window.requestAnimationFrame(() => this.syncScrollArea());
          }
          _refresh(e3) {
            if (e3) return this._innerRefresh(), void (null !== this._refreshAnimationFrame && this._coreBrowserService.window.cancelAnimationFrame(this._refreshAnimationFrame));
            null === this._refreshAnimationFrame && (this._refreshAnimationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._innerRefresh()));
          }
          _innerRefresh() {
            if (this._charSizeService.height > 0) {
              this._currentRowHeight = this._renderService.dimensions.device.cell.height / this._coreBrowserService.dpr, this._currentDeviceCellHeight = this._renderService.dimensions.device.cell.height, this._lastRecordedViewportHeight = this._viewportElement.offsetHeight;
              const e4 = Math.round(this._currentRowHeight * this._lastRecordedBufferLength) + (this._lastRecordedViewportHeight - this._renderService.dimensions.css.canvas.height);
              this._lastRecordedBufferHeight !== e4 && (this._lastRecordedBufferHeight = e4, this._scrollArea.style.height = this._lastRecordedBufferHeight + "px");
            }
            const e3 = this._bufferService.buffer.ydisp * this._currentRowHeight;
            this._viewportElement.scrollTop !== e3 && (this._ignoreNextScrollEvent = true, this._viewportElement.scrollTop = e3), this._refreshAnimationFrame = null;
          }
          syncScrollArea(e3 = false) {
            if (this._lastRecordedBufferLength !== this._bufferService.buffer.lines.length) return this._lastRecordedBufferLength = this._bufferService.buffer.lines.length, void this._refresh(e3);
            this._lastRecordedViewportHeight === this._renderService.dimensions.css.canvas.height && this._lastScrollTop === this._activeBuffer.ydisp * this._currentRowHeight && this._renderDimensions.device.cell.height === this._currentDeviceCellHeight || this._refresh(e3);
          }
          _handleScroll(e3) {
            if (this._lastScrollTop = this._viewportElement.scrollTop, !this._viewportElement.offsetParent) return;
            if (this._ignoreNextScrollEvent) return this._ignoreNextScrollEvent = false, void this._onRequestScrollLines.fire({ amount: 0, suppressScrollEvent: true });
            const t3 = Math.round(this._lastScrollTop / this._currentRowHeight) - this._bufferService.buffer.ydisp;
            this._onRequestScrollLines.fire({ amount: t3, suppressScrollEvent: true });
          }
          _smoothScroll() {
            if (this._isDisposed || -1 === this._smoothScrollState.origin || -1 === this._smoothScrollState.target) return;
            const e3 = this._smoothScrollPercent();
            this._viewportElement.scrollTop = this._smoothScrollState.origin + Math.round(e3 * (this._smoothScrollState.target - this._smoothScrollState.origin)), e3 < 1 ? this._coreBrowserService.window.requestAnimationFrame(() => this._smoothScroll()) : this._clearSmoothScrollState();
          }
          _smoothScrollPercent() {
            return this._optionsService.rawOptions.smoothScrollDuration && this._smoothScrollState.startTime ? Math.max(Math.min((Date.now() - this._smoothScrollState.startTime) / this._optionsService.rawOptions.smoothScrollDuration, 1), 0) : 1;
          }
          _clearSmoothScrollState() {
            this._smoothScrollState.startTime = 0, this._smoothScrollState.origin = -1, this._smoothScrollState.target = -1;
          }
          _bubbleScroll(e3, t3) {
            const i3 = this._viewportElement.scrollTop + this._lastRecordedViewportHeight;
            return !(t3 < 0 && 0 !== this._viewportElement.scrollTop || t3 > 0 && i3 < this._lastRecordedBufferHeight) || (e3.cancelable && e3.preventDefault(), false);
          }
          handleWheel(e3) {
            const t3 = this._getPixelsScrolled(e3);
            return 0 !== t3 && (this._optionsService.rawOptions.smoothScrollDuration ? (this._smoothScrollState.startTime = Date.now(), this._smoothScrollPercent() < 1 ? (this._smoothScrollState.origin = this._viewportElement.scrollTop, -1 === this._smoothScrollState.target ? this._smoothScrollState.target = this._viewportElement.scrollTop + t3 : this._smoothScrollState.target += t3, this._smoothScrollState.target = Math.max(Math.min(this._smoothScrollState.target, this._viewportElement.scrollHeight), 0), this._smoothScroll()) : this._clearSmoothScrollState()) : this._viewportElement.scrollTop += t3, this._bubbleScroll(e3, t3));
          }
          scrollLines(e3) {
            if (0 !== e3) if (this._optionsService.rawOptions.smoothScrollDuration) {
              const t3 = e3 * this._currentRowHeight;
              this._smoothScrollState.startTime = Date.now(), this._smoothScrollPercent() < 1 ? (this._smoothScrollState.origin = this._viewportElement.scrollTop, this._smoothScrollState.target = this._smoothScrollState.origin + t3, this._smoothScrollState.target = Math.max(Math.min(this._smoothScrollState.target, this._viewportElement.scrollHeight), 0), this._smoothScroll()) : this._clearSmoothScrollState();
            } else this._onRequestScrollLines.fire({ amount: e3, suppressScrollEvent: false });
          }
          _getPixelsScrolled(e3) {
            if (0 === e3.deltaY || e3.shiftKey) return 0;
            let t3 = this._applyScrollModifier(e3.deltaY, e3);
            return e3.deltaMode === WheelEvent.DOM_DELTA_LINE ? t3 *= this._currentRowHeight : e3.deltaMode === WheelEvent.DOM_DELTA_PAGE && (t3 *= this._currentRowHeight * this._bufferService.rows), t3;
          }
          getBufferElements(e3, t3) {
            var i3;
            let s3, r2 = "";
            const n2 = [], o3 = null != t3 ? t3 : this._bufferService.buffer.lines.length, a3 = this._bufferService.buffer.lines;
            for (let t4 = e3; t4 < o3; t4++) {
              const e4 = a3.get(t4);
              if (!e4) continue;
              const o4 = null === (i3 = a3.get(t4 + 1)) || void 0 === i3 ? void 0 : i3.isWrapped;
              if (r2 += e4.translateToString(!o4), !o4 || t4 === a3.length - 1) {
                const e5 = document.createElement("div");
                e5.textContent = r2, n2.push(e5), r2.length > 0 && (s3 = e5), r2 = "";
              }
            }
            return { bufferElements: n2, cursorElement: s3 };
          }
          getLinesScrolled(e3) {
            if (0 === e3.deltaY || e3.shiftKey) return 0;
            let t3 = this._applyScrollModifier(e3.deltaY, e3);
            return e3.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? (t3 /= this._currentRowHeight + 0, this._wheelPartialScroll += t3, t3 = Math.floor(Math.abs(this._wheelPartialScroll)) * (this._wheelPartialScroll > 0 ? 1 : -1), this._wheelPartialScroll %= 1) : e3.deltaMode === WheelEvent.DOM_DELTA_PAGE && (t3 *= this._bufferService.rows), t3;
          }
          _applyScrollModifier(e3, t3) {
            const i3 = this._optionsService.rawOptions.fastScrollModifier;
            return "alt" === i3 && t3.altKey || "ctrl" === i3 && t3.ctrlKey || "shift" === i3 && t3.shiftKey ? e3 * this._optionsService.rawOptions.fastScrollSensitivity * this._optionsService.rawOptions.scrollSensitivity : e3 * this._optionsService.rawOptions.scrollSensitivity;
          }
          handleTouchStart(e3) {
            this._lastTouchY = e3.touches[0].pageY;
          }
          handleTouchMove(e3) {
            const t3 = this._lastTouchY - e3.touches[0].pageY;
            return this._lastTouchY = e3.touches[0].pageY, 0 !== t3 && (this._viewportElement.scrollTop += t3, this._bubbleScroll(e3, t3));
          }
        };
        t2.Viewport = l2 = s2([r(2, c2.IBufferService), r(3, c2.IOptionsService), r(4, o2.ICharSizeService), r(5, o2.IRenderService), r(6, o2.ICoreBrowserService), r(7, o2.IThemeService)], l2);
      }, 3107: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferDecorationRenderer = void 0;
        const n = i2(3656), o2 = i2(4725), a2 = i2(844), h2 = i2(2585);
        let c2 = t2.BufferDecorationRenderer = class extends a2.Disposable {
          constructor(e3, t3, i3, s3) {
            super(), this._screenElement = e3, this._bufferService = t3, this._decorationService = i3, this._renderService = s3, this._decorationElements = /* @__PURE__ */ new Map(), this._altBufferIsActive = false, this._dimensionsChanged = false, this._container = document.createElement("div"), this._container.classList.add("xterm-decoration-container"), this._screenElement.appendChild(this._container), this.register(this._renderService.onRenderedViewportChange(() => this._doRefreshDecorations())), this.register(this._renderService.onDimensionsChange(() => {
              this._dimensionsChanged = true, this._queueRefresh();
            })), this.register((0, n.addDisposableDomListener)(window, "resize", () => this._queueRefresh())), this.register(this._bufferService.buffers.onBufferActivate(() => {
              this._altBufferIsActive = this._bufferService.buffer === this._bufferService.buffers.alt;
            })), this.register(this._decorationService.onDecorationRegistered(() => this._queueRefresh())), this.register(this._decorationService.onDecorationRemoved((e4) => this._removeDecoration(e4))), this.register((0, a2.toDisposable)(() => {
              this._container.remove(), this._decorationElements.clear();
            }));
          }
          _queueRefresh() {
            void 0 === this._animationFrame && (this._animationFrame = this._renderService.addRefreshCallback(() => {
              this._doRefreshDecorations(), this._animationFrame = void 0;
            }));
          }
          _doRefreshDecorations() {
            for (const e3 of this._decorationService.decorations) this._renderDecoration(e3);
            this._dimensionsChanged = false;
          }
          _renderDecoration(e3) {
            this._refreshStyle(e3), this._dimensionsChanged && this._refreshXPosition(e3);
          }
          _createElement(e3) {
            var t3, i3;
            const s3 = document.createElement("div");
            s3.classList.add("xterm-decoration"), s3.classList.toggle("xterm-decoration-top-layer", "top" === (null === (t3 = null == e3 ? void 0 : e3.options) || void 0 === t3 ? void 0 : t3.layer)), s3.style.width = `${Math.round((e3.options.width || 1) * this._renderService.dimensions.css.cell.width)}px`, s3.style.height = (e3.options.height || 1) * this._renderService.dimensions.css.cell.height + "px", s3.style.top = (e3.marker.line - this._bufferService.buffers.active.ydisp) * this._renderService.dimensions.css.cell.height + "px", s3.style.lineHeight = `${this._renderService.dimensions.css.cell.height}px`;
            const r2 = null !== (i3 = e3.options.x) && void 0 !== i3 ? i3 : 0;
            return r2 && r2 > this._bufferService.cols && (s3.style.display = "none"), this._refreshXPosition(e3, s3), s3;
          }
          _refreshStyle(e3) {
            const t3 = e3.marker.line - this._bufferService.buffers.active.ydisp;
            if (t3 < 0 || t3 >= this._bufferService.rows) e3.element && (e3.element.style.display = "none", e3.onRenderEmitter.fire(e3.element));
            else {
              let i3 = this._decorationElements.get(e3);
              i3 || (i3 = this._createElement(e3), e3.element = i3, this._decorationElements.set(e3, i3), this._container.appendChild(i3), e3.onDispose(() => {
                this._decorationElements.delete(e3), i3.remove();
              })), i3.style.top = t3 * this._renderService.dimensions.css.cell.height + "px", i3.style.display = this._altBufferIsActive ? "none" : "block", e3.onRenderEmitter.fire(i3);
            }
          }
          _refreshXPosition(e3, t3 = e3.element) {
            var i3;
            if (!t3) return;
            const s3 = null !== (i3 = e3.options.x) && void 0 !== i3 ? i3 : 0;
            "right" === (e3.options.anchor || "left") ? t3.style.right = s3 ? s3 * this._renderService.dimensions.css.cell.width + "px" : "" : t3.style.left = s3 ? s3 * this._renderService.dimensions.css.cell.width + "px" : "";
          }
          _removeDecoration(e3) {
            var t3;
            null === (t3 = this._decorationElements.get(e3)) || void 0 === t3 || t3.remove(), this._decorationElements.delete(e3), e3.dispose();
          }
        };
        t2.BufferDecorationRenderer = c2 = s2([r(1, h2.IBufferService), r(2, h2.IDecorationService), r(3, o2.IRenderService)], c2);
      }, 5871: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ColorZoneStore = void 0, t2.ColorZoneStore = class {
          constructor() {
            this._zones = [], this._zonePool = [], this._zonePoolIndex = 0, this._linePadding = { full: 0, left: 0, center: 0, right: 0 };
          }
          get zones() {
            return this._zonePool.length = Math.min(this._zonePool.length, this._zones.length), this._zones;
          }
          clear() {
            this._zones.length = 0, this._zonePoolIndex = 0;
          }
          addDecoration(e3) {
            if (e3.options.overviewRulerOptions) {
              for (const t3 of this._zones) if (t3.color === e3.options.overviewRulerOptions.color && t3.position === e3.options.overviewRulerOptions.position) {
                if (this._lineIntersectsZone(t3, e3.marker.line)) return;
                if (this._lineAdjacentToZone(t3, e3.marker.line, e3.options.overviewRulerOptions.position)) return void this._addLineToZone(t3, e3.marker.line);
              }
              if (this._zonePoolIndex < this._zonePool.length) return this._zonePool[this._zonePoolIndex].color = e3.options.overviewRulerOptions.color, this._zonePool[this._zonePoolIndex].position = e3.options.overviewRulerOptions.position, this._zonePool[this._zonePoolIndex].startBufferLine = e3.marker.line, this._zonePool[this._zonePoolIndex].endBufferLine = e3.marker.line, void this._zones.push(this._zonePool[this._zonePoolIndex++]);
              this._zones.push({ color: e3.options.overviewRulerOptions.color, position: e3.options.overviewRulerOptions.position, startBufferLine: e3.marker.line, endBufferLine: e3.marker.line }), this._zonePool.push(this._zones[this._zones.length - 1]), this._zonePoolIndex++;
            }
          }
          setPadding(e3) {
            this._linePadding = e3;
          }
          _lineIntersectsZone(e3, t3) {
            return t3 >= e3.startBufferLine && t3 <= e3.endBufferLine;
          }
          _lineAdjacentToZone(e3, t3, i2) {
            return t3 >= e3.startBufferLine - this._linePadding[i2 || "full"] && t3 <= e3.endBufferLine + this._linePadding[i2 || "full"];
          }
          _addLineToZone(e3, t3) {
            e3.startBufferLine = Math.min(e3.startBufferLine, t3), e3.endBufferLine = Math.max(e3.endBufferLine, t3);
          }
        };
      }, 5744: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.OverviewRulerRenderer = void 0;
        const n = i2(5871), o2 = i2(3656), a2 = i2(4725), h2 = i2(844), c2 = i2(2585), l2 = { full: 0, left: 0, center: 0, right: 0 }, d = { full: 0, left: 0, center: 0, right: 0 }, _3 = { full: 0, left: 0, center: 0, right: 0 };
        let u = t2.OverviewRulerRenderer = class extends h2.Disposable {
          get _width() {
            return this._optionsService.options.overviewRulerWidth || 0;
          }
          constructor(e3, t3, i3, s3, r2, o3, a3) {
            var c3;
            super(), this._viewportElement = e3, this._screenElement = t3, this._bufferService = i3, this._decorationService = s3, this._renderService = r2, this._optionsService = o3, this._coreBrowseService = a3, this._colorZoneStore = new n.ColorZoneStore(), this._shouldUpdateDimensions = true, this._shouldUpdateAnchor = true, this._lastKnownBufferLength = 0, this._canvas = document.createElement("canvas"), this._canvas.classList.add("xterm-decoration-overview-ruler"), this._refreshCanvasDimensions(), null === (c3 = this._viewportElement.parentElement) || void 0 === c3 || c3.insertBefore(this._canvas, this._viewportElement);
            const l3 = this._canvas.getContext("2d");
            if (!l3) throw new Error("Ctx cannot be null");
            this._ctx = l3, this._registerDecorationListeners(), this._registerBufferChangeListeners(), this._registerDimensionChangeListeners(), this.register((0, h2.toDisposable)(() => {
              var e4;
              null === (e4 = this._canvas) || void 0 === e4 || e4.remove();
            }));
          }
          _registerDecorationListeners() {
            this.register(this._decorationService.onDecorationRegistered(() => this._queueRefresh(void 0, true))), this.register(this._decorationService.onDecorationRemoved(() => this._queueRefresh(void 0, true)));
          }
          _registerBufferChangeListeners() {
            this.register(this._renderService.onRenderedViewportChange(() => this._queueRefresh())), this.register(this._bufferService.buffers.onBufferActivate(() => {
              this._canvas.style.display = this._bufferService.buffer === this._bufferService.buffers.alt ? "none" : "block";
            })), this.register(this._bufferService.onScroll(() => {
              this._lastKnownBufferLength !== this._bufferService.buffers.normal.lines.length && (this._refreshDrawHeightConstants(), this._refreshColorZonePadding());
            }));
          }
          _registerDimensionChangeListeners() {
            this.register(this._renderService.onRender(() => {
              this._containerHeight && this._containerHeight === this._screenElement.clientHeight || (this._queueRefresh(true), this._containerHeight = this._screenElement.clientHeight);
            })), this.register(this._optionsService.onSpecificOptionChange("overviewRulerWidth", () => this._queueRefresh(true))), this.register((0, o2.addDisposableDomListener)(this._coreBrowseService.window, "resize", () => this._queueRefresh(true))), this._queueRefresh(true);
          }
          _refreshDrawConstants() {
            const e3 = Math.floor(this._canvas.width / 3), t3 = Math.ceil(this._canvas.width / 3);
            d.full = this._canvas.width, d.left = e3, d.center = t3, d.right = e3, this._refreshDrawHeightConstants(), _3.full = 0, _3.left = 0, _3.center = d.left, _3.right = d.left + d.center;
          }
          _refreshDrawHeightConstants() {
            l2.full = Math.round(2 * this._coreBrowseService.dpr);
            const e3 = this._canvas.height / this._bufferService.buffer.lines.length, t3 = Math.round(Math.max(Math.min(e3, 12), 6) * this._coreBrowseService.dpr);
            l2.left = t3, l2.center = t3, l2.right = t3;
          }
          _refreshColorZonePadding() {
            this._colorZoneStore.setPadding({ full: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * l2.full), left: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * l2.left), center: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * l2.center), right: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * l2.right) }), this._lastKnownBufferLength = this._bufferService.buffers.normal.lines.length;
          }
          _refreshCanvasDimensions() {
            this._canvas.style.width = `${this._width}px`, this._canvas.width = Math.round(this._width * this._coreBrowseService.dpr), this._canvas.style.height = `${this._screenElement.clientHeight}px`, this._canvas.height = Math.round(this._screenElement.clientHeight * this._coreBrowseService.dpr), this._refreshDrawConstants(), this._refreshColorZonePadding();
          }
          _refreshDecorations() {
            this._shouldUpdateDimensions && this._refreshCanvasDimensions(), this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height), this._colorZoneStore.clear();
            for (const e4 of this._decorationService.decorations) this._colorZoneStore.addDecoration(e4);
            this._ctx.lineWidth = 1;
            const e3 = this._colorZoneStore.zones;
            for (const t3 of e3) "full" !== t3.position && this._renderColorZone(t3);
            for (const t3 of e3) "full" === t3.position && this._renderColorZone(t3);
            this._shouldUpdateDimensions = false, this._shouldUpdateAnchor = false;
          }
          _renderColorZone(e3) {
            this._ctx.fillStyle = e3.color, this._ctx.fillRect(_3[e3.position || "full"], Math.round((this._canvas.height - 1) * (e3.startBufferLine / this._bufferService.buffers.active.lines.length) - l2[e3.position || "full"] / 2), d[e3.position || "full"], Math.round((this._canvas.height - 1) * ((e3.endBufferLine - e3.startBufferLine) / this._bufferService.buffers.active.lines.length) + l2[e3.position || "full"]));
          }
          _queueRefresh(e3, t3) {
            this._shouldUpdateDimensions = e3 || this._shouldUpdateDimensions, this._shouldUpdateAnchor = t3 || this._shouldUpdateAnchor, void 0 === this._animationFrame && (this._animationFrame = this._coreBrowseService.window.requestAnimationFrame(() => {
              this._refreshDecorations(), this._animationFrame = void 0;
            }));
          }
        };
        t2.OverviewRulerRenderer = u = s2([r(2, c2.IBufferService), r(3, c2.IDecorationService), r(4, a2.IRenderService), r(5, c2.IOptionsService), r(6, a2.ICoreBrowserService)], u);
      }, 2950: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CompositionHelper = void 0;
        const n = i2(4725), o2 = i2(2585), a2 = i2(2584);
        let h2 = t2.CompositionHelper = class {
          get isComposing() {
            return this._isComposing;
          }
          constructor(e3, t3, i3, s3, r2, n2) {
            this._textarea = e3, this._compositionView = t3, this._bufferService = i3, this._optionsService = s3, this._coreService = r2, this._renderService = n2, this._isComposing = false, this._isSendingComposition = false, this._compositionPosition = { start: 0, end: 0 }, this._dataAlreadySent = "";
          }
          compositionstart() {
            this._isComposing = true, this._compositionPosition.start = this._textarea.value.length, this._compositionView.textContent = "", this._dataAlreadySent = "", this._compositionView.classList.add("active");
          }
          compositionupdate(e3) {
            this._compositionView.textContent = e3.data, this.updateCompositionElements(), setTimeout(() => {
              this._compositionPosition.end = this._textarea.value.length;
            }, 0);
          }
          compositionend() {
            this._finalizeComposition(true);
          }
          keydown(e3) {
            if (this._isComposing || this._isSendingComposition) {
              if (229 === e3.keyCode) return false;
              if (16 === e3.keyCode || 17 === e3.keyCode || 18 === e3.keyCode) return false;
              this._finalizeComposition(false);
            }
            return 229 !== e3.keyCode || (this._handleAnyTextareaChanges(), false);
          }
          _finalizeComposition(e3) {
            if (this._compositionView.classList.remove("active"), this._isComposing = false, e3) {
              const e4 = { start: this._compositionPosition.start, end: this._compositionPosition.end };
              this._isSendingComposition = true, setTimeout(() => {
                if (this._isSendingComposition) {
                  let t3;
                  this._isSendingComposition = false, e4.start += this._dataAlreadySent.length, t3 = this._isComposing ? this._textarea.value.substring(e4.start, e4.end) : this._textarea.value.substring(e4.start), t3.length > 0 && this._coreService.triggerDataEvent(t3, true);
                }
              }, 0);
            } else {
              this._isSendingComposition = false;
              const e4 = this._textarea.value.substring(this._compositionPosition.start, this._compositionPosition.end);
              this._coreService.triggerDataEvent(e4, true);
            }
          }
          _handleAnyTextareaChanges() {
            const e3 = this._textarea.value;
            setTimeout(() => {
              if (!this._isComposing) {
                const t3 = this._textarea.value, i3 = t3.replace(e3, "");
                this._dataAlreadySent = i3, t3.length > e3.length ? this._coreService.triggerDataEvent(i3, true) : t3.length < e3.length ? this._coreService.triggerDataEvent(`${a2.C0.DEL}`, true) : t3.length === e3.length && t3 !== e3 && this._coreService.triggerDataEvent(t3, true);
              }
            }, 0);
          }
          updateCompositionElements(e3) {
            if (this._isComposing) {
              if (this._bufferService.buffer.isCursorInViewport) {
                const e4 = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1), t3 = this._renderService.dimensions.css.cell.height, i3 = this._bufferService.buffer.y * this._renderService.dimensions.css.cell.height, s3 = e4 * this._renderService.dimensions.css.cell.width;
                this._compositionView.style.left = s3 + "px", this._compositionView.style.top = i3 + "px", this._compositionView.style.height = t3 + "px", this._compositionView.style.lineHeight = t3 + "px", this._compositionView.style.fontFamily = this._optionsService.rawOptions.fontFamily, this._compositionView.style.fontSize = this._optionsService.rawOptions.fontSize + "px";
                const r2 = this._compositionView.getBoundingClientRect();
                this._textarea.style.left = s3 + "px", this._textarea.style.top = i3 + "px", this._textarea.style.width = Math.max(r2.width, 1) + "px", this._textarea.style.height = Math.max(r2.height, 1) + "px", this._textarea.style.lineHeight = r2.height + "px";
              }
              e3 || setTimeout(() => this.updateCompositionElements(true), 0);
            }
          }
        };
        t2.CompositionHelper = h2 = s2([r(2, o2.IBufferService), r(3, o2.IOptionsService), r(4, o2.ICoreService), r(5, n.IRenderService)], h2);
      }, 9806: (e2, t2) => {
        function i2(e3, t3, i3) {
          const s2 = i3.getBoundingClientRect(), r = e3.getComputedStyle(i3), n = parseInt(r.getPropertyValue("padding-left")), o2 = parseInt(r.getPropertyValue("padding-top"));
          return [t3.clientX - s2.left - n, t3.clientY - s2.top - o2];
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.getCoords = t2.getCoordsRelativeToElement = void 0, t2.getCoordsRelativeToElement = i2, t2.getCoords = function(e3, t3, s2, r, n, o2, a2, h2, c2) {
          if (!o2) return;
          const l2 = i2(e3, t3, s2);
          return l2 ? (l2[0] = Math.ceil((l2[0] + (c2 ? a2 / 2 : 0)) / a2), l2[1] = Math.ceil(l2[1] / h2), l2[0] = Math.min(Math.max(l2[0], 1), r + (c2 ? 1 : 0)), l2[1] = Math.min(Math.max(l2[1], 1), n), l2) : void 0;
        };
      }, 9504: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.moveToCellSequence = void 0;
        const s2 = i2(2584);
        function r(e3, t3, i3, s3) {
          const r2 = e3 - n(e3, i3), a3 = t3 - n(t3, i3), l2 = Math.abs(r2 - a3) - function(e4, t4, i4) {
            let s4 = 0;
            const r3 = e4 - n(e4, i4), a4 = t4 - n(t4, i4);
            for (let n2 = 0; n2 < Math.abs(r3 - a4); n2++) {
              const a5 = "A" === o2(e4, t4) ? -1 : 1, h3 = i4.buffer.lines.get(r3 + a5 * n2);
              (null == h3 ? void 0 : h3.isWrapped) && s4++;
            }
            return s4;
          }(e3, t3, i3);
          return c2(l2, h2(o2(e3, t3), s3));
        }
        function n(e3, t3) {
          let i3 = 0, s3 = t3.buffer.lines.get(e3), r2 = null == s3 ? void 0 : s3.isWrapped;
          for (; r2 && e3 >= 0 && e3 < t3.rows; ) i3++, s3 = t3.buffer.lines.get(--e3), r2 = null == s3 ? void 0 : s3.isWrapped;
          return i3;
        }
        function o2(e3, t3) {
          return e3 > t3 ? "A" : "B";
        }
        function a2(e3, t3, i3, s3, r2, n2) {
          let o3 = e3, a3 = t3, h3 = "";
          for (; o3 !== i3 || a3 !== s3; ) o3 += r2 ? 1 : -1, r2 && o3 > n2.cols - 1 ? (h3 += n2.buffer.translateBufferLineToString(a3, false, e3, o3), o3 = 0, e3 = 0, a3++) : !r2 && o3 < 0 && (h3 += n2.buffer.translateBufferLineToString(a3, false, 0, e3 + 1), o3 = n2.cols - 1, e3 = o3, a3--);
          return h3 + n2.buffer.translateBufferLineToString(a3, false, e3, o3);
        }
        function h2(e3, t3) {
          const i3 = t3 ? "O" : "[";
          return s2.C0.ESC + i3 + e3;
        }
        function c2(e3, t3) {
          e3 = Math.floor(e3);
          let i3 = "";
          for (let s3 = 0; s3 < e3; s3++) i3 += t3;
          return i3;
        }
        t2.moveToCellSequence = function(e3, t3, i3, s3) {
          const o3 = i3.buffer.x, l2 = i3.buffer.y;
          if (!i3.buffer.hasScrollback) return function(e4, t4, i4, s4, o4, l3) {
            return 0 === r(t4, s4, o4, l3).length ? "" : c2(a2(e4, t4, e4, t4 - n(t4, o4), false, o4).length, h2("D", l3));
          }(o3, l2, 0, t3, i3, s3) + r(l2, t3, i3, s3) + function(e4, t4, i4, s4, o4, l3) {
            let d2;
            d2 = r(t4, s4, o4, l3).length > 0 ? s4 - n(s4, o4) : t4;
            const _4 = s4, u = function(e5, t5, i5, s5, o5, a3) {
              let h3;
              return h3 = r(i5, s5, o5, a3).length > 0 ? s5 - n(s5, o5) : t5, e5 < i5 && h3 <= s5 || e5 >= i5 && h3 < s5 ? "C" : "D";
            }(e4, t4, i4, s4, o4, l3);
            return c2(a2(e4, d2, i4, _4, "C" === u, o4).length, h2(u, l3));
          }(o3, l2, e3, t3, i3, s3);
          let d;
          if (l2 === t3) return d = o3 > e3 ? "D" : "C", c2(Math.abs(o3 - e3), h2(d, s3));
          d = l2 > t3 ? "D" : "C";
          const _3 = Math.abs(l2 - t3);
          return c2(function(e4, t4) {
            return t4.cols - e4;
          }(l2 > t3 ? e3 : o3, i3) + (_3 - 1) * i3.cols + 1 + ((l2 > t3 ? o3 : e3) - 1), h2(d, s3));
        };
      }, 1296: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DomRenderer = void 0;
        const n = i2(3787), o2 = i2(2550), a2 = i2(2223), h2 = i2(6171), c2 = i2(4725), l2 = i2(8055), d = i2(8460), _3 = i2(844), u = i2(2585), f = "xterm-dom-renderer-owner-", v2 = "xterm-rows", p = "xterm-fg-", g2 = "xterm-bg-", m2 = "xterm-focus", S = "xterm-selection";
        let C = 1, b = t2.DomRenderer = class extends _3.Disposable {
          constructor(e3, t3, i3, s3, r2, a3, c3, l3, u2, p2) {
            super(), this._element = e3, this._screenElement = t3, this._viewportElement = i3, this._linkifier2 = s3, this._charSizeService = a3, this._optionsService = c3, this._bufferService = l3, this._coreBrowserService = u2, this._themeService = p2, this._terminalClass = C++, this._rowElements = [], this.onRequestRedraw = this.register(new d.EventEmitter()).event, this._rowContainer = document.createElement("div"), this._rowContainer.classList.add(v2), this._rowContainer.style.lineHeight = "normal", this._rowContainer.setAttribute("aria-hidden", "true"), this._refreshRowElements(this._bufferService.cols, this._bufferService.rows), this._selectionContainer = document.createElement("div"), this._selectionContainer.classList.add(S), this._selectionContainer.setAttribute("aria-hidden", "true"), this.dimensions = (0, h2.createRenderDimensions)(), this._updateDimensions(), this.register(this._optionsService.onOptionChange(() => this._handleOptionsChanged())), this.register(this._themeService.onChangeColors((e4) => this._injectCss(e4))), this._injectCss(this._themeService.colors), this._rowFactory = r2.createInstance(n.DomRendererRowFactory, document), this._element.classList.add(f + this._terminalClass), this._screenElement.appendChild(this._rowContainer), this._screenElement.appendChild(this._selectionContainer), this.register(this._linkifier2.onShowLinkUnderline((e4) => this._handleLinkHover(e4))), this.register(this._linkifier2.onHideLinkUnderline((e4) => this._handleLinkLeave(e4))), this.register((0, _3.toDisposable)(() => {
              this._element.classList.remove(f + this._terminalClass), this._rowContainer.remove(), this._selectionContainer.remove(), this._widthCache.dispose(), this._themeStyleElement.remove(), this._dimensionsStyleElement.remove();
            })), this._widthCache = new o2.WidthCache(document), this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold), this._setDefaultSpacing();
          }
          _updateDimensions() {
            const e3 = this._coreBrowserService.dpr;
            this.dimensions.device.char.width = this._charSizeService.width * e3, this.dimensions.device.char.height = Math.ceil(this._charSizeService.height * e3), this.dimensions.device.cell.width = this.dimensions.device.char.width + Math.round(this._optionsService.rawOptions.letterSpacing), this.dimensions.device.cell.height = Math.floor(this.dimensions.device.char.height * this._optionsService.rawOptions.lineHeight), this.dimensions.device.char.left = 0, this.dimensions.device.char.top = 0, this.dimensions.device.canvas.width = this.dimensions.device.cell.width * this._bufferService.cols, this.dimensions.device.canvas.height = this.dimensions.device.cell.height * this._bufferService.rows, this.dimensions.css.canvas.width = Math.round(this.dimensions.device.canvas.width / e3), this.dimensions.css.canvas.height = Math.round(this.dimensions.device.canvas.height / e3), this.dimensions.css.cell.width = this.dimensions.css.canvas.width / this._bufferService.cols, this.dimensions.css.cell.height = this.dimensions.css.canvas.height / this._bufferService.rows;
            for (const e4 of this._rowElements) e4.style.width = `${this.dimensions.css.canvas.width}px`, e4.style.height = `${this.dimensions.css.cell.height}px`, e4.style.lineHeight = `${this.dimensions.css.cell.height}px`, e4.style.overflow = "hidden";
            this._dimensionsStyleElement || (this._dimensionsStyleElement = document.createElement("style"), this._screenElement.appendChild(this._dimensionsStyleElement));
            const t3 = `${this._terminalSelector} .${v2} span { display: inline-block; height: 100%; vertical-align: top;}`;
            this._dimensionsStyleElement.textContent = t3, this._selectionContainer.style.height = this._viewportElement.style.height, this._screenElement.style.width = `${this.dimensions.css.canvas.width}px`, this._screenElement.style.height = `${this.dimensions.css.canvas.height}px`;
          }
          _injectCss(e3) {
            this._themeStyleElement || (this._themeStyleElement = document.createElement("style"), this._screenElement.appendChild(this._themeStyleElement));
            let t3 = `${this._terminalSelector} .${v2} { color: ${e3.foreground.css}; font-family: ${this._optionsService.rawOptions.fontFamily}; font-size: ${this._optionsService.rawOptions.fontSize}px; font-kerning: none; white-space: pre}`;
            t3 += `${this._terminalSelector} .${v2} .xterm-dim { color: ${l2.color.multiplyOpacity(e3.foreground, 0.5).css};}`, t3 += `${this._terminalSelector} span:not(.xterm-bold) { font-weight: ${this._optionsService.rawOptions.fontWeight};}${this._terminalSelector} span.xterm-bold { font-weight: ${this._optionsService.rawOptions.fontWeightBold};}${this._terminalSelector} span.xterm-italic { font-style: italic;}`, t3 += "@keyframes blink_box_shadow_" + this._terminalClass + " { 50% {  border-bottom-style: hidden; }}", t3 += "@keyframes blink_block_" + this._terminalClass + ` { 0% {  background-color: ${e3.cursor.css};  color: ${e3.cursorAccent.css}; } 50% {  background-color: inherit;  color: ${e3.cursor.css}; }}`, t3 += `${this._terminalSelector} .${v2}.${m2} .xterm-cursor.xterm-cursor-blink:not(.xterm-cursor-block) { animation: blink_box_shadow_` + this._terminalClass + ` 1s step-end infinite;}${this._terminalSelector} .${v2}.${m2} .xterm-cursor.xterm-cursor-blink.xterm-cursor-block { animation: blink_block_` + this._terminalClass + ` 1s step-end infinite;}${this._terminalSelector} .${v2} .xterm-cursor.xterm-cursor-block { background-color: ${e3.cursor.css}; color: ${e3.cursorAccent.css};}${this._terminalSelector} .${v2} .xterm-cursor.xterm-cursor-outline { outline: 1px solid ${e3.cursor.css}; outline-offset: -1px;}${this._terminalSelector} .${v2} .xterm-cursor.xterm-cursor-bar { box-shadow: ${this._optionsService.rawOptions.cursorWidth}px 0 0 ${e3.cursor.css} inset;}${this._terminalSelector} .${v2} .xterm-cursor.xterm-cursor-underline { border-bottom: 1px ${e3.cursor.css}; border-bottom-style: solid; height: calc(100% - 1px);}`, t3 += `${this._terminalSelector} .${S} { position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none;}${this._terminalSelector}.focus .${S} div { position: absolute; background-color: ${e3.selectionBackgroundOpaque.css};}${this._terminalSelector} .${S} div { position: absolute; background-color: ${e3.selectionInactiveBackgroundOpaque.css};}`;
            for (const [i3, s3] of e3.ansi.entries()) t3 += `${this._terminalSelector} .${p}${i3} { color: ${s3.css}; }${this._terminalSelector} .${p}${i3}.xterm-dim { color: ${l2.color.multiplyOpacity(s3, 0.5).css}; }${this._terminalSelector} .${g2}${i3} { background-color: ${s3.css}; }`;
            t3 += `${this._terminalSelector} .${p}${a2.INVERTED_DEFAULT_COLOR} { color: ${l2.color.opaque(e3.background).css}; }${this._terminalSelector} .${p}${a2.INVERTED_DEFAULT_COLOR}.xterm-dim { color: ${l2.color.multiplyOpacity(l2.color.opaque(e3.background), 0.5).css}; }${this._terminalSelector} .${g2}${a2.INVERTED_DEFAULT_COLOR} { background-color: ${e3.foreground.css}; }`, this._themeStyleElement.textContent = t3;
          }
          _setDefaultSpacing() {
            const e3 = this.dimensions.css.cell.width - this._widthCache.get("W", false, false);
            this._rowContainer.style.letterSpacing = `${e3}px`, this._rowFactory.defaultSpacing = e3;
          }
          handleDevicePixelRatioChange() {
            this._updateDimensions(), this._widthCache.clear(), this._setDefaultSpacing();
          }
          _refreshRowElements(e3, t3) {
            for (let e4 = this._rowElements.length; e4 <= t3; e4++) {
              const e5 = document.createElement("div");
              this._rowContainer.appendChild(e5), this._rowElements.push(e5);
            }
            for (; this._rowElements.length > t3; ) this._rowContainer.removeChild(this._rowElements.pop());
          }
          handleResize(e3, t3) {
            this._refreshRowElements(e3, t3), this._updateDimensions();
          }
          handleCharSizeChanged() {
            this._updateDimensions(), this._widthCache.clear(), this._setDefaultSpacing();
          }
          handleBlur() {
            this._rowContainer.classList.remove(m2);
          }
          handleFocus() {
            this._rowContainer.classList.add(m2), this.renderRows(this._bufferService.buffer.y, this._bufferService.buffer.y);
          }
          handleSelectionChanged(e3, t3, i3) {
            if (this._selectionContainer.replaceChildren(), this._rowFactory.handleSelectionChanged(e3, t3, i3), this.renderRows(0, this._bufferService.rows - 1), !e3 || !t3) return;
            const s3 = e3[1] - this._bufferService.buffer.ydisp, r2 = t3[1] - this._bufferService.buffer.ydisp, n2 = Math.max(s3, 0), o3 = Math.min(r2, this._bufferService.rows - 1);
            if (n2 >= this._bufferService.rows || o3 < 0) return;
            const a3 = document.createDocumentFragment();
            if (i3) {
              const i4 = e3[0] > t3[0];
              a3.appendChild(this._createSelectionElement(n2, i4 ? t3[0] : e3[0], i4 ? e3[0] : t3[0], o3 - n2 + 1));
            } else {
              const i4 = s3 === n2 ? e3[0] : 0, h3 = n2 === r2 ? t3[0] : this._bufferService.cols;
              a3.appendChild(this._createSelectionElement(n2, i4, h3));
              const c3 = o3 - n2 - 1;
              if (a3.appendChild(this._createSelectionElement(n2 + 1, 0, this._bufferService.cols, c3)), n2 !== o3) {
                const e4 = r2 === o3 ? t3[0] : this._bufferService.cols;
                a3.appendChild(this._createSelectionElement(o3, 0, e4));
              }
            }
            this._selectionContainer.appendChild(a3);
          }
          _createSelectionElement(e3, t3, i3, s3 = 1) {
            const r2 = document.createElement("div");
            return r2.style.height = s3 * this.dimensions.css.cell.height + "px", r2.style.top = e3 * this.dimensions.css.cell.height + "px", r2.style.left = t3 * this.dimensions.css.cell.width + "px", r2.style.width = this.dimensions.css.cell.width * (i3 - t3) + "px", r2;
          }
          handleCursorMove() {
          }
          _handleOptionsChanged() {
            this._updateDimensions(), this._injectCss(this._themeService.colors), this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold), this._setDefaultSpacing();
          }
          clear() {
            for (const e3 of this._rowElements) e3.replaceChildren();
          }
          renderRows(e3, t3) {
            const i3 = this._bufferService.buffer, s3 = i3.ybase + i3.y, r2 = Math.min(i3.x, this._bufferService.cols - 1), n2 = this._optionsService.rawOptions.cursorBlink, o3 = this._optionsService.rawOptions.cursorStyle, a3 = this._optionsService.rawOptions.cursorInactiveStyle;
            for (let h3 = e3; h3 <= t3; h3++) {
              const e4 = h3 + i3.ydisp, t4 = this._rowElements[h3], c3 = i3.lines.get(e4);
              if (!t4 || !c3) break;
              t4.replaceChildren(...this._rowFactory.createRow(c3, e4, e4 === s3, o3, a3, r2, n2, this.dimensions.css.cell.width, this._widthCache, -1, -1));
            }
          }
          get _terminalSelector() {
            return `.${f}${this._terminalClass}`;
          }
          _handleLinkHover(e3) {
            this._setCellUnderline(e3.x1, e3.x2, e3.y1, e3.y2, e3.cols, true);
          }
          _handleLinkLeave(e3) {
            this._setCellUnderline(e3.x1, e3.x2, e3.y1, e3.y2, e3.cols, false);
          }
          _setCellUnderline(e3, t3, i3, s3, r2, n2) {
            i3 < 0 && (e3 = 0), s3 < 0 && (t3 = 0);
            const o3 = this._bufferService.rows - 1;
            i3 = Math.max(Math.min(i3, o3), 0), s3 = Math.max(Math.min(s3, o3), 0), r2 = Math.min(r2, this._bufferService.cols);
            const a3 = this._bufferService.buffer, h3 = a3.ybase + a3.y, c3 = Math.min(a3.x, r2 - 1), l3 = this._optionsService.rawOptions.cursorBlink, d2 = this._optionsService.rawOptions.cursorStyle, _4 = this._optionsService.rawOptions.cursorInactiveStyle;
            for (let o4 = i3; o4 <= s3; ++o4) {
              const u2 = o4 + a3.ydisp, f2 = this._rowElements[o4], v3 = a3.lines.get(u2);
              if (!f2 || !v3) break;
              f2.replaceChildren(...this._rowFactory.createRow(v3, u2, u2 === h3, d2, _4, c3, l3, this.dimensions.css.cell.width, this._widthCache, n2 ? o4 === i3 ? e3 : 0 : -1, n2 ? (o4 === s3 ? t3 : r2) - 1 : -1));
            }
          }
        };
        t2.DomRenderer = b = s2([r(4, u.IInstantiationService), r(5, c2.ICharSizeService), r(6, u.IOptionsService), r(7, u.IBufferService), r(8, c2.ICoreBrowserService), r(9, c2.IThemeService)], b);
      }, 3787: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DomRendererRowFactory = void 0;
        const n = i2(2223), o2 = i2(643), a2 = i2(511), h2 = i2(2585), c2 = i2(8055), l2 = i2(4725), d = i2(4269), _3 = i2(6171), u = i2(3734);
        let f = t2.DomRendererRowFactory = class {
          constructor(e3, t3, i3, s3, r2, n2, o3) {
            this._document = e3, this._characterJoinerService = t3, this._optionsService = i3, this._coreBrowserService = s3, this._coreService = r2, this._decorationService = n2, this._themeService = o3, this._workCell = new a2.CellData(), this._columnSelectMode = false, this.defaultSpacing = 0;
          }
          handleSelectionChanged(e3, t3, i3) {
            this._selectionStart = e3, this._selectionEnd = t3, this._columnSelectMode = i3;
          }
          createRow(e3, t3, i3, s3, r2, a3, h3, l3, _4, f2, p) {
            const g2 = [], m2 = this._characterJoinerService.getJoinedCharacters(t3), S = this._themeService.colors;
            let C, b = e3.getNoBgTrimmedLength();
            i3 && b < a3 + 1 && (b = a3 + 1);
            let y3 = 0, w2 = "", E = 0, k2 = 0, L2 = 0, D = false, R = 0, x3 = false, A = 0;
            const B = [], T = -1 !== f2 && -1 !== p;
            for (let M = 0; M < b; M++) {
              e3.loadCell(M, this._workCell);
              let b2 = this._workCell.getWidth();
              if (0 === b2) continue;
              let O = false, P = M, I = this._workCell;
              if (m2.length > 0 && M === m2[0][0]) {
                O = true;
                const t4 = m2.shift();
                I = new d.JoinedCellData(this._workCell, e3.translateToString(true, t4[0], t4[1]), t4[1] - t4[0]), P = t4[1] - 1, b2 = I.getWidth();
              }
              const H = this._isCellInSelection(M, t3), F = i3 && M === a3, W = T && M >= f2 && M <= p;
              let U = false;
              this._decorationService.forEachDecorationAtCell(M, t3, void 0, (e4) => {
                U = true;
              });
              let N = I.getChars() || o2.WHITESPACE_CELL_CHAR;
              if (" " === N && (I.isUnderline() || I.isOverline()) && (N = "\xA0"), A = b2 * l3 - _4.get(N, I.isBold(), I.isItalic()), C) {
                if (y3 && (H && x3 || !H && !x3 && I.bg === E) && (H && x3 && S.selectionForeground || I.fg === k2) && I.extended.ext === L2 && W === D && A === R && !F && !O && !U) {
                  w2 += N, y3++;
                  continue;
                }
                y3 && (C.textContent = w2), C = this._document.createElement("span"), y3 = 0, w2 = "";
              } else C = this._document.createElement("span");
              if (E = I.bg, k2 = I.fg, L2 = I.extended.ext, D = W, R = A, x3 = H, O && a3 >= M && a3 <= P && (a3 = M), !this._coreService.isCursorHidden && F) {
                if (B.push("xterm-cursor"), this._coreBrowserService.isFocused) h3 && B.push("xterm-cursor-blink"), B.push("bar" === s3 ? "xterm-cursor-bar" : "underline" === s3 ? "xterm-cursor-underline" : "xterm-cursor-block");
                else if (r2) switch (r2) {
                  case "outline":
                    B.push("xterm-cursor-outline");
                    break;
                  case "block":
                    B.push("xterm-cursor-block");
                    break;
                  case "bar":
                    B.push("xterm-cursor-bar");
                    break;
                  case "underline":
                    B.push("xterm-cursor-underline");
                }
              }
              if (I.isBold() && B.push("xterm-bold"), I.isItalic() && B.push("xterm-italic"), I.isDim() && B.push("xterm-dim"), w2 = I.isInvisible() ? o2.WHITESPACE_CELL_CHAR : I.getChars() || o2.WHITESPACE_CELL_CHAR, I.isUnderline() && (B.push(`xterm-underline-${I.extended.underlineStyle}`), " " === w2 && (w2 = "\xA0"), !I.isUnderlineColorDefault())) if (I.isUnderlineColorRGB()) C.style.textDecorationColor = `rgb(${u.AttributeData.toColorRGB(I.getUnderlineColor()).join(",")})`;
              else {
                let e4 = I.getUnderlineColor();
                this._optionsService.rawOptions.drawBoldTextInBrightColors && I.isBold() && e4 < 8 && (e4 += 8), C.style.textDecorationColor = S.ansi[e4].css;
              }
              I.isOverline() && (B.push("xterm-overline"), " " === w2 && (w2 = "\xA0")), I.isStrikethrough() && B.push("xterm-strikethrough"), W && (C.style.textDecoration = "underline");
              let $ = I.getFgColor(), j = I.getFgColorMode(), z = I.getBgColor(), K = I.getBgColorMode();
              const q = !!I.isInverse();
              if (q) {
                const e4 = $;
                $ = z, z = e4;
                const t4 = j;
                j = K, K = t4;
              }
              let V, G, X2, J = false;
              switch (this._decorationService.forEachDecorationAtCell(M, t3, void 0, (e4) => {
                "top" !== e4.options.layer && J || (e4.backgroundColorRGB && (K = 50331648, z = e4.backgroundColorRGB.rgba >> 8 & 16777215, V = e4.backgroundColorRGB), e4.foregroundColorRGB && (j = 50331648, $ = e4.foregroundColorRGB.rgba >> 8 & 16777215, G = e4.foregroundColorRGB), J = "top" === e4.options.layer);
              }), !J && H && (V = this._coreBrowserService.isFocused ? S.selectionBackgroundOpaque : S.selectionInactiveBackgroundOpaque, z = V.rgba >> 8 & 16777215, K = 50331648, J = true, S.selectionForeground && (j = 50331648, $ = S.selectionForeground.rgba >> 8 & 16777215, G = S.selectionForeground)), J && B.push("xterm-decoration-top"), K) {
                case 16777216:
                case 33554432:
                  X2 = S.ansi[z], B.push(`xterm-bg-${z}`);
                  break;
                case 50331648:
                  X2 = c2.rgba.toColor(z >> 16, z >> 8 & 255, 255 & z), this._addStyle(C, `background-color:#${v2((z >>> 0).toString(16), "0", 6)}`);
                  break;
                default:
                  q ? (X2 = S.foreground, B.push(`xterm-bg-${n.INVERTED_DEFAULT_COLOR}`)) : X2 = S.background;
              }
              switch (V || I.isDim() && (V = c2.color.multiplyOpacity(X2, 0.5)), j) {
                case 16777216:
                case 33554432:
                  I.isBold() && $ < 8 && this._optionsService.rawOptions.drawBoldTextInBrightColors && ($ += 8), this._applyMinimumContrast(C, X2, S.ansi[$], I, V, void 0) || B.push(`xterm-fg-${$}`);
                  break;
                case 50331648:
                  const e4 = c2.rgba.toColor($ >> 16 & 255, $ >> 8 & 255, 255 & $);
                  this._applyMinimumContrast(C, X2, e4, I, V, G) || this._addStyle(C, `color:#${v2($.toString(16), "0", 6)}`);
                  break;
                default:
                  this._applyMinimumContrast(C, X2, S.foreground, I, V, void 0) || q && B.push(`xterm-fg-${n.INVERTED_DEFAULT_COLOR}`);
              }
              B.length && (C.className = B.join(" "), B.length = 0), F || O || U ? C.textContent = w2 : y3++, A !== this.defaultSpacing && (C.style.letterSpacing = `${A}px`), g2.push(C), M = P;
            }
            return C && y3 && (C.textContent = w2), g2;
          }
          _applyMinimumContrast(e3, t3, i3, s3, r2, n2) {
            if (1 === this._optionsService.rawOptions.minimumContrastRatio || (0, _3.excludeFromContrastRatioDemands)(s3.getCode())) return false;
            const o3 = this._getContrastCache(s3);
            let a3;
            if (r2 || n2 || (a3 = o3.getColor(t3.rgba, i3.rgba)), void 0 === a3) {
              const e4 = this._optionsService.rawOptions.minimumContrastRatio / (s3.isDim() ? 2 : 1);
              a3 = c2.color.ensureContrastRatio(r2 || t3, n2 || i3, e4), o3.setColor((r2 || t3).rgba, (n2 || i3).rgba, null != a3 ? a3 : null);
            }
            return !!a3 && (this._addStyle(e3, `color:${a3.css}`), true);
          }
          _getContrastCache(e3) {
            return e3.isDim() ? this._themeService.colors.halfContrastCache : this._themeService.colors.contrastCache;
          }
          _addStyle(e3, t3) {
            e3.setAttribute("style", `${e3.getAttribute("style") || ""}${t3};`);
          }
          _isCellInSelection(e3, t3) {
            const i3 = this._selectionStart, s3 = this._selectionEnd;
            return !(!i3 || !s3) && (this._columnSelectMode ? i3[0] <= s3[0] ? e3 >= i3[0] && t3 >= i3[1] && e3 < s3[0] && t3 <= s3[1] : e3 < i3[0] && t3 >= i3[1] && e3 >= s3[0] && t3 <= s3[1] : t3 > i3[1] && t3 < s3[1] || i3[1] === s3[1] && t3 === i3[1] && e3 >= i3[0] && e3 < s3[0] || i3[1] < s3[1] && t3 === s3[1] && e3 < s3[0] || i3[1] < s3[1] && t3 === i3[1] && e3 >= i3[0]);
          }
        };
        function v2(e3, t3, i3) {
          for (; e3.length < i3; ) e3 = t3 + e3;
          return e3;
        }
        t2.DomRendererRowFactory = f = s2([r(1, l2.ICharacterJoinerService), r(2, h2.IOptionsService), r(3, l2.ICoreBrowserService), r(4, h2.ICoreService), r(5, h2.IDecorationService), r(6, l2.IThemeService)], f);
      }, 2550: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.WidthCache = void 0, t2.WidthCache = class {
          constructor(e3) {
            this._flat = new Float32Array(256), this._font = "", this._fontSize = 0, this._weight = "normal", this._weightBold = "bold", this._measureElements = [], this._container = e3.createElement("div"), this._container.style.position = "absolute", this._container.style.top = "-50000px", this._container.style.width = "50000px", this._container.style.whiteSpace = "pre", this._container.style.fontKerning = "none";
            const t3 = e3.createElement("span"), i2 = e3.createElement("span");
            i2.style.fontWeight = "bold";
            const s2 = e3.createElement("span");
            s2.style.fontStyle = "italic";
            const r = e3.createElement("span");
            r.style.fontWeight = "bold", r.style.fontStyle = "italic", this._measureElements = [t3, i2, s2, r], this._container.appendChild(t3), this._container.appendChild(i2), this._container.appendChild(s2), this._container.appendChild(r), e3.body.appendChild(this._container), this.clear();
          }
          dispose() {
            this._container.remove(), this._measureElements.length = 0, this._holey = void 0;
          }
          clear() {
            this._flat.fill(-9999), this._holey = /* @__PURE__ */ new Map();
          }
          setFont(e3, t3, i2, s2) {
            e3 === this._font && t3 === this._fontSize && i2 === this._weight && s2 === this._weightBold || (this._font = e3, this._fontSize = t3, this._weight = i2, this._weightBold = s2, this._container.style.fontFamily = this._font, this._container.style.fontSize = `${this._fontSize}px`, this._measureElements[0].style.fontWeight = `${i2}`, this._measureElements[1].style.fontWeight = `${s2}`, this._measureElements[2].style.fontWeight = `${i2}`, this._measureElements[3].style.fontWeight = `${s2}`, this.clear());
          }
          get(e3, t3, i2) {
            let s2 = 0;
            if (!t3 && !i2 && 1 === e3.length && (s2 = e3.charCodeAt(0)) < 256) return -9999 !== this._flat[s2] ? this._flat[s2] : this._flat[s2] = this._measure(e3, 0);
            let r = e3;
            t3 && (r += "B"), i2 && (r += "I");
            let n = this._holey.get(r);
            if (void 0 === n) {
              let s3 = 0;
              t3 && (s3 |= 1), i2 && (s3 |= 2), n = this._measure(e3, s3), this._holey.set(r, n);
            }
            return n;
          }
          _measure(e3, t3) {
            const i2 = this._measureElements[t3];
            return i2.textContent = e3.repeat(32), i2.offsetWidth / 32;
          }
        };
      }, 2223: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.TEXT_BASELINE = t2.DIM_OPACITY = t2.INVERTED_DEFAULT_COLOR = void 0;
        const s2 = i2(6114);
        t2.INVERTED_DEFAULT_COLOR = 257, t2.DIM_OPACITY = 0.5, t2.TEXT_BASELINE = s2.isFirefox || s2.isLegacyEdge ? "bottom" : "ideographic";
      }, 6171: (e2, t2) => {
        function i2(e3) {
          return 57508 <= e3 && e3 <= 57558;
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.createRenderDimensions = t2.excludeFromContrastRatioDemands = t2.isRestrictedPowerlineGlyph = t2.isPowerlineGlyph = t2.throwIfFalsy = void 0, t2.throwIfFalsy = function(e3) {
          if (!e3) throw new Error("value must not be falsy");
          return e3;
        }, t2.isPowerlineGlyph = i2, t2.isRestrictedPowerlineGlyph = function(e3) {
          return 57520 <= e3 && e3 <= 57527;
        }, t2.excludeFromContrastRatioDemands = function(e3) {
          return i2(e3) || function(e4) {
            return 9472 <= e4 && e4 <= 9631;
          }(e3);
        }, t2.createRenderDimensions = function() {
          return { css: { canvas: { width: 0, height: 0 }, cell: { width: 0, height: 0 } }, device: { canvas: { width: 0, height: 0 }, cell: { width: 0, height: 0 }, char: { width: 0, height: 0, left: 0, top: 0 } } };
        };
      }, 456: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.SelectionModel = void 0, t2.SelectionModel = class {
          constructor(e3) {
            this._bufferService = e3, this.isSelectAllActive = false, this.selectionStartLength = 0;
          }
          clearSelection() {
            this.selectionStart = void 0, this.selectionEnd = void 0, this.isSelectAllActive = false, this.selectionStartLength = 0;
          }
          get finalSelectionStart() {
            return this.isSelectAllActive ? [0, 0] : this.selectionEnd && this.selectionStart && this.areSelectionValuesReversed() ? this.selectionEnd : this.selectionStart;
          }
          get finalSelectionEnd() {
            if (this.isSelectAllActive) return [this._bufferService.cols, this._bufferService.buffer.ybase + this._bufferService.rows - 1];
            if (this.selectionStart) {
              if (!this.selectionEnd || this.areSelectionValuesReversed()) {
                const e3 = this.selectionStart[0] + this.selectionStartLength;
                return e3 > this._bufferService.cols ? e3 % this._bufferService.cols == 0 ? [this._bufferService.cols, this.selectionStart[1] + Math.floor(e3 / this._bufferService.cols) - 1] : [e3 % this._bufferService.cols, this.selectionStart[1] + Math.floor(e3 / this._bufferService.cols)] : [e3, this.selectionStart[1]];
              }
              if (this.selectionStartLength && this.selectionEnd[1] === this.selectionStart[1]) {
                const e3 = this.selectionStart[0] + this.selectionStartLength;
                return e3 > this._bufferService.cols ? [e3 % this._bufferService.cols, this.selectionStart[1] + Math.floor(e3 / this._bufferService.cols)] : [Math.max(e3, this.selectionEnd[0]), this.selectionEnd[1]];
              }
              return this.selectionEnd;
            }
          }
          areSelectionValuesReversed() {
            const e3 = this.selectionStart, t3 = this.selectionEnd;
            return !(!e3 || !t3) && (e3[1] > t3[1] || e3[1] === t3[1] && e3[0] > t3[0]);
          }
          handleTrim(e3) {
            return this.selectionStart && (this.selectionStart[1] -= e3), this.selectionEnd && (this.selectionEnd[1] -= e3), this.selectionEnd && this.selectionEnd[1] < 0 ? (this.clearSelection(), true) : (this.selectionStart && this.selectionStart[1] < 0 && (this.selectionStart[1] = 0), false);
          }
        };
      }, 428: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CharSizeService = void 0;
        const n = i2(2585), o2 = i2(8460), a2 = i2(844);
        let h2 = t2.CharSizeService = class extends a2.Disposable {
          get hasValidSize() {
            return this.width > 0 && this.height > 0;
          }
          constructor(e3, t3, i3) {
            super(), this._optionsService = i3, this.width = 0, this.height = 0, this._onCharSizeChange = this.register(new o2.EventEmitter()), this.onCharSizeChange = this._onCharSizeChange.event, this._measureStrategy = new c2(e3, t3, this._optionsService), this.register(this._optionsService.onMultipleOptionChange(["fontFamily", "fontSize"], () => this.measure()));
          }
          measure() {
            const e3 = this._measureStrategy.measure();
            e3.width === this.width && e3.height === this.height || (this.width = e3.width, this.height = e3.height, this._onCharSizeChange.fire());
          }
        };
        t2.CharSizeService = h2 = s2([r(2, n.IOptionsService)], h2);
        class c2 {
          constructor(e3, t3, i3) {
            this._document = e3, this._parentElement = t3, this._optionsService = i3, this._result = { width: 0, height: 0 }, this._measureElement = this._document.createElement("span"), this._measureElement.classList.add("xterm-char-measure-element"), this._measureElement.textContent = "W".repeat(32), this._measureElement.setAttribute("aria-hidden", "true"), this._measureElement.style.whiteSpace = "pre", this._measureElement.style.fontKerning = "none", this._parentElement.appendChild(this._measureElement);
          }
          measure() {
            this._measureElement.style.fontFamily = this._optionsService.rawOptions.fontFamily, this._measureElement.style.fontSize = `${this._optionsService.rawOptions.fontSize}px`;
            const e3 = { height: Number(this._measureElement.offsetHeight), width: Number(this._measureElement.offsetWidth) };
            return 0 !== e3.width && 0 !== e3.height && (this._result.width = e3.width / 32, this._result.height = Math.ceil(e3.height)), this._result;
          }
        }
      }, 4269: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CharacterJoinerService = t2.JoinedCellData = void 0;
        const n = i2(3734), o2 = i2(643), a2 = i2(511), h2 = i2(2585);
        class c2 extends n.AttributeData {
          constructor(e3, t3, i3) {
            super(), this.content = 0, this.combinedData = "", this.fg = e3.fg, this.bg = e3.bg, this.combinedData = t3, this._width = i3;
          }
          isCombined() {
            return 2097152;
          }
          getWidth() {
            return this._width;
          }
          getChars() {
            return this.combinedData;
          }
          getCode() {
            return 2097151;
          }
          setFromCharData(e3) {
            throw new Error("not implemented");
          }
          getAsCharData() {
            return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
          }
        }
        t2.JoinedCellData = c2;
        let l2 = t2.CharacterJoinerService = class e3 {
          constructor(e4) {
            this._bufferService = e4, this._characterJoiners = [], this._nextCharacterJoinerId = 0, this._workCell = new a2.CellData();
          }
          register(e4) {
            const t3 = { id: this._nextCharacterJoinerId++, handler: e4 };
            return this._characterJoiners.push(t3), t3.id;
          }
          deregister(e4) {
            for (let t3 = 0; t3 < this._characterJoiners.length; t3++) if (this._characterJoiners[t3].id === e4) return this._characterJoiners.splice(t3, 1), true;
            return false;
          }
          getJoinedCharacters(e4) {
            if (0 === this._characterJoiners.length) return [];
            const t3 = this._bufferService.buffer.lines.get(e4);
            if (!t3 || 0 === t3.length) return [];
            const i3 = [], s3 = t3.translateToString(true);
            let r2 = 0, n2 = 0, a3 = 0, h3 = t3.getFg(0), c3 = t3.getBg(0);
            for (let e5 = 0; e5 < t3.getTrimmedLength(); e5++) if (t3.loadCell(e5, this._workCell), 0 !== this._workCell.getWidth()) {
              if (this._workCell.fg !== h3 || this._workCell.bg !== c3) {
                if (e5 - r2 > 1) {
                  const e6 = this._getJoinedRanges(s3, a3, n2, t3, r2);
                  for (let t4 = 0; t4 < e6.length; t4++) i3.push(e6[t4]);
                }
                r2 = e5, a3 = n2, h3 = this._workCell.fg, c3 = this._workCell.bg;
              }
              n2 += this._workCell.getChars().length || o2.WHITESPACE_CELL_CHAR.length;
            }
            if (this._bufferService.cols - r2 > 1) {
              const e5 = this._getJoinedRanges(s3, a3, n2, t3, r2);
              for (let t4 = 0; t4 < e5.length; t4++) i3.push(e5[t4]);
            }
            return i3;
          }
          _getJoinedRanges(t3, i3, s3, r2, n2) {
            const o3 = t3.substring(i3, s3);
            let a3 = [];
            try {
              a3 = this._characterJoiners[0].handler(o3);
            } catch (e4) {
              console.error(e4);
            }
            for (let t4 = 1; t4 < this._characterJoiners.length; t4++) try {
              const i4 = this._characterJoiners[t4].handler(o3);
              for (let t5 = 0; t5 < i4.length; t5++) e3._mergeRanges(a3, i4[t5]);
            } catch (e4) {
              console.error(e4);
            }
            return this._stringRangesToCellRanges(a3, r2, n2), a3;
          }
          _stringRangesToCellRanges(e4, t3, i3) {
            let s3 = 0, r2 = false, n2 = 0, a3 = e4[s3];
            if (a3) {
              for (let h3 = i3; h3 < this._bufferService.cols; h3++) {
                const i4 = t3.getWidth(h3), c3 = t3.getString(h3).length || o2.WHITESPACE_CELL_CHAR.length;
                if (0 !== i4) {
                  if (!r2 && a3[0] <= n2 && (a3[0] = h3, r2 = true), a3[1] <= n2) {
                    if (a3[1] = h3, a3 = e4[++s3], !a3) break;
                    a3[0] <= n2 ? (a3[0] = h3, r2 = true) : r2 = false;
                  }
                  n2 += c3;
                }
              }
              a3 && (a3[1] = this._bufferService.cols);
            }
          }
          static _mergeRanges(e4, t3) {
            let i3 = false;
            for (let s3 = 0; s3 < e4.length; s3++) {
              const r2 = e4[s3];
              if (i3) {
                if (t3[1] <= r2[0]) return e4[s3 - 1][1] = t3[1], e4;
                if (t3[1] <= r2[1]) return e4[s3 - 1][1] = Math.max(t3[1], r2[1]), e4.splice(s3, 1), e4;
                e4.splice(s3, 1), s3--;
              } else {
                if (t3[1] <= r2[0]) return e4.splice(s3, 0, t3), e4;
                if (t3[1] <= r2[1]) return r2[0] = Math.min(t3[0], r2[0]), e4;
                t3[0] < r2[1] && (r2[0] = Math.min(t3[0], r2[0]), i3 = true);
              }
            }
            return i3 ? e4[e4.length - 1][1] = t3[1] : e4.push(t3), e4;
          }
        };
        t2.CharacterJoinerService = l2 = s2([r(0, h2.IBufferService)], l2);
      }, 5114: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CoreBrowserService = void 0, t2.CoreBrowserService = class {
          constructor(e3, t3) {
            this._textarea = e3, this.window = t3, this._isFocused = false, this._cachedIsFocused = void 0, this._textarea.addEventListener("focus", () => this._isFocused = true), this._textarea.addEventListener("blur", () => this._isFocused = false);
          }
          get dpr() {
            return this.window.devicePixelRatio;
          }
          get isFocused() {
            return void 0 === this._cachedIsFocused && (this._cachedIsFocused = this._isFocused && this._textarea.ownerDocument.hasFocus(), queueMicrotask(() => this._cachedIsFocused = void 0)), this._cachedIsFocused;
          }
        };
      }, 8934: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.MouseService = void 0;
        const n = i2(4725), o2 = i2(9806);
        let a2 = t2.MouseService = class {
          constructor(e3, t3) {
            this._renderService = e3, this._charSizeService = t3;
          }
          getCoords(e3, t3, i3, s3, r2) {
            return (0, o2.getCoords)(window, e3, t3, i3, s3, this._charSizeService.hasValidSize, this._renderService.dimensions.css.cell.width, this._renderService.dimensions.css.cell.height, r2);
          }
          getMouseReportCoords(e3, t3) {
            const i3 = (0, o2.getCoordsRelativeToElement)(window, e3, t3);
            if (this._charSizeService.hasValidSize) return i3[0] = Math.min(Math.max(i3[0], 0), this._renderService.dimensions.css.canvas.width - 1), i3[1] = Math.min(Math.max(i3[1], 0), this._renderService.dimensions.css.canvas.height - 1), { col: Math.floor(i3[0] / this._renderService.dimensions.css.cell.width), row: Math.floor(i3[1] / this._renderService.dimensions.css.cell.height), x: Math.floor(i3[0]), y: Math.floor(i3[1]) };
          }
        };
        t2.MouseService = a2 = s2([r(0, n.IRenderService), r(1, n.ICharSizeService)], a2);
      }, 3230: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.RenderService = void 0;
        const n = i2(3656), o2 = i2(6193), a2 = i2(5596), h2 = i2(4725), c2 = i2(8460), l2 = i2(844), d = i2(7226), _3 = i2(2585);
        let u = t2.RenderService = class extends l2.Disposable {
          get dimensions() {
            return this._renderer.value.dimensions;
          }
          constructor(e3, t3, i3, s3, r2, h3, _4, u2) {
            if (super(), this._rowCount = e3, this._charSizeService = s3, this._renderer = this.register(new l2.MutableDisposable()), this._pausedResizeTask = new d.DebouncedIdleTask(), this._isPaused = false, this._needsFullRefresh = false, this._isNextRenderRedrawOnly = true, this._needsSelectionRefresh = false, this._canvasWidth = 0, this._canvasHeight = 0, this._selectionState = { start: void 0, end: void 0, columnSelectMode: false }, this._onDimensionsChange = this.register(new c2.EventEmitter()), this.onDimensionsChange = this._onDimensionsChange.event, this._onRenderedViewportChange = this.register(new c2.EventEmitter()), this.onRenderedViewportChange = this._onRenderedViewportChange.event, this._onRender = this.register(new c2.EventEmitter()), this.onRender = this._onRender.event, this._onRefreshRequest = this.register(new c2.EventEmitter()), this.onRefreshRequest = this._onRefreshRequest.event, this._renderDebouncer = new o2.RenderDebouncer(_4.window, (e4, t4) => this._renderRows(e4, t4)), this.register(this._renderDebouncer), this._screenDprMonitor = new a2.ScreenDprMonitor(_4.window), this._screenDprMonitor.setListener(() => this.handleDevicePixelRatioChange()), this.register(this._screenDprMonitor), this.register(h3.onResize(() => this._fullRefresh())), this.register(h3.buffers.onBufferActivate(() => {
              var e4;
              return null === (e4 = this._renderer.value) || void 0 === e4 ? void 0 : e4.clear();
            })), this.register(i3.onOptionChange(() => this._handleOptionsChanged())), this.register(this._charSizeService.onCharSizeChange(() => this.handleCharSizeChanged())), this.register(r2.onDecorationRegistered(() => this._fullRefresh())), this.register(r2.onDecorationRemoved(() => this._fullRefresh())), this.register(i3.onMultipleOptionChange(["customGlyphs", "drawBoldTextInBrightColors", "letterSpacing", "lineHeight", "fontFamily", "fontSize", "fontWeight", "fontWeightBold", "minimumContrastRatio"], () => {
              this.clear(), this.handleResize(h3.cols, h3.rows), this._fullRefresh();
            })), this.register(i3.onMultipleOptionChange(["cursorBlink", "cursorStyle"], () => this.refreshRows(h3.buffer.y, h3.buffer.y, true))), this.register((0, n.addDisposableDomListener)(_4.window, "resize", () => this.handleDevicePixelRatioChange())), this.register(u2.onChangeColors(() => this._fullRefresh())), "IntersectionObserver" in _4.window) {
              const e4 = new _4.window.IntersectionObserver((e5) => this._handleIntersectionChange(e5[e5.length - 1]), { threshold: 0 });
              e4.observe(t3), this.register({ dispose: () => e4.disconnect() });
            }
          }
          _handleIntersectionChange(e3) {
            this._isPaused = void 0 === e3.isIntersecting ? 0 === e3.intersectionRatio : !e3.isIntersecting, this._isPaused || this._charSizeService.hasValidSize || this._charSizeService.measure(), !this._isPaused && this._needsFullRefresh && (this._pausedResizeTask.flush(), this.refreshRows(0, this._rowCount - 1), this._needsFullRefresh = false);
          }
          refreshRows(e3, t3, i3 = false) {
            this._isPaused ? this._needsFullRefresh = true : (i3 || (this._isNextRenderRedrawOnly = false), this._renderDebouncer.refresh(e3, t3, this._rowCount));
          }
          _renderRows(e3, t3) {
            this._renderer.value && (e3 = Math.min(e3, this._rowCount - 1), t3 = Math.min(t3, this._rowCount - 1), this._renderer.value.renderRows(e3, t3), this._needsSelectionRefresh && (this._renderer.value.handleSelectionChanged(this._selectionState.start, this._selectionState.end, this._selectionState.columnSelectMode), this._needsSelectionRefresh = false), this._isNextRenderRedrawOnly || this._onRenderedViewportChange.fire({ start: e3, end: t3 }), this._onRender.fire({ start: e3, end: t3 }), this._isNextRenderRedrawOnly = true);
          }
          resize(e3, t3) {
            this._rowCount = t3, this._fireOnCanvasResize();
          }
          _handleOptionsChanged() {
            this._renderer.value && (this.refreshRows(0, this._rowCount - 1), this._fireOnCanvasResize());
          }
          _fireOnCanvasResize() {
            this._renderer.value && (this._renderer.value.dimensions.css.canvas.width === this._canvasWidth && this._renderer.value.dimensions.css.canvas.height === this._canvasHeight || this._onDimensionsChange.fire(this._renderer.value.dimensions));
          }
          hasRenderer() {
            return !!this._renderer.value;
          }
          setRenderer(e3) {
            this._renderer.value = e3, this._renderer.value.onRequestRedraw((e4) => this.refreshRows(e4.start, e4.end, true)), this._needsSelectionRefresh = true, this._fullRefresh();
          }
          addRefreshCallback(e3) {
            return this._renderDebouncer.addRefreshCallback(e3);
          }
          _fullRefresh() {
            this._isPaused ? this._needsFullRefresh = true : this.refreshRows(0, this._rowCount - 1);
          }
          clearTextureAtlas() {
            var e3, t3;
            this._renderer.value && (null === (t3 = (e3 = this._renderer.value).clearTextureAtlas) || void 0 === t3 || t3.call(e3), this._fullRefresh());
          }
          handleDevicePixelRatioChange() {
            this._charSizeService.measure(), this._renderer.value && (this._renderer.value.handleDevicePixelRatioChange(), this.refreshRows(0, this._rowCount - 1));
          }
          handleResize(e3, t3) {
            this._renderer.value && (this._isPaused ? this._pausedResizeTask.set(() => this._renderer.value.handleResize(e3, t3)) : this._renderer.value.handleResize(e3, t3), this._fullRefresh());
          }
          handleCharSizeChanged() {
            var e3;
            null === (e3 = this._renderer.value) || void 0 === e3 || e3.handleCharSizeChanged();
          }
          handleBlur() {
            var e3;
            null === (e3 = this._renderer.value) || void 0 === e3 || e3.handleBlur();
          }
          handleFocus() {
            var e3;
            null === (e3 = this._renderer.value) || void 0 === e3 || e3.handleFocus();
          }
          handleSelectionChanged(e3, t3, i3) {
            var s3;
            this._selectionState.start = e3, this._selectionState.end = t3, this._selectionState.columnSelectMode = i3, null === (s3 = this._renderer.value) || void 0 === s3 || s3.handleSelectionChanged(e3, t3, i3);
          }
          handleCursorMove() {
            var e3;
            null === (e3 = this._renderer.value) || void 0 === e3 || e3.handleCursorMove();
          }
          clear() {
            var e3;
            null === (e3 = this._renderer.value) || void 0 === e3 || e3.clear();
          }
        };
        t2.RenderService = u = s2([r(2, _3.IOptionsService), r(3, h2.ICharSizeService), r(4, _3.IDecorationService), r(5, _3.IBufferService), r(6, h2.ICoreBrowserService), r(7, h2.IThemeService)], u);
      }, 9312: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.SelectionService = void 0;
        const n = i2(9806), o2 = i2(9504), a2 = i2(456), h2 = i2(4725), c2 = i2(8460), l2 = i2(844), d = i2(6114), _3 = i2(4841), u = i2(511), f = i2(2585), v2 = String.fromCharCode(160), p = new RegExp(v2, "g");
        let g2 = t2.SelectionService = class extends l2.Disposable {
          constructor(e3, t3, i3, s3, r2, n2, o3, h3, d2) {
            super(), this._element = e3, this._screenElement = t3, this._linkifier = i3, this._bufferService = s3, this._coreService = r2, this._mouseService = n2, this._optionsService = o3, this._renderService = h3, this._coreBrowserService = d2, this._dragScrollAmount = 0, this._enabled = true, this._workCell = new u.CellData(), this._mouseDownTimeStamp = 0, this._oldHasSelection = false, this._oldSelectionStart = void 0, this._oldSelectionEnd = void 0, this._onLinuxMouseSelection = this.register(new c2.EventEmitter()), this.onLinuxMouseSelection = this._onLinuxMouseSelection.event, this._onRedrawRequest = this.register(new c2.EventEmitter()), this.onRequestRedraw = this._onRedrawRequest.event, this._onSelectionChange = this.register(new c2.EventEmitter()), this.onSelectionChange = this._onSelectionChange.event, this._onRequestScrollLines = this.register(new c2.EventEmitter()), this.onRequestScrollLines = this._onRequestScrollLines.event, this._mouseMoveListener = (e4) => this._handleMouseMove(e4), this._mouseUpListener = (e4) => this._handleMouseUp(e4), this._coreService.onUserInput(() => {
              this.hasSelection && this.clearSelection();
            }), this._trimListener = this._bufferService.buffer.lines.onTrim((e4) => this._handleTrim(e4)), this.register(this._bufferService.buffers.onBufferActivate((e4) => this._handleBufferActivate(e4))), this.enable(), this._model = new a2.SelectionModel(this._bufferService), this._activeSelectionMode = 0, this.register((0, l2.toDisposable)(() => {
              this._removeMouseDownListeners();
            }));
          }
          reset() {
            this.clearSelection();
          }
          disable() {
            this.clearSelection(), this._enabled = false;
          }
          enable() {
            this._enabled = true;
          }
          get selectionStart() {
            return this._model.finalSelectionStart;
          }
          get selectionEnd() {
            return this._model.finalSelectionEnd;
          }
          get hasSelection() {
            const e3 = this._model.finalSelectionStart, t3 = this._model.finalSelectionEnd;
            return !(!e3 || !t3 || e3[0] === t3[0] && e3[1] === t3[1]);
          }
          get selectionText() {
            const e3 = this._model.finalSelectionStart, t3 = this._model.finalSelectionEnd;
            if (!e3 || !t3) return "";
            const i3 = this._bufferService.buffer, s3 = [];
            if (3 === this._activeSelectionMode) {
              if (e3[0] === t3[0]) return "";
              const r2 = e3[0] < t3[0] ? e3[0] : t3[0], n2 = e3[0] < t3[0] ? t3[0] : e3[0];
              for (let o3 = e3[1]; o3 <= t3[1]; o3++) {
                const e4 = i3.translateBufferLineToString(o3, true, r2, n2);
                s3.push(e4);
              }
            } else {
              const r2 = e3[1] === t3[1] ? t3[0] : void 0;
              s3.push(i3.translateBufferLineToString(e3[1], true, e3[0], r2));
              for (let r3 = e3[1] + 1; r3 <= t3[1] - 1; r3++) {
                const e4 = i3.lines.get(r3), t4 = i3.translateBufferLineToString(r3, true);
                (null == e4 ? void 0 : e4.isWrapped) ? s3[s3.length - 1] += t4 : s3.push(t4);
              }
              if (e3[1] !== t3[1]) {
                const e4 = i3.lines.get(t3[1]), r3 = i3.translateBufferLineToString(t3[1], true, 0, t3[0]);
                e4 && e4.isWrapped ? s3[s3.length - 1] += r3 : s3.push(r3);
              }
            }
            return s3.map((e4) => e4.replace(p, " ")).join(d.isWindows ? "\r\n" : "\n");
          }
          clearSelection() {
            this._model.clearSelection(), this._removeMouseDownListeners(), this.refresh(), this._onSelectionChange.fire();
          }
          refresh(e3) {
            this._refreshAnimationFrame || (this._refreshAnimationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._refresh())), d.isLinux && e3 && this.selectionText.length && this._onLinuxMouseSelection.fire(this.selectionText);
          }
          _refresh() {
            this._refreshAnimationFrame = void 0, this._onRedrawRequest.fire({ start: this._model.finalSelectionStart, end: this._model.finalSelectionEnd, columnSelectMode: 3 === this._activeSelectionMode });
          }
          _isClickInSelection(e3) {
            const t3 = this._getMouseBufferCoords(e3), i3 = this._model.finalSelectionStart, s3 = this._model.finalSelectionEnd;
            return !!(i3 && s3 && t3) && this._areCoordsInSelection(t3, i3, s3);
          }
          isCellInSelection(e3, t3) {
            const i3 = this._model.finalSelectionStart, s3 = this._model.finalSelectionEnd;
            return !(!i3 || !s3) && this._areCoordsInSelection([e3, t3], i3, s3);
          }
          _areCoordsInSelection(e3, t3, i3) {
            return e3[1] > t3[1] && e3[1] < i3[1] || t3[1] === i3[1] && e3[1] === t3[1] && e3[0] >= t3[0] && e3[0] < i3[0] || t3[1] < i3[1] && e3[1] === i3[1] && e3[0] < i3[0] || t3[1] < i3[1] && e3[1] === t3[1] && e3[0] >= t3[0];
          }
          _selectWordAtCursor(e3, t3) {
            var i3, s3;
            const r2 = null === (s3 = null === (i3 = this._linkifier.currentLink) || void 0 === i3 ? void 0 : i3.link) || void 0 === s3 ? void 0 : s3.range;
            if (r2) return this._model.selectionStart = [r2.start.x - 1, r2.start.y - 1], this._model.selectionStartLength = (0, _3.getRangeLength)(r2, this._bufferService.cols), this._model.selectionEnd = void 0, true;
            const n2 = this._getMouseBufferCoords(e3);
            return !!n2 && (this._selectWordAt(n2, t3), this._model.selectionEnd = void 0, true);
          }
          selectAll() {
            this._model.isSelectAllActive = true, this.refresh(), this._onSelectionChange.fire();
          }
          selectLines(e3, t3) {
            this._model.clearSelection(), e3 = Math.max(e3, 0), t3 = Math.min(t3, this._bufferService.buffer.lines.length - 1), this._model.selectionStart = [0, e3], this._model.selectionEnd = [this._bufferService.cols, t3], this.refresh(), this._onSelectionChange.fire();
          }
          _handleTrim(e3) {
            this._model.handleTrim(e3) && this.refresh();
          }
          _getMouseBufferCoords(e3) {
            const t3 = this._mouseService.getCoords(e3, this._screenElement, this._bufferService.cols, this._bufferService.rows, true);
            if (t3) return t3[0]--, t3[1]--, t3[1] += this._bufferService.buffer.ydisp, t3;
          }
          _getMouseEventScrollAmount(e3) {
            let t3 = (0, n.getCoordsRelativeToElement)(this._coreBrowserService.window, e3, this._screenElement)[1];
            const i3 = this._renderService.dimensions.css.canvas.height;
            return t3 >= 0 && t3 <= i3 ? 0 : (t3 > i3 && (t3 -= i3), t3 = Math.min(Math.max(t3, -50), 50), t3 /= 50, t3 / Math.abs(t3) + Math.round(14 * t3));
          }
          shouldForceSelection(e3) {
            return d.isMac ? e3.altKey && this._optionsService.rawOptions.macOptionClickForcesSelection : e3.shiftKey;
          }
          handleMouseDown(e3) {
            if (this._mouseDownTimeStamp = e3.timeStamp, (2 !== e3.button || !this.hasSelection) && 0 === e3.button) {
              if (!this._enabled) {
                if (!this.shouldForceSelection(e3)) return;
                e3.stopPropagation();
              }
              e3.preventDefault(), this._dragScrollAmount = 0, this._enabled && e3.shiftKey ? this._handleIncrementalClick(e3) : 1 === e3.detail ? this._handleSingleClick(e3) : 2 === e3.detail ? this._handleDoubleClick(e3) : 3 === e3.detail && this._handleTripleClick(e3), this._addMouseDownListeners(), this.refresh(true);
            }
          }
          _addMouseDownListeners() {
            this._screenElement.ownerDocument && (this._screenElement.ownerDocument.addEventListener("mousemove", this._mouseMoveListener), this._screenElement.ownerDocument.addEventListener("mouseup", this._mouseUpListener)), this._dragScrollIntervalTimer = this._coreBrowserService.window.setInterval(() => this._dragScroll(), 50);
          }
          _removeMouseDownListeners() {
            this._screenElement.ownerDocument && (this._screenElement.ownerDocument.removeEventListener("mousemove", this._mouseMoveListener), this._screenElement.ownerDocument.removeEventListener("mouseup", this._mouseUpListener)), this._coreBrowserService.window.clearInterval(this._dragScrollIntervalTimer), this._dragScrollIntervalTimer = void 0;
          }
          _handleIncrementalClick(e3) {
            this._model.selectionStart && (this._model.selectionEnd = this._getMouseBufferCoords(e3));
          }
          _handleSingleClick(e3) {
            if (this._model.selectionStartLength = 0, this._model.isSelectAllActive = false, this._activeSelectionMode = this.shouldColumnSelect(e3) ? 3 : 0, this._model.selectionStart = this._getMouseBufferCoords(e3), !this._model.selectionStart) return;
            this._model.selectionEnd = void 0;
            const t3 = this._bufferService.buffer.lines.get(this._model.selectionStart[1]);
            t3 && t3.length !== this._model.selectionStart[0] && 0 === t3.hasWidth(this._model.selectionStart[0]) && this._model.selectionStart[0]++;
          }
          _handleDoubleClick(e3) {
            this._selectWordAtCursor(e3, true) && (this._activeSelectionMode = 1);
          }
          _handleTripleClick(e3) {
            const t3 = this._getMouseBufferCoords(e3);
            t3 && (this._activeSelectionMode = 2, this._selectLineAt(t3[1]));
          }
          shouldColumnSelect(e3) {
            return e3.altKey && !(d.isMac && this._optionsService.rawOptions.macOptionClickForcesSelection);
          }
          _handleMouseMove(e3) {
            if (e3.stopImmediatePropagation(), !this._model.selectionStart) return;
            const t3 = this._model.selectionEnd ? [this._model.selectionEnd[0], this._model.selectionEnd[1]] : null;
            if (this._model.selectionEnd = this._getMouseBufferCoords(e3), !this._model.selectionEnd) return void this.refresh(true);
            2 === this._activeSelectionMode ? this._model.selectionEnd[1] < this._model.selectionStart[1] ? this._model.selectionEnd[0] = 0 : this._model.selectionEnd[0] = this._bufferService.cols : 1 === this._activeSelectionMode && this._selectToWordAt(this._model.selectionEnd), this._dragScrollAmount = this._getMouseEventScrollAmount(e3), 3 !== this._activeSelectionMode && (this._dragScrollAmount > 0 ? this._model.selectionEnd[0] = this._bufferService.cols : this._dragScrollAmount < 0 && (this._model.selectionEnd[0] = 0));
            const i3 = this._bufferService.buffer;
            if (this._model.selectionEnd[1] < i3.lines.length) {
              const e4 = i3.lines.get(this._model.selectionEnd[1]);
              e4 && 0 === e4.hasWidth(this._model.selectionEnd[0]) && this._model.selectionEnd[0]++;
            }
            t3 && t3[0] === this._model.selectionEnd[0] && t3[1] === this._model.selectionEnd[1] || this.refresh(true);
          }
          _dragScroll() {
            if (this._model.selectionEnd && this._model.selectionStart && this._dragScrollAmount) {
              this._onRequestScrollLines.fire({ amount: this._dragScrollAmount, suppressScrollEvent: false });
              const e3 = this._bufferService.buffer;
              this._dragScrollAmount > 0 ? (3 !== this._activeSelectionMode && (this._model.selectionEnd[0] = this._bufferService.cols), this._model.selectionEnd[1] = Math.min(e3.ydisp + this._bufferService.rows, e3.lines.length - 1)) : (3 !== this._activeSelectionMode && (this._model.selectionEnd[0] = 0), this._model.selectionEnd[1] = e3.ydisp), this.refresh();
            }
          }
          _handleMouseUp(e3) {
            const t3 = e3.timeStamp - this._mouseDownTimeStamp;
            if (this._removeMouseDownListeners(), this.selectionText.length <= 1 && t3 < 500 && e3.altKey && this._optionsService.rawOptions.altClickMovesCursor) {
              if (this._bufferService.buffer.ybase === this._bufferService.buffer.ydisp) {
                const t4 = this._mouseService.getCoords(e3, this._element, this._bufferService.cols, this._bufferService.rows, false);
                if (t4 && void 0 !== t4[0] && void 0 !== t4[1]) {
                  const e4 = (0, o2.moveToCellSequence)(t4[0] - 1, t4[1] - 1, this._bufferService, this._coreService.decPrivateModes.applicationCursorKeys);
                  this._coreService.triggerDataEvent(e4, true);
                }
              }
            } else this._fireEventIfSelectionChanged();
          }
          _fireEventIfSelectionChanged() {
            const e3 = this._model.finalSelectionStart, t3 = this._model.finalSelectionEnd, i3 = !(!e3 || !t3 || e3[0] === t3[0] && e3[1] === t3[1]);
            i3 ? e3 && t3 && (this._oldSelectionStart && this._oldSelectionEnd && e3[0] === this._oldSelectionStart[0] && e3[1] === this._oldSelectionStart[1] && t3[0] === this._oldSelectionEnd[0] && t3[1] === this._oldSelectionEnd[1] || this._fireOnSelectionChange(e3, t3, i3)) : this._oldHasSelection && this._fireOnSelectionChange(e3, t3, i3);
          }
          _fireOnSelectionChange(e3, t3, i3) {
            this._oldSelectionStart = e3, this._oldSelectionEnd = t3, this._oldHasSelection = i3, this._onSelectionChange.fire();
          }
          _handleBufferActivate(e3) {
            this.clearSelection(), this._trimListener.dispose(), this._trimListener = e3.activeBuffer.lines.onTrim((e4) => this._handleTrim(e4));
          }
          _convertViewportColToCharacterIndex(e3, t3) {
            let i3 = t3;
            for (let s3 = 0; t3 >= s3; s3++) {
              const r2 = e3.loadCell(s3, this._workCell).getChars().length;
              0 === this._workCell.getWidth() ? i3-- : r2 > 1 && t3 !== s3 && (i3 += r2 - 1);
            }
            return i3;
          }
          setSelection(e3, t3, i3) {
            this._model.clearSelection(), this._removeMouseDownListeners(), this._model.selectionStart = [e3, t3], this._model.selectionStartLength = i3, this.refresh(), this._fireEventIfSelectionChanged();
          }
          rightClickSelect(e3) {
            this._isClickInSelection(e3) || (this._selectWordAtCursor(e3, false) && this.refresh(true), this._fireEventIfSelectionChanged());
          }
          _getWordAt(e3, t3, i3 = true, s3 = true) {
            if (e3[0] >= this._bufferService.cols) return;
            const r2 = this._bufferService.buffer, n2 = r2.lines.get(e3[1]);
            if (!n2) return;
            const o3 = r2.translateBufferLineToString(e3[1], false);
            let a3 = this._convertViewportColToCharacterIndex(n2, e3[0]), h3 = a3;
            const c3 = e3[0] - a3;
            let l3 = 0, d2 = 0, _4 = 0, u2 = 0;
            if (" " === o3.charAt(a3)) {
              for (; a3 > 0 && " " === o3.charAt(a3 - 1); ) a3--;
              for (; h3 < o3.length && " " === o3.charAt(h3 + 1); ) h3++;
            } else {
              let t4 = e3[0], i4 = e3[0];
              0 === n2.getWidth(t4) && (l3++, t4--), 2 === n2.getWidth(i4) && (d2++, i4++);
              const s4 = n2.getString(i4).length;
              for (s4 > 1 && (u2 += s4 - 1, h3 += s4 - 1); t4 > 0 && a3 > 0 && !this._isCharWordSeparator(n2.loadCell(t4 - 1, this._workCell)); ) {
                n2.loadCell(t4 - 1, this._workCell);
                const e4 = this._workCell.getChars().length;
                0 === this._workCell.getWidth() ? (l3++, t4--) : e4 > 1 && (_4 += e4 - 1, a3 -= e4 - 1), a3--, t4--;
              }
              for (; i4 < n2.length && h3 + 1 < o3.length && !this._isCharWordSeparator(n2.loadCell(i4 + 1, this._workCell)); ) {
                n2.loadCell(i4 + 1, this._workCell);
                const e4 = this._workCell.getChars().length;
                2 === this._workCell.getWidth() ? (d2++, i4++) : e4 > 1 && (u2 += e4 - 1, h3 += e4 - 1), h3++, i4++;
              }
            }
            h3++;
            let f2 = a3 + c3 - l3 + _4, v3 = Math.min(this._bufferService.cols, h3 - a3 + l3 + d2 - _4 - u2);
            if (t3 || "" !== o3.slice(a3, h3).trim()) {
              if (i3 && 0 === f2 && 32 !== n2.getCodePoint(0)) {
                const t4 = r2.lines.get(e3[1] - 1);
                if (t4 && n2.isWrapped && 32 !== t4.getCodePoint(this._bufferService.cols - 1)) {
                  const t5 = this._getWordAt([this._bufferService.cols - 1, e3[1] - 1], false, true, false);
                  if (t5) {
                    const e4 = this._bufferService.cols - t5.start;
                    f2 -= e4, v3 += e4;
                  }
                }
              }
              if (s3 && f2 + v3 === this._bufferService.cols && 32 !== n2.getCodePoint(this._bufferService.cols - 1)) {
                const t4 = r2.lines.get(e3[1] + 1);
                if ((null == t4 ? void 0 : t4.isWrapped) && 32 !== t4.getCodePoint(0)) {
                  const t5 = this._getWordAt([0, e3[1] + 1], false, false, true);
                  t5 && (v3 += t5.length);
                }
              }
              return { start: f2, length: v3 };
            }
          }
          _selectWordAt(e3, t3) {
            const i3 = this._getWordAt(e3, t3);
            if (i3) {
              for (; i3.start < 0; ) i3.start += this._bufferService.cols, e3[1]--;
              this._model.selectionStart = [i3.start, e3[1]], this._model.selectionStartLength = i3.length;
            }
          }
          _selectToWordAt(e3) {
            const t3 = this._getWordAt(e3, true);
            if (t3) {
              let i3 = e3[1];
              for (; t3.start < 0; ) t3.start += this._bufferService.cols, i3--;
              if (!this._model.areSelectionValuesReversed()) for (; t3.start + t3.length > this._bufferService.cols; ) t3.length -= this._bufferService.cols, i3++;
              this._model.selectionEnd = [this._model.areSelectionValuesReversed() ? t3.start : t3.start + t3.length, i3];
            }
          }
          _isCharWordSeparator(e3) {
            return 0 !== e3.getWidth() && this._optionsService.rawOptions.wordSeparator.indexOf(e3.getChars()) >= 0;
          }
          _selectLineAt(e3) {
            const t3 = this._bufferService.buffer.getWrappedRangeForLine(e3), i3 = { start: { x: 0, y: t3.first }, end: { x: this._bufferService.cols - 1, y: t3.last } };
            this._model.selectionStart = [0, t3.first], this._model.selectionEnd = void 0, this._model.selectionStartLength = (0, _3.getRangeLength)(i3, this._bufferService.cols);
          }
        };
        t2.SelectionService = g2 = s2([r(3, f.IBufferService), r(4, f.ICoreService), r(5, h2.IMouseService), r(6, f.IOptionsService), r(7, h2.IRenderService), r(8, h2.ICoreBrowserService)], g2);
      }, 4725: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.IThemeService = t2.ICharacterJoinerService = t2.ISelectionService = t2.IRenderService = t2.IMouseService = t2.ICoreBrowserService = t2.ICharSizeService = void 0;
        const s2 = i2(8343);
        t2.ICharSizeService = (0, s2.createDecorator)("CharSizeService"), t2.ICoreBrowserService = (0, s2.createDecorator)("CoreBrowserService"), t2.IMouseService = (0, s2.createDecorator)("MouseService"), t2.IRenderService = (0, s2.createDecorator)("RenderService"), t2.ISelectionService = (0, s2.createDecorator)("SelectionService"), t2.ICharacterJoinerService = (0, s2.createDecorator)("CharacterJoinerService"), t2.IThemeService = (0, s2.createDecorator)("ThemeService");
      }, 6731: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ThemeService = t2.DEFAULT_ANSI_COLORS = void 0;
        const n = i2(7239), o2 = i2(8055), a2 = i2(8460), h2 = i2(844), c2 = i2(2585), l2 = o2.css.toColor("#ffffff"), d = o2.css.toColor("#000000"), _3 = o2.css.toColor("#ffffff"), u = o2.css.toColor("#000000"), f = { css: "rgba(255, 255, 255, 0.3)", rgba: 4294967117 };
        t2.DEFAULT_ANSI_COLORS = Object.freeze((() => {
          const e3 = [o2.css.toColor("#2e3436"), o2.css.toColor("#cc0000"), o2.css.toColor("#4e9a06"), o2.css.toColor("#c4a000"), o2.css.toColor("#3465a4"), o2.css.toColor("#75507b"), o2.css.toColor("#06989a"), o2.css.toColor("#d3d7cf"), o2.css.toColor("#555753"), o2.css.toColor("#ef2929"), o2.css.toColor("#8ae234"), o2.css.toColor("#fce94f"), o2.css.toColor("#729fcf"), o2.css.toColor("#ad7fa8"), o2.css.toColor("#34e2e2"), o2.css.toColor("#eeeeec")], t3 = [0, 95, 135, 175, 215, 255];
          for (let i3 = 0; i3 < 216; i3++) {
            const s3 = t3[i3 / 36 % 6 | 0], r2 = t3[i3 / 6 % 6 | 0], n2 = t3[i3 % 6];
            e3.push({ css: o2.channels.toCss(s3, r2, n2), rgba: o2.channels.toRgba(s3, r2, n2) });
          }
          for (let t4 = 0; t4 < 24; t4++) {
            const i3 = 8 + 10 * t4;
            e3.push({ css: o2.channels.toCss(i3, i3, i3), rgba: o2.channels.toRgba(i3, i3, i3) });
          }
          return e3;
        })());
        let v2 = t2.ThemeService = class extends h2.Disposable {
          get colors() {
            return this._colors;
          }
          constructor(e3) {
            super(), this._optionsService = e3, this._contrastCache = new n.ColorContrastCache(), this._halfContrastCache = new n.ColorContrastCache(), this._onChangeColors = this.register(new a2.EventEmitter()), this.onChangeColors = this._onChangeColors.event, this._colors = { foreground: l2, background: d, cursor: _3, cursorAccent: u, selectionForeground: void 0, selectionBackgroundTransparent: f, selectionBackgroundOpaque: o2.color.blend(d, f), selectionInactiveBackgroundTransparent: f, selectionInactiveBackgroundOpaque: o2.color.blend(d, f), ansi: t2.DEFAULT_ANSI_COLORS.slice(), contrastCache: this._contrastCache, halfContrastCache: this._halfContrastCache }, this._updateRestoreColors(), this._setTheme(this._optionsService.rawOptions.theme), this.register(this._optionsService.onSpecificOptionChange("minimumContrastRatio", () => this._contrastCache.clear())), this.register(this._optionsService.onSpecificOptionChange("theme", () => this._setTheme(this._optionsService.rawOptions.theme)));
          }
          _setTheme(e3 = {}) {
            const i3 = this._colors;
            if (i3.foreground = p(e3.foreground, l2), i3.background = p(e3.background, d), i3.cursor = p(e3.cursor, _3), i3.cursorAccent = p(e3.cursorAccent, u), i3.selectionBackgroundTransparent = p(e3.selectionBackground, f), i3.selectionBackgroundOpaque = o2.color.blend(i3.background, i3.selectionBackgroundTransparent), i3.selectionInactiveBackgroundTransparent = p(e3.selectionInactiveBackground, i3.selectionBackgroundTransparent), i3.selectionInactiveBackgroundOpaque = o2.color.blend(i3.background, i3.selectionInactiveBackgroundTransparent), i3.selectionForeground = e3.selectionForeground ? p(e3.selectionForeground, o2.NULL_COLOR) : void 0, i3.selectionForeground === o2.NULL_COLOR && (i3.selectionForeground = void 0), o2.color.isOpaque(i3.selectionBackgroundTransparent)) {
              const e4 = 0.3;
              i3.selectionBackgroundTransparent = o2.color.opacity(i3.selectionBackgroundTransparent, e4);
            }
            if (o2.color.isOpaque(i3.selectionInactiveBackgroundTransparent)) {
              const e4 = 0.3;
              i3.selectionInactiveBackgroundTransparent = o2.color.opacity(i3.selectionInactiveBackgroundTransparent, e4);
            }
            if (i3.ansi = t2.DEFAULT_ANSI_COLORS.slice(), i3.ansi[0] = p(e3.black, t2.DEFAULT_ANSI_COLORS[0]), i3.ansi[1] = p(e3.red, t2.DEFAULT_ANSI_COLORS[1]), i3.ansi[2] = p(e3.green, t2.DEFAULT_ANSI_COLORS[2]), i3.ansi[3] = p(e3.yellow, t2.DEFAULT_ANSI_COLORS[3]), i3.ansi[4] = p(e3.blue, t2.DEFAULT_ANSI_COLORS[4]), i3.ansi[5] = p(e3.magenta, t2.DEFAULT_ANSI_COLORS[5]), i3.ansi[6] = p(e3.cyan, t2.DEFAULT_ANSI_COLORS[6]), i3.ansi[7] = p(e3.white, t2.DEFAULT_ANSI_COLORS[7]), i3.ansi[8] = p(e3.brightBlack, t2.DEFAULT_ANSI_COLORS[8]), i3.ansi[9] = p(e3.brightRed, t2.DEFAULT_ANSI_COLORS[9]), i3.ansi[10] = p(e3.brightGreen, t2.DEFAULT_ANSI_COLORS[10]), i3.ansi[11] = p(e3.brightYellow, t2.DEFAULT_ANSI_COLORS[11]), i3.ansi[12] = p(e3.brightBlue, t2.DEFAULT_ANSI_COLORS[12]), i3.ansi[13] = p(e3.brightMagenta, t2.DEFAULT_ANSI_COLORS[13]), i3.ansi[14] = p(e3.brightCyan, t2.DEFAULT_ANSI_COLORS[14]), i3.ansi[15] = p(e3.brightWhite, t2.DEFAULT_ANSI_COLORS[15]), e3.extendedAnsi) {
              const s3 = Math.min(i3.ansi.length - 16, e3.extendedAnsi.length);
              for (let r2 = 0; r2 < s3; r2++) i3.ansi[r2 + 16] = p(e3.extendedAnsi[r2], t2.DEFAULT_ANSI_COLORS[r2 + 16]);
            }
            this._contrastCache.clear(), this._halfContrastCache.clear(), this._updateRestoreColors(), this._onChangeColors.fire(this.colors);
          }
          restoreColor(e3) {
            this._restoreColor(e3), this._onChangeColors.fire(this.colors);
          }
          _restoreColor(e3) {
            if (void 0 !== e3) switch (e3) {
              case 256:
                this._colors.foreground = this._restoreColors.foreground;
                break;
              case 257:
                this._colors.background = this._restoreColors.background;
                break;
              case 258:
                this._colors.cursor = this._restoreColors.cursor;
                break;
              default:
                this._colors.ansi[e3] = this._restoreColors.ansi[e3];
            }
            else for (let e4 = 0; e4 < this._restoreColors.ansi.length; ++e4) this._colors.ansi[e4] = this._restoreColors.ansi[e4];
          }
          modifyColors(e3) {
            e3(this._colors), this._onChangeColors.fire(this.colors);
          }
          _updateRestoreColors() {
            this._restoreColors = { foreground: this._colors.foreground, background: this._colors.background, cursor: this._colors.cursor, ansi: this._colors.ansi.slice() };
          }
        };
        function p(e3, t3) {
          if (void 0 !== e3) try {
            return o2.css.toColor(e3);
          } catch (e4) {
          }
          return t3;
        }
        t2.ThemeService = v2 = s2([r(0, c2.IOptionsService)], v2);
      }, 6349: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CircularList = void 0;
        const s2 = i2(8460), r = i2(844);
        class n extends r.Disposable {
          constructor(e3) {
            super(), this._maxLength = e3, this.onDeleteEmitter = this.register(new s2.EventEmitter()), this.onDelete = this.onDeleteEmitter.event, this.onInsertEmitter = this.register(new s2.EventEmitter()), this.onInsert = this.onInsertEmitter.event, this.onTrimEmitter = this.register(new s2.EventEmitter()), this.onTrim = this.onTrimEmitter.event, this._array = new Array(this._maxLength), this._startIndex = 0, this._length = 0;
          }
          get maxLength() {
            return this._maxLength;
          }
          set maxLength(e3) {
            if (this._maxLength === e3) return;
            const t3 = new Array(e3);
            for (let i3 = 0; i3 < Math.min(e3, this.length); i3++) t3[i3] = this._array[this._getCyclicIndex(i3)];
            this._array = t3, this._maxLength = e3, this._startIndex = 0;
          }
          get length() {
            return this._length;
          }
          set length(e3) {
            if (e3 > this._length) for (let t3 = this._length; t3 < e3; t3++) this._array[t3] = void 0;
            this._length = e3;
          }
          get(e3) {
            return this._array[this._getCyclicIndex(e3)];
          }
          set(e3, t3) {
            this._array[this._getCyclicIndex(e3)] = t3;
          }
          push(e3) {
            this._array[this._getCyclicIndex(this._length)] = e3, this._length === this._maxLength ? (this._startIndex = ++this._startIndex % this._maxLength, this.onTrimEmitter.fire(1)) : this._length++;
          }
          recycle() {
            if (this._length !== this._maxLength) throw new Error("Can only recycle when the buffer is full");
            return this._startIndex = ++this._startIndex % this._maxLength, this.onTrimEmitter.fire(1), this._array[this._getCyclicIndex(this._length - 1)];
          }
          get isFull() {
            return this._length === this._maxLength;
          }
          pop() {
            return this._array[this._getCyclicIndex(this._length-- - 1)];
          }
          splice(e3, t3, ...i3) {
            if (t3) {
              for (let i4 = e3; i4 < this._length - t3; i4++) this._array[this._getCyclicIndex(i4)] = this._array[this._getCyclicIndex(i4 + t3)];
              this._length -= t3, this.onDeleteEmitter.fire({ index: e3, amount: t3 });
            }
            for (let t4 = this._length - 1; t4 >= e3; t4--) this._array[this._getCyclicIndex(t4 + i3.length)] = this._array[this._getCyclicIndex(t4)];
            for (let t4 = 0; t4 < i3.length; t4++) this._array[this._getCyclicIndex(e3 + t4)] = i3[t4];
            if (i3.length && this.onInsertEmitter.fire({ index: e3, amount: i3.length }), this._length + i3.length > this._maxLength) {
              const e4 = this._length + i3.length - this._maxLength;
              this._startIndex += e4, this._length = this._maxLength, this.onTrimEmitter.fire(e4);
            } else this._length += i3.length;
          }
          trimStart(e3) {
            e3 > this._length && (e3 = this._length), this._startIndex += e3, this._length -= e3, this.onTrimEmitter.fire(e3);
          }
          shiftElements(e3, t3, i3) {
            if (!(t3 <= 0)) {
              if (e3 < 0 || e3 >= this._length) throw new Error("start argument out of range");
              if (e3 + i3 < 0) throw new Error("Cannot shift elements in list beyond index 0");
              if (i3 > 0) {
                for (let s4 = t3 - 1; s4 >= 0; s4--) this.set(e3 + s4 + i3, this.get(e3 + s4));
                const s3 = e3 + t3 + i3 - this._length;
                if (s3 > 0) for (this._length += s3; this._length > this._maxLength; ) this._length--, this._startIndex++, this.onTrimEmitter.fire(1);
              } else for (let s3 = 0; s3 < t3; s3++) this.set(e3 + s3 + i3, this.get(e3 + s3));
            }
          }
          _getCyclicIndex(e3) {
            return (this._startIndex + e3) % this._maxLength;
          }
        }
        t2.CircularList = n;
      }, 1439: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.clone = void 0, t2.clone = function e3(t3, i2 = 5) {
          if ("object" != typeof t3) return t3;
          const s2 = Array.isArray(t3) ? [] : {};
          for (const r in t3) s2[r] = i2 <= 1 ? t3[r] : t3[r] && e3(t3[r], i2 - 1);
          return s2;
        };
      }, 8055: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.contrastRatio = t2.toPaddedHex = t2.rgba = t2.rgb = t2.css = t2.color = t2.channels = t2.NULL_COLOR = void 0;
        const s2 = i2(6114);
        let r = 0, n = 0, o2 = 0, a2 = 0;
        var h2, c2, l2, d, _3;
        function u(e3) {
          const t3 = e3.toString(16);
          return t3.length < 2 ? "0" + t3 : t3;
        }
        function f(e3, t3) {
          return e3 < t3 ? (t3 + 0.05) / (e3 + 0.05) : (e3 + 0.05) / (t3 + 0.05);
        }
        t2.NULL_COLOR = { css: "#00000000", rgba: 0 }, function(e3) {
          e3.toCss = function(e4, t3, i3, s3) {
            return void 0 !== s3 ? `#${u(e4)}${u(t3)}${u(i3)}${u(s3)}` : `#${u(e4)}${u(t3)}${u(i3)}`;
          }, e3.toRgba = function(e4, t3, i3, s3 = 255) {
            return (e4 << 24 | t3 << 16 | i3 << 8 | s3) >>> 0;
          };
        }(h2 || (t2.channels = h2 = {})), function(e3) {
          function t3(e4, t4) {
            return a2 = Math.round(255 * t4), [r, n, o2] = _3.toChannels(e4.rgba), { css: h2.toCss(r, n, o2, a2), rgba: h2.toRgba(r, n, o2, a2) };
          }
          e3.blend = function(e4, t4) {
            if (a2 = (255 & t4.rgba) / 255, 1 === a2) return { css: t4.css, rgba: t4.rgba };
            const i3 = t4.rgba >> 24 & 255, s3 = t4.rgba >> 16 & 255, c3 = t4.rgba >> 8 & 255, l3 = e4.rgba >> 24 & 255, d2 = e4.rgba >> 16 & 255, _4 = e4.rgba >> 8 & 255;
            return r = l3 + Math.round((i3 - l3) * a2), n = d2 + Math.round((s3 - d2) * a2), o2 = _4 + Math.round((c3 - _4) * a2), { css: h2.toCss(r, n, o2), rgba: h2.toRgba(r, n, o2) };
          }, e3.isOpaque = function(e4) {
            return 255 == (255 & e4.rgba);
          }, e3.ensureContrastRatio = function(e4, t4, i3) {
            const s3 = _3.ensureContrastRatio(e4.rgba, t4.rgba, i3);
            if (s3) return _3.toColor(s3 >> 24 & 255, s3 >> 16 & 255, s3 >> 8 & 255);
          }, e3.opaque = function(e4) {
            const t4 = (255 | e4.rgba) >>> 0;
            return [r, n, o2] = _3.toChannels(t4), { css: h2.toCss(r, n, o2), rgba: t4 };
          }, e3.opacity = t3, e3.multiplyOpacity = function(e4, i3) {
            return a2 = 255 & e4.rgba, t3(e4, a2 * i3 / 255);
          }, e3.toColorRGB = function(e4) {
            return [e4.rgba >> 24 & 255, e4.rgba >> 16 & 255, e4.rgba >> 8 & 255];
          };
        }(c2 || (t2.color = c2 = {})), function(e3) {
          let t3, i3;
          if (!s2.isNode) {
            const e4 = document.createElement("canvas");
            e4.width = 1, e4.height = 1;
            const s3 = e4.getContext("2d", { willReadFrequently: true });
            s3 && (t3 = s3, t3.globalCompositeOperation = "copy", i3 = t3.createLinearGradient(0, 0, 1, 1));
          }
          e3.toColor = function(e4) {
            if (e4.match(/#[\da-f]{3,8}/i)) switch (e4.length) {
              case 4:
                return r = parseInt(e4.slice(1, 2).repeat(2), 16), n = parseInt(e4.slice(2, 3).repeat(2), 16), o2 = parseInt(e4.slice(3, 4).repeat(2), 16), _3.toColor(r, n, o2);
              case 5:
                return r = parseInt(e4.slice(1, 2).repeat(2), 16), n = parseInt(e4.slice(2, 3).repeat(2), 16), o2 = parseInt(e4.slice(3, 4).repeat(2), 16), a2 = parseInt(e4.slice(4, 5).repeat(2), 16), _3.toColor(r, n, o2, a2);
              case 7:
                return { css: e4, rgba: (parseInt(e4.slice(1), 16) << 8 | 255) >>> 0 };
              case 9:
                return { css: e4, rgba: parseInt(e4.slice(1), 16) >>> 0 };
            }
            const s3 = e4.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(0|1|\d?\.(\d+))\s*)?\)/);
            if (s3) return r = parseInt(s3[1]), n = parseInt(s3[2]), o2 = parseInt(s3[3]), a2 = Math.round(255 * (void 0 === s3[5] ? 1 : parseFloat(s3[5]))), _3.toColor(r, n, o2, a2);
            if (!t3 || !i3) throw new Error("css.toColor: Unsupported css format");
            if (t3.fillStyle = i3, t3.fillStyle = e4, "string" != typeof t3.fillStyle) throw new Error("css.toColor: Unsupported css format");
            if (t3.fillRect(0, 0, 1, 1), [r, n, o2, a2] = t3.getImageData(0, 0, 1, 1).data, 255 !== a2) throw new Error("css.toColor: Unsupported css format");
            return { rgba: h2.toRgba(r, n, o2, a2), css: e4 };
          };
        }(l2 || (t2.css = l2 = {})), function(e3) {
          function t3(e4, t4, i3) {
            const s3 = e4 / 255, r2 = t4 / 255, n2 = i3 / 255;
            return 0.2126 * (s3 <= 0.03928 ? s3 / 12.92 : Math.pow((s3 + 0.055) / 1.055, 2.4)) + 0.7152 * (r2 <= 0.03928 ? r2 / 12.92 : Math.pow((r2 + 0.055) / 1.055, 2.4)) + 0.0722 * (n2 <= 0.03928 ? n2 / 12.92 : Math.pow((n2 + 0.055) / 1.055, 2.4));
          }
          e3.relativeLuminance = function(e4) {
            return t3(e4 >> 16 & 255, e4 >> 8 & 255, 255 & e4);
          }, e3.relativeLuminance2 = t3;
        }(d || (t2.rgb = d = {})), function(e3) {
          function t3(e4, t4, i4) {
            const s3 = e4 >> 24 & 255, r2 = e4 >> 16 & 255, n2 = e4 >> 8 & 255;
            let o3 = t4 >> 24 & 255, a3 = t4 >> 16 & 255, h3 = t4 >> 8 & 255, c3 = f(d.relativeLuminance2(o3, a3, h3), d.relativeLuminance2(s3, r2, n2));
            for (; c3 < i4 && (o3 > 0 || a3 > 0 || h3 > 0); ) o3 -= Math.max(0, Math.ceil(0.1 * o3)), a3 -= Math.max(0, Math.ceil(0.1 * a3)), h3 -= Math.max(0, Math.ceil(0.1 * h3)), c3 = f(d.relativeLuminance2(o3, a3, h3), d.relativeLuminance2(s3, r2, n2));
            return (o3 << 24 | a3 << 16 | h3 << 8 | 255) >>> 0;
          }
          function i3(e4, t4, i4) {
            const s3 = e4 >> 24 & 255, r2 = e4 >> 16 & 255, n2 = e4 >> 8 & 255;
            let o3 = t4 >> 24 & 255, a3 = t4 >> 16 & 255, h3 = t4 >> 8 & 255, c3 = f(d.relativeLuminance2(o3, a3, h3), d.relativeLuminance2(s3, r2, n2));
            for (; c3 < i4 && (o3 < 255 || a3 < 255 || h3 < 255); ) o3 = Math.min(255, o3 + Math.ceil(0.1 * (255 - o3))), a3 = Math.min(255, a3 + Math.ceil(0.1 * (255 - a3))), h3 = Math.min(255, h3 + Math.ceil(0.1 * (255 - h3))), c3 = f(d.relativeLuminance2(o3, a3, h3), d.relativeLuminance2(s3, r2, n2));
            return (o3 << 24 | a3 << 16 | h3 << 8 | 255) >>> 0;
          }
          e3.ensureContrastRatio = function(e4, s3, r2) {
            const n2 = d.relativeLuminance(e4 >> 8), o3 = d.relativeLuminance(s3 >> 8);
            if (f(n2, o3) < r2) {
              if (o3 < n2) {
                const o4 = t3(e4, s3, r2), a4 = f(n2, d.relativeLuminance(o4 >> 8));
                if (a4 < r2) {
                  const t4 = i3(e4, s3, r2);
                  return a4 > f(n2, d.relativeLuminance(t4 >> 8)) ? o4 : t4;
                }
                return o4;
              }
              const a3 = i3(e4, s3, r2), h3 = f(n2, d.relativeLuminance(a3 >> 8));
              if (h3 < r2) {
                const i4 = t3(e4, s3, r2);
                return h3 > f(n2, d.relativeLuminance(i4 >> 8)) ? a3 : i4;
              }
              return a3;
            }
          }, e3.reduceLuminance = t3, e3.increaseLuminance = i3, e3.toChannels = function(e4) {
            return [e4 >> 24 & 255, e4 >> 16 & 255, e4 >> 8 & 255, 255 & e4];
          }, e3.toColor = function(e4, t4, i4, s3) {
            return { css: h2.toCss(e4, t4, i4, s3), rgba: h2.toRgba(e4, t4, i4, s3) };
          };
        }(_3 || (t2.rgba = _3 = {})), t2.toPaddedHex = u, t2.contrastRatio = f;
      }, 8969: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CoreTerminal = void 0;
        const s2 = i2(844), r = i2(2585), n = i2(4348), o2 = i2(7866), a2 = i2(744), h2 = i2(7302), c2 = i2(6975), l2 = i2(8460), d = i2(1753), _3 = i2(1480), u = i2(7994), f = i2(9282), v2 = i2(5435), p = i2(5981), g2 = i2(2660);
        let m2 = false;
        class S extends s2.Disposable {
          get onScroll() {
            return this._onScrollApi || (this._onScrollApi = this.register(new l2.EventEmitter()), this._onScroll.event((e3) => {
              var t3;
              null === (t3 = this._onScrollApi) || void 0 === t3 || t3.fire(e3.position);
            })), this._onScrollApi.event;
          }
          get cols() {
            return this._bufferService.cols;
          }
          get rows() {
            return this._bufferService.rows;
          }
          get buffers() {
            return this._bufferService.buffers;
          }
          get options() {
            return this.optionsService.options;
          }
          set options(e3) {
            for (const t3 in e3) this.optionsService.options[t3] = e3[t3];
          }
          constructor(e3) {
            super(), this._windowsWrappingHeuristics = this.register(new s2.MutableDisposable()), this._onBinary = this.register(new l2.EventEmitter()), this.onBinary = this._onBinary.event, this._onData = this.register(new l2.EventEmitter()), this.onData = this._onData.event, this._onLineFeed = this.register(new l2.EventEmitter()), this.onLineFeed = this._onLineFeed.event, this._onResize = this.register(new l2.EventEmitter()), this.onResize = this._onResize.event, this._onWriteParsed = this.register(new l2.EventEmitter()), this.onWriteParsed = this._onWriteParsed.event, this._onScroll = this.register(new l2.EventEmitter()), this._instantiationService = new n.InstantiationService(), this.optionsService = this.register(new h2.OptionsService(e3)), this._instantiationService.setService(r.IOptionsService, this.optionsService), this._bufferService = this.register(this._instantiationService.createInstance(a2.BufferService)), this._instantiationService.setService(r.IBufferService, this._bufferService), this._logService = this.register(this._instantiationService.createInstance(o2.LogService)), this._instantiationService.setService(r.ILogService, this._logService), this.coreService = this.register(this._instantiationService.createInstance(c2.CoreService)), this._instantiationService.setService(r.ICoreService, this.coreService), this.coreMouseService = this.register(this._instantiationService.createInstance(d.CoreMouseService)), this._instantiationService.setService(r.ICoreMouseService, this.coreMouseService), this.unicodeService = this.register(this._instantiationService.createInstance(_3.UnicodeService)), this._instantiationService.setService(r.IUnicodeService, this.unicodeService), this._charsetService = this._instantiationService.createInstance(u.CharsetService), this._instantiationService.setService(r.ICharsetService, this._charsetService), this._oscLinkService = this._instantiationService.createInstance(g2.OscLinkService), this._instantiationService.setService(r.IOscLinkService, this._oscLinkService), this._inputHandler = this.register(new v2.InputHandler(this._bufferService, this._charsetService, this.coreService, this._logService, this.optionsService, this._oscLinkService, this.coreMouseService, this.unicodeService)), this.register((0, l2.forwardEvent)(this._inputHandler.onLineFeed, this._onLineFeed)), this.register(this._inputHandler), this.register((0, l2.forwardEvent)(this._bufferService.onResize, this._onResize)), this.register((0, l2.forwardEvent)(this.coreService.onData, this._onData)), this.register((0, l2.forwardEvent)(this.coreService.onBinary, this._onBinary)), this.register(this.coreService.onRequestScrollToBottom(() => this.scrollToBottom())), this.register(this.coreService.onUserInput(() => this._writeBuffer.handleUserInput())), this.register(this.optionsService.onMultipleOptionChange(["windowsMode", "windowsPty"], () => this._handleWindowsPtyOptionChange())), this.register(this._bufferService.onScroll((e4) => {
              this._onScroll.fire({ position: this._bufferService.buffer.ydisp, source: 0 }), this._inputHandler.markRangeDirty(this._bufferService.buffer.scrollTop, this._bufferService.buffer.scrollBottom);
            })), this.register(this._inputHandler.onScroll((e4) => {
              this._onScroll.fire({ position: this._bufferService.buffer.ydisp, source: 0 }), this._inputHandler.markRangeDirty(this._bufferService.buffer.scrollTop, this._bufferService.buffer.scrollBottom);
            })), this._writeBuffer = this.register(new p.WriteBuffer((e4, t3) => this._inputHandler.parse(e4, t3))), this.register((0, l2.forwardEvent)(this._writeBuffer.onWriteParsed, this._onWriteParsed));
          }
          write(e3, t3) {
            this._writeBuffer.write(e3, t3);
          }
          writeSync(e3, t3) {
            this._logService.logLevel <= r.LogLevelEnum.WARN && !m2 && (this._logService.warn("writeSync is unreliable and will be removed soon."), m2 = true), this._writeBuffer.writeSync(e3, t3);
          }
          resize(e3, t3) {
            isNaN(e3) || isNaN(t3) || (e3 = Math.max(e3, a2.MINIMUM_COLS), t3 = Math.max(t3, a2.MINIMUM_ROWS), this._bufferService.resize(e3, t3));
          }
          scroll(e3, t3 = false) {
            this._bufferService.scroll(e3, t3);
          }
          scrollLines(e3, t3, i3) {
            this._bufferService.scrollLines(e3, t3, i3);
          }
          scrollPages(e3) {
            this.scrollLines(e3 * (this.rows - 1));
          }
          scrollToTop() {
            this.scrollLines(-this._bufferService.buffer.ydisp);
          }
          scrollToBottom() {
            this.scrollLines(this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
          }
          scrollToLine(e3) {
            const t3 = e3 - this._bufferService.buffer.ydisp;
            0 !== t3 && this.scrollLines(t3);
          }
          registerEscHandler(e3, t3) {
            return this._inputHandler.registerEscHandler(e3, t3);
          }
          registerDcsHandler(e3, t3) {
            return this._inputHandler.registerDcsHandler(e3, t3);
          }
          registerCsiHandler(e3, t3) {
            return this._inputHandler.registerCsiHandler(e3, t3);
          }
          registerOscHandler(e3, t3) {
            return this._inputHandler.registerOscHandler(e3, t3);
          }
          _setup() {
            this._handleWindowsPtyOptionChange();
          }
          reset() {
            this._inputHandler.reset(), this._bufferService.reset(), this._charsetService.reset(), this.coreService.reset(), this.coreMouseService.reset();
          }
          _handleWindowsPtyOptionChange() {
            let e3 = false;
            const t3 = this.optionsService.rawOptions.windowsPty;
            t3 && void 0 !== t3.buildNumber && void 0 !== t3.buildNumber ? e3 = !!("conpty" === t3.backend && t3.buildNumber < 21376) : this.optionsService.rawOptions.windowsMode && (e3 = true), e3 ? this._enableWindowsWrappingHeuristics() : this._windowsWrappingHeuristics.clear();
          }
          _enableWindowsWrappingHeuristics() {
            if (!this._windowsWrappingHeuristics.value) {
              const e3 = [];
              e3.push(this.onLineFeed(f.updateWindowsModeWrappedState.bind(null, this._bufferService))), e3.push(this.registerCsiHandler({ final: "H" }, () => ((0, f.updateWindowsModeWrappedState)(this._bufferService), false))), this._windowsWrappingHeuristics.value = (0, s2.toDisposable)(() => {
                for (const t3 of e3) t3.dispose();
              });
            }
          }
        }
        t2.CoreTerminal = S;
      }, 8460: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.forwardEvent = t2.EventEmitter = void 0, t2.EventEmitter = class {
          constructor() {
            this._listeners = [], this._disposed = false;
          }
          get event() {
            return this._event || (this._event = (e3) => (this._listeners.push(e3), { dispose: () => {
              if (!this._disposed) {
                for (let t3 = 0; t3 < this._listeners.length; t3++) if (this._listeners[t3] === e3) return void this._listeners.splice(t3, 1);
              }
            } })), this._event;
          }
          fire(e3, t3) {
            const i2 = [];
            for (let e4 = 0; e4 < this._listeners.length; e4++) i2.push(this._listeners[e4]);
            for (let s2 = 0; s2 < i2.length; s2++) i2[s2].call(void 0, e3, t3);
          }
          dispose() {
            this.clearListeners(), this._disposed = true;
          }
          clearListeners() {
            this._listeners && (this._listeners.length = 0);
          }
        }, t2.forwardEvent = function(e3, t3) {
          return e3((e4) => t3.fire(e4));
        };
      }, 5435: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.InputHandler = t2.WindowsOptionsReportType = void 0;
        const n = i2(2584), o2 = i2(7116), a2 = i2(2015), h2 = i2(844), c2 = i2(482), l2 = i2(8437), d = i2(8460), _3 = i2(643), u = i2(511), f = i2(3734), v2 = i2(2585), p = i2(6242), g2 = i2(6351), m2 = i2(5941), S = { "(": 0, ")": 1, "*": 2, "+": 3, "-": 1, ".": 2 }, C = 131072;
        function b(e3, t3) {
          if (e3 > 24) return t3.setWinLines || false;
          switch (e3) {
            case 1:
              return !!t3.restoreWin;
            case 2:
              return !!t3.minimizeWin;
            case 3:
              return !!t3.setWinPosition;
            case 4:
              return !!t3.setWinSizePixels;
            case 5:
              return !!t3.raiseWin;
            case 6:
              return !!t3.lowerWin;
            case 7:
              return !!t3.refreshWin;
            case 8:
              return !!t3.setWinSizeChars;
            case 9:
              return !!t3.maximizeWin;
            case 10:
              return !!t3.fullscreenWin;
            case 11:
              return !!t3.getWinState;
            case 13:
              return !!t3.getWinPosition;
            case 14:
              return !!t3.getWinSizePixels;
            case 15:
              return !!t3.getScreenSizePixels;
            case 16:
              return !!t3.getCellSizePixels;
            case 18:
              return !!t3.getWinSizeChars;
            case 19:
              return !!t3.getScreenSizeChars;
            case 20:
              return !!t3.getIconTitle;
            case 21:
              return !!t3.getWinTitle;
            case 22:
              return !!t3.pushTitle;
            case 23:
              return !!t3.popTitle;
            case 24:
              return !!t3.setWinLines;
          }
          return false;
        }
        var y3;
        !function(e3) {
          e3[e3.GET_WIN_SIZE_PIXELS = 0] = "GET_WIN_SIZE_PIXELS", e3[e3.GET_CELL_SIZE_PIXELS = 1] = "GET_CELL_SIZE_PIXELS";
        }(y3 || (t2.WindowsOptionsReportType = y3 = {}));
        let w2 = 0;
        class E extends h2.Disposable {
          getAttrData() {
            return this._curAttrData;
          }
          constructor(e3, t3, i3, s3, r2, h3, _4, f2, v3 = new a2.EscapeSequenceParser()) {
            super(), this._bufferService = e3, this._charsetService = t3, this._coreService = i3, this._logService = s3, this._optionsService = r2, this._oscLinkService = h3, this._coreMouseService = _4, this._unicodeService = f2, this._parser = v3, this._parseBuffer = new Uint32Array(4096), this._stringDecoder = new c2.StringToUtf32(), this._utf8Decoder = new c2.Utf8ToUtf32(), this._workCell = new u.CellData(), this._windowTitle = "", this._iconName = "", this._windowTitleStack = [], this._iconNameStack = [], this._curAttrData = l2.DEFAULT_ATTR_DATA.clone(), this._eraseAttrDataInternal = l2.DEFAULT_ATTR_DATA.clone(), this._onRequestBell = this.register(new d.EventEmitter()), this.onRequestBell = this._onRequestBell.event, this._onRequestRefreshRows = this.register(new d.EventEmitter()), this.onRequestRefreshRows = this._onRequestRefreshRows.event, this._onRequestReset = this.register(new d.EventEmitter()), this.onRequestReset = this._onRequestReset.event, this._onRequestSendFocus = this.register(new d.EventEmitter()), this.onRequestSendFocus = this._onRequestSendFocus.event, this._onRequestSyncScrollBar = this.register(new d.EventEmitter()), this.onRequestSyncScrollBar = this._onRequestSyncScrollBar.event, this._onRequestWindowsOptionsReport = this.register(new d.EventEmitter()), this.onRequestWindowsOptionsReport = this._onRequestWindowsOptionsReport.event, this._onA11yChar = this.register(new d.EventEmitter()), this.onA11yChar = this._onA11yChar.event, this._onA11yTab = this.register(new d.EventEmitter()), this.onA11yTab = this._onA11yTab.event, this._onCursorMove = this.register(new d.EventEmitter()), this.onCursorMove = this._onCursorMove.event, this._onLineFeed = this.register(new d.EventEmitter()), this.onLineFeed = this._onLineFeed.event, this._onScroll = this.register(new d.EventEmitter()), this.onScroll = this._onScroll.event, this._onTitleChange = this.register(new d.EventEmitter()), this.onTitleChange = this._onTitleChange.event, this._onColor = this.register(new d.EventEmitter()), this.onColor = this._onColor.event, this._parseStack = { paused: false, cursorStartX: 0, cursorStartY: 0, decodedLength: 0, position: 0 }, this._specialColors = [256, 257, 258], this.register(this._parser), this._dirtyRowTracker = new k2(this._bufferService), this._activeBuffer = this._bufferService.buffer, this.register(this._bufferService.buffers.onBufferActivate((e4) => this._activeBuffer = e4.activeBuffer)), this._parser.setCsiHandlerFallback((e4, t4) => {
              this._logService.debug("Unknown CSI code: ", { identifier: this._parser.identToString(e4), params: t4.toArray() });
            }), this._parser.setEscHandlerFallback((e4) => {
              this._logService.debug("Unknown ESC code: ", { identifier: this._parser.identToString(e4) });
            }), this._parser.setExecuteHandlerFallback((e4) => {
              this._logService.debug("Unknown EXECUTE code: ", { code: e4 });
            }), this._parser.setOscHandlerFallback((e4, t4, i4) => {
              this._logService.debug("Unknown OSC code: ", { identifier: e4, action: t4, data: i4 });
            }), this._parser.setDcsHandlerFallback((e4, t4, i4) => {
              "HOOK" === t4 && (i4 = i4.toArray()), this._logService.debug("Unknown DCS code: ", { identifier: this._parser.identToString(e4), action: t4, payload: i4 });
            }), this._parser.setPrintHandler((e4, t4, i4) => this.print(e4, t4, i4)), this._parser.registerCsiHandler({ final: "@" }, (e4) => this.insertChars(e4)), this._parser.registerCsiHandler({ intermediates: " ", final: "@" }, (e4) => this.scrollLeft(e4)), this._parser.registerCsiHandler({ final: "A" }, (e4) => this.cursorUp(e4)), this._parser.registerCsiHandler({ intermediates: " ", final: "A" }, (e4) => this.scrollRight(e4)), this._parser.registerCsiHandler({ final: "B" }, (e4) => this.cursorDown(e4)), this._parser.registerCsiHandler({ final: "C" }, (e4) => this.cursorForward(e4)), this._parser.registerCsiHandler({ final: "D" }, (e4) => this.cursorBackward(e4)), this._parser.registerCsiHandler({ final: "E" }, (e4) => this.cursorNextLine(e4)), this._parser.registerCsiHandler({ final: "F" }, (e4) => this.cursorPrecedingLine(e4)), this._parser.registerCsiHandler({ final: "G" }, (e4) => this.cursorCharAbsolute(e4)), this._parser.registerCsiHandler({ final: "H" }, (e4) => this.cursorPosition(e4)), this._parser.registerCsiHandler({ final: "I" }, (e4) => this.cursorForwardTab(e4)), this._parser.registerCsiHandler({ final: "J" }, (e4) => this.eraseInDisplay(e4, false)), this._parser.registerCsiHandler({ prefix: "?", final: "J" }, (e4) => this.eraseInDisplay(e4, true)), this._parser.registerCsiHandler({ final: "K" }, (e4) => this.eraseInLine(e4, false)), this._parser.registerCsiHandler({ prefix: "?", final: "K" }, (e4) => this.eraseInLine(e4, true)), this._parser.registerCsiHandler({ final: "L" }, (e4) => this.insertLines(e4)), this._parser.registerCsiHandler({ final: "M" }, (e4) => this.deleteLines(e4)), this._parser.registerCsiHandler({ final: "P" }, (e4) => this.deleteChars(e4)), this._parser.registerCsiHandler({ final: "S" }, (e4) => this.scrollUp(e4)), this._parser.registerCsiHandler({ final: "T" }, (e4) => this.scrollDown(e4)), this._parser.registerCsiHandler({ final: "X" }, (e4) => this.eraseChars(e4)), this._parser.registerCsiHandler({ final: "Z" }, (e4) => this.cursorBackwardTab(e4)), this._parser.registerCsiHandler({ final: "`" }, (e4) => this.charPosAbsolute(e4)), this._parser.registerCsiHandler({ final: "a" }, (e4) => this.hPositionRelative(e4)), this._parser.registerCsiHandler({ final: "b" }, (e4) => this.repeatPrecedingCharacter(e4)), this._parser.registerCsiHandler({ final: "c" }, (e4) => this.sendDeviceAttributesPrimary(e4)), this._parser.registerCsiHandler({ prefix: ">", final: "c" }, (e4) => this.sendDeviceAttributesSecondary(e4)), this._parser.registerCsiHandler({ final: "d" }, (e4) => this.linePosAbsolute(e4)), this._parser.registerCsiHandler({ final: "e" }, (e4) => this.vPositionRelative(e4)), this._parser.registerCsiHandler({ final: "f" }, (e4) => this.hVPosition(e4)), this._parser.registerCsiHandler({ final: "g" }, (e4) => this.tabClear(e4)), this._parser.registerCsiHandler({ final: "h" }, (e4) => this.setMode(e4)), this._parser.registerCsiHandler({ prefix: "?", final: "h" }, (e4) => this.setModePrivate(e4)), this._parser.registerCsiHandler({ final: "l" }, (e4) => this.resetMode(e4)), this._parser.registerCsiHandler({ prefix: "?", final: "l" }, (e4) => this.resetModePrivate(e4)), this._parser.registerCsiHandler({ final: "m" }, (e4) => this.charAttributes(e4)), this._parser.registerCsiHandler({ final: "n" }, (e4) => this.deviceStatus(e4)), this._parser.registerCsiHandler({ prefix: "?", final: "n" }, (e4) => this.deviceStatusPrivate(e4)), this._parser.registerCsiHandler({ intermediates: "!", final: "p" }, (e4) => this.softReset(e4)), this._parser.registerCsiHandler({ intermediates: " ", final: "q" }, (e4) => this.setCursorStyle(e4)), this._parser.registerCsiHandler({ final: "r" }, (e4) => this.setScrollRegion(e4)), this._parser.registerCsiHandler({ final: "s" }, (e4) => this.saveCursor(e4)), this._parser.registerCsiHandler({ final: "t" }, (e4) => this.windowOptions(e4)), this._parser.registerCsiHandler({ final: "u" }, (e4) => this.restoreCursor(e4)), this._parser.registerCsiHandler({ intermediates: "'", final: "}" }, (e4) => this.insertColumns(e4)), this._parser.registerCsiHandler({ intermediates: "'", final: "~" }, (e4) => this.deleteColumns(e4)), this._parser.registerCsiHandler({ intermediates: '"', final: "q" }, (e4) => this.selectProtected(e4)), this._parser.registerCsiHandler({ intermediates: "$", final: "p" }, (e4) => this.requestMode(e4, true)), this._parser.registerCsiHandler({ prefix: "?", intermediates: "$", final: "p" }, (e4) => this.requestMode(e4, false)), this._parser.setExecuteHandler(n.C0.BEL, () => this.bell()), this._parser.setExecuteHandler(n.C0.LF, () => this.lineFeed()), this._parser.setExecuteHandler(n.C0.VT, () => this.lineFeed()), this._parser.setExecuteHandler(n.C0.FF, () => this.lineFeed()), this._parser.setExecuteHandler(n.C0.CR, () => this.carriageReturn()), this._parser.setExecuteHandler(n.C0.BS, () => this.backspace()), this._parser.setExecuteHandler(n.C0.HT, () => this.tab()), this._parser.setExecuteHandler(n.C0.SO, () => this.shiftOut()), this._parser.setExecuteHandler(n.C0.SI, () => this.shiftIn()), this._parser.setExecuteHandler(n.C1.IND, () => this.index()), this._parser.setExecuteHandler(n.C1.NEL, () => this.nextLine()), this._parser.setExecuteHandler(n.C1.HTS, () => this.tabSet()), this._parser.registerOscHandler(0, new p.OscHandler((e4) => (this.setTitle(e4), this.setIconName(e4), true))), this._parser.registerOscHandler(1, new p.OscHandler((e4) => this.setIconName(e4))), this._parser.registerOscHandler(2, new p.OscHandler((e4) => this.setTitle(e4))), this._parser.registerOscHandler(4, new p.OscHandler((e4) => this.setOrReportIndexedColor(e4))), this._parser.registerOscHandler(8, new p.OscHandler((e4) => this.setHyperlink(e4))), this._parser.registerOscHandler(10, new p.OscHandler((e4) => this.setOrReportFgColor(e4))), this._parser.registerOscHandler(11, new p.OscHandler((e4) => this.setOrReportBgColor(e4))), this._parser.registerOscHandler(12, new p.OscHandler((e4) => this.setOrReportCursorColor(e4))), this._parser.registerOscHandler(104, new p.OscHandler((e4) => this.restoreIndexedColor(e4))), this._parser.registerOscHandler(110, new p.OscHandler((e4) => this.restoreFgColor(e4))), this._parser.registerOscHandler(111, new p.OscHandler((e4) => this.restoreBgColor(e4))), this._parser.registerOscHandler(112, new p.OscHandler((e4) => this.restoreCursorColor(e4))), this._parser.registerEscHandler({ final: "7" }, () => this.saveCursor()), this._parser.registerEscHandler({ final: "8" }, () => this.restoreCursor()), this._parser.registerEscHandler({ final: "D" }, () => this.index()), this._parser.registerEscHandler({ final: "E" }, () => this.nextLine()), this._parser.registerEscHandler({ final: "H" }, () => this.tabSet()), this._parser.registerEscHandler({ final: "M" }, () => this.reverseIndex()), this._parser.registerEscHandler({ final: "=" }, () => this.keypadApplicationMode()), this._parser.registerEscHandler({ final: ">" }, () => this.keypadNumericMode()), this._parser.registerEscHandler({ final: "c" }, () => this.fullReset()), this._parser.registerEscHandler({ final: "n" }, () => this.setgLevel(2)), this._parser.registerEscHandler({ final: "o" }, () => this.setgLevel(3)), this._parser.registerEscHandler({ final: "|" }, () => this.setgLevel(3)), this._parser.registerEscHandler({ final: "}" }, () => this.setgLevel(2)), this._parser.registerEscHandler({ final: "~" }, () => this.setgLevel(1)), this._parser.registerEscHandler({ intermediates: "%", final: "@" }, () => this.selectDefaultCharset()), this._parser.registerEscHandler({ intermediates: "%", final: "G" }, () => this.selectDefaultCharset());
            for (const e4 in o2.CHARSETS) this._parser.registerEscHandler({ intermediates: "(", final: e4 }, () => this.selectCharset("(" + e4)), this._parser.registerEscHandler({ intermediates: ")", final: e4 }, () => this.selectCharset(")" + e4)), this._parser.registerEscHandler({ intermediates: "*", final: e4 }, () => this.selectCharset("*" + e4)), this._parser.registerEscHandler({ intermediates: "+", final: e4 }, () => this.selectCharset("+" + e4)), this._parser.registerEscHandler({ intermediates: "-", final: e4 }, () => this.selectCharset("-" + e4)), this._parser.registerEscHandler({ intermediates: ".", final: e4 }, () => this.selectCharset("." + e4)), this._parser.registerEscHandler({ intermediates: "/", final: e4 }, () => this.selectCharset("/" + e4));
            this._parser.registerEscHandler({ intermediates: "#", final: "8" }, () => this.screenAlignmentPattern()), this._parser.setErrorHandler((e4) => (this._logService.error("Parsing error: ", e4), e4)), this._parser.registerDcsHandler({ intermediates: "$", final: "q" }, new g2.DcsHandler((e4, t4) => this.requestStatusString(e4, t4)));
          }
          _preserveStack(e3, t3, i3, s3) {
            this._parseStack.paused = true, this._parseStack.cursorStartX = e3, this._parseStack.cursorStartY = t3, this._parseStack.decodedLength = i3, this._parseStack.position = s3;
          }
          _logSlowResolvingAsync(e3) {
            this._logService.logLevel <= v2.LogLevelEnum.WARN && Promise.race([e3, new Promise((e4, t3) => setTimeout(() => t3("#SLOW_TIMEOUT"), 5e3))]).catch((e4) => {
              if ("#SLOW_TIMEOUT" !== e4) throw e4;
              console.warn("async parser handler taking longer than 5000 ms");
            });
          }
          _getCurrentLinkId() {
            return this._curAttrData.extended.urlId;
          }
          parse(e3, t3) {
            let i3, s3 = this._activeBuffer.x, r2 = this._activeBuffer.y, n2 = 0;
            const o3 = this._parseStack.paused;
            if (o3) {
              if (i3 = this._parser.parse(this._parseBuffer, this._parseStack.decodedLength, t3)) return this._logSlowResolvingAsync(i3), i3;
              s3 = this._parseStack.cursorStartX, r2 = this._parseStack.cursorStartY, this._parseStack.paused = false, e3.length > C && (n2 = this._parseStack.position + C);
            }
            if (this._logService.logLevel <= v2.LogLevelEnum.DEBUG && this._logService.debug("parsing data" + ("string" == typeof e3 ? ` "${e3}"` : ` "${Array.prototype.map.call(e3, (e4) => String.fromCharCode(e4)).join("")}"`), "string" == typeof e3 ? e3.split("").map((e4) => e4.charCodeAt(0)) : e3), this._parseBuffer.length < e3.length && this._parseBuffer.length < C && (this._parseBuffer = new Uint32Array(Math.min(e3.length, C))), o3 || this._dirtyRowTracker.clearRange(), e3.length > C) for (let t4 = n2; t4 < e3.length; t4 += C) {
              const n3 = t4 + C < e3.length ? t4 + C : e3.length, o4 = "string" == typeof e3 ? this._stringDecoder.decode(e3.substring(t4, n3), this._parseBuffer) : this._utf8Decoder.decode(e3.subarray(t4, n3), this._parseBuffer);
              if (i3 = this._parser.parse(this._parseBuffer, o4)) return this._preserveStack(s3, r2, o4, t4), this._logSlowResolvingAsync(i3), i3;
            }
            else if (!o3) {
              const t4 = "string" == typeof e3 ? this._stringDecoder.decode(e3, this._parseBuffer) : this._utf8Decoder.decode(e3, this._parseBuffer);
              if (i3 = this._parser.parse(this._parseBuffer, t4)) return this._preserveStack(s3, r2, t4, 0), this._logSlowResolvingAsync(i3), i3;
            }
            this._activeBuffer.x === s3 && this._activeBuffer.y === r2 || this._onCursorMove.fire(), this._onRequestRefreshRows.fire(this._dirtyRowTracker.start, this._dirtyRowTracker.end);
          }
          print(e3, t3, i3) {
            let s3, r2;
            const n2 = this._charsetService.charset, o3 = this._optionsService.rawOptions.screenReaderMode, a3 = this._bufferService.cols, h3 = this._coreService.decPrivateModes.wraparound, l3 = this._coreService.modes.insertMode, d2 = this._curAttrData;
            let u2 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._activeBuffer.x && i3 - t3 > 0 && 2 === u2.getWidth(this._activeBuffer.x - 1) && u2.setCellFromCodePoint(this._activeBuffer.x - 1, 0, 1, d2.fg, d2.bg, d2.extended);
            for (let f2 = t3; f2 < i3; ++f2) {
              if (s3 = e3[f2], r2 = this._unicodeService.wcwidth(s3), s3 < 127 && n2) {
                const e4 = n2[String.fromCharCode(s3)];
                e4 && (s3 = e4.charCodeAt(0));
              }
              if (o3 && this._onA11yChar.fire((0, c2.stringFromCodePoint)(s3)), this._getCurrentLinkId() && this._oscLinkService.addLineToLink(this._getCurrentLinkId(), this._activeBuffer.ybase + this._activeBuffer.y), r2 || !this._activeBuffer.x) {
                if (this._activeBuffer.x + r2 - 1 >= a3) {
                  if (h3) {
                    for (; this._activeBuffer.x < a3; ) u2.setCellFromCodePoint(this._activeBuffer.x++, 0, 1, d2.fg, d2.bg, d2.extended);
                    this._activeBuffer.x = 0, this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData(), true)) : (this._activeBuffer.y >= this._bufferService.rows && (this._activeBuffer.y = this._bufferService.rows - 1), this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = true), u2 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
                  } else if (this._activeBuffer.x = a3 - 1, 2 === r2) continue;
                }
                if (l3 && (u2.insertCells(this._activeBuffer.x, r2, this._activeBuffer.getNullCell(d2), d2), 2 === u2.getWidth(a3 - 1) && u2.setCellFromCodePoint(a3 - 1, _3.NULL_CELL_CODE, _3.NULL_CELL_WIDTH, d2.fg, d2.bg, d2.extended)), u2.setCellFromCodePoint(this._activeBuffer.x++, s3, r2, d2.fg, d2.bg, d2.extended), r2 > 0) for (; --r2; ) u2.setCellFromCodePoint(this._activeBuffer.x++, 0, 0, d2.fg, d2.bg, d2.extended);
              } else u2.getWidth(this._activeBuffer.x - 1) ? u2.addCodepointToCell(this._activeBuffer.x - 1, s3) : u2.addCodepointToCell(this._activeBuffer.x - 2, s3);
            }
            i3 - t3 > 0 && (u2.loadCell(this._activeBuffer.x - 1, this._workCell), 2 === this._workCell.getWidth() || this._workCell.getCode() > 65535 ? this._parser.precedingCodepoint = 0 : this._workCell.isCombined() ? this._parser.precedingCodepoint = this._workCell.getChars().charCodeAt(0) : this._parser.precedingCodepoint = this._workCell.content), this._activeBuffer.x < a3 && i3 - t3 > 0 && 0 === u2.getWidth(this._activeBuffer.x) && !u2.hasContent(this._activeBuffer.x) && u2.setCellFromCodePoint(this._activeBuffer.x, 0, 1, d2.fg, d2.bg, d2.extended), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
          }
          registerCsiHandler(e3, t3) {
            return "t" !== e3.final || e3.prefix || e3.intermediates ? this._parser.registerCsiHandler(e3, t3) : this._parser.registerCsiHandler(e3, (e4) => !b(e4.params[0], this._optionsService.rawOptions.windowOptions) || t3(e4));
          }
          registerDcsHandler(e3, t3) {
            return this._parser.registerDcsHandler(e3, new g2.DcsHandler(t3));
          }
          registerEscHandler(e3, t3) {
            return this._parser.registerEscHandler(e3, t3);
          }
          registerOscHandler(e3, t3) {
            return this._parser.registerOscHandler(e3, new p.OscHandler(t3));
          }
          bell() {
            return this._onRequestBell.fire(), true;
          }
          lineFeed() {
            return this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._optionsService.rawOptions.convertEol && (this._activeBuffer.x = 0), this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData())) : this._activeBuffer.y >= this._bufferService.rows ? this._activeBuffer.y = this._bufferService.rows - 1 : this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = false, this._activeBuffer.x >= this._bufferService.cols && this._activeBuffer.x--, this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._onLineFeed.fire(), true;
          }
          carriageReturn() {
            return this._activeBuffer.x = 0, true;
          }
          backspace() {
            var e3;
            if (!this._coreService.decPrivateModes.reverseWraparound) return this._restrictCursor(), this._activeBuffer.x > 0 && this._activeBuffer.x--, true;
            if (this._restrictCursor(this._bufferService.cols), this._activeBuffer.x > 0) this._activeBuffer.x--;
            else if (0 === this._activeBuffer.x && this._activeBuffer.y > this._activeBuffer.scrollTop && this._activeBuffer.y <= this._activeBuffer.scrollBottom && (null === (e3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y)) || void 0 === e3 ? void 0 : e3.isWrapped)) {
              this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = false, this._activeBuffer.y--, this._activeBuffer.x = this._bufferService.cols - 1;
              const e4 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
              e4.hasWidth(this._activeBuffer.x) && !e4.hasContent(this._activeBuffer.x) && this._activeBuffer.x--;
            }
            return this._restrictCursor(), true;
          }
          tab() {
            if (this._activeBuffer.x >= this._bufferService.cols) return true;
            const e3 = this._activeBuffer.x;
            return this._activeBuffer.x = this._activeBuffer.nextStop(), this._optionsService.rawOptions.screenReaderMode && this._onA11yTab.fire(this._activeBuffer.x - e3), true;
          }
          shiftOut() {
            return this._charsetService.setgLevel(1), true;
          }
          shiftIn() {
            return this._charsetService.setgLevel(0), true;
          }
          _restrictCursor(e3 = this._bufferService.cols - 1) {
            this._activeBuffer.x = Math.min(e3, Math.max(0, this._activeBuffer.x)), this._activeBuffer.y = this._coreService.decPrivateModes.origin ? Math.min(this._activeBuffer.scrollBottom, Math.max(this._activeBuffer.scrollTop, this._activeBuffer.y)) : Math.min(this._bufferService.rows - 1, Math.max(0, this._activeBuffer.y)), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
          }
          _setCursor(e3, t3) {
            this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._coreService.decPrivateModes.origin ? (this._activeBuffer.x = e3, this._activeBuffer.y = this._activeBuffer.scrollTop + t3) : (this._activeBuffer.x = e3, this._activeBuffer.y = t3), this._restrictCursor(), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
          }
          _moveCursor(e3, t3) {
            this._restrictCursor(), this._setCursor(this._activeBuffer.x + e3, this._activeBuffer.y + t3);
          }
          cursorUp(e3) {
            const t3 = this._activeBuffer.y - this._activeBuffer.scrollTop;
            return t3 >= 0 ? this._moveCursor(0, -Math.min(t3, e3.params[0] || 1)) : this._moveCursor(0, -(e3.params[0] || 1)), true;
          }
          cursorDown(e3) {
            const t3 = this._activeBuffer.scrollBottom - this._activeBuffer.y;
            return t3 >= 0 ? this._moveCursor(0, Math.min(t3, e3.params[0] || 1)) : this._moveCursor(0, e3.params[0] || 1), true;
          }
          cursorForward(e3) {
            return this._moveCursor(e3.params[0] || 1, 0), true;
          }
          cursorBackward(e3) {
            return this._moveCursor(-(e3.params[0] || 1), 0), true;
          }
          cursorNextLine(e3) {
            return this.cursorDown(e3), this._activeBuffer.x = 0, true;
          }
          cursorPrecedingLine(e3) {
            return this.cursorUp(e3), this._activeBuffer.x = 0, true;
          }
          cursorCharAbsolute(e3) {
            return this._setCursor((e3.params[0] || 1) - 1, this._activeBuffer.y), true;
          }
          cursorPosition(e3) {
            return this._setCursor(e3.length >= 2 ? (e3.params[1] || 1) - 1 : 0, (e3.params[0] || 1) - 1), true;
          }
          charPosAbsolute(e3) {
            return this._setCursor((e3.params[0] || 1) - 1, this._activeBuffer.y), true;
          }
          hPositionRelative(e3) {
            return this._moveCursor(e3.params[0] || 1, 0), true;
          }
          linePosAbsolute(e3) {
            return this._setCursor(this._activeBuffer.x, (e3.params[0] || 1) - 1), true;
          }
          vPositionRelative(e3) {
            return this._moveCursor(0, e3.params[0] || 1), true;
          }
          hVPosition(e3) {
            return this.cursorPosition(e3), true;
          }
          tabClear(e3) {
            const t3 = e3.params[0];
            return 0 === t3 ? delete this._activeBuffer.tabs[this._activeBuffer.x] : 3 === t3 && (this._activeBuffer.tabs = {}), true;
          }
          cursorForwardTab(e3) {
            if (this._activeBuffer.x >= this._bufferService.cols) return true;
            let t3 = e3.params[0] || 1;
            for (; t3--; ) this._activeBuffer.x = this._activeBuffer.nextStop();
            return true;
          }
          cursorBackwardTab(e3) {
            if (this._activeBuffer.x >= this._bufferService.cols) return true;
            let t3 = e3.params[0] || 1;
            for (; t3--; ) this._activeBuffer.x = this._activeBuffer.prevStop();
            return true;
          }
          selectProtected(e3) {
            const t3 = e3.params[0];
            return 1 === t3 && (this._curAttrData.bg |= 536870912), 2 !== t3 && 0 !== t3 || (this._curAttrData.bg &= -536870913), true;
          }
          _eraseInBufferLine(e3, t3, i3, s3 = false, r2 = false) {
            const n2 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e3);
            n2.replaceCells(t3, i3, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData(), r2), s3 && (n2.isWrapped = false);
          }
          _resetBufferLine(e3, t3 = false) {
            const i3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e3);
            i3 && (i3.fill(this._activeBuffer.getNullCell(this._eraseAttrData()), t3), this._bufferService.buffer.clearMarkers(this._activeBuffer.ybase + e3), i3.isWrapped = false);
          }
          eraseInDisplay(e3, t3 = false) {
            let i3;
            switch (this._restrictCursor(this._bufferService.cols), e3.params[0]) {
              case 0:
                for (i3 = this._activeBuffer.y, this._dirtyRowTracker.markDirty(i3), this._eraseInBufferLine(i3++, this._activeBuffer.x, this._bufferService.cols, 0 === this._activeBuffer.x, t3); i3 < this._bufferService.rows; i3++) this._resetBufferLine(i3, t3);
                this._dirtyRowTracker.markDirty(i3);
                break;
              case 1:
                for (i3 = this._activeBuffer.y, this._dirtyRowTracker.markDirty(i3), this._eraseInBufferLine(i3, 0, this._activeBuffer.x + 1, true, t3), this._activeBuffer.x + 1 >= this._bufferService.cols && (this._activeBuffer.lines.get(i3 + 1).isWrapped = false); i3--; ) this._resetBufferLine(i3, t3);
                this._dirtyRowTracker.markDirty(0);
                break;
              case 2:
                for (i3 = this._bufferService.rows, this._dirtyRowTracker.markDirty(i3 - 1); i3--; ) this._resetBufferLine(i3, t3);
                this._dirtyRowTracker.markDirty(0);
                break;
              case 3:
                const e4 = this._activeBuffer.lines.length - this._bufferService.rows;
                e4 > 0 && (this._activeBuffer.lines.trimStart(e4), this._activeBuffer.ybase = Math.max(this._activeBuffer.ybase - e4, 0), this._activeBuffer.ydisp = Math.max(this._activeBuffer.ydisp - e4, 0), this._onScroll.fire(0));
            }
            return true;
          }
          eraseInLine(e3, t3 = false) {
            switch (this._restrictCursor(this._bufferService.cols), e3.params[0]) {
              case 0:
                this._eraseInBufferLine(this._activeBuffer.y, this._activeBuffer.x, this._bufferService.cols, 0 === this._activeBuffer.x, t3);
                break;
              case 1:
                this._eraseInBufferLine(this._activeBuffer.y, 0, this._activeBuffer.x + 1, false, t3);
                break;
              case 2:
                this._eraseInBufferLine(this._activeBuffer.y, 0, this._bufferService.cols, true, t3);
            }
            return this._dirtyRowTracker.markDirty(this._activeBuffer.y), true;
          }
          insertLines(e3) {
            this._restrictCursor();
            let t3 = e3.params[0] || 1;
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const i3 = this._activeBuffer.ybase + this._activeBuffer.y, s3 = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom, r2 = this._bufferService.rows - 1 + this._activeBuffer.ybase - s3 + 1;
            for (; t3--; ) this._activeBuffer.lines.splice(r2 - 1, 1), this._activeBuffer.lines.splice(i3, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom), this._activeBuffer.x = 0, true;
          }
          deleteLines(e3) {
            this._restrictCursor();
            let t3 = e3.params[0] || 1;
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const i3 = this._activeBuffer.ybase + this._activeBuffer.y;
            let s3;
            for (s3 = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom, s3 = this._bufferService.rows - 1 + this._activeBuffer.ybase - s3; t3--; ) this._activeBuffer.lines.splice(i3, 1), this._activeBuffer.lines.splice(s3, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom), this._activeBuffer.x = 0, true;
          }
          insertChars(e3) {
            this._restrictCursor();
            const t3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            return t3 && (t3.insertCells(this._activeBuffer.x, e3.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), true;
          }
          deleteChars(e3) {
            this._restrictCursor();
            const t3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            return t3 && (t3.deleteCells(this._activeBuffer.x, e3.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), true;
          }
          scrollUp(e3) {
            let t3 = e3.params[0] || 1;
            for (; t3--; ) this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 1), this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          scrollDown(e3) {
            let t3 = e3.params[0] || 1;
            for (; t3--; ) this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 1), this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 0, this._activeBuffer.getBlankLine(l2.DEFAULT_ATTR_DATA));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          scrollLeft(e3) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const t3 = e3.params[0] || 1;
            for (let e4 = this._activeBuffer.scrollTop; e4 <= this._activeBuffer.scrollBottom; ++e4) {
              const i3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e4);
              i3.deleteCells(0, t3, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), i3.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          scrollRight(e3) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const t3 = e3.params[0] || 1;
            for (let e4 = this._activeBuffer.scrollTop; e4 <= this._activeBuffer.scrollBottom; ++e4) {
              const i3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e4);
              i3.insertCells(0, t3, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), i3.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          insertColumns(e3) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const t3 = e3.params[0] || 1;
            for (let e4 = this._activeBuffer.scrollTop; e4 <= this._activeBuffer.scrollBottom; ++e4) {
              const i3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e4);
              i3.insertCells(this._activeBuffer.x, t3, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), i3.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          deleteColumns(e3) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const t3 = e3.params[0] || 1;
            for (let e4 = this._activeBuffer.scrollTop; e4 <= this._activeBuffer.scrollBottom; ++e4) {
              const i3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e4);
              i3.deleteCells(this._activeBuffer.x, t3, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), i3.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          eraseChars(e3) {
            this._restrictCursor();
            const t3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            return t3 && (t3.replaceCells(this._activeBuffer.x, this._activeBuffer.x + (e3.params[0] || 1), this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), true;
          }
          repeatPrecedingCharacter(e3) {
            if (!this._parser.precedingCodepoint) return true;
            const t3 = e3.params[0] || 1, i3 = new Uint32Array(t3);
            for (let e4 = 0; e4 < t3; ++e4) i3[e4] = this._parser.precedingCodepoint;
            return this.print(i3, 0, i3.length), true;
          }
          sendDeviceAttributesPrimary(e3) {
            return e3.params[0] > 0 || (this._is("xterm") || this._is("rxvt-unicode") || this._is("screen") ? this._coreService.triggerDataEvent(n.C0.ESC + "[?1;2c") : this._is("linux") && this._coreService.triggerDataEvent(n.C0.ESC + "[?6c")), true;
          }
          sendDeviceAttributesSecondary(e3) {
            return e3.params[0] > 0 || (this._is("xterm") ? this._coreService.triggerDataEvent(n.C0.ESC + "[>0;276;0c") : this._is("rxvt-unicode") ? this._coreService.triggerDataEvent(n.C0.ESC + "[>85;95;0c") : this._is("linux") ? this._coreService.triggerDataEvent(e3.params[0] + "c") : this._is("screen") && this._coreService.triggerDataEvent(n.C0.ESC + "[>83;40003;0c")), true;
          }
          _is(e3) {
            return 0 === (this._optionsService.rawOptions.termName + "").indexOf(e3);
          }
          setMode(e3) {
            for (let t3 = 0; t3 < e3.length; t3++) switch (e3.params[t3]) {
              case 4:
                this._coreService.modes.insertMode = true;
                break;
              case 20:
                this._optionsService.options.convertEol = true;
            }
            return true;
          }
          setModePrivate(e3) {
            for (let t3 = 0; t3 < e3.length; t3++) switch (e3.params[t3]) {
              case 1:
                this._coreService.decPrivateModes.applicationCursorKeys = true;
                break;
              case 2:
                this._charsetService.setgCharset(0, o2.DEFAULT_CHARSET), this._charsetService.setgCharset(1, o2.DEFAULT_CHARSET), this._charsetService.setgCharset(2, o2.DEFAULT_CHARSET), this._charsetService.setgCharset(3, o2.DEFAULT_CHARSET);
                break;
              case 3:
                this._optionsService.rawOptions.windowOptions.setWinLines && (this._bufferService.resize(132, this._bufferService.rows), this._onRequestReset.fire());
                break;
              case 6:
                this._coreService.decPrivateModes.origin = true, this._setCursor(0, 0);
                break;
              case 7:
                this._coreService.decPrivateModes.wraparound = true;
                break;
              case 12:
                this._optionsService.options.cursorBlink = true;
                break;
              case 45:
                this._coreService.decPrivateModes.reverseWraparound = true;
                break;
              case 66:
                this._logService.debug("Serial port requested application keypad."), this._coreService.decPrivateModes.applicationKeypad = true, this._onRequestSyncScrollBar.fire();
                break;
              case 9:
                this._coreMouseService.activeProtocol = "X10";
                break;
              case 1e3:
                this._coreMouseService.activeProtocol = "VT200";
                break;
              case 1002:
                this._coreMouseService.activeProtocol = "DRAG";
                break;
              case 1003:
                this._coreMouseService.activeProtocol = "ANY";
                break;
              case 1004:
                this._coreService.decPrivateModes.sendFocus = true, this._onRequestSendFocus.fire();
                break;
              case 1005:
                this._logService.debug("DECSET 1005 not supported (see #2507)");
                break;
              case 1006:
                this._coreMouseService.activeEncoding = "SGR";
                break;
              case 1015:
                this._logService.debug("DECSET 1015 not supported (see #2507)");
                break;
              case 1016:
                this._coreMouseService.activeEncoding = "SGR_PIXELS";
                break;
              case 25:
                this._coreService.isCursorHidden = false;
                break;
              case 1048:
                this.saveCursor();
                break;
              case 1049:
                this.saveCursor();
              case 47:
              case 1047:
                this._bufferService.buffers.activateAltBuffer(this._eraseAttrData()), this._coreService.isCursorInitialized = true, this._onRequestRefreshRows.fire(0, this._bufferService.rows - 1), this._onRequestSyncScrollBar.fire();
                break;
              case 2004:
                this._coreService.decPrivateModes.bracketedPasteMode = true;
            }
            return true;
          }
          resetMode(e3) {
            for (let t3 = 0; t3 < e3.length; t3++) switch (e3.params[t3]) {
              case 4:
                this._coreService.modes.insertMode = false;
                break;
              case 20:
                this._optionsService.options.convertEol = false;
            }
            return true;
          }
          resetModePrivate(e3) {
            for (let t3 = 0; t3 < e3.length; t3++) switch (e3.params[t3]) {
              case 1:
                this._coreService.decPrivateModes.applicationCursorKeys = false;
                break;
              case 3:
                this._optionsService.rawOptions.windowOptions.setWinLines && (this._bufferService.resize(80, this._bufferService.rows), this._onRequestReset.fire());
                break;
              case 6:
                this._coreService.decPrivateModes.origin = false, this._setCursor(0, 0);
                break;
              case 7:
                this._coreService.decPrivateModes.wraparound = false;
                break;
              case 12:
                this._optionsService.options.cursorBlink = false;
                break;
              case 45:
                this._coreService.decPrivateModes.reverseWraparound = false;
                break;
              case 66:
                this._logService.debug("Switching back to normal keypad."), this._coreService.decPrivateModes.applicationKeypad = false, this._onRequestSyncScrollBar.fire();
                break;
              case 9:
              case 1e3:
              case 1002:
              case 1003:
                this._coreMouseService.activeProtocol = "NONE";
                break;
              case 1004:
                this._coreService.decPrivateModes.sendFocus = false;
                break;
              case 1005:
                this._logService.debug("DECRST 1005 not supported (see #2507)");
                break;
              case 1006:
              case 1016:
                this._coreMouseService.activeEncoding = "DEFAULT";
                break;
              case 1015:
                this._logService.debug("DECRST 1015 not supported (see #2507)");
                break;
              case 25:
                this._coreService.isCursorHidden = true;
                break;
              case 1048:
                this.restoreCursor();
                break;
              case 1049:
              case 47:
              case 1047:
                this._bufferService.buffers.activateNormalBuffer(), 1049 === e3.params[t3] && this.restoreCursor(), this._coreService.isCursorInitialized = true, this._onRequestRefreshRows.fire(0, this._bufferService.rows - 1), this._onRequestSyncScrollBar.fire();
                break;
              case 2004:
                this._coreService.decPrivateModes.bracketedPasteMode = false;
            }
            return true;
          }
          requestMode(e3, t3) {
            const i3 = this._coreService.decPrivateModes, { activeProtocol: s3, activeEncoding: r2 } = this._coreMouseService, o3 = this._coreService, { buffers: a3, cols: h3 } = this._bufferService, { active: c3, alt: l3 } = a3, d2 = this._optionsService.rawOptions, _4 = (e4) => e4 ? 1 : 2, u2 = e3.params[0];
            return f2 = u2, v3 = t3 ? 2 === u2 ? 4 : 4 === u2 ? _4(o3.modes.insertMode) : 12 === u2 ? 3 : 20 === u2 ? _4(d2.convertEol) : 0 : 1 === u2 ? _4(i3.applicationCursorKeys) : 3 === u2 ? d2.windowOptions.setWinLines ? 80 === h3 ? 2 : 132 === h3 ? 1 : 0 : 0 : 6 === u2 ? _4(i3.origin) : 7 === u2 ? _4(i3.wraparound) : 8 === u2 ? 3 : 9 === u2 ? _4("X10" === s3) : 12 === u2 ? _4(d2.cursorBlink) : 25 === u2 ? _4(!o3.isCursorHidden) : 45 === u2 ? _4(i3.reverseWraparound) : 66 === u2 ? _4(i3.applicationKeypad) : 67 === u2 ? 4 : 1e3 === u2 ? _4("VT200" === s3) : 1002 === u2 ? _4("DRAG" === s3) : 1003 === u2 ? _4("ANY" === s3) : 1004 === u2 ? _4(i3.sendFocus) : 1005 === u2 ? 4 : 1006 === u2 ? _4("SGR" === r2) : 1015 === u2 ? 4 : 1016 === u2 ? _4("SGR_PIXELS" === r2) : 1048 === u2 ? 1 : 47 === u2 || 1047 === u2 || 1049 === u2 ? _4(c3 === l3) : 2004 === u2 ? _4(i3.bracketedPasteMode) : 0, o3.triggerDataEvent(`${n.C0.ESC}[${t3 ? "" : "?"}${f2};${v3}$y`), true;
            var f2, v3;
          }
          _updateAttrColor(e3, t3, i3, s3, r2) {
            return 2 === t3 ? (e3 |= 50331648, e3 &= -16777216, e3 |= f.AttributeData.fromColorRGB([i3, s3, r2])) : 5 === t3 && (e3 &= -50331904, e3 |= 33554432 | 255 & i3), e3;
          }
          _extractColor(e3, t3, i3) {
            const s3 = [0, 0, -1, 0, 0, 0];
            let r2 = 0, n2 = 0;
            do {
              if (s3[n2 + r2] = e3.params[t3 + n2], e3.hasSubParams(t3 + n2)) {
                const i4 = e3.getSubParams(t3 + n2);
                let o3 = 0;
                do {
                  5 === s3[1] && (r2 = 1), s3[n2 + o3 + 1 + r2] = i4[o3];
                } while (++o3 < i4.length && o3 + n2 + 1 + r2 < s3.length);
                break;
              }
              if (5 === s3[1] && n2 + r2 >= 2 || 2 === s3[1] && n2 + r2 >= 5) break;
              s3[1] && (r2 = 1);
            } while (++n2 + t3 < e3.length && n2 + r2 < s3.length);
            for (let e4 = 2; e4 < s3.length; ++e4) -1 === s3[e4] && (s3[e4] = 0);
            switch (s3[0]) {
              case 38:
                i3.fg = this._updateAttrColor(i3.fg, s3[1], s3[3], s3[4], s3[5]);
                break;
              case 48:
                i3.bg = this._updateAttrColor(i3.bg, s3[1], s3[3], s3[4], s3[5]);
                break;
              case 58:
                i3.extended = i3.extended.clone(), i3.extended.underlineColor = this._updateAttrColor(i3.extended.underlineColor, s3[1], s3[3], s3[4], s3[5]);
            }
            return n2;
          }
          _processUnderline(e3, t3) {
            t3.extended = t3.extended.clone(), (!~e3 || e3 > 5) && (e3 = 1), t3.extended.underlineStyle = e3, t3.fg |= 268435456, 0 === e3 && (t3.fg &= -268435457), t3.updateExtended();
          }
          _processSGR0(e3) {
            e3.fg = l2.DEFAULT_ATTR_DATA.fg, e3.bg = l2.DEFAULT_ATTR_DATA.bg, e3.extended = e3.extended.clone(), e3.extended.underlineStyle = 0, e3.extended.underlineColor &= -67108864, e3.updateExtended();
          }
          charAttributes(e3) {
            if (1 === e3.length && 0 === e3.params[0]) return this._processSGR0(this._curAttrData), true;
            const t3 = e3.length;
            let i3;
            const s3 = this._curAttrData;
            for (let r2 = 0; r2 < t3; r2++) i3 = e3.params[r2], i3 >= 30 && i3 <= 37 ? (s3.fg &= -50331904, s3.fg |= 16777216 | i3 - 30) : i3 >= 40 && i3 <= 47 ? (s3.bg &= -50331904, s3.bg |= 16777216 | i3 - 40) : i3 >= 90 && i3 <= 97 ? (s3.fg &= -50331904, s3.fg |= 16777224 | i3 - 90) : i3 >= 100 && i3 <= 107 ? (s3.bg &= -50331904, s3.bg |= 16777224 | i3 - 100) : 0 === i3 ? this._processSGR0(s3) : 1 === i3 ? s3.fg |= 134217728 : 3 === i3 ? s3.bg |= 67108864 : 4 === i3 ? (s3.fg |= 268435456, this._processUnderline(e3.hasSubParams(r2) ? e3.getSubParams(r2)[0] : 1, s3)) : 5 === i3 ? s3.fg |= 536870912 : 7 === i3 ? s3.fg |= 67108864 : 8 === i3 ? s3.fg |= 1073741824 : 9 === i3 ? s3.fg |= 2147483648 : 2 === i3 ? s3.bg |= 134217728 : 21 === i3 ? this._processUnderline(2, s3) : 22 === i3 ? (s3.fg &= -134217729, s3.bg &= -134217729) : 23 === i3 ? s3.bg &= -67108865 : 24 === i3 ? (s3.fg &= -268435457, this._processUnderline(0, s3)) : 25 === i3 ? s3.fg &= -536870913 : 27 === i3 ? s3.fg &= -67108865 : 28 === i3 ? s3.fg &= -1073741825 : 29 === i3 ? s3.fg &= 2147483647 : 39 === i3 ? (s3.fg &= -67108864, s3.fg |= 16777215 & l2.DEFAULT_ATTR_DATA.fg) : 49 === i3 ? (s3.bg &= -67108864, s3.bg |= 16777215 & l2.DEFAULT_ATTR_DATA.bg) : 38 === i3 || 48 === i3 || 58 === i3 ? r2 += this._extractColor(e3, r2, s3) : 53 === i3 ? s3.bg |= 1073741824 : 55 === i3 ? s3.bg &= -1073741825 : 59 === i3 ? (s3.extended = s3.extended.clone(), s3.extended.underlineColor = -1, s3.updateExtended()) : 100 === i3 ? (s3.fg &= -67108864, s3.fg |= 16777215 & l2.DEFAULT_ATTR_DATA.fg, s3.bg &= -67108864, s3.bg |= 16777215 & l2.DEFAULT_ATTR_DATA.bg) : this._logService.debug("Unknown SGR attribute: %d.", i3);
            return true;
          }
          deviceStatus(e3) {
            switch (e3.params[0]) {
              case 5:
                this._coreService.triggerDataEvent(`${n.C0.ESC}[0n`);
                break;
              case 6:
                const e4 = this._activeBuffer.y + 1, t3 = this._activeBuffer.x + 1;
                this._coreService.triggerDataEvent(`${n.C0.ESC}[${e4};${t3}R`);
            }
            return true;
          }
          deviceStatusPrivate(e3) {
            if (6 === e3.params[0]) {
              const e4 = this._activeBuffer.y + 1, t3 = this._activeBuffer.x + 1;
              this._coreService.triggerDataEvent(`${n.C0.ESC}[?${e4};${t3}R`);
            }
            return true;
          }
          softReset(e3) {
            return this._coreService.isCursorHidden = false, this._onRequestSyncScrollBar.fire(), this._activeBuffer.scrollTop = 0, this._activeBuffer.scrollBottom = this._bufferService.rows - 1, this._curAttrData = l2.DEFAULT_ATTR_DATA.clone(), this._coreService.reset(), this._charsetService.reset(), this._activeBuffer.savedX = 0, this._activeBuffer.savedY = this._activeBuffer.ybase, this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg, this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg, this._activeBuffer.savedCharset = this._charsetService.charset, this._coreService.decPrivateModes.origin = false, true;
          }
          setCursorStyle(e3) {
            const t3 = e3.params[0] || 1;
            switch (t3) {
              case 1:
              case 2:
                this._optionsService.options.cursorStyle = "block";
                break;
              case 3:
              case 4:
                this._optionsService.options.cursorStyle = "underline";
                break;
              case 5:
              case 6:
                this._optionsService.options.cursorStyle = "bar";
            }
            const i3 = t3 % 2 == 1;
            return this._optionsService.options.cursorBlink = i3, true;
          }
          setScrollRegion(e3) {
            const t3 = e3.params[0] || 1;
            let i3;
            return (e3.length < 2 || (i3 = e3.params[1]) > this._bufferService.rows || 0 === i3) && (i3 = this._bufferService.rows), i3 > t3 && (this._activeBuffer.scrollTop = t3 - 1, this._activeBuffer.scrollBottom = i3 - 1, this._setCursor(0, 0)), true;
          }
          windowOptions(e3) {
            if (!b(e3.params[0], this._optionsService.rawOptions.windowOptions)) return true;
            const t3 = e3.length > 1 ? e3.params[1] : 0;
            switch (e3.params[0]) {
              case 14:
                2 !== t3 && this._onRequestWindowsOptionsReport.fire(y3.GET_WIN_SIZE_PIXELS);
                break;
              case 16:
                this._onRequestWindowsOptionsReport.fire(y3.GET_CELL_SIZE_PIXELS);
                break;
              case 18:
                this._bufferService && this._coreService.triggerDataEvent(`${n.C0.ESC}[8;${this._bufferService.rows};${this._bufferService.cols}t`);
                break;
              case 22:
                0 !== t3 && 2 !== t3 || (this._windowTitleStack.push(this._windowTitle), this._windowTitleStack.length > 10 && this._windowTitleStack.shift()), 0 !== t3 && 1 !== t3 || (this._iconNameStack.push(this._iconName), this._iconNameStack.length > 10 && this._iconNameStack.shift());
                break;
              case 23:
                0 !== t3 && 2 !== t3 || this._windowTitleStack.length && this.setTitle(this._windowTitleStack.pop()), 0 !== t3 && 1 !== t3 || this._iconNameStack.length && this.setIconName(this._iconNameStack.pop());
            }
            return true;
          }
          saveCursor(e3) {
            return this._activeBuffer.savedX = this._activeBuffer.x, this._activeBuffer.savedY = this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg, this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg, this._activeBuffer.savedCharset = this._charsetService.charset, true;
          }
          restoreCursor(e3) {
            return this._activeBuffer.x = this._activeBuffer.savedX || 0, this._activeBuffer.y = Math.max(this._activeBuffer.savedY - this._activeBuffer.ybase, 0), this._curAttrData.fg = this._activeBuffer.savedCurAttrData.fg, this._curAttrData.bg = this._activeBuffer.savedCurAttrData.bg, this._charsetService.charset = this._savedCharset, this._activeBuffer.savedCharset && (this._charsetService.charset = this._activeBuffer.savedCharset), this._restrictCursor(), true;
          }
          setTitle(e3) {
            return this._windowTitle = e3, this._onTitleChange.fire(e3), true;
          }
          setIconName(e3) {
            return this._iconName = e3, true;
          }
          setOrReportIndexedColor(e3) {
            const t3 = [], i3 = e3.split(";");
            for (; i3.length > 1; ) {
              const e4 = i3.shift(), s3 = i3.shift();
              if (/^\d+$/.exec(e4)) {
                const i4 = parseInt(e4);
                if (L2(i4)) if ("?" === s3) t3.push({ type: 0, index: i4 });
                else {
                  const e5 = (0, m2.parseColor)(s3);
                  e5 && t3.push({ type: 1, index: i4, color: e5 });
                }
              }
            }
            return t3.length && this._onColor.fire(t3), true;
          }
          setHyperlink(e3) {
            const t3 = e3.split(";");
            return !(t3.length < 2) && (t3[1] ? this._createHyperlink(t3[0], t3[1]) : !t3[0] && this._finishHyperlink());
          }
          _createHyperlink(e3, t3) {
            this._getCurrentLinkId() && this._finishHyperlink();
            const i3 = e3.split(":");
            let s3;
            const r2 = i3.findIndex((e4) => e4.startsWith("id="));
            return -1 !== r2 && (s3 = i3[r2].slice(3) || void 0), this._curAttrData.extended = this._curAttrData.extended.clone(), this._curAttrData.extended.urlId = this._oscLinkService.registerLink({ id: s3, uri: t3 }), this._curAttrData.updateExtended(), true;
          }
          _finishHyperlink() {
            return this._curAttrData.extended = this._curAttrData.extended.clone(), this._curAttrData.extended.urlId = 0, this._curAttrData.updateExtended(), true;
          }
          _setOrReportSpecialColor(e3, t3) {
            const i3 = e3.split(";");
            for (let e4 = 0; e4 < i3.length && !(t3 >= this._specialColors.length); ++e4, ++t3) if ("?" === i3[e4]) this._onColor.fire([{ type: 0, index: this._specialColors[t3] }]);
            else {
              const s3 = (0, m2.parseColor)(i3[e4]);
              s3 && this._onColor.fire([{ type: 1, index: this._specialColors[t3], color: s3 }]);
            }
            return true;
          }
          setOrReportFgColor(e3) {
            return this._setOrReportSpecialColor(e3, 0);
          }
          setOrReportBgColor(e3) {
            return this._setOrReportSpecialColor(e3, 1);
          }
          setOrReportCursorColor(e3) {
            return this._setOrReportSpecialColor(e3, 2);
          }
          restoreIndexedColor(e3) {
            if (!e3) return this._onColor.fire([{ type: 2 }]), true;
            const t3 = [], i3 = e3.split(";");
            for (let e4 = 0; e4 < i3.length; ++e4) if (/^\d+$/.exec(i3[e4])) {
              const s3 = parseInt(i3[e4]);
              L2(s3) && t3.push({ type: 2, index: s3 });
            }
            return t3.length && this._onColor.fire(t3), true;
          }
          restoreFgColor(e3) {
            return this._onColor.fire([{ type: 2, index: 256 }]), true;
          }
          restoreBgColor(e3) {
            return this._onColor.fire([{ type: 2, index: 257 }]), true;
          }
          restoreCursorColor(e3) {
            return this._onColor.fire([{ type: 2, index: 258 }]), true;
          }
          nextLine() {
            return this._activeBuffer.x = 0, this.index(), true;
          }
          keypadApplicationMode() {
            return this._logService.debug("Serial port requested application keypad."), this._coreService.decPrivateModes.applicationKeypad = true, this._onRequestSyncScrollBar.fire(), true;
          }
          keypadNumericMode() {
            return this._logService.debug("Switching back to normal keypad."), this._coreService.decPrivateModes.applicationKeypad = false, this._onRequestSyncScrollBar.fire(), true;
          }
          selectDefaultCharset() {
            return this._charsetService.setgLevel(0), this._charsetService.setgCharset(0, o2.DEFAULT_CHARSET), true;
          }
          selectCharset(e3) {
            return 2 !== e3.length ? (this.selectDefaultCharset(), true) : ("/" === e3[0] || this._charsetService.setgCharset(S[e3[0]], o2.CHARSETS[e3[1]] || o2.DEFAULT_CHARSET), true);
          }
          index() {
            return this._restrictCursor(), this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData())) : this._activeBuffer.y >= this._bufferService.rows && (this._activeBuffer.y = this._bufferService.rows - 1), this._restrictCursor(), true;
          }
          tabSet() {
            return this._activeBuffer.tabs[this._activeBuffer.x] = true, true;
          }
          reverseIndex() {
            if (this._restrictCursor(), this._activeBuffer.y === this._activeBuffer.scrollTop) {
              const e3 = this._activeBuffer.scrollBottom - this._activeBuffer.scrollTop;
              this._activeBuffer.lines.shiftElements(this._activeBuffer.ybase + this._activeBuffer.y, e3, 1), this._activeBuffer.lines.set(this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.getBlankLine(this._eraseAttrData())), this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
            } else this._activeBuffer.y--, this._restrictCursor();
            return true;
          }
          fullReset() {
            return this._parser.reset(), this._onRequestReset.fire(), true;
          }
          reset() {
            this._curAttrData = l2.DEFAULT_ATTR_DATA.clone(), this._eraseAttrDataInternal = l2.DEFAULT_ATTR_DATA.clone();
          }
          _eraseAttrData() {
            return this._eraseAttrDataInternal.bg &= -67108864, this._eraseAttrDataInternal.bg |= 67108863 & this._curAttrData.bg, this._eraseAttrDataInternal;
          }
          setgLevel(e3) {
            return this._charsetService.setgLevel(e3), true;
          }
          screenAlignmentPattern() {
            const e3 = new u.CellData();
            e3.content = 1 << 22 | "E".charCodeAt(0), e3.fg = this._curAttrData.fg, e3.bg = this._curAttrData.bg, this._setCursor(0, 0);
            for (let t3 = 0; t3 < this._bufferService.rows; ++t3) {
              const i3 = this._activeBuffer.ybase + this._activeBuffer.y + t3, s3 = this._activeBuffer.lines.get(i3);
              s3 && (s3.fill(e3), s3.isWrapped = false);
            }
            return this._dirtyRowTracker.markAllDirty(), this._setCursor(0, 0), true;
          }
          requestStatusString(e3, t3) {
            const i3 = this._bufferService.buffer, s3 = this._optionsService.rawOptions;
            return ((e4) => (this._coreService.triggerDataEvent(`${n.C0.ESC}${e4}${n.C0.ESC}\\`), true))('"q' === e3 ? `P1$r${this._curAttrData.isProtected() ? 1 : 0}"q` : '"p' === e3 ? 'P1$r61;1"p' : "r" === e3 ? `P1$r${i3.scrollTop + 1};${i3.scrollBottom + 1}r` : "m" === e3 ? "P1$r0m" : " q" === e3 ? `P1$r${{ block: 2, underline: 4, bar: 6 }[s3.cursorStyle] - (s3.cursorBlink ? 1 : 0)} q` : "P0$r");
          }
          markRangeDirty(e3, t3) {
            this._dirtyRowTracker.markRangeDirty(e3, t3);
          }
        }
        t2.InputHandler = E;
        let k2 = class {
          constructor(e3) {
            this._bufferService = e3, this.clearRange();
          }
          clearRange() {
            this.start = this._bufferService.buffer.y, this.end = this._bufferService.buffer.y;
          }
          markDirty(e3) {
            e3 < this.start ? this.start = e3 : e3 > this.end && (this.end = e3);
          }
          markRangeDirty(e3, t3) {
            e3 > t3 && (w2 = e3, e3 = t3, t3 = w2), e3 < this.start && (this.start = e3), t3 > this.end && (this.end = t3);
          }
          markAllDirty() {
            this.markRangeDirty(0, this._bufferService.rows - 1);
          }
        };
        function L2(e3) {
          return 0 <= e3 && e3 < 256;
        }
        k2 = s2([r(0, v2.IBufferService)], k2);
      }, 844: (e2, t2) => {
        function i2(e3) {
          for (const t3 of e3) t3.dispose();
          e3.length = 0;
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.getDisposeArrayDisposable = t2.disposeArray = t2.toDisposable = t2.MutableDisposable = t2.Disposable = void 0, t2.Disposable = class {
          constructor() {
            this._disposables = [], this._isDisposed = false;
          }
          dispose() {
            this._isDisposed = true;
            for (const e3 of this._disposables) e3.dispose();
            this._disposables.length = 0;
          }
          register(e3) {
            return this._disposables.push(e3), e3;
          }
          unregister(e3) {
            const t3 = this._disposables.indexOf(e3);
            -1 !== t3 && this._disposables.splice(t3, 1);
          }
        }, t2.MutableDisposable = class {
          constructor() {
            this._isDisposed = false;
          }
          get value() {
            return this._isDisposed ? void 0 : this._value;
          }
          set value(e3) {
            var t3;
            this._isDisposed || e3 === this._value || (null === (t3 = this._value) || void 0 === t3 || t3.dispose(), this._value = e3);
          }
          clear() {
            this.value = void 0;
          }
          dispose() {
            var e3;
            this._isDisposed = true, null === (e3 = this._value) || void 0 === e3 || e3.dispose(), this._value = void 0;
          }
        }, t2.toDisposable = function(e3) {
          return { dispose: e3 };
        }, t2.disposeArray = i2, t2.getDisposeArrayDisposable = function(e3) {
          return { dispose: () => i2(e3) };
        };
      }, 1505: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.FourKeyMap = t2.TwoKeyMap = void 0;
        class i2 {
          constructor() {
            this._data = {};
          }
          set(e3, t3, i3) {
            this._data[e3] || (this._data[e3] = {}), this._data[e3][t3] = i3;
          }
          get(e3, t3) {
            return this._data[e3] ? this._data[e3][t3] : void 0;
          }
          clear() {
            this._data = {};
          }
        }
        t2.TwoKeyMap = i2, t2.FourKeyMap = class {
          constructor() {
            this._data = new i2();
          }
          set(e3, t3, s2, r, n) {
            this._data.get(e3, t3) || this._data.set(e3, t3, new i2()), this._data.get(e3, t3).set(s2, r, n);
          }
          get(e3, t3, i3, s2) {
            var r;
            return null === (r = this._data.get(e3, t3)) || void 0 === r ? void 0 : r.get(i3, s2);
          }
          clear() {
            this._data.clear();
          }
        };
      }, 6114: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.isChromeOS = t2.isLinux = t2.isWindows = t2.isIphone = t2.isIpad = t2.isMac = t2.getSafariVersion = t2.isSafari = t2.isLegacyEdge = t2.isFirefox = t2.isNode = void 0, t2.isNode = "undefined" == typeof navigator;
        const i2 = t2.isNode ? "node" : navigator.userAgent, s2 = t2.isNode ? "node" : navigator.platform;
        t2.isFirefox = i2.includes("Firefox"), t2.isLegacyEdge = i2.includes("Edge"), t2.isSafari = /^((?!chrome|android).)*safari/i.test(i2), t2.getSafariVersion = function() {
          if (!t2.isSafari) return 0;
          const e3 = i2.match(/Version\/(\d+)/);
          return null === e3 || e3.length < 2 ? 0 : parseInt(e3[1]);
        }, t2.isMac = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"].includes(s2), t2.isIpad = "iPad" === s2, t2.isIphone = "iPhone" === s2, t2.isWindows = ["Windows", "Win16", "Win32", "WinCE"].includes(s2), t2.isLinux = s2.indexOf("Linux") >= 0, t2.isChromeOS = /\bCrOS\b/.test(i2);
      }, 6106: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.SortedList = void 0;
        let i2 = 0;
        t2.SortedList = class {
          constructor(e3) {
            this._getKey = e3, this._array = [];
          }
          clear() {
            this._array.length = 0;
          }
          insert(e3) {
            0 !== this._array.length ? (i2 = this._search(this._getKey(e3)), this._array.splice(i2, 0, e3)) : this._array.push(e3);
          }
          delete(e3) {
            if (0 === this._array.length) return false;
            const t3 = this._getKey(e3);
            if (void 0 === t3) return false;
            if (i2 = this._search(t3), -1 === i2) return false;
            if (this._getKey(this._array[i2]) !== t3) return false;
            do {
              if (this._array[i2] === e3) return this._array.splice(i2, 1), true;
            } while (++i2 < this._array.length && this._getKey(this._array[i2]) === t3);
            return false;
          }
          *getKeyIterator(e3) {
            if (0 !== this._array.length && (i2 = this._search(e3), !(i2 < 0 || i2 >= this._array.length) && this._getKey(this._array[i2]) === e3)) do {
              yield this._array[i2];
            } while (++i2 < this._array.length && this._getKey(this._array[i2]) === e3);
          }
          forEachByKey(e3, t3) {
            if (0 !== this._array.length && (i2 = this._search(e3), !(i2 < 0 || i2 >= this._array.length) && this._getKey(this._array[i2]) === e3)) do {
              t3(this._array[i2]);
            } while (++i2 < this._array.length && this._getKey(this._array[i2]) === e3);
          }
          values() {
            return [...this._array].values();
          }
          _search(e3) {
            let t3 = 0, i3 = this._array.length - 1;
            for (; i3 >= t3; ) {
              let s2 = t3 + i3 >> 1;
              const r = this._getKey(this._array[s2]);
              if (r > e3) i3 = s2 - 1;
              else {
                if (!(r < e3)) {
                  for (; s2 > 0 && this._getKey(this._array[s2 - 1]) === e3; ) s2--;
                  return s2;
                }
                t3 = s2 + 1;
              }
            }
            return t3;
          }
        };
      }, 7226: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DebouncedIdleTask = t2.IdleTaskQueue = t2.PriorityTaskQueue = void 0;
        const s2 = i2(6114);
        class r {
          constructor() {
            this._tasks = [], this._i = 0;
          }
          enqueue(e3) {
            this._tasks.push(e3), this._start();
          }
          flush() {
            for (; this._i < this._tasks.length; ) this._tasks[this._i]() || this._i++;
            this.clear();
          }
          clear() {
            this._idleCallback && (this._cancelCallback(this._idleCallback), this._idleCallback = void 0), this._i = 0, this._tasks.length = 0;
          }
          _start() {
            this._idleCallback || (this._idleCallback = this._requestCallback(this._process.bind(this)));
          }
          _process(e3) {
            this._idleCallback = void 0;
            let t3 = 0, i3 = 0, s3 = e3.timeRemaining(), r2 = 0;
            for (; this._i < this._tasks.length; ) {
              if (t3 = Date.now(), this._tasks[this._i]() || this._i++, t3 = Math.max(1, Date.now() - t3), i3 = Math.max(t3, i3), r2 = e3.timeRemaining(), 1.5 * i3 > r2) return s3 - t3 < -20 && console.warn(`task queue exceeded allotted deadline by ${Math.abs(Math.round(s3 - t3))}ms`), void this._start();
              s3 = r2;
            }
            this.clear();
          }
        }
        class n extends r {
          _requestCallback(e3) {
            return setTimeout(() => e3(this._createDeadline(16)));
          }
          _cancelCallback(e3) {
            clearTimeout(e3);
          }
          _createDeadline(e3) {
            const t3 = Date.now() + e3;
            return { timeRemaining: () => Math.max(0, t3 - Date.now()) };
          }
        }
        t2.PriorityTaskQueue = n, t2.IdleTaskQueue = !s2.isNode && "requestIdleCallback" in window ? class extends r {
          _requestCallback(e3) {
            return requestIdleCallback(e3);
          }
          _cancelCallback(e3) {
            cancelIdleCallback(e3);
          }
        } : n, t2.DebouncedIdleTask = class {
          constructor() {
            this._queue = new t2.IdleTaskQueue();
          }
          set(e3) {
            this._queue.clear(), this._queue.enqueue(e3);
          }
          flush() {
            this._queue.flush();
          }
        };
      }, 9282: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.updateWindowsModeWrappedState = void 0;
        const s2 = i2(643);
        t2.updateWindowsModeWrappedState = function(e3) {
          const t3 = e3.buffer.lines.get(e3.buffer.ybase + e3.buffer.y - 1), i3 = null == t3 ? void 0 : t3.get(e3.cols - 1), r = e3.buffer.lines.get(e3.buffer.ybase + e3.buffer.y);
          r && i3 && (r.isWrapped = i3[s2.CHAR_DATA_CODE_INDEX] !== s2.NULL_CELL_CODE && i3[s2.CHAR_DATA_CODE_INDEX] !== s2.WHITESPACE_CELL_CODE);
        };
      }, 3734: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ExtendedAttrs = t2.AttributeData = void 0;
        class i2 {
          constructor() {
            this.fg = 0, this.bg = 0, this.extended = new s2();
          }
          static toColorRGB(e3) {
            return [e3 >>> 16 & 255, e3 >>> 8 & 255, 255 & e3];
          }
          static fromColorRGB(e3) {
            return (255 & e3[0]) << 16 | (255 & e3[1]) << 8 | 255 & e3[2];
          }
          clone() {
            const e3 = new i2();
            return e3.fg = this.fg, e3.bg = this.bg, e3.extended = this.extended.clone(), e3;
          }
          isInverse() {
            return 67108864 & this.fg;
          }
          isBold() {
            return 134217728 & this.fg;
          }
          isUnderline() {
            return this.hasExtendedAttrs() && 0 !== this.extended.underlineStyle ? 1 : 268435456 & this.fg;
          }
          isBlink() {
            return 536870912 & this.fg;
          }
          isInvisible() {
            return 1073741824 & this.fg;
          }
          isItalic() {
            return 67108864 & this.bg;
          }
          isDim() {
            return 134217728 & this.bg;
          }
          isStrikethrough() {
            return 2147483648 & this.fg;
          }
          isProtected() {
            return 536870912 & this.bg;
          }
          isOverline() {
            return 1073741824 & this.bg;
          }
          getFgColorMode() {
            return 50331648 & this.fg;
          }
          getBgColorMode() {
            return 50331648 & this.bg;
          }
          isFgRGB() {
            return 50331648 == (50331648 & this.fg);
          }
          isBgRGB() {
            return 50331648 == (50331648 & this.bg);
          }
          isFgPalette() {
            return 16777216 == (50331648 & this.fg) || 33554432 == (50331648 & this.fg);
          }
          isBgPalette() {
            return 16777216 == (50331648 & this.bg) || 33554432 == (50331648 & this.bg);
          }
          isFgDefault() {
            return 0 == (50331648 & this.fg);
          }
          isBgDefault() {
            return 0 == (50331648 & this.bg);
          }
          isAttributeDefault() {
            return 0 === this.fg && 0 === this.bg;
          }
          getFgColor() {
            switch (50331648 & this.fg) {
              case 16777216:
              case 33554432:
                return 255 & this.fg;
              case 50331648:
                return 16777215 & this.fg;
              default:
                return -1;
            }
          }
          getBgColor() {
            switch (50331648 & this.bg) {
              case 16777216:
              case 33554432:
                return 255 & this.bg;
              case 50331648:
                return 16777215 & this.bg;
              default:
                return -1;
            }
          }
          hasExtendedAttrs() {
            return 268435456 & this.bg;
          }
          updateExtended() {
            this.extended.isEmpty() ? this.bg &= -268435457 : this.bg |= 268435456;
          }
          getUnderlineColor() {
            if (268435456 & this.bg && ~this.extended.underlineColor) switch (50331648 & this.extended.underlineColor) {
              case 16777216:
              case 33554432:
                return 255 & this.extended.underlineColor;
              case 50331648:
                return 16777215 & this.extended.underlineColor;
              default:
                return this.getFgColor();
            }
            return this.getFgColor();
          }
          getUnderlineColorMode() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 50331648 & this.extended.underlineColor : this.getFgColorMode();
          }
          isUnderlineColorRGB() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 50331648 == (50331648 & this.extended.underlineColor) : this.isFgRGB();
          }
          isUnderlineColorPalette() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 16777216 == (50331648 & this.extended.underlineColor) || 33554432 == (50331648 & this.extended.underlineColor) : this.isFgPalette();
          }
          isUnderlineColorDefault() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 0 == (50331648 & this.extended.underlineColor) : this.isFgDefault();
          }
          getUnderlineStyle() {
            return 268435456 & this.fg ? 268435456 & this.bg ? this.extended.underlineStyle : 1 : 0;
          }
        }
        t2.AttributeData = i2;
        class s2 {
          get ext() {
            return this._urlId ? -469762049 & this._ext | this.underlineStyle << 26 : this._ext;
          }
          set ext(e3) {
            this._ext = e3;
          }
          get underlineStyle() {
            return this._urlId ? 5 : (469762048 & this._ext) >> 26;
          }
          set underlineStyle(e3) {
            this._ext &= -469762049, this._ext |= e3 << 26 & 469762048;
          }
          get underlineColor() {
            return 67108863 & this._ext;
          }
          set underlineColor(e3) {
            this._ext &= -67108864, this._ext |= 67108863 & e3;
          }
          get urlId() {
            return this._urlId;
          }
          set urlId(e3) {
            this._urlId = e3;
          }
          constructor(e3 = 0, t3 = 0) {
            this._ext = 0, this._urlId = 0, this._ext = e3, this._urlId = t3;
          }
          clone() {
            return new s2(this._ext, this._urlId);
          }
          isEmpty() {
            return 0 === this.underlineStyle && 0 === this._urlId;
          }
        }
        t2.ExtendedAttrs = s2;
      }, 9092: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Buffer = t2.MAX_BUFFER_SIZE = void 0;
        const s2 = i2(6349), r = i2(7226), n = i2(3734), o2 = i2(8437), a2 = i2(4634), h2 = i2(511), c2 = i2(643), l2 = i2(4863), d = i2(7116);
        t2.MAX_BUFFER_SIZE = 4294967295, t2.Buffer = class {
          constructor(e3, t3, i3) {
            this._hasScrollback = e3, this._optionsService = t3, this._bufferService = i3, this.ydisp = 0, this.ybase = 0, this.y = 0, this.x = 0, this.tabs = {}, this.savedY = 0, this.savedX = 0, this.savedCurAttrData = o2.DEFAULT_ATTR_DATA.clone(), this.savedCharset = d.DEFAULT_CHARSET, this.markers = [], this._nullCell = h2.CellData.fromCharData([0, c2.NULL_CELL_CHAR, c2.NULL_CELL_WIDTH, c2.NULL_CELL_CODE]), this._whitespaceCell = h2.CellData.fromCharData([0, c2.WHITESPACE_CELL_CHAR, c2.WHITESPACE_CELL_WIDTH, c2.WHITESPACE_CELL_CODE]), this._isClearing = false, this._memoryCleanupQueue = new r.IdleTaskQueue(), this._memoryCleanupPosition = 0, this._cols = this._bufferService.cols, this._rows = this._bufferService.rows, this.lines = new s2.CircularList(this._getCorrectBufferLength(this._rows)), this.scrollTop = 0, this.scrollBottom = this._rows - 1, this.setupTabStops();
          }
          getNullCell(e3) {
            return e3 ? (this._nullCell.fg = e3.fg, this._nullCell.bg = e3.bg, this._nullCell.extended = e3.extended) : (this._nullCell.fg = 0, this._nullCell.bg = 0, this._nullCell.extended = new n.ExtendedAttrs()), this._nullCell;
          }
          getWhitespaceCell(e3) {
            return e3 ? (this._whitespaceCell.fg = e3.fg, this._whitespaceCell.bg = e3.bg, this._whitespaceCell.extended = e3.extended) : (this._whitespaceCell.fg = 0, this._whitespaceCell.bg = 0, this._whitespaceCell.extended = new n.ExtendedAttrs()), this._whitespaceCell;
          }
          getBlankLine(e3, t3) {
            return new o2.BufferLine(this._bufferService.cols, this.getNullCell(e3), t3);
          }
          get hasScrollback() {
            return this._hasScrollback && this.lines.maxLength > this._rows;
          }
          get isCursorInViewport() {
            const e3 = this.ybase + this.y - this.ydisp;
            return e3 >= 0 && e3 < this._rows;
          }
          _getCorrectBufferLength(e3) {
            if (!this._hasScrollback) return e3;
            const i3 = e3 + this._optionsService.rawOptions.scrollback;
            return i3 > t2.MAX_BUFFER_SIZE ? t2.MAX_BUFFER_SIZE : i3;
          }
          fillViewportRows(e3) {
            if (0 === this.lines.length) {
              void 0 === e3 && (e3 = o2.DEFAULT_ATTR_DATA);
              let t3 = this._rows;
              for (; t3--; ) this.lines.push(this.getBlankLine(e3));
            }
          }
          clear() {
            this.ydisp = 0, this.ybase = 0, this.y = 0, this.x = 0, this.lines = new s2.CircularList(this._getCorrectBufferLength(this._rows)), this.scrollTop = 0, this.scrollBottom = this._rows - 1, this.setupTabStops();
          }
          resize(e3, t3) {
            const i3 = this.getNullCell(o2.DEFAULT_ATTR_DATA);
            let s3 = 0;
            const r2 = this._getCorrectBufferLength(t3);
            if (r2 > this.lines.maxLength && (this.lines.maxLength = r2), this.lines.length > 0) {
              if (this._cols < e3) for (let t4 = 0; t4 < this.lines.length; t4++) s3 += +this.lines.get(t4).resize(e3, i3);
              let n2 = 0;
              if (this._rows < t3) for (let s4 = this._rows; s4 < t3; s4++) this.lines.length < t3 + this.ybase && (this._optionsService.rawOptions.windowsMode || void 0 !== this._optionsService.rawOptions.windowsPty.backend || void 0 !== this._optionsService.rawOptions.windowsPty.buildNumber ? this.lines.push(new o2.BufferLine(e3, i3)) : this.ybase > 0 && this.lines.length <= this.ybase + this.y + n2 + 1 ? (this.ybase--, n2++, this.ydisp > 0 && this.ydisp--) : this.lines.push(new o2.BufferLine(e3, i3)));
              else for (let e4 = this._rows; e4 > t3; e4--) this.lines.length > t3 + this.ybase && (this.lines.length > this.ybase + this.y + 1 ? this.lines.pop() : (this.ybase++, this.ydisp++));
              if (r2 < this.lines.maxLength) {
                const e4 = this.lines.length - r2;
                e4 > 0 && (this.lines.trimStart(e4), this.ybase = Math.max(this.ybase - e4, 0), this.ydisp = Math.max(this.ydisp - e4, 0), this.savedY = Math.max(this.savedY - e4, 0)), this.lines.maxLength = r2;
              }
              this.x = Math.min(this.x, e3 - 1), this.y = Math.min(this.y, t3 - 1), n2 && (this.y += n2), this.savedX = Math.min(this.savedX, e3 - 1), this.scrollTop = 0;
            }
            if (this.scrollBottom = t3 - 1, this._isReflowEnabled && (this._reflow(e3, t3), this._cols > e3)) for (let t4 = 0; t4 < this.lines.length; t4++) s3 += +this.lines.get(t4).resize(e3, i3);
            this._cols = e3, this._rows = t3, this._memoryCleanupQueue.clear(), s3 > 0.1 * this.lines.length && (this._memoryCleanupPosition = 0, this._memoryCleanupQueue.enqueue(() => this._batchedMemoryCleanup()));
          }
          _batchedMemoryCleanup() {
            let e3 = true;
            this._memoryCleanupPosition >= this.lines.length && (this._memoryCleanupPosition = 0, e3 = false);
            let t3 = 0;
            for (; this._memoryCleanupPosition < this.lines.length; ) if (t3 += this.lines.get(this._memoryCleanupPosition++).cleanupMemory(), t3 > 100) return true;
            return e3;
          }
          get _isReflowEnabled() {
            const e3 = this._optionsService.rawOptions.windowsPty;
            return e3 && e3.buildNumber ? this._hasScrollback && "conpty" === e3.backend && e3.buildNumber >= 21376 : this._hasScrollback && !this._optionsService.rawOptions.windowsMode;
          }
          _reflow(e3, t3) {
            this._cols !== e3 && (e3 > this._cols ? this._reflowLarger(e3, t3) : this._reflowSmaller(e3, t3));
          }
          _reflowLarger(e3, t3) {
            const i3 = (0, a2.reflowLargerGetLinesToRemove)(this.lines, this._cols, e3, this.ybase + this.y, this.getNullCell(o2.DEFAULT_ATTR_DATA));
            if (i3.length > 0) {
              const s3 = (0, a2.reflowLargerCreateNewLayout)(this.lines, i3);
              (0, a2.reflowLargerApplyNewLayout)(this.lines, s3.layout), this._reflowLargerAdjustViewport(e3, t3, s3.countRemoved);
            }
          }
          _reflowLargerAdjustViewport(e3, t3, i3) {
            const s3 = this.getNullCell(o2.DEFAULT_ATTR_DATA);
            let r2 = i3;
            for (; r2-- > 0; ) 0 === this.ybase ? (this.y > 0 && this.y--, this.lines.length < t3 && this.lines.push(new o2.BufferLine(e3, s3))) : (this.ydisp === this.ybase && this.ydisp--, this.ybase--);
            this.savedY = Math.max(this.savedY - i3, 0);
          }
          _reflowSmaller(e3, t3) {
            const i3 = this.getNullCell(o2.DEFAULT_ATTR_DATA), s3 = [];
            let r2 = 0;
            for (let n2 = this.lines.length - 1; n2 >= 0; n2--) {
              let h3 = this.lines.get(n2);
              if (!h3 || !h3.isWrapped && h3.getTrimmedLength() <= e3) continue;
              const c3 = [h3];
              for (; h3.isWrapped && n2 > 0; ) h3 = this.lines.get(--n2), c3.unshift(h3);
              const l3 = this.ybase + this.y;
              if (l3 >= n2 && l3 < n2 + c3.length) continue;
              const d2 = c3[c3.length - 1].getTrimmedLength(), _3 = (0, a2.reflowSmallerGetNewLineLengths)(c3, this._cols, e3), u = _3.length - c3.length;
              let f;
              f = 0 === this.ybase && this.y !== this.lines.length - 1 ? Math.max(0, this.y - this.lines.maxLength + u) : Math.max(0, this.lines.length - this.lines.maxLength + u);
              const v2 = [];
              for (let e4 = 0; e4 < u; e4++) {
                const e5 = this.getBlankLine(o2.DEFAULT_ATTR_DATA, true);
                v2.push(e5);
              }
              v2.length > 0 && (s3.push({ start: n2 + c3.length + r2, newLines: v2 }), r2 += v2.length), c3.push(...v2);
              let p = _3.length - 1, g2 = _3[p];
              0 === g2 && (p--, g2 = _3[p]);
              let m2 = c3.length - u - 1, S = d2;
              for (; m2 >= 0; ) {
                const e4 = Math.min(S, g2);
                if (void 0 === c3[p]) break;
                if (c3[p].copyCellsFrom(c3[m2], S - e4, g2 - e4, e4, true), g2 -= e4, 0 === g2 && (p--, g2 = _3[p]), S -= e4, 0 === S) {
                  m2--;
                  const e5 = Math.max(m2, 0);
                  S = (0, a2.getWrappedLineTrimmedLength)(c3, e5, this._cols);
                }
              }
              for (let t4 = 0; t4 < c3.length; t4++) _3[t4] < e3 && c3[t4].setCell(_3[t4], i3);
              let C = u - f;
              for (; C-- > 0; ) 0 === this.ybase ? this.y < t3 - 1 ? (this.y++, this.lines.pop()) : (this.ybase++, this.ydisp++) : this.ybase < Math.min(this.lines.maxLength, this.lines.length + r2) - t3 && (this.ybase === this.ydisp && this.ydisp++, this.ybase++);
              this.savedY = Math.min(this.savedY + u, this.ybase + t3 - 1);
            }
            if (s3.length > 0) {
              const e4 = [], t4 = [];
              for (let e5 = 0; e5 < this.lines.length; e5++) t4.push(this.lines.get(e5));
              const i4 = this.lines.length;
              let n2 = i4 - 1, o3 = 0, a3 = s3[o3];
              this.lines.length = Math.min(this.lines.maxLength, this.lines.length + r2);
              let h3 = 0;
              for (let c4 = Math.min(this.lines.maxLength - 1, i4 + r2 - 1); c4 >= 0; c4--) if (a3 && a3.start > n2 + h3) {
                for (let e5 = a3.newLines.length - 1; e5 >= 0; e5--) this.lines.set(c4--, a3.newLines[e5]);
                c4++, e4.push({ index: n2 + 1, amount: a3.newLines.length }), h3 += a3.newLines.length, a3 = s3[++o3];
              } else this.lines.set(c4, t4[n2--]);
              let c3 = 0;
              for (let t5 = e4.length - 1; t5 >= 0; t5--) e4[t5].index += c3, this.lines.onInsertEmitter.fire(e4[t5]), c3 += e4[t5].amount;
              const l3 = Math.max(0, i4 + r2 - this.lines.maxLength);
              l3 > 0 && this.lines.onTrimEmitter.fire(l3);
            }
          }
          translateBufferLineToString(e3, t3, i3 = 0, s3) {
            const r2 = this.lines.get(e3);
            return r2 ? r2.translateToString(t3, i3, s3) : "";
          }
          getWrappedRangeForLine(e3) {
            let t3 = e3, i3 = e3;
            for (; t3 > 0 && this.lines.get(t3).isWrapped; ) t3--;
            for (; i3 + 1 < this.lines.length && this.lines.get(i3 + 1).isWrapped; ) i3++;
            return { first: t3, last: i3 };
          }
          setupTabStops(e3) {
            for (null != e3 ? this.tabs[e3] || (e3 = this.prevStop(e3)) : (this.tabs = {}, e3 = 0); e3 < this._cols; e3 += this._optionsService.rawOptions.tabStopWidth) this.tabs[e3] = true;
          }
          prevStop(e3) {
            for (null == e3 && (e3 = this.x); !this.tabs[--e3] && e3 > 0; ) ;
            return e3 >= this._cols ? this._cols - 1 : e3 < 0 ? 0 : e3;
          }
          nextStop(e3) {
            for (null == e3 && (e3 = this.x); !this.tabs[++e3] && e3 < this._cols; ) ;
            return e3 >= this._cols ? this._cols - 1 : e3 < 0 ? 0 : e3;
          }
          clearMarkers(e3) {
            this._isClearing = true;
            for (let t3 = 0; t3 < this.markers.length; t3++) this.markers[t3].line === e3 && (this.markers[t3].dispose(), this.markers.splice(t3--, 1));
            this._isClearing = false;
          }
          clearAllMarkers() {
            this._isClearing = true;
            for (let e3 = 0; e3 < this.markers.length; e3++) this.markers[e3].dispose(), this.markers.splice(e3--, 1);
            this._isClearing = false;
          }
          addMarker(e3) {
            const t3 = new l2.Marker(e3);
            return this.markers.push(t3), t3.register(this.lines.onTrim((e4) => {
              t3.line -= e4, t3.line < 0 && t3.dispose();
            })), t3.register(this.lines.onInsert((e4) => {
              t3.line >= e4.index && (t3.line += e4.amount);
            })), t3.register(this.lines.onDelete((e4) => {
              t3.line >= e4.index && t3.line < e4.index + e4.amount && t3.dispose(), t3.line > e4.index && (t3.line -= e4.amount);
            })), t3.register(t3.onDispose(() => this._removeMarker(t3))), t3;
          }
          _removeMarker(e3) {
            this._isClearing || this.markers.splice(this.markers.indexOf(e3), 1);
          }
        };
      }, 8437: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferLine = t2.DEFAULT_ATTR_DATA = void 0;
        const s2 = i2(3734), r = i2(511), n = i2(643), o2 = i2(482);
        t2.DEFAULT_ATTR_DATA = Object.freeze(new s2.AttributeData());
        let a2 = 0;
        class h2 {
          constructor(e3, t3, i3 = false) {
            this.isWrapped = i3, this._combined = {}, this._extendedAttrs = {}, this._data = new Uint32Array(3 * e3);
            const s3 = t3 || r.CellData.fromCharData([0, n.NULL_CELL_CHAR, n.NULL_CELL_WIDTH, n.NULL_CELL_CODE]);
            for (let t4 = 0; t4 < e3; ++t4) this.setCell(t4, s3);
            this.length = e3;
          }
          get(e3) {
            const t3 = this._data[3 * e3 + 0], i3 = 2097151 & t3;
            return [this._data[3 * e3 + 1], 2097152 & t3 ? this._combined[e3] : i3 ? (0, o2.stringFromCodePoint)(i3) : "", t3 >> 22, 2097152 & t3 ? this._combined[e3].charCodeAt(this._combined[e3].length - 1) : i3];
          }
          set(e3, t3) {
            this._data[3 * e3 + 1] = t3[n.CHAR_DATA_ATTR_INDEX], t3[n.CHAR_DATA_CHAR_INDEX].length > 1 ? (this._combined[e3] = t3[1], this._data[3 * e3 + 0] = 2097152 | e3 | t3[n.CHAR_DATA_WIDTH_INDEX] << 22) : this._data[3 * e3 + 0] = t3[n.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | t3[n.CHAR_DATA_WIDTH_INDEX] << 22;
          }
          getWidth(e3) {
            return this._data[3 * e3 + 0] >> 22;
          }
          hasWidth(e3) {
            return 12582912 & this._data[3 * e3 + 0];
          }
          getFg(e3) {
            return this._data[3 * e3 + 1];
          }
          getBg(e3) {
            return this._data[3 * e3 + 2];
          }
          hasContent(e3) {
            return 4194303 & this._data[3 * e3 + 0];
          }
          getCodePoint(e3) {
            const t3 = this._data[3 * e3 + 0];
            return 2097152 & t3 ? this._combined[e3].charCodeAt(this._combined[e3].length - 1) : 2097151 & t3;
          }
          isCombined(e3) {
            return 2097152 & this._data[3 * e3 + 0];
          }
          getString(e3) {
            const t3 = this._data[3 * e3 + 0];
            return 2097152 & t3 ? this._combined[e3] : 2097151 & t3 ? (0, o2.stringFromCodePoint)(2097151 & t3) : "";
          }
          isProtected(e3) {
            return 536870912 & this._data[3 * e3 + 2];
          }
          loadCell(e3, t3) {
            return a2 = 3 * e3, t3.content = this._data[a2 + 0], t3.fg = this._data[a2 + 1], t3.bg = this._data[a2 + 2], 2097152 & t3.content && (t3.combinedData = this._combined[e3]), 268435456 & t3.bg && (t3.extended = this._extendedAttrs[e3]), t3;
          }
          setCell(e3, t3) {
            2097152 & t3.content && (this._combined[e3] = t3.combinedData), 268435456 & t3.bg && (this._extendedAttrs[e3] = t3.extended), this._data[3 * e3 + 0] = t3.content, this._data[3 * e3 + 1] = t3.fg, this._data[3 * e3 + 2] = t3.bg;
          }
          setCellFromCodePoint(e3, t3, i3, s3, r2, n2) {
            268435456 & r2 && (this._extendedAttrs[e3] = n2), this._data[3 * e3 + 0] = t3 | i3 << 22, this._data[3 * e3 + 1] = s3, this._data[3 * e3 + 2] = r2;
          }
          addCodepointToCell(e3, t3) {
            let i3 = this._data[3 * e3 + 0];
            2097152 & i3 ? this._combined[e3] += (0, o2.stringFromCodePoint)(t3) : (2097151 & i3 ? (this._combined[e3] = (0, o2.stringFromCodePoint)(2097151 & i3) + (0, o2.stringFromCodePoint)(t3), i3 &= -2097152, i3 |= 2097152) : i3 = t3 | 1 << 22, this._data[3 * e3 + 0] = i3);
          }
          insertCells(e3, t3, i3, n2) {
            if ((e3 %= this.length) && 2 === this.getWidth(e3 - 1) && this.setCellFromCodePoint(e3 - 1, 0, 1, (null == n2 ? void 0 : n2.fg) || 0, (null == n2 ? void 0 : n2.bg) || 0, (null == n2 ? void 0 : n2.extended) || new s2.ExtendedAttrs()), t3 < this.length - e3) {
              const s3 = new r.CellData();
              for (let i4 = this.length - e3 - t3 - 1; i4 >= 0; --i4) this.setCell(e3 + t3 + i4, this.loadCell(e3 + i4, s3));
              for (let s4 = 0; s4 < t3; ++s4) this.setCell(e3 + s4, i3);
            } else for (let t4 = e3; t4 < this.length; ++t4) this.setCell(t4, i3);
            2 === this.getWidth(this.length - 1) && this.setCellFromCodePoint(this.length - 1, 0, 1, (null == n2 ? void 0 : n2.fg) || 0, (null == n2 ? void 0 : n2.bg) || 0, (null == n2 ? void 0 : n2.extended) || new s2.ExtendedAttrs());
          }
          deleteCells(e3, t3, i3, n2) {
            if (e3 %= this.length, t3 < this.length - e3) {
              const s3 = new r.CellData();
              for (let i4 = 0; i4 < this.length - e3 - t3; ++i4) this.setCell(e3 + i4, this.loadCell(e3 + t3 + i4, s3));
              for (let e4 = this.length - t3; e4 < this.length; ++e4) this.setCell(e4, i3);
            } else for (let t4 = e3; t4 < this.length; ++t4) this.setCell(t4, i3);
            e3 && 2 === this.getWidth(e3 - 1) && this.setCellFromCodePoint(e3 - 1, 0, 1, (null == n2 ? void 0 : n2.fg) || 0, (null == n2 ? void 0 : n2.bg) || 0, (null == n2 ? void 0 : n2.extended) || new s2.ExtendedAttrs()), 0 !== this.getWidth(e3) || this.hasContent(e3) || this.setCellFromCodePoint(e3, 0, 1, (null == n2 ? void 0 : n2.fg) || 0, (null == n2 ? void 0 : n2.bg) || 0, (null == n2 ? void 0 : n2.extended) || new s2.ExtendedAttrs());
          }
          replaceCells(e3, t3, i3, r2, n2 = false) {
            if (n2) for (e3 && 2 === this.getWidth(e3 - 1) && !this.isProtected(e3 - 1) && this.setCellFromCodePoint(e3 - 1, 0, 1, (null == r2 ? void 0 : r2.fg) || 0, (null == r2 ? void 0 : r2.bg) || 0, (null == r2 ? void 0 : r2.extended) || new s2.ExtendedAttrs()), t3 < this.length && 2 === this.getWidth(t3 - 1) && !this.isProtected(t3) && this.setCellFromCodePoint(t3, 0, 1, (null == r2 ? void 0 : r2.fg) || 0, (null == r2 ? void 0 : r2.bg) || 0, (null == r2 ? void 0 : r2.extended) || new s2.ExtendedAttrs()); e3 < t3 && e3 < this.length; ) this.isProtected(e3) || this.setCell(e3, i3), e3++;
            else for (e3 && 2 === this.getWidth(e3 - 1) && this.setCellFromCodePoint(e3 - 1, 0, 1, (null == r2 ? void 0 : r2.fg) || 0, (null == r2 ? void 0 : r2.bg) || 0, (null == r2 ? void 0 : r2.extended) || new s2.ExtendedAttrs()), t3 < this.length && 2 === this.getWidth(t3 - 1) && this.setCellFromCodePoint(t3, 0, 1, (null == r2 ? void 0 : r2.fg) || 0, (null == r2 ? void 0 : r2.bg) || 0, (null == r2 ? void 0 : r2.extended) || new s2.ExtendedAttrs()); e3 < t3 && e3 < this.length; ) this.setCell(e3++, i3);
          }
          resize(e3, t3) {
            if (e3 === this.length) return 4 * this._data.length * 2 < this._data.buffer.byteLength;
            const i3 = 3 * e3;
            if (e3 > this.length) {
              if (this._data.buffer.byteLength >= 4 * i3) this._data = new Uint32Array(this._data.buffer, 0, i3);
              else {
                const e4 = new Uint32Array(i3);
                e4.set(this._data), this._data = e4;
              }
              for (let i4 = this.length; i4 < e3; ++i4) this.setCell(i4, t3);
            } else {
              this._data = this._data.subarray(0, i3);
              const t4 = Object.keys(this._combined);
              for (let i4 = 0; i4 < t4.length; i4++) {
                const s4 = parseInt(t4[i4], 10);
                s4 >= e3 && delete this._combined[s4];
              }
              const s3 = Object.keys(this._extendedAttrs);
              for (let t5 = 0; t5 < s3.length; t5++) {
                const i4 = parseInt(s3[t5], 10);
                i4 >= e3 && delete this._extendedAttrs[i4];
              }
            }
            return this.length = e3, 4 * i3 * 2 < this._data.buffer.byteLength;
          }
          cleanupMemory() {
            if (4 * this._data.length * 2 < this._data.buffer.byteLength) {
              const e3 = new Uint32Array(this._data.length);
              return e3.set(this._data), this._data = e3, 1;
            }
            return 0;
          }
          fill(e3, t3 = false) {
            if (t3) for (let t4 = 0; t4 < this.length; ++t4) this.isProtected(t4) || this.setCell(t4, e3);
            else {
              this._combined = {}, this._extendedAttrs = {};
              for (let t4 = 0; t4 < this.length; ++t4) this.setCell(t4, e3);
            }
          }
          copyFrom(e3) {
            this.length !== e3.length ? this._data = new Uint32Array(e3._data) : this._data.set(e3._data), this.length = e3.length, this._combined = {};
            for (const t3 in e3._combined) this._combined[t3] = e3._combined[t3];
            this._extendedAttrs = {};
            for (const t3 in e3._extendedAttrs) this._extendedAttrs[t3] = e3._extendedAttrs[t3];
            this.isWrapped = e3.isWrapped;
          }
          clone() {
            const e3 = new h2(0);
            e3._data = new Uint32Array(this._data), e3.length = this.length;
            for (const t3 in this._combined) e3._combined[t3] = this._combined[t3];
            for (const t3 in this._extendedAttrs) e3._extendedAttrs[t3] = this._extendedAttrs[t3];
            return e3.isWrapped = this.isWrapped, e3;
          }
          getTrimmedLength() {
            for (let e3 = this.length - 1; e3 >= 0; --e3) if (4194303 & this._data[3 * e3 + 0]) return e3 + (this._data[3 * e3 + 0] >> 22);
            return 0;
          }
          getNoBgTrimmedLength() {
            for (let e3 = this.length - 1; e3 >= 0; --e3) if (4194303 & this._data[3 * e3 + 0] || 50331648 & this._data[3 * e3 + 2]) return e3 + (this._data[3 * e3 + 0] >> 22);
            return 0;
          }
          copyCellsFrom(e3, t3, i3, s3, r2) {
            const n2 = e3._data;
            if (r2) for (let r3 = s3 - 1; r3 >= 0; r3--) {
              for (let e4 = 0; e4 < 3; e4++) this._data[3 * (i3 + r3) + e4] = n2[3 * (t3 + r3) + e4];
              268435456 & n2[3 * (t3 + r3) + 2] && (this._extendedAttrs[i3 + r3] = e3._extendedAttrs[t3 + r3]);
            }
            else for (let r3 = 0; r3 < s3; r3++) {
              for (let e4 = 0; e4 < 3; e4++) this._data[3 * (i3 + r3) + e4] = n2[3 * (t3 + r3) + e4];
              268435456 & n2[3 * (t3 + r3) + 2] && (this._extendedAttrs[i3 + r3] = e3._extendedAttrs[t3 + r3]);
            }
            const o3 = Object.keys(e3._combined);
            for (let s4 = 0; s4 < o3.length; s4++) {
              const r3 = parseInt(o3[s4], 10);
              r3 >= t3 && (this._combined[r3 - t3 + i3] = e3._combined[r3]);
            }
          }
          translateToString(e3 = false, t3 = 0, i3 = this.length) {
            e3 && (i3 = Math.min(i3, this.getTrimmedLength()));
            let s3 = "";
            for (; t3 < i3; ) {
              const e4 = this._data[3 * t3 + 0], i4 = 2097151 & e4;
              s3 += 2097152 & e4 ? this._combined[t3] : i4 ? (0, o2.stringFromCodePoint)(i4) : n.WHITESPACE_CELL_CHAR, t3 += e4 >> 22 || 1;
            }
            return s3;
          }
        }
        t2.BufferLine = h2;
      }, 4841: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.getRangeLength = void 0, t2.getRangeLength = function(e3, t3) {
          if (e3.start.y > e3.end.y) throw new Error(`Buffer range end (${e3.end.x}, ${e3.end.y}) cannot be before start (${e3.start.x}, ${e3.start.y})`);
          return t3 * (e3.end.y - e3.start.y) + (e3.end.x - e3.start.x + 1);
        };
      }, 4634: (e2, t2) => {
        function i2(e3, t3, i3) {
          if (t3 === e3.length - 1) return e3[t3].getTrimmedLength();
          const s2 = !e3[t3].hasContent(i3 - 1) && 1 === e3[t3].getWidth(i3 - 1), r = 2 === e3[t3 + 1].getWidth(0);
          return s2 && r ? i3 - 1 : i3;
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.getWrappedLineTrimmedLength = t2.reflowSmallerGetNewLineLengths = t2.reflowLargerApplyNewLayout = t2.reflowLargerCreateNewLayout = t2.reflowLargerGetLinesToRemove = void 0, t2.reflowLargerGetLinesToRemove = function(e3, t3, s2, r, n) {
          const o2 = [];
          for (let a2 = 0; a2 < e3.length - 1; a2++) {
            let h2 = a2, c2 = e3.get(++h2);
            if (!c2.isWrapped) continue;
            const l2 = [e3.get(a2)];
            for (; h2 < e3.length && c2.isWrapped; ) l2.push(c2), c2 = e3.get(++h2);
            if (r >= a2 && r < h2) {
              a2 += l2.length - 1;
              continue;
            }
            let d = 0, _3 = i2(l2, d, t3), u = 1, f = 0;
            for (; u < l2.length; ) {
              const e4 = i2(l2, u, t3), r2 = e4 - f, o3 = s2 - _3, a3 = Math.min(r2, o3);
              l2[d].copyCellsFrom(l2[u], f, _3, a3, false), _3 += a3, _3 === s2 && (d++, _3 = 0), f += a3, f === e4 && (u++, f = 0), 0 === _3 && 0 !== d && 2 === l2[d - 1].getWidth(s2 - 1) && (l2[d].copyCellsFrom(l2[d - 1], s2 - 1, _3++, 1, false), l2[d - 1].setCell(s2 - 1, n));
            }
            l2[d].replaceCells(_3, s2, n);
            let v2 = 0;
            for (let e4 = l2.length - 1; e4 > 0 && (e4 > d || 0 === l2[e4].getTrimmedLength()); e4--) v2++;
            v2 > 0 && (o2.push(a2 + l2.length - v2), o2.push(v2)), a2 += l2.length - 1;
          }
          return o2;
        }, t2.reflowLargerCreateNewLayout = function(e3, t3) {
          const i3 = [];
          let s2 = 0, r = t3[s2], n = 0;
          for (let o2 = 0; o2 < e3.length; o2++) if (r === o2) {
            const i4 = t3[++s2];
            e3.onDeleteEmitter.fire({ index: o2 - n, amount: i4 }), o2 += i4 - 1, n += i4, r = t3[++s2];
          } else i3.push(o2);
          return { layout: i3, countRemoved: n };
        }, t2.reflowLargerApplyNewLayout = function(e3, t3) {
          const i3 = [];
          for (let s2 = 0; s2 < t3.length; s2++) i3.push(e3.get(t3[s2]));
          for (let t4 = 0; t4 < i3.length; t4++) e3.set(t4, i3[t4]);
          e3.length = t3.length;
        }, t2.reflowSmallerGetNewLineLengths = function(e3, t3, s2) {
          const r = [], n = e3.map((s3, r2) => i2(e3, r2, t3)).reduce((e4, t4) => e4 + t4);
          let o2 = 0, a2 = 0, h2 = 0;
          for (; h2 < n; ) {
            if (n - h2 < s2) {
              r.push(n - h2);
              break;
            }
            o2 += s2;
            const c2 = i2(e3, a2, t3);
            o2 > c2 && (o2 -= c2, a2++);
            const l2 = 2 === e3[a2].getWidth(o2 - 1);
            l2 && o2--;
            const d = l2 ? s2 - 1 : s2;
            r.push(d), h2 += d;
          }
          return r;
        }, t2.getWrappedLineTrimmedLength = i2;
      }, 5295: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferSet = void 0;
        const s2 = i2(8460), r = i2(844), n = i2(9092);
        class o2 extends r.Disposable {
          constructor(e3, t3) {
            super(), this._optionsService = e3, this._bufferService = t3, this._onBufferActivate = this.register(new s2.EventEmitter()), this.onBufferActivate = this._onBufferActivate.event, this.reset(), this.register(this._optionsService.onSpecificOptionChange("scrollback", () => this.resize(this._bufferService.cols, this._bufferService.rows))), this.register(this._optionsService.onSpecificOptionChange("tabStopWidth", () => this.setupTabStops()));
          }
          reset() {
            this._normal = new n.Buffer(true, this._optionsService, this._bufferService), this._normal.fillViewportRows(), this._alt = new n.Buffer(false, this._optionsService, this._bufferService), this._activeBuffer = this._normal, this._onBufferActivate.fire({ activeBuffer: this._normal, inactiveBuffer: this._alt }), this.setupTabStops();
          }
          get alt() {
            return this._alt;
          }
          get active() {
            return this._activeBuffer;
          }
          get normal() {
            return this._normal;
          }
          activateNormalBuffer() {
            this._activeBuffer !== this._normal && (this._normal.x = this._alt.x, this._normal.y = this._alt.y, this._alt.clearAllMarkers(), this._alt.clear(), this._activeBuffer = this._normal, this._onBufferActivate.fire({ activeBuffer: this._normal, inactiveBuffer: this._alt }));
          }
          activateAltBuffer(e3) {
            this._activeBuffer !== this._alt && (this._alt.fillViewportRows(e3), this._alt.x = this._normal.x, this._alt.y = this._normal.y, this._activeBuffer = this._alt, this._onBufferActivate.fire({ activeBuffer: this._alt, inactiveBuffer: this._normal }));
          }
          resize(e3, t3) {
            this._normal.resize(e3, t3), this._alt.resize(e3, t3), this.setupTabStops(e3);
          }
          setupTabStops(e3) {
            this._normal.setupTabStops(e3), this._alt.setupTabStops(e3);
          }
        }
        t2.BufferSet = o2;
      }, 511: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CellData = void 0;
        const s2 = i2(482), r = i2(643), n = i2(3734);
        class o2 extends n.AttributeData {
          constructor() {
            super(...arguments), this.content = 0, this.fg = 0, this.bg = 0, this.extended = new n.ExtendedAttrs(), this.combinedData = "";
          }
          static fromCharData(e3) {
            const t3 = new o2();
            return t3.setFromCharData(e3), t3;
          }
          isCombined() {
            return 2097152 & this.content;
          }
          getWidth() {
            return this.content >> 22;
          }
          getChars() {
            return 2097152 & this.content ? this.combinedData : 2097151 & this.content ? (0, s2.stringFromCodePoint)(2097151 & this.content) : "";
          }
          getCode() {
            return this.isCombined() ? this.combinedData.charCodeAt(this.combinedData.length - 1) : 2097151 & this.content;
          }
          setFromCharData(e3) {
            this.fg = e3[r.CHAR_DATA_ATTR_INDEX], this.bg = 0;
            let t3 = false;
            if (e3[r.CHAR_DATA_CHAR_INDEX].length > 2) t3 = true;
            else if (2 === e3[r.CHAR_DATA_CHAR_INDEX].length) {
              const i3 = e3[r.CHAR_DATA_CHAR_INDEX].charCodeAt(0);
              if (55296 <= i3 && i3 <= 56319) {
                const s3 = e3[r.CHAR_DATA_CHAR_INDEX].charCodeAt(1);
                56320 <= s3 && s3 <= 57343 ? this.content = 1024 * (i3 - 55296) + s3 - 56320 + 65536 | e3[r.CHAR_DATA_WIDTH_INDEX] << 22 : t3 = true;
              } else t3 = true;
            } else this.content = e3[r.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | e3[r.CHAR_DATA_WIDTH_INDEX] << 22;
            t3 && (this.combinedData = e3[r.CHAR_DATA_CHAR_INDEX], this.content = 2097152 | e3[r.CHAR_DATA_WIDTH_INDEX] << 22);
          }
          getAsCharData() {
            return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
          }
        }
        t2.CellData = o2;
      }, 643: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.WHITESPACE_CELL_CODE = t2.WHITESPACE_CELL_WIDTH = t2.WHITESPACE_CELL_CHAR = t2.NULL_CELL_CODE = t2.NULL_CELL_WIDTH = t2.NULL_CELL_CHAR = t2.CHAR_DATA_CODE_INDEX = t2.CHAR_DATA_WIDTH_INDEX = t2.CHAR_DATA_CHAR_INDEX = t2.CHAR_DATA_ATTR_INDEX = t2.DEFAULT_EXT = t2.DEFAULT_ATTR = t2.DEFAULT_COLOR = void 0, t2.DEFAULT_COLOR = 0, t2.DEFAULT_ATTR = 256 | t2.DEFAULT_COLOR << 9, t2.DEFAULT_EXT = 0, t2.CHAR_DATA_ATTR_INDEX = 0, t2.CHAR_DATA_CHAR_INDEX = 1, t2.CHAR_DATA_WIDTH_INDEX = 2, t2.CHAR_DATA_CODE_INDEX = 3, t2.NULL_CELL_CHAR = "", t2.NULL_CELL_WIDTH = 1, t2.NULL_CELL_CODE = 0, t2.WHITESPACE_CELL_CHAR = " ", t2.WHITESPACE_CELL_WIDTH = 1, t2.WHITESPACE_CELL_CODE = 32;
      }, 4863: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Marker = void 0;
        const s2 = i2(8460), r = i2(844);
        class n {
          get id() {
            return this._id;
          }
          constructor(e3) {
            this.line = e3, this.isDisposed = false, this._disposables = [], this._id = n._nextId++, this._onDispose = this.register(new s2.EventEmitter()), this.onDispose = this._onDispose.event;
          }
          dispose() {
            this.isDisposed || (this.isDisposed = true, this.line = -1, this._onDispose.fire(), (0, r.disposeArray)(this._disposables), this._disposables.length = 0);
          }
          register(e3) {
            return this._disposables.push(e3), e3;
          }
        }
        t2.Marker = n, n._nextId = 1;
      }, 7116: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DEFAULT_CHARSET = t2.CHARSETS = void 0, t2.CHARSETS = {}, t2.DEFAULT_CHARSET = t2.CHARSETS.B, t2.CHARSETS[0] = { "`": "\u25C6", a: "\u2592", b: "\u2409", c: "\u240C", d: "\u240D", e: "\u240A", f: "\xB0", g: "\xB1", h: "\u2424", i: "\u240B", j: "\u2518", k: "\u2510", l: "\u250C", m: "\u2514", n: "\u253C", o: "\u23BA", p: "\u23BB", q: "\u2500", r: "\u23BC", s: "\u23BD", t: "\u251C", u: "\u2524", v: "\u2534", w: "\u252C", x: "\u2502", y: "\u2264", z: "\u2265", "{": "\u03C0", "|": "\u2260", "}": "\xA3", "~": "\xB7" }, t2.CHARSETS.A = { "#": "\xA3" }, t2.CHARSETS.B = void 0, t2.CHARSETS[4] = { "#": "\xA3", "@": "\xBE", "[": "ij", "\\": "\xBD", "]": "|", "{": "\xA8", "|": "f", "}": "\xBC", "~": "\xB4" }, t2.CHARSETS.C = t2.CHARSETS[5] = { "[": "\xC4", "\\": "\xD6", "]": "\xC5", "^": "\xDC", "`": "\xE9", "{": "\xE4", "|": "\xF6", "}": "\xE5", "~": "\xFC" }, t2.CHARSETS.R = { "#": "\xA3", "@": "\xE0", "[": "\xB0", "\\": "\xE7", "]": "\xA7", "{": "\xE9", "|": "\xF9", "}": "\xE8", "~": "\xA8" }, t2.CHARSETS.Q = { "@": "\xE0", "[": "\xE2", "\\": "\xE7", "]": "\xEA", "^": "\xEE", "`": "\xF4", "{": "\xE9", "|": "\xF9", "}": "\xE8", "~": "\xFB" }, t2.CHARSETS.K = { "@": "\xA7", "[": "\xC4", "\\": "\xD6", "]": "\xDC", "{": "\xE4", "|": "\xF6", "}": "\xFC", "~": "\xDF" }, t2.CHARSETS.Y = { "#": "\xA3", "@": "\xA7", "[": "\xB0", "\\": "\xE7", "]": "\xE9", "`": "\xF9", "{": "\xE0", "|": "\xF2", "}": "\xE8", "~": "\xEC" }, t2.CHARSETS.E = t2.CHARSETS[6] = { "@": "\xC4", "[": "\xC6", "\\": "\xD8", "]": "\xC5", "^": "\xDC", "`": "\xE4", "{": "\xE6", "|": "\xF8", "}": "\xE5", "~": "\xFC" }, t2.CHARSETS.Z = { "#": "\xA3", "@": "\xA7", "[": "\xA1", "\\": "\xD1", "]": "\xBF", "{": "\xB0", "|": "\xF1", "}": "\xE7" }, t2.CHARSETS.H = t2.CHARSETS[7] = { "@": "\xC9", "[": "\xC4", "\\": "\xD6", "]": "\xC5", "^": "\xDC", "`": "\xE9", "{": "\xE4", "|": "\xF6", "}": "\xE5", "~": "\xFC" }, t2.CHARSETS["="] = { "#": "\xF9", "@": "\xE0", "[": "\xE9", "\\": "\xE7", "]": "\xEA", "^": "\xEE", _: "\xE8", "`": "\xF4", "{": "\xE4", "|": "\xF6", "}": "\xFC", "~": "\xFB" };
      }, 2584: (e2, t2) => {
        var i2, s2, r;
        Object.defineProperty(t2, "__esModule", { value: true }), t2.C1_ESCAPED = t2.C1 = t2.C0 = void 0, function(e3) {
          e3.NUL = "\0", e3.SOH = "", e3.STX = "", e3.ETX = "", e3.EOT = "", e3.ENQ = "", e3.ACK = "", e3.BEL = "\x07", e3.BS = "\b", e3.HT = "	", e3.LF = "\n", e3.VT = "\v", e3.FF = "\f", e3.CR = "\r", e3.SO = "", e3.SI = "", e3.DLE = "", e3.DC1 = "", e3.DC2 = "", e3.DC3 = "", e3.DC4 = "", e3.NAK = "", e3.SYN = "", e3.ETB = "", e3.CAN = "", e3.EM = "", e3.SUB = "", e3.ESC = "\x1B", e3.FS = "", e3.GS = "", e3.RS = "", e3.US = "", e3.SP = " ", e3.DEL = "\x7F";
        }(i2 || (t2.C0 = i2 = {})), function(e3) {
          e3.PAD = "\x80", e3.HOP = "\x81", e3.BPH = "\x82", e3.NBH = "\x83", e3.IND = "\x84", e3.NEL = "\x85", e3.SSA = "\x86", e3.ESA = "\x87", e3.HTS = "\x88", e3.HTJ = "\x89", e3.VTS = "\x8A", e3.PLD = "\x8B", e3.PLU = "\x8C", e3.RI = "\x8D", e3.SS2 = "\x8E", e3.SS3 = "\x8F", e3.DCS = "\x90", e3.PU1 = "\x91", e3.PU2 = "\x92", e3.STS = "\x93", e3.CCH = "\x94", e3.MW = "\x95", e3.SPA = "\x96", e3.EPA = "\x97", e3.SOS = "\x98", e3.SGCI = "\x99", e3.SCI = "\x9A", e3.CSI = "\x9B", e3.ST = "\x9C", e3.OSC = "\x9D", e3.PM = "\x9E", e3.APC = "\x9F";
        }(s2 || (t2.C1 = s2 = {})), function(e3) {
          e3.ST = `${i2.ESC}\\`;
        }(r || (t2.C1_ESCAPED = r = {}));
      }, 7399: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.evaluateKeyboardEvent = void 0;
        const s2 = i2(2584), r = { 48: ["0", ")"], 49: ["1", "!"], 50: ["2", "@"], 51: ["3", "#"], 52: ["4", "$"], 53: ["5", "%"], 54: ["6", "^"], 55: ["7", "&"], 56: ["8", "*"], 57: ["9", "("], 186: [";", ":"], 187: ["=", "+"], 188: [",", "<"], 189: ["-", "_"], 190: [".", ">"], 191: ["/", "?"], 192: ["`", "~"], 219: ["[", "{"], 220: ["\\", "|"], 221: ["]", "}"], 222: ["'", '"'] };
        t2.evaluateKeyboardEvent = function(e3, t3, i3, n) {
          const o2 = { type: 0, cancel: false, key: void 0 }, a2 = (e3.shiftKey ? 1 : 0) | (e3.altKey ? 2 : 0) | (e3.ctrlKey ? 4 : 0) | (e3.metaKey ? 8 : 0);
          switch (e3.keyCode) {
            case 0:
              "UIKeyInputUpArrow" === e3.key ? o2.key = t3 ? s2.C0.ESC + "OA" : s2.C0.ESC + "[A" : "UIKeyInputLeftArrow" === e3.key ? o2.key = t3 ? s2.C0.ESC + "OD" : s2.C0.ESC + "[D" : "UIKeyInputRightArrow" === e3.key ? o2.key = t3 ? s2.C0.ESC + "OC" : s2.C0.ESC + "[C" : "UIKeyInputDownArrow" === e3.key && (o2.key = t3 ? s2.C0.ESC + "OB" : s2.C0.ESC + "[B");
              break;
            case 8:
              if (e3.altKey) {
                o2.key = s2.C0.ESC + s2.C0.DEL;
                break;
              }
              o2.key = s2.C0.DEL;
              break;
            case 9:
              if (e3.shiftKey) {
                o2.key = s2.C0.ESC + "[Z";
                break;
              }
              o2.key = s2.C0.HT, o2.cancel = true;
              break;
            case 13:
              o2.key = e3.altKey ? s2.C0.ESC + s2.C0.CR : s2.C0.CR, o2.cancel = true;
              break;
            case 27:
              o2.key = s2.C0.ESC, e3.altKey && (o2.key = s2.C0.ESC + s2.C0.ESC), o2.cancel = true;
              break;
            case 37:
              if (e3.metaKey) break;
              a2 ? (o2.key = s2.C0.ESC + "[1;" + (a2 + 1) + "D", o2.key === s2.C0.ESC + "[1;3D" && (o2.key = s2.C0.ESC + (i3 ? "b" : "[1;5D"))) : o2.key = t3 ? s2.C0.ESC + "OD" : s2.C0.ESC + "[D";
              break;
            case 39:
              if (e3.metaKey) break;
              a2 ? (o2.key = s2.C0.ESC + "[1;" + (a2 + 1) + "C", o2.key === s2.C0.ESC + "[1;3C" && (o2.key = s2.C0.ESC + (i3 ? "f" : "[1;5C"))) : o2.key = t3 ? s2.C0.ESC + "OC" : s2.C0.ESC + "[C";
              break;
            case 38:
              if (e3.metaKey) break;
              a2 ? (o2.key = s2.C0.ESC + "[1;" + (a2 + 1) + "A", i3 || o2.key !== s2.C0.ESC + "[1;3A" || (o2.key = s2.C0.ESC + "[1;5A")) : o2.key = t3 ? s2.C0.ESC + "OA" : s2.C0.ESC + "[A";
              break;
            case 40:
              if (e3.metaKey) break;
              a2 ? (o2.key = s2.C0.ESC + "[1;" + (a2 + 1) + "B", i3 || o2.key !== s2.C0.ESC + "[1;3B" || (o2.key = s2.C0.ESC + "[1;5B")) : o2.key = t3 ? s2.C0.ESC + "OB" : s2.C0.ESC + "[B";
              break;
            case 45:
              e3.shiftKey || e3.ctrlKey || (o2.key = s2.C0.ESC + "[2~");
              break;
            case 46:
              o2.key = a2 ? s2.C0.ESC + "[3;" + (a2 + 1) + "~" : s2.C0.ESC + "[3~";
              break;
            case 36:
              o2.key = a2 ? s2.C0.ESC + "[1;" + (a2 + 1) + "H" : t3 ? s2.C0.ESC + "OH" : s2.C0.ESC + "[H";
              break;
            case 35:
              o2.key = a2 ? s2.C0.ESC + "[1;" + (a2 + 1) + "F" : t3 ? s2.C0.ESC + "OF" : s2.C0.ESC + "[F";
              break;
            case 33:
              e3.shiftKey ? o2.type = 2 : e3.ctrlKey ? o2.key = s2.C0.ESC + "[5;" + (a2 + 1) + "~" : o2.key = s2.C0.ESC + "[5~";
              break;
            case 34:
              e3.shiftKey ? o2.type = 3 : e3.ctrlKey ? o2.key = s2.C0.ESC + "[6;" + (a2 + 1) + "~" : o2.key = s2.C0.ESC + "[6~";
              break;
            case 112:
              o2.key = a2 ? s2.C0.ESC + "[1;" + (a2 + 1) + "P" : s2.C0.ESC + "OP";
              break;
            case 113:
              o2.key = a2 ? s2.C0.ESC + "[1;" + (a2 + 1) + "Q" : s2.C0.ESC + "OQ";
              break;
            case 114:
              o2.key = a2 ? s2.C0.ESC + "[1;" + (a2 + 1) + "R" : s2.C0.ESC + "OR";
              break;
            case 115:
              o2.key = a2 ? s2.C0.ESC + "[1;" + (a2 + 1) + "S" : s2.C0.ESC + "OS";
              break;
            case 116:
              o2.key = a2 ? s2.C0.ESC + "[15;" + (a2 + 1) + "~" : s2.C0.ESC + "[15~";
              break;
            case 117:
              o2.key = a2 ? s2.C0.ESC + "[17;" + (a2 + 1) + "~" : s2.C0.ESC + "[17~";
              break;
            case 118:
              o2.key = a2 ? s2.C0.ESC + "[18;" + (a2 + 1) + "~" : s2.C0.ESC + "[18~";
              break;
            case 119:
              o2.key = a2 ? s2.C0.ESC + "[19;" + (a2 + 1) + "~" : s2.C0.ESC + "[19~";
              break;
            case 120:
              o2.key = a2 ? s2.C0.ESC + "[20;" + (a2 + 1) + "~" : s2.C0.ESC + "[20~";
              break;
            case 121:
              o2.key = a2 ? s2.C0.ESC + "[21;" + (a2 + 1) + "~" : s2.C0.ESC + "[21~";
              break;
            case 122:
              o2.key = a2 ? s2.C0.ESC + "[23;" + (a2 + 1) + "~" : s2.C0.ESC + "[23~";
              break;
            case 123:
              o2.key = a2 ? s2.C0.ESC + "[24;" + (a2 + 1) + "~" : s2.C0.ESC + "[24~";
              break;
            default:
              if (!e3.ctrlKey || e3.shiftKey || e3.altKey || e3.metaKey) if (i3 && !n || !e3.altKey || e3.metaKey) !i3 || e3.altKey || e3.ctrlKey || e3.shiftKey || !e3.metaKey ? e3.key && !e3.ctrlKey && !e3.altKey && !e3.metaKey && e3.keyCode >= 48 && 1 === e3.key.length ? o2.key = e3.key : e3.key && e3.ctrlKey && ("_" === e3.key && (o2.key = s2.C0.US), "@" === e3.key && (o2.key = s2.C0.NUL)) : 65 === e3.keyCode && (o2.type = 1);
              else {
                const t4 = r[e3.keyCode], i4 = null == t4 ? void 0 : t4[e3.shiftKey ? 1 : 0];
                if (i4) o2.key = s2.C0.ESC + i4;
                else if (e3.keyCode >= 65 && e3.keyCode <= 90) {
                  const t5 = e3.ctrlKey ? e3.keyCode - 64 : e3.keyCode + 32;
                  let i5 = String.fromCharCode(t5);
                  e3.shiftKey && (i5 = i5.toUpperCase()), o2.key = s2.C0.ESC + i5;
                } else if (32 === e3.keyCode) o2.key = s2.C0.ESC + (e3.ctrlKey ? s2.C0.NUL : " ");
                else if ("Dead" === e3.key && e3.code.startsWith("Key")) {
                  let t5 = e3.code.slice(3, 4);
                  e3.shiftKey || (t5 = t5.toLowerCase()), o2.key = s2.C0.ESC + t5, o2.cancel = true;
                }
              }
              else e3.keyCode >= 65 && e3.keyCode <= 90 ? o2.key = String.fromCharCode(e3.keyCode - 64) : 32 === e3.keyCode ? o2.key = s2.C0.NUL : e3.keyCode >= 51 && e3.keyCode <= 55 ? o2.key = String.fromCharCode(e3.keyCode - 51 + 27) : 56 === e3.keyCode ? o2.key = s2.C0.DEL : 219 === e3.keyCode ? o2.key = s2.C0.ESC : 220 === e3.keyCode ? o2.key = s2.C0.FS : 221 === e3.keyCode && (o2.key = s2.C0.GS);
          }
          return o2;
        };
      }, 482: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Utf8ToUtf32 = t2.StringToUtf32 = t2.utf32ToString = t2.stringFromCodePoint = void 0, t2.stringFromCodePoint = function(e3) {
          return e3 > 65535 ? (e3 -= 65536, String.fromCharCode(55296 + (e3 >> 10)) + String.fromCharCode(e3 % 1024 + 56320)) : String.fromCharCode(e3);
        }, t2.utf32ToString = function(e3, t3 = 0, i2 = e3.length) {
          let s2 = "";
          for (let r = t3; r < i2; ++r) {
            let t4 = e3[r];
            t4 > 65535 ? (t4 -= 65536, s2 += String.fromCharCode(55296 + (t4 >> 10)) + String.fromCharCode(t4 % 1024 + 56320)) : s2 += String.fromCharCode(t4);
          }
          return s2;
        }, t2.StringToUtf32 = class {
          constructor() {
            this._interim = 0;
          }
          clear() {
            this._interim = 0;
          }
          decode(e3, t3) {
            const i2 = e3.length;
            if (!i2) return 0;
            let s2 = 0, r = 0;
            if (this._interim) {
              const i3 = e3.charCodeAt(r++);
              56320 <= i3 && i3 <= 57343 ? t3[s2++] = 1024 * (this._interim - 55296) + i3 - 56320 + 65536 : (t3[s2++] = this._interim, t3[s2++] = i3), this._interim = 0;
            }
            for (let n = r; n < i2; ++n) {
              const r2 = e3.charCodeAt(n);
              if (55296 <= r2 && r2 <= 56319) {
                if (++n >= i2) return this._interim = r2, s2;
                const o2 = e3.charCodeAt(n);
                56320 <= o2 && o2 <= 57343 ? t3[s2++] = 1024 * (r2 - 55296) + o2 - 56320 + 65536 : (t3[s2++] = r2, t3[s2++] = o2);
              } else 65279 !== r2 && (t3[s2++] = r2);
            }
            return s2;
          }
        }, t2.Utf8ToUtf32 = class {
          constructor() {
            this.interim = new Uint8Array(3);
          }
          clear() {
            this.interim.fill(0);
          }
          decode(e3, t3) {
            const i2 = e3.length;
            if (!i2) return 0;
            let s2, r, n, o2, a2 = 0, h2 = 0, c2 = 0;
            if (this.interim[0]) {
              let s3 = false, r2 = this.interim[0];
              r2 &= 192 == (224 & r2) ? 31 : 224 == (240 & r2) ? 15 : 7;
              let n2, o3 = 0;
              for (; (n2 = 63 & this.interim[++o3]) && o3 < 4; ) r2 <<= 6, r2 |= n2;
              const h3 = 192 == (224 & this.interim[0]) ? 2 : 224 == (240 & this.interim[0]) ? 3 : 4, l3 = h3 - o3;
              for (; c2 < l3; ) {
                if (c2 >= i2) return 0;
                if (n2 = e3[c2++], 128 != (192 & n2)) {
                  c2--, s3 = true;
                  break;
                }
                this.interim[o3++] = n2, r2 <<= 6, r2 |= 63 & n2;
              }
              s3 || (2 === h3 ? r2 < 128 ? c2-- : t3[a2++] = r2 : 3 === h3 ? r2 < 2048 || r2 >= 55296 && r2 <= 57343 || 65279 === r2 || (t3[a2++] = r2) : r2 < 65536 || r2 > 1114111 || (t3[a2++] = r2)), this.interim.fill(0);
            }
            const l2 = i2 - 4;
            let d = c2;
            for (; d < i2; ) {
              for (; !(!(d < l2) || 128 & (s2 = e3[d]) || 128 & (r = e3[d + 1]) || 128 & (n = e3[d + 2]) || 128 & (o2 = e3[d + 3])); ) t3[a2++] = s2, t3[a2++] = r, t3[a2++] = n, t3[a2++] = o2, d += 4;
              if (s2 = e3[d++], s2 < 128) t3[a2++] = s2;
              else if (192 == (224 & s2)) {
                if (d >= i2) return this.interim[0] = s2, a2;
                if (r = e3[d++], 128 != (192 & r)) {
                  d--;
                  continue;
                }
                if (h2 = (31 & s2) << 6 | 63 & r, h2 < 128) {
                  d--;
                  continue;
                }
                t3[a2++] = h2;
              } else if (224 == (240 & s2)) {
                if (d >= i2) return this.interim[0] = s2, a2;
                if (r = e3[d++], 128 != (192 & r)) {
                  d--;
                  continue;
                }
                if (d >= i2) return this.interim[0] = s2, this.interim[1] = r, a2;
                if (n = e3[d++], 128 != (192 & n)) {
                  d--;
                  continue;
                }
                if (h2 = (15 & s2) << 12 | (63 & r) << 6 | 63 & n, h2 < 2048 || h2 >= 55296 && h2 <= 57343 || 65279 === h2) continue;
                t3[a2++] = h2;
              } else if (240 == (248 & s2)) {
                if (d >= i2) return this.interim[0] = s2, a2;
                if (r = e3[d++], 128 != (192 & r)) {
                  d--;
                  continue;
                }
                if (d >= i2) return this.interim[0] = s2, this.interim[1] = r, a2;
                if (n = e3[d++], 128 != (192 & n)) {
                  d--;
                  continue;
                }
                if (d >= i2) return this.interim[0] = s2, this.interim[1] = r, this.interim[2] = n, a2;
                if (o2 = e3[d++], 128 != (192 & o2)) {
                  d--;
                  continue;
                }
                if (h2 = (7 & s2) << 18 | (63 & r) << 12 | (63 & n) << 6 | 63 & o2, h2 < 65536 || h2 > 1114111) continue;
                t3[a2++] = h2;
              }
            }
            return a2;
          }
        };
      }, 225: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.UnicodeV6 = void 0;
        const i2 = [[768, 879], [1155, 1158], [1160, 1161], [1425, 1469], [1471, 1471], [1473, 1474], [1476, 1477], [1479, 1479], [1536, 1539], [1552, 1557], [1611, 1630], [1648, 1648], [1750, 1764], [1767, 1768], [1770, 1773], [1807, 1807], [1809, 1809], [1840, 1866], [1958, 1968], [2027, 2035], [2305, 2306], [2364, 2364], [2369, 2376], [2381, 2381], [2385, 2388], [2402, 2403], [2433, 2433], [2492, 2492], [2497, 2500], [2509, 2509], [2530, 2531], [2561, 2562], [2620, 2620], [2625, 2626], [2631, 2632], [2635, 2637], [2672, 2673], [2689, 2690], [2748, 2748], [2753, 2757], [2759, 2760], [2765, 2765], [2786, 2787], [2817, 2817], [2876, 2876], [2879, 2879], [2881, 2883], [2893, 2893], [2902, 2902], [2946, 2946], [3008, 3008], [3021, 3021], [3134, 3136], [3142, 3144], [3146, 3149], [3157, 3158], [3260, 3260], [3263, 3263], [3270, 3270], [3276, 3277], [3298, 3299], [3393, 3395], [3405, 3405], [3530, 3530], [3538, 3540], [3542, 3542], [3633, 3633], [3636, 3642], [3655, 3662], [3761, 3761], [3764, 3769], [3771, 3772], [3784, 3789], [3864, 3865], [3893, 3893], [3895, 3895], [3897, 3897], [3953, 3966], [3968, 3972], [3974, 3975], [3984, 3991], [3993, 4028], [4038, 4038], [4141, 4144], [4146, 4146], [4150, 4151], [4153, 4153], [4184, 4185], [4448, 4607], [4959, 4959], [5906, 5908], [5938, 5940], [5970, 5971], [6002, 6003], [6068, 6069], [6071, 6077], [6086, 6086], [6089, 6099], [6109, 6109], [6155, 6157], [6313, 6313], [6432, 6434], [6439, 6440], [6450, 6450], [6457, 6459], [6679, 6680], [6912, 6915], [6964, 6964], [6966, 6970], [6972, 6972], [6978, 6978], [7019, 7027], [7616, 7626], [7678, 7679], [8203, 8207], [8234, 8238], [8288, 8291], [8298, 8303], [8400, 8431], [12330, 12335], [12441, 12442], [43014, 43014], [43019, 43019], [43045, 43046], [64286, 64286], [65024, 65039], [65056, 65059], [65279, 65279], [65529, 65531]], s2 = [[68097, 68099], [68101, 68102], [68108, 68111], [68152, 68154], [68159, 68159], [119143, 119145], [119155, 119170], [119173, 119179], [119210, 119213], [119362, 119364], [917505, 917505], [917536, 917631], [917760, 917999]];
        let r;
        t2.UnicodeV6 = class {
          constructor() {
            if (this.version = "6", !r) {
              r = new Uint8Array(65536), r.fill(1), r[0] = 0, r.fill(0, 1, 32), r.fill(0, 127, 160), r.fill(2, 4352, 4448), r[9001] = 2, r[9002] = 2, r.fill(2, 11904, 42192), r[12351] = 1, r.fill(2, 44032, 55204), r.fill(2, 63744, 64256), r.fill(2, 65040, 65050), r.fill(2, 65072, 65136), r.fill(2, 65280, 65377), r.fill(2, 65504, 65511);
              for (let e3 = 0; e3 < i2.length; ++e3) r.fill(0, i2[e3][0], i2[e3][1] + 1);
            }
          }
          wcwidth(e3) {
            return e3 < 32 ? 0 : e3 < 127 ? 1 : e3 < 65536 ? r[e3] : function(e4, t3) {
              let i3, s3 = 0, r2 = t3.length - 1;
              if (e4 < t3[0][0] || e4 > t3[r2][1]) return false;
              for (; r2 >= s3; ) if (i3 = s3 + r2 >> 1, e4 > t3[i3][1]) s3 = i3 + 1;
              else {
                if (!(e4 < t3[i3][0])) return true;
                r2 = i3 - 1;
              }
              return false;
            }(e3, s2) ? 0 : e3 >= 131072 && e3 <= 196605 || e3 >= 196608 && e3 <= 262141 ? 2 : 1;
          }
        };
      }, 5981: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.WriteBuffer = void 0;
        const s2 = i2(8460), r = i2(844);
        class n extends r.Disposable {
          constructor(e3) {
            super(), this._action = e3, this._writeBuffer = [], this._callbacks = [], this._pendingData = 0, this._bufferOffset = 0, this._isSyncWriting = false, this._syncCalls = 0, this._didUserInput = false, this._onWriteParsed = this.register(new s2.EventEmitter()), this.onWriteParsed = this._onWriteParsed.event;
          }
          handleUserInput() {
            this._didUserInput = true;
          }
          writeSync(e3, t3) {
            if (void 0 !== t3 && this._syncCalls > t3) return void (this._syncCalls = 0);
            if (this._pendingData += e3.length, this._writeBuffer.push(e3), this._callbacks.push(void 0), this._syncCalls++, this._isSyncWriting) return;
            let i3;
            for (this._isSyncWriting = true; i3 = this._writeBuffer.shift(); ) {
              this._action(i3);
              const e4 = this._callbacks.shift();
              e4 && e4();
            }
            this._pendingData = 0, this._bufferOffset = 2147483647, this._isSyncWriting = false, this._syncCalls = 0;
          }
          write(e3, t3) {
            if (this._pendingData > 5e7) throw new Error("write data discarded, use flow control to avoid losing data");
            if (!this._writeBuffer.length) {
              if (this._bufferOffset = 0, this._didUserInput) return this._didUserInput = false, this._pendingData += e3.length, this._writeBuffer.push(e3), this._callbacks.push(t3), void this._innerWrite();
              setTimeout(() => this._innerWrite());
            }
            this._pendingData += e3.length, this._writeBuffer.push(e3), this._callbacks.push(t3);
          }
          _innerWrite(e3 = 0, t3 = true) {
            const i3 = e3 || Date.now();
            for (; this._writeBuffer.length > this._bufferOffset; ) {
              const e4 = this._writeBuffer[this._bufferOffset], s3 = this._action(e4, t3);
              if (s3) {
                const e5 = (e6) => Date.now() - i3 >= 12 ? setTimeout(() => this._innerWrite(0, e6)) : this._innerWrite(i3, e6);
                return void s3.catch((e6) => (queueMicrotask(() => {
                  throw e6;
                }), Promise.resolve(false))).then(e5);
              }
              const r2 = this._callbacks[this._bufferOffset];
              if (r2 && r2(), this._bufferOffset++, this._pendingData -= e4.length, Date.now() - i3 >= 12) break;
            }
            this._writeBuffer.length > this._bufferOffset ? (this._bufferOffset > 50 && (this._writeBuffer = this._writeBuffer.slice(this._bufferOffset), this._callbacks = this._callbacks.slice(this._bufferOffset), this._bufferOffset = 0), setTimeout(() => this._innerWrite())) : (this._writeBuffer.length = 0, this._callbacks.length = 0, this._pendingData = 0, this._bufferOffset = 0), this._onWriteParsed.fire();
          }
        }
        t2.WriteBuffer = n;
      }, 5941: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.toRgbString = t2.parseColor = void 0;
        const i2 = /^([\da-f])\/([\da-f])\/([\da-f])$|^([\da-f]{2})\/([\da-f]{2})\/([\da-f]{2})$|^([\da-f]{3})\/([\da-f]{3})\/([\da-f]{3})$|^([\da-f]{4})\/([\da-f]{4})\/([\da-f]{4})$/, s2 = /^[\da-f]+$/;
        function r(e3, t3) {
          const i3 = e3.toString(16), s3 = i3.length < 2 ? "0" + i3 : i3;
          switch (t3) {
            case 4:
              return i3[0];
            case 8:
              return s3;
            case 12:
              return (s3 + s3).slice(0, 3);
            default:
              return s3 + s3;
          }
        }
        t2.parseColor = function(e3) {
          if (!e3) return;
          let t3 = e3.toLowerCase();
          if (0 === t3.indexOf("rgb:")) {
            t3 = t3.slice(4);
            const e4 = i2.exec(t3);
            if (e4) {
              const t4 = e4[1] ? 15 : e4[4] ? 255 : e4[7] ? 4095 : 65535;
              return [Math.round(parseInt(e4[1] || e4[4] || e4[7] || e4[10], 16) / t4 * 255), Math.round(parseInt(e4[2] || e4[5] || e4[8] || e4[11], 16) / t4 * 255), Math.round(parseInt(e4[3] || e4[6] || e4[9] || e4[12], 16) / t4 * 255)];
            }
          } else if (0 === t3.indexOf("#") && (t3 = t3.slice(1), s2.exec(t3) && [3, 6, 9, 12].includes(t3.length))) {
            const e4 = t3.length / 3, i3 = [0, 0, 0];
            for (let s3 = 0; s3 < 3; ++s3) {
              const r2 = parseInt(t3.slice(e4 * s3, e4 * s3 + e4), 16);
              i3[s3] = 1 === e4 ? r2 << 4 : 2 === e4 ? r2 : 3 === e4 ? r2 >> 4 : r2 >> 8;
            }
            return i3;
          }
        }, t2.toRgbString = function(e3, t3 = 16) {
          const [i3, s3, n] = e3;
          return `rgb:${r(i3, t3)}/${r(s3, t3)}/${r(n, t3)}`;
        };
      }, 5770: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.PAYLOAD_LIMIT = void 0, t2.PAYLOAD_LIMIT = 1e7;
      }, 6351: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DcsHandler = t2.DcsParser = void 0;
        const s2 = i2(482), r = i2(8742), n = i2(5770), o2 = [];
        t2.DcsParser = class {
          constructor() {
            this._handlers = /* @__PURE__ */ Object.create(null), this._active = o2, this._ident = 0, this._handlerFb = () => {
            }, this._stack = { paused: false, loopPosition: 0, fallThrough: false };
          }
          dispose() {
            this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
            }, this._active = o2;
          }
          registerHandler(e3, t3) {
            void 0 === this._handlers[e3] && (this._handlers[e3] = []);
            const i3 = this._handlers[e3];
            return i3.push(t3), { dispose: () => {
              const e4 = i3.indexOf(t3);
              -1 !== e4 && i3.splice(e4, 1);
            } };
          }
          clearHandler(e3) {
            this._handlers[e3] && delete this._handlers[e3];
          }
          setHandlerFallback(e3) {
            this._handlerFb = e3;
          }
          reset() {
            if (this._active.length) for (let e3 = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; e3 >= 0; --e3) this._active[e3].unhook(false);
            this._stack.paused = false, this._active = o2, this._ident = 0;
          }
          hook(e3, t3) {
            if (this.reset(), this._ident = e3, this._active = this._handlers[e3] || o2, this._active.length) for (let e4 = this._active.length - 1; e4 >= 0; e4--) this._active[e4].hook(t3);
            else this._handlerFb(this._ident, "HOOK", t3);
          }
          put(e3, t3, i3) {
            if (this._active.length) for (let s3 = this._active.length - 1; s3 >= 0; s3--) this._active[s3].put(e3, t3, i3);
            else this._handlerFb(this._ident, "PUT", (0, s2.utf32ToString)(e3, t3, i3));
          }
          unhook(e3, t3 = true) {
            if (this._active.length) {
              let i3 = false, s3 = this._active.length - 1, r2 = false;
              if (this._stack.paused && (s3 = this._stack.loopPosition - 1, i3 = t3, r2 = this._stack.fallThrough, this._stack.paused = false), !r2 && false === i3) {
                for (; s3 >= 0 && (i3 = this._active[s3].unhook(e3), true !== i3); s3--) if (i3 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = s3, this._stack.fallThrough = false, i3;
                s3--;
              }
              for (; s3 >= 0; s3--) if (i3 = this._active[s3].unhook(false), i3 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = s3, this._stack.fallThrough = true, i3;
            } else this._handlerFb(this._ident, "UNHOOK", e3);
            this._active = o2, this._ident = 0;
          }
        };
        const a2 = new r.Params();
        a2.addParam(0), t2.DcsHandler = class {
          constructor(e3) {
            this._handler = e3, this._data = "", this._params = a2, this._hitLimit = false;
          }
          hook(e3) {
            this._params = e3.length > 1 || e3.params[0] ? e3.clone() : a2, this._data = "", this._hitLimit = false;
          }
          put(e3, t3, i3) {
            this._hitLimit || (this._data += (0, s2.utf32ToString)(e3, t3, i3), this._data.length > n.PAYLOAD_LIMIT && (this._data = "", this._hitLimit = true));
          }
          unhook(e3) {
            let t3 = false;
            if (this._hitLimit) t3 = false;
            else if (e3 && (t3 = this._handler(this._data, this._params), t3 instanceof Promise)) return t3.then((e4) => (this._params = a2, this._data = "", this._hitLimit = false, e4));
            return this._params = a2, this._data = "", this._hitLimit = false, t3;
          }
        };
      }, 2015: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.EscapeSequenceParser = t2.VT500_TRANSITION_TABLE = t2.TransitionTable = void 0;
        const s2 = i2(844), r = i2(8742), n = i2(6242), o2 = i2(6351);
        class a2 {
          constructor(e3) {
            this.table = new Uint8Array(e3);
          }
          setDefault(e3, t3) {
            this.table.fill(e3 << 4 | t3);
          }
          add(e3, t3, i3, s3) {
            this.table[t3 << 8 | e3] = i3 << 4 | s3;
          }
          addMany(e3, t3, i3, s3) {
            for (let r2 = 0; r2 < e3.length; r2++) this.table[t3 << 8 | e3[r2]] = i3 << 4 | s3;
          }
        }
        t2.TransitionTable = a2;
        const h2 = 160;
        t2.VT500_TRANSITION_TABLE = function() {
          const e3 = new a2(4095), t3 = Array.apply(null, Array(256)).map((e4, t4) => t4), i3 = (e4, i4) => t3.slice(e4, i4), s3 = i3(32, 127), r2 = i3(0, 24);
          r2.push(25), r2.push.apply(r2, i3(28, 32));
          const n2 = i3(0, 14);
          let o3;
          for (o3 in e3.setDefault(1, 0), e3.addMany(s3, 0, 2, 0), n2) e3.addMany([24, 26, 153, 154], o3, 3, 0), e3.addMany(i3(128, 144), o3, 3, 0), e3.addMany(i3(144, 152), o3, 3, 0), e3.add(156, o3, 0, 0), e3.add(27, o3, 11, 1), e3.add(157, o3, 4, 8), e3.addMany([152, 158, 159], o3, 0, 7), e3.add(155, o3, 11, 3), e3.add(144, o3, 11, 9);
          return e3.addMany(r2, 0, 3, 0), e3.addMany(r2, 1, 3, 1), e3.add(127, 1, 0, 1), e3.addMany(r2, 8, 0, 8), e3.addMany(r2, 3, 3, 3), e3.add(127, 3, 0, 3), e3.addMany(r2, 4, 3, 4), e3.add(127, 4, 0, 4), e3.addMany(r2, 6, 3, 6), e3.addMany(r2, 5, 3, 5), e3.add(127, 5, 0, 5), e3.addMany(r2, 2, 3, 2), e3.add(127, 2, 0, 2), e3.add(93, 1, 4, 8), e3.addMany(s3, 8, 5, 8), e3.add(127, 8, 5, 8), e3.addMany([156, 27, 24, 26, 7], 8, 6, 0), e3.addMany(i3(28, 32), 8, 0, 8), e3.addMany([88, 94, 95], 1, 0, 7), e3.addMany(s3, 7, 0, 7), e3.addMany(r2, 7, 0, 7), e3.add(156, 7, 0, 0), e3.add(127, 7, 0, 7), e3.add(91, 1, 11, 3), e3.addMany(i3(64, 127), 3, 7, 0), e3.addMany(i3(48, 60), 3, 8, 4), e3.addMany([60, 61, 62, 63], 3, 9, 4), e3.addMany(i3(48, 60), 4, 8, 4), e3.addMany(i3(64, 127), 4, 7, 0), e3.addMany([60, 61, 62, 63], 4, 0, 6), e3.addMany(i3(32, 64), 6, 0, 6), e3.add(127, 6, 0, 6), e3.addMany(i3(64, 127), 6, 0, 0), e3.addMany(i3(32, 48), 3, 9, 5), e3.addMany(i3(32, 48), 5, 9, 5), e3.addMany(i3(48, 64), 5, 0, 6), e3.addMany(i3(64, 127), 5, 7, 0), e3.addMany(i3(32, 48), 4, 9, 5), e3.addMany(i3(32, 48), 1, 9, 2), e3.addMany(i3(32, 48), 2, 9, 2), e3.addMany(i3(48, 127), 2, 10, 0), e3.addMany(i3(48, 80), 1, 10, 0), e3.addMany(i3(81, 88), 1, 10, 0), e3.addMany([89, 90, 92], 1, 10, 0), e3.addMany(i3(96, 127), 1, 10, 0), e3.add(80, 1, 11, 9), e3.addMany(r2, 9, 0, 9), e3.add(127, 9, 0, 9), e3.addMany(i3(28, 32), 9, 0, 9), e3.addMany(i3(32, 48), 9, 9, 12), e3.addMany(i3(48, 60), 9, 8, 10), e3.addMany([60, 61, 62, 63], 9, 9, 10), e3.addMany(r2, 11, 0, 11), e3.addMany(i3(32, 128), 11, 0, 11), e3.addMany(i3(28, 32), 11, 0, 11), e3.addMany(r2, 10, 0, 10), e3.add(127, 10, 0, 10), e3.addMany(i3(28, 32), 10, 0, 10), e3.addMany(i3(48, 60), 10, 8, 10), e3.addMany([60, 61, 62, 63], 10, 0, 11), e3.addMany(i3(32, 48), 10, 9, 12), e3.addMany(r2, 12, 0, 12), e3.add(127, 12, 0, 12), e3.addMany(i3(28, 32), 12, 0, 12), e3.addMany(i3(32, 48), 12, 9, 12), e3.addMany(i3(48, 64), 12, 0, 11), e3.addMany(i3(64, 127), 12, 12, 13), e3.addMany(i3(64, 127), 10, 12, 13), e3.addMany(i3(64, 127), 9, 12, 13), e3.addMany(r2, 13, 13, 13), e3.addMany(s3, 13, 13, 13), e3.add(127, 13, 0, 13), e3.addMany([27, 156, 24, 26], 13, 14, 0), e3.add(h2, 0, 2, 0), e3.add(h2, 8, 5, 8), e3.add(h2, 6, 0, 6), e3.add(h2, 11, 0, 11), e3.add(h2, 13, 13, 13), e3;
        }();
        class c2 extends s2.Disposable {
          constructor(e3 = t2.VT500_TRANSITION_TABLE) {
            super(), this._transitions = e3, this._parseStack = { state: 0, handlers: [], handlerPos: 0, transition: 0, chunkPos: 0 }, this.initialState = 0, this.currentState = this.initialState, this._params = new r.Params(), this._params.addParam(0), this._collect = 0, this.precedingCodepoint = 0, this._printHandlerFb = (e4, t3, i3) => {
            }, this._executeHandlerFb = (e4) => {
            }, this._csiHandlerFb = (e4, t3) => {
            }, this._escHandlerFb = (e4) => {
            }, this._errorHandlerFb = (e4) => e4, this._printHandler = this._printHandlerFb, this._executeHandlers = /* @__PURE__ */ Object.create(null), this._csiHandlers = /* @__PURE__ */ Object.create(null), this._escHandlers = /* @__PURE__ */ Object.create(null), this.register((0, s2.toDisposable)(() => {
              this._csiHandlers = /* @__PURE__ */ Object.create(null), this._executeHandlers = /* @__PURE__ */ Object.create(null), this._escHandlers = /* @__PURE__ */ Object.create(null);
            })), this._oscParser = this.register(new n.OscParser()), this._dcsParser = this.register(new o2.DcsParser()), this._errorHandler = this._errorHandlerFb, this.registerEscHandler({ final: "\\" }, () => true);
          }
          _identifier(e3, t3 = [64, 126]) {
            let i3 = 0;
            if (e3.prefix) {
              if (e3.prefix.length > 1) throw new Error("only one byte as prefix supported");
              if (i3 = e3.prefix.charCodeAt(0), i3 && 60 > i3 || i3 > 63) throw new Error("prefix must be in range 0x3c .. 0x3f");
            }
            if (e3.intermediates) {
              if (e3.intermediates.length > 2) throw new Error("only two bytes as intermediates are supported");
              for (let t4 = 0; t4 < e3.intermediates.length; ++t4) {
                const s4 = e3.intermediates.charCodeAt(t4);
                if (32 > s4 || s4 > 47) throw new Error("intermediate must be in range 0x20 .. 0x2f");
                i3 <<= 8, i3 |= s4;
              }
            }
            if (1 !== e3.final.length) throw new Error("final must be a single byte");
            const s3 = e3.final.charCodeAt(0);
            if (t3[0] > s3 || s3 > t3[1]) throw new Error(`final must be in range ${t3[0]} .. ${t3[1]}`);
            return i3 <<= 8, i3 |= s3, i3;
          }
          identToString(e3) {
            const t3 = [];
            for (; e3; ) t3.push(String.fromCharCode(255 & e3)), e3 >>= 8;
            return t3.reverse().join("");
          }
          setPrintHandler(e3) {
            this._printHandler = e3;
          }
          clearPrintHandler() {
            this._printHandler = this._printHandlerFb;
          }
          registerEscHandler(e3, t3) {
            const i3 = this._identifier(e3, [48, 126]);
            void 0 === this._escHandlers[i3] && (this._escHandlers[i3] = []);
            const s3 = this._escHandlers[i3];
            return s3.push(t3), { dispose: () => {
              const e4 = s3.indexOf(t3);
              -1 !== e4 && s3.splice(e4, 1);
            } };
          }
          clearEscHandler(e3) {
            this._escHandlers[this._identifier(e3, [48, 126])] && delete this._escHandlers[this._identifier(e3, [48, 126])];
          }
          setEscHandlerFallback(e3) {
            this._escHandlerFb = e3;
          }
          setExecuteHandler(e3, t3) {
            this._executeHandlers[e3.charCodeAt(0)] = t3;
          }
          clearExecuteHandler(e3) {
            this._executeHandlers[e3.charCodeAt(0)] && delete this._executeHandlers[e3.charCodeAt(0)];
          }
          setExecuteHandlerFallback(e3) {
            this._executeHandlerFb = e3;
          }
          registerCsiHandler(e3, t3) {
            const i3 = this._identifier(e3);
            void 0 === this._csiHandlers[i3] && (this._csiHandlers[i3] = []);
            const s3 = this._csiHandlers[i3];
            return s3.push(t3), { dispose: () => {
              const e4 = s3.indexOf(t3);
              -1 !== e4 && s3.splice(e4, 1);
            } };
          }
          clearCsiHandler(e3) {
            this._csiHandlers[this._identifier(e3)] && delete this._csiHandlers[this._identifier(e3)];
          }
          setCsiHandlerFallback(e3) {
            this._csiHandlerFb = e3;
          }
          registerDcsHandler(e3, t3) {
            return this._dcsParser.registerHandler(this._identifier(e3), t3);
          }
          clearDcsHandler(e3) {
            this._dcsParser.clearHandler(this._identifier(e3));
          }
          setDcsHandlerFallback(e3) {
            this._dcsParser.setHandlerFallback(e3);
          }
          registerOscHandler(e3, t3) {
            return this._oscParser.registerHandler(e3, t3);
          }
          clearOscHandler(e3) {
            this._oscParser.clearHandler(e3);
          }
          setOscHandlerFallback(e3) {
            this._oscParser.setHandlerFallback(e3);
          }
          setErrorHandler(e3) {
            this._errorHandler = e3;
          }
          clearErrorHandler() {
            this._errorHandler = this._errorHandlerFb;
          }
          reset() {
            this.currentState = this.initialState, this._oscParser.reset(), this._dcsParser.reset(), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingCodepoint = 0, 0 !== this._parseStack.state && (this._parseStack.state = 2, this._parseStack.handlers = []);
          }
          _preserveStack(e3, t3, i3, s3, r2) {
            this._parseStack.state = e3, this._parseStack.handlers = t3, this._parseStack.handlerPos = i3, this._parseStack.transition = s3, this._parseStack.chunkPos = r2;
          }
          parse(e3, t3, i3) {
            let s3, r2 = 0, n2 = 0, o3 = 0;
            if (this._parseStack.state) if (2 === this._parseStack.state) this._parseStack.state = 0, o3 = this._parseStack.chunkPos + 1;
            else {
              if (void 0 === i3 || 1 === this._parseStack.state) throw this._parseStack.state = 1, new Error("improper continuation due to previous async handler, giving up parsing");
              const t4 = this._parseStack.handlers;
              let n3 = this._parseStack.handlerPos - 1;
              switch (this._parseStack.state) {
                case 3:
                  if (false === i3 && n3 > -1) {
                    for (; n3 >= 0 && (s3 = t4[n3](this._params), true !== s3); n3--) if (s3 instanceof Promise) return this._parseStack.handlerPos = n3, s3;
                  }
                  this._parseStack.handlers = [];
                  break;
                case 4:
                  if (false === i3 && n3 > -1) {
                    for (; n3 >= 0 && (s3 = t4[n3](), true !== s3); n3--) if (s3 instanceof Promise) return this._parseStack.handlerPos = n3, s3;
                  }
                  this._parseStack.handlers = [];
                  break;
                case 6:
                  if (r2 = e3[this._parseStack.chunkPos], s3 = this._dcsParser.unhook(24 !== r2 && 26 !== r2, i3), s3) return s3;
                  27 === r2 && (this._parseStack.transition |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0;
                  break;
                case 5:
                  if (r2 = e3[this._parseStack.chunkPos], s3 = this._oscParser.end(24 !== r2 && 26 !== r2, i3), s3) return s3;
                  27 === r2 && (this._parseStack.transition |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0;
              }
              this._parseStack.state = 0, o3 = this._parseStack.chunkPos + 1, this.precedingCodepoint = 0, this.currentState = 15 & this._parseStack.transition;
            }
            for (let i4 = o3; i4 < t3; ++i4) {
              switch (r2 = e3[i4], n2 = this._transitions.table[this.currentState << 8 | (r2 < 160 ? r2 : h2)], n2 >> 4) {
                case 2:
                  for (let s4 = i4 + 1; ; ++s4) {
                    if (s4 >= t3 || (r2 = e3[s4]) < 32 || r2 > 126 && r2 < h2) {
                      this._printHandler(e3, i4, s4), i4 = s4 - 1;
                      break;
                    }
                    if (++s4 >= t3 || (r2 = e3[s4]) < 32 || r2 > 126 && r2 < h2) {
                      this._printHandler(e3, i4, s4), i4 = s4 - 1;
                      break;
                    }
                    if (++s4 >= t3 || (r2 = e3[s4]) < 32 || r2 > 126 && r2 < h2) {
                      this._printHandler(e3, i4, s4), i4 = s4 - 1;
                      break;
                    }
                    if (++s4 >= t3 || (r2 = e3[s4]) < 32 || r2 > 126 && r2 < h2) {
                      this._printHandler(e3, i4, s4), i4 = s4 - 1;
                      break;
                    }
                  }
                  break;
                case 3:
                  this._executeHandlers[r2] ? this._executeHandlers[r2]() : this._executeHandlerFb(r2), this.precedingCodepoint = 0;
                  break;
                case 0:
                  break;
                case 1:
                  if (this._errorHandler({ position: i4, code: r2, currentState: this.currentState, collect: this._collect, params: this._params, abort: false }).abort) return;
                  break;
                case 7:
                  const o4 = this._csiHandlers[this._collect << 8 | r2];
                  let a3 = o4 ? o4.length - 1 : -1;
                  for (; a3 >= 0 && (s3 = o4[a3](this._params), true !== s3); a3--) if (s3 instanceof Promise) return this._preserveStack(3, o4, a3, n2, i4), s3;
                  a3 < 0 && this._csiHandlerFb(this._collect << 8 | r2, this._params), this.precedingCodepoint = 0;
                  break;
                case 8:
                  do {
                    switch (r2) {
                      case 59:
                        this._params.addParam(0);
                        break;
                      case 58:
                        this._params.addSubParam(-1);
                        break;
                      default:
                        this._params.addDigit(r2 - 48);
                    }
                  } while (++i4 < t3 && (r2 = e3[i4]) > 47 && r2 < 60);
                  i4--;
                  break;
                case 9:
                  this._collect <<= 8, this._collect |= r2;
                  break;
                case 10:
                  const c3 = this._escHandlers[this._collect << 8 | r2];
                  let l2 = c3 ? c3.length - 1 : -1;
                  for (; l2 >= 0 && (s3 = c3[l2](), true !== s3); l2--) if (s3 instanceof Promise) return this._preserveStack(4, c3, l2, n2, i4), s3;
                  l2 < 0 && this._escHandlerFb(this._collect << 8 | r2), this.precedingCodepoint = 0;
                  break;
                case 11:
                  this._params.reset(), this._params.addParam(0), this._collect = 0;
                  break;
                case 12:
                  this._dcsParser.hook(this._collect << 8 | r2, this._params);
                  break;
                case 13:
                  for (let s4 = i4 + 1; ; ++s4) if (s4 >= t3 || 24 === (r2 = e3[s4]) || 26 === r2 || 27 === r2 || r2 > 127 && r2 < h2) {
                    this._dcsParser.put(e3, i4, s4), i4 = s4 - 1;
                    break;
                  }
                  break;
                case 14:
                  if (s3 = this._dcsParser.unhook(24 !== r2 && 26 !== r2), s3) return this._preserveStack(6, [], 0, n2, i4), s3;
                  27 === r2 && (n2 |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingCodepoint = 0;
                  break;
                case 4:
                  this._oscParser.start();
                  break;
                case 5:
                  for (let s4 = i4 + 1; ; s4++) if (s4 >= t3 || (r2 = e3[s4]) < 32 || r2 > 127 && r2 < h2) {
                    this._oscParser.put(e3, i4, s4), i4 = s4 - 1;
                    break;
                  }
                  break;
                case 6:
                  if (s3 = this._oscParser.end(24 !== r2 && 26 !== r2), s3) return this._preserveStack(5, [], 0, n2, i4), s3;
                  27 === r2 && (n2 |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingCodepoint = 0;
              }
              this.currentState = 15 & n2;
            }
          }
        }
        t2.EscapeSequenceParser = c2;
      }, 6242: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.OscHandler = t2.OscParser = void 0;
        const s2 = i2(5770), r = i2(482), n = [];
        t2.OscParser = class {
          constructor() {
            this._state = 0, this._active = n, this._id = -1, this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
            }, this._stack = { paused: false, loopPosition: 0, fallThrough: false };
          }
          registerHandler(e3, t3) {
            void 0 === this._handlers[e3] && (this._handlers[e3] = []);
            const i3 = this._handlers[e3];
            return i3.push(t3), { dispose: () => {
              const e4 = i3.indexOf(t3);
              -1 !== e4 && i3.splice(e4, 1);
            } };
          }
          clearHandler(e3) {
            this._handlers[e3] && delete this._handlers[e3];
          }
          setHandlerFallback(e3) {
            this._handlerFb = e3;
          }
          dispose() {
            this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
            }, this._active = n;
          }
          reset() {
            if (2 === this._state) for (let e3 = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; e3 >= 0; --e3) this._active[e3].end(false);
            this._stack.paused = false, this._active = n, this._id = -1, this._state = 0;
          }
          _start() {
            if (this._active = this._handlers[this._id] || n, this._active.length) for (let e3 = this._active.length - 1; e3 >= 0; e3--) this._active[e3].start();
            else this._handlerFb(this._id, "START");
          }
          _put(e3, t3, i3) {
            if (this._active.length) for (let s3 = this._active.length - 1; s3 >= 0; s3--) this._active[s3].put(e3, t3, i3);
            else this._handlerFb(this._id, "PUT", (0, r.utf32ToString)(e3, t3, i3));
          }
          start() {
            this.reset(), this._state = 1;
          }
          put(e3, t3, i3) {
            if (3 !== this._state) {
              if (1 === this._state) for (; t3 < i3; ) {
                const i4 = e3[t3++];
                if (59 === i4) {
                  this._state = 2, this._start();
                  break;
                }
                if (i4 < 48 || 57 < i4) return void (this._state = 3);
                -1 === this._id && (this._id = 0), this._id = 10 * this._id + i4 - 48;
              }
              2 === this._state && i3 - t3 > 0 && this._put(e3, t3, i3);
            }
          }
          end(e3, t3 = true) {
            if (0 !== this._state) {
              if (3 !== this._state) if (1 === this._state && this._start(), this._active.length) {
                let i3 = false, s3 = this._active.length - 1, r2 = false;
                if (this._stack.paused && (s3 = this._stack.loopPosition - 1, i3 = t3, r2 = this._stack.fallThrough, this._stack.paused = false), !r2 && false === i3) {
                  for (; s3 >= 0 && (i3 = this._active[s3].end(e3), true !== i3); s3--) if (i3 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = s3, this._stack.fallThrough = false, i3;
                  s3--;
                }
                for (; s3 >= 0; s3--) if (i3 = this._active[s3].end(false), i3 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = s3, this._stack.fallThrough = true, i3;
              } else this._handlerFb(this._id, "END", e3);
              this._active = n, this._id = -1, this._state = 0;
            }
          }
        }, t2.OscHandler = class {
          constructor(e3) {
            this._handler = e3, this._data = "", this._hitLimit = false;
          }
          start() {
            this._data = "", this._hitLimit = false;
          }
          put(e3, t3, i3) {
            this._hitLimit || (this._data += (0, r.utf32ToString)(e3, t3, i3), this._data.length > s2.PAYLOAD_LIMIT && (this._data = "", this._hitLimit = true));
          }
          end(e3) {
            let t3 = false;
            if (this._hitLimit) t3 = false;
            else if (e3 && (t3 = this._handler(this._data), t3 instanceof Promise)) return t3.then((e4) => (this._data = "", this._hitLimit = false, e4));
            return this._data = "", this._hitLimit = false, t3;
          }
        };
      }, 8742: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Params = void 0;
        const i2 = 2147483647;
        class s2 {
          static fromArray(e3) {
            const t3 = new s2();
            if (!e3.length) return t3;
            for (let i3 = Array.isArray(e3[0]) ? 1 : 0; i3 < e3.length; ++i3) {
              const s3 = e3[i3];
              if (Array.isArray(s3)) for (let e4 = 0; e4 < s3.length; ++e4) t3.addSubParam(s3[e4]);
              else t3.addParam(s3);
            }
            return t3;
          }
          constructor(e3 = 32, t3 = 32) {
            if (this.maxLength = e3, this.maxSubParamsLength = t3, t3 > 256) throw new Error("maxSubParamsLength must not be greater than 256");
            this.params = new Int32Array(e3), this.length = 0, this._subParams = new Int32Array(t3), this._subParamsLength = 0, this._subParamsIdx = new Uint16Array(e3), this._rejectDigits = false, this._rejectSubDigits = false, this._digitIsSub = false;
          }
          clone() {
            const e3 = new s2(this.maxLength, this.maxSubParamsLength);
            return e3.params.set(this.params), e3.length = this.length, e3._subParams.set(this._subParams), e3._subParamsLength = this._subParamsLength, e3._subParamsIdx.set(this._subParamsIdx), e3._rejectDigits = this._rejectDigits, e3._rejectSubDigits = this._rejectSubDigits, e3._digitIsSub = this._digitIsSub, e3;
          }
          toArray() {
            const e3 = [];
            for (let t3 = 0; t3 < this.length; ++t3) {
              e3.push(this.params[t3]);
              const i3 = this._subParamsIdx[t3] >> 8, s3 = 255 & this._subParamsIdx[t3];
              s3 - i3 > 0 && e3.push(Array.prototype.slice.call(this._subParams, i3, s3));
            }
            return e3;
          }
          reset() {
            this.length = 0, this._subParamsLength = 0, this._rejectDigits = false, this._rejectSubDigits = false, this._digitIsSub = false;
          }
          addParam(e3) {
            if (this._digitIsSub = false, this.length >= this.maxLength) this._rejectDigits = true;
            else {
              if (e3 < -1) throw new Error("values lesser than -1 are not allowed");
              this._subParamsIdx[this.length] = this._subParamsLength << 8 | this._subParamsLength, this.params[this.length++] = e3 > i2 ? i2 : e3;
            }
          }
          addSubParam(e3) {
            if (this._digitIsSub = true, this.length) if (this._rejectDigits || this._subParamsLength >= this.maxSubParamsLength) this._rejectSubDigits = true;
            else {
              if (e3 < -1) throw new Error("values lesser than -1 are not allowed");
              this._subParams[this._subParamsLength++] = e3 > i2 ? i2 : e3, this._subParamsIdx[this.length - 1]++;
            }
          }
          hasSubParams(e3) {
            return (255 & this._subParamsIdx[e3]) - (this._subParamsIdx[e3] >> 8) > 0;
          }
          getSubParams(e3) {
            const t3 = this._subParamsIdx[e3] >> 8, i3 = 255 & this._subParamsIdx[e3];
            return i3 - t3 > 0 ? this._subParams.subarray(t3, i3) : null;
          }
          getSubParamsAll() {
            const e3 = {};
            for (let t3 = 0; t3 < this.length; ++t3) {
              const i3 = this._subParamsIdx[t3] >> 8, s3 = 255 & this._subParamsIdx[t3];
              s3 - i3 > 0 && (e3[t3] = this._subParams.slice(i3, s3));
            }
            return e3;
          }
          addDigit(e3) {
            let t3;
            if (this._rejectDigits || !(t3 = this._digitIsSub ? this._subParamsLength : this.length) || this._digitIsSub && this._rejectSubDigits) return;
            const s3 = this._digitIsSub ? this._subParams : this.params, r = s3[t3 - 1];
            s3[t3 - 1] = ~r ? Math.min(10 * r + e3, i2) : e3;
          }
        }
        t2.Params = s2;
      }, 5741: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.AddonManager = void 0, t2.AddonManager = class {
          constructor() {
            this._addons = [];
          }
          dispose() {
            for (let e3 = this._addons.length - 1; e3 >= 0; e3--) this._addons[e3].instance.dispose();
          }
          loadAddon(e3, t3) {
            const i2 = { instance: t3, dispose: t3.dispose, isDisposed: false };
            this._addons.push(i2), t3.dispose = () => this._wrappedAddonDispose(i2), t3.activate(e3);
          }
          _wrappedAddonDispose(e3) {
            if (e3.isDisposed) return;
            let t3 = -1;
            for (let i2 = 0; i2 < this._addons.length; i2++) if (this._addons[i2] === e3) {
              t3 = i2;
              break;
            }
            if (-1 === t3) throw new Error("Could not dispose an addon that has not been loaded");
            e3.isDisposed = true, e3.dispose.apply(e3.instance), this._addons.splice(t3, 1);
          }
        };
      }, 8771: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferApiView = void 0;
        const s2 = i2(3785), r = i2(511);
        t2.BufferApiView = class {
          constructor(e3, t3) {
            this._buffer = e3, this.type = t3;
          }
          init(e3) {
            return this._buffer = e3, this;
          }
          get cursorY() {
            return this._buffer.y;
          }
          get cursorX() {
            return this._buffer.x;
          }
          get viewportY() {
            return this._buffer.ydisp;
          }
          get baseY() {
            return this._buffer.ybase;
          }
          get length() {
            return this._buffer.lines.length;
          }
          getLine(e3) {
            const t3 = this._buffer.lines.get(e3);
            if (t3) return new s2.BufferLineApiView(t3);
          }
          getNullCell() {
            return new r.CellData();
          }
        };
      }, 3785: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferLineApiView = void 0;
        const s2 = i2(511);
        t2.BufferLineApiView = class {
          constructor(e3) {
            this._line = e3;
          }
          get isWrapped() {
            return this._line.isWrapped;
          }
          get length() {
            return this._line.length;
          }
          getCell(e3, t3) {
            if (!(e3 < 0 || e3 >= this._line.length)) return t3 ? (this._line.loadCell(e3, t3), t3) : this._line.loadCell(e3, new s2.CellData());
          }
          translateToString(e3, t3, i3) {
            return this._line.translateToString(e3, t3, i3);
          }
        };
      }, 8285: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferNamespaceApi = void 0;
        const s2 = i2(8771), r = i2(8460), n = i2(844);
        class o2 extends n.Disposable {
          constructor(e3) {
            super(), this._core = e3, this._onBufferChange = this.register(new r.EventEmitter()), this.onBufferChange = this._onBufferChange.event, this._normal = new s2.BufferApiView(this._core.buffers.normal, "normal"), this._alternate = new s2.BufferApiView(this._core.buffers.alt, "alternate"), this._core.buffers.onBufferActivate(() => this._onBufferChange.fire(this.active));
          }
          get active() {
            if (this._core.buffers.active === this._core.buffers.normal) return this.normal;
            if (this._core.buffers.active === this._core.buffers.alt) return this.alternate;
            throw new Error("Active buffer is neither normal nor alternate");
          }
          get normal() {
            return this._normal.init(this._core.buffers.normal);
          }
          get alternate() {
            return this._alternate.init(this._core.buffers.alt);
          }
        }
        t2.BufferNamespaceApi = o2;
      }, 7975: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ParserApi = void 0, t2.ParserApi = class {
          constructor(e3) {
            this._core = e3;
          }
          registerCsiHandler(e3, t3) {
            return this._core.registerCsiHandler(e3, (e4) => t3(e4.toArray()));
          }
          addCsiHandler(e3, t3) {
            return this.registerCsiHandler(e3, t3);
          }
          registerDcsHandler(e3, t3) {
            return this._core.registerDcsHandler(e3, (e4, i2) => t3(e4, i2.toArray()));
          }
          addDcsHandler(e3, t3) {
            return this.registerDcsHandler(e3, t3);
          }
          registerEscHandler(e3, t3) {
            return this._core.registerEscHandler(e3, t3);
          }
          addEscHandler(e3, t3) {
            return this.registerEscHandler(e3, t3);
          }
          registerOscHandler(e3, t3) {
            return this._core.registerOscHandler(e3, t3);
          }
          addOscHandler(e3, t3) {
            return this.registerOscHandler(e3, t3);
          }
        };
      }, 7090: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.UnicodeApi = void 0, t2.UnicodeApi = class {
          constructor(e3) {
            this._core = e3;
          }
          register(e3) {
            this._core.unicodeService.register(e3);
          }
          get versions() {
            return this._core.unicodeService.versions;
          }
          get activeVersion() {
            return this._core.unicodeService.activeVersion;
          }
          set activeVersion(e3) {
            this._core.unicodeService.activeVersion = e3;
          }
        };
      }, 744: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferService = t2.MINIMUM_ROWS = t2.MINIMUM_COLS = void 0;
        const n = i2(8460), o2 = i2(844), a2 = i2(5295), h2 = i2(2585);
        t2.MINIMUM_COLS = 2, t2.MINIMUM_ROWS = 1;
        let c2 = t2.BufferService = class extends o2.Disposable {
          get buffer() {
            return this.buffers.active;
          }
          constructor(e3) {
            super(), this.isUserScrolling = false, this._onResize = this.register(new n.EventEmitter()), this.onResize = this._onResize.event, this._onScroll = this.register(new n.EventEmitter()), this.onScroll = this._onScroll.event, this.cols = Math.max(e3.rawOptions.cols || 0, t2.MINIMUM_COLS), this.rows = Math.max(e3.rawOptions.rows || 0, t2.MINIMUM_ROWS), this.buffers = this.register(new a2.BufferSet(e3, this));
          }
          resize(e3, t3) {
            this.cols = e3, this.rows = t3, this.buffers.resize(e3, t3), this._onResize.fire({ cols: e3, rows: t3 });
          }
          reset() {
            this.buffers.reset(), this.isUserScrolling = false;
          }
          scroll(e3, t3 = false) {
            const i3 = this.buffer;
            let s3;
            s3 = this._cachedBlankLine, s3 && s3.length === this.cols && s3.getFg(0) === e3.fg && s3.getBg(0) === e3.bg || (s3 = i3.getBlankLine(e3, t3), this._cachedBlankLine = s3), s3.isWrapped = t3;
            const r2 = i3.ybase + i3.scrollTop, n2 = i3.ybase + i3.scrollBottom;
            if (0 === i3.scrollTop) {
              const e4 = i3.lines.isFull;
              n2 === i3.lines.length - 1 ? e4 ? i3.lines.recycle().copyFrom(s3) : i3.lines.push(s3.clone()) : i3.lines.splice(n2 + 1, 0, s3.clone()), e4 ? this.isUserScrolling && (i3.ydisp = Math.max(i3.ydisp - 1, 0)) : (i3.ybase++, this.isUserScrolling || i3.ydisp++);
            } else {
              const e4 = n2 - r2 + 1;
              i3.lines.shiftElements(r2 + 1, e4 - 1, -1), i3.lines.set(n2, s3.clone());
            }
            this.isUserScrolling || (i3.ydisp = i3.ybase), this._onScroll.fire(i3.ydisp);
          }
          scrollLines(e3, t3, i3) {
            const s3 = this.buffer;
            if (e3 < 0) {
              if (0 === s3.ydisp) return;
              this.isUserScrolling = true;
            } else e3 + s3.ydisp >= s3.ybase && (this.isUserScrolling = false);
            const r2 = s3.ydisp;
            s3.ydisp = Math.max(Math.min(s3.ydisp + e3, s3.ybase), 0), r2 !== s3.ydisp && (t3 || this._onScroll.fire(s3.ydisp));
          }
        };
        t2.BufferService = c2 = s2([r(0, h2.IOptionsService)], c2);
      }, 7994: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CharsetService = void 0, t2.CharsetService = class {
          constructor() {
            this.glevel = 0, this._charsets = [];
          }
          reset() {
            this.charset = void 0, this._charsets = [], this.glevel = 0;
          }
          setgLevel(e3) {
            this.glevel = e3, this.charset = this._charsets[e3];
          }
          setgCharset(e3, t3) {
            this._charsets[e3] = t3, this.glevel === e3 && (this.charset = t3);
          }
        };
      }, 1753: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CoreMouseService = void 0;
        const n = i2(2585), o2 = i2(8460), a2 = i2(844), h2 = { NONE: { events: 0, restrict: () => false }, X10: { events: 1, restrict: (e3) => 4 !== e3.button && 1 === e3.action && (e3.ctrl = false, e3.alt = false, e3.shift = false, true) }, VT200: { events: 19, restrict: (e3) => 32 !== e3.action }, DRAG: { events: 23, restrict: (e3) => 32 !== e3.action || 3 !== e3.button }, ANY: { events: 31, restrict: (e3) => true } };
        function c2(e3, t3) {
          let i3 = (e3.ctrl ? 16 : 0) | (e3.shift ? 4 : 0) | (e3.alt ? 8 : 0);
          return 4 === e3.button ? (i3 |= 64, i3 |= e3.action) : (i3 |= 3 & e3.button, 4 & e3.button && (i3 |= 64), 8 & e3.button && (i3 |= 128), 32 === e3.action ? i3 |= 32 : 0 !== e3.action || t3 || (i3 |= 3)), i3;
        }
        const l2 = String.fromCharCode, d = { DEFAULT: (e3) => {
          const t3 = [c2(e3, false) + 32, e3.col + 32, e3.row + 32];
          return t3[0] > 255 || t3[1] > 255 || t3[2] > 255 ? "" : `\x1B[M${l2(t3[0])}${l2(t3[1])}${l2(t3[2])}`;
        }, SGR: (e3) => {
          const t3 = 0 === e3.action && 4 !== e3.button ? "m" : "M";
          return `\x1B[<${c2(e3, true)};${e3.col};${e3.row}${t3}`;
        }, SGR_PIXELS: (e3) => {
          const t3 = 0 === e3.action && 4 !== e3.button ? "m" : "M";
          return `\x1B[<${c2(e3, true)};${e3.x};${e3.y}${t3}`;
        } };
        let _3 = t2.CoreMouseService = class extends a2.Disposable {
          constructor(e3, t3) {
            super(), this._bufferService = e3, this._coreService = t3, this._protocols = {}, this._encodings = {}, this._activeProtocol = "", this._activeEncoding = "", this._lastEvent = null, this._onProtocolChange = this.register(new o2.EventEmitter()), this.onProtocolChange = this._onProtocolChange.event;
            for (const e4 of Object.keys(h2)) this.addProtocol(e4, h2[e4]);
            for (const e4 of Object.keys(d)) this.addEncoding(e4, d[e4]);
            this.reset();
          }
          addProtocol(e3, t3) {
            this._protocols[e3] = t3;
          }
          addEncoding(e3, t3) {
            this._encodings[e3] = t3;
          }
          get activeProtocol() {
            return this._activeProtocol;
          }
          get areMouseEventsActive() {
            return 0 !== this._protocols[this._activeProtocol].events;
          }
          set activeProtocol(e3) {
            if (!this._protocols[e3]) throw new Error(`unknown protocol "${e3}"`);
            this._activeProtocol = e3, this._onProtocolChange.fire(this._protocols[e3].events);
          }
          get activeEncoding() {
            return this._activeEncoding;
          }
          set activeEncoding(e3) {
            if (!this._encodings[e3]) throw new Error(`unknown encoding "${e3}"`);
            this._activeEncoding = e3;
          }
          reset() {
            this.activeProtocol = "NONE", this.activeEncoding = "DEFAULT", this._lastEvent = null;
          }
          triggerMouseEvent(e3) {
            if (e3.col < 0 || e3.col >= this._bufferService.cols || e3.row < 0 || e3.row >= this._bufferService.rows) return false;
            if (4 === e3.button && 32 === e3.action) return false;
            if (3 === e3.button && 32 !== e3.action) return false;
            if (4 !== e3.button && (2 === e3.action || 3 === e3.action)) return false;
            if (e3.col++, e3.row++, 32 === e3.action && this._lastEvent && this._equalEvents(this._lastEvent, e3, "SGR_PIXELS" === this._activeEncoding)) return false;
            if (!this._protocols[this._activeProtocol].restrict(e3)) return false;
            const t3 = this._encodings[this._activeEncoding](e3);
            return t3 && ("DEFAULT" === this._activeEncoding ? this._coreService.triggerBinaryEvent(t3) : this._coreService.triggerDataEvent(t3, true)), this._lastEvent = e3, true;
          }
          explainEvents(e3) {
            return { down: !!(1 & e3), up: !!(2 & e3), drag: !!(4 & e3), move: !!(8 & e3), wheel: !!(16 & e3) };
          }
          _equalEvents(e3, t3, i3) {
            if (i3) {
              if (e3.x !== t3.x) return false;
              if (e3.y !== t3.y) return false;
            } else {
              if (e3.col !== t3.col) return false;
              if (e3.row !== t3.row) return false;
            }
            return e3.button === t3.button && e3.action === t3.action && e3.ctrl === t3.ctrl && e3.alt === t3.alt && e3.shift === t3.shift;
          }
        };
        t2.CoreMouseService = _3 = s2([r(0, n.IBufferService), r(1, n.ICoreService)], _3);
      }, 6975: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CoreService = void 0;
        const n = i2(1439), o2 = i2(8460), a2 = i2(844), h2 = i2(2585), c2 = Object.freeze({ insertMode: false }), l2 = Object.freeze({ applicationCursorKeys: false, applicationKeypad: false, bracketedPasteMode: false, origin: false, reverseWraparound: false, sendFocus: false, wraparound: true });
        let d = t2.CoreService = class extends a2.Disposable {
          constructor(e3, t3, i3) {
            super(), this._bufferService = e3, this._logService = t3, this._optionsService = i3, this.isCursorInitialized = false, this.isCursorHidden = false, this._onData = this.register(new o2.EventEmitter()), this.onData = this._onData.event, this._onUserInput = this.register(new o2.EventEmitter()), this.onUserInput = this._onUserInput.event, this._onBinary = this.register(new o2.EventEmitter()), this.onBinary = this._onBinary.event, this._onRequestScrollToBottom = this.register(new o2.EventEmitter()), this.onRequestScrollToBottom = this._onRequestScrollToBottom.event, this.modes = (0, n.clone)(c2), this.decPrivateModes = (0, n.clone)(l2);
          }
          reset() {
            this.modes = (0, n.clone)(c2), this.decPrivateModes = (0, n.clone)(l2);
          }
          triggerDataEvent(e3, t3 = false) {
            if (this._optionsService.rawOptions.disableStdin) return;
            const i3 = this._bufferService.buffer;
            t3 && this._optionsService.rawOptions.scrollOnUserInput && i3.ybase !== i3.ydisp && this._onRequestScrollToBottom.fire(), t3 && this._onUserInput.fire(), this._logService.debug(`sending data "${e3}"`, () => e3.split("").map((e4) => e4.charCodeAt(0))), this._onData.fire(e3);
          }
          triggerBinaryEvent(e3) {
            this._optionsService.rawOptions.disableStdin || (this._logService.debug(`sending binary "${e3}"`, () => e3.split("").map((e4) => e4.charCodeAt(0))), this._onBinary.fire(e3));
          }
        };
        t2.CoreService = d = s2([r(0, h2.IBufferService), r(1, h2.ILogService), r(2, h2.IOptionsService)], d);
      }, 9074: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DecorationService = void 0;
        const s2 = i2(8055), r = i2(8460), n = i2(844), o2 = i2(6106);
        let a2 = 0, h2 = 0;
        class c2 extends n.Disposable {
          get decorations() {
            return this._decorations.values();
          }
          constructor() {
            super(), this._decorations = new o2.SortedList((e3) => null == e3 ? void 0 : e3.marker.line), this._onDecorationRegistered = this.register(new r.EventEmitter()), this.onDecorationRegistered = this._onDecorationRegistered.event, this._onDecorationRemoved = this.register(new r.EventEmitter()), this.onDecorationRemoved = this._onDecorationRemoved.event, this.register((0, n.toDisposable)(() => this.reset()));
          }
          registerDecoration(e3) {
            if (e3.marker.isDisposed) return;
            const t3 = new l2(e3);
            if (t3) {
              const e4 = t3.marker.onDispose(() => t3.dispose());
              t3.onDispose(() => {
                t3 && (this._decorations.delete(t3) && this._onDecorationRemoved.fire(t3), e4.dispose());
              }), this._decorations.insert(t3), this._onDecorationRegistered.fire(t3);
            }
            return t3;
          }
          reset() {
            for (const e3 of this._decorations.values()) e3.dispose();
            this._decorations.clear();
          }
          *getDecorationsAtCell(e3, t3, i3) {
            var s3, r2, n2;
            let o3 = 0, a3 = 0;
            for (const h3 of this._decorations.getKeyIterator(t3)) o3 = null !== (s3 = h3.options.x) && void 0 !== s3 ? s3 : 0, a3 = o3 + (null !== (r2 = h3.options.width) && void 0 !== r2 ? r2 : 1), e3 >= o3 && e3 < a3 && (!i3 || (null !== (n2 = h3.options.layer) && void 0 !== n2 ? n2 : "bottom") === i3) && (yield h3);
          }
          forEachDecorationAtCell(e3, t3, i3, s3) {
            this._decorations.forEachByKey(t3, (t4) => {
              var r2, n2, o3;
              a2 = null !== (r2 = t4.options.x) && void 0 !== r2 ? r2 : 0, h2 = a2 + (null !== (n2 = t4.options.width) && void 0 !== n2 ? n2 : 1), e3 >= a2 && e3 < h2 && (!i3 || (null !== (o3 = t4.options.layer) && void 0 !== o3 ? o3 : "bottom") === i3) && s3(t4);
            });
          }
        }
        t2.DecorationService = c2;
        class l2 extends n.Disposable {
          get isDisposed() {
            return this._isDisposed;
          }
          get backgroundColorRGB() {
            return null === this._cachedBg && (this.options.backgroundColor ? this._cachedBg = s2.css.toColor(this.options.backgroundColor) : this._cachedBg = void 0), this._cachedBg;
          }
          get foregroundColorRGB() {
            return null === this._cachedFg && (this.options.foregroundColor ? this._cachedFg = s2.css.toColor(this.options.foregroundColor) : this._cachedFg = void 0), this._cachedFg;
          }
          constructor(e3) {
            super(), this.options = e3, this.onRenderEmitter = this.register(new r.EventEmitter()), this.onRender = this.onRenderEmitter.event, this._onDispose = this.register(new r.EventEmitter()), this.onDispose = this._onDispose.event, this._cachedBg = null, this._cachedFg = null, this.marker = e3.marker, this.options.overviewRulerOptions && !this.options.overviewRulerOptions.position && (this.options.overviewRulerOptions.position = "full");
          }
          dispose() {
            this._onDispose.fire(), super.dispose();
          }
        }
      }, 4348: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.InstantiationService = t2.ServiceCollection = void 0;
        const s2 = i2(2585), r = i2(8343);
        class n {
          constructor(...e3) {
            this._entries = /* @__PURE__ */ new Map();
            for (const [t3, i3] of e3) this.set(t3, i3);
          }
          set(e3, t3) {
            const i3 = this._entries.get(e3);
            return this._entries.set(e3, t3), i3;
          }
          forEach(e3) {
            for (const [t3, i3] of this._entries.entries()) e3(t3, i3);
          }
          has(e3) {
            return this._entries.has(e3);
          }
          get(e3) {
            return this._entries.get(e3);
          }
        }
        t2.ServiceCollection = n, t2.InstantiationService = class {
          constructor() {
            this._services = new n(), this._services.set(s2.IInstantiationService, this);
          }
          setService(e3, t3) {
            this._services.set(e3, t3);
          }
          getService(e3) {
            return this._services.get(e3);
          }
          createInstance(e3, ...t3) {
            const i3 = (0, r.getServiceDependencies)(e3).sort((e4, t4) => e4.index - t4.index), s3 = [];
            for (const t4 of i3) {
              const i4 = this._services.get(t4.id);
              if (!i4) throw new Error(`[createInstance] ${e3.name} depends on UNKNOWN service ${t4.id}.`);
              s3.push(i4);
            }
            const n2 = i3.length > 0 ? i3[0].index : t3.length;
            if (t3.length !== n2) throw new Error(`[createInstance] First service dependency of ${e3.name} at position ${n2 + 1} conflicts with ${t3.length} static arguments`);
            return new e3(...[...t3, ...s3]);
          }
        };
      }, 7866: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a3 = e3.length - 1; a3 >= 0; a3--) (r2 = e3[a3]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.traceCall = t2.setTraceLogger = t2.LogService = void 0;
        const n = i2(844), o2 = i2(2585), a2 = { trace: o2.LogLevelEnum.TRACE, debug: o2.LogLevelEnum.DEBUG, info: o2.LogLevelEnum.INFO, warn: o2.LogLevelEnum.WARN, error: o2.LogLevelEnum.ERROR, off: o2.LogLevelEnum.OFF };
        let h2, c2 = t2.LogService = class extends n.Disposable {
          get logLevel() {
            return this._logLevel;
          }
          constructor(e3) {
            super(), this._optionsService = e3, this._logLevel = o2.LogLevelEnum.OFF, this._updateLogLevel(), this.register(this._optionsService.onSpecificOptionChange("logLevel", () => this._updateLogLevel())), h2 = this;
          }
          _updateLogLevel() {
            this._logLevel = a2[this._optionsService.rawOptions.logLevel];
          }
          _evalLazyOptionalParams(e3) {
            for (let t3 = 0; t3 < e3.length; t3++) "function" == typeof e3[t3] && (e3[t3] = e3[t3]());
          }
          _log(e3, t3, i3) {
            this._evalLazyOptionalParams(i3), e3.call(console, (this._optionsService.options.logger ? "" : "xterm.js: ") + t3, ...i3);
          }
          trace(e3, ...t3) {
            var i3, s3;
            this._logLevel <= o2.LogLevelEnum.TRACE && this._log(null !== (s3 = null === (i3 = this._optionsService.options.logger) || void 0 === i3 ? void 0 : i3.trace.bind(this._optionsService.options.logger)) && void 0 !== s3 ? s3 : console.log, e3, t3);
          }
          debug(e3, ...t3) {
            var i3, s3;
            this._logLevel <= o2.LogLevelEnum.DEBUG && this._log(null !== (s3 = null === (i3 = this._optionsService.options.logger) || void 0 === i3 ? void 0 : i3.debug.bind(this._optionsService.options.logger)) && void 0 !== s3 ? s3 : console.log, e3, t3);
          }
          info(e3, ...t3) {
            var i3, s3;
            this._logLevel <= o2.LogLevelEnum.INFO && this._log(null !== (s3 = null === (i3 = this._optionsService.options.logger) || void 0 === i3 ? void 0 : i3.info.bind(this._optionsService.options.logger)) && void 0 !== s3 ? s3 : console.info, e3, t3);
          }
          warn(e3, ...t3) {
            var i3, s3;
            this._logLevel <= o2.LogLevelEnum.WARN && this._log(null !== (s3 = null === (i3 = this._optionsService.options.logger) || void 0 === i3 ? void 0 : i3.warn.bind(this._optionsService.options.logger)) && void 0 !== s3 ? s3 : console.warn, e3, t3);
          }
          error(e3, ...t3) {
            var i3, s3;
            this._logLevel <= o2.LogLevelEnum.ERROR && this._log(null !== (s3 = null === (i3 = this._optionsService.options.logger) || void 0 === i3 ? void 0 : i3.error.bind(this._optionsService.options.logger)) && void 0 !== s3 ? s3 : console.error, e3, t3);
          }
        };
        t2.LogService = c2 = s2([r(0, o2.IOptionsService)], c2), t2.setTraceLogger = function(e3) {
          h2 = e3;
        }, t2.traceCall = function(e3, t3, i3) {
          if ("function" != typeof i3.value) throw new Error("not supported");
          const s3 = i3.value;
          i3.value = function(...e4) {
            if (h2.logLevel !== o2.LogLevelEnum.TRACE) return s3.apply(this, e4);
            h2.trace(`GlyphRenderer#${s3.name}(${e4.map((e5) => JSON.stringify(e5)).join(", ")})`);
            const t4 = s3.apply(this, e4);
            return h2.trace(`GlyphRenderer#${s3.name} return`, t4), t4;
          };
        };
      }, 7302: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.OptionsService = t2.DEFAULT_OPTIONS = void 0;
        const s2 = i2(8460), r = i2(844), n = i2(6114);
        t2.DEFAULT_OPTIONS = { cols: 80, rows: 24, cursorBlink: false, cursorStyle: "block", cursorWidth: 1, cursorInactiveStyle: "outline", customGlyphs: true, drawBoldTextInBrightColors: true, fastScrollModifier: "alt", fastScrollSensitivity: 5, fontFamily: "courier-new, courier, monospace", fontSize: 15, fontWeight: "normal", fontWeightBold: "bold", ignoreBracketedPasteMode: false, lineHeight: 1, letterSpacing: 0, linkHandler: null, logLevel: "info", logger: null, scrollback: 1e3, scrollOnUserInput: true, scrollSensitivity: 1, screenReaderMode: false, smoothScrollDuration: 0, macOptionIsMeta: false, macOptionClickForcesSelection: false, minimumContrastRatio: 1, disableStdin: false, allowProposedApi: false, allowTransparency: false, tabStopWidth: 8, theme: {}, rightClickSelectsWord: n.isMac, windowOptions: {}, windowsMode: false, windowsPty: {}, wordSeparator: " ()[]{}',\"`", altClickMovesCursor: true, convertEol: false, termName: "xterm", cancelEvents: false, overviewRulerWidth: 0 };
        const o2 = ["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
        class a2 extends r.Disposable {
          constructor(e3) {
            super(), this._onOptionChange = this.register(new s2.EventEmitter()), this.onOptionChange = this._onOptionChange.event;
            const i3 = Object.assign({}, t2.DEFAULT_OPTIONS);
            for (const t3 in e3) if (t3 in i3) try {
              const s3 = e3[t3];
              i3[t3] = this._sanitizeAndValidateOption(t3, s3);
            } catch (e4) {
              console.error(e4);
            }
            this.rawOptions = i3, this.options = Object.assign({}, i3), this._setupOptions();
          }
          onSpecificOptionChange(e3, t3) {
            return this.onOptionChange((i3) => {
              i3 === e3 && t3(this.rawOptions[e3]);
            });
          }
          onMultipleOptionChange(e3, t3) {
            return this.onOptionChange((i3) => {
              -1 !== e3.indexOf(i3) && t3();
            });
          }
          _setupOptions() {
            const e3 = (e4) => {
              if (!(e4 in t2.DEFAULT_OPTIONS)) throw new Error(`No option with key "${e4}"`);
              return this.rawOptions[e4];
            }, i3 = (e4, i4) => {
              if (!(e4 in t2.DEFAULT_OPTIONS)) throw new Error(`No option with key "${e4}"`);
              i4 = this._sanitizeAndValidateOption(e4, i4), this.rawOptions[e4] !== i4 && (this.rawOptions[e4] = i4, this._onOptionChange.fire(e4));
            };
            for (const t3 in this.rawOptions) {
              const s3 = { get: e3.bind(this, t3), set: i3.bind(this, t3) };
              Object.defineProperty(this.options, t3, s3);
            }
          }
          _sanitizeAndValidateOption(e3, i3) {
            switch (e3) {
              case "cursorStyle":
                if (i3 || (i3 = t2.DEFAULT_OPTIONS[e3]), !/* @__PURE__ */ function(e4) {
                  return "block" === e4 || "underline" === e4 || "bar" === e4;
                }(i3)) throw new Error(`"${i3}" is not a valid value for ${e3}`);
                break;
              case "wordSeparator":
                i3 || (i3 = t2.DEFAULT_OPTIONS[e3]);
                break;
              case "fontWeight":
              case "fontWeightBold":
                if ("number" == typeof i3 && 1 <= i3 && i3 <= 1e3) break;
                i3 = o2.includes(i3) ? i3 : t2.DEFAULT_OPTIONS[e3];
                break;
              case "cursorWidth":
                i3 = Math.floor(i3);
              case "lineHeight":
              case "tabStopWidth":
                if (i3 < 1) throw new Error(`${e3} cannot be less than 1, value: ${i3}`);
                break;
              case "minimumContrastRatio":
                i3 = Math.max(1, Math.min(21, Math.round(10 * i3) / 10));
                break;
              case "scrollback":
                if ((i3 = Math.min(i3, 4294967295)) < 0) throw new Error(`${e3} cannot be less than 0, value: ${i3}`);
                break;
              case "fastScrollSensitivity":
              case "scrollSensitivity":
                if (i3 <= 0) throw new Error(`${e3} cannot be less than or equal to 0, value: ${i3}`);
                break;
              case "rows":
              case "cols":
                if (!i3 && 0 !== i3) throw new Error(`${e3} must be numeric, value: ${i3}`);
                break;
              case "windowsPty":
                i3 = null != i3 ? i3 : {};
            }
            return i3;
          }
        }
        t2.OptionsService = a2;
      }, 2660: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o3 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e3, t3, i3, s3);
          else for (var a2 = e3.length - 1; a2 >= 0; a2--) (r2 = e3[a2]) && (o3 = (n2 < 3 ? r2(o3) : n2 > 3 ? r2(t3, i3, o3) : r2(t3, i3)) || o3);
          return n2 > 3 && o3 && Object.defineProperty(t3, i3, o3), o3;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.OscLinkService = void 0;
        const n = i2(2585);
        let o2 = t2.OscLinkService = class {
          constructor(e3) {
            this._bufferService = e3, this._nextId = 1, this._entriesWithId = /* @__PURE__ */ new Map(), this._dataByLinkId = /* @__PURE__ */ new Map();
          }
          registerLink(e3) {
            const t3 = this._bufferService.buffer;
            if (void 0 === e3.id) {
              const i4 = t3.addMarker(t3.ybase + t3.y), s4 = { data: e3, id: this._nextId++, lines: [i4] };
              return i4.onDispose(() => this._removeMarkerFromLink(s4, i4)), this._dataByLinkId.set(s4.id, s4), s4.id;
            }
            const i3 = e3, s3 = this._getEntryIdKey(i3), r2 = this._entriesWithId.get(s3);
            if (r2) return this.addLineToLink(r2.id, t3.ybase + t3.y), r2.id;
            const n2 = t3.addMarker(t3.ybase + t3.y), o3 = { id: this._nextId++, key: this._getEntryIdKey(i3), data: i3, lines: [n2] };
            return n2.onDispose(() => this._removeMarkerFromLink(o3, n2)), this._entriesWithId.set(o3.key, o3), this._dataByLinkId.set(o3.id, o3), o3.id;
          }
          addLineToLink(e3, t3) {
            const i3 = this._dataByLinkId.get(e3);
            if (i3 && i3.lines.every((e4) => e4.line !== t3)) {
              const e4 = this._bufferService.buffer.addMarker(t3);
              i3.lines.push(e4), e4.onDispose(() => this._removeMarkerFromLink(i3, e4));
            }
          }
          getLinkData(e3) {
            var t3;
            return null === (t3 = this._dataByLinkId.get(e3)) || void 0 === t3 ? void 0 : t3.data;
          }
          _getEntryIdKey(e3) {
            return `${e3.id};;${e3.uri}`;
          }
          _removeMarkerFromLink(e3, t3) {
            const i3 = e3.lines.indexOf(t3);
            -1 !== i3 && (e3.lines.splice(i3, 1), 0 === e3.lines.length && (void 0 !== e3.data.id && this._entriesWithId.delete(e3.key), this._dataByLinkId.delete(e3.id)));
          }
        };
        t2.OscLinkService = o2 = s2([r(0, n.IBufferService)], o2);
      }, 8343: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.createDecorator = t2.getServiceDependencies = t2.serviceRegistry = void 0;
        const i2 = "di$target", s2 = "di$dependencies";
        t2.serviceRegistry = /* @__PURE__ */ new Map(), t2.getServiceDependencies = function(e3) {
          return e3[s2] || [];
        }, t2.createDecorator = function(e3) {
          if (t2.serviceRegistry.has(e3)) return t2.serviceRegistry.get(e3);
          const r = function(e4, t3, n) {
            if (3 !== arguments.length) throw new Error("@IServiceName-decorator can only be used to decorate a parameter");
            !function(e5, t4, r2) {
              t4[i2] === t4 ? t4[s2].push({ id: e5, index: r2 }) : (t4[s2] = [{ id: e5, index: r2 }], t4[i2] = t4);
            }(r, e4, n);
          };
          return r.toString = () => e3, t2.serviceRegistry.set(e3, r), r;
        };
      }, 2585: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.IDecorationService = t2.IUnicodeService = t2.IOscLinkService = t2.IOptionsService = t2.ILogService = t2.LogLevelEnum = t2.IInstantiationService = t2.ICharsetService = t2.ICoreService = t2.ICoreMouseService = t2.IBufferService = void 0;
        const s2 = i2(8343);
        var r;
        t2.IBufferService = (0, s2.createDecorator)("BufferService"), t2.ICoreMouseService = (0, s2.createDecorator)("CoreMouseService"), t2.ICoreService = (0, s2.createDecorator)("CoreService"), t2.ICharsetService = (0, s2.createDecorator)("CharsetService"), t2.IInstantiationService = (0, s2.createDecorator)("InstantiationService"), function(e3) {
          e3[e3.TRACE = 0] = "TRACE", e3[e3.DEBUG = 1] = "DEBUG", e3[e3.INFO = 2] = "INFO", e3[e3.WARN = 3] = "WARN", e3[e3.ERROR = 4] = "ERROR", e3[e3.OFF = 5] = "OFF";
        }(r || (t2.LogLevelEnum = r = {})), t2.ILogService = (0, s2.createDecorator)("LogService"), t2.IOptionsService = (0, s2.createDecorator)("OptionsService"), t2.IOscLinkService = (0, s2.createDecorator)("OscLinkService"), t2.IUnicodeService = (0, s2.createDecorator)("UnicodeService"), t2.IDecorationService = (0, s2.createDecorator)("DecorationService");
      }, 1480: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.UnicodeService = void 0;
        const s2 = i2(8460), r = i2(225);
        t2.UnicodeService = class {
          constructor() {
            this._providers = /* @__PURE__ */ Object.create(null), this._active = "", this._onChange = new s2.EventEmitter(), this.onChange = this._onChange.event;
            const e3 = new r.UnicodeV6();
            this.register(e3), this._active = e3.version, this._activeProvider = e3;
          }
          dispose() {
            this._onChange.dispose();
          }
          get versions() {
            return Object.keys(this._providers);
          }
          get activeVersion() {
            return this._active;
          }
          set activeVersion(e3) {
            if (!this._providers[e3]) throw new Error(`unknown Unicode version "${e3}"`);
            this._active = e3, this._activeProvider = this._providers[e3], this._onChange.fire(e3);
          }
          register(e3) {
            this._providers[e3.version] = e3;
          }
          wcwidth(e3) {
            return this._activeProvider.wcwidth(e3);
          }
          getStringCellWidth(e3) {
            let t3 = 0;
            const i3 = e3.length;
            for (let s3 = 0; s3 < i3; ++s3) {
              let r2 = e3.charCodeAt(s3);
              if (55296 <= r2 && r2 <= 56319) {
                if (++s3 >= i3) return t3 + this.wcwidth(r2);
                const n = e3.charCodeAt(s3);
                56320 <= n && n <= 57343 ? r2 = 1024 * (r2 - 55296) + n - 56320 + 65536 : t3 += this.wcwidth(n);
              }
              t3 += this.wcwidth(r2);
            }
            return t3;
          }
        };
      } }, t = {};
      function i(s2) {
        var r = t[s2];
        if (void 0 !== r) return r.exports;
        var n = t[s2] = { exports: {} };
        return e[s2].call(n.exports, n, n.exports, i), n.exports;
      }
      var s = {};
      return (() => {
        var e2 = s;
        Object.defineProperty(e2, "__esModule", { value: true }), e2.Terminal = void 0;
        const t2 = i(9042), r = i(3236), n = i(844), o2 = i(5741), a2 = i(8285), h2 = i(7975), c2 = i(7090), l2 = ["cols", "rows"];
        class d extends n.Disposable {
          constructor(e3) {
            super(), this._core = this.register(new r.Terminal(e3)), this._addonManager = this.register(new o2.AddonManager()), this._publicOptions = Object.assign({}, this._core.options);
            const t3 = (e4) => this._core.options[e4], i2 = (e4, t4) => {
              this._checkReadonlyOptions(e4), this._core.options[e4] = t4;
            };
            for (const e4 in this._core.options) {
              const s2 = { get: t3.bind(this, e4), set: i2.bind(this, e4) };
              Object.defineProperty(this._publicOptions, e4, s2);
            }
          }
          _checkReadonlyOptions(e3) {
            if (l2.includes(e3)) throw new Error(`Option "${e3}" can only be set in the constructor`);
          }
          _checkProposedApi() {
            if (!this._core.optionsService.rawOptions.allowProposedApi) throw new Error("You must set the allowProposedApi option to true to use proposed API");
          }
          get onBell() {
            return this._core.onBell;
          }
          get onBinary() {
            return this._core.onBinary;
          }
          get onCursorMove() {
            return this._core.onCursorMove;
          }
          get onData() {
            return this._core.onData;
          }
          get onKey() {
            return this._core.onKey;
          }
          get onLineFeed() {
            return this._core.onLineFeed;
          }
          get onRender() {
            return this._core.onRender;
          }
          get onResize() {
            return this._core.onResize;
          }
          get onScroll() {
            return this._core.onScroll;
          }
          get onSelectionChange() {
            return this._core.onSelectionChange;
          }
          get onTitleChange() {
            return this._core.onTitleChange;
          }
          get onWriteParsed() {
            return this._core.onWriteParsed;
          }
          get element() {
            return this._core.element;
          }
          get parser() {
            return this._parser || (this._parser = new h2.ParserApi(this._core)), this._parser;
          }
          get unicode() {
            return this._checkProposedApi(), new c2.UnicodeApi(this._core);
          }
          get textarea() {
            return this._core.textarea;
          }
          get rows() {
            return this._core.rows;
          }
          get cols() {
            return this._core.cols;
          }
          get buffer() {
            return this._buffer || (this._buffer = this.register(new a2.BufferNamespaceApi(this._core))), this._buffer;
          }
          get markers() {
            return this._checkProposedApi(), this._core.markers;
          }
          get modes() {
            const e3 = this._core.coreService.decPrivateModes;
            let t3 = "none";
            switch (this._core.coreMouseService.activeProtocol) {
              case "X10":
                t3 = "x10";
                break;
              case "VT200":
                t3 = "vt200";
                break;
              case "DRAG":
                t3 = "drag";
                break;
              case "ANY":
                t3 = "any";
            }
            return { applicationCursorKeysMode: e3.applicationCursorKeys, applicationKeypadMode: e3.applicationKeypad, bracketedPasteMode: e3.bracketedPasteMode, insertMode: this._core.coreService.modes.insertMode, mouseTrackingMode: t3, originMode: e3.origin, reverseWraparoundMode: e3.reverseWraparound, sendFocusMode: e3.sendFocus, wraparoundMode: e3.wraparound };
          }
          get options() {
            return this._publicOptions;
          }
          set options(e3) {
            for (const t3 in e3) this._publicOptions[t3] = e3[t3];
          }
          blur() {
            this._core.blur();
          }
          focus() {
            this._core.focus();
          }
          resize(e3, t3) {
            this._verifyIntegers(e3, t3), this._core.resize(e3, t3);
          }
          open(e3) {
            this._core.open(e3);
          }
          attachCustomKeyEventHandler(e3) {
            this._core.attachCustomKeyEventHandler(e3);
          }
          registerLinkProvider(e3) {
            return this._core.registerLinkProvider(e3);
          }
          registerCharacterJoiner(e3) {
            return this._checkProposedApi(), this._core.registerCharacterJoiner(e3);
          }
          deregisterCharacterJoiner(e3) {
            this._checkProposedApi(), this._core.deregisterCharacterJoiner(e3);
          }
          registerMarker(e3 = 0) {
            return this._verifyIntegers(e3), this._core.registerMarker(e3);
          }
          registerDecoration(e3) {
            var t3, i2, s2;
            return this._checkProposedApi(), this._verifyPositiveIntegers(null !== (t3 = e3.x) && void 0 !== t3 ? t3 : 0, null !== (i2 = e3.width) && void 0 !== i2 ? i2 : 0, null !== (s2 = e3.height) && void 0 !== s2 ? s2 : 0), this._core.registerDecoration(e3);
          }
          hasSelection() {
            return this._core.hasSelection();
          }
          select(e3, t3, i2) {
            this._verifyIntegers(e3, t3, i2), this._core.select(e3, t3, i2);
          }
          getSelection() {
            return this._core.getSelection();
          }
          getSelectionPosition() {
            return this._core.getSelectionPosition();
          }
          clearSelection() {
            this._core.clearSelection();
          }
          selectAll() {
            this._core.selectAll();
          }
          selectLines(e3, t3) {
            this._verifyIntegers(e3, t3), this._core.selectLines(e3, t3);
          }
          dispose() {
            super.dispose();
          }
          scrollLines(e3) {
            this._verifyIntegers(e3), this._core.scrollLines(e3);
          }
          scrollPages(e3) {
            this._verifyIntegers(e3), this._core.scrollPages(e3);
          }
          scrollToTop() {
            this._core.scrollToTop();
          }
          scrollToBottom() {
            this._core.scrollToBottom();
          }
          scrollToLine(e3) {
            this._verifyIntegers(e3), this._core.scrollToLine(e3);
          }
          clear() {
            this._core.clear();
          }
          write(e3, t3) {
            this._core.write(e3, t3);
          }
          writeln(e3, t3) {
            this._core.write(e3), this._core.write("\r\n", t3);
          }
          paste(e3) {
            this._core.paste(e3);
          }
          refresh(e3, t3) {
            this._verifyIntegers(e3, t3), this._core.refresh(e3, t3);
          }
          reset() {
            this._core.reset();
          }
          clearTextureAtlas() {
            this._core.clearTextureAtlas();
          }
          loadAddon(e3) {
            this._addonManager.loadAddon(this, e3);
          }
          static get strings() {
            return t2;
          }
          _verifyIntegers(...e3) {
            for (const t3 of e3) if (t3 === 1 / 0 || isNaN(t3) || t3 % 1 != 0) throw new Error("This API only accepts integers");
          }
          _verifyPositiveIntegers(...e3) {
            for (const t3 of e3) if (t3 && (t3 === 1 / 0 || isNaN(t3) || t3 % 1 != 0 || t3 < 0)) throw new Error("This API only accepts positive integers");
          }
        }
        e2.Terminal = d;
      })(), s;
    })());
  }
});

// node_modules/d3-dispatch/src/dispatch.js
var noop = { value: () => {
} };
function dispatch() {
  for (var i = 0, n = arguments.length, _3 = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _3 || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _3[t] = [];
  }
  return new Dispatch(_3);
}
function Dispatch(_3) {
  this._ = _3;
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
    var _3 = this._, T = parseTypenames(typename + "", _3), t, i = -1, n = T.length;
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_3[t], typename.name))) return t;
      return;
    }
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _3[t] = set(_3[t], typename.name, callback);
      else if (callback == null) for (t in _3) _3[t] = set(_3[t], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy = {}, _3 = this._;
    for (var t in _3) copy[t] = _3[t].slice();
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
    var v2 = value.apply(this, arguments);
    if (v2 == null) this.removeAttribute(name);
    else this.setAttribute(name, v2);
  };
}
function attrFunctionNS(fullname, value) {
  return function() {
    var v2 = value.apply(this, arguments);
    if (v2 == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v2);
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
    var v2 = value.apply(this, arguments);
    if (v2 == null) this.style.removeProperty(name);
    else this.style.setProperty(name, v2, priority);
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
    var v2 = value.apply(this, arguments);
    if (v2 == null) delete this[name];
    else this[name] = v2;
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
    var v2 = value.apply(this, arguments);
    this.textContent = v2 == null ? "" : v2;
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
    var v2 = value.apply(this, arguments);
    this.innerHTML = v2 == null ? "" : v2;
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
    for (var j = 0, i = -1, m2 = on.length, o2; j < m2; ++j) {
      if (o2 = on[j], (!typename.type || o2.type === typename.type) && o2.name === typename.name) {
        this.removeEventListener(o2.type, o2.listener, o2.options);
      } else {
        on[++i] = o2;
      }
    }
    if (++i) on.length = i;
    else delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o2, listener = contextListener(value);
    if (on) for (var j = 0, m2 = on.length; j < m2; ++j) {
      if ((o2 = on[j]).type === typename.type && o2.name === typename.name) {
        this.removeEventListener(o2.type, o2.listener, o2.options);
        this.addEventListener(o2.type, o2.listener = listener, o2.options = options);
        o2.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, options);
    o2 = { type: typename.type, name: typename.name, value, listener, options };
    if (!on) this.__on = [o2];
    else on.push(o2);
  };
}
function on_default(typename, value, options) {
  var typenames = parseTypenames2(typename + ""), i, n = typenames.length, t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m2 = on.length, o2; j < m2; ++j) {
      for (i = 0, o2 = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o2.type && t.name === o2.name) {
          return o2.value;
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
  drag.filter = function(_3) {
    return arguments.length ? (filter2 = typeof _3 === "function" ? _3 : constant_default2(!!_3), drag) : filter2;
  };
  drag.container = function(_3) {
    return arguments.length ? (container = typeof _3 === "function" ? _3 : constant_default2(_3), drag) : container;
  };
  drag.subject = function(_3) {
    return arguments.length ? (subject = typeof _3 === "function" ? _3 : constant_default2(_3), drag) : subject;
  };
  drag.touchable = function(_3) {
    return arguments.length ? (touchable = typeof _3 === "function" ? _3 : constant_default2(!!_3), drag) : touchable;
  };
  drag.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? drag : value;
  };
  drag.clickDistance = function(_3) {
    return arguments.length ? (clickDistance2 = (_3 = +_3) * _3, drag) : Math.sqrt(clickDistance2);
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
  var m2, l2;
  format = (format + "").trim().toLowerCase();
  return (m2 = reHex.exec(format)) ? (l2 = m2[1].length, m2 = parseInt(m2[1], 16), l2 === 6 ? rgbn(m2) : l2 === 3 ? new Rgb(m2 >> 8 & 15 | m2 >> 4 & 240, m2 >> 4 & 15 | m2 & 240, (m2 & 15) << 4 | m2 & 15, 1) : l2 === 8 ? rgba(m2 >> 24 & 255, m2 >> 16 & 255, m2 >> 8 & 255, (m2 & 255) / 255) : l2 === 4 ? rgba(m2 >> 12 & 15 | m2 >> 8 & 240, m2 >> 8 & 15 | m2 >> 4 & 240, m2 >> 4 & 15 | m2 & 240, ((m2 & 15) << 4 | m2 & 15) / 255) : null) : (m2 = reRgbInteger.exec(format)) ? new Rgb(m2[1], m2[2], m2[3], 1) : (m2 = reRgbPercent.exec(format)) ? new Rgb(m2[1] * 255 / 100, m2[2] * 255 / 100, m2[3] * 255 / 100, 1) : (m2 = reRgbaInteger.exec(format)) ? rgba(m2[1], m2[2], m2[3], m2[4]) : (m2 = reRgbaPercent.exec(format)) ? rgba(m2[1] * 255 / 100, m2[2] * 255 / 100, m2[3] * 255 / 100, m2[4]) : (m2 = reHslPercent.exec(format)) ? hsla(m2[1], m2[2] / 100, m2[3] / 100, 1) : (m2 = reHslaPercent.exec(format)) ? hsla(m2[1], m2[2] / 100, m2[3] / 100, m2[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g2, b, a2) {
  if (a2 <= 0) r = g2 = b = NaN;
  return new Rgb(r, g2, b, a2);
}
function rgbConvert(o2) {
  if (!(o2 instanceof Color)) o2 = color(o2);
  if (!o2) return new Rgb();
  o2 = o2.rgb();
  return new Rgb(o2.r, o2.g, o2.b, o2.opacity);
}
function rgb(r, g2, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g2, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g2, b, opacity) {
  this.r = +r;
  this.g = +g2;
  this.b = +b;
  this.opacity = +opacity;
}
define_default(Rgb, rgb, extend(Color, {
  brighter(k2) {
    k2 = k2 == null ? brighter : Math.pow(brighter, k2);
    return new Rgb(this.r * k2, this.g * k2, this.b * k2, this.opacity);
  },
  darker(k2) {
    k2 = k2 == null ? darker : Math.pow(darker, k2);
    return new Rgb(this.r * k2, this.g * k2, this.b * k2, this.opacity);
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
function hsla(h2, s, l2, a2) {
  if (a2 <= 0) h2 = s = l2 = NaN;
  else if (l2 <= 0 || l2 >= 1) h2 = s = NaN;
  else if (s <= 0) h2 = NaN;
  return new Hsl(h2, s, l2, a2);
}
function hslConvert(o2) {
  if (o2 instanceof Hsl) return new Hsl(o2.h, o2.s, o2.l, o2.opacity);
  if (!(o2 instanceof Color)) o2 = color(o2);
  if (!o2) return new Hsl();
  if (o2 instanceof Hsl) return o2;
  o2 = o2.rgb();
  var r = o2.r / 255, g2 = o2.g / 255, b = o2.b / 255, min2 = Math.min(r, g2, b), max2 = Math.max(r, g2, b), h2 = NaN, s = max2 - min2, l2 = (max2 + min2) / 2;
  if (s) {
    if (r === max2) h2 = (g2 - b) / s + (g2 < b) * 6;
    else if (g2 === max2) h2 = (b - r) / s + 2;
    else h2 = (r - g2) / s + 4;
    s /= l2 < 0.5 ? max2 + min2 : 2 - max2 - min2;
    h2 *= 60;
  } else {
    s = l2 > 0 && l2 < 1 ? 0 : h2;
  }
  return new Hsl(h2, s, l2, o2.opacity);
}
function hsl(h2, s, l2, opacity) {
  return arguments.length === 1 ? hslConvert(h2) : new Hsl(h2, s, l2, opacity == null ? 1 : opacity);
}
function Hsl(h2, s, l2, opacity) {
  this.h = +h2;
  this.s = +s;
  this.l = +l2;
  this.opacity = +opacity;
}
define_default(Hsl, hsl, extend(Color, {
  brighter(k2) {
    k2 = k2 == null ? brighter : Math.pow(brighter, k2);
    return new Hsl(this.h, this.s, this.l * k2, this.opacity);
  },
  darker(k2) {
    k2 = k2 == null ? darker : Math.pow(darker, k2);
    return new Hsl(this.h, this.s, this.l * k2, this.opacity);
  },
  rgb() {
    var h2 = this.h % 360 + (this.h < 0) * 360, s = isNaN(h2) || isNaN(this.s) ? 0 : this.s, l2 = this.l, m2 = l2 + (l2 < 0.5 ? l2 : 1 - l2) * s, m1 = 2 * l2 - m2;
    return new Rgb(
      hsl2rgb(h2 >= 240 ? h2 - 240 : h2 + 120, m1, m2),
      hsl2rgb(h2, m1, m2),
      hsl2rgb(h2 < 120 ? h2 + 240 : h2 - 120, m1, m2),
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
function hsl2rgb(h2, m1, m2) {
  return (h2 < 60 ? m1 + (m2 - m1) * h2 / 60 : h2 < 180 ? m2 : h2 < 240 ? m1 + (m2 - m1) * (240 - h2) / 60 : m1) * 255;
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
    var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g2 = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
    return function(t) {
      start2.r = r(t);
      start2.g = g2(t);
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
    var n = colors.length, r = new Array(n), g2 = new Array(n), b = new Array(n), i, color2;
    for (i = 0; i < n; ++i) {
      color2 = rgb(colors[i]);
      r[i] = color2.r || 0;
      g2[i] = color2.g || 0;
      b[i] = color2.b || 0;
    }
    r = spline(r);
    g2 = spline(g2);
    b = spline(b);
    color2.opacity = 1;
    return function(t) {
      color2.r = r(t);
      color2.g = g2(t);
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
    for (var i2 = 0, o2; i2 < b; ++i2) s[(o2 = q[i2]).i] = o2.x(t);
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
      var i = -1, n = q.length, o2;
      while (++i < n) s[(o2 = q[i]).i] = o2.x(t);
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
  zoom.rho = function(_3) {
    var _1 = Math.max(1e-3, +_3), _22 = _1 * _1, _4 = _22 * _22;
    return zoomRho(_1, _22, _4);
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
function create(node, id2, self2) {
  var schedules = node.__transition, tween;
  schedules[id2] = self2;
  self2.timer = timer(schedule, 0, self2.time);
  function schedule(elapsed) {
    self2.state = SCHEDULED;
    self2.timer.restart(start2, self2.delay, self2.time);
    if (self2.delay <= elapsed) start2(elapsed - self2.delay);
  }
  function start2(elapsed) {
    var i, j, n, o2;
    if (self2.state !== SCHEDULED) return stop();
    for (i in schedules) {
      o2 = schedules[i];
      if (o2.name !== self2.name) continue;
      if (o2.state === STARTED) return timeout_default(start2);
      if (o2.state === RUNNING) {
        o2.state = ENDED;
        o2.timer.stop();
        o2.on.call("interrupt", node, node.__data__, o2.index, o2.group);
        delete schedules[i];
      } else if (+i < id2) {
        o2.state = ENDED;
        o2.timer.stop();
        o2.on.call("cancel", node, node.__data__, o2.index, o2.group);
        delete schedules[i];
      }
    }
    timeout_default(function() {
      if (self2.state === STARTED) {
        self2.state = RUNNING;
        self2.timer.restart(tick2, self2.delay, self2.time);
        tick2(elapsed);
      }
    });
    self2.state = STARTING;
    self2.on.call("start", node, node.__data__, self2.index, self2.group);
    if (self2.state !== STARTING) return;
    self2.state = STARTED;
    tween = new Array(n = self2.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o2 = self2.tween[i].value.call(node, node.__data__, self2.index, self2.group)) {
        tween[++j] = o2;
      }
    }
    tween.length = j + 1;
  }
  function tick2(elapsed) {
    var t = elapsed < self2.duration ? self2.ease.call(null, elapsed / self2.duration) : (self2.timer.restart(stop), self2.state = ENDING, 1), i = -1, n = tween.length;
    while (++i < n) {
      tween[i].call(node, t);
    }
    if (self2.state === ENDING) {
      self2.on.call("end", node, node.__data__, self2.index, self2.group);
      stop();
    }
  }
  function stop() {
    self2.state = ENDED;
    self2.timer.stop();
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
    var v2 = value.apply(this, arguments);
    if (typeof v2 !== "function") throw new Error();
    set2(this, id2).ease = v2;
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
        for (var children2 = select.call(node, node.__data__, i, group), child, inherit2 = get2(node, id2), k2 = 0, l2 = children2.length; k2 < l2; ++k2) {
          if (child = children2[k2]) {
            schedule_default(child, name, id2, k2, children2, inherit2);
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
  force.initialize = function(_3) {
    nodes = _3;
  };
  force.x = function(_3) {
    return arguments.length ? (x3 = +_3, force) : x3;
  };
  force.y = function(_3) {
    return arguments.length ? (y3 = +_3, force) : y3;
  };
  force.strength = function(_3) {
    return arguments.length ? (strength = +_3, force) : strength;
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
function extent_default(_3) {
  return arguments.length ? this.cover(+_3[0][0], +_3[0][1]).cover(+_3[1][0], +_3[1][1]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0], [this._x1, this._y1]];
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
function x_default(_3) {
  return arguments.length ? (this._x = _3, this) : this._x;
}

// node_modules/d3-quadtree/src/y.js
function defaultY(d) {
  return d[1];
}
function y_default(_3) {
  return arguments.length ? (this._y = _3, this) : this._y;
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
    for (var k2 = 0; k2 < iterations; ++k2) {
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
          var x3 = xi - data.x - data.vx, y3 = yi - data.y - data.vy, l2 = x3 * x3 + y3 * y3;
          if (l2 < r * r) {
            if (x3 === 0) x3 = jiggle_default(random), l2 += x3 * x3;
            if (y3 === 0) y3 = jiggle_default(random), l2 += y3 * y3;
            l2 = (r - (l2 = Math.sqrt(l2))) / l2 * strength;
            node.vx += (x3 *= l2) * (r = (rj *= rj) / (ri2 + rj));
            node.vy += (y3 *= l2) * r;
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
  force.iterations = function(_3) {
    return arguments.length ? (iterations = +_3, force) : iterations;
  };
  force.strength = function(_3) {
    return arguments.length ? (strength = +_3, force) : strength;
  };
  force.radius = function(_3) {
    return arguments.length ? (radius = typeof _3 === "function" ? _3 : constant_default5(+_3), initialize(), force) : radius;
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
    for (var k2 = 0, n = links.length; k2 < iterations; ++k2) {
      for (var i = 0, link, source, target, x3, y3, l2, b; i < n; ++i) {
        link = links[i], source = link.source, target = link.target;
        x3 = target.x + target.vx - source.x - source.vx || jiggle_default(random);
        y3 = target.y + target.vy - source.y - source.vy || jiggle_default(random);
        l2 = Math.sqrt(x3 * x3 + y3 * y3);
        l2 = (l2 - distances[i]) / l2 * alpha * strengths[i];
        x3 *= l2, y3 *= l2;
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
  force.links = function(_3) {
    return arguments.length ? (links = _3, initialize(), force) : links;
  };
  force.id = function(_3) {
    return arguments.length ? (id2 = _3, force) : id2;
  };
  force.iterations = function(_3) {
    return arguments.length ? (iterations = +_3, force) : iterations;
  };
  force.strength = function(_3) {
    return arguments.length ? (strength = typeof _3 === "function" ? _3 : constant_default5(+_3), initializeStrength(), force) : strength;
  };
  force.distance = function(_3) {
    return arguments.length ? (distance = typeof _3 === "function" ? _3 : constant_default5(+_3), initializeDistance(), force) : distance;
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
    for (var k2 = 0; k2 < iterations; ++k2) {
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
    nodes: function(_3) {
      return arguments.length ? (nodes = _3, initializeNodes(), forces.forEach(initializeForce), simulation) : nodes;
    },
    alpha: function(_3) {
      return arguments.length ? (alpha = +_3, simulation) : alpha;
    },
    alphaMin: function(_3) {
      return arguments.length ? (alphaMin = +_3, simulation) : alphaMin;
    },
    alphaDecay: function(_3) {
      return arguments.length ? (alphaDecay = +_3, simulation) : +alphaDecay;
    },
    alphaTarget: function(_3) {
      return arguments.length ? (alphaTarget = +_3, simulation) : alphaTarget;
    },
    velocityDecay: function(_3) {
      return arguments.length ? (velocityDecay = 1 - _3, simulation) : 1 - velocityDecay;
    },
    randomSource: function(_3) {
      return arguments.length ? (random = _3, forces.forEach(initializeForce), simulation) : random;
    },
    force: function(name, _3) {
      return arguments.length > 1 ? (_3 == null ? forces.delete(name) : forces.set(name, initializeForce(_3)), simulation) : forces.get(name);
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
    on: function(name, _3) {
      return arguments.length > 1 ? (event.on(name, _3), simulation) : event.on(name);
    }
  };
}

// node_modules/d3-force/src/manyBody.js
function manyBody_default() {
  var nodes, node, random, alpha, strength = constant_default5(-30), strengths, distanceMin2 = 1, distanceMax2 = Infinity, theta2 = 0.81;
  function force(_3) {
    var i, n = nodes.length, tree = quadtree(nodes, x2, y2).visitAfter(accumulate);
    for (alpha = _3, i = 0; i < n; ++i) node = nodes[i], tree.visit(apply);
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
  function apply(quad, x1, _3, x22) {
    if (!quad.value) return true;
    var x3 = quad.x - node.x, y3 = quad.y - node.y, w2 = x22 - x1, l2 = x3 * x3 + y3 * y3;
    if (w2 * w2 / theta2 < l2) {
      if (l2 < distanceMax2) {
        if (x3 === 0) x3 = jiggle_default(random), l2 += x3 * x3;
        if (y3 === 0) y3 = jiggle_default(random), l2 += y3 * y3;
        if (l2 < distanceMin2) l2 = Math.sqrt(distanceMin2 * l2);
        node.vx += x3 * quad.value * alpha / l2;
        node.vy += y3 * quad.value * alpha / l2;
      }
      return true;
    } else if (quad.length || l2 >= distanceMax2) return;
    if (quad.data !== node || quad.next) {
      if (x3 === 0) x3 = jiggle_default(random), l2 += x3 * x3;
      if (y3 === 0) y3 = jiggle_default(random), l2 += y3 * y3;
      if (l2 < distanceMin2) l2 = Math.sqrt(distanceMin2 * l2);
    }
    do
      if (quad.data !== node) {
        w2 = strengths[quad.data.index] * alpha / l2;
        node.vx += x3 * w2;
        node.vy += y3 * w2;
      }
    while (quad = quad.next);
  }
  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };
  force.strength = function(_3) {
    return arguments.length ? (strength = typeof _3 === "function" ? _3 : constant_default5(+_3), initialize(), force) : strength;
  };
  force.distanceMin = function(_3) {
    return arguments.length ? (distanceMin2 = _3 * _3, force) : Math.sqrt(distanceMin2);
  };
  force.distanceMax = function(_3) {
    return arguments.length ? (distanceMax2 = _3 * _3, force) : Math.sqrt(distanceMax2);
  };
  force.theta = function(_3) {
    return arguments.length ? (theta2 = _3 * _3, force) : Math.sqrt(theta2);
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
function Transform(k2, x3, y3) {
  this.k = k2;
  this.x = x3;
  this.y = y3;
}
Transform.prototype = {
  constructor: Transform,
  scale: function(k2) {
    return k2 === 1 ? this : new Transform(this.k * k2, this.x, this.y);
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
  zoom.scaleBy = function(selection2, k2, p, event) {
    zoom.scaleTo(selection2, function() {
      var k0 = this.__zoom.k, k1 = typeof k2 === "function" ? k2.apply(this, arguments) : k2;
      return k0 * k1;
    }, p, event);
  };
  zoom.scaleTo = function(selection2, k2, p, event) {
    zoom.transform(selection2, function() {
      var e = extent.apply(this, arguments), t0 = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p, p1 = t0.invert(p0), k1 = typeof k2 === "function" ? k2.apply(this, arguments) : k2;
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
  function scale(transform2, k2) {
    k2 = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k2));
    return k2 === transform2.k ? transform2 : new Transform(k2, transform2.x, transform2.y);
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
      var that = this, args = arguments, g2 = gesture(that, args).event(event), e = extent.apply(that, args), p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point, w2 = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]), a2 = that.__zoom, b = typeof transform2 === "function" ? transform2.apply(that, args) : transform2, i = interpolate(a2.invert(p).concat(w2 / a2.k), b.invert(p).concat(w2 / b.k));
      return function(t) {
        if (t === 1) t = b;
        else {
          var l2 = i(t), k2 = w2 / l2[2];
          t = new Transform(k2, p[0] - l2[0] * k2, p[1] - l2[1] * k2);
        }
        g2.zoom(null, t);
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
    var g2 = gesture(this, args).event(event), t = this.__zoom, k2 = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))), p = pointer_default(event);
    if (g2.wheel) {
      if (g2.mouse[0][0] !== p[0] || g2.mouse[0][1] !== p[1]) {
        g2.mouse[1] = t.invert(g2.mouse[0] = p);
      }
      clearTimeout(g2.wheel);
    } else if (t.k === k2) return;
    else {
      g2.mouse = [p, t.invert(p)];
      interrupt_default(this);
      g2.start();
    }
    noevent_default3(event);
    g2.wheel = setTimeout(wheelidled, wheelDelay);
    g2.zoom("mouse", constrain(translate(scale(t, k2), g2.mouse[0], g2.mouse[1]), g2.extent, translateExtent));
    function wheelidled() {
      g2.wheel = null;
      g2.end();
    }
  }
  function mousedowned(event, ...args) {
    if (touchending || !filter2.apply(this, arguments)) return;
    var currentTarget = event.currentTarget, g2 = gesture(this, args, true).event(event), v2 = select_default2(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true), p = pointer_default(event, currentTarget), x0 = event.clientX, y0 = event.clientY;
    nodrag_default(event.view);
    nopropagation3(event);
    g2.mouse = [p, this.__zoom.invert(p)];
    interrupt_default(this);
    g2.start();
    function mousemoved(event2) {
      noevent_default3(event2);
      if (!g2.moved) {
        var dx = event2.clientX - x0, dy = event2.clientY - y0;
        g2.moved = dx * dx + dy * dy > clickDistance2;
      }
      g2.event(event2).zoom("mouse", constrain(translate(g2.that.__zoom, g2.mouse[0] = pointer_default(event2, currentTarget), g2.mouse[1]), g2.extent, translateExtent));
    }
    function mouseupped(event2) {
      v2.on("mousemove.zoom mouseup.zoom", null);
      yesdrag(event2.view, g2.moved);
      noevent_default3(event2);
      g2.event(event2).end();
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
    var touches = event.touches, n = touches.length, g2 = gesture(this, args, event.changedTouches.length === n).event(event), started, i, t, p;
    nopropagation3(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer_default(t, this);
      p = [p, this.__zoom.invert(p), t.identifier];
      if (!g2.touch0) g2.touch0 = p, started = true, g2.taps = 1 + !!touchstarting;
      else if (!g2.touch1 && g2.touch0[2] !== p[2]) g2.touch1 = p, g2.taps = 0;
    }
    if (touchstarting) touchstarting = clearTimeout(touchstarting);
    if (started) {
      if (g2.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() {
        touchstarting = null;
      }, touchDelay);
      interrupt_default(this);
      g2.start();
    }
  }
  function touchmoved(event, ...args) {
    if (!this.__zooming) return;
    var g2 = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t, p, l2;
    noevent_default3(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer_default(t, this);
      if (g2.touch0 && g2.touch0[2] === t.identifier) g2.touch0[0] = p;
      else if (g2.touch1 && g2.touch1[2] === t.identifier) g2.touch1[0] = p;
    }
    t = g2.that.__zoom;
    if (g2.touch1) {
      var p0 = g2.touch0[0], l0 = g2.touch0[1], p1 = g2.touch1[0], l1 = g2.touch1[1], dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp, dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
      t = scale(t, Math.sqrt(dp / dl));
      p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      l2 = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
    } else if (g2.touch0) p = g2.touch0[0], l2 = g2.touch0[1];
    else return;
    g2.zoom("touch", constrain(translate(t, p, l2), g2.extent, translateExtent));
  }
  function touchended(event, ...args) {
    if (!this.__zooming) return;
    var g2 = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t;
    nopropagation3(event);
    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() {
      touchending = null;
    }, touchDelay);
    for (i = 0; i < n; ++i) {
      t = touches[i];
      if (g2.touch0 && g2.touch0[2] === t.identifier) delete g2.touch0;
      else if (g2.touch1 && g2.touch1[2] === t.identifier) delete g2.touch1;
    }
    if (g2.touch1 && !g2.touch0) g2.touch0 = g2.touch1, delete g2.touch1;
    if (g2.touch0) g2.touch0[1] = this.__zoom.invert(g2.touch0[0]);
    else {
      g2.end();
      if (g2.taps === 2) {
        t = pointer_default(t, this);
        if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
          var p = select_default2(this).on("dblclick.zoom");
          if (p) p.apply(this, arguments);
        }
      }
    }
  }
  zoom.wheelDelta = function(_3) {
    return arguments.length ? (wheelDelta = typeof _3 === "function" ? _3 : constant_default6(+_3), zoom) : wheelDelta;
  };
  zoom.filter = function(_3) {
    return arguments.length ? (filter2 = typeof _3 === "function" ? _3 : constant_default6(!!_3), zoom) : filter2;
  };
  zoom.touchable = function(_3) {
    return arguments.length ? (touchable = typeof _3 === "function" ? _3 : constant_default6(!!_3), zoom) : touchable;
  };
  zoom.extent = function(_3) {
    return arguments.length ? (extent = typeof _3 === "function" ? _3 : constant_default6([[+_3[0][0], +_3[0][1]], [+_3[1][0], +_3[1][1]]]), zoom) : extent;
  };
  zoom.scaleExtent = function(_3) {
    return arguments.length ? (scaleExtent[0] = +_3[0], scaleExtent[1] = +_3[1], zoom) : [scaleExtent[0], scaleExtent[1]];
  };
  zoom.translateExtent = function(_3) {
    return arguments.length ? (translateExtent[0][0] = +_3[0][0], translateExtent[1][0] = +_3[1][0], translateExtent[0][1] = +_3[0][1], translateExtent[1][1] = +_3[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
  };
  zoom.constrain = function(_3) {
    return arguments.length ? (constrain = _3, zoom) : constrain;
  };
  zoom.duration = function(_3) {
    return arguments.length ? (duration = +_3, zoom) : duration;
  };
  zoom.interpolate = function(_3) {
    return arguments.length ? (interpolate = _3, zoom) : interpolate;
  };
  zoom.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom : value;
  };
  zoom.clickDistance = function(_3) {
    return arguments.length ? (clickDistance2 = (_3 = +_3) * _3, zoom) : Math.sqrt(clickDistance2);
  };
  zoom.tapDistance = function(_3) {
    return arguments.length ? (tapDistance = +_3, zoom) : tapDistance;
  };
  return zoom;
}

// apps/agios-command-center/src/app.js
var import_xterm = __toESM(require_xterm());

// node_modules/@xterm/addon-fit/lib/addon-fit.mjs
var h = 2;
var _ = 1;
var o = class {
  activate(e) {
    this._terminal = e;
  }
  dispose() {
  }
  fit() {
    let e = this.proposeDimensions();
    if (!e || !this._terminal || isNaN(e.cols) || isNaN(e.rows)) return;
    let t = this._terminal._core;
    (this._terminal.rows !== e.rows || this._terminal.cols !== e.cols) && (t._renderService.clear(), this._terminal.resize(e.cols, e.rows));
  }
  proposeDimensions() {
    if (!this._terminal || !this._terminal.element || !this._terminal.element.parentElement) return;
    let t = this._terminal._core._renderService.dimensions;
    if (t.css.cell.width === 0 || t.css.cell.height === 0) return;
    let s = this._terminal.options.scrollback === 0 ? 0 : this._terminal.options.overviewRuler?.width || 14, r = window.getComputedStyle(this._terminal.element.parentElement), l2 = parseInt(r.getPropertyValue("height")), a2 = Math.max(0, parseInt(r.getPropertyValue("width"))), i = window.getComputedStyle(this._terminal.element), n = { top: parseInt(i.getPropertyValue("padding-top")), bottom: parseInt(i.getPropertyValue("padding-bottom")), right: parseInt(i.getPropertyValue("padding-right")), left: parseInt(i.getPropertyValue("padding-left")) }, m2 = n.top + n.bottom, d = n.right + n.left, c2 = l2 - m2, p = a2 - d - s;
    return { cols: Math.max(h, Math.floor(p / t.css.cell.width)), rows: Math.max(_, Math.floor(c2 / t.css.cell.height)) };
  }
};

// node_modules/@xterm/addon-web-links/lib/addon-web-links.mjs
var v = class {
  constructor(e, t, n, o2 = {}) {
    this._terminal = e;
    this._regex = t;
    this._handler = n;
    this._options = o2;
  }
  provideLinks(e, t) {
    let n = g.computeLink(e, this._regex, this._terminal, this._handler);
    t(this._addCallbacks(n));
  }
  _addCallbacks(e) {
    return e.map((t) => (t.leave = this._options.leave, t.hover = (n, o2) => {
      if (this._options.hover) {
        let { range: p } = t;
        this._options.hover(n, o2, p);
      }
    }, t));
  }
};
function k(l2) {
  try {
    let e = new URL(l2), t = e.password && e.username ? `${e.protocol}//${e.username}:${e.password}@${e.host}` : e.username ? `${e.protocol}//${e.username}@${e.host}` : `${e.protocol}//${e.host}`;
    return l2.toLocaleLowerCase().startsWith(t.toLocaleLowerCase());
  } catch {
    return false;
  }
}
var g = class l {
  static computeLink(e, t, n, o2) {
    let p = new RegExp(t.source, (t.flags || "") + "g"), [i, r] = l._getWindowedLineStrings(e - 1, n), s = i.join(""), a2, d = [];
    for (; a2 = p.exec(s); ) {
      let u = a2[0];
      if (!k(u)) continue;
      let [c2, h2] = l._mapStrIdx(n, r, 0, a2.index), [m2, f] = l._mapStrIdx(n, c2, h2, u.length);
      if (c2 === -1 || h2 === -1 || m2 === -1 || f === -1) continue;
      let b = { start: { x: h2 + 1, y: c2 + 1 }, end: { x: f, y: m2 + 1 } };
      d.push({ range: b, text: u, activate: o2 });
    }
    return d;
  }
  static _getWindowedLineStrings(e, t) {
    let n, o2 = e, p = e, i = 0, r = "", s = [];
    if (n = t.buffer.active.getLine(e)) {
      let a2 = n.translateToString(true);
      if (n.isWrapped && a2[0] !== " ") {
        for (i = 0; (n = t.buffer.active.getLine(--o2)) && i < 2048 && (r = n.translateToString(true), i += r.length, s.push(r), !(!n.isWrapped || r.indexOf(" ") !== -1)); ) ;
        s.reverse();
      }
      for (s.push(a2), i = 0; (n = t.buffer.active.getLine(++p)) && n.isWrapped && i < 2048 && (r = n.translateToString(true), i += r.length, s.push(r), r.indexOf(" ") === -1); ) ;
    }
    return [s, o2];
  }
  static _mapStrIdx(e, t, n, o2) {
    let p = e.buffer.active, i = p.getNullCell(), r = n;
    for (; o2; ) {
      let s = p.getLine(t);
      if (!s) return [-1, -1];
      for (let a2 = r; a2 < s.length; ++a2) {
        s.getCell(a2, i);
        let d = i.getChars();
        if (i.getWidth() && (o2 -= d.length || 1, a2 === s.length - 1 && d === "")) {
          let c2 = p.getLine(t + 1);
          c2 && c2.isWrapped && (c2.getCell(0, i), i.getWidth() === 2 && (o2 += 1));
        }
        if (o2 < 0) return [t, a2];
      }
      t++, r = 0;
    }
    return [t, r];
  }
};
var _2 = /(https?|HTTPS?):[/]{2}[^\s"'!*(){}|\\\^<>`]*[^\s"':,.!?{}|\\\^~\[\]`()<>]/;
function w(l2, e) {
  let t = window.open();
  if (t) {
    try {
      t.opener = null;
    } catch {
    }
    t.location.href = e;
  } else console.warn("Opening link blocked as opener could not be cleared");
}
var L = class {
  constructor(e = w, t = {}) {
    this._handler = e;
    this._options = t;
  }
  activate(e) {
    this._terminal = e;
    let t = this._options, n = t.urlRegex || _2;
    this._linkProvider = this._terminal.registerLinkProvider(new v(this._terminal, n, this._handler, t));
  }
  dispose() {
    this._linkProvider?.dispose();
  }
};

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
  agent: "Agent Workspace",
  surfaces: "Live Apps"
};
var state = {
  data: null,
  view: "command",
  dreaming: null,
  memoryFolder: "all",
  memoryNote: null,
  memoryComposeOpen: false,
  memorySearchOpen: false,
  learned: null,
  costs: null,
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
  osMapSimulation: null,
  osMapLayer: "all",
  operationalLoading: false,
  surfaces: [],
  activeSurface: null,
  surfaceProbes: {}
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
  return `<section class="chief-desk route-${esc(routeState)}" aria-label="Ari Vale Chief of Staff">
    <header class="chief-header">
      <div class="chief-identity"><p class="eyebrow">CHIEF OF STAFF \xB7 ARI VALE</p><h1>Route work with Ari.</h1><p>One outcome in. Ari chooses business, department, lead and model \u2014 you approve before anything runs.</p></div>
      <div class="chief-presence"><i></i><span><strong>${esc(ari?.name || "Ari Vale")}</strong><small>${plan ? esc(titleCase(plan.status)) : "Listening for your outcome"}</small></span></div>
    </header>
    <form class="chief-command" data-chief-form>
      <label class="chief-input"><span>TELL ARI THE OUTCOME</span><textarea name="objective" required maxlength="7200" placeholder="Example: Improve the customer dashboard, research the best motion system, build it safely and have an independent critic review the result."></textarea></label>
      <div class="chief-command-actions">${chiefVoiceControl()}<label><span>Business</span><select name="businessId"><option value="">Ari decides</option>${businessOptions}</select></label><label><span>Data</span><select name="dataClass"><option value="internal">Internal</option><option value="public">Public</option><option value="private_business">Private business</option><option value="customer_restricted">Customer restricted</option></select></label><button class="chief-plan" type="submit"><span>Route with Ari</span><b>\u2301</b></button></div>
      <p class="chief-command-note">Planning is local and starts no model. Voice always becomes editable text first.</p>
    </form>
    ${plan ? `<div class="route-review"><div><small>ARI'S ROUTING DECISION</small><h2>${esc(department?.name || plan.department_id)} \u2192 ${esc(lead?.name || plan.lead_agent_id)} \u2192 ${esc(plan.model_id)}</h2><ul>${rationale}</ul></div>${dispatch2}</div>` : ""}
    <aside class="critic-rail"><header><div><small>GAUNTLET REVIEW</small><strong>Independent quality gates</strong></div><span>${plan ? "PLANNED" : "STANDBY"}</span></header>${critics}<p class="critic-truth">Critics run only when a real review run exists.</p></aside>
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
function dreamingDigestSurface() {
  const digest = state.dreaming;
  if (!digest) return "";
  const cards = digest.recommendations.map((rec, index2) => {
    const evidence = Object.entries(rec.evidence || {}).map(([key, value]) => `${key} ${value}`).join(" \xB7 ");
    return `<article class="dreaming-card" style="--dreaming-index:${index2}">
      <header><span class="dreaming-dim">${esc(digest.dimensions.find((d) => d.id === rec.dimension)?.label || rec.dimension)}</span><span class="dreaming-evidence">${esc(evidence)}</span></header>
      <h3>${esc(rec.title)}</h3>
      <p>${esc(rec.detail)}</p>
      <footer>
        <button class="dreaming-accept" data-dreaming-accept="${esc(rec.id)}" data-dreaming-target="${esc(rec.action.target || "")}">${esc(rec.action.label || "Accept")}</button>
        <button class="dreaming-dismiss" data-dreaming-dismiss="${esc(rec.id)}">Not now</button>
      </footer>
    </article>`;
  }).join("");
  const dimensionChips = digest.dimensions.map((dim) => `<span class="dreaming-chip is-${esc(dim.status)}" title="${esc(dim.detail)}">${esc(dim.label)}</span>`).join("");
  const empty2 = digest.recommendations.length ? "" : `<div class="dreaming-empty"><b>Nothing needs you right now.</b> <span>Every dimension is measured, and no real signal produced a recommendation. New evidence appears here automatically.</span></div>`;
  return `<section class="dreaming-digest"><header><div><p class="eyebrow">DREAMING DIGEST \xB7 EVERY DAY</p><h2>${digest.recommendations.length} high-leverage recommendation${digest.recommendations.length === 1 ? "" : "s"} for you.</h2><p>Eight dimensions measured against real local stores; only genuine signals become cards. Nothing here is synthetic.</p></div><span class="dreaming-stamp">LOCAL \xB7 EVIDENCE-GATED</span></header><div class="dreaming-dims">${dimensionChips}</div><div class="dreaming-cards">${cards || empty2}</div></section>`;
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
    ${dreamingDigestSurface()}
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
function evidenceChips(run) {
  const chips = [
    { label: "memory", count: (run.memory_ids || []).length, tone: "violet" },
    { label: "skills", count: (run.skill_ids || []).length, tone: "mint" },
    { label: "images", count: (run.vision_asset_ids || []).length, tone: "coral" }
  ];
  return `<div class="evidence-chips">${chips.map((chip) => `<span class="evidence-chip tone-${chip.tone}${chip.count ? "" : " is-empty"}" title="${chip.count ? `${chip.count} ${chip.label} attached to this run` : `No ${chip.label} attached`}"><i></i>${chip.label} ${chip.count}</span>`).join("")}</div>`;
}
function runCard(run, { transcript = false } = {}) {
  const active = ["queued", "running"].includes(run.status);
  const approval = run.status === "awaiting_approval" ? `<div class="approval-gate"><div><strong>Exact run approval required</strong><small>${esc(titleCase(run.data_class))} \xB7 ${esc(run.provider || "local runtime")} \xB7 ${esc(run.model || "profile model")}</small></div><div class="approval-actions"><button data-cancel-run="${esc(run.run_id)}">Cancel</button><button data-approve-run="${esc(run.run_id)}" data-approval-digest="${esc(run.approval_digest)}">Approve & run</button></div></div>` : "";
  const response = run.response ? `<div class="run-response"><div class="response-heading"><span>${esc(titleCase(run.agent_id))}</span><button type="button" data-speak-run="${esc(run.run_id)}" title="Speak this reply">Listen</button>${run.status === "completed" ? `<button type="button" class="gauntlet-launch" data-gauntlet-run="${esc(run.run_id)}" title="Independent critics: brief, system, craft">Run gauntlet review</button>` : ""}</div><pre>${esc(run.response)}</pre></div>` : run.status === "failed" ? runError(run) : active ? `<div class="run-progress"><i></i><span>${run.status === "queued" ? "Waiting for the supervised worker" : "The worker is thinking; this view refreshes automatically"}</span></div>` : "";
  return `<article class="run-card ${transcript ? "is-transcript" : ""}"><header><div><span>${esc(titleCase(run.mode))} \xB7 ${new Date(run.created_at).toLocaleString()}</span><strong>${esc(titleCase(run.agent_id))}</strong></div>${status(run.status)}</header><div class="run-request"><span>OWNER</span><p>${esc(run.objective)}</p></div>${approval}${response}<footer>${evidenceChips(run)}<span>${esc(titleCase(run.runtime_id || "hermes"))}${run.workspace_id ? ` \xB7 ${esc(titleCase(run.workspace_access))} workspace` : ""} \xB7 ${active ? "working" : esc(run.hermes_session_id || "audited locally")}</span></footer></article>`;
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
function roiBadge(proposal) {
  const roi = proposal.roi_estimate;
  if (!roi || roi.status === "needs-evidence") return `<span class="roi-badge is-estimate">ROI \xB7 needs evidence runs</span>`;
  return `<span class="roi-badge is-estimate" title="${esc(roi.basis)}">ROI est. ${roi.minutes_saved_per_future_run} min saved per future run \xB7 ${roi.evidence_runs} evidence run${roi.evidence_runs === 1 ? "" : "s"}</span>`;
}
function skillDraftCard(proposal) {
  if (!["draft_ready", "validated", "installed"].includes(proposal.status)) return `<div class="growth-proposal"><div><strong>${esc(proposal.skill_name)}</strong><small>${esc(titleCase(proposal.change_kind))} \xB7 ${esc(titleCase(proposal.status))}</small></div>${roiBadge(proposal)}${status(proposal.status)}</div>`;
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
  const modelChips = modelsForAgent(agent).map((model) => `<span class="model-chip ${model.id === agent.model ? "is-selected" : ""}" title="${esc(model.cost_note || "cost not reported")}"><i class="status-dot status-${model.location === "local" ? "ready" : "planned"}"></i>${esc(model.id)}</span>`).join("");
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
function memoryVaultSurface() {
  const memories = state.memories || [];
  const scopeKinds = ["portfolio", "business", "department", "project", "private"];
  const folders = [
    { id: "all", label: "All memories" },
    ...scopeKinds.map((kind) => ({ id: kind, label: titleCase(kind) }))
  ];
  const filtered = state.memoryFolder === "all" ? memories : memories.filter((memory) => memory.scope_kind === state.memoryFolder);
  const selected = filtered.find((memory) => memory.memory_id === state.memoryNote) || filtered[0] || null;
  const rows = filtered.map((memory) => `
    <button class="memory-vault-note${selected && selected.memory_id === memory.memory_id ? " is-active" : ""}" data-memory-note="${esc(memory.memory_id)}">
      <span class="memory-vault-note-title">${esc(memory.title)}</span>
      <span class="memory-vault-note-excerpt">${esc((memory.body || "").slice(0, 110))}</span>
      <span class="memory-vault-note-meta">${esc(titleCase(memory.scope_kind))} \xB7 ${esc(titleCase(memory.trust))} trust</span>
    </button>`).join("");
  const folderButtons = folders.map((folder) => {
    const count = folder.id === "all" ? memories.length : memories.filter((memory) => memory.scope_kind === folder.id).length;
    return `<button class="${state.memoryFolder === folder.id ? "is-active" : ""}" data-memory-folder="${esc(folder.id)}"><span>${folder.id === "all" ? "\u25A4" : "\u25B8"}</span>${esc(folder.label)}<em>${count}</em></button>`;
  }).join("");
  const reader = selected ? `<article class="memory-vault-reader"><small>${esc(titleCase(selected.scope_kind))} / ${esc(selected.scope_id)} \xB7 ${esc(titleCase(selected.trust))} trust \xB7 by ${esc(titleCase(selected.created_by))}</small><h3>${esc(selected.title)}</h3><p>${esc(selected.body)}</p></article>` : `<article class="memory-vault-reader is-empty"><h3>No note selected</h3><p>${memories.length ? "Choose a memory from the list to read it." : "The vault is empty. Save the first durable fact from the form below."}</p></article>`;
  return `<section class="memory-vault">
    <header><div><p class="eyebrow">MEMORY VAULT</p><h2>${memories.length} durable memor${memories.length === 1 ? "y" : "ies"}</h2><p>Folders are authorization scopes. Select a note to read it.</p></div><span>${state.data.agents.length} authorized agents</span></header>
    <div class="memory-vault-body">
      <aside class="memory-vault-tree">${folderButtons}</aside>
      <div class="memory-vault-list">${rows || `<div class="memory-vault-empty"><strong>Empty ${state.memoryFolder === "all" ? "vault" : esc(titleCase(state.memoryFolder))} folder</strong><span>Facts saved under this scope will appear here.</span></div>`}</div>
      ${reader}
    </div>
  </section>`;
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
  ["webui", "Web UI", "\u25A3"],
  ["terminal", "Terminal", ">_"],
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
    return `<form class="model-assignment" data-model-preference-form data-agent-id="${esc(agent.id)}"><div class="agent-orb">${initials(agent.name || agent.id)}</div><div><strong>${esc(agent.name || titleCase(agent.id))}</strong><small>${esc(agent.profession || titleCase(agent.role))}</small></div><label>Default model<select name="modelId"><option value="">Hermes profile default</option>${models.map((model) => `<option value="${esc(model.id)}" ${selected === model.id ? "selected" : ""} title="${esc(model.cost_note || "cost not reported")}">${esc(model.id)} \xB7 ${esc(model.provider)} \xB7 ${esc(model.cost_note || "cost not reported")}</option>`).join("")}</select></label><button type="submit">Save</button></form>`;
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
  if (state.systemMode === "webui") return hermesWebSurface();
  if (state.systemMode === "terminal") {
    const surface = terminalSurfaceForSystem("hermes");
    return surface ? systemTerminalSurface(surface) : "";
  }
  if (state.systemMode === "control") return hermesControlRoom(system);
  if (state.systemMode === "goal") return `${specialistIntro("Goal Mode", "Set the target. Walk away.", "Hermes works in the background, preserves the real session and returns the result for review. Exact approval remains bound to the complete context.", chief, [["ACTIVE", String(state.runs.filter((run) => ["queued", "running"].includes(run.status)).length)], ["TOTAL", String(state.runs.filter((run) => run.mode === "goal").length)]])}${operationalWorkspace(chief, "goal")}`;
  return studioDesk();
}
function renderHermesSystem(system) {
  disposeSurfaceSession();
  const modelChips = modelsForSystem(system).map((model) => `<span class="model-chip"><i class="status-dot status-${model.location === "local" ? "ready" : "routed"}"></i>${esc(model.id)}</span>`).join("");
  page.innerHTML = `<div class="system-hero hermes-hero"><div class="system-identity"><p class="eyebrow">IV. \u2014 AGENT \xB7 HERMES</p><h1>Hermes</h1><p>Primary AGIOS worker. Chat, voice, research, goals, sessions, skills, workspaces and tools at one desk.</p><small>${new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Yerevan" }).format(/* @__PURE__ */ new Date())} \xB7 LOCAL \xB7 STUDIO</small></div><div class="system-hero-status">${status(system.status)}<small>${state.data.runtime.gateway_running ? "Hermes online" : "Hermes standing by"}</small></div></div><div class="mode-strip system-modes hermes-modes">${hermesModes.map(([id2, label, icon]) => `<button class="${state.systemMode === id2 ? "is-active" : ""}" data-system-mode="${id2}"><span>${icon}</span>${label}</button>`).join("")}</div><div class="model-strip hermes-model-strip" aria-label="Hermes model routes">${modelChips}</div><div class="agent-mode-content hermes-mode-content">${hermesModeContent(system)}</div>`;
  if (state.systemMode === "terminal") {
    const surface = terminalSurfaceForSystem("hermes");
    const container = page.querySelector("[data-surface-terminal]");
    if (surface && container) {
      container.classList.add("is-live");
      window.setTimeout(() => connectSurfaceTerminal(container, surface.id), 0);
    }
  }
  renderSystemNavigation();
}
function systemModeContent(system) {
  const models = modelsForSystem(system);
  const runtime = runtimeForSystem(system.id);
  if (state.systemMode === "chat") return routedSystemLauncher(system, "chat");
  if (state.systemMode === "goals") return routedSystemLauncher(system, "goal");
  if (state.systemMode === "workspace") return routedSystemLauncher(system, "workspace");
  if (state.systemMode === "terminal") {
    const surface = terminalSurfaceForSystem(system.id);
    return surface ? systemTerminalSurface(surface) : "";
  }
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
  if (terminalSurfaceForSystem(system.id)) modes.push(["terminal", "Terminal"]);
  if (!modes.some(([id2]) => id2 === state.systemMode)) state.systemMode = "overview";
  disposeSurfaceSession();
  page.innerHTML = `<div class="system-hero"><div class="system-identity"><p class="eyebrow">AI SYSTEM \xB7 ${esc(titleCase(system.kind))}</p><h1>${esc(system.name)}</h1><p>${esc(system.description)}</p></div><div class="system-hero-status">${status(runtime.status)}<small>${esc(titleCase(runtime.adapter))}</small></div></div><div class="mode-strip system-modes">${modes.map(([id2, label]) => `<button class="${state.systemMode === id2 ? "is-active" : ""}" data-system-mode="${id2}"><span>${id2 === "memory" ? "\u2726" : id2 === "skills" ? "\u25C7" : id2 === "models" ? "\u25CC" : id2 === "terminal" ? ">_" : id2 === "control" ? ">_" : id2 === "workspace" ? "\u25B1" : "\u25A1"}</span>${label}</button>`).join("")}</div><div class="agent-mode-content">${systemModeContent(system)}</div>`;
  if (state.systemMode === "terminal") {
    const surface = terminalSurfaceForSystem(system.id);
    const container = page.querySelector("[data-surface-terminal]");
    if (surface && container) {
      container.classList.add("is-live");
      window.setTimeout(() => connectSurfaceTerminal(container, surface.id), 0);
    }
  }
  renderSystemNavigation();
}
function skillHygieneSurface() {
  const pending = state.skillProposals.filter((item) => item.status !== "installed");
  const installed = state.skillProposals.filter((item) => item.status === "installed");
  return `<section class="skill-hygiene"><header><div><p class="eyebrow">SKILL LAB</p><h2>Learn, test, approve, then share.</h2></div><button data-view-link="agents">Open professional growth \u2192</button></header><div><article><small>CANDIDATE INTAKE</small><strong>${pending.length}</strong><p>URLs, repeated corrections, and completed work enter as proposals\u2014not trusted instructions.</p></article><article><small>VALIDATION</small><strong>Required</strong><p>Source, license, malicious content, alternatives, duplicates, and a test result are checked before install.</p></article><article><small>LIVE EVOLUTION</small><strong>${installed.length}</strong><p>Installed AGIOS-authored skills remain versioned, reviewable, and owner governed.</p></article><article><small>HYGIENE</small><strong>Ongoing</strong><p>Stale, unused, verbose, or superseded skills should be pruned instead of accumulating forever.</p></article></div></section>`;
}
function knowledgeIntakeSurface() {
  const summary = state.learned?.summary || { documents: 0, indexed_chunks: 0 };
  const docs = (state.learned?.documents || []).map((doc) => `<article class="learned-doc"><header><strong>${esc(doc.title)}</strong><em>${doc.chunk_count} chunks \xB7 ${(doc.glossary || []).length} terms</em></header><p>${esc(doc.cheat_sheet || "Deterministic index only \u2014 no model summary exists.")}</p><footer><span>${esc(doc.source_name)} \xB7 ${new Date(doc.created_at).toLocaleString()}</span><span class="learned-terms">${(doc.glossary || []).slice(0, 5).map((term) => `<i>${esc(term)}</i>`).join("")}</span></footer></article>`).join("");
  return `<section class="knowledge-intake"><header><div><p class="eyebrow">KNOWLEDGE INTAKE \xB7 /LEARN STYLE</p><h2>Give AGIOS a document once. It builds a brain file.</h2><p>One deterministic index per document: real chunks, a term glossary, and a cheat sheet of opening statements. No model-generated summary, so nothing can be hallucinated.</p></div><span>${summary.documents} learned \xB7 ${summary.indexed_chunks} indexed chunks</span></header><div class="learn-grid"><form class="workspace-card learn-form" data-learn-form><label>Title<input name="title" required maxlength="160" placeholder="Perfume import compliance guide"/></label><label>Source<input name="sourceName" maxlength="160" value="pasted" placeholder="book, PDF notes, article"/></label><label>Document text<textarea name="text" required maxlength="200000" placeholder="Paste the document text. AGIOS splits it into bounded chunks, extracts frequent terms, and keeps the index \u2014 never a rewrite."></textarea></label><button type="submit">Build brain file</button></form><div class="learned-list">${docs || `<div class="workspace-empty workspace-card"><b>\u25A4</b><strong>No brain files yet</strong><span>Learned documents appear here with their real index, ready for retrieval.</span></div>`}</div></div></section>`;
}
function renderSharedSkills() {
  const registry = state.data.shared_fabric.skills;
  const categories = Object.keys(registry.categories);
  const filtered = registry.items.filter((skill) => (state.skillCategory === "all" || skill.category === state.skillCategory) && (!state.skillQuery || `${skill.name} ${skill.description}`.toLowerCase().includes(state.skillQuery.toLowerCase())));
  page.innerHTML = `${heading("Shared capability fabric", "Install once. Use everywhere\u2014with policy.", "Hermes, Codex, Gemini, Antigravity, DeepSeek and future workers discover skills through one live AGIOS registry. Skill bodies remain runtime-side.")}${knowledgeIntakeSurface()}${skillHygieneSurface()}<div class="fabric-summary"><div><small>LIVE SKILLS</small><strong>${registry.inventory}</strong></div><div><small>CATEGORIES</small><strong>${categories.length}</strong></div><div><small>AGENTS ATTACHED</small><strong>${registry.attached_agents}</strong></div><div><small>ELIGIBLE SYSTEMS</small><strong>${registry.eligible_systems}</strong></div></div><div class="catalog-toolbar"><label>\u2315<input id="skill-search" value="${esc(state.skillQuery)}" placeholder="Search skills and techniques" /></label><div class="category-strip"><button class="${state.skillCategory === "all" ? "is-active" : ""}" data-skill-category="all">All</button>${categories.slice(0, 8).map((category) => `<button class="${state.skillCategory === category ? "is-active" : ""}" data-skill-category="${esc(category)}">${esc(titleCase(category))} \xB7 ${registry.categories[category]}</button>`).join("")}</div></div><div class="skill-catalog">${filtered.slice(0, 60).map((skill) => `<article><header><span>${esc(skill.category)}</span><em>SHARED</em></header><h3>${esc(titleCase(skill.name))}</h3><p>${esc(skill.description || "No description provided")}</p><footer><span>All authorized agents</span><span>Available</span></footer></article>`).join("")}</div>${filtered.length > 60 ? `<p class="catalog-note">Showing 60 of ${filtered.length} matches. Refine the search to narrow the live registry.</p>` : ""}`;
}
function operationalMemorySurface(feedless = false) {
  const summary = state.data.operational?.shared_memory || { fact_count: 0, scopes: {} };
  const entries = state.memories.map((memory) => `<article class="shared-memory-card"><header><span>${esc(titleCase(memory.scope_kind))} \xB7 ${esc(memory.scope_id)}</span><em>${esc(titleCase(memory.trust))} trust</em></header><h3>${esc(memory.title)}</h3><p>${esc(memory.body)}</p><footer><span>${esc(titleCase(memory.created_by))}</span><time>${new Date(memory.updated_at).toLocaleString()}</time></footer></article>`).join("");
  return `<div class="operational-memory-grid"><form class="memory-compose workspace-card" data-memory-form><div class="compose-title"><div><p class="eyebrow">AGIOS shared store</p><h3>Add durable knowledge</h3></div>${status(state.data.operational?.status || "unavailable")}</div><p>This is the real cross-agent memory layer. Saved facts become retrievable by every agent authorized for the selected scope.</p><label>Title<input name="title" required maxlength="160" placeholder="A concise, stable fact"/></label><label>Memory<textarea name="body" required maxlength="4000" placeholder="Record the verified knowledge, decision, or operating preference. Never include credentials."></textarea></label><div class="operational-options"><label>Scope<select name="scopeKind"><option value="portfolio">Portfolio \xB7 all agents</option><option value="business">Business</option><option value="department">Department</option><option value="project">Project</option><option value="private">Private agent</option></select></label><label>Scope ID<input name="scopeId" required maxlength="128" value="portfolio"/></label></div><div class="compose-submit"><span>${summary.fact_count} shared memories currently stored</span><button type="submit">Save to shared memory</button></div></form>${feedless ? "" : `<section class="shared-memory-feed"><div class="run-feed-heading"><div><p class="eyebrow">Authorized view \xB7 Default agent</p><h3>${state.memories.length} readable memories</h3></div><span>LIVE</span></div>${entries || `<div class="workspace-empty workspace-card"><b>\u2726</b><strong>The shared store is ready</strong><span>Add the first portfolio memory to make it available to all seven agents.</span></div>`}</section>`}</div>`;
}
function retrievalWorkbench() {
  const mode = state.data.operational?.retrieval?.mode || "scoped-lexical-v1";
  const hits = state.retrievalHits.map((hit) => `<article class="evidence-card"><header><code>${esc(hit.citation_id)}</code><span>${Math.round(Number(hit.score || 0) * 100)}% match</span></header><h3>${esc(hit.title)}</h3><p>${esc(hit.body)}</p><footer><span>${esc(titleCase(hit.scope_kind))} / ${esc(hit.scope_id)}</span><span>${esc(titleCase(hit.trust))} trust</span></footer></article>`).join("");
  const agents = state.data.agents.map((agent) => `<option value="${esc(agent.id)}">${esc(titleCase(agent.id))}</option>`).join("");
  return `<section class="retrieval-workbench"><form class="workspace-card retrieval-compose" data-retrieval-form><div><p class="eyebrow">RAG evidence console</p><h3>Search what an agent is allowed to know</h3><p>Mode: ${esc(mode)}. Results include provenance and citation IDs; no-match queries return no evidence.</p></div><div class="retrieval-fields"><label>Agent<select name="agentId">${agents}</select></label><label>Project scope<input name="projectId" maxlength="128" placeholder="Optional project ID"/></label><label>Evidence query<input name="query" required maxlength="8000" placeholder="What verified knowledge do we have about..."/></label><button type="submit">Retrieve evidence</button></div></form><div class="evidence-feed">${hits || `<div class="workspace-empty workspace-card"><b>RAG</b><strong>Evidence appears here</strong><span>Searches are local and restricted to the selected agent's authorized scopes.</span></div>`}</div></section>`;
}
function renderSharedMemory() {
  if (!state.memories.length) {
    const compose2 = state.memoryComposeOpen ? operationalMemorySurface(true) : "";
    page.innerHTML = `${heading("Memory", "Facts agents can read.", "")}<div class="memory-vault is-empty"><div class="memory-vault-empty-state"><h3>No memories yet</h3><p>Save the first durable fact and every authorized agent can read it.</p><button data-memory-toggle="compose">\uFF0B Save first memory</button></div></div>${compose2}`;
    return;
  }
  const compose = state.memoryComposeOpen ? operationalMemorySurface(true) : "";
  const search = state.memorySearchOpen ? retrievalWorkbench() : "";
  page.innerHTML = `${heading("Memory", "Facts agents can read.", "")}<div class="memory-toolbar"><button data-memory-toggle="compose">\uFF0B New memory</button><button data-memory-toggle="search">\u2315 Search</button></div>${memoryVaultSurface()}${compose}${search}`;
}
function repositorySurface() {
  return `<div class="repository-grid">${state.data.repositories.map((repo) => `<article><header><span>\u25B1</span>${status(repo.status)}</header><h3>${esc(repo.name)}</h3><p>${esc(titleCase(repo.visibility))} \xB7 owner ${esc(titleCase(repo.owner_agent_id))}</p><div class="boundary-note">Repository paths and customer contents stay server-side. External actions require explicit approval.</div></article>`).join("")}</div>`;
}
function renderRepositories() {
  page.innerHTML = `${heading("Repository fabric", "Every workspace can be operated without losing its boundary.", "AGIOS registers repositories and project workspaces for agents and systems, while customer paths and contents remain hidden from the browser.")}<div class="system-summary"><span><strong>${state.data.summary.repositories}</strong> registered repositories</span><span><strong>${state.workspaces.length}</strong> approved workspaces</span><span><strong>${state.data.summary.shared_skills}</strong> reusable skills</span></div>${workspaceRegistryCard()}${repositorySurface()}`;
}
async function loadCosts() {
  try {
    state.costs = await api("/api/v1/costs");
  } catch {
    state.costs = null;
  }
}
function costSurface() {
  const snapshot = state.costs;
  if (!snapshot) return `<section class="panel cost-panel"><header class="panel-header"><div><h2>Live provider costs</h2><p>Vendor-reported balances and usage, refreshed on request</p></div><span>Unavailable</span></header><div class="workspace-empty"><strong>Cost adapter offline</strong><span>The local costs endpoint did not respond. Restart AGIOS and retry.</span></div></section>`;
  const rows = snapshot.providers.map((provider) => {
    const badge = provider.status === "reported" ? status("reported") : provider.status === "reported-empty" ? `<span class="status-dot status-warning"></span>` : status(provider.status);
    const figures = provider.status === "reported" && provider.usage_30d !== void 0 ? `<div class="cost-figures"><strong>$${Number(provider.usage_30d).toFixed(2)}</strong><span>usage 30d</span>${provider.remaining !== void 0 && provider.remaining !== null ? `<strong>$${Number(provider.remaining).toFixed(2)}</strong><span>remaining</span>` : ""}</div>` : "";
    return `<article class="cost-row"><header><div><strong>${esc(provider.label)}</strong><small>${esc(provider.reason || provider.note || provider.detail || "")}</small></div>${badge}</header>${figures}${provider.balances && provider.balances.length ? `<div class="cost-balances">${provider.balances.map((balance) => `<span><b>${esc(String(balance.currency || "?"))}</b> ${esc(String(balance.total_balance ?? "n/a"))} total${balance.granted_balance !== void 0 ? ` \xB7 ${esc(String(balance.granted_balance))} granted` : ""}</span>`).join("")}</div>` : ""}</article>`;
  }).join("");
  return `<section class="panel cost-panel"><header class="panel-header"><div><h2>Live provider costs</h2><p>Read once from each provider API and cached for 5 minutes. Keys stay in the environment and never leave the machine.</p></div><span>${snapshot.total.reported ? `$${snapshot.total.reported_usage_usd.toFixed(2)} reported` : "nothing reported yet"}</span></header><div class="cost-list">${rows}</div><footer class="cost-honesty">${esc(snapshot.total.note)} \xB7 Updated ${new Date(snapshot.generated_at).toLocaleTimeString()}</footer></section>`;
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
  page.innerHTML = `${heading("Performance", "Measured work, not agent theatre.", "Run metrics use real AGIOS records; provider costs below are vendor-reported and never guessed.", periodControl())}
    ${costSurface()}
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
var surfaceSession = { surfaceId: null, term: null, fit: null, socket: null, resizeObserver: null };
function disposeSurfaceSession() {
  const session = surfaceSession;
  if (session.resizeObserver) {
    session.resizeObserver.disconnect();
    session.resizeObserver = null;
  }
  if (session.socket) {
    try {
      session.socket.close();
    } catch {
    }
    session.socket = null;
  }
  if (session.term) {
    try {
      session.term.dispose();
    } catch {
    }
    session.term = null;
    session.fit = null;
  }
  session.surfaceId = null;
}
function ensureSurfaceTerminal() {
  if (surfaceSession.term) return surfaceSession;
  const term = new import_xterm.Terminal({
    cursorBlink: true,
    convertEol: true,
    scrollback: 4e3,
    fontFamily: '"Cascadia Mono", Consolas, monospace',
    fontSize: 13,
    theme: {
      background: "#0a0f0d",
      foreground: "#d8e8e1",
      cursor: "#65e1ad",
      selectionBackground: "rgba(101, 225, 173, 0.28)"
    }
  });
  const fit = new o();
  term.loadAddon(fit);
  term.loadAddon(new L());
  surfaceSession.term = term;
  surfaceSession.fit = fit;
  return surfaceSession;
}
function connectSurfaceTerminal(container, surfaceId) {
  const session = ensureSurfaceTerminal();
  session.term.open(container);
  session.fit.fit();
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(`${protocol}//${location.host}/ws/shell/${encodeURIComponent(surfaceId)}`);
  session.socket = socket;
  session.surfaceId = surfaceId;
  const sendSize = () => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "resize", cols: session.term.cols, rows: session.term.rows }));
    }
  };
  session.term.onData((data) => {
    if (socket.readyState === WebSocket.OPEN) socket.send(data);
  });
  socket.onmessage = (event) => {
    if (typeof event.data === "string") {
      session.term.write(event.data);
    } else {
      session.term.write(new TextDecoder().decode(event.data));
    }
  };
  socket.onopen = sendSize;
  socket.onclose = () => {
    session.term.write("\r\n[session closed \u2014 reopen the tab to restart]\r\n");
  };
  const observer = new ResizeObserver(() => {
    try {
      session.fit.fit();
      sendSize();
    } catch {
    }
  });
  observer.observe(container);
  session.resizeObserver = observer;
  window.addEventListener("resize", sendSize);
  session._resizeHandler = sendSize;
  session.term.focus();
}
function surfaceStatusLabel(status2) {
  return {
    live: "Live",
    available: "Ready",
    unreachable: "Offline",
    missing: "Not installed",
    unknown: "Checking"
  }[status2] || status2;
}
async function refreshSurfaceProbes() {
  try {
    const payload = await api("/api/v1/surfaces");
    state.surfaceProbes = Object.fromEntries(
      (payload.items || []).map((item) => [item.id, item])
    );
  } catch {
    state.surfaceProbes = {};
  }
}
async function launchSurface(surfaceId) {
  try {
    await api(`/api/v1/surfaces/${encodeURIComponent(surfaceId)}/launch`, { method: "POST" });
    showToast("Launch requested");
    await refreshSurfaceProbes();
  } catch (error) {
    showToast(`Launch failed: ${error.message}`);
  }
  renderSurfaces();
}
function renderSurfaceContent(surface) {
  const probe = state.surfaceProbes[surface.id] || {};
  const statusValue = probe.status || "unknown";
  if (surface.kind === "web") {
    return `<div class="surface-frame-wrap"><iframe class="surface-frame" title="${esc(surface.name)}" src="${esc(surface.url)}" sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals"></iframe></div>`;
  }
  if (surface.kind === "terminal") {
    return `<div class="surface-terminal" data-surface-terminal="${esc(surface.id)}"><div class="surface-terminal-note"><strong>${statusValue === "available" ? "Live terminal attached" : "Terminal binary not found"}</strong><span>This is the real ${esc(surface.name)} process through a local PTY \u2014 same shell, same session.</span></div></div>`;
  }
  return `<div class="surface-native-card"><span class="surface-native-glyph">\u25B8</span><strong>${esc(surface.name)}</strong><p>Native application. AGIOS can launch it; its window opens outside the command center.</p><button class="surface-launch" data-surface-launch="${esc(surface.id)}">Launch ${esc(surface.name)}</button></div>`;
}
function renderSurfaces() {
  disposeSurfaceSession();
  const surfaces = state.surfaces;
  if (!surfaces.length) {
    page.innerHTML = `${heading("Live Apps", "Real applications, one window.", "Registered runtime surfaces appear here once the AGIOS registry declares them.")}<div class="empty-stage"><div class="seal">\u25C7</div><h2>No surfaces registered</h2><p>Add web, terminal, or native surfaces to configs/agios.json and restart AGIOS.</p></div>`;
    return;
  }
  const active = state.activeSurface && surfaces.some((surface) => surface.id === state.activeSurface) ? state.activeSurface : surfaces[0].id;
  state.activeSurface = active;
  const activeSurface = surfaces.find((surface) => surface.id === active);
  const tabs = surfaces.map((surface) => {
    const probe2 = state.surfaceProbes[surface.id] || {};
    return `<button class="surface-tab ${surface.id === active ? "is-active" : ""}" data-surface-tab="${esc(surface.id)}"><span class="surface-tab-glyph">${surface.kind === "web" ? "\u25A3" : surface.kind === "terminal" ? ">_" : "\u25B8"}</span>${esc(surface.name)}<i class="surface-tab-status is-${esc(probe2.status || "unknown")}"></i></button>`;
  }).join("");
  const probe = state.surfaceProbes[active] || {};
  const actions = activeSurface.kind === "terminal" ? `<button class="surface-launch compact" data-surface-restart="${esc(active)}">Reconnect</button>` : `<button class="surface-launch compact" data-surface-open="${esc(active)}">Open in browser \u2197</button>${activeSurface.launch ? `<button class="surface-launch compact" data-surface-launch="${esc(active)}">Start ${esc(activeSurface.name)}</button>` : ""}`;
  page.innerHTML = `${heading("Live Apps", "The real application inside the OS.", "Web surfaces embed the actual local panel; terminal surfaces attach a live PTY to the real CLI \u2014 the same window, same session, same shell as the original tool.", actions)}<nav class="surface-tabs" aria-label="Runtime surfaces">${tabs}</nav><div class="surface-stage">${renderSurfaceContent(activeSurface)}</div><footer class="surface-footer"><span>${esc(surfaceStatusLabel(probe.status || "unknown"))}</span><span>Loopback only \xB7 registry-declared \xB7 never a sandbox imitation</span></footer>`;
  if (activeSurface.kind === "terminal") {
    const container = page.querySelector("[data-surface-terminal]");
    if (container) {
      container.classList.add("is-live");
      window.setTimeout(() => connectSurfaceTerminal(container, activeSurface.id), 0);
    }
  }
}
function hermesWebSurface() {
  return `<div class="surface-frame-wrap"><iframe class="surface-frame" title="Hermes" src="http://127.0.0.1:9119" sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals"></iframe></div><footer class="surface-footer"><span>Embedded in AGIOS</span><span>Hermes dashboard \xB7 loopback</span></footer>`;
}
function terminalSurfaceForSystem(systemId) {
  const map = { hermes: "hermes-cli", codex: "codex-cli", opencode: "opencode-cli" };
  const surfaceId = map[systemId];
  if (!surfaceId) return null;
  return state.surfaces.find((surface) => surface.id === surfaceId) || null;
}
function systemTerminalSurface(surface) {
  const probe = state.surfaceProbes[surface.id] || {};
  const statusValue = probe.status || "unknown";
  return `<section class="surface-stage system-terminal-stage">${renderSurfaceContent(surface)}</section><footer class="surface-footer"><span>${esc(surfaceStatusLabel(statusValue))}</span><span>Real ${esc(surface.name)} process \xB7 local PTY \xB7 loopback only</span></footer>`;
}
var renderers = { command: renderCommand, portfolio: renderPortfolio, departments: renderDepartments, agents: renderAgents, agent: renderAgent, mesh: renderMesh, systems: renderSystems, system: renderSystem, memory: renderSharedMemory, skills: renderSharedSkills, repositories: renderRepositories, work: renderWork, artifacts: renderArtifacts, paperclip: renderPaperclip, approvals: renderApprovals, automations: renderAutomations, integrations: renderIntegrations, network: renderAgentNetwork, performance: renderPerformance, settings: renderSettings, surfaces: renderSurfaces };
function setView(view) {
  if (!state.data || !viewLabels[view]) return;
  state.view = view;
  viewName.textContent = viewLabels[view];
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("is-active", item.dataset.view === view));
  if (view !== "surfaces" && view !== "system") disposeSurfaceSession();
  if (view === "performance" && !state.costs) void loadCosts().then(() => state.view === "performance" && renderPerformance());
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
  const surfaceTab = event.target.closest("[data-surface-tab]");
  const surfaceLaunch = event.target.closest("[data-surface-launch]");
  const surfaceRestart = event.target.closest("[data-surface-restart]");
  const surfaceOpen = event.target.closest("[data-surface-open]");
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
    const sid = system.dataset.system;
    state.systemMode = terminalSurfaceForSystem(sid) ? "terminal" : "overview";
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
  const gauntletLaunch = event.target.closest("[data-gauntlet-run]");
  if (gauntletLaunch) void launchGauntlet(gauntletLaunch);
  if (routedAction) routeSystemAction(routedAction);
  if (osMapLayer) {
    state.osMapLayer = osMapLayer.dataset.osMapLayer;
    renderCommand();
  }
  if (surfaceTab) {
    state.activeSurface = surfaceTab.dataset.surfaceTab;
    renderSurfaces();
  }
  if (surfaceLaunch) void launchSurface(surfaceLaunch.dataset.surfaceLaunch);
  if (surfaceRestart) renderSurfaces();
  if (surfaceOpen) {
    const openSurface = state.surfaces.find((surface) => surface.id === surfaceOpen.dataset.surfaceOpen);
    if (openSurface && openSurface.url) window.open(openSurface.url, "_blank", "noopener");
  }
  const dreamingAccept = event.target.closest("[data-dreaming-accept]");
  const dreamingDismiss = event.target.closest("[data-dreaming-dismiss]");
  if (dreamingAccept) void acceptDreaming(dreamingAccept);
  if (dreamingDismiss) void dismissDreaming(dreamingDismiss);
  const memoryFolder = event.target.closest("[data-memory-folder]");
  const memoryNote = event.target.closest("[data-memory-note]");
  if (memoryFolder) {
    state.memoryFolder = memoryFolder.dataset.memoryFolder;
    state.memoryNote = null;
    renderSharedMemory();
  }
  if (memoryNote) {
    state.memoryNote = memoryNote.dataset.memoryNote;
    renderSharedMemory();
  }
  const memoryToggle = event.target.closest("[data-memory-toggle]");
  if (memoryToggle) {
    if (memoryToggle.dataset.memoryToggle === "compose") state.memoryComposeOpen = !state.memoryComposeOpen;
    if (memoryToggle.dataset.memoryToggle === "search") state.memorySearchOpen = !state.memorySearchOpen;
    renderSharedMemory();
  }
  const learnForm = event.target.closest("[data-learn-form]");
  if (learnForm) void submitLearnForm(learnForm);
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
  if (!document.activeElement?.closest?.("[data-chief-form], [data-run-form], [data-workspace-form], [data-skill-draft-form], [data-memory-form], [data-retrieval-form], [data-a2a-form]") && state.runs.some((run) => ["queued", "running"].includes(run.status))) {
    void loadOperationalSurface();
    void loadDreaming();
  }
}, 1600);
async function loadLearning() {
  try {
    state.learned = await api("/api/v1/learn");
  } catch {
    state.learned = { summary: { documents: 0, indexed_chunks: 0 }, documents: [] };
  }
}
async function submitLearnForm(form) {
  const values = new FormData(form);
  const payload = {
    title: values.get("title"),
    source_name: values.get("sourceName") || "pasted",
    text: values.get("text")
  };
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    const result = await api("/api/v1/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    showToast(`Brain file built \xB7 ${result.doc.index.chunk_count} chunks indexed`);
    await loadLearning();
    if (state.view === "skills") renderSharedSkills();
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
  }
}
async function launchGauntlet(button) {
  const runId = button.dataset.gauntletRun;
  button.disabled = true;
  try {
    const result = await api(`/api/v1/gauntlet/${encodeURIComponent(runId)}`, { method: "POST" });
    showToast(`Gauntlet created \xB7 three critics (brief, system, craft) await your approval`);
    await loadOperationalSurface();
    button.disabled = false;
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}
async function loadDreaming() {
  try {
    state.dreaming = await api("/api/v1/dreaming");
  } catch {
    state.dreaming = null;
  }
  if (state.view === "command") renderCommand();
}
async function acceptDreaming(button) {
  const id2 = button.dataset.dreamingAccept;
  const target = button.dataset.dreamingTarget;
  button.disabled = true;
  try {
    await api(`/api/v1/dreaming/${encodeURIComponent(id2)}/accept`, { method: "POST" });
    showToast(target ? `Accepted \xB7 opening ${viewLabels[target] || target}` : "Recommendation accepted");
    await loadDreaming();
    if (state.view === "command") renderCommand();
    if (target && viewLabels[target]) setView(target);
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}
async function dismissDreaming(button) {
  const id2 = button.dataset.dreamingDismiss;
  button.disabled = true;
  try {
    await api(`/api/v1/dreaming/${encodeURIComponent(id2)}/dismiss`, { method: "POST" });
    await loadDreaming();
    if (state.view === "command") renderCommand();
  } catch (error) {
    showToast(error.message);
    button.disabled = false;
  }
}
async function boot() {
  try {
    const response = await fetch("/api/v1/command-center", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("unavailable");
    state.data = await response.json();
    state.runtimeAdapters = state.data.operational?.runtime_adapters || [];
    try {
      const surfacesPayload = await api("/api/v1/surfaces");
      state.surfaces = surfacesPayload.items || [];
    } catch {
      state.surfaces = [];
    }
    await refreshSurfaceProbes();
    try {
      state.voice = await api("/api/v1/voice/capabilities");
    } catch {
      state.voice = { status: "unavailable", input: { enabled: false }, output: { enabled: false } };
    }
    await loadDreaming();
    await loadLearning();
    void loadCosts();
    document.querySelector("#approval-count").textContent = state.data.summary.pending_approvals;
    const runtime = state.data.runtime;
    document.querySelector("#runtime-caption").textContent = runtime.gateway_running ? `${state.data.summary.available_agents} agents registered \xB7 gateway online` : `${state.data.summary.available_agents} agents registered \xB7 gateway standing by`;
    document.querySelector("#runtime-meter").style.width = `${Math.max(12, state.data.summary.available_agents / state.data.summary.agents * 100)}%`;
    const bannerDetail = document.querySelector("#ops-banner-detail");
    if (bannerDetail) bannerDetail.textContent = `${state.data.summary.agents} workers \xB7 ${state.data.operational?.shared_memory?.fact_count ?? 0} shared memories \xB7 ${state.data.summary.systems} AI systems`;
    const route = location.pathname.slice(1);
    setView(viewLabels[route] ? route : "command");
  } catch {
    page.innerHTML = `<div class="error-state"><p class="eyebrow">Local control plane</p><h1>AGIOS could not connect</h1><p>The interface is intact, but the local command service is unavailable. Restart AGIOS and this screen will reconnect without exposing runtime details.</p></div>`;
    document.querySelector("#runtime-caption").textContent = "Control plane unavailable";
  }
}
boot();
