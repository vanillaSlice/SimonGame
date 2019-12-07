parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"g2Hq":[function(require,module,exports) {
function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function n(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}var o,i,u,r,c,a,s={green:document.querySelector(".js-green-btn"),red:document.querySelector(".js-red-btn"),yellow:document.querySelector(".js-yellow-btn"),blue:document.querySelector(".js-blue-btn")},l=document.querySelector(".js-screen"),f=document.querySelector(".js-screen-text"),d=document.querySelector(".js-start-btn"),h=document.querySelector(".js-strict-btn"),v=document.querySelector(".js-strict-light"),m=document.querySelector(".js-power-btn"),y=["green","red","yellow","blue"],p={1:1e3,5:850,9:700,13:550},g={1:5e3,5:4e3,9:3e3,13:2e3},w=300,b={newGame:4,error:6,win:8},q=20,L=!1,T=!1,x=!0,E=[],j=[];function C(){if(!a){var e=new(window.AudioContext||window.webkitAudioContext);a={green:new S({audioContext:e,frequency:164.81}),red:new S({audioContext:e,frequency:220}),yellow:new S({audioContext:e,frequency:277.18}),blue:new S({audioContext:e,frequency:329.63}),error:new S({audioContext:e,frequency:110,wave:"triangle"}),win:new S({audioContext:e,frequency:440})}}}var S=function(){function t(n){var o=n.audioContext,i=n.frequency,u=n.wave,r=void 0===u?"sine":u;e(this,t),this.audioContext=o;var c=this.audioContext.createOscillator();c.frequency.setValueAtTime(i,0),c.type=r,c.start();var a=this.audioContext.createGain();a.gain.setValueAtTime(0,0),c.connect(a),a.connect(this.audioContext.destination),this.gain=a.gain,this.play=this.play.bind(this),this.stop=this.stop.bind(this)}return n(t,[{key:"play",value:function(){this.gain.setTargetAtTime(1,this.audioContext.currentTime,.01)}},{key:"stop",value:function(){this.gain.setTargetAtTime(0,this.audioContext.currentTime,.01)}}]),t}();function k(){m.checked?O():G()}function O(){L=!0,C(),A(!0)}function A(e){l.classList.toggle("lit",e)}function G(){L=!1,P(),M("--"),A(!1),V(),z(),B()}function P(){D(),I()}function D(){E.forEach(function(e){return clearInterval(e)}),E=[]}function I(){j.forEach(function(e){return clearTimeout(e)}),j=[]}function M(e){f.innerText=e}function V(){T=!1,v.classList.remove("lit")}function z(){x=!0,Object.values(s).forEach(function(e){return e.classList.remove("clickable","lit")})}function B(){Object.values(a).forEach(function(e){return e.stop()})}function F(){if(L){var e=b.newGame,t=(e+1)*w;P(),M("--"),A(!0),z(),B(),H(e),J(),N(t)}}function H(e){j.push(setTimeout(function(){e>0&&(A(),H(e-1))},w))}function J(){o=[K()]}function K(){return y[Math.floor(Math.random()*y.length)]}function N(e){var t=0;i=0,r=p[o.length]||r,c=g[o.length]||c,j.push(setTimeout(function(){M(Q()),E.push(setInterval(function(){t<o.length?(R(t),t+=1):X()},r))},e))}function Q(){return o.length<10?"0".concat(o.length):o.length}function R(e){var t=o[e],n=s[t],i=a[t],u=r/2;U(n,i),W(n,i,u)}function U(e,t){e.classList.add("lit"),t.play()}function W(e,t,n){j.push(setTimeout(function(){e.classList.remove("lit"),t.stop()},n))}function X(){P(),Y(),Z()}function Y(){x=!1,Object.values(s).forEach(function(e){return e.classList.add("clickable")})}function Z(){j.push(setTimeout($,c))}function $(){var e=b.error,t=w*(e+1);P(),z(),B(),_(a.error,t),M("!!"),H(e),ee(t)}function _(e,t){e.play(),j.push(setTimeout(e.stop,t))}function ee(e){j.push(setTimeout(T?F:N,e))}function te(){L&&(T=!T,v.classList.toggle("lit",T))}function ne(e){if(e.preventDefault(),e.stopPropagation(),!x&&L){var t=e.target,n=t.dataset.colour;t.classList.add("lit"),a[n].play(),n===o[i]?(u=n,P()):$()}else u=!1}function oe(e){e.preventDefault(),e.stopPropagation(),!x&&L&&(ie(),B(),u&&((i+=1)===q?ue():i===o.length&&ce(),u=!1))}function ie(){Object.values(s).forEach(function(e){return e.classList.remove("lit")})}function ue(){var e=w*(b.win+1);z(),_(a.win,e),M("**"),H(b.win),re(e)}function re(e){j.push(setTimeout(F,e))}function ce(){i=0,o.push(K()),z(),N()}m.addEventListener("change",k),d.addEventListener("click",F),h.addEventListener("click",te),Object.values(s).forEach(function(e){e.addEventListener("mousedown",ne),e.addEventListener("mouseup",oe),e.addEventListener("mouseleave",oe),e.addEventListener("dragleave",oe),e.addEventListener("touchstart",ne),e.addEventListener("touchend",oe)});
},{}]},{},["g2Hq"], null)
//# sourceMappingURL=scripts.8e0d5a77.js.map