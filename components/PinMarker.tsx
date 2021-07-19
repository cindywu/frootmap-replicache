import React from 'react'
import { IPin } from '../models/types'

type Props = {
  style?: any,
  onClick: () => void,
  lat: number,
  lng: number,
  pin: IPin
}

const PinMarker = ( props: Props ) => {
  const {
    style,
    onClick,
    lat,
    lng,
    pin
  } = props

  const clickHandler = () => {
    onClick()
  }

  const time = new Date(pin.created_at)

  return (
    <div
      style={style}
      className="pin-marker"
      onClick={clickHandler}
    >
      <div className="arrow"></div>
      <h2>{pin.text}</h2>
      <h4 className="muted">{pin.id}</h4>
      <h4 className="muted">{time.toLocaleTimeString()} {time.toLocaleDateString()}</h4>
      <h4 className="muted">lat: {Math.trunc(lat)}</h4>
      <h4 className="muted">lng: {Math.trunc(lng)}</h4>
    </div>
  )
}

export default PinMarker