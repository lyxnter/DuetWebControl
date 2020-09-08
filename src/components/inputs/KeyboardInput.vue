<style scoped>
* {
  margin: 0;
  padding: 0;
}
body {
  font: 71%/1.5 Verdana, Sans-Serif;
  background: #eee;
}
#container {
  position: fixed;
  background: #414141;
  border-radius: 15px;
  bottom: 0;
  margin: 1% 1%;
  padding: 10px 15px;
  width: 650px;
}
#write {
  margin: 0 0 5px;
  padding: 5px;
  width: 671px;
  height: 200px;
  font: 1em/1.5 Verdana, Sans-Serif;
  background: #fff;
  border: 1px solid #f9f9f9;
  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
}
#keyboard {
  margin: 0;
  padding: 0;
  list-style: none;
}
#keyboard li {
  float: left;
  margin: 0 2px 5px 0;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background: #303030;
  border: 1px solid #f9f9f9;
  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
  transition: all 0.125s
}
.capslock, .tab, .left-shift {
  clear: left;
}
#keyboard .delete {
  width: 70px;
}
#keyboard .tab {
  width: 50px;
}
#keyboard .capslock {
  width: 70px;
}
#keyboard .return {
  width: 60px;
  border: none;
  background: none;
}
#keyboard .left-shift {
  width: 65px;
}
#keyboard .right-shift {
  width: 85px;
}
#keyboard .alt, #keyboard .ctrl, #keyboard .alt-ctrl {
  width: 77px;
}
.lastitem {
  margin-right: 0;
}
.uppercase {
  text-transform: uppercase;
}

.letter:not(.visible) .alt-key {
  display: none;
}

.letter.visible :not(.alt-key) {
  display: none;
}

.symbol:not(.visible) .alt-key {
  display: none !important;
}

.symbol.visible :not(.alt-key) {
  display: none !important;
}

.active {
  background: gray !important;
}

