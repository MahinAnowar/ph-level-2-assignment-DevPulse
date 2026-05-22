import { Response } from 'express';

interface ResponseData<T> {
  statusCode: number;
  message?: string;
  data?: T;
}

/**
 * Sends a standardized success response.
 * Shape: { success: true, message?, data? }
 * `message` and `data` are only included when provided, so the same
 * helper works for create/update (message + data), list (data only),
 * and delete (message only) responses.
 */
const sendResponse = <T>(res: Response, payload: ResponseData<T>): void => {
  const responseBody: Record<string, unknown> = { success: true };

  if (payload.message !== undefined) {
    responseBody.message = payload.message;
  }
  if (payload.data !== undefined) {
    responseBody.data = payload.data;
  }

  res.status(payload.statusCode).json(responseBody);
};

export default sendResponse;
