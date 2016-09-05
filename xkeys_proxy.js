/*
 *   node-xkeys is a helper library that is designed to make using a PI Engineering XKeys
 *   controller easy in Node.js applications.
 *
 *   Copyright (C) 2014 Rick Russell
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 2 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this program; if not, write to the Free Software Foundation, Inc.,
 *   51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

var xkeys = require('node-xkeys');
var sleep = require('sleep');
var _ = require('underscore');
var events = require('events');
var handler = new events.EventEmitter();

xkeys.openFirst(xkeys.XK_60);


var device = xkeys.getDevice();
var lastkeys=[];
var lastShiftedCount = 0;
var realKeys  = [{
	bit: 73,
	type:'1pgm',
	class: 'pgm',
	index: 1
},{
	bit: 65,
	type:'2pgm',
	class: 'pgm',
	index: 2
},{
	bit: 57,
	type: '3pgm',
	class: 'pgm',
	index: 3
},{
	bit: 49,
	type: '4pgm',
	class: 'pgm',
	index: 4
},{
	bit: 41,
	type: '5pgm',
	class: 'pgm',
	index: 5
},{
	bit: 33,
	type: '6pgm',
	class: 'pgm',
	index: 6
},{
	bit: 25,
	type: '7pgm',
	class: 'pgm',
	index: 7
},{
	bit: 17,
	type: '8pgm',
	class: 'pgm',
	index: 8
},{
	blink: 73,
	type:'9pgm',
	class: 'pgm',
	index: 9
},{
	blink: 65,
	type:'10pgm',
	class: 'pgm',
	index: 10
},{
	blink: 57,
	type: '11pgm',
	class: 'pgm',
	index: 11
},{
	blink: 49,
	type: '12pgm',
	class: 'pgm',
	index: 12
},{
	blink: 41,
	type: '13pgm',
	class: 'pgm',
	index: 13
},{
	blink: 33,
	type: '14pgm',
	class: 'pgm',
	index: 14
},{
	blink: 25,
	type: '15pgm',
	class: 'pgm',
	index: 15
},{
	blink: 17,
	type: '16pgm',
	class: 'pgm',
	index: 16
},{
	bit: 72,
	type: '1prv',
	class: 'prv',
	index: 1
},{
	bit: 64,
	type: '2prv',
	class: 'prv',
	index: 2
},{
	bit: 56,
	type: '3prv',
	class: 'prv',
	index: 3
},{
	bit: 48,
	type: '4prv',
	class: 'prv',
	index: 4
},{
	bit: 40,
	type: '5prv',
	class: 'prv',
	index: 5
},{
	bit: 32,
	type: '6prv',
	class: 'prv',
	index: 6
},{
	bit: 24,
	type: '7prv',
	class: 'prv',
	index: 7
},{
	bit: 16,
	type: '8prv',
	class: 'prv',
	index: 8
},{
	blink: 72,
	type: '9prv',
	class: 'prv',
	index: 9
},{
	blink: 64,
	type: '10prv',
	class: 'prv',
	index: 10
},{
	blink: 56,
	type: '11prv',
	class: 'prv',
	index: 11
},{
	blink: 48,
	type: '12prv',
	class: 'prv',
	index: 12
},{
	blink: 40,
	type: '13prv',
	class: 'prv',
	index: 13
},{
	blink: 32,
	type: '14prv',
	class: 'prv',
	index: 14
},{
	blink: 24,
	type: '15prv',
	class: 'prv',
	index: 15
},{
	blink: 16,
	type: '16prv',
	class: 'prv',
	index: 16
},{
	bit: 0,
	type:'cut'
},{
	bit: 1,
	type:'auto',
},{
	bit: null,
	type:'all release'
},{
	bit: 3,
	type: 'shiftSource'
},{
	bit: 4,
	type:'me2',
	class: 'me',
	index: 1
},{
	bit: 12,
	type:'me1',
	class: 'me',
	index: 0
},{
	bit:15,
	type:'aux1',
	class: 'aux',
	index: 0
},{
	bit:14,
	type:'aux2',
	class: 'aux',
	index: 1
},{
	bit:13,
	type:'aux3',
	class: 'aux',
	index: 2
},{
	bit:7,
	type:'aux4',
	class: 'aux',
	index: 3
},{
	bit:6,
	type:'aux5',
	class: 'aux',
	index: 4
},{
	bit:5,
	type:'aux6',
	class: 'aux',
	index: 5
},{
	bit: 43,
	type: 'key1',
	class: 'key',
	index: 0
},{
	bit: 35,
	type: 'key2',
	class: 'key',
	index: 1
},{
	bit: 51,
	type: 'bkgnd',
	class: 'bkgnd',
	index: 0
},{
	bit: 44,
	type: 'keyOn1',
	class: 'keyOn',
	index: 0
},{
	bit: 36,
	type: 'keyOn2',
	class: 'keyOn',
	index: 1
},{
	bit:76,
	type: 'dskCut1',
	class: 'dskCut',
	index: 0
},{
	bit:68,
	type: 'dskCut2',
	class: 'dskCut',
	index: 1
},{
	bit:75,
	type: 'dskAuto1',
	class: 'dskAuto',
	index: 0
},{
	bit:67,
	type: 'dskAuto2',
	class: 'dskAuto',
	index: 1
},{
	bit:77,
	type: 'dskTie1',
	class: 'dskTie',
	index: 0
},{
	bit:69,
	type: 'dskTie2',
	class: 'dskTie',
	index: 1
},{
	bit:55,
	type: 'MIX/DIP',
	class: 'transition',
	index: 0,
	state_0: 'DIP',
	state_0_val: 0,
	state_1: 'DIP',
	state_1_val: 1,
	state: 0
},{
	bit:47,
	type: 'WIPE/STING',
	class: 'transition',
	index: 1,
	state_0: 'WIPE',
	state_0_val: 2,
	state_1: 'DVE',
	state_1_val: 3,
	state: 0
},{
	bit:39,
	type: 'STINGER',
	class: 'transition',
	index: 2,
	state_0: 'STINGER',
	state_0_val: 4,
	state_1: 'DVE',
	state_1_val: 5,
	state: 0
},{
	bit: 79,
	type: 'player1_prev',
	class: 'player',
	index: 0,
	action: 'prev'
},{
	bit: 71,
	type: 'player1_next',
	class: 'player',
	index: 0,
	action: 'next'
},{
	bit: 78,
	type: 'player1_prev',
	class: 'player',
	index: 1,
	action: 'prev'
},{
	bit: 70,
	type: 'player1_next',
	class: 'player',
	index: 1,
	action: 'next'
}];


realKeys.forEach(function(realKey){

	if (realKey.bit !== null){
		realKey.onPressed = function(){
			// xkeys.setBlueBackLight(this.bit, true, false);
			handler.emit('onPressed', this);
		};
		realKey.onUnpressed = function(){
			// xkeys.setBlueBackLight(this.bit, false, false);
			handler.emit('onUnpressed', this);
		};
	}
});

module.exports = new events.EventEmitter();


setRedBackLight = function(_class, index, val){
	var key = realKeys.find(function(k){return k.class == _class && k.index == index});

		if (key)
			var canBlinkedKey = realKeys.find(
				function(k){
					if (typeof(k.blink)!='undefined') {
						return k.blink == key.bit;
					} else {
						return false;
					}
				});

		if (typeof(key) != 'undefined' && typeof(key.blink) == 'undefined')
			if (!val && canBlinkedKey && canBlinkedKey.isBlinked){
				// console.log('ALREADY BLINKED', canBlinkedKey, key);
			}
			else{
				xkeys.setRedBackLight(key.bit, val, false);
			}

		if (typeof(key) != 'undefined' && typeof(key.blink) != 'undefined'){
				key.isBlinked = val;
			  if (!val && !canBlinkedKey) return;
				xkeys.setRedBackLight(key.blink, val, true);
		}
};


setBlueBackLight = function(cl, index, val){

	var key = realKeys.find(function(k){return k.class == cl && k.index == index});
	if (key)
		var canBlinkedKey = realKeys.find(
			function(k){
				if (typeof(k.blink)!='undefined') {
					return k.blink == key.bit;
				} else {
					return false;
				}
			});

		if (typeof(key) != 'undefined' && typeof(key.blink) == 'undefined')
			if (!val && canBlinkedKey && canBlinkedKey.isBlinked){
				// console.log('ALREADY BLINKED', canBlinkedKey, key);
			}
			else{
				xkeys.setBlueBackLight(key.bit, val, false);
			}

		if (typeof(key) != 'undefined' && typeof(key.blink) != 'undefined'){
				key.isBlinked = val;
			  if (!val && !canBlinkedKey) return;
				xkeys.setBlueBackLight(key.blink, val, true);
		}
};

// setBlueBackLightBlink = function(cl, index, val){
// 	var key = realKeys.find(function(k){return k.class == cl && k.index == index});
// 	// if (val)
// 	// 	key.timer = setInterval(function(){
// 	// 		console.log("BLINK: ", key, cl, index);
// 	// 		xkeys.setBlueBackLight(key.bit, val, false);
// 	//
// 	// 	},1000)
// 	// else
// 	// 	clearInterval(key.timer)
//
//
// 	// if (typeof(key) != 'undefined')
// 	// 	xkeys.setBlueBackLight(key.bit, val, false);
// };

module.exports.setRedBackLight = setRedBackLight;
module.exports.setBlueBackLight = setBlueBackLight;
// module.exports.setBlueBackLightBlink = setBlueBackLightBlink;

module.exports.realKeys = function(){return realKeys;}
// module.exports = {
// 	onPressed: handler.on('shifted'),
// 	onUnpressed: handler.on('onUnpressed'),
// 	shifted: handler.on('shifted')
// };

handler.on('shifted', function(keys){
	// console.log('shifted:', keys);
	module.exports.emit('shifted', keys);
});
handler.on('onPressed', function(key){
	// console.log('shifted PRESSED:', key);
	module.exports.emit('pressed', key);
});
handler.on('onUnpressed', function(key){
	//console.log('shifted UNPRESSED:', key);
	module.exports.emit('unpressed', key);
});

device.on("data", function(data) {
	var containsFlag = function(number, flag) {
  	return (number & flag) === flag ? 1 : 0;
	};
	function testBuffers (inp1, inp2){
		var match = true;
		var inp1_arr = inp1.toString('hex').match(/.{1,2}/g);
		var inp2_arr = inp2.toString('hex').match(/.{1,2}/g);

		if (parseInt(inp2.toString('hex')) === 0){
			// console.log('INP1: ', inp1.toString('hex'), 'INP2: ', inp2.toString('hex'), 'MATCH: ');
			if (parseInt(inp1.toString('hex')) === 0)
				return true;
			else
				return false;
		} else {
			inp1_arr.forEach(function(inp1_test, i){
				test1 = parseInt(inp1_test,16);
				test2 = parseInt(inp2_arr[i],16);
				if (containsFlag(test1, test2)){
				} else{
					match = false;
				}

			});
			return match;
		}
	}


	//
	function getBits(buf){
		var bits = [];
		for (var i=0;i<buf.length;i++){
				for (var ii=0; ii<8; ii++){
						var val = (buf[i]>>>(ii) & 0x1);
						var offset = -8;
						if (val === 1){
							var bit = (i*8+ii+offset);
							// console.log('BIN['+bit+']: '+(buf[i]>>>(7-ii) & 0x1).toString(2));
							bits.push(bit);
						}
				}
		}

		keys = realKeys.filter(function(key){return bits.indexOf(key.bit)>-1})


		if (lastShiftedCount > keys.length){
			// console.log('unshifted', keys.length)
		}
		else{
				handler.emit('shifted', keys);
		}
		lastShiftedCount = keys.length;
		return bits;
	}

	var readKey = function(buf,cb){
		var bits = getBits(buf);
		console.log('CODE:', bits);
		var keyArr = [];
		realKeys.forEach(function(key){
			if (bits.length == 0 && key.bit === null){
				//key.call();
			}
			bits.forEach(function(bit){
				if (key.bit === bit){
					if (typeof(key.call) == 'function')
						key.call();
					keyArr.push(key);
				}
			});
		});
		cb(keyArr);
	};

	const buf2 = data.slice(1, 12);
	// console.log('HEX: '+buf2.toString('hex'));



	readKey(buf2, function(keys){
		// console.log(keys);


		var lastkeysBit = lastkeys.map(function(key){ return key.bit;});
		var keysBit = keys.map(function(key){ return key.bit;});

		if (lastkeys.length > keys.length){
			var diff =_.difference(lastkeysBit, keysBit);
			var newKeys = realKeys.filter(function(key){return diff.indexOf(key.bit) >= 0});

			// console.log('KEYS UNPRESSED', diff);
			// console.log('KEYS UNPRESSED', newKeys);
			newKeys.forEach(function(key){key.onUnpressed();});

		} else {
			var diff = _.difference(keysBit, lastkeysBit);
			var newKeys = realKeys.filter(function(key){return diff.indexOf(key.bit) >= 0});
			// console.log('KEYS PRESSED', newKeys);
			newKeys.forEach(function(key){key.onPressed();});
		}
		// console.log('LAST: '+ lastkeysBit);
		lastkeys = keys;
		// console.log('CURR: '+ keysBit);

	});


});

for (var i=0;i<2;i++){
xkeys.setAllBlueBackLights(true);
xkeys.setAllBlueBackLights(false);
xkeys.setAllRedBackLights(false);
};
