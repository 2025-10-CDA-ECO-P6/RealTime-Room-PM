export function ValidationExtension() {
  return (_req: Request, _res: Response, next: Function) => {
    // TODO: implement validation

    next();
  };
}
