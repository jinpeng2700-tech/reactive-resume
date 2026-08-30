// @vitest-environment happy-dom

import { render } from "@testing-library/react";
import type { ComponentType } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: unknown) => ({ options }),
}));

vi.mock("@/libs/seo", () => ({
	createRootStructuredDataScript: () => ({}),
	getCanonicalRootUrl: () => "https://example.com/",
}));

vi.mock("./-sections/faq", () => ({ Faq: () => <div /> }));
vi.mock("./-sections/features", () => ({ Features: () => <div /> }));
vi.mock("./-sections/footer", () => ({ Footer: () => <div data-testid="footer" /> }));
vi.mock("./-sections/hero", () => ({ Hero: () => <div /> }));
vi.mock("./-sections/prefooter", () => ({ Prefooter: () => <div /> }));
vi.mock("./-sections/statistics", () => ({ Statistics: () => <div /> }));
vi.mock("./-sections/templates", () => ({ Templates: () => <div /> }));
vi.mock("./-sections/testimonials", () => ({ Testimonials: () => <div /> }));

const { Route } = await import("./index");
const HomePage = (Route.options as { component: ComponentType }).component;

describe("HomePage", () => {
	it("does not render footer content", () => {
		const { queryByTestId } = render(<HomePage />);

		expect(queryByTestId("footer")).not.toBeInTheDocument();
	});
});
