import { mockReturnValue } from '../mockReturnValue'

const argsOne = [{ id: 1 }, 2]
const argsTwo = [[1], 2]

describe('#mockReturnValue', () => {
  describe('when an array of return values are provided', () => {
    test('should mock all the return values', () => {
      const mock = mockReturnValue(jest.fn(), [
        {
          args: argsOne,
          return: true,
        },
        {
          args: argsTwo,
          return: false,
        },
      ])

      expect(mock(...argsOne)).toBe(true)
      expect(mock(...argsTwo)).toBe(false)
      expect(mock(1, 3)).toBeUndefined()
    })
  })

  describe('when an object is provided', () => {
    test('should mock the single return value', () => {
      const mock = mockReturnValue(jest.fn(), {
        args: argsOne,
        return: true,
      })

      expect(mock(...argsOne)).toBe(true)
      expect(mock(argsOne[0])).toBeUndefined
      expect(mock(2, 3)).toBeUndefined()
    })
  })

  describe('when the mock should be partial', () => {
    test('should mock return value for the provided args', () => {
      const mock = mockReturnValue(jest.fn(), {
        args: [argsOne[0]],
        partial: true,
        return: true,
      })

      expect(mock(...argsOne)).toBe(true)
      expect(mock()).toBeUndefined()
    })
  })
})
