import { formParser } from "./parser.mjs";

export const compile = (source) => {
  let ast = formParser.run(source);

  if (ast.result.type == "List") {
    if (ast.result.value[0].type == "Symbol") {
      let rest = ast.result.value
        .slice(1)
        .map((x) => x.value)
        .join(", ");

      //console.log(`${ast.result.value[0].value}(${rest})`);

      return `${ast.result.value[0].value}(${rest})`;

      //eval(`${ast.result.value[0].value}(${rest})`);
    }
  }
};
