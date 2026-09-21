import { Logger } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';

const logger = new Logger('AuthBestEffortEffects');

/**
 * Best-effort effects are still awaited inside the current serverless
 * invocation so the runtime is not asked to keep background work alive after
 * the response. Failure is logged and deliberately does not change the
 * primary/auth enumeration-safe response.
 */
export async function emitBestEffort(eventEmitter: EventEmitter2, eventName: string, payload: unknown): Promise<void> {
  try {
    await eventEmitter.emitAsync(eventName, payload);
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error';
    logger.warn(`Best-effort auth effect failed: event=${eventName} reason=${reason}`);
  }
}
