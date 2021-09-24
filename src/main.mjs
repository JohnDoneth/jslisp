import commander from "commander";
import readline from "readline";
import fs from "fs";
import { formParser } from "./parser.mjs";
import { compileSource } from "./transpiler.mjs";

const program = new commander.Command();

program.option(
  "-o, --output <file>",
  "output JavaScript to a file instead of evaluating it."
);

program.parse(process.argv);

const options = program.opts();

//console.log(program);

if (program.args == []) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  rl.prompt();

  rl.on("line", (line) => {
    let compileResult = compileSource(line);

    console.log(`JS:\n${compileResult}`);

    if (compileResult) {
      console.log(eval(compileResult));
    }

    rl.prompt();
  }).on("close", () => {
    console.log("Bye!");
    process.exit(0);
  });
} else {
  let file = program.args[0];

  try {
    const data = fs.readFileSync(file, "utf8");

    let javaScript = compileSource(data);

    if (options.output) {
      fs.writeFileSync(options.output, javaScript);
    } else {
      console.log(eval(javaScript));
    }
  } catch (err) {
    console.error(err);
  }
}
