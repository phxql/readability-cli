# readability-cli

A CLI for [Mozilla's Readability][1].

## Install

To install globally with `yarn`:

`yarn global add mozilla-readability-cli`

To install globally with `npm`:

`npm install -g mozilla-readability-cli`

## Usage

```
# run readability --help for the latest version, I just copy it here once in a while.

Usage: readability [options] <url>

Sanitizes stdin, parses the result with Mozilla Readability, somewhat sanitizes the output again, and finally print it to stdout. Note that you need to also specify the URL in addition to feeding us the HTML in stdin. Using an empty URL seems to work though.

Options:
  -V, --version  output the version number
  -h, --help     display help for command
```


## Examples

`curl https://example.com | readability https://example.com `

[1]: //github.com/mozilla/readability
