import type {
  Entity,
  APIResponse,
  QueryObject,
  APIRequestInit,
} from "@hellhub-collective/sdk";

type RequestHandler<T extends Entity | Entity[]> = (
  input: any,
  options?: APIRequestInit<T>,
) => Promise<APIResponse<T>>;

export async function request<T extends Entity>(
  handler: RequestHandler<T>,
  id?: string | number | undefined,
  query?: QueryObject<T> | undefined,
  options?: APIRequestInit<T>,
) {
  let response: APIResponse<T | T[]>;

  if (!!id) {
    response = await handler(id, { query, ...options });
  } else {
    response = await handler(query ?? {}, options);
  }

  if (!response) {
    console.error("An unknown error occurred while fetching data.");
    process.exit(1);
  }

  if (response.status === 429) {
    const now = Date.now();
    const reset = parseInt(response.headers.get("x-rate-reset") ?? "0", 10);
    const seconds = Math.max(0, Math.ceil((reset - now) / 1000));

    console.error(
      `You are being rate limited. Please again in ${seconds} seconds.`,
    );

    process.exit(1);
  }

  const { data, error } = await response.json();

  if (!response.ok || !!error || !data) {
    console.error(error?.details?.[0]);
    process.exit(1);
  }

  return { data, url: response.url } as any as { data: T | T[]; url: string };
}
