import type { NextApiRequest, NextApiResponse } from 'next';
import {
  validationResult,
  type ValidationChain,
  type ValidationError,
} from 'express-validator';

type NextFn = (_result?: unknown) => void;

const validateMiddleware = (validations: ValidationChain[]) => {
  return async (req: NextApiRequest, res: NextApiResponse, next: NextFn) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    const errorObject: Record<string, ValidationError> = {};
    errors.array().forEach((error) => {
      const key = (error as ValidationError & { param?: string }).param;
      if (key) {
        errorObject[key] = error;
      }
    });
    res.status(422).json({ errors: errorObject });
  };
};

export default validateMiddleware;
