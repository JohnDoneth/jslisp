import { manyFormsParser } from "./parser.mjs";
import assert from "assert";
import util from "util";

// Operators reserved by the compiler.
const OPERATORS = ["%", "+", "-", "*", "/", "==", "===", "<", "<=", ">", ">="];

// Forms reserved by the compiler.
const SPECIAL_FORMS = [
  "unquote",
  "macro",
  "macroexpand",
  "do",
  "fn",
  "if",
  "while",
  "const",
  "let",
  "continue",
  "import",
];

const mapValues = (obj, fn) =>
  Object.keys(obj).reduce((acc, k) => {
    acc[k] = fn(obj[k], k, obj);
    return acc;
  }, {});

// Unquote takes a Lisp form and turns it into the compiler representation as a
// JavaScript object. Kind-of the opposite of compile.
// const quoteMacro = (form) => {
//   function simpleWrap(type, value) {
//     return { type: type, value: `${value}` };
//   }

//   function containerWrap(type, value) {
//     return {
//       type: type,
//       value: value.map((x) => quoteMacro(x)),
//     };
//   }

//   function objectWrap(type, value) {
//     return {
//       type: type,
//       value: mapValues(value, (x) => quoteMacro(x)),
//     };
//   }

//   let value = form.value[1].value;

//   //console.log({ typeof: value });
//   //console.log({ typeof: typeof value });

//   //console.log(typeof form == "object");

//   let rvalue = simpleWrap("Null", value);
//   if (typeof value === "string") {
//     rvalue = simpleWrap("String", value);
//   } else if (typeof value === "boolean") {
//     rvalue = simpleWrap("Boolean", value);
//   } else if (typeof value === "number") {
//     rvalue = simpleWrap("Number", value);
//   } else if (typeof value === "symbol") {
//     rvalue = simpleWrap(value);
//   } else if (typeof value === "keyword") {
//     rvalue = simpleWrap(value);
//   } else if (typeof value === "null") {
//     rvalue = simpleWrap("Null", value);
//   } else if (typeof value === "array") {
//     rvalue = containerWrap("Array", value);
//   } else if (typeof value === "object") {
//     rvalue = objectWrap("Object", value);
//   } else if (typeof value === "list") {
//     rvalue = containerWrap("List", value);
//   }

//   //console.log({ rvalue: rvalue });

//   return compile(rvalue)[0];
// };

