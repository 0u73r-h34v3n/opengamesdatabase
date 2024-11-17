import Ajv from "ajv/dist/2020";
import { readdir } from "node:fs/promises";

const ajv = new Ajv();

(async () => {
	const metadataScheme = await Bun.file("./shared/metadata_schema.json").json();

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

		for (const gameFolder of gamesFoldersList) {
			if (!gameFolder.isDirectory()) {
				continue;
			}

			const { path: gameFolderPath, name: gameFolderName } = gameFolder;
			const gameFolderRoute = `${gameFolderPath}/${gameFolderName}`;

			const gameMetadata = await Bun.file(
				`${gameFolderRoute}/metadata.json`,
			).json();

			const valid = validate(gameMetadata);

			if (!valid) {
				console.log(validate.errors, gameFolderRoute);

				errorsCount += 1;
			}
		}
	}

	console.log(errorsCount);
})();
