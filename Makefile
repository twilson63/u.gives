dev:
	@deno run --allow-read --allow-env --allow-net --import-map import_map.json src/server.js

build:
	@cd app && yarn && yarn build