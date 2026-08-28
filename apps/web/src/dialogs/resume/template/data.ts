import type { MessageDescriptor } from "@lingui/core";
import type { Template } from "@reactive-resume/schema/templates";
import { msg } from "@lingui/core/macro";

export type TemplateMetadata = {
	name: string;
	description: MessageDescriptor;
	imageUrl: string;
	tags: MessageDescriptor[];
	sidebarPosition: "left" | "right" | "none";
};

export const templates = {
	azurill: {
		name: "Azurill",
		description: msg`Two-column with a bold colored sidebar and skill bars; great for creative or tech roles where visual flair is welcome.`,
		imageUrl: "/templates/jpg/azurill.jpg",
		tags: [msg`Two-column`, msg`Creative`, msg`Tech`, msg`Visual flair`],
		sidebarPosition: "left",
	},
	bronzor: {
		name: "Bronzor",
		description: msg`Two-column, clean and professional with subtle section dividers; suits corporate, finance, or consulting positions.`,
		imageUrl: "/templates/jpg/bronzor.jpg",
		tags: [msg`Two-column`, msg`Clean`, msg`Professional`, msg`Corporate`, msg`Finance`, msg`Consulting`],
		sidebarPosition: "none",
	},
	chikorita: {
		name: "Chikorita",
		description: msg`Two-column with a soft header accent and circular profile photo; ideal for marketing, HR, or client-facing roles.`,
		imageUrl: "/templates/jpg/chikorita.jpg",
		tags: [msg`Two-column`, msg`Soft accent`, msg`Marketing`, msg`HR`, msg`Client-facing`],
		sidebarPosition: "right",
	},
	ditgar: {
		name: "Ditgar",
		description: msg`Two-column with a dark teal sidebar and skills grid; modern feel for developers, data scientists, or technical PMs.`,
		imageUrl: "/templates/jpg/ditgar.jpg",
		tags: [msg`Two-column`, msg`Modern`, msg`Developer`, msg`Data science`, msg`Technical PM`, msg`Dark sidebar`],
		sidebarPosition: "left",
	},
	ditto: {
		name: "Ditto",
		description: msg`Two-column, minimal and text-dense with no decorative elements; perfect for traditional industries or ATS-heavy applications.`,
		imageUrl: "/templates/jpg/ditto.jpg",
		tags: [msg`Two-column`, msg`ATS friendly`, msg`Minimal`, msg`Text-dense`, msg`Traditional`, msg`No decoration`],
		sidebarPosition: "left",
	},
	gengar: {
		name: "Gengar",
		description: msg`Two-column with accent colors and clean typography; balanced choice for business analysts or operations roles.`,
		imageUrl: "/templates/jpg/gengar.jpg",
		tags: [msg`Two-column`, msg`Accent colors`, msg`Clean typography`, msg`Business analyst`, msg`Operations`],
		sidebarPosition: "left",
	},
	glalie: {
		name: "Glalie",
		description: msg`Two-column, minimal with light gray sidebar and subtle icons; professional and understated for legal, finance, or executive roles.`,
		imageUrl: "/templates/jpg/glalie.jpg",
		tags: [
			msg`Two-column`,
			msg`Minimal`,
			msg`Professional`,
			msg`Legal`,
			msg`Finance`,
			msg`Executive`,
			msg`Understated`,
		],
		sidebarPosition: "left",
	},
	kakuna: {
		name: "Kakuna",
		description: msg`Single-column with a magenta left border accent; compact and efficient for entry-level or internship applications.`,
		imageUrl: "/templates/jpg/kakuna.jpg",
		tags: [
			msg`Single-column`,
			msg`ATS friendly`,
			msg`Compact`,
			msg`Efficient`,
			msg`Entry level`,
			msg`Internship`,
			msg`Magenta accent`,
		],
		sidebarPosition: "none",
	},
	lapras: {
		name: "Lapras",
		description: msg`Single-column; polished and serious for senior or enterprise-level positions.`,
		imageUrl: "/templates/jpg/lapras.jpg",
		tags: [msg`Single-column`, msg`ATS friendly`, msg`Polished`, msg`Senior`, msg`Enterprise`],
		sidebarPosition: "none",
	},
	leafish: {
		name: "Leafish",
		description: msg`Two-column with a muted color sidebar; earthy and calm, suits sustainability, healthcare, or nonprofit sectors.`,
		imageUrl: "/templates/jpg/leafish.jpg",
		tags: [
			msg`Two-column`,
			msg`Muted sidebar`,
			msg`Earthy`,
			msg`Calm`,
			msg`Sustainability`,
			msg`Healthcare`,
			msg`Nonprofit`,
		],
		sidebarPosition: "right",
	},
	meowth: {
		name: "Meowth",
		description: msg`Single-column with an inline three-column entry header (position · organization · period); compact and ATS-friendly, well-suited for Asian resume conventions (CN/JP/KR).`,
		imageUrl: "/templates/jpg/meowth.jpg",
		tags: [msg`Single-column`, msg`ATS friendly`, msg`Inline header`, msg`Compact`, msg`Asian style`, msg`CN/JP/KR`],
		sidebarPosition: "none",
	},
	onyx: {
		name: "Onyx",
		description: msg`Single-column with a sidebar and clean grid layout; versatile for any professional or technical role.`,
		imageUrl: "/templates/jpg/onyx.jpg",
		tags: [
			msg`Single-column`,
			msg`ATS friendly`,
			msg`Sidebar`,
			msg`Grid layout`,
			msg`Versatile`,
			msg`Professional`,
			msg`Technical`,
		],
		sidebarPosition: "none",
	},
	pikachu: {
		name: "Pikachu",
		description: msg`Two-column with a left margin color; simple and approachable for creative, editorial, or junior roles.`,
		imageUrl: "/templates/jpg/pikachu.jpg",
		tags: [msg`Two-column`, msg`Simple`, msg`Creative`, msg`Editorial`, msg`Junior`, msg`Accent colors`],
		sidebarPosition: "left",
	},
	rhyhorn: {
		name: "Rhyhorn",
		description: msg`Single-column with a minimal top header and lots of whitespace; clean and modern for designers or content creators.`,
		imageUrl: "/templates/jpg/rhyhorn.jpg",
		tags: [
			msg`Single-column`,
			msg`ATS friendly`,
			msg`Minimal`,
			msg`Clean`,
			msg`Modern`,
			msg`Designer`,
			msg`Content creator`,
			msg`Whitespace`,
		],
		sidebarPosition: "none",
	},
	scizor: {
		name: "Scizor",
		description: msg`Single-column with uppercase section headings and a primary-color top rule on every page; polished for executive, consulting, or startup resumes.`,
		imageUrl: "/templates/jpg/scizor.jpg",
		tags: [
			msg`Single-column`,
			msg`ATS friendly`,
			msg`Uppercase headings`,
			msg`Executive`,
			msg`Consulting`,
			msg`Startup`,
		],
		sidebarPosition: "none",
	},
} as const satisfies Record<Template, TemplateMetadata>;
