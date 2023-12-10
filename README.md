# Javascript Helper Functions

This package contains commonly used js functions, to be used as functional utility helpers within your Javascript
project.

It's equivalent to a [Facade](https://youtu.be/9tYHxA9HchI?si=3K3FgzyAIeMEn0P7) for JS utilities.

## Requirement

- ES6 compatible project, or must set this package to be transpiled.

## Usage

### 1. Initial Setup

```js
import { current } from '@webframer/js'

current.log = require('chalk') // use colored console.log for Node.js
current.Storage = require('node-persist') // set localStorage for Node.js
```
