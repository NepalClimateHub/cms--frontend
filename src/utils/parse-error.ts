export const parseError = (error: any): string => {
  console.log('Raw error object in parseError:', JSON.stringify(error, null, 2));

  try {
  
    if (error.error?.message) {
      console.log('Error message (from error.error):', error.error.message);
      return error.error.message; 
    }

  
    if (error.error?.details?.message) {
      console.log('Details message:', error.error.details.message);
      return error.error.details.message;
    }


    throw new Error('No message found in error object');
  } catch (err) {
  
    if (err instanceof Error) {
      console.error('Error in parseError:', err.message);
    } else {
      console.error('Error in parseError:', err);
    }
    throw err; 
  }
};