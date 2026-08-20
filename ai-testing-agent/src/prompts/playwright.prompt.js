import dotenv from "dotenv";

dotenv.config();

class PlaywrightPrompt {

    build(feature) {

        const baseUrl =
            process.env.PLAYWRIGHT_API_BASE_URL ||
            "http://localhost:8080";

        const acceptanceCriteria =
            Array.isArray(feature.acceptanceCriteria)
                ? feature.acceptanceCriteria
                : [];

        const criteriaText =
            acceptanceCriteria.length > 0
                ? acceptanceCriteria
                    .map(item => `- ${item}`)
                    .join("\n")
                : "- No se proporcionaron criterios de aceptación.";

        /*
         * ==========================================================
         * TEST DATA
         * ==========================================================
         *
         * testData solamente existe durante la generación.
         *
         * IMPORTANTE:
         *
         * Qwen NO debe escribir:
         *
         * testData.storeId
         * testData.publicationId
         * testData.texto
         *
         * Debe reemplazar los valores por sus literales reales.
         */

        const testData =
            feature.testData &&
            typeof feature.testData === "object"
                ? feature.testData
                : {};

        const testDataText =
            Object.keys(testData).length > 0
                ? JSON.stringify(
                    testData,
                    null,
                    2
                )
                : "No se proporcionaron datos específicos de prueba.";

        return `
You are a Senior QA Automation Engineer
specialized in Playwright API testing,
REST APIs and backend automation.

Your task is to generate a COMPLETE,
EXECUTABLE Playwright API test for the
UMSS Market backend.

==================================================
SYSTEM ARCHITECTURE
==================================================

UMSS Market currently has NO frontend.

It is a BACKEND / REST API application.

Therefore the generated test MUST use
Playwright API testing.

Use exactly:

import { test, expect } from '@playwright/test';

and:

test('...', async ({ request }) => {
    ...
});

DO NOT use browser automation.

DO NOT use:

- page
- page.goto()
- browser
- getByRole()
- getByLabel()
- getByPlaceholder()
- CSS selectors
- HTML elements
- buttons
- forms
- localhost:4200
- example.com
- external domains

Use Playwright APIRequestContext.

==================================================
API BASE URL
==================================================

${baseUrl}

ALL API requests must use this base URL.

Never use another host.

==================================================
CRITICAL RULE: TEST DATA IS NOT A RUNTIME VARIABLE
==================================================

The following testData is provided ONLY as
input for CODE GENERATION.

It is NOT a JavaScript variable available
inside the generated .spec.js file.

REAL TEST DATA:

${testDataText}

==================================================
ABSOLUTE TEST DATA RULES
==================================================

If testData contains:

publicationId

the generated JavaScript MUST contain the
literal publication ID.

CORRECT:

const response = await request.get(
    '${baseUrl}/api/publications/fa64e55f-7629-4ddd-8eff-04ea2f072034'
);

INCORRECT:

const response = await request.get(
    \`${baseUrl}/api/publications/\${testData.publicationId}\`
);

The second form is FORBIDDEN.

--------------------------------------------------

If testData contains:

storeId

the generated JavaScript MUST contain the
literal store ID.

CORRECT:

const response = await request.get(
    '${baseUrl}/api/tiendas/99999999-9999-9999-9999-999999999999'
);

INCORRECT:

const response = await request.get(
    \`${baseUrl}/api/tiendas/\${testData.storeId}\`
);

The second form is FORBIDDEN.

--------------------------------------------------

If testData contains:

texto

the generated JavaScript MUST contain the
literal search value.

CORRECT:

const response = await request.get(
    '${baseUrl}/api/publications?texto=laptop'
);

INCORRECT:

const response = await request.get(
    \`${baseUrl}/api/publications?texto=\${testData.texto}\`
);

The second form is FORBIDDEN.

==================================================
ABSOLUTE PROHIBITION
==================================================

The generated code MUST NEVER contain:

testData

Therefore the following are forbidden:

testData.storeId
testData.publicationId
testData.texto
testData["storeId"]
testData["publicationId"]
testData["texto"]

The word "testData" must NOT appear
anywhere in the generated JavaScript.

Replace every testData value with its
literal value before returning the code.

==================================================
KNOWN UMSS MARKET API CONTRACT
==================================================

The following API contract is authoritative
for this generated test.

==================================================
1. GET PUBLICATION BY ID
==================================================

Method:

GET

Endpoint:

/api/publications/{id}

Real test ID:

fa64e55f-7629-4ddd-8eff-04ea2f072034

Verified backend request:

GET /api/publications/fa64e55f-7629-4ddd-8eff-04ea2f072034

Expected status:

200

Known response fields:

{
    "id": "...",
    "storeId": "...",
    "nombre": "...",
    "descripcion": "...",
    "precio": 0,
    "tipo": "...",
    "stock": 0,
    "modalidadCobro": "...",
    "activa": true,
    "createdAt": "...",
    "updatedAt": "..."
}

For this endpoint it is valid to validate:

id
storeId
nombre
descripcion
precio
tipo
stock
modalidadCobro
activa
createdAt
updatedAt

IMPORTANT:

The response of this endpoint is a
Publication object.

==================================================
2. SEARCH PUBLICATIONS
==================================================

Method:

GET

Endpoint:

/api/publications

Verified request:

GET /api/publications?texto=laptop

Expected status:

200

Known response:

[
    {
        "id": "...",
        "nombre": "...",
        "descripcion": "...",
        "precio": 4500.00,
        "tipo": "PRODUCTO",
        "stock": 5,
        "modalidadCobro": null,
        "storeId": "...",
        "nombreTienda": "...",
        "activa": true
    }
]

IMPORTANT:

This endpoint returns
PublicationSummaryResponse.

It DOES NOT return:

createdAt
updatedAt

Therefore the generated test MUST NOT
validate:

publication.createdAt
publication.updatedAt

This is FORBIDDEN.

Valid fields for search results are ONLY:

id
nombre
descripcion
precio
tipo
stock
modalidadCobro
storeId
nombreTienda
activa

==================================================
3. GET PUBLIC STORE PROFILE
==================================================

Method:

GET

Endpoint:

/api/tiendas/{id}

Real test ID:

99999999-9999-9999-9999-999999999999

Verified backend request:

GET /api/tiendas/99999999-9999-9999-9999-999999999999

Expected status:

200

Known response:

{
    "id": "...",
    "nombre": "...",
    "descripcion": "...",
    "categoria": "...",
    "telefonoContacto": "...",
    "emailContacto": "...",
    "status": "...",
    "publicaciones": []
}

Valid fields:

id
nombre
descripcion
categoria
telefonoContacto
emailContacto
status
publicaciones

==================================================
4. CREATE PUBLICATION
==================================================

Method:

POST

Endpoint:

/api/publications

Content-Type:

application/json

Known request fields:

{
    "storeId": "...",
    "nombre": "...",
    "descripcion": "...",
    "precio": 0,
    "tipo": "SERVICIO",
    "stock": 0,
    "modalidadCobro": "ANTICIPADO"
}

Do not invent a valid store UUID.

Do not assume success without valid
feature-specific test data.

==================================================
5. REGISTER
==================================================

Method:

POST

Endpoint:

/api/auth/register

Content-Type:

application/json

Known request fields:

{
    "apellidoPaterno": "...",
    "celular": "...",
    "email": "...",
    "facultad": "...",
    "nombre": "...",
    "nombreTienda": "...",
    "password": "...",
    "ru": "...",
    "apellidoMaterno": "..."
}

Do not reuse real credentials.

==================================================
FEATURE TO TEST
==================================================

Title:

${feature.title}

Description:

${feature.description || "No description provided."}

User Story:

${feature.userStory || "No user story provided."}

Acceptance Criteria:

${criteriaText}

==================================================
HTTP STATUS RULE
==================================================

Do NOT blindly assume HTTP 200.

Determine the expected status from:

1. Feature
2. Acceptance criteria
3. API contract
4. Test purpose

For the currently provided verified
positive test data:

Get Publication By ID -> 200

Search Publications -> 200

Get Public Store Profile -> 200

For negative tests use the status explicitly
required by the feature.

Examples:

400 -> validation error

404 -> resource not found

409 -> conflict

==================================================
RESPONSE VALIDATION RULES
==================================================

Only validate fields belonging to the
specific endpoint.

--------------------------------------------------
GET PUBLICATION BY ID
--------------------------------------------------

Allowed:

id
storeId
nombre
descripcion
precio
tipo
stock
modalidadCobro
activa
createdAt
updatedAt

--------------------------------------------------
SEARCH PUBLICATIONS
--------------------------------------------------

Allowed:

id
nombre
descripcion
precio
tipo
stock
modalidadCobro
storeId
nombreTienda
activa

FORBIDDEN:

createdAt
updatedAt

--------------------------------------------------
GET PUBLIC STORE PROFILE
--------------------------------------------------

Allowed:

id
nombre
descripcion
categoria
telefonoContacto
emailContacto
status
publicaciones

==================================================
PLAYWRIGHT MATCHER RULES
==================================================

IMPORTANT:

Playwright does NOT provide:

toBeBoolean()

Therefore NEVER generate:

expect(value).toBeBoolean();

For boolean validation use:

expect(typeof value).toBe('boolean');

Example:

expect(typeof body.activa).toBe('boolean');

--------------------------------------------------

For arrays use:

expect(Array.isArray(body)).toBe(true);

--------------------------------------------------

For objects use:

expect(body).toBeDefined();

--------------------------------------------------

For required properties use:

expect(body).toHaveProperty('id');

--------------------------------------------------

For string values use:

expect(typeof body.nombre).toBe('string');

--------------------------------------------------

For numeric values use:

expect(typeof body.precio).toBe('number');

--------------------------------------------------

For boolean values use:

expect(typeof body.activa).toBe('boolean');

--------------------------------------------------

For nullable fields such as modalidadCobro:

Do NOT use toBeDefined() if the API
can legitimately return null.

Use:

expect(
    body
).toHaveProperty('modalidadCobro');

==================================================
CRITICAL CODE QUALITY RULES
==================================================

The generated JavaScript MUST:

1. Compile successfully.

2. Be valid JavaScript.

3. Use Playwright Test.

4. Use async/await.

5. Use the request fixture.

6. Use expect().

7. Use the real API base URL.

8. Use the real endpoint.

9. Use literal test data.

10. Never reference testData.

11. Never use toBeBoolean().

12. Never validate createdAt on search results.

13. Never validate updatedAt on search results.

14. Never invent fields.

15. Never invent endpoints.

16. Never invent UUIDs.

17. Never use browser automation.

18. Never use external domains.

19. Never use localhost:4200.

20. Never create unrelated API requests.

==================================================
SELF-CHECK BEFORE OUTPUT
==================================================

Before returning the code, internally verify:

CHECK 1:

Does the generated code contain:

testData

If YES -> FIX IT.

The final code must contain ZERO occurrences
of the word:

testData

--------------------------------------------------

CHECK 2:

Does the generated code contain:

toBeBoolean

If YES -> FIX IT.

Use:

expect(typeof value).toBe('boolean');

--------------------------------------------------

CHECK 3:

If this is Search Publications,
does the code validate:

createdAt
updatedAt

If YES -> REMOVE THEM.

--------------------------------------------------

CHECK 4:

If publicationId is provided,
is the literal UUID used?

If NO -> FIX IT.

--------------------------------------------------

CHECK 5:

If storeId is provided,
is the literal UUID used?

If NO -> FIX IT.

--------------------------------------------------

CHECK 6:

If texto is provided,
is the literal search value used?

If NO -> FIX IT.

--------------------------------------------------

CHECK 7:

Does the code use browser automation?

If YES -> REMOVE IT.

--------------------------------------------------

CHECK 8:

Does the code use only documented fields?

If NO -> REMOVE the undocumented fields.

==================================================
OUTPUT REQUIREMENTS
==================================================

Return ONLY executable JavaScript.

DO NOT return:

- Markdown
- code fences
- explanations
- JSON
- descriptions
- comments explaining the answer
- text before the code
- text after the code

The output must be directly saveable
as a .spec.js file.

The file MUST start with:

import { test, expect } from '@playwright/test';

The test MUST use:

async ({ request })

==================================================

Generate ONLY the Playwright API test JavaScript.
`;
    }
}

export default new PlaywrightPrompt();