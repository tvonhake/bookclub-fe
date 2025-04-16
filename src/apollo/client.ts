import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { tokenStorage } from '../utils/tokenStorage';
import { csrf } from '../utils/csrf';
import CryptoJS from 'crypto-js';
import { GraphQLRequest } from '@apollo/client/core';

// Security constants
const REQUEST_SIGNING_KEY = import.meta.env.VITE_REQUEST_SIGNING_KEY;

if (!REQUEST_SIGNING_KEY) {
    throw new Error('VITE_REQUEST_SIGNING_KEY environment variable is required');
}

interface RequestSignature {
    signature: string;
    timestamp: string;
}

// Request signing function
const signRequest = (request: GraphQLRequest): RequestSignature => {
    const timestamp = new Date().toISOString();
    const dataToSign = {
        query: request.query,
        variables: request.variables || {}
    };
    const stringToSign = JSON.stringify(dataToSign) + timestamp;
    const signature = CryptoJS.HmacSHA256(stringToSign, REQUEST_SIGNING_KEY).toString();

    return { signature, timestamp };
};

const httpLink = createHttpLink({
    uri: import.meta.env.VITE_API_URL || 'http://localhost:3000/graphql',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

const authLink = setContext((request: GraphQLRequest, { headers }) => {
    const token = tokenStorage.getToken();
    const csrfHeader = csrf.getHeader();
    const { signature, timestamp } = signRequest(request);

    return {
        headers: {
            ...headers,
            ...csrfHeader,
            authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
            ...request,
            extensions: {
                ...request.extensions,
                security: { signature, timestamp }
            }
        })
    };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
            console.error(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
            );
        });
    }

    if (networkError) {
        console.error(`[Network error]: ${networkError}`);

        // Handle token expiration
        if (networkError.message.includes('401')) {
            tokenStorage.removeToken();
        }
    }
});

const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'network-only',
        },
        query: {
            fetchPolicy: 'network-only',
        },
        mutate: {
            fetchPolicy: 'network-only',
        },
    },
});

export default client; 