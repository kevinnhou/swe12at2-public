import antfu from "@antfu/eslint-config";
import perfectionist from "eslint-plugin-perfectionist";

export default antfu({
  rules: {
    "import/order": "off",
    ...perfectionist.configs["recommended-natural"].rules,
  },
  stylistic: {
    indent: 2,
    quotes: "double",
  },
});
