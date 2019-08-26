import { Store } from 'redux'

import { Thunk } from './types'

export const createExpectThunk = <
  Runner extends new (...args: any) => any,
  ExtraArg extends any
>(
  TestRunner: Runner,
  createStore: () => Store,
  extraArg: ExtraArg,
) => (thunk: Thunk<ExtraArg>): InstanceType<Runner> =>
  new TestRunner(thunk, createStore(), extraArg) as any
