import { createStore } from 'redux'

const SET_ID = 'SET_ID'

export const setId = (id: number) => ({ type: SET_ID, payload: id })

const idReducer = (state = 0, action: ReturnType<typeof setId>) => {
  switch (action.type) {
    case SET_ID:
      return action.payload
    default:
      return state
  }
}

export const getStore = () => createStore(idReducer, 0)
