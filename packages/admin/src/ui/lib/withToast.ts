import { toast } from "@repo/ui";
import { getErrorMessage } from "./getErrorMessage";

/**
 * Wraps an async mutation so it shows a success toast on resolve and an error toast on reject.
 * On success, the success message is built from the label + past-tense verb (e.g. "Post created").
 * The original error is rethrown so callers can keep their error-handling flow.
 */
export function withToast<TArgs extends unknown[], TResult>(
  label: string,
  verb: string,
  fn: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      const result = await fn(...args);
      toast.success(`${label} ${verb}`);
      return result;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };
}
