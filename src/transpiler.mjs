import assert from "assert";
import { manyFormsParser } from "./parser.mjs";
import { mangle, unmangle } from "./mangle.mjs";

// Operators reserved by the compiler.
const OPERATORS = [
  "%",
  "+",
  "-",
  "*",
  "/",
  "==",
  "===",
  "!=",
  "!==",
  "<",
  "<=",
  ">",
  ">=",
  "&&",
  "||",
];

// Forms reserved by the compiler.
const SPECIAL_FORMS = [
  "case",
  "const",
  "continue",
  "do",
  "fn",
  "global",
  "if",
  "import",
  "let",
  "macro",
  "macroexpand",
  "set",
  "throw",
  "while",
];

const pairsOf = (reducable) => {
  const pairs = reducable.reduce(function (result, _value, index, array) {
    if (index % 2 === 0) result.push(array.slice(index, index + 2));
    return result;
  }, []);
  return pairs;
};

export const javaScriptMacro = (input) => {
  assert(
    input?.type === "String",
    `The argument to the 'javascript' macro should be a string. Got ${JSON.stringify(
      input
    )}`
  );

  return {
    type: "JavaScript",
    value: input.value,
  };
};

// Like `quote` but supports `unquote`'ing (interpolating) expressions inside.
export const quasiquoteMacro = (form, unquote) => {
  unquote = unquote || false;

  //console.log({ quasiquote: JSON.stringify(form) });

  function wrapper(form) {
    return {
      type: "Object",
      value: [
        { type: "Keyword", value: "type" },
        { type: "String", value: form.type },
        { type: "Keyword", value: "value" },
        { type: form.type, value: form.value },
      ],
    };
  }

  function stringWrapper(form) {
    let v;
    if (unquote) {
      v = form.value;
    } else {
      v = `"${form.value}"`;
    }

    return {
      type: "Object",
      value: [
        { type: "Keyword", value: "type" },
        { type: "String", value: form.type },
        { type: "Keyword", value: "value" },
        { type: form.type, value: v },
      ],
    };
  }

  function symbolWrapper(form) {
    console.log({ v: form });

    let v;
    if (unquote) {
      v = form.value;
    } else {
      v = `"${form.value}"`;
    }

    return {
      type: "Object",
      value: [
        { type: "Keyword", value: "type" },
        { type: "String", value: form.type },
        { type: "Keyword", value: "value" },
        { type: form.type, value: v },
      ],
    };
  }

  function containerWrap(form) {
    const newForm = {
      type: form.type,
      value: form.value.map((x) => quasiquoteMacro(x)),
    };

    return wrapper(newForm);
  }

  function listWrap(form) {
    if (form.value[0].type === "Symbol" && form.value[0].value == "unquote") {
      return form.value[1];
    } else {
      const mappedValues = form.value.map((x) => quasiquoteMacro(x));

      return {
        type: "Object",
        value: [
          { type: "Keyword", value: "type" },
          { type: "String", value: "List" },
          { type: "Keyword", value: "value" },
          { type: "Array", value: mappedValues },
        ],
      };
    }
  }

  function objectWrap(form) {
    const pairs = form.value.reduce(function (result, _value, index, array) {
      if (index % 2 === 0) result.push(array.slice(index, index + 2));
      return result;
    }, []);

    const mappedValues = pairs
      .map(([k, v]) => [quasiquoteMacro(k), quasiquoteMacro(v)])
      .flat();

    return {
      type: "Object",
      value: [
        { type: "Keyword", value: "type" },
        { type: "String", value: "Object" },
        { type: "Keyword", value: "value" },
        { type: "Array", value: mappedValues },
      ],
    };
  }

  if (form.type === "String") {
    return wrapper(form);
  } else if (form.type === "Boolean") {
    return wrapper(form);
  } else if (form.type === "Number") {
    return wrapper(form);
  } else if (form.type === "Symbol") {
    return symbolWrapper(form);
  } else if (form.type === "Keyword") {
    return stringWrapper(form);
  } else if (form.type === "Null") {
    return wrapper(form);
  } else if (form.type === "Array") {
    return containerWrap(form);
  } else if (form.type === "Object") {
    return objectWrap(form);
  } else if (form.type === "List") {
    return listWrap(form);
  }
};

