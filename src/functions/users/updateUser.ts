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

export async function updateUserHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const body = await request.json() as any;
  const userId = request.params.userId

  console.log("Request body:", body);

  const { password } = await body

  const client = await getGraphClient();

  const userParams = {
    passwordProfile: {
      forceChangePasswordNextSignIn: true,
      password,
    },
  };

  try {
    console.log("Updating user:", userParams);

    const updatedUser = await client.api(`/users/${userId}`).update(userParams);

    console.log("User updated:", updatedUser);

    return { status: 200, jsonBody: updatedUser };
  } catch (error) {

    console.error("Error updating user:", error.message);
    console.error(error);

    return { status: 500, jsonBody: { error: "Failed to update user" } };
  }
}