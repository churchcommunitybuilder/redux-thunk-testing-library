import expectThunk from '../expectThunk'
import { getStore, setId } from '../testStore'

const dispatchThunk = dispatch => dispatch(1, 2)
const getStateThunk = (_, getState) => getState()
const returnThunk = () => 2
const extraArg = jest.fn(() => 3)

describe('#expectThunk', () => {
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
  })

  describe('#withActions', () => {
    test('should dispatch actions to mock state', () =>
      expectThunk(getStateThunk, { store: getStore() })
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
        const { extraArg: returnedExtraArg } = await expectThunk(returnThunk, {
          extraArg,
        }).run()

        expect(returnedExtraArg).toBe(extraArg)
      })

      test('should have the arg available within the thunk', () =>
        expectThunk((_, __, extraArg) => extraArg(), { extraArg })
          .toReturn(3)
          .run())
    })
  })
})
