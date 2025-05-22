import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as signature from 'cookie-signature'
import { SECRET } from "../../mocks";

export async function loginHandler(_request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const sessionValue = { "userId": "uuid", accessToken: "JSON token", roles: ['listUsers'] }

  const raw = JSON.stringify(sessionValue);

  const signed = signature.sign(raw, SECRET);
  console.log({ signed })

  return {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    jsonBody: { message: 'Login successful!' },
    cookies: [{
      name: 'session',
      value: signed,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    }]
  }
}