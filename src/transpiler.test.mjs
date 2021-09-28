import test from "ava";

import {
  compile,
  compileSource,
  defaultEnvironment,
  quoteMacro,
} from "./transpiler.mjs";

test("it compiles numbers", (t) => {
  const [result, _env] = compileSource("42");

  t.is(result, "42");
});

test("it compiles strings", (t) => {
  const [result, _env] = compileSource(`"Hello, world!"`);

  t.is(result, `"Hello, world!"`);
});

test("it compiles objects with keyword keys", (t) => {
  const [result, _env] = compileSource(`{:a 1 :b 2}`);

  t.is(result, `{a: 1, b: 2}`);
});

test("it errors when objects have an odd amount of key-value pairs", (t) => {
  const error = t.throws(() => {
    compileSource(`{:a 1 :missing-val}`);
  });

  t.like(error, { message: "Objects require an even amount of arguments" });
});

test("it compiles arrays with mixed elements", (t) => {
  const [result, _env] = compileSource(`[1 "b"]`);

  t.is(result, `[1, "b"]`);
});

test("it compiles function calls", (t) => {
  const [result, _env] = compileSource("(console.log 42)");

  t.is(result, "console.log(42)");
});

test("it compiles addition", (t) => {
  const [result, _env] = compileSource("(+ 1 2)");

  t.is(result, "(1 + 2)");
});

test("it compiles subtraction", (t) => {
  const [result, _env] = compileSource("(- 1 2)");

  t.is(result, "(1 - 2)");
});

test("it compiles division", (t) => {
  const [result, _env] = compileSource("(/ 1 2)");

  t.is(result, "(1 / 2)");
});

test("it compiles multiplication", (t) => {
  const [result, _env] = compileSource("(* 1 2)");

  t.is(result, "(1 * 2)");
});

test("it compiles modulo", (t) => {
  const [result, _env] = compileSource("(% 1 2)");

  t.is(result, "(1 % 2)");
});

test("it compiles equality", (t) => {
  const [result, _env] = compileSource("(== 1 2)");

  t.is(result, "(1 == 2)");
});

test("it compiles strict equality", (t) => {
  const [result, _env] = compileSource("(=== 1 2)");

  t.is(result, "(1 === 2)");
});

test("it compiles less-than", (t) => {
  const [result, _env] = compileSource("(< 1 2)");

  t.is(result, "(1 < 2)");
});

test("it compiles less-than or equal-to", (t) => {
  const [result, _env] = compileSource("(<= 1 2)");

  t.is(result, "(1 <= 2)");
});

test("it compiles greater-than", (t) => {
  const [result, _env] = compileSource("(> 1 2)");

  t.is(result, "(1 > 2)");
});

test("it compiles greater-than or equal-to", (t) => {
  const [result, _env] = compileSource("(>= 1 2)");

  t.is(result, "(1 >= 2)");
});

test("it compiles functions as expressions", (t) => {
  const [result, _env] = compileSource("(fn [a b] (+ a b))");

  t.is(
    result,
    `(function(a, b) {
\treturn (a + b);
})`
  );
});

test("it compiles constant assignments", (t) => {
  const [result, _env] = compileSource("(const x 42)");

  t.is(result, "const x = 42");
});

test("it compiles constant assignments with expressions", (t) => {
  const [result, _env] = compileSource("(const x (+ 2 2))");

  t.is(result, "const x = (2 + 2)");
});

test("it compiles if expressions using if statements", (t) => {
  const [result, _env] = compileSource("(if true 42)");

  t.is(
    result,
    `(function(){ if (true) { 
\treturn 42;
}})()`
  );
});

test("it compiles if-else expressions using if-else statements", (t) => {
  const [result, _env] = compileSource(`(if true "true" "false")`);

  t.is(
    result,
    `(function(){ if (true) { 
\treturn "true";
} else { 
\treturn "false";
}})()`
  );
});

test("it compiles do expressions", (t) => {
  const [result, _env] = compileSource("(do 1 2 3)");

  t.is(
    result,
    `(function (){ 
\t1;
\t2;
\treturn 3
 })()`
  );
});

test("it does not allow empty lists", (t) => {
  const error = t.throws(() => {
    compileSource("()");
  });

  t.like(error, { message: "Empty lists are not supported" });
});

test("it does not allow lists without a symbol at the start", (t) => {
  const error = t.throws(() => {
    compileSource("(42)");
  });

  t.like(error, {
    message: "Expected a symbol when evaluating list, got Number instead.",
  });
});

test("it registers macros in the environment", (t) => {
  const [_result, env] = compileSource("(macro test-macro [] 42)");

  t.is(typeof env.macros["test-macro"], "function");
});

