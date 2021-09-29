const mangleChar = (char) => {
  if (/[a-zA-Z0-9_.]/.test(char)) {
    return char;
  } else if (char == "-") {
    return "_";
  } else {
    return "_" + char.charCodeAt(0).toString(16);
  }
};

const unmangleChar = (char) => {
  console.log(char);

  if (/[a-zA-Z0-9.]/.test(char)) {
    return char;
  } else if (char == "_") {
    return "-";
  }
};

const mangle = (symbol) => {
  //symbol = symbol.replace("-", "_");

  symbol = Array.from(symbol).reduce(function (acc, char) {
    return acc + mangleChar(char);
  }, "");

  return symbol;
};

const unmangle = (symbol) => {
  let x = "";
  let chars = Array.from(symbol);

  for (let index = 0; index < chars.length; index++) {
    const char = chars[index];

    if (char == "_" && chars[index + 1] != "_") {
      let chomp = chars[index + 1];
      while (chars[index + 1] != "_" && chars[index + 1]) {
        index += 1;
        chomp = chomp + chars[index + 1];
      }

      return x + String.fromCharCode(parseInt(chomp, 16));
    } else {
      x = x + unmangleChar(char);
    }
  }

  return x;
};

export { mangle, unmangle };
