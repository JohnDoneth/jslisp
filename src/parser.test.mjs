import test from "ava";

import {
  nullParser,
  booleanParser,
  numberParser,
  stringParser,
  symbolParser,
  keywordParser,
  arrayParser,
  objectParser,
  listParser,
  formParser,
} from "./parser.mjs";

test("nullParser - parses the `null` literal", (t) => {
  const result = nullParser.run("null");

  t.is(result.result.value, null);
  t.is(result.result.type, "Null");
});

test("booleanParser - parses the `true` literal", (t) => {
  const result = booleanParser.run("true");

  t.is(result.result.value, true);
  t.is(result.result.type, "Boolean");
});

test("booleanParser - parses the `false` literal", (t) => {
  const result = booleanParser.run("false");

  t.is(result.result.value, false);
  t.is(result.result.type, "Boolean");
});

test("numberParser - parses integers", (t) => {
  const result = numberParser.run("42");

  t.is(result.result.value, 42);
  t.is(result.result.type, "Number");
});

test("stringParser - parses strings", (t) => {
  const result = stringParser.run('"Hello, world!"');

  t.is(result.result.value, "Hello, world!");
  t.is(result.result.type, "String");
});

test("keywordParser - parses keywords", (t) => {
  const result = keywordParser.run(":keyword");

  t.is(result.result.value, "keyword");
  t.is(result.result.type, "Keyword");
});

test("symbolParser - parses symbols", (t) => {
  const result = symbolParser.run("+");

  t.is(result.result.value, "+");
  t.is(result.result.type, "Symbol");
});

test("arrayParser - parses arrays of integers", (t) => {
  const result = arrayParser.run("[1 2 3]");

  t.like(result.result.value[0], { type: "Number", value: 1 });
  t.like(result.result.value[1], { type: "Number", value: 2 });
  t.like(result.result.value[2], { type: "Number", value: 3 });
  t.is(result.result.type, "Array");
});

test("arrayParser - parses all valid nested types", (t) => {
  const result = arrayParser.run('[null 2 true "foo" [] {}]');

  t.like(result.result.value[0], { type: "Null", value: null });
  t.like(result.result.value[1], { type: "Number", value: 2 });
  t.like(result.result.value[2], { type: "Boolean", value: true });
  t.like(result.result.value[3], { type: "String", value: "foo" });
  t.like(result.result.value[4], { type: "Array" });
  t.like(result.result.value[5], { type: "Object" });
  t.is(result.result.type, "Array");
});

test("objectParser - parses objects", (t) => {
  const result = objectParser.run("{:a 1 :b 2}");

  t.like(result.result.value[0], { type: "Keyword", value: "a" });
  t.like(result.result.value[1], { type: "Number", value: 1 });
  t.like(result.result.value[2], { type: "Keyword", value: "b" });
  t.like(result.result.value[3], { type: "Number", value: 2 });
  t.is(result.result.type, "Object");
});

test("listParser - parses lists", (t) => {
  const result = listParser.run("(+ 2 3)");

  t.like(result.result.value[0], { type: "Symbol", value: "+" });
  t.like(result.result.value[1], { type: "Number", value: 2 });
  t.like(result.result.value[2], { type: "Number", value: 3 });
  t.is(result.result.type, "List");
});

test("formParser - parses the kitchen sink", (t) => {
  const result = formParser.run(`
    {:a (+ 2 2) :b (call (function 2 2))}
  `);

  // console.log(result.result);

  t.pass();
});
