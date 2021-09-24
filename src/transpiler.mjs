import { manyFormsParser } from "./parser.mjs";
import assert from "assert";

// Operators reserved by the compiler.
const OPERATORS = ["+", "-", "*", "/", "==", "===", "<", "<=", ">", ">="];

// Forms reserved by the compiler.
const SPECIAL_FORMS = [
  "do",
  "fn",
  "if",
  "while",
  "const",
  "let",
  "continue",
  "import",
];

const compileOp = (list) => {
  let operation = list.value
    .slice(1)
    .map((x) => compile(x))
    .join(` ${list.value[0].value} `);

  return `(${operation})`;
};

const compileCall = (list) => {
  let first = list.value[0].value;

  let rest = list.value
    .slice(1)
    .map((x) => compile(x))
    .join(", ");

  return `${first}(${rest})`;
};

const compileSpecialForm = (form) => {
  let first = form.value[0].value;

  if (first == "const") {
    let second = form.value[1].value;
    let third = compile(form.value[2]);
    return `const ${second} = ${third}`;
  } else if (first == "fn") {
    let args = form.value[1].value;

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
    let rest = form.value
      .slice(2, -1)
      .map((x) => compile(x))
      .map((x) => `\t${x}`); // indent

    // Last expression in the body needs to "return".
    let last = form.value
      .slice(-1)
      .map((x) => compile(x))
      .map((x) => `\treturn ${x};\n`);

    /// Slam em together
    let body = [...rest, ...last].join(";\n");

    return `(function(${args}) {\n${body}})`;
  } else if (first == "if") {
    assert(form.value.length >= 3, "if form requires as least two arguments.");

    let conditional = compile(form.value[1]);
    let if_body = compile(form.value[2]);

    if (form.value[3]) {
      let else_body = compile(form.value[3]);
      return `(function(){ if (${conditional}) { \n\treturn ${if_body};\n} else { \n\treturn ${else_body};\n}})()`;
    } else {
      return `(function(){ if (${conditional}) { \n\treturn ${if_body};\n}})()`;
    }
  } else if (first == "do") {
    let rest = form.value
      .slice(1, -1)
      .map((x) => compile(x))
      .map((x) => `\n\t${x}`); // indent

    // Last expression in the body needs to "return".
    let last = form.value
      .slice(-1)
      .map((x) => compile(x))
      .map((x) => `\n\treturn ${x}`);

    let body = [...rest, ...last].join(";");

    return `(function (){ ${body}\n })()`;
  } else if (first == "import") {
    let rest = form.value
      .slice(1, -1)
      .map((x) => compile(x))
      .map((x) => `\n\t${x}`); // indent

    // Last expression in the body needs to "return".
    let last = form.value
      .slice(-1)
      .map((x) => compile(x))
      .map((x) => `\n\treturn ${x}`);

    let body = [...rest, ...last].join(";");

    return `(function (){ ${body}\n })()`;
  } else {
    throw { error: "Unimplemented special form" };
  }
};

const compileList = (list) => {
  assert(list?.type === "List", `Got ${JSON.stringify(list)}`);

  if (list.value[0] != null) {
    if (list.value[0].type == "Symbol") {
      if (OPERATORS.includes(list.value[0].value)) {
        return compileOp(list);
      } else if (SPECIAL_FORMS.includes(list.value[0].value)) {
        return compileSpecialForm(list);
      } else {
        return compileCall(list);
      }
    } else {
      throw { error: "Expected a symbol when evaluating list" };
    }
  } else {
    throw { error: "Empty lists are not supported" };
  }
};

const compileNumber = (number) => {
  assert(number?.type === "Number", `Got ${JSON.stringify(number)}`);
  return number.value;
};

const compileSymbol = (symbol) => {
  assert(symbol?.type === "Symbol", `Got ${JSON.stringify(symbol)}`);
  return symbol.value;
};

const compileString = (string) => {
  assert(string?.type === "String", `Got ${JSON.stringify(string)}`);
  return `"${string.value}"`;
};

const compileObject = (object) => {
  assert(object?.type === "Object", `Got ${JSON.stringify(object)}`);

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
          object
        )}`
      );

      return `${key.value}: ${compile(value)}`;
    })
    .join(", ");

  return `{${inner}}`;
};

export const compile = (ast) => {
  console.log(ast);

  if (ast?.type === "List") {
    return compileList(ast);
  } else if (ast?.type === "Number") {
    return compileNumber(ast);
  } else if (ast?.type === "String") {
    return compileString(ast);
  } else if (ast?.type === "Object") {
    return compileObject(ast);
  } else {
    return compileSymbol(ast);
  }
};

export const compileSource = (source) => {
  let parseResult = manyFormsParser.run(source);

  console.log(parseResult);

  if (!parseResult.isError) {
    let topLevelForms = parseResult.result;

    console.log(topLevelForms);

    let result = topLevelForms.map((x) => compile(x)).join(";\n");

    console.log(result);

    return result;
  } else {
    throw { error: parseResult };
  }
};
