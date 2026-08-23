export interface RetroverseFeature {
	body: string;
	facts: Array<{ label: string; value: string }>;
	id: string;
	image?: string;
	imageAlt?: string;
	kicker: string;
	secondImage?: string;
	secondImageAlt?: string;
	title: string;
}

const tylerHandDrawnBase = "/uploads/content/tyler-handdrawn-v1";

export const retroverseWorlds: RetroverseFeature[] = [
	{
		body: "Bitgam is Fazo's homeworld. The people of Gambit Pointe have red skin, yellow and white eyes, and protective exoskeletons. Their history reaches back to the Great Manifested.",
		facts: [
			{ label: "Region", value: "Gamborus" },
			{ label: "Known resident", value: "Fazo" }
		],
		id: "bitgam",
		image: `${tylerHandDrawnBase}/005-0905d798b55c8bb8.jpg`,
		imageAlt: "Hand-drawn colored portrait of Fazo from Bitgam.",
		kicker: "Planet of Gamborus",
		title: "Bitgam"
	},
	{
		body: "Orpex is the Orpenoid homeworld. Its council calls on Team Rimlaw during the Apex crisis, while Orpenoid Linkpods allow a consciousness to power a CBot body.",
		facts: [
			{ label: "People", value: "Orpenoids" },
			{ label: "Technology", value: "Linkpods and CBots" }
		],
		id: "orpex",
		image: `${tylerHandDrawnBase}/035-6142ad22797171ad.jpg`,
		imageAlt: "Hand-drawn CBot design connected to Orpenoid technology.",
		kicker: "Orpenoid homeworld",
		secondImage: `${tylerHandDrawnBase}/016-2bd40d7cc06cff51.jpg`,
		secondImageAlt: "Hand-drawn Orpex Legion biosuit.",
		title: "Orpex"
	},
	{
		body: "Galgri is home to the Galgrey Galnoids and a Council of Twelve overseers. Giza, Gelth, Geth, Gel, Grorix, Velrix, and Vozith all belong to Galnoid history.",
		facts: [
			{ label: "People", value: "Galgrey Galnoids" },
			{ label: "Government", value: "Council of Twelve" }
		],
		id: "galgri",
		kicker: "Galnoid homeworld",
		title: "Galgri"
	},
	{
		body: "Meqill is the homeworld of the Zlunoids, a people who inhabit another distant corner of the Retroverse.",
		facts: [{ label: "People", value: "Zlunoids" }],
		id: "meqill",
		kicker: "Zlunoid homeworld",
		title: "Meqill"
	}
];

export const retroverseConflicts: RetroverseFeature[] = [
	{
		body: "The Zlugnoid Hive Wars pit Zucnoids against Zlugnoids. A Zlug doctor creates hybrid Wormoids as the conflict expands through commanders, armor squads, and mecha forces.",
		facts: [
			{ label: "Opposing peoples", value: "Zucnoids and Zlugnoids" },
			{ label: "Created in the war", value: "Hybrid Wormoids" }
		],
		id: "zlugnoid-hive-wars",
		image: `${tylerHandDrawnBase}/006-0a64f079ad8ecbb2.jpg`,
		imageAlt: "Hand-drawn Zlug character design.",
		kicker: "Hive war",
		secondImage: `${tylerHandDrawnBase}/044-77480a47db01a6d5.jpg`,
		secondImageAlt: "Hand-drawn designs for Zlug races and Apex.",
		title: "The Zlugnoid Hive Wars"
	},
	{
		body: "Zetro and Retro stand together at the heart of Retro Zetro. Zatral, Zat, and Zetro also form an adventure trio surrounded by alternate designs, robotic counterparts, and new allies.",
		facts: [
			{ label: "Paired heroes", value: "Zetro and Retro" },
			{ label: "Adventure trio", value: "Zatral, Zat, and Zetro" }
		],
		id: "retro-zetro",
		image: `${tylerHandDrawnBase}/045-7896e301de44957c.jpg`,
		imageAlt: "Hand-drawn original resketch of Zetro.",
		kicker: "Retro Zetro",
		secondImage: `${tylerHandDrawnBase}/040-708bf489a383d470.jpg`,
		secondImageAlt: "Hand-drawn alternate design for Zetro.",
		title: "Zetro and Retro"
	},
	{
		body: "Mozo and Zoha come from FZ. The Piadom race began as part of Oddverse, opening another corner of the Retroverse to its own characters and peoples.",
		facts: [
			{ label: "FZ characters", value: "Mozo and Zoha" },
			{ label: "Oddverse people", value: "Piadom" }
		],
		id: "fz-and-oddverse",
		image: `${tylerHandDrawnBase}/069-cbcefeafc67b25c0.jpg`,
		imageAlt: "Hand-drawn designs for Mozo and Zoha from FZ.",
		kicker: "FZ and Oddverse",
		secondImage: `${tylerHandDrawnBase}/034-60274e89938ae041.jpg`,
		secondImageAlt: "Hand-drawn Piadom race design from Oddverse.",
		title: "FZ and Oddverse"
	}
];

export const retroverseTechnology: RetroverseFeature[] = [
	{
		body: "A Linkpod places an Orpenoid consciousness inside a CBot shell. One model is a ground unit; another transforms into a small oval spacecraft.",
		facts: [
			{ label: "Power source", value: "Orpenoid consciousness" },
			{ label: "CBot forms", value: "Ground unit and transforming craft" }
		],
		id: "linkpods-and-cbots",
		image: `${tylerHandDrawnBase}/035-6142ad22797171ad.jpg`,
		imageAlt: "Hand-drawn CBot design.",
		kicker: "Orpenoid technology",
		title: "Linkpods and CBots"
	},
	{
		body: "The Orpex Legion fields a biosuit, while the wider military world includes specialized armor, robot shells, and other body-machine systems.",
		facts: [{ label: "Known equipment", value: "Orpex Legion biosuit" }],
		id: "orpex-legion-biosuit",
		image: `${tylerHandDrawnBase}/016-2bd40d7cc06cff51.jpg`,
		imageAlt: "Hand-drawn Orpex Legion biosuit.",
		kicker: "Legion armor",
		title: "Orpex Legion Biosuit"
	},
	{
		body: "The Zub ZCT-80Z appears in a full set of hand-drawn unit studies, showing one machine through multiple forms and configurations.",
		facts: [{ label: "Unit", value: "ZCT-80Z" }],
		id: "zub-zct-80z",
		image: `${tylerHandDrawnBase}/002-06cbffe80cbb3e49.jpg`,
		imageAlt: "Hand-drawn Zub ZCT-80Z unit design.",
		kicker: "Zub machine",
		secondImage: `${tylerHandDrawnBase}/073-dd7131c8138f04e0.jpg`,
		secondImageAlt: "Another hand-drawn Zub ZCT-80Z unit study.",
		title: "Zub Unit ZCT-80Z"
	},
	{
		body: "Mecha robots, biobots, and galaxy bots add heavier mechanical forces to the armies and alien crews of the Retroverse.",
		facts: [{ label: "Machine types", value: "Mecha robots, biobots, and galaxy bots" }],
		id: "mecha-and-biobots",
		image: `${tylerHandDrawnBase}/039-6bafe90d0cd3de73.jpg`,
		imageAlt: "Hand-drawn mecha robot.",
		kicker: "Machine forces",
		secondImage: `${tylerHandDrawnBase}/041-723ea0b131c7a966.jpg`,
		secondImageAlt: "Hand-drawn Medit and biobot designs.",
		title: "Mecha and Biobots"
	}
];
