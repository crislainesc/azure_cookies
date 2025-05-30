import * as dotenv from "dotenv";
dotenv.config();

import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

async function getGraphClient() {
  const tenantId = process.env.TENANT_ID ?? "";
  const clientId = process.env.CLIENT_ID ?? "";
  const clientSecret = process.env.CLIENT_SECRET ?? "";
  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

  const token = await credential.getToken("https://graph.microsoft.com/.default");

  console.log("Token:", token);

  const client = Client.init({
    authProvider: (done) => {
      done(null, token?.token || "");
    },
  });

  return client;
}

export async function listUsersHandler(_request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const client = await getGraphClient();

  try {
    console.log("Listing users");

    const users = await client.api('/users')
      .select('displayName')
      .filter(`id eq '143c6792-add5-467a-9ba1-769d648a9795'`)
      .get();
    console.log("Users:", users);

    return { status: 200, jsonBody: users };
  } catch (error) {

    console.error("Error listing users:", error.message);
    console.error(error);

    return { status: 500, jsonBody: { error: "Failed to list users" } };
  }
}