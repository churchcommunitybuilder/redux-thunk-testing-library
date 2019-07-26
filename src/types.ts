export type Thunk<ExtraArg> = (
  dispatch: jest.Mock,
  getState: jest.Mock<{}>,
  extraArg: ExtraArg,
) => any

export type ThunkTestRunnerOptions = {
  extraArg?: any
  store?: any
}

type ExpectationContext<ExtraArg> = {
  dispatch: jest.Mock
  getState: jest.Mock
  extraArg: ExtraArg
  output: any
}

export type Expectation<ExtraArg> = (
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
