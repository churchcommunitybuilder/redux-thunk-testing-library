import { getStore, setId } from '../testStore'
import { ThunkTestRunner } from '../ThunkTestRunner'
import { Thunk } from '../types'

const unusedActionCreator = () => ({ type: 'other' })
const dispatchActionThunk = (value: number) => dispatch =>
  dispatch(setId(value))
const getStateThunk = (_, getState) => getState().id
const returnThunk = () => 2

describe('#expectThunk', () => {
  const extraArg = jest.fn(() => 3)
  const expectThunk = (thunk: any) => new ThunkTestRunner(thunk, getStore(), extraArg)

  describe('#withDispatch', () => {
    test('should mock dispatch implementation', async () => {
      const { state } = await expectThunk(dispatchActionThunk(1))
        .withDispatch(dispatch =>
          dispatch.mockImplementation(() => 3),
        )
        .toReturn(3)
        .run()
      state.id
    })

    test('should mock return values', async () => {
      await expectThunk(dispatchActionThunk(1))
        .withDispatch({
          args: [setId(1)],
          return: 3,
        })
        .toReturn(3)
        .run()
    })
  })

  describe('#withActions', () => {
    test('should dispatch actions to mock state', () =>
      expectThunk(getStateThunk)
        .withActions(setId(20))
        .toReturn(20)
        .run())
  })

  describe('#toDispatch', () => {
    test('should assert that the action was dispatched', () =>
      expectThunk(dispatchActionThunk(1))
        .not.toDispatch(unusedActionCreator())
        .toDispatch(setId(1))
        .run())
  })

  describe('#toDispatchActionType', () => {
    test('should assert that the action type was dispatched', () => {
      return expectThunk(dispatchActionThunk(1))
        .toDispatch(setId(1))
        .toDispatchActionType(setId)
        .run()
    })

    test('should allow negation', () => {
      return expectThunk(dispatchActionThunk(1))
        .not.toDispatchActionType(() => ({ type: 'other' }))
        .run()
    })
  })

  describe('#toHaveState', () => {
    test('should assert the state value', () =>
      expectThunk(dispatchActionThunk(1))
        .toDispatch(setId(1))
        .toHaveState(s => s.id, 1)
        .run())

    test('should be able to negate the assertion', () =>
      expectThunk(dispatchActionThunk(1))
        .toDispatch(setId(1))
        .not.toHaveState(s => s.id, 2)
        .run())
  })

  describe('#toReturn', () => {
    test('should assert the return value', () =>
      expectThunk(returnThunk)
        .not.toReturn(3)
        .toReturn(2)
        .run())
  })

  describe('#toMeetExpectation', () => {
    test('should meet custom expectations', () =>
      expectThunk(dispatch => {
        dispatch(setId(1))
        dispatch(setId(1))
        dispatch(setId(1))
      })
        .toMeetExpectation(({ dispatch }) => {
          expect(dispatch).toHaveBeenCalledTimes(3)
        })
        .run())
  })

  describe('extraArg', () => {
    describe('when an extra arg is provided', () => {
      test('should return the extra arg upon running', async () => {
        const { extraArg: returnedExtraArg } = await expectThunk(
          returnThunk,
        ).run()

        expect(returnedExtraArg).toBe(extraArg)
      })

      test('should have the arg available within the thunk', () =>
        expectThunk((_, __, extraArg) => extraArg())
          .toReturn(3)
          .run())
    })
  })
})

describe('ThunkTestRunner inheritance', () => {
  const thunk = (x: any) => (dispatch, getState, arg) => {
    arg(x)
  }

  class TestRunner extends ThunkTestRunner<Thunk, jest.Mock> {
    toCallExtraArgWith(expectedValue: any) {
      return this.addExpectation(({ extraArg, isNegated }) => {
        this.getExpectation(extraArg, isNegated).toHaveBeenCalledWith(
          expectedValue,
        )
      })
    }
  }

  const expectThunk = (thunk: any) => new TestRunner(thunk, getStore(), jest.fn())

  test('should be able to add expectation', () => {
    return expectThunk(thunk(1))
      .toCallExtraArgWith(1)
      .run()
  })

  test('should be able to add negated expectation', () => {
    return expectThunk(thunk(1))
      .not.toCallExtraArgWith(2)
      .run()
  })
})
