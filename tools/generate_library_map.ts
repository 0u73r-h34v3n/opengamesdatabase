import { readdir, exists } from "node:fs/promises";

type GameMap = {
	folder: string;
};

async function hasGameRegionsInformation(
	route: string,
	regions?: Array<string>,
) {
	if (!regions) {
		return {};
	}

	const regionsInformationState: Record<string, boolean> = {};

	for (const region of regions) {
		const hasFolder = await exists(`${route}/${region}`);

		if (!hasFolder) {
			regionsInformationState[region] = hasFolder;

			continue;
		}

		const hasRegionMetadataFile = await exists(
			`${route}/${region}/metadata.json`,
		);

		regionsInformationState[region] = hasRegionMetadataFile;
	}

	return regionsInformationState;
}

(async () => {
	const platformsList = await readdir("./platforms", { withFileTypes: true });
	const platforms: Record<string, Record<string, GameMap>> = {};

	for (const platform of platformsList) {
		if (!platform.isDirectory()) {
			continue;
		}

		const { path, name } = platform;

		if (!platforms[name]) {
			platforms[name] = {};
		}

		const gamesFoldersList = await readdir(`${path}/${name}`, {
			withFileTypes: true,
		});

		const sortedGamesFoldersList = gamesFoldersList.sort((a, b) =>
			a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
		);

		for (const gameFolder of sortedGamesFoldersList) {
			if (!gameFolder.isDirectory()) {
				continue;
			}

			const { path: gameFolderPath, name: gameFolderName } = gameFolder;
			const gameFolderRoute = `${gameFolderPath}/${gameFolderName}`;

			const gameMetadata = await Bun.file(
				`${gameFolderRoute}/metadata.json`,
			).json();

			const { name: gameName } = gameMetadata;

			const regionInformation = await hasGameRegionsInformation(
				gameFolderRoute,
				gameMetadata?.regions,
			);

			platforms[name][gameName] = {
				folder: gameFolder.name,
				...regionInformation,
			};
		}

		console.log(Object.keys(platforms), platform);

		if (!platforms[name]) {
			continue;
		}

		if (Object.keys(platforms[name]).length === 0) {
			continue;
		}

		await Bun.write(
			`./platforms/${name}/map.json`,
			JSON.stringify(platforms[name], null, 2),
		);
	}
})();
