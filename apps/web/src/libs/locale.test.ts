// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import Cookies from "js-cookie";
import { changeLocale, formatRelativeTime, getLocale, isLocale, resolveLocale } from "./locale";

afterEach(() => {
	vi.restoreAllMocks();
	vi.useRealTimers();
	Cookies.remove("locale");
});

describe("isLocale", () => {
	it("returns true for known locale en-US", () => {
		expect(isLocale("en-US")).toBe(true);
	});

	it("returns true for de-DE", () => {
		expect(isLocale("de-DE")).toBe(true);
	});

	it("returns true for zh-CN", () => {
		expect(isLocale("zh-CN")).toBe(true);
	});

	it("returns false for unknown locale", () => {
		expect(isLocale("xx-YY")).toBe(false);
	});

	it("returns false for empty string", () => {
		expect(isLocale("")).toBe(false);
	});

	it("returns false for malformed locale", () => {
		expect(isLocale("not a locale")).toBe(false);
	});

	it("is case-sensitive", () => {
		expect(isLocale("en-us")).toBe(false);
	});
});

describe("resolveLocale", () => {
	it("returns the locale unchanged when valid", () => {
		expect(resolveLocale("fr-FR")).toBe("fr-FR");
	});

	it("returns zh-CN default for invalid locale", () => {
		expect(resolveLocale("xx-YY")).toBe("zh-CN");
	});

	it("returns zh-CN default for empty string", () => {
		expect(resolveLocale("")).toBe("zh-CN");
	});
});

describe("getLocale", () => {
	it("uses a stored locale before the system locale", () => {
		Cookies.set("locale", "en-GB");
		vi.spyOn(navigator, "languages", "get").mockReturnValue(["zh-CN"]);

		expect(getLocale()).toBe("en-GB");
	});

	it("uses the exact system locale when no locale is stored", () => {
		vi.spyOn(navigator, "languages", "get").mockReturnValue(["zh-TW", "en-US"]);

		expect(getLocale()).toBe("zh-TW");
	});

	it("uses a supported locale with the same primary language", () => {
		vi.spyOn(navigator, "languages", "get").mockReturnValue(["de-AT"]);

		expect(getLocale()).toBe("de-DE");
	});

	it("falls back to zh-CN for unsupported system locales", () => {
		vi.spyOn(navigator, "languages", "get").mockReturnValue(["xx-YY"]);

		expect(getLocale()).toBe("zh-CN");
	});
});

describe("formatRelativeTime", () => {
	it("selects the largest matching unit", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-02T12:00:00Z"));
		const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

		expect(formatRelativeTime("2026-01-02T10:00:00Z", formatter)).toBe("2 hours ago");
		expect(formatRelativeTime("2026-01-02T11:59:45Z", formatter)).toBe("now");
	});

	it("uses the requested fallback for an invalid date", () => {
		const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

		expect(formatRelativeTime("invalid", formatter, "")).toBe("");
	});
});

describe("changeLocale", () => {
	it("persists a valid locale and reloads", () => {
		const reload = vi.spyOn(window.location, "reload").mockImplementation(() => undefined);

		changeLocale("de-DE");

		expect(Cookies.get("locale")).toBe("de-DE");
		expect(reload).toHaveBeenCalledOnce();
	});
});
