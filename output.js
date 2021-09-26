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
log(x(1, 2, 3, 4))