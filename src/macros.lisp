
;; (macro assert! [condition message]
;;     (quasiquote) 
;;     (if (! (unquote condition))
;;         (do 
;;             (throw (|| (unquote message) "Assertion failed"))
;;             0))) ; Return 0 as a workaround to not being able to throw from the return position.

(macro defn [name args ...body]
    "Define a function"
    ;(assert! (== name.type "Symbol") "defn name should be a symbol.")
    (console.log body)
    (quasiquote (const (unquote name) (fn (unquote args) (unquote ...body)))))


(defn bool? [x] 
  "Check if x is a boolean."
  (quasiquote (== (typeof (unquote x)) "boolean")))

(defn object? [x] 
  "Check if x is an object."
  (quasiquote (== (typeof (unquote x)) "object")))

(defn number? [x] 
  "Check if x is a number."
  (quasiquote (== (typeof (unquote x)) "number")))

(defn function? [x] 
  "Check if x is a function."
  (quasiquote (== (typeof (unquote x)) "function")))

(defn int? [x] 
  "Check if x is an integer."
  (quasiquote (Number.isInteger (unquote x))))

(defn float? [x] 
  "Check if x is a float."
  (quasiquote (! (int? (unquote x)))))

(defn array? [x] 
  "Check if x is an array."
  (quasiquote (Array.isArray (unquote x))))

(defn string? [x] 
  "Check if x is a string."
  (quasiquote (== (typeof (unquote x)) "string")))

(defn undefined? [x] 
  "Check if x is undefined."
  (quasiquote (== (typeof (unquote x)) "undefined")))



(javascript "export {
    bool_3f
}")