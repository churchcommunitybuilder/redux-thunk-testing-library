import * as R from 'ramda'

import { mockReturnValue } from './mockReturnValue'
import {
  Expectation,
  MockImplementation,
  MockReturns,
  MockReturnsOrImplementation,
  Thunk,
  ThunkTestRunnerOptions,
} from './types'

const isMockReturns = (
  mock: MockReturnsOrImplementation,
): mock is MockReturns => typeof mock !== 'function'

const isMockImplementation = (
  mock: MockReturnsOrImplementation,
): mock is MockImplementation => typeof mock === 'function'

export default class ThunkTestRunner<
  Options extends ThunkTestRunnerOptions,
  Action = {}
> {
  private nextAssertionIsInverted = false
  private thunk: Thunk<Options['extraArg']>
  private dispatch: jest.Mock
  private getState: jest.Mock
  private extraArg: Options['extraArg']
  private store: Options['store']
  private expectations: Expectation<Options['extraArg']>[] = []

  get not() {
    this.nextAssertionIsInverted = true

    return this
  }

  constructor(thunk: Thunk<Options['extraArg']>, options?: Options) {
    this.extraArg = R.prop('extraArg', options)
    this.store = R.propOr({}, 'store', options)
    this.thunk = thunk
    this.dispatch = jest.fn()
    this.getState = jest.fn(this.store.getState)
  }

  private mockDependency<
    M extends MockReturns | MockImplementation,
    F extends jest.Mock
  >(mock: M, mockFn: F) {
    if (isMockReturns(mock)) {
      mockReturnValue(mockFn, mock)
    } else if (isMockImplementation(mock)) {
      mock(mockFn)
    }

    return this
  }

  private addExpectation(expectation: Expectation<Options['extraArg']>) {
    this.expectations = [...this.expectations, expectation]

    return this
  }

  withDispatch(mockDispatch: MockReturnsOrImplementation) {
    return this.mockDependency(mockDispatch, this.dispatch)
  }

  withActions(...actions: Action[]) {
    actions.forEach(action => this.store.dispatch(action))

    return this
  }

  toDispatch(...action: any) {
    return this.addExpectation(({ dispatch }) => {
      this.getExpectation(dispatch).toHaveBeenCalledWith(...action)
    })
  }

  toReturn(expectedOutput: any, strictEqualityCheck = false) {
    return this.addExpectation(({ output }) => {
      const expectation = this.getExpectation(output)

      if (strictEqualityCheck) {
        expectation.toBe(expectedOutput)
      } else {
        expectation.toEqual(expectedOutput)
      }
    })
  }

  toMeetExpectation(expectation: Expectation<Options['extraArg']>) {
    return this.addExpectation(expectation)
  }

  private getExpectation(value: any) {
    const expectation = expect(value)

    if (this.nextAssertionIsInverted) {
      this.nextAssertionIsInverted = false
      return expectation.not
    }

    return expectation
  }

  async run() {
    const output = await this.thunk(this.dispatch, this.getState, this.extraArg)

    this.expectations.forEach(expectation => {
      expectation({
        dispatch: this.dispatch,
        getState: this.getState,
        extraArg: this.extraArg,
        output,
      })
    })

    return {
      dispatch: this.dispatch,
      state: this.getState(),
      extraArg: this.extraArg,
    }
  }
}
