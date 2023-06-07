# Javascript Helper Functions
This package contains commonly used js functions, to be used as functional utility helpers within your Javascript project.

## Requirement
- ES6 compatible project, or must set this package to be transpiled.
  
## Usage
### 1. Initial Setup

```js
import { Current } from '@webframer/js'

Current.log = require('chalk') // use colored console.log for Node.js
Current.Storage = require('node-persist') // set localStorage for Node.js
```
