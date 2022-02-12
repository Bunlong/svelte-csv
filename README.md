# svelte-csv

svelte-csv is the fastest in-browser CSV (or delimited text) parser for Svelte. It is full of useful features such as CSVDownloader, readString, jsonToCSV, readRemoteFile, CSVReader, ... etc.

## 🔧 Install

svelte-csv is available on npm. It can be installed with the following command:

```
npm install svelte-csv --save
```

svelte-csv is available on yarn as well. It can be installed with the following command:

```
yarn add svelte-csv --save
```

## ℹ️ Usage

You need to install `papaparse` manually if you get error `'/node_modules/papaparse/papaparse.min.js?v=8573111b' does not provide an export named 'default'`.

papaparse is available on npm. It can be installed with the following command:

```
npm install papaparse @types/papaparse --save
```

papaparse is available on yarn as well. It can be installed with the following command:

```
yarn add papaparse @types/papaparse --save
```

## 📚 Useful Features

* [x] CSVDownloader
* [x] readString
* [x] readRemoteFile
* [x] jsonToCSV
* [ ] CSVReader

## 💡 Usage

### 🎀 CSVDownloader

If you want to open your CSV files in Excel, you might want to set `bom={true}` or `bom`, default is `false`. This option adds the so called BOM byte `'\ufeff'` to the beginning of your CSV files and tells Excel that the encoding is UTF8.

#### Link

```javascript
import { CSVDownloader } from 'svelte-csv';

<CSVDownloader
  data={[
    {
      "Column 1": "1-1",
      "Column 2": "1-2",
      "Column 3": "1-3",
      "Column 4": "1-4",
    },
    {
      "Column 1": "2-1",
      "Column 2": "2-2",
      "Column 3": "2-3",
      "Column 4": "2-4",
    },
    {
      "Column 1": "3-1",
      "Column 2": "3-2",
      "Column 3": "3-3",
      "Column 4": "3-4",
    },
    {
      "Column 1": 4,
      "Column 2": 5,
      "Column 3": 6,
      "Column 4": 7,
    },
  ]}
  filename={'filename'}
  bom={true}
>
  Download
</CSVDownloader>
```

#### Link

```javascript
import { CSVDownloader } from 'svelte-csv';

<CSVDownloader
  data={[
    {
      "Column 1": "1-1",
      "Column 2": "1-2",
      "Column 3": "1-3",
      "Column 4": "1-4",
    },
    {
      "Column 1": "2-1",
      "Column 2": "2-2",
      "Column 3": "2-3",
      "Column 4": "2-4",
    },
    {
      "Column 1": "3-1",
      "Column 2": "3-2",
      "Column 3": "3-3",
      "Column 4": "3-4",
    },
    {
      "Column 1": 4,
      "Column 2": 5,
      "Column 3": 6,
      "Column 4": 7,
    },
  ]}
  type={'button'}
  filename={'filename'}
  bom={true}
>
  Download
</CSVDownloader>
```

### 🎀 readString

```javascript
import { readString } from 'svelte-csv';

const str = `Column 1,Column 2,Column 3,Column 4
1-1,1-2,1-3,1-4
2-1,2-2,2-3,2-4
3-1,3-2,3-3,3-4
4,5,6,7`;

const results = readString(str);
```

### 🎀 readRemoteFile

```javascript
import { readRemoteFile } from 'svelte-csv'

readRemoteFile(
  url,
  {
    complete: (results) => {
      console.log('Results:', results)
    }
  }
);
```

### 🎀 jsonToCSV

```javascript
import { jsonToCSV } from 'svelte-csv';

const jsonData = `[
  {
      "Column 1": "1-1",
      "Column 2": "1-2",
      "Column 3": "1-3",
      "Column 4": "1-4"
  },
  {
      "Column 1": "2-1",
      "Column 2": "2-2",
      "Column 3": "2-3",
      "Column 4": "2-4"
  },
  {
      "Column 1": "3-1",
      "Column 2": "3-2",
      "Column 3": "3-3",
      "Column 4": "3-4"
  },
  {
      "Column 1": 4,
      "Column 2": 5,
      "Column 3": 6,
      "Column 4": 7
  }
]`;

const results = jsonToCSV(jsonData);
```

## 📜 Changelog

Latest version 1.2.5 (2022-02-12):

  * Fix `'/node_modules/papaparse/papaparse.min.js?v=8573111b' does not provide an export named 'default`

Details changes for each release are documented in the [CHANGELOG.md](https://github.com/Bunlong/svelte-csv/blob/master/CHANGELOG.md).

## ❗ Issues

If you think any of the `svelte-csv` can be improved, please do open a PR with any updates and submit any issues. Also, I will continue to improve this, so you might want to watch/star this repository to revisit.

## 🌟 Contribution

We'd love to have your helping hand on contributions to `svelte-csv` by forking and sending a pull request!

Your contributions are heartily ♡ welcome, recognized and appreciated. (✿◠‿◠)

How to contribute:

- Open pull request with improvements
- Discuss ideas in issues
- Spread the word
- Reach out with any feedback

## ⚖️ License

The MIT License [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
