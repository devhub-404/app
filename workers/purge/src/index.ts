interface Env {
  API: Fetcher;
}

export default {
  async scheduled(
    _controller: ScheduledController,
    _env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    // Domain-specific purge jobs will be added after the setup is validated.
  }
} satisfies ExportedHandler<Env>;
