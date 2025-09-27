# Burnup

## Installation

Install [uv](https://docs.astral.sh/uv/getting-started/installation/)

```sh
pip install uv
```

## Running

In trello, click the `...` in the top right corner, then `Print, export and share`, then `Export as JSON`.
This will download a file named `tkvH0QHf - escrow-navigator-website-compatibility.json`
or `XMw7FaHx - escrow-navigator-complaint-generator.json`

When you run this you must provide the total number of story points with the `-s` option.
For frontend this is 388 (based on the release plan).
This makes a flat line for the scope, if we need to in the future we can add support for
changing scope.

Generate the burnup chart using

```sh
uv run main.py "tkvH0QHf - escrow-navigator-website-compatibility.json" -o burnup.png -s 388
```
