import '@stringsync/container'; // need reflect-metadata package
import { generateSchema } from './generateSchema';

it('runs without crashing', () => {
  expect(generateSchema).not.toThrow();
});
