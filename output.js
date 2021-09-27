const print = (function(x) {
	return console.log(x);
});
print([1, 2]);
print({a: 42});
const test = (function(x) {
	return (function () {
	let __dispatch__ = typeof(x);
	if (__dispatch__ == "number") { return "it's a number!"; }
	else if (__dispatch__ == "string") { return "it's a string!"; }
	else { return null; }
})();
});
print(test(2));
print(test("string"));
print((typeof("I'm a string!") == "string"))