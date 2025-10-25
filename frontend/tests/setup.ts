import { vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import yaml from "js-yaml";
import { UIConfig } from "../src/config/configLoader";

// Load the actual YAML file from disk
const yamlFilePath = resolve(__dirname, "../src/config/uiConfig.yaml");
const yamlContent = readFileSync(yamlFilePath, "utf-8");
const loadedConfig = yaml.load(yamlContent) as UIConfig;

// Mock the YAML import to return the actual file content
vi.mock("../src/config/uiConfig.yaml?raw", () => ({
  default: yamlContent,
}));

// Mock the configLoader module to use the loaded config
vi.mock("../src/config/configLoader", () => ({
  configReady: Promise.resolve(loadedConfig),
  getConfig: () => loadedConfig,
}));
