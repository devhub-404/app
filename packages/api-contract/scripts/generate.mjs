import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = path.join(packageRoot, 'openapi.json');
const output = path.join(packageRoot, 'src/generated.ts');
const openapiBytes = fs.readFileSync(input);
const openapiHash = crypto.createHash('sha256').update(openapiBytes).digest('hex');
const document = JSON.parse(openapiBytes.toString('utf8'));

function refName(ref) {
  return ref?.split('/').at(-1);
}

function tsType(schema) {
  if (!schema) return 'unknown';
  if (schema.$ref) return `components["schemas"]["${refName(schema.$ref)}"]`;
  if (schema.allOf) return schema.allOf.map(tsType).join(' & ');
  if (schema.oneOf) return schema.oneOf.map(tsType).join(' | ');
  if (schema.anyOf) return schema.anyOf.map(tsType).join(' | ');
  if (schema.nullable) return `${tsType({ ...schema, nullable: false })} | null`;
  if (schema.enum) return schema.enum.map((value) => JSON.stringify(value)).join(' | ') || 'never';
  if (schema.type === 'array') return `${tsType(schema.items)}[]`;
  if (schema.type === 'object' || schema.properties || schema.additionalProperties) {
    const required = new Set(schema.required ?? []);
    const properties = Object.entries(schema.properties ?? {})
      .map(([name, value]) => `      ${JSON.stringify(name)}${required.has(name) ? '' : '?'}: ${tsType(value)};`)
      .join('\n');
    const additional = schema.additionalProperties ? '      [key: string]: unknown;\n' : '';
    return `\n    {\n${additional}${properties}\n    }`;
  }
  if (schema.type === 'number' || schema.type === 'integer') return 'number';
  if (schema.type === 'boolean') return 'boolean';
  if (schema.type === 'string') return 'string';
  return 'unknown';
}

function parameterType(parameters, location) {
  const selected = (parameters ?? []).filter((parameter) => parameter.in === location);
  if (!selected.length) return 'never';
  return `{ ${selected
    .map((parameter) => `${JSON.stringify(parameter.name)}${parameter.required ? '' : '?'}: ${tsType(parameter.schema)}`)
    .join('; ')} }`;
}

function responseType(operation) {
  const responses = Object.entries(operation.responses ?? {}).map(([status, response]) => {
    const schema = response?.content?.['application/json']?.schema;
    const content = schema ? `{ "application/json": ${tsType(schema)} }` : 'Record<string, never>';
    return `      ${JSON.stringify(status)}: { headers: { [name: string]: unknown }; content: ${content} };`;
  });
  return responses.length ? `\n${responses.join('\n')}\n    ` : 'never';
}

const methods = ['get', 'post', 'put', 'patch', 'delete'];
const operations = [];
const paths = [];

for (const [route, item] of Object.entries(document.paths ?? {})) {
  const methodLines = [];
  for (const method of methods) {
    const operation = item[method];
    if (!operation) continue;
    operations.push([operation.operationId, operation, item.parameters ?? []]);
    methodLines.push(`    ${method}: operations["${operation.operationId}"];`);
  }
  paths.push(`  ${JSON.stringify(route)}: {\n    parameters: { query?: never; header?: never; path?: never; cookie?: never };\n${methodLines.join('\n')}\n  };`);
}

const schemas = Object.entries(document.components?.schemas ?? {})
  .map(([name, schema]) => `    ${JSON.stringify(name)}: ${tsType(schema)};`)
  .join('\n');

const operationTypes = operations
  .map(([id, operation, pathParameters]) => {
    const parameters = [...pathParameters, ...(operation.parameters ?? [])];
    const requestBody = operation.requestBody?.content?.['application/json']?.schema;
    const request = operation.requestBody
      ? `\n    requestBody: { content: { "application/json": ${tsType(requestBody)} } };`
      : '\n    requestBody?: never;';
    return `  ${JSON.stringify(id)}: {\n    parameters: { query?: ${parameterType(parameters, 'query')}; header?: never; path?: ${parameterType(parameters, 'path')}; cookie?: never };${request}\n    responses: {${responseType(operation)}};\n  };`;
  })
  .join('\n');

const generated = `/**
 * Generated from the API OpenAPI document.
 * OpenAPI SHA-256: ${openapiHash}.
 * Do not edit manually.
 */

export interface paths {
${paths.join('\n')}
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
${schemas}
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export interface operations {
${operationTypes}
}
`;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, generated);
console.log(`Generated ${path.relative(process.cwd(), output)} (${operations.length} operations; ${Object.keys(document.components?.schemas ?? {}).length} schemas).`);
