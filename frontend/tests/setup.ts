import { vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import yaml from "js-yaml";
import { UIConfig } from "../src/config/configLoader";
import React from "react";

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

// Mock the Altcha component to avoid loading the actual altcha library
vi.mock('../src/components/Altcha', () => {
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      // Immediately trigger verification in tests
      React.useEffect(() => {
        if (props.onStateChange) {
          const event = new CustomEvent('statechange', {
            detail: {
              state: 'verified',
              payload: 'test-altcha-payload'
            }
          });
          props.onStateChange(event);
        }
      }, [props]);
      
      return React.createElement('div', { 'data-testid': 'altcha-mock' });
    }),
  };
});