test("it expands macros at compile-time", (t) => {
  const [result, _env] = compileSource(`
  (macro int? [type] {type "Boolean" value (Number.isInteger type.value)})

  (int? 3)   ; Should compile to "true".
  (int? "a") ; Should compile to "false".
  `);

  t.is(result, `true;\nfalse`);
});

test("quote is in the default environment", (t) => {
  let env = defaultEnvironment();

  t.is(typeof env.macros["quote"], "function");
});

test("quote returns an object representing a string", (t) => {
  let x = quoteMacro({ type: "String", value: "Hi" });

  t.deepEqual(x, {
    type: "Object",
    value: [
      {
        type: "Keyword",
        value: "type",
      },
      {
        type: "String",
        value: "String",
      },
      {
        type: "Keyword",
        value: "value",
      },
      {
        type: "String",
        value: "Hi",
      },
    ],
  });
});

test("quote returns an object representing a number", (t) => {
  let x = quoteMacro({ type: "Number", value: 42 });

  t.deepEqual(x, {
    type: "Object",
    value: [
      {
        type: "Keyword",
        value: "type",
      },
      {
        type: "String",
        value: "Number",
      },
      {
        type: "Keyword",
        value: "value",
      },
      {
        type: "Number",
        value: 42,
      },
    ],
  });
});

test("quote returns an object representing a symbol", (t) => {
  let x = quoteMacro({ type: "Symbol", value: "key" });

  t.deepEqual(x, {
    type: "Object",
    value: [
      {
        type: "Keyword",
        value: "type",
      },
      {
        type: "String",
        value: "Symbol",
      },
      {
        type: "Keyword",
        value: "value",
      },
      {
        type: "Symbol",
        value: "key",
      },
    ],
  });
});

test("quote returns an object representing a keyword", (t) => {
  let x = quoteMacro({ type: "Keyword", value: "key" });

  t.deepEqual(x, {
    type: "Object",
    value: [
      {
        type: "Keyword",
        value: "type",
      },
      {
        type: "String",
        value: "Keyword",
      },
      {
        type: "Keyword",
        value: "value",
      },
      {
        type: "Keyword",
        value: "key",
      },
    ],
  });
});

test("quote returns an object representing null", (t) => {
  let x = quoteMacro({ type: "Null", value: null });

  t.deepEqual(x, {
    type: "Object",
    value: [
      {
        type: "Keyword",
        value: "type",
      },
      {
        type: "String",
        value: "Null",
      },
      {
        type: "Keyword",
        value: "value",
      },
      {
        type: "Null",
        value: null,
      },
    ],
  });
});

test("quote returns an object representing an array", (t) => {
  let x = quoteMacro({
    type: "Array",
    value: [
      { type: "Number", value: 1 },
      { type: "Number", value: 2 },
      { type: "Number", value: 3 },
    ],
  });

  t.deepEqual(x, {
    type: "Object",
    value: [
      {
        type: "Keyword",
        value: "type",
      },
      {
        type: "String",
        value: "Array",
      },
      {
        type: "Keyword",
        value: "value",
      },
      {
        type: "Array",
        value: [
          {
            type: "Object",
            value: [
              {
                type: "Keyword",
                value: "type",
              },
              {
                type: "String",
                value: "Number",
              },
              {
                type: "Keyword",
                value: "value",
              },
              {
                type: "Number",
                value: 1,
              },
            ],
          },
          {
            type: "Object",
            value: [
              {
                type: "Keyword",
                value: "type",
              },
              {
                type: "String",
                value: "Number",
              },
              {
                type: "Keyword",
                value: "value",
              },
              {
                type: "Number",
                value: 2,
              },
            ],
          },
          {
            type: "Object",
            value: [
              {
                type: "Keyword",
                value: "type",
              },
              {
                type: "String",
                value: "Number",
              },
              {
                type: "Keyword",
                value: "value",
              },
              {
                type: "Number",
                value: 3,
              },
            ],
          },
        ],
      },
    ],
  });
});

test("quote returns an object representing an object", (t) => {
  let x = quoteMacro({
    type: "Object",
    value: [
      { type: "Symbol", value: "key" },
      { type: "String", value: "value" },
    ],
  });

  t.deepEqual(x, {
    type: "Object",
    value: [
      {
        type: "Keyword",
        value: "type",
      },
      {
        type: "String",
        value: "Object",
      },
      {
        type: "Keyword",
        value: "value",
      },
      {
        type: "Array",
        value: [
          {
            type: "Object",
            value: [
              {
                type: "Keyword",
                value: "type",
              },
              {
                type: "String",
                value: "Symbol",
              },
              {
                type: "Keyword",
                value: "value",
              },
              {
                type: "Symbol",
                value: "key",
              },
            ],
          },
          {
            type: "Object",
            value: [
              {
                type: "Keyword",
                value: "type",
              },
              {
                type: "String",
                value: "String",
              },
              {
                type: "Keyword",
                value: "value",
              },
              {
                type: "String",
                value: "value",
              },
            ],
          },
        ],
      },
    ],
  });
});

