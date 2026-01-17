/**
 * Progress Tracker
 * 
 * Provides visual feedback for long-running CLI operations.
 */

export class ProgressTracker {
  private currentMessage: string = '';
  private startTime: number = 0;

  /**
   * Start a new progress indicator
   */
  start(message: string): void {
    this.currentMessage = message;
    this.startTime = Date.now();
    process.stdout.write(`⏳ ${message}`);
  }

  /**
   * Update the current progress message
   */
  update(message: string): void {
    // Clear current line
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    
    this.currentMessage = message;
    process.stdout.write(`⏳ ${message}`);
  }

  /**
   * Complete the current progress with a success message
   */
  complete(message: string): void {
    // Clear current line
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    
    const duration = Date.now() - this.startTime;
    const durationStr = duration > 1000 
      ? `${(duration / 1000).toFixed(2)}s`
      : `${duration}ms`;
    
    console.log(`✅ ${message} (${durationStr})`);
    this.currentMessage = '';
  }

  /**
   * Mark the current progress as failed
   */
  fail(message: string): void {
    // Clear current line
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    
    console.log(`❌ ${message}`);
    this.currentMessage = '';
  }
}
