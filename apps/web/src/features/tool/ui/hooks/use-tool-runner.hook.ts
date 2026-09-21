import { createStore } from 'solid-js/store';
import { executeTool, type ToolMode } from '../../utils/execute-tool.util.ts';
import type { ToolDefinition } from '../../domain/tool-catalog.domain.ts';

export function useToolRunner(tool: ToolDefinition, processingError: string) {
  const [state, setState] = createStore({ input: '', output: '', error: '' });

  const run = (mode: ToolMode = 'encode') => {
    setState('error', '');
    try {
      setState('output', executeTool(tool, state.input, mode));
    } catch {
      setState({ output: '', error: processingError });
    }
  };

  const reset = () => setState({ input: '', output: '', error: '' });

  return {
    input: () => state.input,
    setInput: (input: string) => setState('input', input),
    output: () => state.output,
    error: () => state.error,
    run,
    reset,
  };
}
