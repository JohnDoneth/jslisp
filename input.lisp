
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
;;      :value (Number.isInteger type.value)})

;(const x (quote (Number.isInteger 42)))

(macro int? [type] 
  {type "Boolean" value (Number.isInteger type.value)})

(macro int? [type] 
  (const value (Number.isInteger type.value))
  (quote (Number.isInteger (unquote type.value))))


(console.log (int? "a"))
(console.log (int? 42))

(const log (fn [x] (console.log x)))

(log 42)
(log {"a" 2})

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
 