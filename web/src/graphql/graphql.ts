import { extractFiles } from 'extract-files';
import { GraphQLError } from 'graphql';
import { UnknownError } from '../errors';
import { Mutation, Query } from './graphqlTypes';
import { GraphqlResponse, RequestType } from './types';

export const URI = `${window.location.origin}/graphql`;

/**
 * The purpose of this method is to make a request that follows the
 * graphql multipart spec:
 *
 * https://github.com/jaydenseric/graphql-multipart-request-spec
 */
export const graphql = async <
  T extends RequestType,
  N extends Exclude<keyof T, '__typename'>,
  V extends Record<string, any> | void = void
>(
  uri: string,
  query: string,
  variables?: V
): Promise<GraphqlResponse<T, N>> => {
  const formData = makeFormData(query, variables);

  try {
    const res = await fetch(uri, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
      credentials: 'include',
      mode: 'cors',
    });

    const contentType = res.headers.get('content-type');
    if (!contentType?.toLowerCase().includes('application/json')) {
      throw new UnknownError();
    }

    return await res.json();
  } catch (error) {
    // Allow callers to treat misc errors as graphql errors,
    // since they should already be expecting them.
    return { data: null, errors: [error as GraphQLError] };
  }
};

export const makeFormData = <V extends Record<string, any> | void = void>(query: string, variables?: V): FormData => {
  // extract files
  const extraction = extractFiles<File>(
    { query, variables },
    undefined,
    (value: any): value is File => value instanceof File
  );
  const clone = extraction.clone;
  const fileMap = extraction.files;

  // compute map
  const map: { [key: string]: string | string[] } = {};
  const pathGroups = Array.from(fileMap.values());
  for (let ndx = 0; ndx < pathGroups.length; ndx++) {
    const paths = pathGroups[ndx];
    map[ndx] = paths;
  }

  // create form data
  const formData = new FormData();
  formData.append('operations', JSON.stringify(clone));
  formData.append('map', JSON.stringify(map));

  // append files to form data
  const files = Array.from(fileMap.keys());
  for (let ndx = 0; ndx < files.length; ndx++) {
    const file = files[ndx];
    formData.append(ndx.toString(), file, `@${file.name}`);
  }

  return formData;
};

export const query = async <N extends Exclude<keyof Query, '__typename'>, V extends Record<string, any> | void = void>(
  query: string,
  variables?: V
) => {
  return await graphql<Query, N, V>(URI, query, variables);
};

export const mutation = async <
  N extends Exclude<keyof Mutation, '__typename'>,
  V extends Record<string, any> | void = void
>(
  query: string,
  variables?: V
) => {
  return await graphql<Mutation, N, V>(URI, query, variables);
};
