export function degrees2radians(n : number) : number {
	return n * (Math.PI / 180);
}

export function max3(a : number, b : number, c : number) {
	var m = a;
	(m < b) && (m = b);
	(m < c) && (m = c);
	return m;
}

export function min3(a : number, b : number, c : number) {
	var m = a;
	(m > b) && (m = b);
	(m > c) && (m = c);
	return m;
}

export function intInRange(value : number, low : number, high : number) {
	if (value > high) value = high;
	if (value < low) value = low;
	return value | 0;
}

export function stableSort<T>(arrayToSort : T[], callback : (a : T, b : T) => number) : T[] {
	var type = typeof arrayToSort[ 0 ],
		sorted : T[];

	if (type === "number" || type === "string") {
		var ord = Object.create(null);
		for (var i = 0, l = arrayToSort.length; i < l; i++) {
			var val : string = <any>arrayToSort[ i ];
			if (ord[ val ] || ord[ val ] === 0) continue;
			ord[ val ] = i;
		}

		sorted = arrayToSort.sort(function (a, b) {
			return callback(a, b) || ord[ <any>a ] - ord[ <any>b ];
		});
	} else {
		var ord2 : T[] = arrayToSort.slice(0);
		sorted         = arrayToSort.sort(function (a, b) {
			return callback(a, b) || ord2.indexOf(a) - ord2.indexOf(b);
		});
	}

	return sorted;
}

