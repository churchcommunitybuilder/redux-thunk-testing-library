export type Thunk = (
  dispatch: jest.SpyInstance,
  getState: jest.SpyInstance,
  extraArg?: any,
) => any

type ExpectationContext<ExtraArg = any> = {
  dispatch: jest.SpyInstance
  getState: jest.SpyInstance
  extraArg: ExtraArg
  isNegated: boolean
  output: any
}

export type Expectation<ExtraArg = any> = (
  context: ExpectationContext<ExtraArg>,
) => void

export type MockReturn = {
  args?: any[]
  partial?: boolean
  return: any
}

export type MockReturns = MockReturn | MockReturn[]
export type MockImplementation = (mockFn: jest.SpyInstance | jest.Mock) => void

export type MockReturnsOrImplementation = MockReturns | MockImplementation
