const { MongoClient } = require("mongodb");
const { config } = require("dotenv");
config();
let url = process.env.MONGO_URL;
const client = new MongoClient(url);
const bloggers = client.db("iBlogg").collection("bloggers");
const bloggs = client.db("iBlogg").collection("posts");
module.exports = { bloggers, bloggs };
