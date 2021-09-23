// import commander from "commander";
import readline from "readline";
import { formParser } from "./parser.mjs";
import { transpile } from "./transpiler.mjs";

// const program = new commander.Command();

// program
//   .option("-d, --debug", "output extra debugging")
//   .option("-s, --small", "small pizza size")
//   .option("-p, --pizza-type <type>", "flavour of pizza");

// program.parse(process.argv);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "OHAI> ",
});

rl.prompt();

rl.on("line", (line) => {
  console.log(formParser.run(line).result);

  transpile(formParser.run(line));

  rl.prompt();
}).on("close", () => {
  console.log("Bye!");
  process.exit(0);
});
