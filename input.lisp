
;; (const x1 (quote 2))
;; (const x2 (quote false))
;; (const x3 (quote symbol))
;; ;; ;(const x (quote :keyword))
;; (const x4 (quote "string"))

;; (const x5 (quote [1 2]))

;; (const x6 (quote {a 2 b 2}))

;; (const x7 (quote (console.log)))

;; (const x8 (quote (Number.isInteger type.value)))

; import commander from "commander";
;; (import commander :from "commander")

;; (import [formParser] :from "./parser.mjs")

;; (import [formParser :as alias2] :from "./parser.mjs")

;; (import * :from "./parser.mjs")

;; (macro int? [type]
;;     {
;;      :type "Boolean"
;;      :value (Number.isInteger type)})

;(const x (quote (Number.isInteger 42)))


(macro bool? [x] 
  "Check if x is a boolean."
  (quasiquote (== (typeof (unquote x)) "boolean")))

(macro object? [x] 
  "Check if x is an object."
  (quasiquote (== (typeof (unquote x)) "object")))

(macro number? [x] 
  "Check if x is a number."
  (quasiquote (== (typeof (unquote x)) "number")))

(macro function? [x] 
  "Check if x is a function."
  (quasiquote (== (typeof (unquote x)) "function")))

(macro int? [x] 
  "Check if x is an integer."
  (quasiquote (Number.isInteger (unquote x))))

(macro float? [x] 
  "Check if x is a float."
  (quasiquote (! (int? (unquote x)))))

(macro array? [x] 
  "Check if x is an array."
  (quasiquote (Array.isArray (unquote x))))

(macro string? [x] 
  "Check if x is a string."
  (quasiquote (== (typeof (unquote x)) "string")))

(macro defn [name args body]
    "Define a function"
    (quasiquote (const (unquote name) (fn (unquote args) (unquote body)))))

(defn log [x] 
    (console.log x) 
    (console.log x))


(log (string? "hello"))
(log (string? {:a "2"}))


;(const x (fn [a b & rest] 42))
 

;; (== (int? 42) false)

;(quote "hello")

;(const x (quote {"a" "b" "c" "d"}))

;(quote (+ 2 2))

;(macro int? [type] {:type "Boolean" :value (Number.isInteger type)})

;(macroexpand (int? 42))

;; (console.log (int? "a"))
;; (console.log (int? 42))


;; (const x 42)

;; (if (== x 43)
;;     (+ 2 2)
;;     (do 
;;         (console.log 1)
;;         (console.log (+ 1 1))
;;         (console.log 3)
;;         42))

;; (if (== x 42) 
;;     (+ 2 2))
       
;; (if (== x 43) 
;;     (+ 2 2) 5)

; This is a comment
;; (const func (fn [a b] (+ 2 2) (+ a b)))

;; ; Say hello!
;; (console.log "Hello, world!")

;; ; Test
;; (func 2 2)
 