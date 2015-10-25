//    abc_parse.js: parses a string representing ABC Music Notation into a usable internal structure.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global window */

if (!ABCJS)
	ABCJS = {};

if (!ABCJS.parse)
	ABCJS.parse = {};

ABCJS.parse.clone = function(source) {
	var destination = {};
	for (var property in source)
		if (source.hasOwnProperty(property))
			destination[property] = source[property];
	return destination;
};

ABCJS.parse.gsub = function(source, pattern, replacement) {
	return source.split(pattern).join(replacement);
};

ABCJS.parse.strip = function(str) {
	return str.replace(/^\s+/, '').replace(/\s+$/, '');
};

ABCJS.parse.startsWith = function(str, pattern) {
	return str.indexOf(pattern) === 0;
};

ABCJS.parse.endsWith = function(str, pattern) {
	var d = str.length - pattern.length;
	return d >= 0 && str.lastIndexOf(pattern) === d;
};

ABCJS.parse.each = function(arr, iterator, context) {
	for (var i = 0, length = arr.length; i < length; i++)
	  iterator.apply(context, [arr[i],i]);
};

ABCJS.parse.last = function(arr) {
	if (arr.length === 0)
		return null;
	return arr[arr.length-1];
};

ABCJS.parse.compact = function(arr) {
	var output = [];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i])
			output.push(arr[i]);
	}
	return output;
};

ABCJS.parse.detect = function(arr, iterator) {
	for (var i = 0; i < arr.length; i++) {
		if (iterator(arr[i]))
			return true;
	}
	return false;
};
