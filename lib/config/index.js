/* @flow */

const defaultConfig = {
  ENV_NAME: 'local',
  COUCHBASE_HOST: ''
};

function getConfig(env: Object) {
  const config: Object = !env.ENV_NAME || env.ENV_NAME === 'local' ? defaultConfig : env;

  return {
    envName: config.ENV_NAME,
    couchbaseHost: config.COUCHBASE_HOST,
  };
}

export default getConfig(process.env);
