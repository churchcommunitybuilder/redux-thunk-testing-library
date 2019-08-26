import { createExpectThunk } from '../createExpectThunk'
import { getStore, setId, TestState } from '../testStore'
import { ThunkTestRunner } from '../ThunkTestRunner'

const actionCreator = (value: any) => ({ type: 'type', payload: value })
const dispatchActionThunk = (value: any) => dispatch =>
  dispatch(actionCreator(value))
const dispatchThunk = dispatch => dispatch(1, 2)
const getStateThunk = (_, getState) => getState()
const returnThunk = () => 2

describe('#expectThunk', () => {
  const extraArg = jest.fn(() => 3)
  const expectThunk = createExpectThunk(
    ThunkTestRunner,
    getStore,
    () => extraArg,
  )

  describe('#withDispatch', () => {
    test('should mock dispatch implementation', async () => {
      await expectThunk(dispatchThunk)
        .withDispatch(dispatch =>
          dispatch.mockImplementation((x: number, y: number) => x + y),
        )
        .toDispatch(1, 2)
        .toReturn(3)
        .run()
    })

    test('should mock return values', async () => {
      await expectThunk(dispatchThunk)
        .withDispatch({
          args: [1, 2],
          return: 3,
        })
        .toDispatch(1, 2)
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
      expectThunk(dispatchThunk)
        .not.toDispatch(2, 2)
        .toDispatch(1, 2)
        .run())
  })

  describe('#toDispatchActionType', () => {
    test('should assert that the action type was dispatched', () => {
      return expectThunk(dispatchActionThunk(1))
        .toDispatch(actionCreator(1))
        .toDispatchActionType(actionCreator)
        .run()
    })

    test('should allow negation', () => {
      return expectThunk(dispatchThunk)
        .not.toDispatchActionType(actionCreator)
        .run()
    })
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
        dispatch()
        dispatch()
        dispatch()
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
  const thunk = (x: any) => (_, __, arg) => {
    arg(x)
  }

  class TestRunner extends ThunkTestRunner<jest.Mock> {
    toCallExtraArgWith(expectedValue: any) {
      return this.addExpectation(({ extraArg }) => {
        this.getExpectation(extraArg).toHaveBeenCalledWith(expectedValue)
      })
    }
  }

  const expectThunk = createExpectThunk(TestRunner, getStore, () => jest.fn())

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
