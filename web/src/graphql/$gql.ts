import { extractFiles } from 'extract-files';
import { GraphQLError } from 'graphql';
import { isObject, isString } from 'lodash';
import { mutation, params, query, rawString } from 'typed-graphqlify';
import { Params } from 'typed-graphqlify/dist/render';
import { DeepPartial, OnlyKey } from '../util/types';
import { Mutation, Query } from './graphqlTypes';
import * as helpers from './helpers';
import { ObjectPath } from './ObjectPath';
import { t } from './t';

export type Root = Query | Mutation;
export type Fields<T extends Root> = keyof T;
export type Compiler = typeof query | typeof mutation;

export type Any$gql = $gql<any, any, any, any>;
export type RootOf<G extends Any$gql> = G extends $gql<infer T, any, any, any> ? T : never;
export type FieldOf<G extends Any$gql> = G extends $gql<any, infer F, any, any> ? F : never;
export type DataOf<G extends Any$gql> = G extends $gql<any, any, infer Q, any> ? Q : never;
export type VariablesOf<G extends Any$gql> = G extends $gql<any, any, any, infer V> ? V : never;

export type SuccessfulResponse<G extends Any$gql> = { data: OnlyKey<FieldOf<G>, DataOf<G>>; errors?: never };
export type FailedResponse = { data: null; errors: GraphQLError[] };
export type GraphqlResponseOf<G extends Any$gql> = SuccessfulResponse<G> | FailedResponse;

type Prim = string | boolean | number | null;
type Variables = { [key: string]: Prim | Variables | Variables[] };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class $gql<T extends Root, F extends Fields<T>, Q, V> {
  static t = t;

  static query<F extends Fields<Query>>(field: F) {
    return new GqlBuilder<Query, F>(query, field, undefined, undefined);
  }

  static mutation<F extends Fields<Mutation>>(field: F) {
    return new GqlBuilder<Mutation, F>(mutation, field, undefined, undefined);
  }

  constructor(
    private readonly compiler: Compiler,
    private readonly field: string | symbol | number,
    private readonly query: Q,
    private readonly variables: V
  ) {}

  toString(variables: V): string {
    const result = isObject(variables)
      ? this.compiler({ [this.field]: params(this.graphqlify(variables), this.query) })
      : this.compiler({ [this.field]: this.query });
    return result.toString();
  }

  toFormData(variables: V): FormData {
    // extract files
    const extraction = extractFiles<File>(
      { query: this.toString(variables), variables },
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
  }

  private graphqlify(variables: Record<any, any>, path = ObjectPath.create()): Params {
    const params: Params = {};

    for (const [key, value] of Object.entries(variables)) {
      const inner = (value: Prim | Variables | Variables[], innerPath: ObjectPath): any => {
        if (isString(value) && !this.isEnum(innerPath)) {
          return rawString(value);
        } else if (Array.isArray(value)) {
          return value.map((el) => inner(el, innerPath.add(ObjectPath.STAR)));
        } else if (isObject(value)) {
          return this.graphqlify(value, innerPath);
        } else {
          return value;
        }
      };
      params[key] = inner(value, path.add(key));
    }

    return params;
  }

  private isEnum(path: ObjectPath): boolean {
    const t = path.get(this.variables);
    const meta = helpers.getMeta(t);
    return !!meta && !!meta.isEnum;
  }
}

class GqlBuilder<
  T extends Root,
  F extends Fields<T>,
  Q extends DeepPartial<T[F]> | void = void,
  V extends Record<string, any> | void = void
> {
  private compiler: Compiler;
  private field: F;
  private query: Q;
  private variables: V;

  constructor(compiler: Compiler, field: F, query: Q, variables: V) {
    this.compiler = compiler;
    this.field = field;
    this.query = query;
    this.variables = variables;
  }

  setQuery<_Q extends DeepPartial<T[F]>>(query: _Q) {
    return new GqlBuilder<T, F, _Q, V>(this.compiler, this.field, query, this.variables);
  }

  setVariables<_V extends Record<string, any>>(variables: _V) {
    return new GqlBuilder<T, F, Q, _V>(this.compiler, this.field, this.query, variables);
  }

  build() {
    // validate query
    if (!this.query) {
      throw new Error(`must set query before building`);
    }
    this.compiler(this.query);

    // validate variables
    if (this.variables) {
      this.compiler(this.variables);
    }

    return new $gql<T, F, Q, V>(this.compiler, this.field, this.query, this.variables);
  }
}
