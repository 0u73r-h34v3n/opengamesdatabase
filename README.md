# Open Games Database

Open Games Database is an open-source project designed to collect and store comprehensive video game information in a structured, accessible format. The database includes metadata for games across multiple platforms, making it easy to integrate gaming information into your projects.

## 🎮 Platforms Supported

- **[3DS](platforms/3DS)** - Nintendo 3DS games from [GameTDB/3DS](https://www.gametdb.com/3DS)
- **[DS](platforms/DS)** - Nintendo DS games from [GameTDB/DS](https://www.gametdb.com/DS)
- **[PS2](platforms/PS2)** - PlayStation 2 games from [PCSX2 Wiki](https://wiki.pcsx2.net/Main_Page)
- **PC** - PC games (in progress)
- **PS1** - PlayStation 1 games (in progress)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/0u73r-h34v3n/opengamesdatabase.git
cd opengamesdatabase

# Install dependencies
bun install
```

## 🚀 Usage

### Validate Game Metadata

```bash
# Validate all game metadata against the schema
bun run validate
```

### Generate Library Maps

```bash
# Generate map.json files for all platforms
bun run generate
```

### Lint and Format

```bash
# Check code quality
bun run lint

# Auto-fix linting issues
bun run lint:fix

# Format code
bun run format
```

## 📁 Project Structure

```
opengamesdatabase/
├── platforms/           # Game data organized by platform
│   ├── 3DS/
│   │   ├── map.json     # Generated index of all games
│   │   └── {Game Name}/
│   │       ├── metadata.json             # Game metadata
│   │       └── {Emulator Name}.json      # Emulator compatibility (optional)
│   ├── DS/
│   ├── PS2/
│   └── ...
```

## 📝 Metadata Schema

Each game requires a `metadata.json` file with at minimum:

```json
{
  "$schema": "https://raw.githubusercontent.com/0u73r-h34v3n/opengamesdatabase/refs/heads/master/shared/metadata_schema.json",
  "name": "Game Title"
}
```


### Available Fields

- **Required**: `name`
- **Optional**: `acronyms`, `aliases`, `developers`, `publishers`, `franchise`, `genres`, `locales`, `regions`, `release_date`, `synopsis`, `ratings`, `reviews`, `serial_number`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to:

- Add new games
- Update existing game information
- Improve the schema
- Fix bugs

## 📊 Data Sources

- [GameTDB](https://www.gametdb.com/) - Nintendo 3DS and DS games
- [PCSX2 Wiki](https://wiki.pcsx2.net/) - PlayStation 2 games
- Community contributions

## 📜 License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- GameTDB for providing comprehensive game databases
- PCSX2 team for their extensive game compatibility documentation
- All contributors who help maintain and expand this database

