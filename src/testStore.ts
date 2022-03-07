import { combineReducers } from 'redux'
import { configureStore, Store, } from '@reduxjs/toolkit'

const SET_ID = 'SET_ID'

export const setId = (id: number) => ({ type: SET_ID, payload: id })
type Action = ReturnType<typeof setId>

const idReducer = (state = 0, action: Action) => {
  switch (action.type) {
    case SET_ID:
      return action.payload
    default:
      return state
  }
}

export const getStore = (): Store<{ id: number }> => configureStore({
  reducer: combineReducers({ id: idReducer }),
})
