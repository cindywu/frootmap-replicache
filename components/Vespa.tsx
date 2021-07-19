import React from 'react'
import { ICoords } from '../models/types'

type Props = {
  vespaCoords?: ICoords
}

const Vespa = ({ vespaCoords } : Props) => {
  return (
    <div>
      {  vespaCoords &&
        <div
          lat={vespaCoords.lat}
          lng={vespaCoords.lng}
        >
          <img src="/vespa.svg" />
        </div>
      }
    </div>
  )
}

export default Vespa