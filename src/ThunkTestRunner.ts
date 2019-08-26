import { mockReturnValue } from './mockReturnValue'
import {
  Expectation,
  MockImplementation,
  MockReturns,
  MockReturnsOrImplementation,
  Thunk as DefaultThunk,
} from './types'
import { AnyAction, Store } from 'redux'

const isMockReturns = (
  mock: MockReturnsOrImplementation,
): mock is MockReturns => typeof mock !== 'function'

const isMockImplementation = (
  mock: MockReturnsOrImplementation,
): mock is MockImplementation => typeof mock === 'function'

export class ThunkTestRunner<Thunk extends DefaultThunk, ExtraArg extends any> {
  private nextAssertionIsInverted = false
  private thunk: Thunk
  private expectations: Expectation<ExtraArg>[] = []

  protected store: Store
  protected dispatch: jest.Mock
  protected getState: jest.Mock
  protected extraArg: ExtraArg

  get not() {
    this.nextAssertionIsInverted = true

    return this
  }

  constructor(thunk: Thunk, store: Store, extraArg?: ExtraArg) {
    this.extraArg = extraArg
    this.store = store
    this.thunk = thunk
    this.dispatch = jest.fn()
    this.getState = jest.fn(this.store.getState)
  }

  protected mockDependency<
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

  protected addExpectation(expectation: Expectation<ExtraArg>) {
    this.expectations = [...this.expectations, expectation]

    return this
  }

  withDispatch(mockDispatch: MockReturnsOrImplementation) {
    return this.mockDependency(mockDispatch, this.dispatch)
  }

  withActions(...actions: any) {
    actions.forEach(action => this.store.dispatch(action))

    return this
  }

  toDispatch(...action: any) {
    return this.addExpectation(({ dispatch }) => {
      this.getExpectation(dispatch).toHaveBeenCalledWith(...action)
    })
  }

  toDispatchActionType(actionCreator: (...args: any[]) => AnyAction) {
    return this.addExpectation(({ dispatch }) => {
      this.getExpectation(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: actionCreator().type }),
      )
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

  toMeetExpectation(expectation: Expectation<ExtraArg>) {
    return this.addExpectation(expectation)
  }

  protected getExpectation(value: any) {
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
