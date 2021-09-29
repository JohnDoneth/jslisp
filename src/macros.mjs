const bool_3f = (function(x) {
	"Check if x is a boolean.";
	return {type: "List", value: [{type: "Symbol", value: "=="}, {type: "List", value: [{type: "Symbol", value: "typeof"}, x]}, {type: "String", value: "boolean"}]};
});
const object_3f = (function(x) {
	"Check if x is an object.";
	return {type: "List", value: [{type: "Symbol", value: "=="}, {type: "List", value: [{type: "Symbol", value: "typeof"}, x]}, {type: "String", value: "object"}]};
});
const number_3f = (function(x) {
	"Check if x is a number.";
	return {type: "List", value: [{type: "Symbol", value: "=="}, {type: "List", value: [{type: "Symbol", value: "typeof"}, x]}, {type: "String", value: "number"}]};
});
const function_3f = (function(x) {
	"Check if x is a function.";
	return {type: "List", value: [{type: "Symbol", value: "=="}, {type: "List", value: [{type: "Symbol", value: "typeof"}, x]}, {type: "String", value: "function"}]};
});
const int_3f = (function(x) {
	"Check if x is an integer.";
	return {type: "List", value: [{type: "Symbol", value: "Number.isInteger"}, x]};
});
const float_3f = (function(x) {
	"Check if x is a float.";
	return {type: "List", value: [{type: "Symbol", value: "!"}, {type: "List", value: [{type: "Symbol", value: "int?"}, x]}]};
});
const array_3f = (function(x) {
	"Check if x is an array.";
	return {type: "List", value: [{type: "Symbol", value: "Array.isArray"}, x]};
});
const string_3f = (function(x) {
	"Check if x is a string.";
	return {type: "List", value: [{type: "Symbol", value: "=="}, {type: "List", value: [{type: "Symbol", value: "typeof"}, x]}, {type: "String", value: "string"}]};
});
const undefined_3f = (function(x) {
	"Check if x is undefined.";
	return {type: "List", value: [{type: "Symbol", value: "=="}, {type: "List", value: [{type: "Symbol", value: "typeof"}, x]}, {type: "String", value: "undefined"}]};
});
export {
    bool_3f
}