// Quote takes a Lisp form and turns it into the compiler representation as a
// JavaScript object. Kind-of the opposite of compile.
export const quoteMacro = (form) => {
  function wrapper(form) {
    return {
      type: "Object",
      value: [
        { type: "Keyword", value: "type" },
        { type: "String", value: form.type },
        { type: "Keyword", value: "value" },
        { type: form.type, value: form.value },
      ],
    };
  }

  function stringWrapper(form) {
    return {
      type: "Object",
      value: [
        { type: "Keyword", value: "type" },
        { type: "String", value: form.type },
        { type: "Keyword", value: "value" },
        { type: form.type, value: `${form.value}` },
      ],
    };
  }

  function symbolWrapper(form) {
    return {
      type: "Object",
      value: [
        { type: "Keyword", value: "type" },
        { type: "String", value: form.type },
        { type: "Keyword", value: "value" },
        { type: form.type, value: `"${form.value}"` },
      ],
    };
  }

  function containerWrap(form) {
    const newForm = {
      type: form.type,
      value: form.value.map((x) => quoteMacro(x)),
    };

    return wrapper(newForm);
  }

  function listWrap(form) {
    let mappedValues = form.value.map((x) => quoteMacro(x));

    return {
      type: "Object",
      value: [
        { type: "Keyword", value: "type" },
        { type: "String", value: "List" },
        { type: "Keyword", value: "value" },
        { type: "Array", value: mappedValues },
      ],
    };
  }

  function objectWrap(form) {
    const pairs = form.value.reduce(function (result, _value, index, array) {
      if (index % 2 === 0) result.push(array.slice(index, index + 2));
      return result;
    }, []);

    const mappedValues = pairs
      .map(([k, v]) => [quoteMacro(k), quoteMacro(v)])
      .flat();

    return {
      type: "Object",
      value: [
        { type: "Keyword", value: "type" },
        { type: "String", value: "Object" },
        { type: "Keyword", value: "value" },
        { type: "Array", value: mappedValues },
      ],
    };
  }

  if (form.type === "String") {
    return wrapper(form);
  } else if (form.type === "Boolean") {
    return wrapper(form);
  } else if (form.type === "Number") {
    return wrapper(form);
  } else if (form.type === "Symbol") {
    return symbolWrapper(form);
  } else if (form.type === "Keyword") {
    return stringWrapper(form);
  } else if (form.type === "Null") {
    return wrapper(form);
  } else if (form.type === "Array") {
    return containerWrap(form);
  } else if (form.type === "Object") {
    return objectWrap(form);
  } else if (form.type === "List") {
    return listWrap(form);
  }
};

const compileOp = (list, env) => {
  let operation = list.value
    .slice(1)
    .map((x) => compile(x, env)[0])
    .join(` ${list.value[0].value} `);

  return [`(${operation})`, env];
};

const compileMacro = (macro, list, env) => {
  const args = list.value.slice(1);

  //console.log({ macroArgs: args });

  const macroResult = macro(...args);

  console.log({ macroResult: macroResult });
  //console.log({ compiledMacroResult: compile(macroResult, env) });

  //env.inMacro = true;
  let [output, newEnv] = compile(macroResult, env);
  //newEnv.inMacro = false;

  console.log({ macroOutput: output });

  return [`${output}`, newEnv];
};

const compileCall = (list, env) => {
  let first = compile(list.value[0], env)[0];

  if (env.macros[first]) {
    return compileMacro(env.macros[first], list, env);
  } else {
    let rest = list.value
      .slice(1)
      .map((x) => compile(x, env)[0])
      .join(", ");

    return [`${first}(${rest})`, env];
  }
};

const compileFunction = (list, env) => {
  let args = list[0].value;

  args = args
    .map(function (arg) {
      assert(
        arg?.type === "Symbol",
        `Function arguments need to be symbols. Got ${JSON.stringify(arg)}`
      );

      return compile(arg, env)[0];
    })
    .join(", ");

  // Get all the expression arguments except for the last.
  let rest = list
    .slice(1, -1)
    .map((x) => compile(x, env)[0])
    .map((x) => `\t${x}`); // indent

  // Last expression in the body needs to "return".
  let last = list
    .slice(-1)
    .map((x) => compile(x, env)[0])
    .map((x) => `\treturn ${x};\n`);

  /// Slam em together
  let body = [...rest, ...last].join(";\n");

  return [`(function(${args}) {\n${body}})`, env];
};

const compileImportItem = (item, toplevel) => {
  //console.log({ item: item });

  if (item.type == "Array") {
    let result = [];
    for (let index = 0; index < item.value.length; index++) {
      const element = item.value[index];

      if (item.value[index + 1]?.value == "as") {
        const alias = compile(item.value[index + 2])[0];

        result.push(`${compileImportItem(element, false)} as ${alias}`);
        index += 2;
      } else {
        result.push(compileImportItem(element, false));
      }
    }

    //console.log({ result: result });

    if (toplevel) {
      return `${result.join(", ")}`;
    } else {
      return `{ ${result.join(", ")} }`;
    }
  }

  return `${item.value}`;
};

