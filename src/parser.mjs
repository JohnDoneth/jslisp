import {
  choice,
  sequenceOf,
  char,
  digits,
  whitespace,
  str,
  many,
  many1,
  between,
  anythingExcept,
  anyCharExcept,
  recursiveParser,
} from "arcsecond";

const makeBasicType = (typeName) => (value) => ({
  type: typeName,
  value,
});

const makeMultiType = (typeName) => (values) => ({
  type: typeName,
  value: values,
});

// Types

const stringType = makeBasicType("String");
const numberType = makeBasicType("Number");
const booleanType = makeBasicType("Boolean");
const symbolType = makeBasicType("Symbol");
const keywordType = makeBasicType("Keyword");

const nullType = makeBasicType("Null");

const arrayType = makeMultiType("Array");
const objectType = makeMultiType("Object");
const listType = makeMultiType("List");

// Utility Parser Combinators

const betweenQuotes = between(char('"'))(char('"'));
const joinedMany = (parser) => many(parser).map((x) => x.join(""));
const joinedMany1 = (parser) => many1(parser).map((x) => x.join(""));

const betweenSquareBrackets = between(char("["))(char("]"));
const betweenCurlyBrackets = between(char("{"))(char("}"));
const betweenParens = between(char("("))(char(")"));

const newline = choice([char("\n"), str("\r\n")]);
const commentParser = sequenceOf([char(";"), many(anythingExcept(newline))]);

const whitespaceAndLines = many(choice([commentParser, whitespace, newline]));

const whitespaceSurrounded = between(whitespaceAndLines)(whitespaceAndLines);

// Exported Parsers

export const booleanParser = choice([str("true"), str("false")])
  .map((x) => x === "true")
  .map(booleanType);

export const keywordParser = sequenceOf([
  char(":"),
  joinedMany1(
    anyCharExcept(
      choice([whitespace, char(";"), char(")"), char("]"), char("}")])
    )
  ),
])
  .map((x) => x[1])
  .map(keywordType);

export const symbolParser = joinedMany1(
  anyCharExcept(
    choice([whitespace, char(";"), char(")"), char("]"), char("}")])
  )
).map(symbolType);

export const nullParser = str("null")
  .map((_) => null)
  .map(nullType);

export const numberParser = many1(digits).map((x) => numberType(Number(x)));

export const stringParser = betweenQuotes(
  joinedMany(anyCharExcept(char('"')))
).map(stringType);

export const formParser = recursiveParser(() =>
  whitespaceSurrounded(
    choice([
      booleanParser,
      nullParser,
      numberParser,
      stringParser,
      arrayParser,
      objectParser,
      listParser,
      keywordParser,
      symbolParser,
    ])
  )
);

export const manyFormsParser = many(formParser);

export const listParser = betweenParens(
  many(whitespaceSurrounded(formParser))
).map(listType);

export const arrayParser = betweenSquareBrackets(
  many(whitespaceSurrounded(formParser))
).map(arrayType);

export const objectParser = betweenCurlyBrackets(
  many(whitespaceSurrounded(formParser))
).map(objectType);
