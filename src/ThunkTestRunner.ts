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

export class ThunkTestRunner<Thunk extends DefaultThunk, ExtraArg extends any, RunnerStore extends Store = Store> {
  private thunk: Thunk
  private expectations: ([Expectation<ExtraArg>, boolean])[] = []

  protected isNegated = false
  protected store: RunnerStore
  protected dispatchSpy: jest.SpyInstance<ReturnType<RunnerStore['dispatch']>, [any]>
  protected getStateSpy: jest.SpyInstance<ReturnType<RunnerStore['getState']>, []>
  protected extraArg: ExtraArg

  get not() {
    this.isNegated = true

    return this
  }

  constructor(thunk: Thunk, store: RunnerStore, extraArg?: ExtraArg) {
    this.extraArg = extraArg
    this.thunk = thunk
    this.store = store
    this.dispatchSpy = jest.spyOn(store, 'dispatch' as any) as any
    this.getStateSpy = jest.spyOn(store, 'getState' as any) as any
  }

  protected mockDependency<
    M extends MockReturns | MockImplementation,
    F extends jest.Mock | jest.SpyInstance
  >(mock: M, mockFn: F) {
    if (isMockReturns(mock)) {
      mockReturnValue(mockFn, mock)
    } else if (isMockImplementation(mock)) {
      mock(mockFn)
    }

    return this
  }

  protected addExpectation(expectation: Expectation<ExtraArg>) {
    this.expectations = [...this.expectations, [expectation, this.isNegated]]

    this.isNegated = false
    return this
  }

  withDispatch(mockDispatch: MockReturnsOrImplementation) {
    return this.mockDependency(mockDispatch, this.dispatchSpy)
  }

  withActions(...actions: any) {
    actions.forEach(action =>
      (this.dispatchSpy as any)(
        ...(Array.isArray(action) ? action : [action]),
      ),
    )

    return this
  }

  toDispatch(...action: any[]) {
    return this.addExpectation(({ dispatch, isNegated }) => {
      if (action.length > 0) {
        this.getExpectation(dispatch, isNegated).toHaveBeenCalledWith(...action)
      } else {
        this.getExpectation(dispatch, isNegated).toHaveBeenCalled()
      }
    })
  }

  toDispatchActionType(actionCreator: (...args: any[]) => AnyAction) {
    return this.addExpectation(({ dispatch, isNegated }) => {
      this.getExpectation(dispatch, isNegated).toHaveBeenCalledWith(
        expect.objectContaining({ type: actionCreator().type }),
      )
    })
  }

  toReturn(expectedOutput: any, strictEqualityCheck = false) {
    return this.addExpectation(({ output, isNegated }) => {
      const expectation = this.getExpectation(output, isNegated)

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

  protected getExpectation(value: any, isNegated = false) {
    const expectation = expect(value)

    if (isNegated) {
      return expectation.not
    }

    return expectation
  }

  async run() {
    const output = await this.thunk(this.dispatchSpy, this.getStateSpy, this.extraArg)

    this.expectations.forEach(([expectation, isNegated]) => {
      expectation({
        dispatch: this.dispatchSpy,
        getState: this.getStateSpy,
        extraArg: this.extraArg,
        isNegated,
        output,
      })
    })

    return {
      dispatch: this.dispatchSpy,
      state: this.store.getState(),
      extraArg: this.extraArg,
    }
  }
}
