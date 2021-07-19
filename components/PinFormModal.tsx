import React, { useState } from 'react'
import { connect } from 'react-redux'

import Modal from 'react-modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { useDispatch } from 'react-redux'
import { useSwipeable } from 'react-swipeable'

import { ICoords } from '../models/types'
import { createPin } from "../features/pinSlice"
import { setMap } from "../features/mapSlice"

import { useSubscribe } from 'replicache-react-util'
import { Replicache, MutatorDefs } from 'replicache'

Modal.setAppElement("#root")

type Props = {
  isShown: boolean,
  modalPinCoords: ICoords,
  togglePinFormModal: () => void,
  setSelectedViewCoords: (coords: ICoords) => void,
  clearPins: () => void,
  rep: Replicache<MutatorDefs>
}

const PinFormModal = (props : Props) => {
  const {
    isShown,
    modalPinCoords,
    togglePinFormModal,
    setSelectedViewCoords,
    clearPins,
    rep
  } = props

  const [fruit, setFruit] = useState<string>('')
  const [titleInput, setTitleInput] = useState<string>('')
  const [error, setError] = useState<string>('')

  const dispatch = useDispatch()

  const handlers = useSwipeable({
    onSwiped: (eventData) => {
      handleClose()
    },
    trackMouse: true,
    preventDefaultTouchmoveEvent: true
  })

  const FRUITS = [
    "🥭",
    "🍍",
    "🍋",
    "Lime",
    "🍊",
    "🥥",
    "Pomegranate",
    "Pomelo",
    "🍆",
  ]

  const handleClearPins = () : void => {
    clearPins()
  }

  function renderFruits() {
    return FRUITS.map((f, i) => {
      return renderButton(f, i);
    });
  }

  function renderButton(f: string, i: number) {
    const classes =
      fruit === f ? "btn btn-dark m-2" : "btn btn-outline-dark m-2"

    return (
      <button className={classes} onClick={() => setFruit(f)} key={i}>
        {f}
      </button>
    )
  }

  const pins = useSubscribe(
    rep,
    async tx => {
      const list = await tx.scan({prefix: 'pin/'}).entries().toArray()
      return list
    },
    [],
  )

  function handleClose() {
    setFruit('')
    setError('')
    setTitleInput('')
    togglePinFormModal()
    setSelectedViewCoords({lat: 0, lng: 0})
  }

  function repCreatePin(payload: any) {
    const maxOrder = pins.length === 0 ? 0 : pins.map((p: any) => p[1].order).reduce((a: number, b: number) => a > b ? a : b)
    const order = maxOrder + 1

    let id = Math.random().toString(32).substr(2)

    let {lat, lng} = modalPinCoords
    let value = fruit || titleInput || null

    const time = new Date().toISOString()

    const newpayload = {
      id: id,
      sender: "Cindy",
      description: "A fruit",
      ord: order,
      text: value,
      lat: lat,
      lng: lng,
      created_at: time,
      updated_at: time,
    }

    console.log("[pinformmodal] payload", newpayload)

    rep.mutate.createPin({...newpayload})
  }

  function handleClick() {
    let value = fruit || titleInput || null
    if (value) {
      const payload = {
        pinCoords: modalPinCoords,
        text: value
      }
      repCreatePin(payload)
      handleClose()
    } else {
      setError("Please select a fruit!");
    }
  }

  function handleInputChange(event: any) {
    setTitleInput(event.target.value)
    setFruit("")
  }

  return (
    <div>
      <Modal
        isOpen={isShown}
        className="modal modal.shown animate__animated animate__slideInUp animate__faster"
        contentLabel="Create a pin modal"
        onRequestClose={() => handleClose()}
        shouldCloseOnOverlayClick={true}
      >
        <div {...handlers} className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Choose a fruit:</h5>
              <FontAwesomeIcon
                icon={faTimesCircle}
                onClick={() => handleClose()}
                aria-label="Close"
                className="close"
              />
            </div>

            <div className="modal-body">
              {error && <p className="alert alert-danger">{error}</p>}

              <div className="input-group input-group-lg mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text" id="inputGroup-sizing-lg">
                    What kind of fruit?
                  </span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  aria-label="Fruit Name"
                  placeholder="Add a fruit..."
                  value={titleInput}
                  onChange={handleInputChange}
                />
              </div>

              {renderFruits()}

            </div>

            <div className="modal-footer">
              <button
                className="btn btn-danger ml-3"
                onClick={handleClearPins}
              >
                Clear pins
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleClose()}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleClick()}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>

        <p className="muted mt-5 position-absolute text-center w-100">
          Coordinates:
          <span className="mr-3">Lat: {modalPinCoords.lat}</span>
          <span>Lng: {modalPinCoords.lng}</span>
        </p>

      </Modal>
    </div>
  )
}

export default PinFormModal
