# Burnup

## Installation

Install [uv](https://docs.astral.sh/uv/getting-started/installation/)

```sh
pip install uv
```

## Exporting data

In Trello,

1. Click the `...` in the top right corner
2. `Print, export and share`
3. `Export as JSON`

This will download a file named `tkvH0QHf - escrow-navigator-website-compatibility.json`
or `XMw7FaHx - escrow-navigator-complaint-generator.json`.

## Running

This script takes:

- Exported json path
- `-s`: Total story points, eg `388` (frontend team release plan total)

  This makes a flat line for the scope, if we need to in the future we can add support for
  scope that changes over time.

- `-t`: Chart title, eg `Frontend Team Burnup Chart`

- `-o`: Output path, eg `burnup.png`

Example:

```sh
uv run main.py "tkvH0QHf - escrow-navigator-website-compatibility.json" -t "Frontend Team Burnup Chart" -o burnup.png -s 388
```

Example output:

![example burnup chart](https://github.com/user-attachments/assets/05ad92a1-beb7-4f59-8bbb-941dcc7648f1)
