import commander from "commander";
import readline from "readline";
import fs from "fs";
import { compileSource, defaultEnvironment } from "./transpiler.mjs";

const program = new commander.Command();

program
  .option(
    "-o, --output <file>",
    "output JavaScript to a file instead of evaluating it."
  )
  .option(
    "-r, --repl",
    "start a repl even if there is a file being used as input."
  );

program.parse(process.argv);

const options = program.opts();

console.log(program);

let env = defaultEnvironment();

if (program.args.length != 0) {
  let file = program.args[0];

  try {
    const data = fs.readFileSync(file, "utf8");

    let [javaScript, newEnv] = compileSource(data, env);
    env = newEnv;

    if (options.output) {
      fs.writeFileSync(options.output, javaScript);
    } else {
      console.log(`JS:\n${javaScript}`);

      console.log(eval(javaScript));
    }
  } catch (err) {
    console.error(err);
  }
}

if (program.args.length == 0 || options.repl) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  rl.prompt();

  rl.on("line", (line) => {
    let [compileResult, newEnv] = compileSource(line, env);
    env = newEnv;

    console.log(`JS:\n${compileResult}`);

    if (compileResult) {
      try {
        console.log(eval(compileResult));
      } catch (e) {
        console.error(
          `Invalid JavaScript generated. Error during evaluation: ${e}`
        );
      }
    }

    rl.prompt();
  }).on("close", () => {
    console.log("Bye!");
    process.exit(0);
  });
}