#keyboard .space {
  width: 300px;
}
.on {
  display: none;
}
#keyboard li:hover {
  position: relative;
  top: 1px;
  left: 1px;
  border-color: #e5e5e5;
  cursor: pointer;
}
</style>
<template>
  <div id="container">
    <!--textarea id="write" rows="6" cols="60"></textarea-->
    <ul id="keyboard">
      <li class="symbol"><span class="off">²</span><span class="on"> </span></li>
      <li class="symbol"><span class="off">&</span><span class="on">1</span></li>
      <li class="symbol"><span class="off">é</span><span class="on">2</span><span class="alt-key">~</span></li>
      <li class="symbol"><span class="off">"</span><span class="on">3</span><span class="alt-key">#</span></li>
      <li class="symbol"><span class="off">'</span><span class="on">4</span><span class="alt-key">{</span></li>
        <li class="symbol"><span class="off">(</span><span class="on">5</span><span class="alt-key">[</span></li>
        <li class="symbol"><span class="off">-</span><span class="on">6</span><span class="alt-key">|</span></li>
        <li class="symbol"><span class="off">è</span><span class="on">7</span><span class="alt-key">`</span></li>
        <li class="symbol"><span class="off">_</span><span class="on">8</span><span class="alt-key">\</span></li>
        <li class="symbol"><span class="off">ç</span><span class="on">9</span><span class="alt-key">^</span></li>
        <li class="symbol"><span class="off">à</span><span class="on">0</span><span class="alt-key">@</span></li>
        <li class="symbol"><span class="off">)</span><span class="on">°</span><span class="alt-key">]</span></li>
        <li class="symbol"><span class="off">=</span><span class="on">+</span><span class="alt-key">}</span></li>
        <li class="delete lastitem">Retour<!--span class="material-icons" style="margin-top: 8px">keyboard_backspace</span--></li>
        <li class="tab">Tab<!--span class="material-icons" style="margin-top: 8px">keyboard_tab</span--></li>
        <li class="letter">a</li>
        <li class="letter">z</li>
        <li class="letter">e</li>
        <li class="letter">r</li>
        <li class="letter">t</li>
        <li class="letter">y</li>
        <li class="letter">u</li>
        <li class="letter">i</li>
        <li class="letter">o</li>
        <li class="letter">p</li>
        <li class="symbol"><span class="off">^</span><span class="on">¨</span></li>
        <li class="symbol"><span class="off">$</span><span class="on">£</span><span class="alt-key">¤</span></li>
        <li class="return lastitem">Entrée
          <span class="material-icons" style="margin-top: 10px; margin-left:15px">keyboard_return</span >
            <svg height="85" width="60" style="margin-top: -40px;margin-left: -50px;position: absolute; z-index: -1">
              <path d="M 5 1 H 55 Q 59 1 59 5 V 79 Q 59 84 55 84 H 25 Q 20 84 20 80 V 45 Q 20 40 15 40 H 5 Q 1 40 1 35 V 5 Q 0 0 5 1" stroke="white" stroke-width="1" fill="#303030"></path>
            </svg></li>
            <!--li class="symbol "><span class="off">\</span><span class="on">|</span></li-->
            <li class="capslock">Verr Maj<!--span class="material-icons" style="margin-top: 8px">lock</span--></li>
            <li class="letter">q</li>
            <li class="letter">s</li>
            <li class="letter">d</li>
            <li class="letter">f</li>
            <li class="letter">g</li>
            <li class="letter">h</li>
            <li class="letter">j</li>
            <li class="letter">k</li>
            <li class="letter">l</li>
            <li class="letter">m</li>
            <li class="symbol"><span class="off">ù</span><span class="on">%</span></li>
            <li class="symbol lastitem"><span class="off">*</span><span class="on">µ</span></li>
            <li class="left-shift">Maj<!--span class="material-icons" style="margin-top: 8px">arrow_upward</span--></li>
            <li class="symbol"><span class="off">&lt;</span><span class="on">&gt;</span></li>
            <li class="letter">w</li>
            <li class="letter">x</li>
            <li class="letter">c</li>
            <li class="letter">v</li>
            <li class="letter">b</li>
            <li class="letter">n</li>
            <li class="symbol"><span class="off">,</span><span class="on">?</span></li>
            <li class="symbol"><span class="off">;</span><span class="on">.</span></li>
            <li class="symbol"><span class="off">:</span><span class="on">/</span></li>
            <li class="symbol"><span class="off">!</span><span class="on">§</span></li>
            <li class="right-shift lastitem">Maj<!--span class="material-icons" style="margin-top: 8px">arrow_upward</span--></li>
            <li class="ctrl">Ctrl</li>
            <li class="alt">Alt</li>
            <li class="space">&nbsp;</li>
            <li class="alt-ctrl">Alt Gr</li>
            <li class="ctrl lastitem">Ctrl</li>
          </ul>
        </div>
      </template>
      <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
      <script>
      'use strict'

      import { mapActions } from 'vuex'
      let $ = require('jquery');

      export default {
        props: {
          target: {
            type: HTMLElement,
            required: true,
            default: undefined
          },
          emitEvent: {
            type: Boolean,
            required: false,
            default: false,
          },
          doSendCode: {
            type: Boolean,
            required: false,
            default: false,
          }
        },
        data() {
          return {
            $write: undefined,
            shift: false,
            capslock: false,
            altgr: false,
          }
        },
        methods: {
          ...mapActions('machine', ['sendCode']),
        },
        mounted() {
          this.$write = $(this.target);
          //console.log(this.$write)
          let keyIn = this;
          $('#keyboard li').click(function(){
            //console.log(keyIn.$write);
            this.style.background = "gray";
            setTimeout(function(that){
              that.style.background = "";
            }, 125, this);
            var $this = $(this),
            character = $this.html(); // If it's a lowercase letter, nothing happens to this variable
            // Shift keys
            if ($this.hasClass('left-shift') || $this.hasClass('right-shift')) {
              $('.letter').toggleClass('uppercase');
              $('.symbol span').toggle();
              $('.right-this.shift').toggleClass('active');
              $('.left-this.shift').toggleClass('active');

              this.shift = (this.shift === true) ? false : true;
              this.capslock = false;
              return false;
            }

            // Caps lock
            if ($this.hasClass('capslock')) {
              $('.letter').toggleClass('uppercase');
              $('.capslock').toggleClass('active');
              $('.symbol span').toggle();
              this.capslock = true;
              return false;
            }

            // Alt Gr
            if ($this.hasClass('alt-ctrl') || $this.hasClass('alt') || $this.hasClass('ctrl')) {
              /*$('.letter').toggleClass('visible');
              $('.symbol ').toggleClass('visible');
              $('.alt-ctrl').toggleClass('active');
              this.altgr = true;*/
              return false;
            }

            // Delete
            if ($this.hasClass('delete')) {
              var html = keyIn.$write[0].value;

              keyIn.$write[0].value = (html.substr(0, html.length - 1));
              return false;
            }

            // Special characters
            if ($this.hasClass('symbol')) character = $('span:visible', $this).html();
            if ($this.hasClass('space')) character = ' ';
            if ($this.hasClass('tab')) character = "\t";
            if ($this.hasClass('return')){
              if(keyIn.doSendCode)
              keyIn.sendCode(keyIn.$write[0].value);
              if(keyIn.emitEvent)
              keyIn.$emit('change', keyIn.$write[0].value);
              character = "\n";
            }

            // Uppercase letter
            if ($this.hasClass('uppercase')) character = character.toUpperCase();

            // Remove this.shift once a key is clicked.
            if (this.shift === true) {
              $('.symbol span').toggle();
              if (this.capslock === false){
                $('.letter').toggleClass('uppercase');
                $('.right-this.shift').toggleClass('active');
                $('.left-this.shift').toggleClass('active');
              }
              this.shift = false;
            }

            if (this.altgr === true) {
              $('.letter').toggleClass('visible');
              $('.symbol ').toggleClass('visible');
              $('.alt-ctrl').toggleClass('active');
              this.altgr = false;
            }

            // Add the character
            keyIn.$write[0].value = (keyIn.$write[0].value + character);
          });
          //console.log('keyboard initialized')
        },
        watch: {
          target() {
            this.$write = $(this.target);
            //console.log(this.$write)
          }
        }
      }
      </script>
