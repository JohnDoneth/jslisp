// Contains tests that test the evaluation of code.
//
// These tests, test behavior only, and not the generated code.

import test from "ava";

import { compileSource } from "./transpiler.mjs";

function run(source) {
  const [javaScript, _env] = compileSource(source);

  return eval(javaScript);
}

test("case - throws when dispatch is missing", (t) => {
  const error = t.throws(() => {
    run(`(case)`);
  });

  t.like(error, { message: "case expression is missing a dispatch value." });
});

test("case - throws when the pairs is empty", (t) => {
  const error = t.throws(() => {
    run(`(case true)`);
  });

  t.like(error, { message: "case expressions require at least one pair." });
});

test("case - matching works 1", (t) => {
  const result = run(`
    (const y 42)

    (case (typeof y)
        "number" "it's a number!"
        "string" "it's a string!")
  `);

  t.is(result, "it's a number!");
});

test("case - matching works 2", (t) => {
  const result = run(`
    (const y "I'm a string")

    (case (typeof y)
        "number" "it's a number!"
        "string" "it's a string!")
  `);

  t.is(result, "it's a string!");
});

test("case - defaults to the last case with odd arguments", (t) => {
  const result = run(`
    (const y {}) ; An empty object

    (case (typeof y)
        "number" "it's a number!"
        "string" "it's a string!"
        {})
  `);

  t.deepEqual(result, {});
});

test("case - defaults to null if no matches occur with an even number of arguments", (t) => {
  const result = run(`
    (const y {}) ; An empty object

    (case (typeof y)
        "number" "it's a number!"
        "string" "it's a string!")
  `);

  t.is(result, null);
});
