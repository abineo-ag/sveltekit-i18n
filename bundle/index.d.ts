interface PluginOptions {
	/** The directory containing your JSON-Files */
	src: string;
	/** The directory to put the generated `index.ts` */
	out: string;
	/** The folder name inside the `out` directory to put the generated `<language>.ts` files */
	folder: string;
	/** The default type assigned to a parameter inside a resource string */
	defaultParamType: string;
	/** Create gitignore file */
	createGitignore: boolean;
	/** Create summary file in json format containing errors or missing translations */
	createSummary: boolean;
	/** The language that gets selected per default */
	defaultLanguage?: string;
}
export declare function plugin(opts?: Partial<PluginOptions>): {
	name: string;
	buildStart(): void;
	buildEnd(): void;
};
export default plugin;
