import { GraphqlClient } from '../graphql';
import { Query, Mutation, LoginInput, SignupInput } from '../graphqlTypes';
import { gql } from '../gql';

export class AuthClient {
  graphqlClient: GraphqlClient;

  constructor(graphqlClient: GraphqlClient) {
    this.graphqlClient = graphqlClient;
  }

  async whoami() {
    return await this.graphqlClient.call<Query['whoami'], 'whoami'>(gql`
      query {
        whoami {
          id
          email
          username
          role
          confirmedAt
        }
      }
    `);
  }

  async login(input: LoginInput) {
    return await this.graphqlClient.call<Mutation['login'], 'login', { input: LoginInput }>(
      gql`
        mutation login($input: LoginInput!) {
          login(input: $input) {
            id
            email
            username
            role
            confirmedAt
          }
        }
      `,
      { input }
    );
  }

  async logout() {
    return await this.graphqlClient.call<Mutation['logout'], 'logout'>(gql`
      mutation logout {
        logout
      }
    `);
  }

  async signup(input: SignupInput) {
    return await this.graphqlClient.call<Mutation['signup'], 'signup', { input: SignupInput }>(
      gql`
        mutation signup($input: SignupInput!) {
          signup(input: $input) {
            id
            email
            username
            role
            confirmedAt
          }
        }
      `,
      { input }
    );
  }
}
