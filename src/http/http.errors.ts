import { BadRequestError, BaseError, ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError } from '../errors';

export const httpErrorMapping: Record<number, typeof BaseError> = {
  400: BadRequestError,
  401: UnauthorizedError,
  403: ForbiddenError,
  404: NotFoundError,
  500: InternalServerError,
};

const getErrorFromStatusCode = (statusCode: number): typeof BaseError =>
  httpErrorMapping[statusCode] || httpErrorMapping[500];

export default getErrorFromStatusCode;