test("quote is the inverse of compile", (t) => {
  let input = {
    type: "Array",
    value: [
      { type: "Number", value: 1 },
      { type: "Number", value: 2 },
      { type: "Number", value: 3 },
    ],
  };

  let [output, _env] = compile(quoteMacro(input));

  t.deepEqual(input, eval(`(${output})`));
});

test("compile works with object representations", (t) => {
  let input = {
    type: "Object",
    value: [
      { type: "Keyword", value: "a" },
      { type: "Number", value: 2 },
    ],
  };

  let [output, _env] = compile(input);

  t.deepEqual(output, "{a: 2}");
});

test("compile works with nested object representations", (t) => {
  let input = {
    type: "Object",
    value: [
      { type: "Keyword", value: "a" },
      {
        type: "Object",
        value: [
          { type: "Keyword", value: "b" },
          { type: "Number", value: 2 },
        ],
      },
    ],
  };

  let [output, _env] = compile(input);

  t.deepEqual(output, "{a: {b: 2}}");
});

test("quote is the inverse of nested object representations", (t) => {
  let input = compileSource("(quote {:a 2})")[0];

  t.is(
    `{type: "Object", value: [{type: "Keyword", value: a}, {type: "Number", value: 2}]}`,
    input
  );
});

// Round-trip through the compiler! :-)
test("quote is the inverse of compile with objects", (t) => {
  let input = {
    type: "Object",
    value: [
      { type: "String", value: "a" },
      { type: "Number", value: 2 },
    ],
  };

  let [output, _env] = compile(quoteMacro(input));

  t.deepEqual(input, eval(`(${output})`));
});

test("quote is the inverse of compile with lists", (t) => {
  let input = {
    type: "List",
    value: [
      { type: "String", value: "a" },
      { type: "Number", value: 2 },
    ],
  };

  let [output, _env] = compile(quoteMacro(input));

  t.deepEqual(input, eval(`(${output})`));
});

test("quote is the inverse of compile with arrays", (t) => {
  let input = {
    type: "Array",
    value: [
      { type: "String", value: "a" },
      { type: "Number", value: 2 },
    ],
  };

  let [output, _env] = compile(quoteMacro(input));

  t.deepEqual(input, eval(`(${output})`));
});

test("quasiquote works", (t) => {
  let [output, _env] = compileSource(
    `
  (macro int? [value] 
    (quasiquote (Number.isInteger (unquote value))))

  (int? 42)
  `
  );

  t.is(output, `Number.isInteger(42)`);
});

test("import - import the default export", (t) => {
  let [output, _env] = compileSource(`
    (import myDefault :from "module")
  `);

  t.is(output, `import myDefault from "module";`);
});

test("import - default import and a namespace", (t) => {
  let [output, _env] = compileSource(`
    (import myDefault [* :as myModule] :from "/modules/my-module.js")
  `);

  t.is(output, `import myDefault, * as myModule from "/modules/my-module.js";`);
});

test("import - default import with specific, named imports", (t) => {
  let [output, _env] = compileSource(`
    (import myDefault [foo bar] :from "/modules/my-module.js")
  `);

  t.is(output, `import myDefault, { foo, bar } from "/modules/my-module.js";`);
});

test("import - import an entire module's contents", (t) => {
  let [output, _env] = compileSource(`
    (import * :as myModule :from "module")
  `);

  t.is(output, `import * as myModule from "module";`);
});

test("import - import a single export from a module", (t) => {
  let [output, _env] = compileSource(`
    (import [myExport] :from "module")
  `);

  t.is(output, `import { myExport } from "module";`);
});

test("import - import multiple exports from module", (t) => {
  let [output, _env] = compileSource(`
    (import [foo bar] :from "module")
  `);

  t.is(output, `import { foo, bar } from "module";`);
});

test("import - import an export with a more convenient alias", (t) => {
  let [output, _env] = compileSource(`
    (import [reallyReallyLongModuleExportName :as shortName] :from "module")
  `);

  t.is(output, `import { reallyReallyLongModuleExportName as shortName } from "module";`);
});

test("import - rename multiple exports during import", (t) => {
  let [output, _env] = compileSource(`
    (import [
      reallyReallyLongModuleExportName :as shortName
      anotherLongModuleName :as short
    ] :from "module")
  `);

  t.is(output, `import { reallyReallyLongModuleExportName as shortName, anotherLongModuleName as short } from "module";`);
});

test("import - import a module for its side effects only", (t) => {
  let [output, _env] = compileSource(`
    (import "module")
  `);

  t.is(output, `import "module";`);
});

// TODO - support dynamic imports. Function syntax 
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_import