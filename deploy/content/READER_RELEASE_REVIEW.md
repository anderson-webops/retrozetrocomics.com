# Reader release source review

Reviewed for v2.8.0 on 2026-09-11. This is an operator document, not public site content.

The static-content synchronization limitation below describes v2.8.0. The v2.9.0 publishing handoff supersedes it
with runtime rendering of published records. The creative-source boundaries remain unchanged.

## Source boundaries

The attached Tyler archive was read without modifying it. Primary evidence is the retained original-message text in
`Raw Story and Character Material.txt`, SHA-256
`def2736b3dd24462450f178a02e440368c62616892855f619b3f1e9984f6c0de`.
Image identities come from the previously reviewed `handdrawn-character-import.csv`, SHA-256
`75a9ba41beec046123afffbc0678820a29b9a723918b8e6d65dbe2e627483729`, rather than new guesses from appearance.
These hashes identify private source evidence, not deployed image bytes. No raw conversations, local archive paths,
source transcripts, or new images are packaged in the public frontend.

| Public material | Retained original-message evidence | Editorial boundary |
| --- | --- | --- |
| The List | STORY-MATERIAL-0096 | Moon base, mother/friend search, changed symbols, Council of Orpex, Diyo's discovery, Apex/outlaw alliance and restored trust. No Pexus, DNA test, Giza/Oix, telepathic warning, or Ultra Beam imported from the other outline. |
| The Fall of a Dream | STORY-MATERIAL-0089 | Zego takeover, divided Apex, pet bite and DNA test, Giza/Oix exposing fake Pexus, Diyo's telepathic warning, Exo confronting Zego, Ultimate Ultra Beam. No Council of Orpex or restored-trust ending imported from The List. |
| Exo | STORY-MATERIAL-0025, 0096, 0089, 0154, 0191 | Original name, design changes, and original/AU distinction. No invented powers or unnamed portrait attribution. |
| Fazo and Fuzo | STORY-MATERIAL-0023, 0041, 0048, 0049 | Bitgam/Gamborus, Gambit Pointe appearance, Great Manifested reference, earlier sketches and white-eye designs, separate AU counterpart. No invented explanation of Great Manifested. |
| Shaman and Cosmos | STORY-MATERIAL-0024, 0279 | Lightnoid identity and relationship only. |
| Giza | STORY-MATERIAL-0239, 0245, 0251, 0089 | Galgrey Galnoid, Galgri, Gelth relationship, role in the Pexus investigation. |
| Oix, Diyo, Pexus, Zego | STORY-MATERIAL-0089; Diyo also 0096 | Separate concise text profiles; no portrait or additional power assigned. |
| Zorix | STORY-MATERIAL-0067 | Ruthless, direct antagonist. No asserted allegiance to Zego or borrowed portrait. |
| Linkpods and CBots | STORY-MATERIAL-0184 | Consciousness powers robot body; inactive empty shell; ground and transforming spacecraft forms. No invented mind-control mechanism or return procedure. |
| Zetro's adventure trio | STORY-MATERIAL-0197 and existing verified pairing records | Zatral, Zat, Zetro; existing Retro pairing retained without claiming a common chronology with Exo. |

The new prose is an edited retelling of the outlines, not a newly invented comic script. No dialogue, scene panels,
romance, ending, precise relationship between the two arcs, or chronology linking the separate worlds was added.
The phrase “self-deleting” remains unexplained rather than being assigned a definite mechanism. The Ultra Beam is
described as a symbol, not classified as a particular device or being. Group names that are ambiguous in the source
are not expanded. Existing source-supported but unresolved material is not padded to reach a word-count target.

## Reader and owner behavior

- Each story has its own illustrated reading route, seven visible editable sections, contents links, and related links.
- Existing owner story fields remain the data source. A removed default story is unavailable after owner data loads.
  Source defaults are statically rendered, so deployment must stop for a synchronization decision if live owner
  records override them. This release does not export drafts, seed records, or overwrite owner content.
- Character biographies are optional, bounded to 5,000 plain-text characters, and escaped in rendering. Old records
  remain valid. Text-only characters are allowed; supplied pictures still require approved URLs and useful alt text.
- Twelve default profiles remain within the existing sixteen-character limit. No existing owner tools are removed.
- The initial gallery HTML contains all 85 approved images with lazy image loading, search, category filters, and
  full-size links. Ten contextual captions use existing reviewed identities; no additional archive category is exposed.
- Three empty ad placements are commented out with their component/styles retained. Optional ad and analytics
  scripts are off. Restoring placeholders does not itself enable advertising or authorize tracking.
- The two metadata packages now use the compatible 2.1 line used by vite-ssg. Built-HTML verification checks all ten
  public routes, unique titles/canonicals, descriptions, sitemap coverage, no ad placeholders, and all gallery links.

## Release boundaries

No media content, database record, S3 resource, live service, or publication state is modified by this source release.
The privacy page describes the shipped application; the server operator must check hosting logs and mail routing
against it. This work improves the actual reader experience, not just search wording, but cannot guarantee AdSense
approval. Further substantial story expansion needs additional story material from Tyler rather than invented canon.
