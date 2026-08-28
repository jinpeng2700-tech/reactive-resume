import { describe, expect, it } from "vitest";
import { buildAiOutputLanguageInstruction } from "./language";

describe("buildAiOutputLanguageInstruction", () => {
	it("uses the active interface locale while allowing explicit user overrides", () => {
		expect(buildAiOutputLanguageInstruction("zh-CN")).toBe(
			"Use zh-CN for all generated user-facing text, including resume content and structured recommendations, unless the user explicitly requests another language.",
		);
	});
});
