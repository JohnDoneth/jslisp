console.log(Number.isInteger("a"));
console.log(Number.isInteger(42));
const log = (function(x) {
	return console.log(x);
});
log((typeof("hello") == "string"));
log((typeof({a: "2"}) == "string"))