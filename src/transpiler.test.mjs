import test from "ava";

import { compile } from "./transpiler.mjs";

test("transpiler - function calls", (t) => {
  const result = compile("(console.log 42)");

  console.log(result);

  t.is(result, "console.log(42)");
});

test("transpiler", (t) => {
  const result = compile("(console.log 2 4)");

  t.is(result, "console.log(2, 4)");
});
