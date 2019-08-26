# redux-thunk-testing-library
Tools to test redux-thunk actions

# Installation
`yarn add -D @churchcommunitybuilder/redux-thunk-testing-library`

## Usage
Without needing to extend the test runner class, you can use the exported `expectThunk` function

```
test('test', () => {
  return expectThunk(thunk())
    .toReturn(someValue)
    .run()
})
```

Note that `.run()` returns a promise, so you'll need to await it or return it

### Mocks

#### withDispatch
Allows you to mock the dispatch function directly or provide mock return values

```
.withDispatch({
  args: [1],
  return true,
})

.withDispatch([
  {
    args: [1],
    return true,
  },
  {
    args: [2],
    return false,
  }
])

.withDispatch(dispatch => {
  dispatch.mockResolvedValue(true)
})
```

#### withActions
Allows you to provide actions that will be dispatched to the store, in order to mock state

```
.withActions(actionOne(), actionTwo())
```

### Matchers

#### toDispatch
Asserts that the args were dispatched

```
.toDispatch(actionOne())
```

#### toDispatchActionLike
Asserts that the action creator was dispatched, regardless of the payload

```
.toDispatchActionLike(actionOne)
```

#### toReturn
Asserts that the thunk returned the given value

```
.toReturn(1)
```

#### toMeetExpectation
Asserts any custom expecation, and is called with the test runner context

```
.toMeetExpectation(({
  dispatch,
  getState,
  extraArg,
  output,
}) => {
  expect(getState()).toBe({})
})
```

### Extending the ThunkTestRunner class
If you need more functionality than the base class grants, i.e. mocking/matchers around your thunk extra arg,
you can extend the class and add public methods for your own use.

```
  class TestRunner extends ThunkTestRunner<ExtraArg> {
    toCallExtraArgWith(expectedValue: any) {
      return this.addExpectation(({ extraArg }) => {
        this.getExpectation(extraArg).toHaveBeenCalledWith(expectedValue)
      })
    }
  }

  const expectThunk = createExpectThunk(TestRunner, getStore, extraArg)
```
