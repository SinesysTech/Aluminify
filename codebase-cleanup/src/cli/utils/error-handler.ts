/**
 * Error Handler
 * 
 * Centralized error handling for CLI commands.
 */

/**
 * Handle errors gracefully with user-friendly messages
 */
export function handleError(error: unknown, command: string): never {
  console.error('\n❌ Error occurred during execution:\n');

  if (error instanceof Error) {
    console.error(`Message: ${error.message}\n`);

    // Provide context-specific guidance
    if (error.message.includes('ENOENT')) {
      console.error('💡 Tip: Check that the specified path exists and is accessible.\n');
    } else if (error.message.includes('EACCES')) {
      console.error('💡 Tip: Check file permissions. You may need elevated privileges.\n');
    } else if (error.message.includes('JSON')) {
      console.error('💡 Tip: Ensure the input file is valid JSON format.\n');
    } else if (error.message.includes('parse') || error.message.includes('syntax')) {
      console.error('💡 Tip: There may be syntax errors in the files being analyzed.\n');
    }

    // Show stack trace in verbose mode
    if (process.env.DEBUG || process.env.VERBOSE) {
      console.error('Stack trace:');
      console.error(error.stack);
      console.error('');
    } else {
      console.error('Run with DEBUG=1 or VERBOSE=1 environment variable for detailed error information.\n');
    }
  } else {
    console.error(`Unknown error: ${String(error)}\n`);
  }

  console.error(`Command failed: ${command}\n`);
  process.exit(1);
}
