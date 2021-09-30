import test from "ava";

import { mangle, unmangle } from "./mangle.mjs";

test("mangle", (t) => {
  t.is(mangle("abc123"), "abc123");

  t.is(mangle("?"), "_3f");
  t.is(mangle("!"), "_21");
  t.is(mangle("^"), "_5e");
  t.is(mangle("&"), "_26");
  t.is(mangle("$"), "_24");
  t.is(mangle("#"), "_23");
  t.is(mangle("-%"), "__25");
  t.is(mangle("♡"), "_2661");
  t.is(mangle("test-macro"), "test_macro")
});

test("unmangle", (t) => {
  // t.is(unmangle("abc123"), "abc123");

  // t.is(unmangle("_3f"), "?");
  // t.is(unmangle("_21"), "!");
  // t.is(unmangle("_5e"), "^");
  // t.is(unmangle("_26"), "&");
  // t.is(unmangle("_24"), "$");
  // t.is(unmangle("_23"), "#");
  // t.is(unmangle("__25"), "-%");
  // t.is(unmangle("_2661"), "♡");
  t.is(unmangle("test_macro"), "test-macro")

  // Check Fennel for reference 
  // https://github.com/bakpakin/Fennel/blob/9913298fb5990e68f93f6e34f9388f4cd37cd32e/src/fennel/compiler.fnl
});
