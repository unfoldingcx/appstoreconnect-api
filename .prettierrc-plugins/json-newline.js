// .prettierrc-plugins/json-newline.js
module.exports = {
  languages: [
    {
      name: "json",
      parsers: ["json"],
    },
  ],
  parsers: {
    json: {
      parse: require("prettier/parser-babel").parsers.json,
      astFormat: "json",
      // Keep default loc
    },
  },
  printers: {
    json: {
      print(path, options, print) {
        const node = path.getValue();

        // Only modify object nodes
        if (node.type === "Object") {
          const parts = [];

          // Force opening { on new line
          parts.push("{", options.originalText.includes("\n") ? "\n" : options.originalText.match(/^\s*/)?.[0] || "");

          path.each((childPath, i, arr) => {
            const child = childPath.getValue();
            const isLast = i === arr.length - 1;

            // Print key
            parts.push(print(childPath));

            // Add comma + newline (except last)
            if (!isLast) {
              parts.push(",", "\n");
            } else if (options.trailingComma === "es5") {
              parts.push(",");
            }
          });

          // Closing } on new line
          parts.push("\n", "}");

          return parts;
        }

        // For arrays: force multiline
        if (node.type === "Array") {
          if (node.elements.length === 0) return "[]";

          const parts = ["[\n"];
          path.each((childPath, i) => {
            parts.push("  ", print(childPath));
            if (i < node.elements.length - 1) parts.push(",");
            parts.push("\n");
          });
          parts.push("]");
          return parts;
        }

        // Fallback to default printer
        return require("prettier/parser-babel").printers.json.print(path, options, print);
      },
    },
  },
};