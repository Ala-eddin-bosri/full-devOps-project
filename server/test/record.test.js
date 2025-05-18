const request = require("supertest");
const app = require("../app");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { MongoClient, ObjectId } = require("mongodb");
const dbo = require("../db/conn");

let mongoServer;
let db;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db("testDB");
  dbo.setDb(db); // You’ll need to implement this method in conn.js
});

afterAll(async () => {
  await mongoServer.stop();
});

describe("Record API", () => {
  let recordId;

  it("should add a new record", async () => {
    const res = await request(app)
      .post("/record/add")
      .send({ name: "John", position: "Developer", level: "Junior" });

    expect(res.statusCode).toBe(201);
    expect(res.body.insertedId).toBeDefined();
    recordId = res.body.insertedId;
  });

  it("should return all records", async () => {
    const res = await request(app).get("/record");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it("should return one record by ID", async () => {
    const res = await request(app).get(`/record/${recordId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(recordId);
  });

  it("should update a record", async () => {
    const res = await request(app)
      .post(`/update/${recordId}`)
      .send({ name: "Jane", position: "Manager", level: "Senior" });

    expect(res.statusCode).toBe(200);
    expect(res.body.modifiedCount).toBe(1);
  });

  it("should delete a record", async () => {
    const res = await request(app).delete(`/${recordId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.deletedCount).toBe(1);
  });
});
