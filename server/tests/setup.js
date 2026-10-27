const mongoose = require("mongoose");

// Each test file uses its own database on the shared in-memory server.
beforeAll(async () => {
  const dbName = `test-${Date.now()}-${Math.round(Math.random() * 1e6)}`;

  await mongoose.connect(process.env.MONGO_TEST_URI, { dbName });

  // Wait for unique indexes so duplicate checks are reliable.
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
});

// Start every test with empty collections.
afterEach(async () => {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
