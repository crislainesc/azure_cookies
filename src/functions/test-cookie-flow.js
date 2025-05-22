import fetch from 'node-fetch'; 

const URL = 'http://localhost:7071/api/v1/cookie';

async function main() {
  const createRes = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const setCookie = createRes.headers.get('set-cookie');
  console.log('Set-Cookie:\n', setCookie);

  if (!setCookie) {
    console.error('Set-Cookie not found!');
    return;
  }

  const cookieValue = setCookie.split(';')[0];
  console.log('\nCookie:', cookieValue);

  const validCookie = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieValue
    }
  });

  const validText = await validCookie.text();
  console.log('\nValidation response:\n', validText);

  const invalidCookie = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieValue + 'invalidCookie'
    }
  });

  const invalidtext = await invalidCookie.text();
  console.log('\nValidation response:\n', invalidtext);
}

main().catch(err => console.error('Error:', err));
