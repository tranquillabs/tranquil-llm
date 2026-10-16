<!-- For agents working on Tranquil's repos. Never shipped. -->

# atom-pdf-view (`pdf-view`)

Tranquil's fork of `izuzak/atom-pdf-view`, the PDF viewer, linked into the app as `pdf-view`.

- It has its own runtime dependencies (`pdfjs-dist`, `atom-space-pen-views`): run
  `source ~/.nvm/nvm.sh && nvm use 20.16.0 && yarn install` here before `yarn install` in
  tranquil-client. There is no `.nvmrc`, so name the version.
- It keeps its upstream `spec/` folder; test exclusions in the app build cover it.
- Keep changes small and upstreamable.
