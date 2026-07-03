import { ConfigContext, ExpoConfig } from "expo/config";

/**
 * Dynamic Expo config. The static values live in app.json (passed in here as
 * `config`); this layer is the place to inject secrets from the environment so
 * that no API key is ever hard-coded into source control.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: config.name ?? "TemplateRN",
    slug: config.slug ?? "template-rn",
  };
};
