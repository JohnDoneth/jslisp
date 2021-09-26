# Language Guide

## Types

Supports all of JavaScript's types as well as some other types that only exist
at compile time.

### Number

```clojure
42
1.0
```

### String

Strings are represented just like in JavaScript, as characters between quotes.

```clojure
"String"
```

### Symbol

```clojure
symbol
```

### Keyword

Keywords are represented by strings prefixed by colons.

```clojure
:keyword
```

### Object

Objects are represented as pairs of keys and values. Keys can be strings or
keywords. Values can be any other value.

```clojure
{:a 1 :b 2}

; Expressions can be used as values.
{:a 1 :b (+ 2 2)}

; Keys can be strings
{"key" "value"}
```

## Assignment

### Const

```clojure
(const x 42)
```

## Conditional Logic

### If (expression)

If expressions are like if-statments in JavaScript, except they are expressions
so they resolve to the value of the true or false branch instead of `undefined`.

```clojure
(if conditional
    "conditional is truthy"
    "conditional is falsy")
```

```clojure
(if true
    "conditional was truthy"
    "conditional was falsy")

; "conditional was truthy"
```

```clojure
(if false
    "conditional was truthy"
    "conditional was falsy")

; "conditional was falsy"
```

### Case Expressions

Case expressions are similar to if-expressions but should be used when there are multiple cases rather than just one.

```clojure
(const z 42)

(case z
    1 "one!"
    2 "two!"
    42 "fourty-two!")

; "fourty-two!"
```

When the dispatch value does not match any of the pairs, `null` is returned.

```clojure
(const z -1)

(case z
    1 "one!"
    2 "two!"
    42 "fourty-two!")

; null
```

## Macros

Macros are functions that take forms as input and return forms in their place. They are evaluated at compile-time.

```clojure
(macro odd? [x]
  (quasiquote (% x 2)))

(odd? 42)

; Number.isInteger(42)
```

Using `quasiquote` and `unquote`, we can transform the input form into a different form without
working directly with the compiler representation. The unquoted parts are
interpolated into the result "as-is".

```clojure
(macro int? [x]
  "Check if x is an integer."
  (quasiquote (Number.isInteger (unquote x))))

(int? 42)

; Number.isInteger(42)
```
