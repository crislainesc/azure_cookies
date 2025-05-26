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

export async function assingRoleHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const body = await request.json() as any;

  console.log("Request body:", body);

  const { appObjectId, userObjectId, appRoleId = '00000000-0000-0000-0000-000000000000' } = await body

  const client = await getGraphClient();

  try {

    const appRoleAssignment = {
      principalId: userObjectId,
      resourceId: appObjectId,
      appRoleId: appRoleId
    };

    const assignmentResponse = await client.api(`/servicePrincipals/${appObjectId}/appRoleAssignments`)
      .post(appRoleAssignment);

    return { status: 200, jsonBody: assignmentResponse };
  } catch (error) {

    console.error("Error assinging user role:", error.message);
    console.error(error);

    return { status: 500, jsonBody: { error: "Failed to assing user role" } };
  }
}