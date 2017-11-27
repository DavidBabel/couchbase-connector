import {assert} from 'chai';
import {get, put} from '../connectors/couchbase';
// export for tests
export {clear} from '../connectors/couchbase';

export async function initCampaignInCouchbase(campaignJson) {
  await put('campaign', campaignJson.id, campaignJson);
}

export async function expectCappingToBe(cappingKey, valueKey, expectedValue) {
  const value = await get(cappingKey, valueKey);
  assert.equal(value, expectedValue);
}
