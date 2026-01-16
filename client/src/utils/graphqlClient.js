import axios from 'axios';

const ls_GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

/**
 * Centralized GraphQL request function using axios
 * @param {string} ls_query - GraphQL query or mutation string
 * @param {object} lo_variables - Variables for the query/mutation
 * @returns {Promise<any>} - Response data
 * @throws {Error} - Throws error with appropriate message
 */
export const graphqlRequest = async (ls_query, lo_variables = {}) => {
  try {
    const lo_response = await axios.post(ls_GRAPHQL_ENDPOINT, {
      query: ls_query,
      variables: lo_variables,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check for GraphQL errors
    if (lo_response.data.errors) {
      const ls_errorMessage = lo_response.data.errors[0].message;
      throw new Error(ls_errorMessage);
    }

    return lo_response.data.data;
  } catch (lo_error) {
    // Handle axios errors
    if (lo_error.response) {
      // Server responded with error status
      throw new Error(lo_error.response.data?.errors?.[0]?.message || 'Server error occurred');
    } else if (lo_error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Error in request setup or GraphQL error
      throw lo_error;
    }
  }
};

export default graphqlRequest;
