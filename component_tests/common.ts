import { MongoClient, Db } from "mongodb";
import users from "./data/users";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/wodbook-test";

let CLIENT_CACHE: MongoClient;

export const getMongoClient = async () => {
  if (CLIENT_CACHE) {
    return CLIENT_CACHE;
  }
  CLIENT_CACHE = await MongoClient.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return CLIENT_CACHE;
};

export const createUsers = async (db: Db) => {
  const userColl = db.collection("users");
  await userColl.deleteMany({});
  await userColl.insertMany(users);
};
