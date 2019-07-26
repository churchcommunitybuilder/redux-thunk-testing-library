import ThunkTestRunner from './ThunkTestRunner'

export default (...args: ConstructorParameters<typeof ThunkTestRunner>) =>
  new ThunkTestRunner(...args)