// Unquote takes a Lisp form and turns it into the compiler representation as a
// JavaScript object. Kind-of the opposite of compile.
const quoteMacro = (form) => {
  // return {
  //   type: "Object",
  //   value: [
  //     { type: "Keyword", value: "type" },
  //     { type: "String", value: "Boolean" },
  //     { type: "Keyword", value: "value" },
  //     { type: "Boolean", value: false },
  //   ],
  // };

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

  function containerWrap(form) {
    const newForm = {
      type: form.type,
      value: form.value.map((x) => x),
    };

    return wrapper(newForm);
  }

  function objectWrap(form) {
    const pairs = form.value.reduce(function (result, _value, index, array) {
      if (index % 2 === 0) result.push(array.slice(index, index + 2));
      return result;
    }, []);

    const mappedValues = pairs.map(([k, v]) => [k, quoteMacro(v)]).flat();

    const newForm = {
      type: form.type,
      value: mappedValues,
    };

    return wrapper(newForm);
  }

  if (form.type === "String") {
    return wrapper(form);
  } else if (form.type === "Boolean") {
    return wrapper(form);
  } else if (form.type === "Number") {
    return wrapper(form);
  } else if (form.type === "Symbol") {
    return wrapper(form);
  } else if (form.type === "Keyword") {
    return wrapper(form);
  } else if (form.type === "Null") {
    return wrapper(form);
  } else if (form.type === "Array") {
    return containerWrap(form);
  } else if (form.type === "Object") {
    return objectWrap(form);
  } else if (form.type === "List") {
    return containerWrap(form);
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
  //console.log({ macro: macro, list: list, env: env });

  const args = list.value.slice(1);

  console.log({ macroArgs: args });

  const macroResult = macro(...args);

  console.log({ macroResult: macroResult });

  console.log({ compiledMacroResult: compile(macroResult, env) });

  return compile(macroResult, env);
};

const compileCall = (list, env) => {
  let first = list.value[0].value;

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

      return arg.value;
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
    .map(function (arg) {
      console.log(arg);
      console.log({ compiled: compile(arg, env) });
      return arg;
    })
    .map((x) => compile(x, env)[0])
    .map(function (arg) {
      console.log({ after: arg });
      return arg;
    })
    .map((x) => `\treturn ${x};\n`);

  /// Slam em together
  let body = [...rest, ...last].join(";\n");

  return [`(function(${args}) {\n${body}})`, env];
};

const compileSpecialForm = (form, env) => {
  let first = form.value[0].value;

  if (first == "const") {
    let second = form.value[1].value;
    let [third, newEnv] = compile(form.value[2], env);
    return [`const ${second} = ${third}`, newEnv];
  } else if (first == "fn") {
    return compileFunction(form, env);
  } else if (first == "if") {
    assert(form.value.length >= 3, "if form requires as least two arguments.");

    let conditional = compile(form.value[1], env)[0];
    let if_body = compile(form.value[2], env)[0];

    if (form.value[3]) {
      let else_body = compile(form.value[3]);
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
  } else if (first == "macro") {
    assert(
      form.value.length >= 3,
      "macro form requires a name, arguments, and a body."
    );

    const identifier = form.value[1].value;

    console.log({ macroBody: form.value[3].value });

    const [macroSource, newEnv] = compileFunction(form.value.slice(2), env);

    console.log({ macroSource: macroSource });

    env.macros[identifier] = eval(macroSource);

    return [``, env];
  } else if (first == "macroexpand") {
    //console.log({ form: form.value[1], env: env });

    //let [result, newEnv] = compile(form.value[1], env);

    //return [`${util.inspect(result)}`, newEnv];
    throw { error: "Unimplemented special form" };
  }
  // else if (first == "quote") {
  //   let second = form.value[1];

  //   return [`${quote(second)}`];

  //   //console.log({ form: form.value[1], env: env });

  //   //let [result, newEnv] = compile(form.value[1], env);

  //   //return [`${util.inspect(result)}`, newEnv];
  // }
  else {
    throw { error: "Unimplemented special form" };
  }
};

const compileList = (list, env) => {
  assert(list?.type === "List", `Got ${JSON.stringify(list)}`);

  if (list.value[0] != null) {
    if (list.value[0].type == "Symbol") {
      if (OPERATORS.includes(list.value[0].value)) {
        return compileOp(list, env);
      } else if (SPECIAL_FORMS.includes(list.value[0].value)) {
        return compileSpecialForm(list, env);
      } else {
        return compileCall(list, env);
      }
    } else {
      console.log(list.value[0].value);

      throw {
        error: `Expected a symbol when evaluating list, got ${list.value[0].type} instead.`,
      };
    }
  } else {
    throw { error: "Empty lists are not supported" };
  }
};

const compileArray = (array, env) => {
  assert(array?.type === "Array", `Got ${JSON.stringify(array)}`);

  console.log(array.value);

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
  return [symbol.value, env];
};

const compileString = (string, env) => {
  assert(string?.type === "String", `Got ${JSON.stringify(string)}`);
  return [`"${string.value}"`, env];
};

const compileObject = (object, env) => {
  assert(object?.type === "Object", `Got ${JSON.stringify(object)}`);

  //console.log(object.value);
  //console.log(object.value.length);

  if (object.value.length % 2 !== 0) {
    throw { error: "Objects require an even amount of arguments" };
  }

  const pairs = object.value.reduce(function (result, _value, index, array) {
    if (index % 2 === 0) result.push(array.slice(index, index + 2));
    return result;
  }, []);

  const inner = pairs
    .map(function ([key, value]) {
      assert(
        key?.type === "Keyword" ||
          key?.type === "Symbol" ||
          key?.type === "String",
        `Keys to objects need to be keywords, symbols, or strings. Got ${JSON.stringify(
          key?.type
        )} in ${JSON.stringify(object)}`
      );

      return `${key.value}: ${compile(value, env)[0]}`;
    })
    .join(", ");

  return [`{${inner}}`, env];
};

export const compile = (ast, env) => {
  console.log(ast);

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
  } else {
    return compileSymbol(ast, env);
  }
};

const isMacro = (form) => {
  return form.value[0].type == "Symbol" && form.value[0].value == "macro";
};

/// Compiles Macros into the environment.
// const expandMacros = (forms, env) => {
//   return [
//     forms.map(function (x) {
//       console.log({ env: env });

//       if (isMacro(x.value[0])) {
//         console.log({ macro: x.value[0] });

//         compile(forms);
//       }

//       //console.log({ first: x.value[0] });

//       return x;
//     }),
//     env,
//   ];
// };

export const defaultEnvironment = () => {
  return {
    macros: {
      quote: quoteMacro,
    },
  };
};

export const compileSource = (source, env) => {
  if (env === undefined) {
    env = defaultEnvironment();
  }

  let parseResult = manyFormsParser.run(source);

  //console.log(parseResult);

  if (!parseResult.isError) {
    let topLevelForms = parseResult.result;

    //let [expandedForms, _env] = expandMacros(topLevelForms, env);

    //console.log(expandedForms);

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

    const javaScript = result2.output.filter((x) => x != "").join(";\n");

    return [javaScript, env];
  } else {
    throw { error: parseResult };
  }
};
