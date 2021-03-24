# 🌊 Under the Wave
A dev server that relies on [ECMAScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). 🚧 WIP 🚧.

## How it works
The idea is to use JavaScript modules, that were introduced in ECMAScript 2015 Language Specification and already implemented by [major browsers](https://caniuse.com/es6-module). Using JavaScript modules we can skip a bundling step, which combines all dependant javascript files into a single one that we can run in the browser, and let browser to load all the dependant files itself on its own.

As a benefit:
- Get feedback earlier, since we don't need to wait for server to prepare initial chunk or to update existing one.
- Spend less time on a proper tooling setup.

Concerns:
- Browser will make way more network requests to load a page. However, it be addressed by [HTTP/2](https://en.wikipedia.org/wiki/HTTP/2).
- Existing packages still may use [CommonJS modules](https://requirejs.org/docs/commonjs.html), thus it takes additional effort to convert them. Good news, we do it for you 😉

## Try it yourself

Install package:
```
npm install under-the-wave
```

Create `index.html` and use `<script type=module src='..'></script>` to embed modules. Use `import` and `export` keywords to declare additional dependencies and module's exports inside of module.

Start server:
```
under-the-wave
```
