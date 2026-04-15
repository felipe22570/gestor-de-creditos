import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
	...coreWebVitals,
	...typescript,
	{
		ignores: [".next/", "node_modules/", "public/", ".agents/"],
	},
	{
		// TanStack Table v8 is not compatible with React Compiler by design.
		// useReactTable() returns functions with changing identity on each render,
		// which React Compiler cannot safely memoize. This is expected behavior —
		// the "use no memo" directive in each table component opts them out.
		// This can be revisited when TanStack Table v9 (stable) is released.
		rules: {
			"react-hooks/incompatible-library": "off",
		},
	},
];

export default eslintConfig;
