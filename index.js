#!/usr/bin/env node

const debug = Boolean(process.env.DEBUGME)

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const jsdomConsole = new jsdom.VirtualConsole();

// Suppress these errors for now
jsdomConsole.on('jsdomError', () => { });

const options = {
  features: {
    FetchExternalResources: false,
    ProcessExternalresources: false,
  },
  virtualConsole: jsdomConsole,
};

const createDOMPurify = require('dompurify');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const sanitizeHtml = require('sanitize-html');
const program = require('commander');
const pkg = require('./package.json');
const Readability = require('readability');

const readability = (dom) => {
  // Happens on missing file
  if (!dom) return;
  const article = new Readability(dom.window.document).parse();

  if (!article) {
    console.error('Error: Readability returned nothing. This usually happens on empty input');
    return;
  }
  if (debug) {
    console.error(JSON.stringify(article));
  }
  if (article.title) {
    console.log('<h1>', sanitizeHtml(article.title), '</h1>')
  }
  console.log(sanitizeHtml(article.content));
};

const isURL = (str) => {
  const regex = new RegExp('^https?:\\/\\/');
  return regex.test(str);
};

const handleError = err => console.error(err.toString());

const run = (sources) => {
  const promises = sources.map(source =>
    (isURL(source) ?
      DOMPurify.fromURL(source, options) :
      DOMPurify.fromFile(source, options)
    ));
  Promise.all(promises).then((doms) => {
    doms.forEach(readability);
  })
    .catch(handleError);
};

program
  .version(pkg.version)
  .arguments('[sources...]')
  .description('Parses each source with Readability and prints cleaned HTML to stdout. source can be a file path or URL.')
  .action(run)
  .parse(process.argv);

(async () => {
  if (program.args.length === 0) {
    const getStdin = require('get-stdin');
    var doc = await getStdin();

    const clean = DOMPurify.sanitize(doc);
    readability(new JSDOM(clean, options));
  }
})();
