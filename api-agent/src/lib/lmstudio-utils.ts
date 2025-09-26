/**
 * LMStudio utility functions for model management
 */

import { config } from "./config";

export class LMStudioUtils {
  private static get MODEL_NAME(): string {
    return config.llm.model.name;
  }

  private static get BASE_URL(): string {
    return config.llm.lmstudio.baseUrl;
  }

  /**
   * Ensures the specific model is loaded in LMStudio
   * If multiple models are running, this will target the specific model
   */
  static async ensureModelLoaded(): Promise<boolean> {
    try {
      // Check if model is already loaded
      const modelsResponse = await fetch(
        `${this.BASE_URL}${config.llm.lmstudio.endpoints.models}`
      );
      if (!modelsResponse.ok) {
        console.warn("Could not connect to LMStudio API");
        return false;
      }

      const models = await modelsResponse.json();
      const isLoaded = models.data?.some(
        (model: any) =>
          model.id === this.MODEL_NAME ||
          config.llm.lmstudio.fallbackModels.some((fallback) =>
            model.id.includes(fallback)
          )
      );

      if (!isLoaded) {
        console.log(`Loading model: ${this.MODEL_NAME}`);

        // Try to load the model using LMStudio's REST API
        const loadResponse = await fetch(
          `${this.BASE_URL}${config.llm.lmstudio.endpoints.load}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: this.MODEL_NAME }),
          }
        );

        if (loadResponse.ok) {
          console.log(`Model ${this.MODEL_NAME} loaded successfully`);
          return true;
        } else {
          console.warn(
            `Failed to load model ${this.MODEL_NAME}. Make sure it's available in LMStudio.`
          );
          return false;
        }
      } else {
        console.log(`Model ${this.MODEL_NAME} is already loaded`);
        return true;
      }
    } catch (error) {
      console.warn("Could not check/load model in LMStudio:", error);
      return false;
    }
  }

  /**
   * Gets the list of available models in LMStudio
   */
  static async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}${config.llm.lmstudio.endpoints.models}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data?.map((model: any) => model.id) || [];
      }
      return [];
    } catch (error) {
      console.warn("Could not fetch available models:", error);
      return [];
    }
  }

  /**
   * Gets the model name to use in API calls
   */
  static getModelName(): string {
    return this.MODEL_NAME;
  }

  /**
   * Checks if LMStudio is running and accessible
   */
  static async isLMStudioRunning(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.BASE_URL}${config.llm.lmstudio.endpoints.models}`,
        {
          method: "GET",
          timeout: config.llm.lmstudio.timeout,
        } as any
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
