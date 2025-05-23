

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

export async function createSchemaHandler(_request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const client = await getGraphClient();

  try {
    const schemaExtension = {
      id: "userDataTest",
      description: "Custom user properties for IQHub",
      targetTypes: ["User"],
      properties: [
        {
          name: 'master',
          type: 'Boolean'
        },
        {
          name: 'roles',
          type: 'String'
        },
      ]
    };

    const schema = await client.api('/schemaExtensions')
      .post(schemaExtension);

    console.log("Schema:", schema);

    const updatedSchema = await client.api(`/schemaExtensions/${schema.id}`)
      .update({ status: "Available" });

    console.log("Updated Schema:", updatedSchema);

    return { status: 201, jsonBody: schema };
  } catch (error) {

    console.error("Error creating schema:", error.message);
    console.error(error);

    return { status: 500, jsonBody: { error: "Failed to create schema" } };
  }
}