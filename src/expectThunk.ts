import ThunkTestRunner from './ThunkTestRunner'

export const createExpectThunk = <T extends typeof ThunkTestRunner>(
  TestRunner: T,
) => (...args: ConstructorParameters<typeof ThunkTestRunner>) =>
  new TestRunner(...args)

export const expectThunk = createExpectThunk(ThunkTestRunner)
