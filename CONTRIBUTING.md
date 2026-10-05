# Contributing

Ideas, bug reports and pull requests are welcome in the
[issues](https://github.com/johnmorrisdotca/karakuri/issues).

## Working on it

```sh
pnpm install
pnpm check          # lint, types and tests: every level of every game proved winnable, the physics held bit for bit
pnpm test:package   # pack it as npm does, install it in an empty project, import every entry
pnpm test:demo      # build the demo and play every level of every game to a win in a real browser, at a phone's width and a desk's
pnpm docs:make      # rewrite docs/strings-ja.md after changing a word
```

The physics is held to a recorded hash: a change to the arithmetic of `src/physics/` changes every frame of every physics game, so it fails the
determinism tests until the new hash is recorded on purpose, and the levels' recorded solutions are played again to prove they still win.
A level published keeps its number: levels are only added to the end of a game's list, never edited, except in a release that says so in the changelog.

## House rules, shared by every package of the family

- Open an issue first for anything bigger than a typo, so that we can agree on the shape before you spend time on it.
- No runtime dependencies. Every function that plays or checks a game is pure: it returns new values and never changes what it was given.
- Tests sit beside the code they test. A rule you change has a test that would have caught it.
- Words a player reads come in English and Japanese. If you cannot write the Japanese, say so in the pull request and someone will.
- Option values and names are kebab case.
- Art and sound are CC0 or public domain only, checked at the source, and credited in the README. No GPL or LGPL code.
- Needs Node 22 or later. A change a user would notice gets a line in `CHANGELOG.md`.
- **The list of the family in the README is made, not written.** `pnpm family:readme` writes it between its
  markers from `scripts/family-template.mjs` (the names, the Japanese names and a line on each), and
  `scripts/family-readme.mjs` is the same file in every package. To add a package or change a line, change the
  template in every repository, bump `FAMILY_TEMPLATE_VERSION` and record the new hash in `src/family.test.js`.

## Releasing

A version tag (`v1.2.3`, the same as `package.json`'s version) runs
`.github/workflows/release.yml`: it checks and builds the package, attaches the
tarball to a GitHub release, and publishes it to npm by trusted publishing,
with no token. Write the release in `CHANGELOG.md` first.
