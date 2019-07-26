import * as R from 'ramda'

import { MockReturns } from './types'

export const mockReturnValue = (
  mockFn: jest.Mock<any, any>,
  mockReturns: MockReturns,
) => {
  mockFn.mockImplementation((...fnArgs: any[]) => {
    if (!Array.isArray(mockReturns)) {
      if (mockReturns.args) {
        const testArgs = mockReturns.partial
          ? R.take(mockReturns.args.length, fnArgs)
          : fnArgs

        return R.equals(testArgs, mockReturns.args)
          ? mockReturns.return
          : undefined
      }

      return mockReturns.return
    }

    const mock = mockReturns.find(({ args, partial }) => {
      const testArgs = partial ? R.take(args.length, fnArgs) : fnArgs

      return R.equals(testArgs, args)
    })

    if (mock) {
      return mock.return
    }
  })

  return mockFn
}
