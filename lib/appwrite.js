import { Client, Account, Avatars, TablesDB } from "react-native-appwrite";

const client = new Client();

client
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("6a577026002453a35cad");

const account = new Account(client);
const avatars = new Avatars(client);
const tablesDB = new TablesDB(client);

export { client, account, avatars, tablesDB };
