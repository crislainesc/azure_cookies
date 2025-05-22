import { HttpRequest, InvocationContext, HttpResponseInit } from "@azure/functions";

export async function logoutHandler(_request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  return {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    jsonBody: { message: 'Logout successful!' },
    cookies: [{
      name: 'session',
      value: '',
      maxAge: 0,
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    }]
  }
}