import Ajv from "ajv/dist/2020";
import { readdir } from "node:fs/promises";
import addFormats from "ajv-formats";

const ajv = new Ajv();
addFormats(ajv);

(async () => {
	try {
		const metadataScheme = await Bun.file(
			"./shared/metadata_schema.json",
		).json();

		const schema = metadataScheme;
		const validate = ajv.compile(schema);
		let errorsCount = 0;

		const platformsList = await readdir("./platforms", { withFileTypes: true });

		for (const platform of platformsList) {
			if (!platform.isDirectory()) {
				continue;
			}

			const { path, name } = platform;

			const gamesFoldersList = await readdir(`${path}/${name}`, {
				withFileTypes: true,
			});

			const results = await Promise.all(
				gamesFoldersList.map(async (gameFolder) => {
					if (!gameFolder.isDirectory()) {
						return { valid: true, errors: null, path: "" };
					}

					const { path: gameFolderPath, name: gameFolderName } = gameFolder;
					const gameFolderRoute = `${gameFolderPath}/${gameFolderName}`;

					try {
						const gameMetadata = await Bun.file(
							`${gameFolderRoute}/metadata.json`,
						).json();

						const valid = validate(gameMetadata);

						return {
							valid,
							errors: validate.errors,
							path: gameFolderRoute,
						};
					} catch (error) {
						return {
							valid: false,
							errors: [
								{
									message:
										error instanceof Error
											? error.message
											: "Unknown error reading metadata",
								},
							],
							path: gameFolderRoute,
						};
					}
				}),
			);

			for (const result of results) {
				if (!result.valid) {
					console.error(`\n❌ Validation error in ${result.path}:`);
					console.error(JSON.stringify(result.errors, null, 2));
					errorsCount += 1;
				}
			}

			console.log(
				`✓ Validated ${name} (${gamesFoldersList.length} games, ${results.filter((r) => !r.valid).length} errors)`,
			);
		}

		if (errorsCount > 0) {
			console.error(
				`\n❌ Validation failed with ${errorsCount} error(s)`,
			);
			process.exit(1);
		}

		console.log("\n✅ All metadata validated successfully!");
		process.exit(0);
	} catch (error) {
		console.error(
			"❌ Fatal error:",
			error instanceof Error ? error.message : error,
		);
		process.exit(1);
	}
})();
