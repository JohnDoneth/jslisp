const log = (function(x) {
	return console.log(x);
});
log((typeof("hello") == "string"));
log((typeof({a: "2"}) == "string"))