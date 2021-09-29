const bool? = (function(x) {
	"Check if x is a boolean.";
	return {type: "List", value: [{type: "Symbol", value: "=="}, {type: "List", value: [{type: "Symbol", value: "typeof"}, x]}, {type: "String", value: "boolean"}]};
});
const object? = (function(x) {
	"Check if x is an object.";
	return {type: "List", value: [{type: "Symbol", value: "=="}, {type: "List", value: [{type: "Symbol", value: "typeof"}, x]}, {type: "String", value: "object"}]};
});
const number? = (function(x) {
	"Check if x is a number.";
	return {type: "List", value: [{type: "Symbol", value: "=="}, {type: "List", value: [{type: "Symbol", value: "typeof"}, x]}, {type: "String", value: "number"}]};
});
const function? = (function(x) {
	"Check if x is a function.";
	return {type: "List", value: [{type: "Symbol", value: "=="}, {type: "List", value: [{type: "Symbol", value: "typeof"}, x]}, {type: "String", value: "function"}]};
});
const int? = (function(x) {
	"Check if x is an integer.";
	return {type: "List", value: [{type: "Symbol", value: "Number.isInteger"}, x]};
});
const float? = (function(x) {
	"Check if x is a float.";
	return {type: "List", value: [{type: "Symbol", value: "!"}, {type: "List", value: [{type: "Symbol", value: "int?"}, x]}]};
});
const array? = (function(x) {
	"Check if x is an array.";
	return {type: "List", value: [{type: "Symbol", value: "Array.isArray"}, x]};
});
const string? = (function(x) {
	"Check if x is a string.";
	return {type: "List", value: [{type: "Symbol", value: "=="}, {type: "List", value: [{type: "Symbol", value: "typeof"}, x]}, {type: "String", value: "string"}]};
});
const undefined? = (function(x) {
	"Check if x is undefined.";
	return {type: "List", value: [{type: "Symbol", value: "=="}, {type: "List", value: [{type: "Symbol", value: "typeof"}, x]}, {type: "String", value: "undefined"}]};
});
const macros = [bool_3f, object_3f, number_3f, function_3f, int_3f, float_3f, array_3f, string_3f, undefined_3f];
export {
    bool_3f
}