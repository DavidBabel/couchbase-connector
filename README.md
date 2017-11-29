# Couchbase Connector

## Warning

To run `npm install` or `yarn install` in your project with this module in it you need to store your key in a ssh-agent or in your MacOs Keychain : https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/

## Install

To install it in your project, think to fix the version using this kind of command :

```bash
yarn add Ogury/couchbase-connector#v1.X.X
```

## Requirements

if you want to import this npm module in your project, you have to define the following environnement variables :

```bash
COUCHBASE_HOST
```

## Usage

This connector module help to connect and interact with a Couchbase server.
You first need to initialise the connector with a config Object, containing somethin like this :

```javascript
const configObjects = {
  // identifier for one of your object; can be for example: campaign, externalAccomplished ...
  identifier: {
    // template of keys for this bucket
    buildKey: (value) => {
      return `test:${value}:test`;
    },
    // the bucket to used
    bucket: 'cappings',
    // options ...
    opts: {
      expiry: 86400,
      initial: 1,
    },
  } // ....
  // another identifier ... etc
}
```

Then pass this object throught this methods, with the list of bucket checked by the Couchbase getStatus(). It's recommanded to do this in your main index.js file :

```javascript
// @param2 : specify bucket name to check on getStatus() :
initCouchbase(configObjects, 'bucketName');
// or
initCouchbase(configObjects, ['bucket1', 'bucket2', 'bucket3']);
```

Here is the full API you can use after initCouchbase() :

```javascript
import {
  initCouchbase,
  getStatus,
  put,
  get,
  getWithCache,
  initCounter,
  increment
} from 'couchbase-connector';

initCouchbase(_bucketsConfig: Object, _statusBuckets: [string] | string);

// example in tests :
import {bucketsConfig} from './config/buckets.config.js';

beforeEach(() => {
  initCouchbase(bucketsConfig, 'default');
});

// retreive status, used by healthcheck
async getStatus();

put(bucketKey: string, key: string, value: Promise<Object>): void;
get(bucketKey: string, key: string) : Promise<Object>;
async getWithCache(bucketKey: string, key: string): Promise<Object>;

initCounter(bucketKey: string, value: string, initialValue: number)
increment(bucketKey: string, value: string): Promise<Object>
```

Helpers are also available for test purpose :

```javascript
import {
  initCampaignInCouchbase,
  expectCappingToBe
} from 'couchbase-connector/helpers';

// create a campaign object in Couchbase
// @campaignJson should have an id
async initCampaignInCouchbase(campaignJson);
// same as
await put('campaign', campaignJson.id, campaignJson);

// allow comparing cappings
async expectCappingToBe(cappingKey, valueKey, expectedValue);
```

## Usage with health controller

```javascript
import healthController, {addHealthCheck} from 'health-controller';
import {initCouchbase, getStatus as getCouchbaseStatus} from 'couchbase-connector';
import bucketsConfig from './config/buckets.config';

initCouchbase(bucketsConfig, ['cappings', 'campaign']);
addHealthCheck(getCouchbaseStatus);
app.use('/health', healthController);
```

## Work on it

### Quickstart

```bash
yarn install
yarn build
```

### Tests

```bash
yarn test
```