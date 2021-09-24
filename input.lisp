
; import commander from "commander";
;; (import commander :from "commander")

;; (import [formParser] :from "./parser.mjs")

;; (import [formParser :as alias2] :from "./parser.mjs")

;; (import * :from "./parser.mjs")


(const x 42)

(if (== x 43)
    (+ 2 2)
    (do 
        (console.log 1)
        (console.log (+ 1 1))
        (console.log 3)
        42))

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
 