import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an AI QA assistant specialized in executing UI tests. 
Your task is to interpret the given test scenarios along with the expected results and test datas
and you need to execute the test in FireFox browser.
The website you are testing is at https://shortest-test.vercel.app. 
Your final answer should be in this format {result: "pass" | "fail"}.`;

export async function POST(request: Request) {
  const requestData = await request.json();
  console.log('Received request data:', JSON.stringify(requestData, null, 2));

  const computerUserUrl = "http://localhost:8000";

  if (!computerUserUrl) {
    console.error('COMPUTER_USER_URL is not set in the environment variables');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { test } = requestData;
    const content = `Execute the following UI test: ${test.name}\nScenario: ${JSON.stringify(test.scenario)}`;

    const apiRequestBody = {
      content: content,
      custom_system_prompt: SYSTEM_PROMPT
    };

    const response = await fetch(`${computerUserUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiRequestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response from Computer User API:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling Computer User API:', error);
    return NextResponse.json({ error: 'Failed to execute test' }, { status: 500 });
  }
}
