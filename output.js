const log = (function(x) {
	console.log(x);
	return console.log(x);
});
log((typeof("hello") == "string"));
log((typeof({a: "2"}) == "string"));
const x = (function(a, b, ...rest) {
	return rest;
});
log(x(1, 2));
log(x(1, 2, 3, 4));
const y = "hello";
const test = (function(x) {
	return (function () {
	let __dispatch__ = typeof(x);
	if (__dispatch__ == "number") { return "it's a number!"; }
	else if (__dispatch__ == "string") { return "it's a string!"; }
	else { return null; }
})();
});
test(2)