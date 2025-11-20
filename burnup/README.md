# Burnup

Script to create a burnup chart.

This should work for both frontend and backend teams because both of our
story point label formats are supported.

The start and end date as well as the fall break date are hardcoded currently.

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
- `-s`: Total story points over time, as a semicolon separated list of day,points pairs. You can use +N or -N for the
  points to change it by an amount.

   eg `0,388;24,-15` (frontend team release plan total) or `0,147;24,-6` (backend)

- `-t`: Chart title, eg `Frontend Team Burnup Chart`

- `-o`: Output path, eg `burnup.png`

Example output:

![frontend team burnup chart](https://github.com/user-attachments/assets/05ad92a1-beb7-4f59-8bbb-941dcc7648f1)

![backend team burnup chart](https://github.com/user-attachments/assets/0b480643-dc7b-4521-95ed-721467ce892c)
