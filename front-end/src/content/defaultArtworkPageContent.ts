import type { ArtworkPageContent } from "@/types/site";

const defaultArtwork = {
	items: [
		{
			alt: "Hand-drawn RetroZetro character artwork for 0uiz and ZX0.",
			id: "artwork-001",
			image: "/uploads/content/tyler-handdrawn-v1/001-02cf7aaa9fea53fa.jpg",
			title: "0uiz and ZX0",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Zub unit ZCT-80Z.",
			id: "artwork-002",
			image: "/uploads/content/tyler-handdrawn-v1/002-06cbffe80cbb3e49.jpg",
			title: "Zub unit ZCT-80Z",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Exo.",
			id: "artwork-003",
			image: "/uploads/content/tyler-handdrawn-v1/003-0706dc85fc02f7fe.jpg",
			title: "Exo",
			collection: "exo",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Haz and Hiz.",
			id: "artwork-004",
			image: "/uploads/content/tyler-handdrawn-v1/004-08f0479a7eac426f.jpg",
			title: "Haz and Hiz",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Fazo.",
			id: "artwork-005",
			image: "/uploads/content/tyler-handdrawn-v1/005-0905d798b55c8bb8.jpg",
			title: "Fazo",
			collection: "characters",
			caption: "Fazo was born and raised on Bitgam, in Gamborus.",
			link: "/characters#fazo",
			linkLabel: "Meet Fazo"
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Zlug.",
			id: "artwork-006",
			image: "/uploads/content/tyler-handdrawn-v1/006-0a64f079ad8ecbb2.jpg",
			title: "Zlug",
			collection: "peoples",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Opex.",
			id: "artwork-007",
			image: "/uploads/content/tyler-handdrawn-v1/007-0d173c8b5957aded.jpg",
			title: "Opex",
			collection: "opex",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Exo.",
			id: "artwork-008",
			image: "/uploads/content/tyler-handdrawn-v1/008-166e8f25330929cc.jpg",
			title: "Exo",
			collection: "exo",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Zub unit ZCT-80Z.",
			id: "artwork-009",
			image: "/uploads/content/tyler-handdrawn-v1/009-16e8209ca408461e.jpg",
			title: "Zub unit ZCT-80Z",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Apex Army character.",
			id: "artwork-010",
			image: "/uploads/content/tyler-handdrawn-v1/010-171f13ce370c9716.jpg",
			title: "Apex Army character",
			collection: "machines",
			caption: "An Apex Army design, part of the military world in The Fall of a Dream.",
			link: "/stories/fall-of-a-dream",
			linkLabel: "Read The Fall of a Dream"
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Exo, Shaman, and Fazo.",
			id: "artwork-011",
			image: "/uploads/content/tyler-handdrawn-v1/011-18208a4722f52548.jpg",
			title: "Exo, Shaman, and Fazo",
			collection: "exo",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Exo, first new design.",
			id: "artwork-012",
			image: "/uploads/content/tyler-handdrawn-v1/012-198b5c15c9c93a50.jpg",
			title: "Exo, first new design",
			collection: "exo",
			caption: "A redesign of Exo Dexus, the leader of Team Rimlaw.",
			link: "/characters#exo-dexus",
			linkLabel: "Meet Exo Dexus"
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for 2018 character design.",
			id: "artwork-013",
			image: "/uploads/content/tyler-handdrawn-v1/013-21e90d8edaac4060.jpg",
			title: "2018 character design",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for 2018 character design.",
			id: "artwork-014",
			image: "/uploads/content/tyler-handdrawn-v1/014-281a9fcd9f42f82f.jpg",
			title: "2018 character design",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Cbot and Bugnoids.",
			id: "artwork-015",
			image: "/uploads/content/tyler-handdrawn-v1/015-2a3c519736fae9f3.jpg",
			title: "Cbot and Bugnoids",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Orpex Legion biosuit.",
			id: "artwork-016",
			image: "/uploads/content/tyler-handdrawn-v1/016-2bd40d7cc06cff51.jpg",
			title: "Orpex Legion biosuit",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character study.",
			id: "artwork-017",
			image: "/uploads/content/tyler-handdrawn-v1/017-2e80002f4baf1a3f.jpg",
			title: "Character study",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Exo design history.",
			id: "artwork-018",
			image: "/uploads/content/tyler-handdrawn-v1/018-31e45ecbc3970635.jpg",
			title: "Exo design history",
			collection: "exo",
			caption: "Exo's design history includes an earlier short-horned form and a later antenna design.",
			link: "/characters#exo-dexus",
			linkLabel: "Explore Exo's character"
		},
		{
			alt: "Hand-drawn RetroZetro character group study.",
			id: "artwork-019",
			image: "/uploads/content/tyler-handdrawn-v1/019-34da3f59cef7fda5.jpg",
			title: "Character group study",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Exo, old design.",
			id: "artwork-020",
			image: "/uploads/content/tyler-handdrawn-v1/020-393e34a88928d499.jpg",
			title: "Exo, old design",
			collection: "exo",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Bio Army, Hyperdicniold, and Pennoid.",
			id: "artwork-021",
			image: "/uploads/content/tyler-handdrawn-v1/021-4095c22cce0633ce.jpg",
			title: "Bio Army, Hyperdicniold, and Pennoid",
			collection: "peoples",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Hez mixed design.",
			id: "artwork-022",
			image: "/uploads/content/tyler-handdrawn-v1/022-420ab79fbee0da8d.jpg",
			title: "Hez mixed design",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Robot and alien character.",
			id: "artwork-023",
			image: "/uploads/content/tyler-handdrawn-v1/023-435d91eb0f645351.jpg",
			title: "Robot and alien character",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Exo and others.",
			id: "artwork-024",
			image: "/uploads/content/tyler-handdrawn-v1/024-48d4aa8df224ae9e.jpg",
			title: "Exo and others",
			collection: "exo",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for 2018 character design.",
			id: "artwork-025",
			image: "/uploads/content/tyler-handdrawn-v1/025-4c0bcb8eae7d1218.jpg",
			title: "2018 character design",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Opex.",
			id: "artwork-026",
			image: "/uploads/content/tyler-handdrawn-v1/026-4f690b61ad18edf6.jpg",
			title: "Opex",
			collection: "opex",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Opex.",
			id: "artwork-027",
			image: "/uploads/content/tyler-handdrawn-v1/027-51e5613c74b0cde2.jpg",
			title: "Opex",
			collection: "opex",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Fuzo.",
			id: "artwork-028",
			image: "/uploads/content/tyler-handdrawn-v1/028-525ef5706cbda1d0.jpg",
			title: "Fuzo",
			collection: "characters",
			caption: "Fuzo is the alternate-universe counterpart to the original Fazo.",
			link: "/characters#fuzo",
			linkLabel: "Meet Fuzo"
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Exo, Shaman, and Cosmo.",
			id: "artwork-029",
			image: "/uploads/content/tyler-handdrawn-v1/029-526d5fcdff23f407.jpg",
			title: "Exo, Shaman, and Cosmo",
			collection: "exo",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for 2018 character design.",
			id: "artwork-030",
			image: "/uploads/content/tyler-handdrawn-v1/030-52a14054e11566b4.jpg",
			title: "2018 character design",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character study.",
			id: "artwork-031",
			image: "/uploads/content/tyler-handdrawn-v1/031-58e3885f9fae7f71.jpg",
			title: "Character study",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Hix.",
			id: "artwork-032",
			image: "/uploads/content/tyler-handdrawn-v1/032-5cfd097464dd8a2c.jpg",
			title: "Hix",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Opex.",
			id: "artwork-033",
			image: "/uploads/content/tyler-handdrawn-v1/033-5e8f233a4bf0a1c9.jpg",
			title: "Opex",
			collection: "opex",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Piadom race.",
			id: "artwork-034",
			image: "/uploads/content/tyler-handdrawn-v1/034-60274e89938ae041.jpg",
			title: "Piadom race",
			collection: "peoples",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Cbot design.",
			id: "artwork-035",
			image: "/uploads/content/tyler-handdrawn-v1/035-6142ad22797171ad.jpg",
			title: "Cbot design",
			collection: "machines",
			caption: "CBots are shells powered by Orpenoid consciousness through Linkpod technology.",
			link: "/worlds#technology",
			linkLabel: "Explore Linkpods and CBots"
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Zub unit ZCT-80Z.",
			id: "artwork-036",
			image: "/uploads/content/tyler-handdrawn-v1/036-647a4dd5b8291742.jpg",
			title: "Zub unit ZCT-80Z",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Exo design history.",
			id: "artwork-037",
			image: "/uploads/content/tyler-handdrawn-v1/037-6507a63e54a92b72.jpg",
			title: "Exo design history",
			collection: "exo",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Zlug.",
			id: "artwork-038",
			image: "/uploads/content/tyler-handdrawn-v1/038-67bd009caa6330b9.jpg",
			title: "Zlug",
			collection: "peoples",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Mecha robot.",
			id: "artwork-039",
			image: "/uploads/content/tyler-handdrawn-v1/039-6bafe90d0cd3de73.jpg",
			title: "Mecha robot",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Zetro alternate design.",
			id: "artwork-040",
			image: "/uploads/content/tyler-handdrawn-v1/040-708bf489a383d470.jpg",
			title: "Zetro alternate design",
			collection: "zetro",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Medit and biobots.",
			id: "artwork-041",
			image: "/uploads/content/tyler-handdrawn-v1/041-723ea0b131c7a966.jpg",
			title: "Medit and biobots",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Zre.",
			id: "artwork-042",
			image: "/uploads/content/tyler-handdrawn-v1/042-744a000813905590.jpg",
			title: "Zre",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Villain and hero.",
			id: "artwork-043",
			image: "/uploads/content/tyler-handdrawn-v1/043-7585f80b9949bb46.jpg",
			title: "Villain and hero",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Zlug races and Apex.",
			id: "artwork-044",
			image: "/uploads/content/tyler-handdrawn-v1/044-77480a47db01a6d5.jpg",
			title: "Zlug races and Apex",
			collection: "peoples",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Zetro original resketch.",
			id: "artwork-045",
			image: "/uploads/content/tyler-handdrawn-v1/045-7896e301de44957c.jpg",
			title: "Zetro original resketch",
			collection: "zetro",
			caption:
				"An original resketch of Zetro, who appears with Retro and in an adventure trio with Zatral and Zat.",
			link: "/characters#zetro",
			linkLabel: "Meet Zetro"
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for 2018 character design.",
			id: "artwork-046",
			image: "/uploads/content/tyler-handdrawn-v1/046-78c3665d45ffc314.jpg",
			title: "2018 character design",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Quetus.",
			id: "artwork-047",
			image: "/uploads/content/tyler-handdrawn-v1/047-87f8962d2be53207.jpg",
			title: "Quetus",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Alternate Zetro or Trozet.",
			id: "artwork-048",
			image: "/uploads/content/tyler-handdrawn-v1/048-8c510ff99effb213.jpg",
			title: "Alternate Zetro or Trozet",
			collection: "zetro",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Alien and robot character.",
			id: "artwork-049",
			image: "/uploads/content/tyler-handdrawn-v1/049-966de6804791f9e4.jpg",
			title: "Alien and robot character",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Exo.",
			id: "artwork-050",
			image: "/uploads/content/tyler-handdrawn-v1/050-96c62e470588dc7c.jpg",
			title: "Exo",
			collection: "exo",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Kavoid.",
			id: "artwork-051",
			image: "/uploads/content/tyler-handdrawn-v1/051-991ad008829da851.jpg",
			title: "Kavoid",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for 2018 character design.",
			id: "artwork-052",
			image: "/uploads/content/tyler-handdrawn-v1/052-9fc3ba9e9b3d36b4.jpg",
			title: "2018 character design",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Hero and villain.",
			id: "artwork-053",
			image: "/uploads/content/tyler-handdrawn-v1/053-a2b08c61ab5ec2d5.jpg",
			title: "Hero and villain",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Exo old design.",
			id: "artwork-054",
			image: "/uploads/content/tyler-handdrawn-v1/054-a7b0b897c9ddd176.jpg",
			title: "Exo old design",
			collection: "exo",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Qaix.",
			id: "artwork-055",
			image: "/uploads/content/tyler-handdrawn-v1/055-a911abc544e6a251.jpg",
			title: "Qaix",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Alien character.",
			id: "artwork-056",
			image: "/uploads/content/tyler-handdrawn-v1/056-ab2248cfc8f9b38c.jpg",
			title: "Alien character",
			collection: "peoples",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Biosuit and Mog.",
			id: "artwork-057",
			image: "/uploads/content/tyler-handdrawn-v1/057-aefb56b0eb552b82.jpg",
			title: "Biosuit and Mog",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Shaman and Apex.",
			id: "artwork-058",
			image: "/uploads/content/tyler-handdrawn-v1/058-af46b45c88f28730.jpg",
			title: "Shaman and Apex",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Opex.",
			id: "artwork-059",
			image: "/uploads/content/tyler-handdrawn-v1/059-b030539c7c5b4384.jpg",
			title: "Opex",
			collection: "opex",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Zub unit ZCT-80Z.",
			id: "artwork-060",
			image: "/uploads/content/tyler-handdrawn-v1/060-b11d64571cdf3611.jpg",
			title: "Zub unit ZCT-80Z",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for 2018 character design.",
			id: "artwork-061",
			image: "/uploads/content/tyler-handdrawn-v1/061-b5d9363f5d4319c9.jpg",
			title: "2018 character design",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Mecha unit ZD.",
			id: "artwork-062",
			image: "/uploads/content/tyler-handdrawn-v1/062-b8752d6902074c44.jpg",
			title: "Mecha unit ZD",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Exo and Shaman.",
			id: "artwork-063",
			image: "/uploads/content/tyler-handdrawn-v1/063-ba7430851cc35538.jpg",
			title: "Exo and Shaman",
			collection: "exo",
			caption: "Exo and Shaman share this character drawing. Shaman is a Lightnoid.",
			link: "/characters#shaman",
			linkLabel: "Meet Shaman"
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Zub unit ZCT-80Z.",
			id: "artwork-064",
			image: "/uploads/content/tyler-handdrawn-v1/064-bbc17d82b5e42a5e.jpg",
			title: "Zub unit ZCT-80Z",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Exo.",
			id: "artwork-065",
			image: "/uploads/content/tyler-handdrawn-v1/065-c0425144279bd57b.jpg",
			title: "Exo",
			collection: "exo",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for 2018 character design.",
			id: "artwork-066",
			image: "/uploads/content/tyler-handdrawn-v1/066-c08c30b578f7869a.jpg",
			title: "2018 character design",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Opex.",
			id: "artwork-067",
			image: "/uploads/content/tyler-handdrawn-v1/067-c0cafe542529caaf.jpg",
			title: "Opex",
			collection: "opex",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Opex.",
			id: "artwork-068",
			image: "/uploads/content/tyler-handdrawn-v1/068-c9dcc317d7bb38b5.jpg",
			title: "Opex",
			collection: "opex",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Mozo and Zoha.",
			id: "artwork-069",
			image: "/uploads/content/tyler-handdrawn-v1/069-cbcefeafc67b25c0.jpg",
			title: "Mozo and Zoha",
			collection: "characters",
			caption: "Mozo and Zoha are a character pair from FZ.",
			link: "/characters#mozo-and-zoha",
			linkLabel: "Meet Mozo and Zoha"
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Mic Cluck.",
			id: "artwork-070",
			image: "/uploads/content/tyler-handdrawn-v1/070-ce90e46d86ab2f06.jpg",
			title: "Mic Cluck",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Purnoid.",
			id: "artwork-071",
			image: "/uploads/content/tyler-handdrawn-v1/071-d4d5852593bd2360.jpg",
			title: "Purnoid",
			collection: "peoples",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Zub unit ZCT-80Z.",
			id: "artwork-072",
			image: "/uploads/content/tyler-handdrawn-v1/072-d7b539082ccd9be4.jpg",
			title: "Zub unit ZCT-80Z",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Zub unit ZCT-80Z.",
			id: "artwork-073",
			image: "/uploads/content/tyler-handdrawn-v1/073-dd7131c8138f04e0.jpg",
			title: "Zub unit ZCT-80Z",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Mozus.",
			id: "artwork-074",
			image: "/uploads/content/tyler-handdrawn-v1/074-e28d48c3df228e14.jpg",
			title: "Mozus",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Opex.",
			id: "artwork-075",
			image: "/uploads/content/tyler-handdrawn-v1/075-e548be6b6094a637.jpg",
			title: "Opex",
			collection: "opex",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Zub unit ZCT-80Z.",
			id: "artwork-076",
			image: "/uploads/content/tyler-handdrawn-v1/076-e56a3cb34a2733fc.jpg",
			title: "Zub unit ZCT-80Z",
			collection: "machines",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Exo.",
			id: "artwork-077",
			image: "/uploads/content/tyler-handdrawn-v1/077-e8044ed72c34cccc.jpg",
			title: "Exo",
			collection: "exo",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Bugnoids.",
			id: "artwork-078",
			image: "/uploads/content/tyler-handdrawn-v1/078-e8423d69cc3bb488.jpg",
			title: "Bugnoids",
			collection: "peoples",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Hiz and Ginmor.",
			id: "artwork-079",
			image: "/uploads/content/tyler-handdrawn-v1/079-f4faba920637e979.jpg",
			title: "Hiz and Ginmor",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Hazus and Yanta.",
			id: "artwork-080",
			image: "/uploads/content/tyler-handdrawn-v1/080-f51d03ff6ba97bb2.jpg",
			title: "Hazus and Yanta",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for 2018 character design.",
			id: "artwork-081",
			image: "/uploads/content/tyler-handdrawn-v1/081-f85a962eb01b15bc.jpg",
			title: "2018 character design",
			collection: "characters",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Alternate Zlug design.",
			id: "artwork-082",
			image: "/uploads/content/tyler-handdrawn-v1/082-f8ccfccd2a18b75f.jpg",
			title: "Alternate Zlug design",
			collection: "peoples",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Opex.",
			id: "artwork-083",
			image: "/uploads/content/tyler-handdrawn-v1/083-fb44afd743b7453d.jpg",
			title: "Opex",
			collection: "opex",
			caption: "",
			link: "",
			linkLabel: ""
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Exo.",
			id: "artwork-084",
			image: "/uploads/content/tyler-handdrawn-v1/084-fb97b37cd5c66f0e.jpg",
			title: "Exo",
			collection: "exo",
			caption: "Exo enters an Apex Army moon base in search of his mother in The List.",
			link: "/stories/the-list",
			linkLabel: "Read The List"
		},
		{
			alt: "Hand-drawn RetroZetro character artwork for Qodim race.",
			id: "artwork-085",
			image: "/uploads/content/tyler-handdrawn-v1/085-fd6ad777ef780a86.jpg",
			title: "Qodim race",
			collection: "peoples",
			caption: "",
			link: "",
			linkLabel: ""
		}
	]
};

export function createDefaultArtworkPageContent() {
	return JSON.parse(JSON.stringify(defaultArtwork)) as ArtworkPageContent;
}
