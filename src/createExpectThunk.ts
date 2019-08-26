import { Store } from 'redux'

import { Thunk as DefaultThunk } from './types'

export const createExpectThunk = <
  Runner extends new (...args: any) => any,
  ExtraArg extends any
>(
  TestRunner: Runner,
  createStore: () => Store,
  getExtraArg: () => ExtraArg,
) => <Thunk extends DefaultThunk>(thunk: Thunk): InstanceType<Runner> =>
  new TestRunner(thunk, createStore(), getExtraArg()) as any
