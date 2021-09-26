console.log((Number.isInteger(a)));
console.log((Number.isInteger(42)));
const log = (function(x) {
	return console.log(x);
});
log(42);
log({"a": 2})