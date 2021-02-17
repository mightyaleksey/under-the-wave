## Tasks
- finish resolver
- add server updates?
- add file support

## Nice to have
- add cache to resolver
- improve css support
- test inline-process-env and unfold-condition plugins with other plugins
- add parallel support to server
- plot graph
- test optimisations on "node_modules/react-dom/cjs/react-dom.development.js"
- css modules support / custom module support
- add https

## What to test
- all cases for transformation plugins
- resolution alg for resolver

## Questions
- How to handle node_modules outside of scoped directory? i.e. serve page -> import react
- How to handle commonjs modules? Replace require with import()?
