import { vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import yaml from "js-yaml";
import { UIConfig } from "../src/config/configLoader";

// Load the actual YAML file from disk (via symlink in frontend directory)
const yamlFilePath = resolve(__dirname, "../app-config.yaml");
const yamlContent = readFileSync(yamlFilePath, "utf-8");
const loadedConfig = yaml.load(yamlContent) as UIConfig;

// Mock the YAML import to return the actual file content
vi.mock("../../app-config.yaml?raw", () => ({
  default: yamlContent,
}));

// Mock the configLoader module to use the loaded config
vi.mock("../src/config/configLoader", () => ({
  configReady: Promise.resolve(loadedConfig),
  getConfig: () => loadedConfig,
}));
