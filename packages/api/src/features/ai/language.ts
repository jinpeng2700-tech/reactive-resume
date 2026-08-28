import type { Locale } from "@reactive-resume/utils/locale";

export function buildAiOutputLanguageInstruction(locale: Locale): string {
	return `Use ${locale} for all generated user-facing text, including resume content and structured recommendations, unless the user explicitly requests another language.`;
}
