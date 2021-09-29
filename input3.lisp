(macro undefined? [x] 
  "Check if x is undefined."
  (quasiquote (== (typeof (unquote x)) "undefined")))


(undefined? 42)