import * as R from 'ramda'

import { MockReturns, MockReturn } from './types'

const findMatch = (
  fnArgs: any[],
  { partial, args, return: returnValue }: MockReturn,
) => {
  if (args) {
    const testArgs = partial ? R.take(args.length, fnArgs) : fnArgs

    return R.equals(testArgs, args) ? returnValue : undefined
  }

  return returnValue
}

const isMockReturn = (mock: MockReturns): mock is MockReturn =>
  !Array.isArray(mock)

export const mockReturnValue = (
  mockFn: jest.Mock<any, any>,
  mocks: MockReturns,
) => {
  mockFn.mockImplementation((...fnArgs: any[]) => {
    if (isMockReturn(mocks)) {
      return findMatch(fnArgs, mocks)
    }

    const match = mocks.find(
      mockReturn => findMatch(fnArgs, mockReturn) !== undefined,
    )

    if (match) return match.return
  })

  return mockFn
}
