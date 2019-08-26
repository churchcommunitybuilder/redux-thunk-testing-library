export type Thunk<ExtraArg = any> = (
  dispatch: jest.Mock,
  getState: jest.Mock,
  extraArg: ExtraArg,
) => any

type ExpectationContext<ExtraArg = any> = {
  dispatch: jest.Mock
  getState: jest.Mock
  extraArg: ExtraArg
  output: any
}

export type Expectation<ExtraArg = any> = (
  context: ExpectationContext<ExtraArg>,
) => void

type MockReturnBase = {
  args: any[]
  partial?: boolean
  return: any
}

export type MockReturns = MockReturnBase | MockReturnBase[]
export type MockImplementation = (mockFn: jest.Mock) => void

export type MockReturnsOrImplementation = MockReturns | MockImplementation
