const { MongoMemoryServer } = require("mongodb-memory-server");

// One in-memory MongoDB for the whole test run.
module.exports = async () => {
  const mongoServer = await MongoMemoryServer.create();

  globalThis.__MONGO_SERVER__ = mongoServer;
  process.env.MONGO_TEST_URI = mongoServer.getUri();
};