const compileImportBody = (imports, env) => {
  let items = [];

  for (let index = 0; index < imports.length; index++) {
    const element = imports[index];

    if (element.value == "from") {
      break;
    } else {
      items.push(element);
    }
  }

  items = {
    type: "Array",
    value: items,
  };

  //console.log({ items: JSON.stringify(items) });

  return [compileImportItem(items, true), env];
};

const compileSpecialForm = (form, env) => {
  let first = form.value[0].value;

  if (first == "const") {
    let second = compile(form.value[1], env)[0];
    let [third, newEnv] = compile(form.value[2], env);
    return [`const ${second} = ${third}`, newEnv];
  } else if (first == "global") {
    let second = compile(form.value[1], env)[0];
    let [third, newEnv] = compile(form.value[2], env);
    return [`${second} = ${third}`, newEnv];
  } else if (first == "set") {
    let second = compile(form.value[1], env)[0];
    let [third, newEnv] = compile(form.value[2], env);
    return [`${second} = ${third}`, newEnv];
  } else if (first == "fn") {
    return compileFunction(form.value.slice(1), env);
  } else if (first == "if") {
    assert(form.value.length >= 3, "if form requires as least two arguments.");

    let conditional = compile(form.value[1], env)[0];
    let if_body = compile(form.value[2], env)[0];

    if (form.value[3]) {
      let else_body = compile(form.value[3])[0];
      return [
        `(function(){ if (${conditional}) { \n\treturn ${if_body};\n} else { \n\treturn ${else_body};\n}})()`,
        env,
      ];
    } else {
      return [
        `(function(){ if (${conditional}) { \n\treturn ${if_body};\n}})()`,
        env,
      ];
    }
  } else if (first == "do") {
    let rest = form.value
      .slice(1, -1)
      .map((x) => compile(x, env)[0])
      .map((x) => `\n\t${x}`); // indent

    // Last expression in the body needs to "return".
    let last = form.value
      .slice(-1)
      .map((x) => compile(x, env)[0])
      .map((x) => `\n\treturn ${x}`);

    let body = [...rest, ...last].join(";");

    return [`(function (){ ${body}\n })()`, env];
  } else if (first == "import") {
    const args = form.value.slice(1);

    if (args.length == 1) {
      return [`import "${args[0].value}";`, env];
    }

    //console.log({ len: args.length });

    let from = ";";
    if (args.length >= 3) {
      const module = args.splice(-1)[0];
      const _ = args.splice(-1);
      from = `from ${compile(module, env)[0]};`;
    }

    let body = compileImportBody(args, env)[0];

    return ["import " + body + " " + from, env];
  } else if (first == "macro") {
    assert(
      form.value.length >= 3,
      "macro form requires a name, arguments, and a body."
    );

    const identifier = compile(form.value[1], env)[0];

    const [macroSource, newEnv] = compileFunction(form.value.slice(2), env);

    console.log({ macroSource: macroSource });

    env.macros[identifier] = eval(macroSource);

    return [``, env];
  } else if (first == "throw") {
    assert(
      form.value.length == 2,
      `throw requires exactly one argument. Got ${form.value.length - 1}`
    );

    let [rightHand, newEnv] = compile(form.value[1]);

    return [`throw ${rightHand}`, newEnv];
  } else if (first == "case") {
    if (form.value.length === 1) {
      throw new Error("case expression is missing a dispatch value.");
    }
    if (form.value.length < 4) {
      throw new Error("case expressions require at least one pair.");
    }

    const dispatch = compile(form.value[1], env)[0];
    let pairs = form.value.slice(2);
    const oddArgs = pairs.length % 2 !== 0;

    let defaultCase = null;
    if (oddArgs) {
      const last = pairs.splice(-1)[0];
      defaultCase = compile(last, env)[0]; // remove last expression
    }

    const dispatchStmt = `\n\tlet __dispatch__ = ${dispatch};`;

    const body = pairsOf(pairs).reduce(function (prev, [key, value]) {
      key = compile(key, env)[0];
      value = compile(value, env)[0];

      let expr = "else if";
      if (prev === "") {
        expr = "if";
      }

      return [
        prev,
        `\t${expr} (__dispatch__ == ${key}) { return ${value}; }`,
      ].join("\n");
    }, "");

    let defaultStmt = "\n\telse { return null; }";
    if (defaultCase) {
      defaultStmt = `\n\telse { return ${defaultCase}; }`;
    }

    const caseExpr = `(function () {${dispatchStmt + body + defaultStmt}\n})()`;

    return [caseExpr, env];
  } else {
    throw { error: "Unimplemented special form" };
  }
};

