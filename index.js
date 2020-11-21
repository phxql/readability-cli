#!/usr/bin/env node

const debug = Boolean(process.env.DEBUGME)

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const jsdomConsole = new jsdom.VirtualConsole();

// Suppress these errors for now
jsdomConsole.on('jsdomError', () => {
});

const createDOMPurify = require('dompurify');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const sanitizeHtml = require('sanitize-html');
const program = require('commander');
const pkg = require('./package.json');
var {Readability} = require('@mozilla/readability');

const purifyOptions = {
  // Return the whole purified document, otherwise the title extraction from readability won't work
  WHOLE_DOCUMENT: true
}

const sanitizerOptions = {
  // Allow all tags
  allowedTags: false,
  // Allow all attributes
  allowedAttributes: false
}

const readability = (dom, url) => {
  // Happens on missing file
  if (!dom) return null;
  const article = new Readability(dom.window.document).parse();

  if (!article || !article.content) {
    console.error(`Error: Readability returned nothing for url "${url}". This usually happens on empty input.`);
    return null;
  }

  article.url = url;
  // Sanitize content
  article.content = sanitizeHtml(article.content, sanitizerOptions);
  if (article.title) {
    // Sanitize title, don't allow any tags in the title
    article.title = sanitizeHtml(article.title, {allowedTags: [], allowedAttributes: {}});
  }

  return article;
};


const run = (url) => {
  (async () => {
    const getStdin = require('get-stdin');
    var doc = await getStdin();

    const sanitizedDom = DOMPurify.sanitize(doc, purifyOptions);
    if (debug) {
      console.error('url: ', url)
    }
    const options = {
      features: {
        FetchExternalResources: false,
        ProcessExternalresources: false,
      },
      virtualConsole: jsdomConsole,
      url: url,
    };

    const article = readability(new JSDOM(sanitizedDom, options), url);
    if (article == null) {
      process.exit(1);
    } else {
      console.log(JSON.stringify(article));
    }
  })();
};

program
  .version(pkg.version)
  .arguments('<url>')
  .description('Sanitizes stdin, parses the result with Mozilla Readability, somewhat sanitizes the output again, and finally prints it to stdout. Note that you need to also specify the URL in addition to feeding us the HTML in stdin. Using an empty URL seems to work though.')
  .action(run)
  .parse(process.argv);

