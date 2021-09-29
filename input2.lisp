

(macro javascript [x] 
    {:type "JavaScript" :value x.value})
    
(javascript "export { hello };")