const compileList = (list, env) => {
  assert(list?.type === "List", `Got ${JSON.stringify(list)}`);

  if (list.value[0] != null) {
    if (list.value[0].type == "Symbol") {
      if (OPERATORS.includes(list.value[0].value)) {
        assert(
          list?.value.length >= 3,
          `The '${
            list.value[0].value
          }' operator requires at least two arguments. Got ${
            list.value.length - 1
          }`
        );
        return compileOp(list, env);
      } else if (SPECIAL_FORMS.includes(list.value[0].value)) {
        return compileSpecialForm(list, env);
      } else {
        return compileCall(list, env);
      }
    } else {
      throw new Error(
        `Expected a symbol when evaluating list, got ${list.value[0].type} instead.`
      );
    }
  } else {
    throw new Error("Empty lists are not supported");
  }
};

const compileArray = (array, env) => {
  assert(array?.type === "Array", `Got ${JSON.stringify(array)}`);

  //console.log(array.value);

  const inner = array.value
    .map(function (value) {
      return `${compile(value, env)[0]}`;
    })
    .join(", ");

  return [`[${inner}]`, env];
};

const compileNumber = (number, env) => {
  assert(number?.type === "Number", `Got ${JSON.stringify(number)}`);
  return [number.value, env];
};

const compileBoolean = (boolean, env) => {
  assert(boolean?.type === "Boolean", `Got ${JSON.stringify(boolean)}`);
  return [boolean.value, env];
};

const compileSymbol = (symbol, env) => {
  assert(symbol?.type === "Symbol", `Got ${JSON.stringify(symbol)}`);

  return [`${symbol.value}`, env];
};

const compileString = (string, env) => {
  assert(string?.type === "String", `Got ${JSON.stringify(string)}`);
  return [`"${string.value}"`, env];
};

const compileKeyword = (keyword, env) => {
  assert(keyword?.type === "Keyword", `Got ${JSON.stringify(keyword)}`);
  return [`${keyword.value}`, env];
};

const compileDown = (form) => {
  if (form.type) {
    return compile(form);
  } else {
    return form;
  }
};

const compileObject = (object, env) => {
  assert(object?.type === "Object", `Got ${JSON.stringify(object)}`);

  //console.log(object.value);
  //console.log(object.value.length);

  if (object.value.length % 2 !== 0) {
    throw new Error("Objects require an even amount of arguments");
  }

  const pairs = object.value.reduce(function (result, _value, index, array) {
    if (index % 2 === 0) result.push(array.slice(index, index + 2));
    return result;
  }, []);

  const inner = pairs
    .map(function ([key, value]) {
      // assert(
      //   key?.type === "Keyword" ||
      //     key?.type === "Symbol" ||
      //     key?.type === "String",
      //   `Keys to objects need to be keywords, symbols, or strings. Got ${JSON.stringify(
      //     key?.type
      //   )} in ${JSON.stringify(object)}`
      // );

      key = compile(key, env)[0];

      if (
        key.type === "Keyword" ||
        key.type === "Symbol" ||
        key.type === "String"
      ) {
        throw new Error(
          "Keys to objects need to be keywords, symbols, or strings"
        );
      }

      //console.log({ value: value });

      value = compile(value, env)[0];

      let res = `${key}: ${value}`;

      //console.log({ compileResult: res });

      return res;
    })
    .join(", ");

  //console.log({ finalRes: `{${inner}}` });

  return [`{${inner}}`, env];
};

export const compile = (ast, env) => {
  //console.log(ast);

  if (ast?.type === "List") {
    return compileList(ast, env);
  } else if (ast?.type === "Number") {
    return compileNumber(ast, env);
  } else if (ast?.type === "String") {
    return compileString(ast, env);
  } else if (ast?.type === "Object") {
    return compileObject(ast, env);
  } else if (ast?.type === "Boolean") {
    return compileBoolean(ast, env);
  } else if (ast?.type === "Array") {
    return compileArray(ast, env);
  } else if (ast?.type === "Keyword") {
    return compileKeyword(ast, env);
  } else if (ast?.type === "JavaScript") {
    return [ast.value, env];
  } else {
    return compileSymbol(ast, env);
  }
};

export const defaultEnvironment = () => {
  return {
    inMacro: false,
    macros: {
      quote: quoteMacro,
      quasiquote: quasiquoteMacro,
      javascript: javaScriptMacro,
    },
  };
};

export const compileSource = (source, env) => {
  if (env === undefined) {
    env = defaultEnvironment();
  }

  let parseResult = manyFormsParser.run(source);

  if (!parseResult.isError) {
    let topLevelForms = parseResult.result;

    console.log(JSON.stringify(topLevelForms));

    let result2 = topLevelForms.reduce(
      function (prev, current) {
        const [output, newEnv] = compile(current, prev.env);

        return {
          output: prev.output.concat(output),
          env: newEnv,
        };
      },
      { output: [], env: env }
    );

    const javaScript = result2.output.filter((x) => x !== "").join(";\n");

    return [javaScript, env];
  } else {
    throw { error: parseResult };
  }
};
