import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

/**
 * Thin wrapper around the OpenAI Chat Completions API.
 *
 * Implemented with the native `fetch` (Node 18+) so the project doesn't need an
 * extra npm dependency. Reads the key from the env (`openai_api_key`, with an
 * uppercase fallback) at call time so the app boots even if the key is missing.
 */
@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly model = process.env.OPENAI_MODEL || 'gpt-5.4';

  private get apiKey(): string {
    const key = process.env.openai_api_key || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new InternalServerErrorException('OpenAI API key is not configured (set openai_api_key in .env)');
    }
    return key;
  }

  /**
   * Send a system + user prompt and parse the model's reply as JSON.
   * Strips any accidental markdown code fences before parsing.
   */
  async chatJson<T = any>(
    systemPrompt: string,
    userPrompt: string,
    opts: { temperature?: number; maxTokens?: number } = {},
  ): Promise<T> {
    const raw = await this.chat(systemPrompt, userPrompt, opts);
    return this.parseJson<T>(raw);
  }

  /**
   * Low-level call returning the raw assistant message content.
   */
  async chat(
    systemPrompt: string,
    userPrompt: string,
    opts: { temperature?: number; maxTokens?: number } = {},
  ): Promise<string> {
    // GPT-5 family renamed `max_tokens` -> `max_completion_tokens` and only
    // accepts the default temperature (1). Older models keep the old params.
    const isGpt5 = /^gpt-5/i.test(this.model);
    const maxTokens = opts.maxTokens ?? 1000;

    const body: Record<string, any> = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    };

    if (isGpt5) {
      body.max_completion_tokens = maxTokens;
      // temperature intentionally omitted — GPT-5 only supports the default.
      // Lower reasoning effort = much faster responses (avoids client timeouts).
      body.reasoning_effort = process.env.OPENAI_REASONING_EFFORT || 'low';
    } else {
      body.max_tokens = maxTokens;
      body.temperature = opts.temperature ?? 0.7;
    }

    let response: Response;
    try {
      response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      this.logger.error(`OpenAI request failed: ${(err as Error).message}`);
      throw new InternalServerErrorException('Failed to reach the AI service. Please try again.');
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      this.logger.error(`OpenAI returned ${response.status}: ${errText}`);
      throw new InternalServerErrorException('The AI service returned an error. Please try again.');
    }

    const data: any = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new InternalServerErrorException('The AI service returned an empty response.');
    }
    return content;
  }

  private parseJson<T>(raw: string): T {
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/, '')
      .trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      this.logger.error(`Could not parse AI JSON response: ${cleaned.slice(0, 500)}`);
      throw new InternalServerErrorException('The AI returned an invalid response. Please try again.');
    }
  }
}
