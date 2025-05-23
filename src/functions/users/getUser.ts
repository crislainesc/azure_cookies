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

export async function getUserHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const userId = request.params.userId
  const client = await getGraphClient();

  try {
    console.log("Getting user at:", `/users/${userId}`);

    const user = await client.api(`/users/${userId}`)
      .select('displayName')
      .select('extg0ugdhy5_userDataTest')
      .get();
    console.log("User:", user);

    return { status: 200, jsonBody: user };
  } catch (error) {

    console.error("Error getting user:", error.message);
    console.error(error);

    return { status: 500, jsonBody: { error: "Failed to get user" } };
  }
}