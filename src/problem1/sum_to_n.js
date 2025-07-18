/*
* Based on the description, I assume that n should be larger than 0 (n >= 0)
* because we start sum from 0
* If n < 0, all the functions will return -1 meaning that the input is invalid
* */

// Basic sum with loop
var sum_to_n_a = function(n) {
	if (n < 0) {
		return -1;
	}
	let count = 0;
	for (let i = 0; i <= n; i++) {
		count += i;
	}
	return count;
};

// Using recursive
var sum_to_n_b = function(n) {
	if (n < 0) {
		return -1;
	}
	if (n === 0 || n === 1) {
		return n;
	}
	return sum_to_n_b(n - 1) + n;
};

// Recursive combined with memorized calculation
var sum_to_n_c = function(n) {
	if (n < 0) {
		return -1;
	}
	const cache = new Map();
	function innerSum(innerN) {
		if (innerN === 0 || innerN === 1) {
			cache.set(innerN, innerN);
			return innerN;
		}
		if (cache.has(innerN)) {
			return cache.get(innerN);
		}
		const sum = innerSum(innerN - 1) + innerN;
		cache.set(innerN, sum);
		return sum;
	}
	return innerSum(n);
};