 function toFloat(data) {
		let pay = data;
		const buf = Buffer.allocUnsafe(4); // (4) is ok
		buf.writeUInt16BE(pay[0]); // high byte
		buf.writeUInt16BE(pay[1], 2); // low byte
		return Number(buf.readFloatBE(0).toFixed(3));
	}
	
 function fromFloat(data) {
		var farr = new Float32Array(1);
		farr[0] = data;
		var barr = new Int16Array(farr.buffer);
		return [barr[1],barr[0]];
	}
	
	
console.log( toFloat([17000,0]));
console.log( toFloat([17000,1]));
console.log( toFloat([17006,0]));

console.log( fromFloat(58));
console.log( fromFloat(59.5));
console.log( fromFloat(3));



//https://stackoverflow.com/questions/67396541/convert-float-to-modbus-registers-in-dart