export default interface ObjectLiteral {
  [key: string]: any;
}

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};

export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

export const SuccessResponse = <T>(
  message: string,
  data?: T,
  status: boolean = true,
) => {
  return {
    status,
    message,
    data,
  };
};
