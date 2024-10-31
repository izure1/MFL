export function catchError<T>(promise: Promise<T>): Promise<[undefined, T]|[Error]> {
  return promise
    .then((data) => [undefined, data] as [undefined, T])
    .catch((err) => [err])
}
