import { readdir, exists } from "node:fs/promises";

type GameMap = {
	folder: string;
	emulators?: Array<string>;
};

async function hasGameRegionsInformation(
	route: string,
	regions?: Array<string>,
) {
	if (!regions) {
		return {};
	}

	const regionsInformationState: Record<string, boolean> = {};

	await Promise.all(
		regions.map(async (region) => {
			const hasFolder = await exists(`${route}/${region}`);

			if (!hasFolder) {
				regionsInformationState[region] = hasFolder;
				return;
			}

			const hasRegionMetadataFile = await exists(
				`${route}/${region}/metadata.json`,
			);

			regionsInformationState[region] = hasRegionMetadataFile;
		}),
	);

	return regionsInformationState;
}

const EMULATORS = ["PCSX2", "RPCS3", "Dolphin", "Citra", "Yuzu", "PPSSPP"];

async function getEmulatorsListInFolder(route: string) {
	const results = await Promise.all(
		EMULATORS.map(async (emulator) => {
			const hasEmulatorFile = await exists(`${route}/${emulator}.json`);
			return hasEmulatorFile ? emulator : null;
		}),
	);

	const emulatorsListInFolder = results.filter(
		(emulator) => emulator !== null,
	) as string[];

	if (emulatorsListInFolder.length === 0) {
		return undefined;
	}

	return emulatorsListInFolder.sort();
}

(async () => {
	try {
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

			const gamesData: Array<{ gameName: string; gameMap: GameMap }> = [];

			await Promise.all(
				gamesFoldersList.map(async (gameFolder) => {
					if (!gameFolder.isDirectory()) {
						return;
					}

					const { path: gameFolderPath, name: gameFolderName } = gameFolder;
					const gameFolderRoute = `${gameFolderPath}/${gameFolderName}`;

					try {
						const gameMetadata = await Bun.file(
							`${gameFolderRoute}/metadata.json`,
						).json();

						const { name: gameName } = gameMetadata;

						const [regionInformation, emulatorsListInFolder] =
							await Promise.all([
								hasGameRegionsInformation(
									gameFolderRoute,
									gameMetadata?.regions,
								),
								getEmulatorsListInFolder(gameFolderRoute),
							]);

						const sortedRegionInformation = Object.keys(regionInformation)
							.sort()
							.reduce((acc, key) => {
								acc[key] = regionInformation[key];
								return acc;
							}, {} as Record<string, boolean>);

					const gameMap = {
						folder: gameFolder.name,
						...(emulatorsListInFolder ? { emulators: emulatorsListInFolder } : {}),
						...sortedRegionInformation,
					} as GameMap;

						gamesData.push({
							gameName,
							gameMap,
						});
					} catch (error) {
						console.error(
							`Error processing ${gameFolderRoute}/metadata.json:`,
							error instanceof Error ? error.message : error,
						);
					}
				}),
			);

			gamesData.sort((a, b) => {
				// Primary sort: case-insensitive, locale-aware
				const primaryCompare = a.gameName.localeCompare(b.gameName, undefined, { sensitivity: 'base' });

				if (primaryCompare !== 0) {
					return primaryCompare;
				}

				// Secondary sort: case-sensitive for stable ordering when names differ only in case
				return a.gameName.localeCompare(b.gameName);
			});

			for (const { gameName, gameMap } of gamesData) {
				platforms[name][gameName] = gameMap;
			}

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

			console.log(`✓ Generated map for ${name} (${Object.keys(platforms[name]).length} games)`);
		}

		console.log("\n✅ All platform maps generated successfully!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Fatal error:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
})();
