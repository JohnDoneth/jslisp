console.log((value));
console.log((value));
const log = (function(x) {
	return console.log(x);
});
log(42);
log({"a": 2})