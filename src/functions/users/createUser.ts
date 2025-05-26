import * as dotenv from "dotenv";
dotenv.config();

import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

function generateSecurePassword(length: number = 16): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  return Array.from(array)
    .map((val) => charset[val % charset.length])
    .join('');
}

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

function getUserEmail(email: string, userType: string): string {
  if (userType === "external") {
    return email;
  }

  return `${email?.split('@')[0]}@Criissantosoutlook.onmicrosoft.com`;
}

export async function createUserHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const body = await request.json() as any;

  console.log("Request body:", body);

  const { name, email, phone, userType } = await body

  const password = generateSecurePassword(16);
  const client = await getGraphClient();
  const userEmail = getUserEmail(email, userType);

  try {
    if (userType === "guest") {
      const userParams = {
        invitedUserEmailAddress: userEmail,
        inviteRedirectUrl: 'https://google.com',
        sendInvitationMessage: true,
      }

      console.log("Inviting user:", userParams);

      const invited = await client.api('/invitations').post(userParams);

      console.log("User invited:", invited);

      return { status: 201, jsonBody: invited };
    }

    else if (userType === "external") {
      const userParams = {
        displayName: name,
        identities: [
          {
            signInType: 'emailAddress',
            issuer: 'Criissantosoutlook.onmicrosoft.com',
            issuerAssignedId: email
          }
        ],
        mail: email,
        passwordProfile: {
          forceChangePasswordNextSignIn: true,
          password,
        },
      };

      console.log("Creating user:", userParams);

      const user = await client.api('/users').post(userParams);

      console.log("User created:", user);

      console.log("Updating user at:", `/users/${user.id}`);

      // Updating general user information
      // await client.api(`/users/${user.id}`).update({
      //   mobilePhone: phone, businessPhones: [phone], extg0ugdhy5_userDataTest: {
      //     roles: ["admin", "user"].join(","),
      //     master: true
      //   }
      // });

      console.log("Finished user creation.");

      return { status: 201, jsonBody: user };
    }

    else if (userType === "internal") {
      const userParams = {
        accountEnabled: true,
        displayName: name,
        mailNickname: userEmail?.split('@')[0],
        userPrincipalName: `${email?.split('@')[0]}@Criissantosoutlook.onmicrosoft.com`,
        passwordProfile: {
          forceChangePasswordNextSignIn: true,
          password,
        },
      };

      console.log("Creating user:", userParams);

      const user = await client.api('/users').post(userParams);

      console.log("User created:", user);

      console.log("Updating user at:", `/users/${user.id}`);

      // Updating general user information
      await client.api(`/users/${user.id}`).update({
        mobilePhone: phone, businessPhones: [phone], extg0ugdhy5_userDataTest: {
          roles: ["admin", "user"].join(","),
          master: true
        }
      });

      console.log("Finished user creation.");

      return { status: 201, jsonBody: user };
    }

    return { status: 400, jsonBody: { error: "Invalid user type" } };
  } catch (error) {

    console.error("Error creating user:", error.message);
    console.error(error);

    return { status: 500, jsonBody: { error: "Failed to create user" } };
  }
}